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
    // [关键点1] 提取 AEM 传入的 props
    // cqPath: 用于生成 data-cq-data-path
    // className: 用于 AEM Grid 布局
    const { className, cqPath, tableData: propTableData, pagePath, itemPath } = props;

    // --- 数据逻辑 Start ---
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

    const saveToAEM = useCallback(async () => {
        if (!pagePath || !itemPath) return;
        const formData = new FormData();
        formData.append('./tableData', JSON.stringify(tableData));
        try {
            await fetch(`${pagePath}/jcr:content/${itemPath}`, { method: 'POST', body: formData });
            alert("Saved!");
        } catch (e) { console.error(e); }
    }, [tableData, pagePath, itemPath]);
    // --- 数据逻辑 End ---

    // 渲染发布态 (Clean HTML)
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

    // 渲染编辑器 (Complex UI)
    const renderEditorView = () => {
        const hasSel = selectedCell.r !== -1;
        return (
            // [关键点2] 内部编辑器阻断事件冒泡
            // 这使得点击表格内部时，不会触发 AEM 的 Drag 逻辑，从而允许 Input 输入
            <div className="internal-editor" 
                 onMouseDown={e => e.stopPropagation()} 
                 onClick={e => e.stopPropagation()}>
                
                <div className="editor-bar">
                    <button className="btn-save" onClick={saveToAEM}>💾 Save</button>
                    <label><input type="checkbox" checked={isPreview} onChange={() => setIsPreview(!isPreview)}/> Preview</label>
                </div>

                <div className={`tools ${hasSel ? '' : 'disabled'}`}>
                    <span>Row:</span>
                    <button onClick={() => insertRow(selectedCell.r, 'before')}>↑</button>
                    <button onClick={() => insertRow(selectedCell.r, 'after')}>↓</button>
                    <button onClick={() => deleteRow(selectedCell.r)} className="btn-del">×</button>
                    <span style={{marginLeft:8}}>Col:</span>
                    <button onClick={() => insertCol(selectedCell.c, 'before')}>←</button>
                    <button onClick={() => insertCol(selectedCell.c, 'after')}>→</button>
                    <button onClick={() => deleteCol(selectedCell.c)} className="btn-del">×</button>
                </div>

                <div className="grid-scroll">
                    <table className="editor-grid">
                        <tbody>
                            {tableData.map((row, r) => (
                                <tr key={r}>
                                    {row.map((cell, c) => (
                                        <td key={`${r}-${c}`} className={selectedCell.r === r && selectedCell.c === c ? 'sel' : ''}
                                            onClick={() => setSelectedCell({r, c})}>
                                            <input value={cell} onChange={e => updateCell(r, c, e.target.value)} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // [关键点3] 根返回逻辑
    // 如果没有 data-cq-data-path，AEM 编辑器就找不到这个组件，Toolbar 就不会显示
    if (isInEditor) {
        return (
            <div 
                // AEM 必须的类名
                className={`${className || ''} author-container`}
                // AEM 必须的数据路径
                data-cq-data-path={cqPath}
            >
                {/* 提示用户点击边缘来选中组件 */}
                <div className="selection-border-hint"></div>

                {isPreview ? (
                    <div onClick={() => setIsPreview(false)}>{renderPublishView()}</div>
                ) : renderEditorView()}
            </div>
        );
    }

    return <div className={className}>{renderPublishView()}</div>;
};

export default MapTo('my-project/components/custom-table')(CustomTable, CustomTableEditConfig);