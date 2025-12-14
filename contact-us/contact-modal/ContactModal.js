import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MapTo } from '@adobe/aem-react-editable-components';
import { ResponsiveGrid } from '@adobe/aem-react-editable-components'; // 引入 AEM 容器
import { AuthoringUtils } from '@adobe/aem-spa-page-model-manager';
import './ContactModal.css';

const ContactModalEditConfig = {
    emptyLabel: 'Contact Modal Container',
    isEmpty: function(props) {
        return !props.buttonLabel;
    }
};

const ContactModal = (props) => {
    // 1. 解构属性
    const { buttonLabel, modalTitle, cqPath, className } = props;
    const [isOpen, setIsOpen] = useState(false);
    const isInEditor = AuthoringUtils.isInEditor();

    // 2. 处理 Body 滚动锁定
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'; // 打开时禁止背景滚动
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // 3. Modal 渲染内容 (使用 Portal 挂载到 body)
    const renderModal = () => {
        if (!isOpen && !isInEditor) return null; // 非编辑模式下，关闭时不渲染

        // 在编辑模式下，通常我们希望模态框默认是不显示的，只有点击按钮才显示
        // 但为了方便拖拽，你可以决定是否允许在页面直接渲染内容
        if (!isOpen && isInEditor) return null; 

        const modalContent = (
            <div className="hsi-modal-overlay" onClick={() => setIsOpen(false)}>
                <div className="hsi-modal-content" onClick={e => e.stopPropagation()}>
                    <div className="hsi-modal-header">
                        <h2>{modalTitle || 'Contact Us'}</h2>
                        <button className="hsi-close-btn" onClick={() => setIsOpen(false)}>&times;</button>
                    </div>
                    
                    <div className="hsi-modal-body">
                        {/* 关键点：这里放置一个 ResponsiveGrid。
                           这允许作者将其他组件（Text, Form Container）拖入这个 Modal 内部。
                           我们将当前组件的路径作为 grid 的根路径。
                        */}
                        <ResponsiveGrid
                            pagePath={props.pagePath}
                            itemPath={`${props.itemPath}/container`} // 子节点路径
                            columnClassNames={{
                                'container': 'aem-Grid aem-Grid--12'
                            }}
                            gridClassNames="aem-Grid aem-Grid--12"
                            {...props} 
                        />
                    </div>
                </div>
            </div>
        );

        // 使用 Portal 渲染到 document.body，避免 z-index 问题
        return ReactDOM.createPortal(modalContent, document.body);
    };

    return (
        <div className={`${className} contact-modal-wrapper`} data-cq-data-path={cqPath}>
            {/* 触发按钮 */}
            <button 
                className="contact-trigger-btn" 
                onClick={(e) => {
                    e.preventDefault(); // 防止链接跳转
                    setIsOpen(true);
                }}
            >
                {buttonLabel || 'Contact Us'}
            </button>

            {/* 渲染 Modal */}
            {renderModal()}
        </div>
    );
};

export default MapTo('my-project/components/contact-modal')(ContactModal, ContactModalEditConfig);