import React, { useState, useCallback } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import { AuthoringUtils } from '@adobe/aem-spa-page-model-manager';
import './CustomTable.css';

const CustomTableEditConfig = {
    emptyLabel: 'HSI Custom Table',
    isEmpty: function(props) {
        return !props.tableData || props.tableData.length === 0;
    }
};

const CustomTable = (props) => {
    // [关键点 1] 提取 AEM 传入的关键属性
    // className: 包含 aem-Grid-column 等布局类名
    // cqPath: 组件在 JCR 中的路径
    const { className, tableData: propTableData, pagePath, itemPath } = props;

    // --- 数据初始化与逻辑 (与之前相同) ---
    const createDefaultData = () => [["Date", "Time"], ["Sat, Sun", "00:00 - 06:00"]];
    const [tableData, setTableData] = useState(() => {
        if (propTableData) {
            try { return JSON.parse(propTableData); } catch (e) { return createDefaultData(); }
        }
        return createDefaultData();
    });

    const isInEditor = AuthoringUtils.isInEditor();
    const [isPreview, setIsPreview] = useState(false);
    const [selectedCell, setSelectedCell] = useState({ r: -1, c: -1 });

    const updateCell = (r, c, val) => {
        const newData = [...tableData];
        newData[r] = [...newData[r]];
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
        if (tableData.length <= 1) return alert("Min 1 row required");
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
        if (tableData[0].length <= 1) return alert("Min 1 col required");
        setTableData(tableData.map(row => row.filter((_, i) => i !== cIndex)));
        setSelectedCell({ r: -1, c: -1 });
    };

    const saveToAEM = useCallback(async () => {
        if (!pagePath || !itemPath) return console.error("No path found");
        const formData = new FormData();
        formData.append('./tableData', JSON.stringify(tableData));
        try {
            await fetch(`${pagePath}/jcr:content/${itemPath}`, { method: 'POST', body: formData });
            alert("Saved!");
        } catch (e) { console.error(e); alert("Failed"); }
    }, [tableData, pagePath, itemPath]);

    // --- 渲染逻辑 ---

    const renderPublishView = () => (
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

    const renderEditorView = () => {
        const hasSel = selectedCell.r !== -1;
        return (
            // [关键点 2] 内部容器
            // onMouseDown={(e) => e.stopPropagation()} 
            // 阻止鼠标点击事件冒泡给 AEM。
            // 这样当你点击 input 或 按钮时，AEM 不会认为你想“拖拽”组件，从而允许你输入文字。
            <div className="editor-wrapper" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                
                <div className="editor-header">
                    <span className="editor-title">Editing Table Data</span>
                    <div className="editor-controls">
                        <label><input type="checkbox" checked={isPreview} onChange={() => setIsPreview(!isPreview)}/> Preview</label>
                        <button className="btn-save" onClick={saveToAEM}>💾 Save</button>
                    </div>
                </div>
                
                <div className={`context-tools ${hasSel ? '' : 'disabled'}`}>
                    <span>Row: </span>
                    <button onClick={() => insertRow(selectedCell.r, 'before')}>↑</button>
                    <button onClick={() => insertRow(selectedCell.r, 'after')}>↓</button>
                    <button onClick={() => deleteRow(selectedCell.r)} className="btn-del">×</button>
                    <span style={{marginLeft:10}}>Col: </span>
                    <button onClick={() => insertCol(selectedCell.c, 'before')}>←</button>
                    <button onClick={() => insertCol(selectedCell.c, 'after')}>→</button>
                    <button onClick={() => deleteCol(selectedCell.c)} className="btn-del">×</button>
                </div>

                <div className="table-scroll">
                    <table className="editor-grid">
                        <tbody>
                            {tableData.map((row, r) => (
                                <tr key={r}>
                                    {row.map((cell, c) => (
                                        <td key={`${r}-${c}`} 
                                            className={selectedCell.r === r && selectedCell.c === c ? 'active' : ''}
                                            // 点击选中单元格
                                            onClick={() => setSelectedCell({r, c})}>
                                            <input 
                                                value={cell} 
                                                onChange={e => updateCell(r, c, e.target.value)} 
                                                // 确保输入框获取焦点
                                                onFocus={(e) => e.target.select()}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="editor-footer-hint">
                    * Click outside or on the border to select the component for deletion/moving.
                </div>
            </div>
        );
    };

    // [关键点 3] 主容器逻辑
    // 如果是 Author 模式，必须渲染一个包裹 div，并将 props.className 赋给它。
    // 这让 AEM 知道这个 DOM 元素对应哪个 JCR 节点。
    
    if (!isInEditor) {
        return <div className={className}>{renderPublishView()}</div>;
    }

    return (
        // 外层 DIV：负责与 AEM 交互 (拖拽、蓝框、Toolbar)
        // 这里的 className 是 AEM 传进来的，必须加上！
        <div className={`${className} custom-table-author-container`}>
            
            {/* 只有在非预览模式下才渲染复杂的编辑器 */}
            { !isPreview ? renderEditorView() : (
                <div className="preview-mode-wrapper">
                     {/* 预览模式的切换按钮 */}
                     <div className="preview-toolbar">
                        <label><input type="checkbox" checked={isPreview} onChange={() => setIsPreview(!isPreview)}/> Return to Edit</label>
                     </div>
                     {renderPublishView()}
                </div>
            )}
        </div>
    );
};

export default MapTo('my-project/components/custom-table')(CustomTable, CustomTableEditConfig);