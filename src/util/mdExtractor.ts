import { Notebook } from '@jupyterlab/notebook';
import { each } from '@lumino/algorithm';

const start = /<!--\s*@md-(\w*)\s*-->/;
const end = /<!--\s*\/md-(\w*)\s*-->/;

export const getAnnotMap = (nb: Notebook): Map<string, number> => {
  const annotMap = new Map<string, number>();
  let m;
  each(nb.model.cells, (cell, idx) => {
    if (cell.type === 'markdown') {
      m = cell.value.text.match(start);
      if (m) {
        annotMap.set(m[1], idx);
      }
    }
  });
  console.log(annotMap);
  return annotMap;
};
