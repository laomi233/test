import React, { useState, useEffect } from 'react';
import './CustomTable.css'; // 复用之前的样式

const PureTable = ({ initialData, onSave, isEditing, setEditingMode }) => {
    // 数据初始化
    const [tableData, setTableData] = useState(initialData);

    // 监听外部传入的数据变化
    useEffect(() => {
        setTableData(initialData);
    }, [initialData]);

    const [selectedCell, setSelectedCell] = useState({ r: -1, c: -1 });

    // --- 表格 CRUD 逻辑 (保持不变) ---
    const updateCell = (r, c, val) => {
        const newData = [...tableData];
        newData[r][c] = val;
        setTableData(newData);
    };
    const insertRow = (rIndex, pos) => {
        if (rIndex === -1) return;
        const colCount = tableData[0].length;
        const newData = [...tableData];
        newData.splice(pos === 'after' ? rIndex + 1 : rIndex, 0, Array(colCount).fill(""));
        setTableData(newData);
    };
    const deleteRow = (rIndex) => {
        if (tableData.length <= 1) return alert("Min 1 row");
        setTableData(tableData.filter((_, i) => i !== rIndex));
        setSelectedCell({ r: -1, c: -1 });
    };
    const insertCol = (cIndex, pos) => {
        if (cIndex === -1) return;
        const targetPos = pos === 'after' ? cIndex + 1 : cIndex;
        setTableData(tableData.map(row => {
            const newRow = [...row];
            newRow.splice(targetPos, 0, "");
            return newRow;
        }));
    };
    const deleteCol = (cIndex) => {
        if (tableData[0].length <= 1) return alert("Min 1 col");
        setTableData(tableData.map(row => row.filter((_, i) => i !== cIndex)));
        setSelectedCell({ r: -1, c: -1 });
    };

    // 保存处理
    const handleSave = () => {
        onSave(tableData);
    };

    // --- 渲染部分 ---
    
    // 1. 静态展示视图
    const renderStatic = () => (
        <table className="hsi-table">
            <thead>
                {tableData.length > 0 && <tr>{tableData[0].map((c, i) => <th key={i}>{c}</th>)}</tr>}
            </thead>
            <tbody>
                {tableData.slice(1).map((row, r) => (
                    <tr key={r}>{row.map((c, i) => <td key={i}>{c}</td>)}</tr>
                ))}
            </tbody>
        </table>
    );

    // 2. 编辑视图
    if (isEditing) {
        return (
            <div className="pure-table-editor" onMouseDown={e => e.stopPropagation()}>
                <div className="editor-toolbar-top">
                    <button className="btn-cancel" onClick={() => setEditingMode(false)}>Cancel</button>
                    <button className="btn-save" onClick={handleSave}>💾 Save Changes</button>
                </div>
                
                <div className="tools-bar">
                    {/* 你的增删改查按钮 ... */}
                     <span>Row:</span>
                    <button onClick={() => insertRow(selectedCell.r, 'before')}>↑</button>
                    <button onClick={() => insertRow(selectedCell.r, 'after')}>↓</button>
                    <button onClick={() => deleteRow(selectedCell.r)}>Del</button>
                    {/* ... Col buttons ... */}
                </div>

                <div className="editor-grid-wrapper">
                    <table className="editor-grid">
                        <tbody>
                            {tableData.map((row, r) => (
                                <tr key={r}>
                                    {row.map((cell, c) => (
                                        <td key={`${r}-${c}`} 
                                            className={selectedCell.r === r && selectedCell.c === c ? 'sel' : ''}
                                            onClick={() => setSelectedCell({r, c})}>
                                            <input 
                                                value={cell} 
                                                onChange={e => updateCell(r, c, e.target.value)} 
                                                autoFocus={selectedCell.r === r && selectedCell.c === c}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return <div className="pure-table-static">{renderStatic()}</div>;
};

export default PureTable;