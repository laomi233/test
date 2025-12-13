import React, { useState, useCallback } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import { AuthoringUtils } from '@adobe/aem-spa-page-model-manager';
import './CustomTable.css';

const CustomTableEditConfig = {
    emptyLabel: 'Custom Table Component',
    isEmpty: function(props) {
        return !props.tableData;
    }
};

const CustomTable = (props) => {
    // ------------------------------------------------
    // 1. 初始化逻辑
    // ------------------------------------------------
    const createDefaultData = () => [
        ["Header A", "Header B", "Header C"],
        ["Data 1", "Data 2", "Data 3"],
        ["Data 4", "Data 5", "Data 6"]
    ];

    const [tableData, setTableData] = useState(() => {
        if (props.tableData) {
            try { return JSON.parse(props.tableData); } 
            catch (e) { return createDefaultData(); }
        }
        // 如果没有 props (且没有 template)，回退到默认
        return createDefaultData();
    });

    const isInEditor = AuthoringUtils.isInEditor();
    const [isPreview, setIsPreview] = useState(false);

    // ------------------------------------------------
    // 2. 数据操作逻辑 (CRUD)
    // ------------------------------------------------
    
    // 更新单元格
    const updateCell = (r, c, val) => {
        const newData = [...tableData];
        newData[r] = [...newData[r]];
        newData[r][c] = val;
        setTableData(newData);
    };

    // 增加行: 获取当前列数，填充空串
    const addRow = () => {
        const colCount = tableData[0] ? tableData[0].length : 1;
        setTableData([...tableData, Array(colCount).fill("")]);
    };

    // 删除行
    const removeRow = (r) => {
        if (tableData.length <= 1) return alert("Cannot delete the last row.");
        setTableData(tableData.filter((_, i) => i !== r));
    };

    // 增加列: 遍历每一行，push一个空串
    const addCol = () => {
        setTableData(tableData.map(row => [...row, ""]));
    };

    // 删除列: 遍历每一行，filter掉指定index
    const removeCol = (c) => {
        if (tableData[0].length <= 1) return alert("Cannot delete the last column.");
        setTableData(tableData.map(row => row.filter((_, i) => i !== c)));
    };

    // ------------------------------------------------
    // 3. 持久化逻辑 (Save to AEM)
    // ------------------------------------------------
    const saveToAEM = useCallback(async () => {
        if (!props.pagePath || !props.itemPath) return;

        const dataStr = JSON.stringify(tableData);
        // 构造路径: current_page/jcr:content/component_node
        const nodePath = `${props.pagePath}/jcr:content/${props.itemPath}`;
        
        const formData = new FormData();
        formData.append('./tableData', dataStr);

        try {
            const res = await fetch(nodePath, { method: 'POST', body: formData });
            if (res.ok) alert("✅ Table Saved Successfully!");
            else alert("❌ Save Failed.");
        } catch (e) {
            console.error(e);
            alert("❌ Network Error.");
        }
    }, [tableData, props.pagePath, props.itemPath]);

    // ------------------------------------------------
    // 4. 视图渲染 (Render Views)
    // ------------------------------------------------

    // A. 最终展示视图 (Publish View / Preview)
    // 这里渲染纯净的 HTML，没有 inputs
    const renderPublishView = () => (
        <table className="frontend-table">
            <thead>
                {/* 假设第一行是表头 */}
                {tableData.length > 0 && (
                    <tr>
                        {tableData[0].map((cell, i) => <th key={i}>{cell}</th>)}
                    </tr>
                )}
            </thead>
            <tbody>
                {/* 渲染剩余行 */}
                {tableData.slice(1).map((row, r) => (
                    <tr key={r}>
                        {row.map((cell, c) => <td key={`${r}-${c}`}>{cell}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    // B. 编辑器视图 (Editor View)
    // 包含操作按钮和 inputs
    const renderEditorView = () => (
        <div className="custom-table-editor-wrapper">
            <div className="editor-toolbar">
                <button className="btn-editor" onClick={addRow}>+ Row</button>
                <button className="btn-editor" onClick={addCol}>+ Col</button>
                <button className="btn-editor btn-save" onClick={saveToAEM}>💾 Save Changes</button>
                
                <label className="preview-toggle">
                    <input 
                        type="checkbox" 
                        checked={isPreview} 
                        onChange={() => setIsPreview(!isPreview)} 
                    /> View Final Result
                </label>
            </div>

            <table className="editor-table">
                <thead>
                    <tr>
                        {tableData[0].map((_, c) => (
                            <th key={c}>
                                <button className="btn-del-col" onClick={() => removeCol(c)} title="Remove Column">↓ Del</button>
                            </th>
                        ))}
                        <th style={{width:'30px'}}></th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row, r) => (
                        <tr key={r}>
                            {row.map((cell, c) => (
                                <td key={`${r}-${c}`}>
                                    <input 
                                        value={cell} 
                                        onChange={(e) => updateCell(r, c, e.target.value)} 
                                    />
                                </td>
                            ))}
                            <td>
                                <button className="btn-del-row" onClick={() => removeRow(r)} title="Remove Row">×</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // ------------------------------------------------
    // 5. 主渲染入口
    // ------------------------------------------------
    
    // 如果是 Publish 环境，直接展示最终效果
    if (!isInEditor) {
        return <div className="table-component">{renderPublishView()}</div>;
    }

    // 如果是 Author 环境
    return (
        <div>
            {isPreview ? (
                // 预览模式：显示 Publish 视图，但加上点击遮罩方便切回
                <div onClick={() => setIsPreview(false)} title="Click to go back to Edit Mode">
                    {renderPublishView()}
                    <div style={{textAlign:'center', color:'#888', fontSize:'12px', marginTop:'5px'}}>
                        (Preview Mode Active - Click table to edit)
                    </div>
                </div>
            ) : (
                // 编辑模式
                renderEditorView()
            )}
        </div>
    );
};

export default MapTo('my-project/components/custom-table')(CustomTable, CustomTableEditConfig);