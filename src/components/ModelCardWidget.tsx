/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/camelcase */
import { ReactWidget } from '@jupyterlab/apputils';
import { INotebookModel, Notebook, NotebookPanel } from '@jupyterlab/notebook';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { IDocumentManager } from '@jupyterlab/docmanager';
import 'antd/dist/antd.css';
import clone from 'lodash/clone';
import React from 'react';
import * as ReactDOM from 'react-dom';
import Section from './Section';

export class ModelCardWidget extends ReactWidget {
  /** Data in the current notebook */
  private _notebook: Notebook;
  private _context: DocumentRegistry.IContext<INotebookModel>;
  private _docManager: IDocumentManager;

  constructor(panel: NotebookPanel, docManager: IDocumentManager) {
    super();
    this._notebook = panel.content;
    this._context = panel.context;
    this._docManager = docManager;
    this.addClass('jp-ReactWidget');
  }

  // rerender the component every time the command is executed
  onUpdateRequest(): void {
    ReactDOM.render(
      <Section
        notebook={this._notebook}
        context={this._context}
        docManager={this._docManager}
      />,
      this.node
    );
  }

  updateModel(panel: NotebookPanel): void {
    this._notebook = clone(panel.content);
  }

  render(): JSX.Element {
    return (
      <Section
        notebook={this._notebook}
        context={this._context}
        docManager={this._docManager}
      />
    );
  }
}
