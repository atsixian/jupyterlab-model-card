import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';

interface IAPODResponse {
  copyright: string;
  date: string;
  explanation: string;
  media_type: 'video' | 'image';
  title: string;
  url: string;
}
/**
 * Initialization data for the jupyterlab_apod extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-apod',
  autoStart: true,
  requires: [ICommandPalette],
  activate: async (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension jupyterlab-apod is activated!');

    const content = new Widget();
    const widget = new MainAreaWidget({ content });
    widget.id = 'apod-jupyterlab';
    widget.title.label = 'Astronomy Picture';
    widget.title.closable = true;

    let image = document.createElement('img');
    content.node.appendChild(image);

    function randomDate(): string {
      const start = new Date(2010, 1, 1);
      const end = new Date();
      const randomDate = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
      return randomDate.toISOString().slice(0, 10);
    }

    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${randomDate()}`
    );
    const data = (await response.json()) as IAPODResponse;

    if (data.media_type === 'image') {
      image.src = data.url;
      image.title = data.title;
    } else {
      console.error('Not a picture, yo');
    }

    const command = 'apod:open';
    app.commands.addCommand(command, {
      label: 'Random AP',
      execute: () => {
        if (!widget.isAttached) {
          app.shell.add(widget, 'main');
        }
        app.shell.activateById(widget.id);
      }
    });

    palette.addItem({ command, category: 'Tutorial' });
  }
};

export default extension;
