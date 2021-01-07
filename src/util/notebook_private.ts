// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Notebook } from '@jupyterlab/notebook';
import { ArrayExt } from '@lumino/algorithm';
import { ElementExt } from '@lumino/domutils';
import { Cell } from '@jupyterlab/cells';
/**
 * Ensure that the notebook has proper focus.
 */
function _ensureFocus(notebook: Notebook, force = false): void {
  const activeCell = notebook.activeCell;
  if (notebook.mode === 'edit' && activeCell) {
    if (!activeCell.editor.hasFocus()) {
      activeCell.editor.focus();
    }
  }
  if (force && !notebook.node.contains(document.activeElement)) {
    notebook.node.focus();
  }
}

/**
 * The class name added to notebook widget cells.
 */
const NB_CELL_CLASS = 'jp-Notebook-cell';

/**
 * Find the cell index containing the target html element.
 *
 * #### Notes
 * Returns -1 if the cell is not found.
 */
function _findCell(notebook: Notebook, node: HTMLElement): number {
  // Trace up the DOM hierarchy to find the root cell node.
  // Then find the corresponding child and select it.
  while (node && node !== notebook.node) {
    if (node.classList.contains(NB_CELL_CLASS)) {
      const i = ArrayExt.findFirstIndex(
        notebook.widgets,
        widget => widget.node === node
      );
      if (i !== -1) {
        return i;
      }
      break;
    }
    node = node.parentElement;
  }
  return -1;
}

function scrollToCell(notebook: Notebook, cell: Cell): void {
  // use Phosphor to scroll
  ElementExt.scrollIntoViewIfNeeded(notebook.node, cell.node);
  // change selection and active cell:
  notebook.deselectAll();
  notebook.select(cell);
  cell.activate();
}

const jumpToCell = (notebook: Notebook, idx: number): void => {
  setTimeout(() => {
    notebook.deselectAll();
    notebook.activeCellIndex = idx;
    _ensureFocus(notebook);
    notebook.mode = 'edit';
    scrollToCell(notebook, notebook.activeCell);
  }, 0);
};

export { _ensureFocus, _findCell, scrollToCell, jumpToCell };
