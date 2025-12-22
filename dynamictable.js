import React from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
// 引入 AEM 核心组件库的 Text，或者你自己封装的 Text
import { Text } from "@adobe/aem-core-components-react-spa"; 

// 定义你的表格组件
const DynamicTable = (props) => {
    const tableData = props.tableData || [];
    
    // AEM 编辑器检查：如果是在编辑模式且没数据，显示占位符
    const isEmpty = tableData.length === 0;
    
    // 获取 isInEditor 状态 (通常通过 props 或 context 获取)
    // 简单判断：如果 props.isInEditor 存在
    if (isEmpty && props.isInEditor) {
         return <div className="empty-table-placeholder">Empty Table: Click to configure</div>;
    }
    const { 
        pagePath,  // 当前页面路径
        itemPath   // 当前组件路径
    } = props;

    // 添加行/列的逻辑 (保留你原本的 React 逻辑)
    const handleAddRow = () => { ... };
    const handleRemoveRow = () => { ... };

    return (
        <div className="my-dynamic-table">
             {/* 你的工具栏：增加/删除行列 */}
             <div className="toolbar">
                <button onClick={handleAddRow}>Add Row</button>
             </div>

             <table>
                <tbody>
                    {tableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.cols.map((col, colIndex) => {
                                // 关键点：构建唯一的路径
                                // 如果单元格是真实子节点：path = `${itemPath}/row_${rowIndex}_col_${colIndex}`
                                // 如果是基于属性：你需要确保 Text 组件支持 property 属性映射
                                const cellPath = `${itemPath}/rows/item_${rowIndex}/cols/item_${colIndex}`;
                                
                                return (
                                    <td key={colIndex}>
                                        {/* 这里不再是普通的 text，而是 AEM Text 组件 */}
                                        <Text
                                            // 必须：告诉编辑器这是哪个资源
                                            itemPath={cellPath} 
                                            
                                            // 必须：开启富文本
                                            richText={true}
                                            
                                            // 可选：传递初始值用于显示
                                            text={col.text || "Edit me"}
                                            
                                            // 重要：确保这个组件在 React 中被正确映射到 resourceType
                                            // 如果是 OOTB Text，通常是 "weretail/components/content/text" 之类
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    );
};

export default MapTo('my-project/components/dynamic-table')(DynamicTable);