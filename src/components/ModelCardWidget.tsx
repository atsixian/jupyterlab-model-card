/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/camelcase */
import { ReactWidget } from '@jupyterlab/apputils';
import { INotebookModel, Notebook } from '@jupyterlab/notebook';
import { Button, Input, Switch, Typography } from 'antd';
import 'antd/dist/antd.css';
import { enableMapSet } from 'immer';
import { times } from 'lodash';
import randomWords from 'random-words';
import React, { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { useImmer } from 'use-immer';
import QuickFix, { IQuickFix } from './QuickFix';
import { scrollToCell, _ensureFocus } from '../util/notebook_private';
import { getAnnotMap } from '../util/mdExtractor';
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

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getRandomParagraph = () =>
  times(3, () => randomWords(5).join(', ')).join('\n');

// TODO: different functionality for each field. e.g. links for cell_ids

interface ISectionProps {
  mockData: any;
  notebook: Notebook;
}

interface ISectionContent {
  sectionName: string;
  sectionContent: any;
  quickFix: React.FC<IQuickFix>;
}

const SectionContent = ({
  sectionName,
  sectionContent,
  quickFix
}): JSX.Element[] =>
  Object.entries(sectionContent).map(([k, v]: [string, any], idx) =>
    k === 'title' ? (
      <h1 key={idx}>
        {v} {quickFix}
      </h1>
    ) : (
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
    )
  );

const Section = ({ mockData, notebook }: ISectionProps): JSX.Element => {
  const [annotMap, updateAnnotMap] = useImmer(new Map<string, number>());

  useEffect(() => {
    updateAnnotMap(() => getAnnotMap(notebook)); // get existing annotations
  }, [notebook]);

  const [oldData, setOldData] = useState(mockData);
  const [data, setData] = useState(mockData);
  const [editable, setEditable] = useState(true);
  return (
    <>
      <Button
        onClick={() => {
          getAnnotMap(notebook);
        }}
      >
        Markdown test
      </Button>
      {Object.entries(data).map(([sectionName, sectionContent]) =>
        SectionContent({
          sectionName,
          sectionContent,
          quickFix: (
            <QuickFix
              sectionName={sectionName}
              annotMap={annotMap}
              updateAnnotMap={updateAnnotMap}
              notebook={notebook}
            />
          )
        })
      )}
    </>
  );
};

export class ModelCardWidget extends ReactWidget {
  /** Data in the current notebook */
  private _model: INotebookModel;
  private _notebook: Notebook;

  constructor(model: INotebookModel, notebook: Notebook) {
    super();
    this._model = model;
    this._notebook = notebook;
    this.addClass('jp-ReactWidget');
  }

  // rerender the component every time the command is executed
  onUpdateRequest(): void {
    ReactDOM.render(
      <Section mockData={mockData} notebook={this._notebook} />,
      this.node
    );
  }

  updateModel(model: INotebookModel, notebook: Notebook): void {
    this._model = model;
    this._notebook = notebook;
  }

  render(): JSX.Element {
    return <Section mockData={mockData} notebook={this._notebook} />;
  }
}
