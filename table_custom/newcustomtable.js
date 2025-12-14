import React, { useState, useCallback } from 'react';
import {
  MapTo,
  EditableComponent
} from '@adobe/aem-react-editable-components';
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

/* =========================================================
 * 内部真正渲染逻辑（不关心 AEM Overlay）
 * ========================================================= */
const CustomTableInner = (props) => {
  const {
    tableData: propTableData,
    pagePath,
    itemPath
  } = props;

  const createDefaultData = () => [
    ['Date', 'Time'],
    ['Sat, Sun', '00:00 - 06:00']
  ];

  const [tableData, setTableData] = useState(() => {
    if (propTableData) {
      try {
        return JSON.parse(propTableData);
      } catch (e) {
        return createDefaultData();
      }
    }
    return createDefaultData();
  });

  const [selectedCell, setSelectedCell] = useState({ r: -1, c: -1 });
  const [isPreview, setIsPreview] = useState(false);

  const isInEditor = AuthoringUtils.isInEditor();

  /* ---------------- Table Ops ---------------- */

  const updateCell = (r, c, val) => {
    const newData = [...tableData];
    newData[r] = [...newData[r]];
    newData[r][c] = val;
    setTableData(newData);
  };

  const insertRow = (rIndex, pos) => {
    if (rIndex === -1) return;
    const colCount = tableData[0].length;
    const newData = [...tableData];
    newData.splice(
      pos === 'after' ? rIndex + 1 : rIndex,
      0,
      Array(colCount).fill('')
    );
    setTableData(newData);
  };

  const deleteRow = (rIndex) => {
    if (tableData.length <= 1) return;
    setTableData(tableData.filter((_, i) => i !== rIndex));
    setSelectedCell({ r: -1, c: -1 });
  };

  const insertCol = (cIndex, pos) => {
    if (cIndex === -1) return;
    const targetPos = pos === 'after' ? cIndex + 1 : cIndex;
    setTableData(
      tableData.map(row => {
        const newRow = [...row];
        newRow.splice(targetPos, 0, '');
        return newRow;
      })
    );
  };

  const deleteCol = (cIndex) => {
    if (tableData[0].length <= 1) return;
    setTableData(
      tableData.map(row => row.filter((_, i) => i !== cIndex))
    );
    setSelectedCell({ r: -1, c: -1 });
  };

  /* ---------------- Persist (optional) ---------------- */

  const saveToAEM = useCallback(async () => {
    if (!pagePath || !itemPath) return;

    const formData = new FormData();
    formData.append('./tableData', JSON.stringify(tableData));

    await fetch(`${pagePath}/jcr:content/${itemPath}`, {
      method: 'POST',
      body: formData
    });
  }, [tableData, pagePath, itemPath]);

  /* ---------------- Render ---------------- */

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

  const renderEditorView = () => {
    const hasSelection = selectedCell.r !== -1;

    return (
      <div className="internal-editor">
        <div className="editor-bar">
          <button onClick={saveToAEM}>💾 Save</button>
          <label>
            <input
              type="checkbox"
              checked={isPreview}
              onChange={() => setIsPreview(!isPreview)}
            />
            Preview
          </label>
        </div>

        <div className={`tools ${hasSelection ? '' : 'disabled'}`}>
          <span>Row:</span>
          <button onClick={() => insertRow(selectedCell.r, 'before')}>↑</button>
          <button onClick={() => insertRow(selectedCell.r, 'after')}>↓</button>
          <button onClick={() => deleteRow(selectedCell.r)}>×</button>

          <span style={{ marginLeft: 8 }}>Col:</span>
          <button onClick={() => insertCol(selectedCell.c, 'before')}>←</button>
          <button onClick={() => insertCol(selectedCell.c, 'after')}>→</button>
          <button onClick={() => deleteCol(selectedCell.c)}>×</button>
        </div>

        <table className="editor-grid">
          <tbody>
            {tableData.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td
                    key={`${r}-${c}`}
                    className={
                      selectedCell.r === r && selectedCell.c === c ? 'sel' : ''
                    }
                    onClick={() => setSelectedCell({ r, c })}
                  >
                    <input
                      value={cell}
                      onChange={e => updateCell(r, c, e.target.value)}
                      /* 🔑 只在 input 上阻断事件 */
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
  };

  return isInEditor && !isPreview
    ? renderEditorView()
    : renderPublishView();
};

/* =========================================================
 * AEM Wrapper（唯一负责 Overlay）
 * ========================================================= */
const CustomTable = (props) => {
  return (
    <EditableComponent {...props}>
      <CustomTableInner {...props} />
    </EditableComponent>
  );
};

/**
 * Map to AEM resourceType
 */
export default MapTo(
  'my-project/components/custom-table'
)(CustomTable, CustomTableEditConfig);
