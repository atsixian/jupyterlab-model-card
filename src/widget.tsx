/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { INotebookModel, Notebook, NotebookModel } from '@jupyterlab/notebook';
import { Message } from '@lumino/messaging';
import { Button, Input, Switch, Typography } from 'antd';
import 'antd/dist/antd.css';
import React, { useState } from 'react';
import * as ReactDOM from 'react-dom';
import DiffViewer, { constructLines } from './diff';
import { _ensureFocus, scrollToCell } from './util/notebook_private';
const { Title } = Typography;
const { TextArea } = Input;

// TODO only pass the notebook, get model from that?
// TODO seprate state for each section?
// TODO we don't want to run the extension automatically when we switch notebook.
// Possible solution: clear the old data, so no diffs will be generated
// TODO handle empty state when notebook is closed

const mock = {
  modelname: { title: 'Test Model' },
  authorinfo: {
    title: 'Author Info',
    description: 'John Apple',
    cell_ids: [3]
  },
  dataset: { title: 'Dataset', description: 'Nothing here', links: ['hello'] },
  references: { title: 'References', links: ['abc.com'], cell_ids: [1, 2, 3] },
  libraries: { title: 'Libraries Used' }
};

const _mock = {
  modelname: { title: 'Another model' },
  authorinfo: { title: 'Author Info', description: 'John Apple' },
  dataset: {
    title: 'Dataset',
    description: 'Write something here',
    links: ['hello from the other side']
  },
  references: { title: 'References', links: ['abc.com'], cell_ids: [1, 2, 3] },
  libraries: { title: 'Libraries Used' }
};

interface IProps {
  model: INotebookModel;
  notebook: Notebook;
}
/**
 * React component for a counter.
 *
 * @returns The React component
 */
const CounterComponent = ({ model: nb, notebook }: IProps): JSX.Element => {
  const [modelName, setModelName] = useState(mock.modelname.title);
  const [author, setAuthor] = useState(mock.authorinfo.description);
  const [description, setDescription] = useState(mock.dataset.description);
  const [editable, setEditable] = useState(false);
  // get a new instance of notebook, need to reset the state, and compare it
  // with the old state
  const [model, setModel] = useState(nb); // TODO: use immer?
  const oldString = JSON.stringify(mock, null, 2);
  const newString = JSON.stringify(_mock, null, 2);
  const [oldContent, setOldContent] = useState(oldString);
  const [newContent, setNewContent] = useState(newString);
  const [oldLines, setOldLines] = useState(constructLines(oldString));
  const [newLines, setNewLines] = useState(constructLines(newString));

  // console.log(constructLines(oldContent));

  const gatherInfo = (): void => {
    alert(
      `Model Name: ${modelName}\nAuthor: ${author}\nDescription: ${description}`
    );
  };

  const jumpToCell = (idx: number): void => {
    setTimeout(() => {
      notebook.deselectAll();
      notebook.activeCellIndex = idx;
      _ensureFocus(notebook);
      notebook.mode = 'edit';
      scrollToCell(notebook, notebook.activeCell);
    }, 0);
  };

  return (
    <>
      <Title>{modelName}</Title>
      <Title level={2}>
        Number of cells in the notebook: {nb.cells.length}
      </Title>
      <Button
        style={{ padding: 0 }}
        type="text"
        onClick={() => {
          // no cell id info, do nothing
          if (mock.authorinfo.cell_ids) {
            jumpToCell(mock.authorinfo.cell_ids[0]);
          }
        }}
      >
        <Title level={2}>
          {mock.authorinfo.title}: {mock.authorinfo.description}
        </Title>
      </Button>
      <Button
        style={{ padding: 0, display: 'block' }}
        type="text"
        onClick={() => {
          // no cell id info, do nothing
          if (mock.references.cell_ids) {
            jumpToCell(mock.references.cell_ids[0]);
          }
        }}
      >
        <Title level={2}>{mock.references.title}</Title>
      </Button>
      <p>
        Related Cells:
        {mock.references.cell_ids.map((cid, idx) => (
          <Button
            type="link"
            key={idx}
            onClick={(): void => {
              jumpToCell(cid);
            }}
          >
            {cid}
          </Button>
        ))}
      </p>
      {/* <Title level={3}>Description</Title>
      <TextArea
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={4}
        style={{ width: '50%' }}
      /> */}
      {/* <Switch
        checkedChildren="View"
        unCheckedChildren="Edit"
        defaultChecked
        onChange={(checked: boolean): void => {
          setEditable(!checked);
        }}
      /> */}
      <Title level={2}>Merge Demo</Title>
      <DiffViewer
        oldValue={oldContent}
        newValue={newContent}
        oldLines={oldLines}
        newLines={newLines}
        setOldLines={setOldLines}
        setNewLines={setNewLines}
        setNewContent={setNewContent}
        setOldContent={setOldContent}
      />
      {/* <UseSignal signal={model.stateChanged}>
        {(): JSX.Element => <span key="yo">{model.toString()}</span>}
      </UseSignal> */}
      <Button
        type="primary"
        onClick={e => gatherInfo()}
        style={{ display: 'block', marginTop: '20px' }}
      >
        Export to Markdown
      </Button>
    </>
  );
};

/**
 * A Counter Lumino Widget that wraps a CounterComponent.
 */
export class CounterWidget extends ReactWidget {
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
      <CounterComponent model={this._model} notebook={this._notebook} />,
      this.node
    );
  }

  updateModel(model: INotebookModel, notebook: Notebook): void {
    this._model = model;
    this._notebook = notebook;
  }

  render(): JSX.Element {
    return <CounterComponent model={this._model} notebook={this._notebook} />;
  }
}
