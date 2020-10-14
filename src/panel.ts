import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { StackedPanel } from '@lumino/widgets';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { CounterWidget } from './widget';
import { ToolbarButton } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { command } from './constants';

export class ExamplePanel extends StackedPanel
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  private _view: CounterWidget;
  private _button: ToolbarButton;
  readonly _app: JupyterFrontEnd;

  constructor(app: JupyterFrontEnd) {
    super();
    this._app = app;
    this.id = 'model-card';
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
      console.log(context.model.toJSON());
      // !This ensures our view is synced with model data
      this._view.updateModel(context.model, panel.content);
      this._app.commands.execute(command);
    };
    this._button = new ToolbarButton({
      className: 'myButton',
      onClick: callback,
      tooltip: 'Generate model card',
      label: 'card'
    });
    this.addWidget(this._button);
    panel.toolbar.insertItem(0, 'model-card', this._button);

    // create the frontend view after the context is ready
    context.ready.then(() => {
      this._view = new CounterWidget(context.model, panel.content);
      this.addWidget(this._view);
    });

    return new DisposableDelegate(() => {
      this._view.dispose();
      this._button.dispose();
    });
  }
}