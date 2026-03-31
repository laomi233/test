import React, { useState } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import { AuthoringUtils } from '@adobe/aem-spa-page-model-manager'; // 引入 AEM 作者模式工具
import ContentFragmentComponent from './ContentFragmentComponent';

const TabComponent = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  // 如果没有配置任何 tabs，在编辑模式下给个占位符，否则返回 null
  if (!tabs || tabs.length === 0) {
    return AuthoringUtils.isInEditor() ? (
      <div className="cq-placeholder">请配置 Tab 和 Content Fragments</div>
    ) : null;
  }

  // 安全获取当前激活的 Tab
  const currentTab = tabs[activeTab];

  return (
    <div className="custom-tab-wrapper">
      {/* 1. Tab 导航头 */}
      <div className="tab-headers">
        {tabs.map((tab, index) => (
          <button 
            key={index}
            className={`tab-btn ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.tabTitle}
          </button>
        ))}
      </div>

      {/* 2. Tab 面板内容 */}
      <div className="tab-panels">
        {currentTab && currentTab.cfDataList && currentTab.cfDataList.map((cfData, index) => {
          
          // 【容错机制 2】如果 CF 无效（被删除或配置错误）
          if (!cfData.isValid || !cfData.elements) {
            // 只有在 AEM 编辑模式下，才给作者看红色的报错提示
            if (AuthoringUtils.isInEditor()) {
              return (
                <div key={index} style={{ border: '1px dashed red', padding: '10px', margin: '10px 0', color: 'red' }}>
                  ⚠️ 警告: 位于 <b>{cfData.path}</b> 的 Content Fragment 已被删除或不可用，请在对话框中移除此路径。
                </div>
              );
            }
            // 线上环境（访客）直接跳过，不渲染，防白屏
            return null; 
          }

          // 正常渲染你的 CF 组件
          return (
            <div key={index} className="cf-item-wrapper">
              <ContentFragmentComponent elements={cfData.elements} />
            </div>
          );
        })}

        {/* 边缘情况：如果该 Tab 下没有配置任何 CF 路径 */}
        {(!currentTab.cfDataList || currentTab.cfDataList.length === 0) && AuthoringUtils.isInEditor() && (
          <div className="cq-placeholder">当前 Tab 暂未配置任何 Content Fragment</div>
        )}
      </div>
    </div>
  );
};

MapTo('my-app/components/customtabs')(TabComponent);
export default TabComponent;