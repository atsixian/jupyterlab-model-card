import React from 'react';
import { EditTwoTone } from '@ant-design/icons';
import { Notebook } from '@jupyterlab/notebook';
import { MarkdownCellModel } from '@jupyterlab/cells';
import { Popconfirm } from 'antd';
import { jumpToCell } from '../util/notebook_private';
import { AnnotContent } from '../util/mdExtractor';
export interface IQuickFix {
  sectionName: string;
  annotMap: Map<string, AnnotContent>;
  updateAnnotMap: Function;
  notebook: Notebook;
  idx: number; // index for insertion
  updateMockData: Function;
}

const annotationContent = (name: string): string =>
  `# ${name}\n<!-- @md-${name} -->\n<!-- /md-${name} -->`;

const QuickFix: React.FC<IQuickFix> = ({
  sectionName,
  annotMap,
  updateAnnotMap,
  notebook,
  idx,
  updateMockData
}) => {
  const existed = annotMap.has(sectionName);
  return existed ? (
    <EditTwoTone
      onClick={(): void => {
        jumpToCell(notebook, annotMap.get(sectionName).idx);
      }}
    />
  ) : (
    <Popconfirm
      title={`Add a new cell for ${sectionName}?`} // TODO: add user-friendly names for sections
      onConfirm={() => {
        notebook.model.cells.insert(
          idx, // TODO figure out where to insert it
          new MarkdownCellModel({
            cell: {
              cell_type: 'markdown',
              source: annotationContent(sectionName),
              metadata: {}
            }
          })
        );
        updateAnnotMap(draft => {
          draft.set(sectionName, idx);
        });
        jumpToCell(notebook, idx);
      }}
      okText="Yes"
      cancelText="No"
    >
      <EditTwoTone />
    </Popconfirm>
  );
};

export default QuickFix;
