/* eslint-disable @typescript-eslint/no-unused-vars */
import { Notebook } from '@jupyterlab/notebook';
import { Button } from 'antd';
import { enableMapSet } from 'immer';
import React, { useState, useEffect } from 'react';
import { useImmer } from 'use-immer';
import { stages } from '../constants';
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
  sectionContent: ISchemaItem | ISchemaStageItem;
  quickFix: React.ReactNode;
}

const getJumpIndex = (sectionName: string, sectionContent: any): number => {
  if (sectionName === 'author') {
    return 1;
  }
  // if it's a stage, jump to the top cell if existed
  if (stages.has(sectionName) && sectionContent['cell_ids'].length > 0) {
    return sectionContent['cell_ids'][0];
  }
  // otherwise insert to bottom
  return Infinity;
};

const SectionContent: React.FC<ISectionContent> = ({
  notebook,
  sectionContent,
  quickFix
}: ISectionContent) => {
  if (typeof sectionContent !== 'object') {
    return null;
  }
  return (
    <>
      <h1>
        {sectionContent.title} {quickFix}
      </h1>
      <p>{sectionContent.description}</p>
      {'cell_ids' in sectionContent
        ? sectionContent.cell_ids.map((cid: number, idx: number) => (
            <Button key={idx} onClick={(): void => jumpToCell(notebook, cid)}>
              {cid}
            </Button>
          ))
        : null}
      {'figures' in sectionContent
        ? sectionContent.figures.map((src: string, idx: number) => (
            <img key={idx} src={`data:image/png;base64,${src}`} />
          ))
        : null}
    </>
  );
};

const Section: React.FC<ISectionProps> = ({ notebook }: ISectionProps) => {
  const [annotMap, updateAnnotMap] = useImmer<AnnotMap>(new Map());
  const [data, updateData] = useState<ISchema>({} as ISchema);

  useEffect(() => {
    // console.log('updated map', amap);
    const amap = getAnnotMap(notebook);
    console.log(amap);
    updateAnnotMap(() => amap);
    const modelCard: any = generateModelCard(notebook.model.toJSON());

    amap.forEach((value, key) => {
      if (key in data) {
        modelCard[key]['description'] = value.content;
      }
    });
    console.log(modelCard);
    updateData(modelCard);
  }, [notebook]);

  return (
    <>
      {Object.entries(data).map(
        ([sectionName, sectionContent]: [string, ISchemaItem], idx: number) => (
          <SectionContent
            key={idx}
            notebook={notebook}
            sectionContent={sectionContent}
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
        )
      )}
    </>
  );
};

export default Section;
