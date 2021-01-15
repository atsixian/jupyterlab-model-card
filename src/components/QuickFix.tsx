/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { EditTwoTone } from '@ant-design/icons';
import { Notebook } from '@jupyterlab/notebook';
import { MarkdownCellModel } from '@jupyterlab/cells';
import { Popconfirm } from 'antd';
import { jumpToCell } from '../util/notebook_private';
import { AnnotContent } from '../util/mdExtractor';
import { stages } from '../constants';
export interface IQuickFix {
  sectionName: string;
  sectionTitle: string;
  annotMap: Map<string, AnnotContent>;
  updateAnnotMap: Function;
  notebook: Notebook;
  idx: number; // index for insertion
}

const annotationContent = (name: string, title: string): string => {
  return `# ${title}\n<!-- @md-${name} -->\n<!-- /md-${name} -->`;
};

const QuickFix: React.FC<IQuickFix> = ({
  sectionName,
  sectionTitle,
  annotMap,
  updateAnnotMap,
  notebook,
  idx
}: IQuickFix) => {
  const existed = annotMap.has(sectionName);
  return existed ? (
    <EditTwoTone
      onClick={(): void => {
        jumpToCell(notebook, annotMap.get(sectionName).idx);
      }}
    />
  ) : (
    <Popconfirm
      title={`Add a ${
        stages.has(sectionName) ? 'description' : 'new cell'
      } for ${sectionTitle}?`}
      onConfirm={(): void => {
        notebook.model.cells.insert(
          idx,
          new MarkdownCellModel({
            cell: {
              cell_type: 'markdown',
              source: annotationContent(sectionName, sectionTitle),
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
