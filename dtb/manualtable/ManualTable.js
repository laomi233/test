import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import debounce from 'lodash/debounce';
import './ManualTable.scss';
const applyStyleToSelection = (className) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
  
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
  
    // 如果没有选中文本，不操作
    if (!selectedText) return;
  
    // 创建一个 span 标签
    const span = document.createElement('span');
    span.className = className;
    
    // 简单的处理逻辑：包裹内容
    // 注意：contentEditable 中如果跨越了标签（例如选了一半 bold 一半 normal），surroundContents 会报错
    // 生产环境通常需要复杂的 DOM 遍历，这里用 try-catch 做基础保护
    try {
      range.surroundContents(span);
    } catch (e) {
      console.warn("无法应用样式：选区可能跨越了多个节点。请尝试只选中纯文本。", e);
      // 降级方案：document.execCommand 不支持 class，所以这里只能提示用户
      alert("请选中一段连续的文本来应用样式");
    }
    
    // 清除选择，避免视觉干扰
    selection.removeAllRanges();
  };
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
// -----------------------------------------------------------------------
  // 处理样式下拉框变化
  // -----------------------------------------------------------------------
  const handleStyleChange = (e) => {
    const className = e.target.value;
    if (!className) return;
    
    // 应用样式
    applyStyleToSelection(className);
    
    // 重要：样式改变本质上修改了 DOM (innerHTML)，
    // 我们需要手动触发一次 cell 的更新逻辑，把新的 HTML 同步回 React State
    // 在这里我们假设 onInput 会捕获到变化，或者你可以手动触发一次 update
    // 由于 contentEditable 的特性，只要 DOM 变了，下次 focus/input 就会同步
    
    // 重置 select
    e.target.value = "";
  };
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
           <span style={{fontSize: '12px', marginRight: '5px'}}>Style:</span>
           <select onChange={handleStyleChange} disabled={allowedStyles.length === 0}>
             <option value="">-- Select Style --</option>
             {allowedStyles.map((style, index) => (
               <option key={index} value={style.value}>
                 {style.label}
               </option>
             ))}
           </select>
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