import { JupyterFrontEnd } from '@jupyterlab/application';
import { ToolbarButton } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { Popup } from '@jupyterlab/statusbar';
import { DisposableDelegate, IDisposable } from '@lumino/disposable';
import { StackedPanel } from '@lumino/widgets';
import { ModelCardWidget } from './components/ModelCardWidget';
import { PopupWidget } from './components/PopupWidget';
import {
  commandCreate,
  commandModifyStage,
  modelCardWidgetID
} from './constants';

export class ModelCardPanel extends StackedPanel
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  private _view: ModelCardWidget;
  private _button: ToolbarButton;
  private _popup: PopupWidget;
  readonly _app: JupyterFrontEnd;
  readonly _docManager: IDocumentManager;

  constructor(app: JupyterFrontEnd, docManager: IDocumentManager) {
    super();
    this._app = app;
    this._docManager = docManager;
    this.id = modelCardWidgetID;
    this.title.label = 'Model Card';
    this.title.closable = true;
  }

  onUpdateRequest(): void {
    if (this._view) {
      this._view.update();
    }
  }

  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const callback = (): void => {
      // console.log(context.model.toJSON());
      // !This ensures our view is synced with model data
      this._view.updateModel(panel);
      this._app.commands.execute(commandCreate);
    };
    this._button = new ToolbarButton({
      className: 'myButton',
      onClick: callback,
      tooltip: 'Generate model card',
      label: 'card'
    });
    this.addWidget(this._button);
    panel.toolbar.insertItem(0, modelCardWidgetID, this._button);

    // create the frontend view after the context is ready
    context.ready.then(() => {
      this._view = new ModelCardWidget(panel, this._docManager);
      this._popup = new PopupWidget(panel.content);
      this.addWidget(this._view);
    });

    this._app.commands.addCommand(commandModifyStage, {
      label: '[Model Card] Change stage to...',
      execute: () => {
        this._popup.updateModel(panel.content);
        const popup = new Popup({
          body: this._popup,
          anchor: panel.content.activeCell,
          align: 'right'
        });
        popup.launch();
      }
    });

    this._app.contextMenu.addItem({
      command: commandModifyStage,
      selector: '.jp-CodeCell'
    });

    return new DisposableDelegate(() => {
      this.widgets.forEach(widget => widget.dispose());
      this._popup.dispose();
    });
  }
}
