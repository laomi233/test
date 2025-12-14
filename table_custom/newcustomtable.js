import React, { useState, useCallback } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import { AuthoringUtils } from '@adobe/aem-spa-page-model-manager';
import './CustomTable.css';

/**
 * AEM Edit Config
 */
const CustomTableEditConfig = {
  emptyLabel: 'HSI Custom Table',
  isEmpty: function (props) {
    return !props.tableData || props.tableData.length === 0;
  }
};

const CustomTable = (props) => {
  const {
    className = '',
    cqPath,
    id,
    tableData: propTableData,
    pagePath,
    itemPath
  } = props;

  const isInEditor = AuthoringUtils.isInEditor();

  /* ---------------- Data ---------------- */

  const createDefaultData = () => [
    ['Date', 'Time'],
    ['Sat, Sun', '00:00 - 06:00']
  ];

  const [tableData, setTableData] = useState(() => {
    if (propTableData) {
      try {
        return JSON.parse(propTableData);
      } catch {
        return createDefaultData();
      }
    }
    return createDefaultData();
  });

  const [selectedCell, setSelectedCell] = useState({ r: -1, c: -1 });
  const [isPreview, setIsPreview] = useState(false);

  /* ---------------- Ops ---------------- */

  const updateCell = (r, c, val) => {
    const newData = [...tableData];
    newData[r] = [...newData[r]];
    newData[r][c] = val;
    setTableData(newData);
  };

  /* ---------------- Views ---------------- */

  const renderPublishView = () => (
    <table className="hsi-table">
      <thead>
        <tr>
          {tableData[0].map((c, i) => (
            <th key={i}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.slice(1).map((row, r) => (
          <tr key={r}>
            {row.map((c, i) => (
              <td key={i}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderEditorView = () => (
    <div className="internal-editor">
      <table className="editor-grid">
        <tbody>
          {tableData.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={`${r}-${c}`} onClick={() => setSelectedCell({ r, c })}>
                  <input
                    value={cell}
                    onChange={e => updateCell(r, c, e.target.value)}
                    /* 只拦 input */
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => e.stopPropagation()}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /* ---------------- Root (关键) ---------------- */

  return (
    <div
      id={id}
      className={`cmp-custom-table ${className}`}
      data-cq-data-path={cqPath}
    >
      {isInEditor && !isPreview
        ? renderEditorView()
        : renderPublishView()}
    </div>
  );
};

export default MapTo(
  'my-project/components/custom-table'
)(CustomTable, CustomTableEditConfig);
