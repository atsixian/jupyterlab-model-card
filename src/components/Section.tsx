/* eslint-disable @typescript-eslint/no-unused-vars */
import { Notebook } from '@jupyterlab/notebook';
import { Button } from 'antd';
import { enableMapSet } from 'immer';
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import { useImmer } from 'use-immer';
import { endTag, stages, startTag } from '../constants';
import { generateModelCard } from '../lib/model-card-generator/main';
import { AnnotMap, getAnnotMap } from '../util/mdExtractor';
import { jumpToCell } from '../util/notebook_private';
import QuickFix from './QuickFix';

enableMapSet();

interface ISectionProps {
  notebook: Notebook;
}

/** Items in the generated model card */
interface ISchemaItem {
  /** title of the section */
  title: string;
  /** customized description */
  description: string;
}
interface ISchemaStageItem extends ISchemaItem {
  cell_ids: number[];
  figures: string[];
}
interface ISchema {
  modelname: { title: string };
  author: ISchemaItem;
  dataset: ISchemaItem;
  references: ISchemaItem;
  libraries: ISchemaItem;
  plotting: ISchemaStageItem;
  datacleaning: ISchemaStageItem;
  preprocessing: ISchemaStageItem;
  hyperparameters: ISchemaStageItem;
  modeltraining: ISchemaStageItem;
  modelevaluation: ISchemaStageItem;
  misc: ISchemaItem;
}
interface ISectionContent {
  notebook: Notebook;
  sectionName: string;
  sectionContent: ISchemaItem | ISchemaStageItem;
  quickFix: React.ReactNode;
  updateData: Function;
}

const getJumpIndex = (sectionName: string, sectionContent: any): number => {
  if (sectionName === 'author') {
    return 1;
  }
  // if it's a stage, jump to the top cell if existed
  if (stages.has(sectionName) && sectionContent.cell_ids.length > 0) {
    return sectionContent.cell_ids[0];
  }
  // otherwise insert to bottom
  return Infinity;
};

const Bar = styled.div`
  position: relative;
  background: aliceblue;
  width: 40%;
  height: 40px;
  border-radius: 10px;
`;

const VerticalLine: any = styled.div`
  position: absolute;
  left: ${(props: any): string => props.left}%;
  height: 100%;
  width: 5px;
  background-color: lightskyblue;
  border-radius: 15px;
  transition: transform 0.2s, background-color 0.2s;

  &:hover {
    transform: scale(3, 1.5);
    background-color: #1890ff;
    z-index: 2;
    cursor: pointer;
  }
`;

const SectionContent: React.FC<ISectionContent> = ({
  notebook,
  sectionName,
  sectionContent,
  quickFix,
  updateData
}: ISectionContent) => {
  if (typeof sectionContent !== 'object') {
    return null;
  }
  return (
    <>
      <>
        <h1>
          {sectionContent.title} {quickFix}
        </h1>
        <ReactMarkdown>{sectionContent.description}</ReactMarkdown>
        <div style={{ display: 'block' }}>
          {sectionName !== 'modelname' &&
          'cell_ids' in sectionContent &&
          sectionContent.cell_ids.length > 0 ? (
            <Bar>
              {sectionContent.cell_ids.map((cid: number, idx: number) => (
                <VerticalLine
                  key={idx}
                  left={(cid / notebook.model.cells.length) * 100}
                  onClick={(): void => jumpToCell(notebook, cid)}
                />
              ))}
            </Bar>
          ) : null}
        </div>
        {'figures' in sectionContent
          ? sectionContent.figures.map((src: string, idx: number) => (
              <img
                style={{ display: 'block' }}
                key={idx}
                src={`data:image/png;base64,${src}`}
              />
            ))
          : null}
      </>
    </>
  );
};

const Section: React.FC<ISectionProps> = ({ notebook }: ISectionProps) => {
  const [annotMap, updateAnnotMap] = useImmer<AnnotMap>(new Map());
  const [data, updateData] = useImmer<ISchema>({} as ISchema);

  useEffect(() => {
    // console.log('updated map', amap);
    const amap = getAnnotMap(notebook);
    console.log(amap);
    const modelCard: any = generateModelCard(notebook.model.toJSON());

    amap.forEach((value, key) => {
      if (key in modelCard) {
        modelCard[key]['description'] = value.content;
      }
    });
    updateData(() => modelCard);

    // Add tag for title field
    const titleKey = 'modelname';
    if (
      modelCard[titleKey]['description'] !== undefined &&
      !amap.has(titleKey)
    ) {
      const titleCell = notebook.model.cells.get(0).value;
      titleCell.insert(0, `${startTag(titleKey)}\n`);
      titleCell.insert(titleCell.text.length, `\n${endTag(titleKey)}`);
      amap.set(titleKey, {
        idx: 0,
        content: modelCard[titleKey]['description']
      });
    }
    updateAnnotMap(() => amap);
  }, [notebook]);

  return (
    <>
      <div
        style={{ position: 'absolute', top: 10, right: 10, overflow: 'hidden' }}
      >
        <Button
          type="primary"
          style={{ position: 'sticky', top: 10 }}
          onClick={() => console.log(data)}
        >
          Export to MD
        </Button>
      </div>
      {Object.entries(data).map(
        ([sectionName, sectionContent]: [string, ISchemaItem], idx: number) => {
          if (sectionName === 'misc') {
            return null;
          }
          return (
            <SectionContent
              key={idx}
              notebook={notebook}
              sectionName={sectionName}
              sectionContent={sectionContent}
              updateData={updateData}
              quickFix={
                <QuickFix
                  sectionName={sectionName}
                  sectionTitle={sectionContent.title}
                  annotMap={annotMap}
                  updateAnnotMap={updateAnnotMap}
                  notebook={notebook}
                  idx={getJumpIndex(sectionName, sectionContent)}
                />
              }
            />
          );
        }
      )}
    </>
  );
};

export default Section;
