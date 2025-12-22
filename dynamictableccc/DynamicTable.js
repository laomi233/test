import React, { useState, useEffect } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import { ResponsiveGrid } from '@adobe/aem-react-editable-components';
import './SpaDynamicTable.css';

const SpaDynamicTable = (props) => {
    const {
        tableHeaders = [],
        tableCaption,
        rows = [],       // 来自 Sling Model 的初始行数据
        pagePath,
        itemPath,        // 当前组件的 JCR 路径
        isInEditor       // 是否在 AEM 编辑器模式
    } = props;

    // 本地状态，用于实现 UI 的即时响应 (Optimistic Update)
    const [localRows, setLocalRows] = useState(rows);

    // 当 Props 更新时（例如 Dialog 修改后），同步本地状态
    useEffect(() => {
        setLocalRows(rows);
    }, [rows]);

    /**
     * 添加新行
     * 逻辑：通过 POST 请求在 JCR 中创建实际节点
     */
    const handleAddRow = async () => {
        // 计算下一行的索引
        const nextRowIndex = localRows.length;
        // 假设每次添加行，默认生成的列数与表头数量一致，如果没表头默认 2 列
        const colCount = tableHeaders.length > 0 ? tableHeaders.length : 2;
        
        const formData = new FormData();
        
        // 构建 JCR 节点结构请求
        // 目标结构: .../rows/item{N}/cols/item{M}
        for (let i = 0; i < colCount; i++) {
            // 关键点：指定 resourceType 为容器组件 (wcm/foundation/components/responsivegrid)
            // 这样 AEM 才知道这个节点是可以放东西的容器
            const relativePath = `rows/item${nextRowIndex}/cols/item${i}`;
            formData.append(`${relativePath}/sling:resourceType`, 'wcm/foundation/components/responsivegrid');
            formData.append(`${relativePath}/jcr:title`, `Cell ${i}`); // 可选
        }

        try {
            // 发送请求到当前组件路径
            await fetch(`${itemPath}.html`, {
                method: 'POST',
                body: formData
            });

            // 更新本地状态，以便 React 立即渲染出新的格子
            // 模拟后端返回的数据结构
            const newRowMock = {
                cols: Array.from({ length: colCount }).map((_, idx) => ({ name: `item${idx}` }))
            };
            setLocalRows([...localRows, newRowMock]);

        } catch (error) {
            console.error("Error creating row nodes:", error);
        }
    };

    // 空状态处理
    if (isInEditor && localRows.length === 0 && tableHeaders.length === 0) {
        return (
            <div className="spa-table-placeholder">
                <p>Dynamic Table: Please configure headers in dialog or add a row.</p>
                <button onClick={handleAddRow}>Initialize Table</button>
            </div>
        );
    }

    return (
        <div className="spa-dynamic-table-wrapper">
            {isInEditor && (
                <div className="spa-table-toolbar">
                    <button className="btn-add-row" onClick={handleAddRow}>+ Add Row</button>
                </div>
            )}

            <table className="spa-dynamic-table">
                {tableCaption && <caption>{tableCaption}</caption>}
                
                {/* 渲染表头 */}
                {tableHeaders.length > 0 && (
                    <thead>
                        <tr>
                            {tableHeaders.map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                )}

                {/* 渲染数据行 */}
                <tbody>
                    {localRows.map((row, rowIndex) => {
                        // 处理后端数据可能为 Map 或 Array 的情况
                        // 假设后端结构是 row -> cols (ChildResource)
                        // 这里我们需要获取 cols 下的子节点列表
                        const rawCols = row.cols || row; 
                        const colsArray = Array.isArray(rawCols) 
                            ? rawCols 
                            : Object.values(rawCols || {});

                        return (
                            <tr key={rowIndex}>
                                {colsArray.map((col, colIndex) => {
                                    // [核心] 构建单元格的绝对路径
                                    // 必须与 handleAddRow 中创建的路径一致
                                    const cellPath = `${itemPath}/rows/item${rowIndex}/cols/item${colIndex}`;

                                    return (
                                        <td key={colIndex} className="spa-table-cell">
                                            {/* 每个 TD 内部是一个 ResponsiveGrid
                                                这使得该单元格成为一个 DropZone
                                            */}
                                            <ResponsiveGrid
                                                pagePath={pagePath}
                                                itemPath={cellPath}
                                                // 禁用默认的 Grid 类，防止破坏 TD 布局
                                                gridClass="spa-cell-grid"
                                                columnClass="spa-cell-col"
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default MapTo('my-project/components/spa-dynamic-table')(SpaDynamicTable);