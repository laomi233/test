import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MapTo } from '@adobe/aem-react-editable-components';
import { ResponsiveGrid } from '@adobe/aem-react-editable-components';
import { AuthoringUtils } from '@adobe/aem-spa-page-model-manager';
import './ContactModal.css';

const ContactModalEditConfig = {
    emptyLabel: 'HSI Contact Modal',
    isEmpty: function(props) {
        return !props.buttonLabel;
    }
};

const ContactModal = (props) => {
    const { buttonLabel, modalTitle, cqPath, className, pagePath, itemPath } = props;
    const [isOpen, setIsOpen] = useState(false);
    const isInEditor = AuthoringUtils.isInEditor();

    // 锁定背景滚动
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // --- Modal 渲染逻辑 ---
    const renderModal = () => {
        if (!isOpen) return null;

        const modalContent = (
            <div 
                className="hsi-modal-overlay" 
                // [关键] 编辑模式下，禁止点击背景关闭，防止拖拽组件时误触背景导致弹窗消失
                onClick={() => !isInEditor && setIsOpen(false)}
            >
                <div 
                    className="hsi-modal-content" 
                    // 阻止冒泡
                    onClick={e => e.stopPropagation()}
                >
                    <div className="hsi-modal-header">
                        <h2>{modalTitle || 'Contact Us'}</h2>
                        <button className="hsi-close-btn" onClick={() => setIsOpen(false)}>&times;</button>
                    </div>
                    
                    <div className="hsi-modal-body">
                        {/* 允许拖拽其他组件进入 Modal */}
                        <ResponsiveGrid
                            pagePath={pagePath}
                            itemPath={`${itemPath}/container`} 
                            gridClassNames="aem-Grid aem-Grid--12"
                            columnClassNames={{ 'container': 'aem-Grid aem-Grid--12' }}
                        />
                    </div>
                </div>
            </div>
        );

        // [关键] 使用 Portal 挂载到 body，避免被 AEM Wrapper 影响位置
        return ReactDOM.createPortal(modalContent, document.body);
    };

    // --- 主渲染入口 ---
    return (
        <div 
            className={`${className} contact-modal-wrapper`} 
            data-cq-data-path={cqPath}
            // [关键修复] 强制重置高度，防止 Author 无限增长
            style={{ height: 'auto', minHeight: '50px' }}
        >
            {/* 1. 正常按钮 */}
            <button 
                className="contact-trigger-btn" 
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(true); 
                }}
            >
                {buttonLabel || 'Contact Us'}
            </button>

            {/* 2. [关键修复] Author Mode 专用辅助开关 */}
            {/* 这解决了 "Preview 切回 Edit 点击按钮无效" 的问题 */}
            { isInEditor && !isOpen && (
                <div className="author-helper-text">
                    <span 
                        onClick={(e) => {
                            e.stopPropagation(); // 阻止冒泡，避免触发 AEM 选中外层
                            setIsOpen(true);
                        }}
                    >
                        ⚙️ Edit Modal Content
                    </span>
                </div>
            )}

            {/* 3. 渲染 Modal */}
            {renderModal()}
        </div>
    );
};

export default MapTo('my-project/components/contact-modal')(ContactModal, ContactModalEditConfig);