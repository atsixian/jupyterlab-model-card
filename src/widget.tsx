/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactWidget } from '@jupyterlab/apputils';
import { Button, Typography, Input } from 'antd';
import React, { useState } from 'react';
import * as ReactDOM from 'react-dom';
import { Message } from '@lumino/messaging';
import 'antd/dist/antd.css';
import DiffViewer from './diff';
import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { DisposableDelegate, IDisposable } from '@lumino/disposable';
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

/**
 * React component for a counter.
 *
 * @returns The React component
 */
const CounterComponent = (): JSX.Element => {
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
      <Button
        type="primary"
        onClick={e => gatherInfo()}
        style={{ display: 'block', marginTop: '20px' }}
      >
        Export to Markdown
      </Button>
      <DiffViewer />
    </>
  );
};

/**
 * A Counter Lumino Widget that wraps a CounterComponent.
 */
export class CounterWidget extends ReactWidget {
  /**
   * Constructs a new CounterWidget.
   */
  constructor() {
    super();
    this.addClass('jp-ReactWidget');
  }

  // rerender the component every time the command is executed
  onUpdateRequest(msg: Message): void {
    ReactDOM.render(<CounterComponent />, this.node);
  }

  render(): JSX.Element {
    return <CounterComponent />;
  }
}
