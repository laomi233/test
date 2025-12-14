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

    // 防止背景滚动 (仅在非编辑模式，或者编辑模式打开时)
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
        // 如果关闭且不在编辑器中，不渲染
        // 注意：在编辑器中，如果 isOpen 为 false，我们也不渲染，通过辅助按钮打开
        if (!isOpen) return null;

        const modalContent = (
            <div 
                className="hsi-modal-overlay" 
                // [关键修复] 编辑模式下，禁止点击遮罩层关闭 Modal，防止拖拽时误关
                onClick={() => !isInEditor && setIsOpen(false)}
            >
                <div 
                    className="hsi-modal-content" 
                    onClick={e => e.stopPropagation()}
                >
                    <div className="hsi-modal-header">
                        <h2>{modalTitle || 'Contact Us'}</h2>
                        <button className="hsi-close-btn" onClick={() => setIsOpen(false)}>&times;</button>
                    </div>
                    
                    <div className="hsi-modal-body">
                        {/* AEM 容器区域：允许拖拽其他组件 */}
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

        // 使用 Portal 挂载到 body，避免 z-index 和 transform 问题
        return ReactDOM.createPortal(modalContent, document.body);
    };

    // --- 主渲染入口 ---
    return (
        <div 
            className={`${className} contact-modal-wrapper`} 
            data-cq-data-path={cqPath}
            // [关键修复] 显式重置高度，防止 Author 无限增长
            style={{ height: 'auto', minHeight: '50px' }}
        >
            {/* 1. 正常用户的按钮 */}
            <button 
                className="contact-trigger-btn" 
                onClick={(e) => {
                    e.preventDefault();
                    // 在编辑模式下，有时候点击会被 AEM 拦截用于“选中组件”
                    // 所以我们下面加了一个辅助链接
                    setIsOpen(true); 
                }}
            >
                {buttonLabel || 'Contact Us'}
            </button>

            {/* 2. [关键修复] Author Mode 专用辅助开关 */}
            {/* 这允许作者在不切换到 Preview 模式的情况下，直接点开 Modal 进行编辑 */}
            { isInEditor && !isOpen && (
                <div className="author-helper-text">
                    <span 
                        onClick={(e) => {
                            e.stopPropagation(); // 阻止冒泡，避免触发 AEM 选中外层
                            setIsOpen(true);
                        }}
                    >
                        ⚙️ Click here to Edit Modal Content
                    </span>
                </div>
            )}

            {/* 3. 渲染 Modal */}
            {renderModal()}
        </div>
    );
};

export default MapTo('my-project/components/contact-modal')(ContactModal, ContactModalEditConfig);