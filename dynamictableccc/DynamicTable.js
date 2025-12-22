// DynamicTable.js
import React, { useState, useEffect } from 'react';
import { MapTo, withModel } from '@adobe/aem-react-editable-components';
import './DynamicTable.css';

const DynamicTableConfig = {
  emptyLabel: 'Dynamic Table',
  isEmpty: function(props) {
    return !props || !props.rows || props.rows.length === 0;
  },
  resourceType: 'myproject/components/dynamictable'
};

const DynamicTable = (props) => {
  const { rows: initialRows = [[{ content: '' }]], isInEditor } = props;
  const [rows, setRows] = useState(initialRows);

  useEffect(() => {
    if (initialRows && initialRows.length > 0) {
      setRows(initialRows);
    }
  }, [initialRows]);

  // 添加行
  const addRow = () => {
    const newRow = Array(rows[0]?.length || 1).fill(null).map(() => ({ content: '' }));
    setRows([...rows, newRow]);
  };

  // 删除行
  const deleteRow = (rowIndex) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== rowIndex));
    }
  };

  // 添加列
  const addColumn = () => {
    setRows(rows.map(row => [...row, { content: '' }]));
  };

  // 删除列
  const deleteColumn = (colIndex) => {
    if (rows[0]?.length > 1) {
      setRows(rows.map(row => row.filter((_, i) => i !== colIndex)));
    }
  };

  // 更新单元格内容
  const updateCell = (rowIndex, colIndex, content) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = { content };
    setRows(newRows);
  };

  // 富文本编辑器配置
  const renderEditableCell = (cell, rowIndex, colIndex) => {
    return (
      <td key={`${rowIndex}-${colIndex}`} className="editable-cell">
        <div
          contentEditable={isInEditor}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: cell.content || '' }}
          onBlur={(e) => {
            if (isInEditor) {
              updateCell(rowIndex, colIndex, e.target.innerHTML);
            }
          }}
          className={`cell-content ${isInEditor ? 'editing' : ''}`}
        />
      </td>
    );
  };

  // 渲染只读单元格(预览模式)
  const renderReadOnlyCell = (cell, rowIndex, colIndex) => {
    return (
      <td key={`${rowIndex}-${colIndex}`} className="readonly-cell">
        <div
          dangerouslySetInnerHTML={{ __html: cell.content || '' }}
          className="cell-content"
        />
      </td>
    );
  };

  return (
    <div className="dynamic-table-wrapper">
      <div className="table-container">
        <table className="dynamic-table">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => 
                  isInEditor 
                    ? renderEditableCell(cell, rowIndex, colIndex)
                    : renderReadOnlyCell(cell, rowIndex, colIndex)
                )}
                {!isInEditor && (
                  <td className="action-cell">
                    <button 
                      onClick={() => deleteRow(rowIndex)}
                      className="btn-delete"
                      title="删除行"
                    >
                      ✕
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!isInEditor && (
              <tr className="column-actions">
                {rows[0]?.map((_, colIndex) => (
                  <td key={colIndex}>
                    <button
                      onClick={() => deleteColumn(colIndex)}
                      className="btn-delete-col"
                      title="删除列"
                    >
                      ✕
                    </button>
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isInEditor && (
        <div className="table-controls">
          <button onClick={addRow} className="btn-add">
            + 添加行
          </button>
          <button onClick={addColumn} className="btn-add">
            + 添加列
          </button>
        </div>
      )}

      {isInEditor && (
        <div className="editor-hint">
          <p>编辑模式：点击单元格进行富文本编辑</p>
        </div>
      )}
    </div>
  );
};

export default MapTo(DynamicTableConfig.resourceType)(
  withModel(DynamicTable)
);

// DynamicTable.css
/* 
.dynamic-table-wrapper {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.dynamic-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.dynamic-table td {
  border: 1px solid #ddd;
  padding: 12px;
  min-width: 150px;
  position: relative;
}

.editable-cell {
  background-color: #f9f9f9;
}

.editable-cell:hover {
  background-color: #f0f0f0;
}

.cell-content {
  min-height: 20px;
  outline: none;
}

.cell-content.editing {
  cursor: text;
  padding: 4px;
  border-radius: 3px;
}

.cell-content.editing:focus {
  background-color: white;
  box-shadow: 0 0 0 2px #0066cc;
}

.action-cell {
  width: 50px;
  text-align: center;
  background-color: #fafafa;
  border-left: 2px solid #ddd;
}

.column-actions td {
  padding: 8px;
  text-align: center;
  background-color: #fafafa;
  border-top: 2px solid #ddd;
}

.btn-delete,
.btn-delete-col {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-delete:hover,
.btn-delete-col:hover {
  background-color: #c82333;
}

.table-controls {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-add {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-add:hover {
  background-color: #218838;
}

.editor-hint {
  margin-top: 15px;
  padding: 10px;
  background-color: #e7f3ff;
  border-left: 4px solid #0066cc;
  border-radius: 3px;
}

.editor-hint p {
  margin: 0;
  color: #004085;
  font-size: 14px;
}

.readonly-cell {
  background-color: white;
}
*/