import React from 'react';
import { EditOutlined } from '@ant-design/icons';
import { Notebook } from '@jupyterlab/notebook';
import { MarkdownCellModel } from '@jupyterlab/cells';
import { Popconfirm } from 'antd';
import { jumpToCell } from '../util/notebook_private';

export interface IQuickFix {
  sectionName: string;
  annotMap: Map<string, number>;
  updateAnnotMap: Function;
  notebook: Notebook;
}

// TODO move it to constants
const annotationContent = (name: string): string =>
  `<!-- @md-${name} -->
# ${name}
<!-- /md-${name} -->`;

const QuickFix: React.FC<IQuickFix> = ({
  sectionName,
  annotMap,
  updateAnnotMap,
  notebook
}) => {
  const existed = annotMap.has(sectionName);
  return existed ? (
    <EditOutlined
      onClick={(): void => {
        jumpToCell(notebook, annotMap.get(sectionName));
      }}
    />
  ) : (
    <Popconfirm
      title={`Add a new cell for ${sectionName}?`} // TODO: add user-friendly names for sections
      onConfirm={() => {
        notebook.model.cells.insert(
          0, // TODO figure out where to insert it
          new MarkdownCellModel({
            cell: {
              cell_type: 'markdown',
              source: annotationContent(sectionName),
              metadata: {}
            }
          })
        );
        updateAnnotMap(draft => {
          draft.set(sectionName, 0);
        });
      }}
      okText="Yes"
      cancelText="No"
    >
      <EditOutlined />
    </Popconfirm>
  );
};

export default QuickFix;
