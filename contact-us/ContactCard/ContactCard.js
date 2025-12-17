import React from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import './ContactCard.css';

const ContactCard = (props) => {
    const { 
        title, 
        text, 
        fileReference, 
        widthPercentage = 30, 
        numberOfLines = 6 
    } = props;

    // 核心逻辑：固定行高
    const FIXED_LINE_HEIGHT = 1.5; // em
    
    // 核心逻辑：计算总高度
    const calculatedHeight = `${numberOfLines * FIXED_LINE_HEIGHT}em`;

    const cardStyle = {
        width: `${widthPercentage}%`,
        height: calculatedHeight,
        lineHeight: `${FIXED_LINE_HEIGHT}em` // 强制 CSS 行高
    };

    // 编辑模式下的空状态检查
    if (!title && !text && !fileReference) {
        return <div className="contact-card-empty">Configure Contact Card</div>;
    }

    return (
        <div className="contact-card" style={cardStyle}>
            {fileReference && (
                <div className="contact-card-icon">
                     <img src={fileReference} alt={title || 'icon'} />
                </div>
            )}
            
            {title && <h3 className="contact-card-title">{title}</h3>}
            
            {/* 内容区域：处理溢出 */}
            <div 
                className="contact-card-text"
                dangerouslySetInnerHTML={{ __html: text }} 
            />
        </div>
    );
};

export default MapTo('mysite/components/contact-card')(ContactCard);