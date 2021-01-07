import { DownOutlined } from '@ant-design/icons';
import { ReactWidget } from '@jupyterlab/apputils';
import { Notebook } from '@jupyterlab/notebook';
import { Button, Dropdown, Menu } from 'antd';
import clone from 'lodash/clone';
import React from 'react';
import { stages } from '../constants';

interface IProps {
  notebook: Notebook;
}
// TODO regex is not perfect, check fuzzy match?
const pattern = /(\[model card\] stage: )[\w ]*(.*)/;

const StageDropdown: React.FC<IProps> = ({ notebook }: IProps) => {
  const menu = (
    <Menu>
      {Array.from(stages.entries()).map(([stageId, stageName], idx) => (
        <Menu.Item
          key={idx}
          onClick={(): void => {
            notebook.activeCell.model.metadata.set('stage', stageId);
            // comment as a visual hint
            const text = notebook.activeCell.model.value.text;
            const m = text.match(pattern);
            if (m) {
              notebook.activeCell.model.value.text = text.replace(
                pattern,
                `$1${stageName}$2`
              );
            } else {
              notebook.activeCell.model.value.insert(
                0,
                `# [model card] stage: ${stageName}\n`
              );
            }
          }}
        >
          {stageName}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu}>
      <Button>
        Select stage <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export class PopupWidget extends ReactWidget {
  /** Data in the current notebook */
  private _notebook: Notebook;

  constructor(notebook: Notebook) {
    super();
    this._notebook = notebook;
  }

  updateModel(notebook: Notebook): void {
    this._notebook = clone(notebook);
  }

  render(): JSX.Element {
    return <StageDropdown notebook={this._notebook} />;
  }
}
