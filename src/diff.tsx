import React, { PureComponent } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';

interface IDiffProps {
  oldValue: string;
  newValue: string;
  oldLines: string[];
  newLines: string[];
  setOldLines: Function;
  setNewLines: Function;
  setNewContent: Function;
  setOldContent: Function;
}

export const constructLines = (value: string): string[] => {
  const lines = value.split('\n');
  const isAllEmpty = lines.every((val): boolean => !val);
  if (isAllEmpty) {
    // This is to avoid added an extra new line in the UI.
    if (lines.length === 2) {
      return [];
    }
    lines.pop();
    return lines;
  }

  const lastLine = lines[lines.length - 1];
  const firstLine = lines[0];
  // Remove the first and last element if they are new line character. This is
  // to avoid addition of extra new line in the UI.
  if (!lastLine) {
    lines.pop();
  }
  if (!firstLine) {
    lines.shift();
  }
  return lines;
};

const DiffViewer: React.FC<IDiffProps> = props => (
  <ReactDiffViewer
    oldValue={props.oldValue}
    newValue={props.newValue}
    splitView={false}
    showDiffOnly={false}
    compareMethod={DiffMethod.WORDS}
    onLineNumberClick={(lineId: string): void => {
      const [type, id] = lineId.split('-');
      if (type === 'L') {
        // use the old content
        props.setNewLines((lines: string[]) => {
          const temp = lines.map((line, idx) => {
            if (idx === Number(id) - 1) {
              return props.oldLines[idx];
            }
            return line;
          });
          props.setNewContent(temp.join('\n'));
          return temp;
        });
      } else if (type === 'undefined') {
        // use the new content
        props.setOldLines((lines: string[]) => {
          const temp = lines.map((line, idx) => {
            if (idx === Number(id) - 1) {
              return props.newLines[idx];
            }
            return line;
          });
          props.setOldContent(temp.join('\n'));
          return temp;
        });
      }
    }}
  />
);

export default DiffViewer;
