import React, { PureComponent } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';

// const oldCode = `
// const a = 10
// const b = 10
// const c = () => console.log('foo')

// if(a > 10) {
//   console.log('bar')
// }

// console.log('done')
// `;
// const newCode = `
// const a = 10
// const boo = 10

// if(a === 10) {
//   console.log('bar')
// }
// `;

const oldCode = `
Model Name: happy model
`;
const newCode = `
Model Name: sad model
`;

export default class Diff extends PureComponent {
  render = (): JSX.Element => {
    return (
      <ReactDiffViewer
        oldValue={oldCode}
        newValue={newCode}
        splitView={false}
        compareMethod={DiffMethod.WORDS}
      />
    );
  };
}
// export default () => (
//   <ReactDiffViewer oldValue={oldCode} newValue={newCode} splitView={false} />
// );
