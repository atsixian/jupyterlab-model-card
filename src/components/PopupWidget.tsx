import { DownOutlined } from '@ant-design/icons';
import { ReactWidget } from '@jupyterlab/apputils';
import { Notebook, NotebookModel } from '@jupyterlab/notebook';
import { Button, Dropdown, Menu } from 'antd';
import clone from 'lodash/clone';
import React from 'react';
import { stages } from '../constants';

interface IProps {
  notebook: Notebook;
}

const StageDropdown: React.FC<IProps> = ({ notebook }: IProps) => {
  const menu = (
    <Menu>
      {Array.from(stages.entries()).map(([stageId, stageName], idx) => (
        <Menu.Item
          key={idx}
          onClick={(): void => {
            notebook.activeCell.model.metadata.set('stage', stageId);
            // console.log(notebook.activeCellIndex);
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
