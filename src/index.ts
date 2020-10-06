import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { ExamplePanel } from './panel';

/**
 * The command IDs used by the react-widget plugin.
 */
namespace CommandIDs {
  export const create = 'create-model-card';
}

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
    const command = CommandIDs.create;
    let widget: ExamplePanel;

    async function createPanel(): Promise<ExamplePanel> {
      if (!widget) {
        widget = new ExamplePanel(app);
        // widget = new MainAreaWidget<CounterWidget>({ content });
        widget.id = 'model-card';
        widget.title.label = 'Model Card';
        widget.title.closable = true;
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

    const tracker = new WidgetTracker<ExamplePanel>({
      namespace: 'model-card'
    });

    restorer.restore(tracker, {
      command,
      name: () => 'model-card'
    });
  }
};

export default extension;
