/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/camelcase */
import { ReactWidget } from '@jupyterlab/apputils';
import { INotebookModel, Notebook } from '@jupyterlab/notebook';
import { Button, Input, Typography } from 'antd';
import 'antd/dist/antd.css';
import { enableMapSet } from 'immer';
import React, { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { useImmer } from 'use-immer';
import { generateModelCard } from '../lib/model-card-generator/main';
import { getAnnotMap, AnnotContent, AnnotMap } from '../util/mdExtractor';
import { jumpToCell } from '../util/notebook_private';
import QuickFix, { IQuickFix } from './QuickFix';
const { Title } = Typography;
const { TextArea } = Input;

// TODO only pass the notebook, get model from that?
// TODO seprate state for each section?
// TODO we don't want to run the extension automatically when we switch notebook.
// Possible solution: clear the old data, so no diffs will be generated
// TODO handle empty state when notebook is closed
enableMapSet();

interface IProps {
  model: INotebookModel;
  notebook: Notebook;
}

export const mockData = {
  modelname: {
    title: 'Test Model',
    fileName: 'hello world',
    cell_ids: [1, 2, 3]
  },
  author: { title: 'Author', description: '' },
  dataset: { title: 'Dataset', description: 'dataset desc', links: [''] },
  references: { title: 'References', links: [''], cell_ids: [1, 2, 3] },
  libraries: { title: 'Libraries Used', libs: [''] },
  misc: {
    title: 'Miscellaneous',
    cell_ids: [2, 2, 3],
    cells: [1],
    lineNumbers: [123],
    source: 'this is a source',
    markdown: '',
    imports: [''],
    functions: '',
    figures: [''],
    description: '',
    outputs: ['']
  }
};

interface ISectionProps {
  notebook: Notebook;
  annotMap: Map<string, AnnotContent>;
}

interface ISectionContent {
  sectionName: string;
  notebook: Notebook;
  sectionContent: any;
  quickFix: React.FC<IQuickFix>;
}

const ignoreFields = new Set([
  // 'cell_ids',
  'lineNumbers',
  'markdown',
  'source',
  'misc',
  'cells'
]);

const SectionContent = ({
  sectionName,
  notebook,
  sectionContent,
  quickFix
}): JSX.Element[] =>
  typeof sectionContent !== 'object'
    ? null
    : Object.entries(sectionContent).map(([k, v]: [string, any], idx) => {
        if (ignoreFields.has(k)) {
          return null;
        }
        if (k === 'title') {
          return (
            <h1 key={idx}>
              {v} {quickFix}
            </h1>
          );
        } else if (k === 'cell_ids') {
          return v.map((cid: number, idx: number) => (
            <Button key={idx} onClick={() => jumpToCell(notebook, cid)}>
              {cid}
            </Button>
          ));
        } else if (k === 'figures') {
          return v.map((src: string, idx: number) => (
            <img key={idx} src={`data:image/png;base64,${src}`} />
          ));
        } else {
          return (
            <React.Fragment key={idx}>
              {v.length === 0 ? (
                ''
              ) : (
                <>
                  <h2>{k}</h2>
                  <p>{v}</p>
                </>
              )}
            </React.Fragment>
          );
        }
      });

const Section = ({ notebook, annotMap: amap }: ISectionProps): JSX.Element => {
  const [annotMap, updateAnnotMap] = useImmer(amap);
  const [data, updateData] = useState({});

  useEffect(() => {
    // console.log('updated map', amap);
    updateAnnotMap(() => amap);
    const modelCard: any = generateModelCard(notebook.model.toJSON());

    amap.forEach((value, key) => {
      if (key in data) {
        modelCard[key]['description'] = value.content;
      }
    });
    console.log(modelCard);
    updateData(modelCard);
  }, [amap, notebook]);

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          getAnnotMap(notebook);
        }}
      >
        Markdown test
      </Button>
      {Object.entries(data).map(([sectionName, sectionContent]) =>
        SectionContent({
          sectionName,
          notebook,
          sectionContent,
          quickFix: (
            <QuickFix
              sectionName={sectionName}
              annotMap={annotMap}
              updateAnnotMap={updateAnnotMap}
              notebook={notebook}
              idx={1} // TODO find the right index
              updateMockData={updateData}
            />
          )
        })
      )}
    </>
  );
};

export class ModelCardWidget extends ReactWidget {
  /** Data in the current notebook */
  private _notebook: Notebook;
  private _annotMap: AnnotMap;

  constructor(notebook: Notebook, annotMap: AnnotMap) {
    super();
    this._notebook = notebook;
    this._annotMap = annotMap;
    this.addClass('jp-ReactWidget');
  }

  // rerender the component every time the command is executed
  onUpdateRequest(): void {
    ReactDOM.render(
      <Section notebook={this._notebook} annotMap={this._annotMap} />,
      this.node
    );
  }

  updateModel(notebook: Notebook, annotMap: AnnotMap): void {
    this._notebook = notebook;
    this._annotMap = annotMap;
  }

  render(): JSX.Element {
    return <Section notebook={this._notebook} annotMap={this._annotMap} />;
  }
}
