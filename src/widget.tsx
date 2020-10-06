/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { INotebookModel, NotebookModel } from '@jupyterlab/notebook';
import { Message } from '@lumino/messaging';
import { Button, Input, Typography } from 'antd';
import 'antd/dist/antd.css';
import React, { useState } from 'react';
import * as ReactDOM from 'react-dom';
import DiffViewer from './diff';
const { Title } = Typography;
const { TextArea } = Input;

// TODO seprate state for each section?

const mock = {
  modelname: 'Test Model',
  authorinfo: 'Author Info',
  dataset: {
    title: 'Dataset',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  },
  references: { title: 'References', link: [] as string[] }
};

interface IProps {
  model: INotebookModel;
}
/**
 * React component for a counter.
 *
 * @returns The React component
 */
const CounterComponent = ({ model }: IProps): JSX.Element => {
  const [title, setTitle] = useState(mock.modelname);
  const [author, setAuthor] = useState(mock.authorinfo);
  const [description, setDescription] = useState(mock.dataset.description);

  const gatherInfo = (): void => {
    alert(
      `Model Name: ${title}\nAuthor: ${author}\nDescription: ${description}`
    );
  };
  return (
    <>
      <Title editable={{ onChange: setTitle }}>{title}</Title>
      <Title level={2}>
        Number of cells in the notebook: {model.cells.length}
      </Title>
      <Title level={2} editable={{ onChange: setAuthor }}>
        {author}
      </Title>
      <Title level={3}>Description</Title>
      <TextArea
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={4}
        style={{ width: '50%' }}
      />
      <DiffViewer />
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
  private _notebook: INotebookModel;

  constructor(notebook: INotebookModel) {
    super();
    this._notebook = notebook;
    this.addClass('jp-ReactWidget');
  }

  // rerender the component every time the command is executed
  onUpdateRequest(): void {
    ReactDOM.render(<CounterComponent model={this._notebook} />, this.node);
  }

  updateModel(model: INotebookModel): void {
    this._notebook = model;
  }

  render(): JSX.Element {
    return <CounterComponent model={this._notebook} />;
  }
}
