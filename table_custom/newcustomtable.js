import React, { useState, useCallback, useEffect } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import { AuthoringUtils } from '@adobe/aem-spa-page-model-manager';
import './CustomTable.css';

// EditConfig: 告诉 AEM 何时显示 "Drag components here"
const CustomTableEditConfig = {
    emptyLabel: 'HSI Custom Table',
    
    // 关键：如果 isEmpty 返回 true，AEM 会显示占位符；
    // 如果返回 false，AEM 认为组件已渲染，会尝试给它加 Overlay。
    isEmpty: function(props) {
        return !props.tableData || props.tableData.length === 0;
    }
};

const CustomTable = (props) => {
    // 1. 解构属性
    const { className, cqPath, tableData: propTableData, pagePath, itemPath } = props;

    // --- 数据状态管理 ---
    const createDefaultData = () => [["Date", "Time"], ["Sat, Sun", "00:00 - 06:00"]];
    const [tableData, setTableData] = useState(() => {
        if (propTableData) {
            try { return JSON.parse(propTableData); } catch (e) { return createDefaultData(); }
        }
        return createDefaultData();
    });

    const isInEditor = AuthoringUtils.isInEditor();
    
    // [新状态] isEditing: 控制是否进入 "原地编辑模式"
    // false = 交给 AEM 管理 (显示 Toolbar)
    // true  = 交给 React 管理 (输入数据)
    const [isEditing, setIsEditing] = useState(false);
    
    const [selectedCell, setSelectedCell] = useState({ r: -1, c: -1 });

    // --- 数据操作函数 (保持不变) ---
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

    const saveToAEM = useCallback(async () => {
        if (!pagePath || !itemPath) return;
        const formData = new FormData();
        formData.append('./tableData', JSON.stringify(tableData));
        try {
            await fetch(`${pagePath}/jcr:content/${itemPath}`, { method: 'POST', body: formData });
            // 保存成功后，退出编辑模式，把控制权还给 AEM
            setIsEditing(false); 
        } catch (e) { console.error(e); }
    }, [tableData, pagePath, itemPath]);

    // --- 视图渲染 ---

    // 纯展示视图 (对应 AEM 的 View Mode)
    const renderStaticView = () => (
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

    // 编辑器视图 (对应 React 的 Edit Mode)
    const renderInteractiveEditor = () => {
        const hasSel = selectedCell.r !== -1;
        return (
            // 这里我们需要 stopPropagation，防止点击输入框时 AEM 以为我们要拖拽
            <div className="interactive-editor-layer" 
                 onMouseDown={e => e.stopPropagation()} 
                 onClick={e => e.stopPropagation()}>
                
                <div className="editor-toolbar-top">
                    <span className="editor-label">✏️ Editing Mode</span>
                    <div className="editor-actions">
                        <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                        <button className="btn-save" onClick={saveToAEM}>💾 Save & Exit</button>
                    </div>
                </div>

                <div className={`row-col-tools ${hasSel ? '' : 'disabled'}`}>
                   {/* 工具按钮 (与之前一致) */}
                    <span>Row:</span>
                    <button onClick={() => insertRow(selectedCell.r, 'before')}>↑</button>
                    <button onClick={() => insertRow(selectedCell.r, 'after')}>↓</button>
                    <button onClick={() => deleteRow(selectedCell.r)} className="btn-del">×</button>
                    <span style={{marginLeft:10}}>Col:</span>
                    <button onClick={() => insertCol(selectedCell.c, 'before')}>←</button>
                    <button onClick={() => insertCol(selectedCell.c, 'after')}>→</button>
                    <button onClick={() => deleteCol(selectedCell.c)} className="btn-del">×</button>
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

    // ============================================================
    // [CRITICAL FIX] 渲染入口逻辑
    // ============================================================

    // 1. Publish Mode: 直接渲染静态表格
    if (!isInEditor) {
        return <div className={className}>{renderStaticView()}</div>;
    }

    // 2. Author Mode: 
    return (
        <div 
            className={`${className || ''} author-wrapper`} 
            data-cq-data-path={cqPath} // 必须有这个，AEM 才能识别这是 Editable Component
            style={{ position: 'relative', minHeight: '50px' }}
        >
            {/* 状态 A: isEditing === false (默认)
               渲染静态表格。不使用 stopPropagation。
               结果：AEM Overlay 覆盖在上面。
               点击 -> AEM 选中组件 -> 显示 AEM Toolbar (扳手/删除)。
            */}
            { !isEditing && (
                <div className="view-mode-container">
                    {renderStaticView()}
                    
                    {/* 一个穿透 AEM Overlay 的按钮，用于进入“编辑模式” */}
                    <button 
                        className="btn-enter-edit" 
                        onClick={(e) => {
                            // 阻止冒泡，避免触发 AEM 选中（虽然选中也没事）
                            e.stopPropagation(); 
                            setIsEditing(true);
                        }}
                        title="Edit Table Content"
                    >
                        Edit Content
                    </button>
                </div>
            )}

            {/* 状态 B: isEditing === true
               渲染交互编辑器。z-index 很高，覆盖 AEM Overlay。
               结果：用户可以输入数据。AEM Toolbar 暂时被遮挡。
               保存/取消后 -> 回到状态 A。
            */}
            { isEditing && renderInteractiveEditor() }
            
        </div>
    );
};

export default MapTo('my-project/components/custom-table')(CustomTable, CustomTableEditConfig);