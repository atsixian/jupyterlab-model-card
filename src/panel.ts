import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { StackedPanel } from '@lumino/widgets';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { CounterWidget } from './widget';
import { ToolbarButton } from '@jupyterlab/apputils';

export class ExamplePanel extends StackedPanel
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  private _view: CounterWidget;
  private _button: ToolbarButton;

  constructor() {
    super();
    this.id = 'model-card';
    this.title.label = 'Model Card';
    this.title.closable = true;
  }

  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    this._view = new CounterWidget();

    const callback = (): void => {
      console.log(context.contentsModel);
      console.log(context.model.toJSON());
      // this.app.commands.execute('create-model-card');
    };
    this._button = new ToolbarButton({
      className: 'myButton',
      onClick: callback,
      tooltip: 'Show md file',
      label: 'card'
    });
    this.addWidget(this._button);
    this.addWidget(this._view);

    panel.toolbar.insertItem(0, 'runAll', this._button);
    return new DisposableDelegate(() => {
      this._view.dispose();
      this._button.dispose();
    });
  }
}
