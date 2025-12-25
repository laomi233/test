import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import debounce from 'lodash/debounce';
import './ManualTable.scss';

// -------------------------------------------------------------------------
// 单元格组件 (支持富文本 + 选中状态)
// -------------------------------------------------------------------------
const EditableCell = ({ html, style, width, onContentChange, onFocus, isSelected }) => {
  const cellRef = useRef(null);

  // 避免光标跳动：只有当 focus 且内容确实不同步时才刷新
  // 简单的 contentEditable 处理方案
  const handleInput = (e) => {
    onContentChange(e.currentTarget.innerHTML);
  };

  return (
    <td
      className={isSelected ? 'selected' : ''}
      style={{ ...style, width: width, minWidth: width }}
      onMouseDown={onFocus} // 点击即选中
    >
      <div
        className="cell-content"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ minHeight: '24px' }}
      />
    </td>
  );
};

// -------------------------------------------------------------------------
// 主表格组件
// -------------------------------------------------------------------------
const ManualTable = (props) => {
  const { cqPath, tableData } = props;

  // 1. 初始化 State (尝试解析 AEM 存的 JSON，失败则用默认)
  const [data, setData] = useState(() => {
    try {
      return tableData ? JSON.parse(tableData) : {
        colWidths: [150, 150, 150],
        rows: [
          { cells: [{ content: 'A1', style: {} }, { content: 'B1', style: {} }, { content: 'C1', style: {} }] },
          { cells: [{ content: 'A2', style: {} }, { content: 'B2', style: {} }, { content: 'C2', style: {} }] }
        ]
      };
    } catch (e) {
      return { colWidths: [100], rows: [{ cells: [{ content: 'Error' }] }] };
    }
  });

  const [selectedCell, setSelectedCell] = useState({ r: -1, c: -1 });
  const [resizing, setResizing] = useState(null); // { index: 0, startX: 100, startWidth: 150 }

  // -----------------------------------------------------------------------
  // 2. 拖拽列宽逻辑
  // -----------------------------------------------------------------------
  const handleResizeStart = (index, e) => {
    e.preventDefault();
    setResizing({
      index,
      startX: e.clientX,
      startWidth: data.colWidths[index]
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!resizing) return;
    const diff = e.clientX - resizing.startX;
    const newWidth = Math.max(50, resizing.startWidth + diff); // 最小宽度 50px

    setData(prev => {
      const newWidths = [...prev.colWidths];
      newWidths[resizing.index] = newWidth;
      return { ...prev, colWidths: newWidths };
    });
  }, [resizing]);

  const handleMouseUp = useCallback(() => {
    setResizing(null);
  }, []);

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, handleMouseMove, handleMouseUp]);

  // -----------------------------------------------------------------------
  // 3. 表格 CRUD 操作
  // -----------------------------------------------------------------------
  const addRow = () => {
    const newRow = {
      cells: data.colWidths.map(() => ({ content: '', style: {} }))
    };
    setData(prev => ({ ...prev, rows: [...prev.rows, newRow] }));
  };

  const deleteRow = () => {
    if (selectedCell.r === -1) return;
    setData(prev => ({
      ...prev,
      rows: prev.rows.filter((_, idx) => idx !== selectedCell.r)
    }));
    setSelectedCell({ r: -1, c: -1 });
  };

  const addCol = () => {
    setData(prev => ({
      colWidths: [...prev.colWidths, 150],
      rows: prev.rows.map(row => ({
        ...row,
        cells: [...row.cells, { content: '', style: {} }]
      }))
    }));
  };

  const deleteCol = () => {
    if (selectedCell.c === -1) return;
    setData(prev => ({
      colWidths: prev.colWidths.filter((_, idx) => idx !== selectedCell.c),
      rows: prev.rows.map(row => ({
        ...row,
        cells: row.cells.filter((_, idx) => idx !== selectedCell.c)
      }))
    }));
    setSelectedCell({ r: -1, c: -1 });
  };

  // -----------------------------------------------------------------------
  // 4. 样式操作 (背景色 & 富文本)
  // -----------------------------------------------------------------------
  const setBgColor = (color) => {
    if (selectedCell.r === -1 || selectedCell.c === -1) return;
    setData(prev => {
      const newRows = [...prev.rows];
      const cell = newRows[selectedCell.r].cells[selectedCell.c];
      cell.style = { ...cell.style, backgroundColor: color };
      return { ...prev, rows: newRows };
    });
  };

  // 执行原生命令 (Bold, Italic) - 作用于当前 focus 的 contentEditable
  const execCmd = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
  };

  const updateCellContent = (rIndex, cIndex, html) => {
    // 这里不直接 setData，否则会触发重渲染导致输入法中断
    // 建议只在 onBlur 或 debounce 时更新 React State
    // 为演示简单，这里直接更新引用，不做深拷贝 State 更新，
    // 实际项目中建议使用 useReducer 或 immer
    data.rows[rIndex].cells[cIndex].content = html; 
    saveToAem(data); // 触发保存
  };

  // -----------------------------------------------------------------------
  // 5. 数据保存 (Debounce)
  // -----------------------------------------------------------------------
  const saveToAem = useCallback(
    debounce((currentData) => {
      if (!cqPath) return;
      const formData = new FormData();
      // 序列化为 JSON 字符串保存
      formData.append('./tableData', JSON.stringify(currentData));
      formData.append('_charset_', 'utf-8');
      
      const csrfToken = document.cookie.match(/cq-csrf-token=([^;]+)/)?.[1] || '';

      fetch(cqPath, {
        method: 'POST',
        body: formData,
        headers: { 'CSRF-Token': csrfToken }
      });
    }, 1000),
    [cqPath]
  );

  // 监听结构变化保存
  useEffect(() => {
    saveToAem(data);
  }, [data.colWidths.length, data.rows.length, saveToAem]); // 简单监听结构变化

  // -----------------------------------------------------------------------
  // 渲染 UI
  // -----------------------------------------------------------------------
  return (
    <div className="manual-table-component">
      {/* 工具栏 */}
      <div className="toolbar">
        <div className="group">
          <button onMouseDown={(e) => {e.preventDefault(); execCmd('bold');}}><b>B</b></button>
          <button onMouseDown={(e) => {e.preventDefault(); execCmd('italic');}}><i>I</i></button>
        </div>
        <div className="group">
          <button onClick={addRow}>+ Row</button>
          <button onClick={deleteRow} disabled={selectedCell.r === -1}>- Row</button>
          <button onClick={addCol}>+ Col</button>
          <button onClick={deleteCol} disabled={selectedCell.c === -1}>- Col</button>
        </div>
        <div className="group">
          <button onClick={() => setBgColor('#ffcccc')} style={{background:'#ffcccc'}}>Red</button>
          <button onClick={() => setBgColor('#ccffcc')} style={{background:'#ccffcc'}}>Green</button>
          <button onClick={() => setBgColor(null)}>Clear</button>
        </div>
      </div>

      {/* 表格主体 */}
      <div className="table-wrapper">
        <table>
          <colgroup>
            {data.colWidths.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <tbody>
            {data.rows.map((row, rIndex) => (
              <tr key={rIndex}>
                {row.cells.map((cell, cIndex) => (
                  <EditableCell
                    key={`${rIndex}-${cIndex}`} // 简单 key，生产环境建议用 unique ID
                    html={cell.content}
                    style={cell.style}
                    width={data.colWidths[cIndex]}
                    isSelected={selectedCell.r === rIndex && selectedCell.c === cIndex}
                    onFocus={() => setSelectedCell({ r: rIndex, c: cIndex })}
                    onContentChange={(html) => updateCellContent(rIndex, cIndex, html)}
                  />
                ))}
              </tr>
            ))}
          </tbody>
          
          {/* 这是一个覆盖层，专门用来显示列宽拖拽手柄 */}
          <div className="resize-overlay">
             {data.colWidths.map((w, i) => {
               // 计算手柄的 left 位置 (累加前面的宽度)
               const left = data.colWidths.slice(0, i + 1).reduce((a, b) => a + b, 0);
               return (
                 <div
                   key={i}
                   className="resizer"
                   style={{ left: left - 2 }} // -2 是为了居中对齐边框
                   onMouseDown={(e) => handleResizeStart(i, e)}
                 />
               );
             })}
          </div>
        </table>
      </div>
    </div>
  );
};

const EditConfig = {
  emptyLabel: 'Manual Table',
  isEmpty: props => !props.tableData
};

MapTo('my-project/components/manualtable')(ManualTable, EditConfig);

export default ManualTable;