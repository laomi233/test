import React, { useState, useCallback } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import { AuthoringUtils } from '@adobe/aem-spa-page-model-manager';
import './CustomTable.css';

const CustomTableEditConfig = {
    emptyLabel: 'Custom HSI Style Table',
    isEmpty: function(props) {
        return !props.tableData;
    }
};

const CustomTable = (props) => {
    // ------------------------------------------------
    // 1. 初始化与状态
    // ------------------------------------------------
    const createDefaultData = () => [
        ["Date", "Time"],
        ["Saturday, Sunday", "00:00 to 06:00 (HKT)"]
    ];

    const [tableData, setTableData] = useState(() => {
        if (props.tableData) {
            try { return JSON.parse(props.tableData); } 
            catch (e) { return createDefaultData(); }
        }
        return createDefaultData();
    });

    const isInEditor = AuthoringUtils.isInEditor();
    const [isPreview, setIsPreview] = useState(false);
    
    // 新增：记录当前选中的单元格 { r: rowIndex, c: colIndex }，初始为 -1 表示未选中
    const [selectedCell, setSelectedCell] = useState({ r: -1, c: -1 });

    // 处理单元格点击，更新选中状态
    const handleCellClick = (r, c) => {
        setSelectedCell({ r, c });
    };
    
    // 清除选中状态
    const clearSelection = () => {
        setSelectedCell({ r: -1, c: -1 });
    };

    // ------------------------------------------------
    // 2. 数据操作逻辑 (基于选中项的 CRUD)
    // ------------------------------------------------
    
    // 更新单元格内容
    const updateCell = (r, c, val) => {
        const newData = [...tableData];
        newData[r] = [...newData[r]];
        newData[r][c] = val;
        setTableData(newData);
    };

    /**
     * 插入行
     * @param {number} rIndex - 参考行的索引
     * @param {string} position - 'before' (上方) 或 'after' (下方)
     */
    const insertRow = (rIndex, position) => {
        if (rIndex === -1) return alert("Please select a cell first.");
        const colCount = tableData[0] ? tableData[0].length : 1;
        const newRow = Array(colCount).fill("");
        const newData = [...tableData];
        // 计算插入位置
        const insertPos = position === 'after' ? rIndex + 1 : rIndex;
        // 使用 splice 在指定位置插入
        newData.splice(insertPos, 0, newRow);
        setTableData(newData);
    };

    /**
     * 删除行
     * @param {number} rIndex - 要删除的行索引
     */
    const deleteRow = (rIndex) => {
        if (rIndex === -1) return alert("Please select a cell first.");
        if (tableData.length <= 1) return alert("Cannot delete the last row.");
        const newData = tableData.filter((_, i) => i !== rIndex);
        setTableData(newData);
        clearSelection(); // 删除后清除选中
    };

    /**
     * 插入列
     * @param {number} cIndex - 参考列的索引
     * @param {string} position - 'before' (左侧) 或 'after' (右侧)
     */
    const insertCol = (cIndex, position) => {
        if (cIndex === -1) return alert("Please select a cell first.");
        const insertPos = position === 'after' ? cIndex + 1 : cIndex;
        // 遍历每一行，在指定位置插入一个空字符串
        const newData = tableData.map(row => {
            const newRow = [...row];
            newRow.splice(insertPos, 0, "");
            return newRow;
        });
        setTableData(newData);
    };

    /**
     * 删除列
     * @param {number} cIndex - 要删除的列索引
     */
    const deleteCol = (cIndex) => {
        if (cIndex === -1) return alert("Please select a cell first.");
        if (tableData[0].length <= 1) return alert("Cannot delete the last column.");
        // 遍历每一行，过滤掉指定索引的元素
        const newData = tableData.map(row => row.filter((_, i) => i !== cIndex));
        setTableData(newData);
        clearSelection(); // 删除后清除选中
    };

    // ------------------------------------------------
    // 3. 持久化逻辑 (Save to AEM)
    // ------------------------------------------------
    const saveToAEM = useCallback(async () => {
        if (!props.pagePath || !props.itemPath) return;
        const dataStr = JSON.stringify(tableData);
        const nodePath = `${props.pagePath}/jcr:content/${props.itemPath}`;
        const formData = new FormData();
        formData.append('./tableData', dataStr);
        try {
            await fetch(nodePath, { method: 'POST', body: formData });
            alert("✅ Table Saved Successfully!");
        } catch (e) {
            console.error(e);
            alert("❌ Save Failed.");
        }
    }, [tableData, props.pagePath, props.itemPath]);

    // ------------------------------------------------
    // 4. 视图渲染 (Render Views)
    // ------------------------------------------------

    // A. 最终展示视图 (Publish View / Preview) - 匹配截图样式
    const renderPublishView = () => (
        <table className="hsi-styled-table">
            {/* 假设第一行总是表头 */}
            <thead>
                {tableData.length > 0 && (
                    <tr>
                        {tableData[0].map((cell, i) => <th key={i}>{cell}</th>)}
                    </tr>
                )}
            </thead>
            <tbody>
                {tableData.slice(1).map((row, r) => (
                    <tr key={r}>
                        {row.map((cell, c) => <td key={`${r}-${c}`}>{cell}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    // B. 编辑器视图 (Editor View) - 包含操作工具栏和网格
    const renderEditorView = () => {
        const hasSelection = selectedCell.r !== -1 && selectedCell.c !== -1;
        
        return (
            <div className="custom-table-editor-wrapper">
                {/* 1. 顶部全局操作栏 */}
                <div className="editor-global-toolbar">
                    <button className="btn-save" onClick={saveToAEM}>💾 Save Changes</button>
                    <label className="preview-toggle">
                        <input 
                            type="checkbox" 
                            checked={isPreview} 
                            onChange={() => setIsPreview(!isPreview)} 
                        /> View Final Result
                    </label>
                </div>
                
                {/* 2. 上下文操作工具栏 (Context Toolbar) - 选中时才可用 */}
                <div className={`editor-context-toolbar ${hasSelection ? 'active' : 'disabled'}`}>
                    <div className="toolbar-group row-ops">
                        <span>Row Operations: </span>
                        <button onClick={() => insertRow(selectedCell.r, 'before')} disabled={!hasSelection}>↑ Insert Above</button>
                        <button onClick={() => insertRow(selectedCell.r, 'after')} disabled={!hasSelection}>↓ Insert Below</button>
                        <button onClick={() => deleteRow(selectedCell.r)} disabled={!hasSelection} className="btn-delete">× Delete Row</button>
                    </div>
                    <div className="toolbar-separator"></div>
                    <div className="toolbar-group col-ops">
                        <span>Column Operations: </span>
                        <button onClick={() => insertCol(selectedCell.c, 'before')} disabled={!hasSelection}>← Insert Left</button>
                        <button onClick={() => insertCol(selectedCell.c, 'after')} disabled={!hasSelection}>→ Insert Right</button>
                        <button onClick={() => deleteCol(selectedCell.c)} disabled={!hasSelection} className="btn-delete">× Delete Col</button>
                    </div>
                </div>

                <div className="editor-table-container">
                    <table className="editor-grid-table">
                        <tbody>
                            {tableData.map((row, r) => (
                                <tr key={r} className={r === selectedCell.r ? 'selected-row' : ''}>
                                    {row.map((cell, c) => {
                                        const isSelected = r === selectedCell.r && c === selectedCell.c;
                                        const isSelectedCol = c === selectedCell.c;
                                        return (
                                            <td 
                                                key={`${r}-${c}`}
                                                // 点击时设置选中状态
                                                onClick={() => handleCellClick(r, c)}
                                                className={`
                                                    ${isSelected ? 'selected-cell' : ''} 
                                                    ${isSelectedCol ? 'selected-col' : ''}
                                                `}
                                            >
                                                <input 
                                                    value={cell} 
                                                    onChange={(e) => updateCell(r, c, e.target.value)} 
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {hasSelection && <div className="selection-hint">Selected: Row {selectedCell.r + 1}, Column {selectedCell.c + 1}</div>}
                </div>
            </div>
        );
    }

    // ------------------------------------------------
    // 5. 主渲染入口
    // ------------------------------------------------
    if (!isInEditor) {
        return renderPublishView();
    }
    
    return isPreview ? (
        <div onClick={() => setIsPreview(false)} title="Click to edit" className="preview-mode-container">
             {renderPublishView()}
        </div>
    ) : renderEditorView();
};

export default MapTo('my-project/components/custom-table')(CustomTable, CustomTableEditConfig);