import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { StackedPanel, Widget } from '@lumino/widgets';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { ModelCardWidget } from './components/ModelCardWidget';
import { PopupWidget } from './components/PopupWidget';
import { ToolbarButton } from '@jupyterlab/apputils';
import { Popup } from '@jupyterlab/statusbar';
import { JupyterFrontEnd } from '@jupyterlab/application';
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

  constructor(app: JupyterFrontEnd) {
    super();
    this._app = app;
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
      this._view.updateModel(panel.content);
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
      this._view = new ModelCardWidget(panel.content);
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
