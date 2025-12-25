import React, { useEffect, useCallback } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextStyle from '@tiptap/extension-text-style';
import debounce from 'lodash/debounce';
import './DynamicTable.scss';

// 1. 扩展 TableCell 以支持背景颜色 (Background Color)
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) return {};
          return { style: `background-color: ${attributes.backgroundColor}` };
        },
      },
    };
  },
});

// 2. 菜单栏组件
const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="menubar">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>Bold</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>Italic</button>
      
      <div className="divider" />
      
      <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Insert Table</button>
      <button onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()}>Add Col Left</button>
      <button onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()}>Add Col Right</button>
      <button onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()}>Del Col</button>
      <button onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()}>Add Row Up</button>
      <button onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()}>Add Row Down</button>
      <button onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()}>Del Row</button>
      <button onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()}>Merge</button>
      <button onClick={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()}>Split</button>
      
      <div className="divider" />
      
      {/* 更改背景色功能 */}
      <button onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', '#ffc9c9').run()}>Red BG</button>
      <button onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', '#b2f2bb').run()}>Green BG</button>
      <button onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', null).run()}>Clear BG</button>
    </div>
  );
};

// 3. 主组件
const DynamicTable = (props) => {
  const { cqPath, tableContent } = props;

  // 定义保存函数 (防抖 1秒)
  const saveToAem = useCallback(
    debounce((html) => {
      if (!cqPath) return;

      const formData = new FormData();
      formData.append('./tableContent', html);
      formData.append('_charset_', 'utf-8');

      // 获取 CSRF Token
      const csrfToken = document.cookie.match(/cq-csrf-token=([^;]+)/)?.[1] || '';

      fetch(cqPath, {
        method: 'POST',
        body: formData,
        headers: {
          'CSRF-Token': csrfToken
        }
      }).then(res => {
        if(!res.ok) console.error("Failed to save table");
      });
    }, 1000),
    [cqPath]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }), // 开启拖拽列宽
      TableRow,
      TableHeader,
      CustomTableCell, // 使用自定义 Cell
      TextStyle,
    ],
    content: tableContent || '<p>Start editing table...</p>',
    onUpdate: ({ editor }) => {
      // 仅在编辑模式下触发保存
      // 注意: 这里假设如果页面被加载在 Editor iframe 中我们才保存
      // 实际生产中可以通过 props.isInEditor (AEM提供的prop) 来判断
      saveToAem(editor.getHTML());
    },
  });

  // 当外部 props 数据变化时更新编辑器 (例如 Dialog 修改了某些属性导致刷新)
  useEffect(() => {
    if (editor && tableContent && editor.getHTML() !== tableContent) {
       // 这里要小心避免死循环，通常初次加载会用到
       // editor.commands.setContent(tableContent);
    }
  }, [tableContent, editor]);

  return (
    <div className="dynamic-table-wrapper">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

// 4. AEM Edit Config
const DynamicTableEditConfig = {
  emptyLabel: 'Dynamic Table Component',
  isEmpty: function(props) {
    return !props.tableContent;
  }
};

// 5. 映射组件
MapTo('my-project/components/dynamic-table')(DynamicTable, DynamicTableEditConfig);

export default DynamicTable;