import { ISchema, ISchemaItem, ISchemaStageItem } from '../components/Section';

/**
 * Generate Markdown for a given model card
 */
export const generateMarkdown = (data: ISchema): string => {
  let result = '';
  Object.entries(data).forEach(
    ([sectionName, sectionContent]: [string, ISchemaStageItem]) => {
      if (sectionName === 'misc') {
        return;
      }
      if (sectionName === 'modelname') {
        result += `${sectionContent.description}\n`;
        return;
      }

      const hasDescription =
        sectionContent.description && sectionContent.description.trim();
      const hasFigure = sectionContent.figures && sectionContent.figures.length;
      if (hasDescription || hasFigure) {
        result += `## ${sectionContent.title}\n`;
      }
      if (hasDescription) {
        result += `${sectionContent.description}\n`;
      }
      if (hasFigure) {
        sectionContent.figures.forEach(
          (figure, idx) =>
            // (result += `![figure${idx}](data:image/png;base64,${figure}`)
            (result += `<img alt="figure${idx}" src="data:image/png;base64,${figure}">\n`)
        );
      }
    }
  );
  return result;
};
