export const modelCardWidgetID = 'model-card';
export const commandCreate = 'create-model-card';
export const commandModifyStage = 'modify-model-card-stage';
/** Stage keys for quickfix */
export const stages = new Map([
  ['plotting', 'Plotting'],
  ['datacleaning', 'Data Cleaning'],
  ['preprocessing', 'Preprocessing'],
  ['hyperparameters', 'Hyperparameters'],
  ['modeltraining', 'Model Training'],
  ['modelevaluation', 'Model Evaluation'],
  ['misc', 'Ignore']
]);
