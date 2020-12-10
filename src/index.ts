import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { INotebookTracker } from '@jupyterlab/notebook';
import { commandCreate } from './constants';
import { ModelCardPanel } from './panel';

// TODO Add key binding for the command
/**
 * Initialization data for the react-widget extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'model-card',
  autoStart: true,
  requires: [
    ICommandPalette,
    ILayoutRestorer,
    IDocumentManager,
    INotebookTracker
  ],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    restorer: ILayoutRestorer,
    docManager: IDocumentManager,
    notebookTracker: INotebookTracker
  ) => {
    // Create a new widget
    // const command = CommandIDs.create;
    let widget: ModelCardPanel;

    async function createPanel(): Promise<ModelCardPanel> {
      if (!widget) {
        widget = new ModelCardPanel(app); // add docManager here
        // widget = new MainAreaWidget<CounterWidget>({ content });
      }
      if (!tracker.has(widget)) {
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        app.shell.add(widget, 'main');
        app.shell.activateById(widget.id);
        app.docRegistry.addWidgetExtension('Notebook', widget);
      }

      // Refresh the content
      widget.update();
      return widget;
    }

    app.commands.addCommand(commandCreate, {
      label: 'Model Card',
      caption: 'Generate Model Card',
      isVisible: () => false,
      execute: createPanel
    });

    // palette.addItem({ command, category: 'Model Card' });

    const tracker = new WidgetTracker<ModelCardPanel>({
      namespace: 'model-card'
    });

    restorer.restore(tracker, {
      command: commandCreate,
      name: () => 'model-card'
    });
  }
};

export default extension;
