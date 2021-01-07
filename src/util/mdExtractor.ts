import { Notebook } from '@jupyterlab/notebook';
import { each } from '@lumino/algorithm';

const start = /<!--\s*@md-(\w*)\s*-->/;
const end = /<!--\s*\/md-(\w*)\s*-->/;
const content = /<!--\s*@md-\w*\s*-->([\s\S]*)<!--\s*\/md-\w*\s*-->/;

export type AnnotContent = {
  idx: number;
  content: string;
};

export type AnnotMap = Map<string, AnnotContent>;

export const getAnnotMap = (nb: Notebook): AnnotMap => {
  const annotMap = new Map<string, AnnotContent>();
  let m: string[], contentMatch: string[];
  each(nb.model.cells, (cell, idx) => {
    if (cell.type === 'markdown') {
      m = cell.value.text.match(start);
      debugger;
      contentMatch = cell.value.text.match(content);
      if (m) {
        annotMap.set(m[1], { idx, content: contentMatch[1] });
      }
    }
  });
  // console.log(annotMap);
  return annotMap;
};
