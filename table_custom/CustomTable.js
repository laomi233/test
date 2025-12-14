import React, { useState, useCallback } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import { AuthoringUtils } from '@adobe/aem-spa-page-model-manager';
import './CustomTable.css';

const CustomTableEditConfig = {
    emptyLabel: 'HSI Custom Table',
    isEmpty: function(props) {
        return !props.tableData;
    }
};

const CustomTable = (props) => {
    // [CRITICAL FIX] 1. 必须提取 AEM 传入的 className
    // 这个 className 包含了 aem-Grid-column 等类名，没有它，编辑器无法定位组件
    const { className, tableData: propTableData, pagePath, itemPath } = props;

    // 2. 数据初始化
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

    // --- 数据操作逻辑 ---
    
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
            // 注意: 使用 itemPath 直接 POST
            await fetch(`${pagePath}/jcr:content/${itemPath}`, { method: 'POST', body: formData });
            alert("Saved!");
        } catch (e) { console.error(e); alert("Failed"); }
    }, [tableData, pagePath, itemPath]);


    // --- 视图渲染 ---

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
            <div className="editor-wrapper">
                <div className="editor-toolbar">
                    <button className="btn-save" onClick={saveToAEM}>💾 Save</button>
                    <label><input type="checkbox" checked={isPreview} onChange={() => setIsPreview(!isPreview)}/> Preview</label>
                </div>
                
                <div className={`context-tools ${hasSel ? '' : 'disabled'}`}>
                    <span>Row: </span>
                    <button onClick={() => insertRow(selectedCell.r, 'before')}>↑ Add</button>
                    <button onClick={() => insertRow(selectedCell.r, 'after')}>↓ Add</button>
                    <button onClick={() => deleteRow(selectedCell.r)} className="btn-del">×</button>
                    <span style={{marginLeft:10}}>Col: </span>
                    <button onClick={() => insertCol(selectedCell.c, 'before')}>← Add</button>
                    <button onClick={() => insertCol(selectedCell.c, 'after')}>→ Add</button>
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

    // [CRITICAL FIX] 3. 根元素必须应用 props.className
    // 如果没有这一行，Content Tree 找不到它，也无法拖拽
    const containerClass = `${className || ''} custom-table-component`;

    if (!isInEditor) {
        return <div className={containerClass}>{renderPublishView()}</div>;
    }

    return (
        <div className={containerClass}>
            {isPreview ? (
                <div onClick={() => setIsPreview(false)} title="Click to edit">{renderPublishView()}</div>
            ) : renderEditorView()}
        </div>
    );
};

export default MapTo('my-project/components/custom-table')(CustomTable, CustomTableEditConfig);