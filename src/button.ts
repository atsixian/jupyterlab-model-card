import { JupyterFrontEnd } from '@jupyterlab/application';
import { ToolbarButton } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import {
  INotebookModel,
  // NotebookActions,
  NotebookPanel
} from '@jupyterlab/notebook';
import { DisposableDelegate, IDisposable } from '@lumino/disposable';
import { Widget } from '@lumino/widgets';
// import { CodeCellModel, ICellModel, ICodeCellModel } from '@jupyterlab/cells';

/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export class ButtonExtension extends Widget {
  /**
   * Create a new extension object.
   */
  // readonly app: JupyterFrontEnd;

  // constructor(app: JupyterFrontEnd) {
  //   super();
  //   this.app = app;
  // }

  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const callback = (): void => {
      // NotebookActions.runAll(panel.content, context.sessionContext);
      //   this._documentManager.openOrReveal('ModelCard.md');
      console.log(context.contentsModel);
      console.log(context.model.toJSON());
      // this.app.commands.execute('create-model-card');
    };
    const button = new ToolbarButton({
      className: 'myButton',
      onClick: callback,
      tooltip: 'Show md file',
      label: 'card'
    });
    panel.toolbar.insertItem(0, 'runAll', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}

/**
 * Activate the extension.
 */
// function activate(
//   app: JupyterFrontEnd,
//   documentManager: IDocumentManager
// ): void {
//   console.log('Activated');

//   app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
// }

/**
 * The plugin registration information.
 */
// const plugin: JupyterFrontEndPlugin<void> = {
//   activate,
//   id: 'my-extension-name:buttonPlugin',
//   autoStart: true,
//   requires: [IDocumentManager]
// };

/**
 * Export the plugin as default.
 */
