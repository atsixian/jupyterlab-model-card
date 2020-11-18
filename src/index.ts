import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { ExamplePanel as ModelCardPanel } from './panel';
import { command } from './constants';

// TODO Add key binding for the command
/**
 * Initialization data for the react-widget extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'model-card',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer, IDocumentManager],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    restorer: ILayoutRestorer,
    docManager: IDocumentManager
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
      }

      // Refresh the content
      widget.update();
      app.shell.activateById(widget.id);
      app.docRegistry.addWidgetExtension('Notebook', widget);
      return widget;
    }

    app.commands.addCommand(command, {
      label: 'Model Card',
      caption: 'Generate Model Card',
      execute: createPanel
    });

    palette.addItem({ command, category: 'Test' });

    const tracker = new WidgetTracker<ModelCardPanel>({
      namespace: 'model-card'
    });

    restorer.restore(tracker, {
      command,
      name: () => 'model-card'
    });
  }
};

export default extension;
