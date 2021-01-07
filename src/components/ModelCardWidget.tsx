/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/camelcase */
import { ReactWidget } from '@jupyterlab/apputils';
import { Notebook } from '@jupyterlab/notebook';
import 'antd/dist/antd.css';
import clone from 'lodash/clone';
import React from 'react';
import * as ReactDOM from 'react-dom';
import Section from './Section';

export class ModelCardWidget extends ReactWidget {
  /** Data in the current notebook */
  private _notebook: Notebook;

  constructor(notebook: Notebook) {
    super();
    this._notebook = notebook;
    this.addClass('jp-ReactWidget');
  }

  // rerender the component every time the command is executed
  onUpdateRequest(): void {
    ReactDOM.render(<Section notebook={this._notebook} />, this.node);
  }

  updateModel(notebook: Notebook): void {
    this._notebook = clone(notebook);
  }

  render(): JSX.Element {
    return <Section notebook={this._notebook} />;
  }
}
