import React, { useState, useCallback } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import { AuthoringUtils } from '@adobe/aem-spa-page-model-manager';
import PureTable from './PureTable'; // 引入上面的纯组件
import './CustomTable.css';

// 1. AEM 编辑配置
const CustomTableEditConfig = {
    emptyLabel: 'HSI Custom Table (Container)',
    isEmpty: function(props) {
        return !props.tableData || props.tableData.length === 0;
    }
};

const CustomTable = (props) => {
    // 2. 解构 AEM 属性
    // [重要] 这里是 Wrapper 的属性，也就是 AEM 容器的属性
    const { className, cqPath, tableData: propTableData, pagePath, itemPath } = props;

    // 数据解析
    const createDefaultData = () => [["Date", "Time"], ["Sat, Sun", "00:00 - 06:00"]];
    const initialData = propTableData ? JSON.parse(propTableData) : createDefaultData();

    const isInEditor = AuthoringUtils.isInEditor();
    const [isEditing, setIsEditing] = useState(false);

    // 保存逻辑：由 Wrapper 负责与 AEM 后端通信
    const handleSaveToAEM = useCallback(async (newData) => {
        if (!pagePath || !itemPath) return;
        const formData = new FormData();
        formData.append('./tableData', JSON.stringify(newData));
        try {
            await fetch(`${pagePath}/jcr:content/${itemPath}`, { method: 'POST', body: formData });
            setIsEditing(false); // 保存成功后退出编辑模式
        } catch (e) { console.error("Save failed", e); }
    }, [pagePath, itemPath]);


    // ============================================================
    // 3. 渲染逻辑：Container 模式
    // ============================================================

    // Publish 模式：直接渲染内容，去掉外壳
    if (!isInEditor) {
        return (
            <div className={className}>
                <PureTable initialData={initialData} isEditing={false} />
            </div>
        );
    }

    // Author 模式：渲染一个“容器” DIV
    return (
        <div 
            // [核心 A] 必须透传 className (aem-Grid-column...)
            className={`${className || ''} aem-table-container-wrapper`}
            
            // [核心 B] 必须绑定 data-cq-data-path
            data-cq-data-path={cqPath}
            
            // [核心 C] 样式：必须给一点 padding，让用户能点到“容器”本身
            // 只有点到这个 div（蓝框区域），AEM Toolbar 才会出来
            style={{ 
                position: 'relative', 
                minHeight: '100px', 
                border: '1px solid transparent', // 占位边框
                padding: '5px' 
            }}
        >
            {/* 视觉提示：告诉用户这是一个 AEM 组件区域 */}
            <div className="aem-wrapper-label">AEM Table Container</div>

            {/* 内层组件：完全不知道 AEM 的存在 */}
            <PureTable 
                initialData={initialData} 
                onSave={handleSaveToAEM}
                isEditing={isEditing} 
                setEditingMode={setIsEditing}
            />

            {/* 进入编辑模式的按钮 (悬浮在容器右上角) */}
            {!isEditing && (
                <button 
                    className="btn-trigger-edit"
                    onClick={(e) => {
                        e.stopPropagation(); // 阻止冒泡，不让 AEM 选中
                        setIsEditing(true);
                    }}
                >
                    Edit Content
                </button>
            )}
        </div>
    );
};

export default MapTo('my-project/components/custom-table')(CustomTable, CustomTableEditConfig);