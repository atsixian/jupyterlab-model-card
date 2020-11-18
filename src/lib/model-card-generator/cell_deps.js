var fs = require('fs');
var utils = require("./cell_utils.js");

var py = require("../lib/python-program-analysis/dist/es5");

function printDependencies(cells, printMode, dict, name, res_color_map, sources, sinks, cell_counts){

    let res = "";
    var dep_count = 0;
    var cfg_count = 0;

    for (let cell of cells){
        // cell.dependentOn.forEach(element =>
            //console.log(utils.printCell(element, printMode, dict) + " -> " + utils.printCell(cell.execution_count, printMode, dict)));
        cell.dependentOn.forEach(element =>
            dep_count += 1);
        cell.dependentOn.forEach(element =>
            res += (utils.printCell(element, printMode, dict) + " -> " + utils.printCell(cell.execution_count, printMode, dict) + '\n'));
    }

    res = dep_count + '\n' + res;
    res += res_color_map;
    res += sources + '\n';
    res += sinks + '\n';
    res += cell_counts;

    // res += '\n';

    // for (let cell of cells){
    //     cell.cfgdependentOn.forEach(element =>
    //         cfg_count += 1);
    //     cell.cfgdependentOn.forEach(element =>
    //         res += (utils.printCell(element, printMode, dict) + " -> " + utils.printCell(cell.execution_count, printMode, dict) + '\n'));
    // }
    // res += cfg_count;

    var new_name = name.split('/');
    new_name = new_name[new_name.length - 1].split(".ipynb")[0];
    console.log("NEW NAME ", new_name);



    fs.writeFile(__dirname + "/../assets/" + new_name + '_deps_and_labels_new.txt', res, function (err) {
      if (err) throw err;
      //console.log((new_name + '_deps_and_labels_new.txt') + ' saved!\n');

    });
}



module.exports = {
    calculateCells: function(name, printMode){
        const programSrc = fs.readFileSync(name).toString();
        const programJson = JSON.parse(programSrc);
        
        //dict is a dictionary pointing from execution_count to the corresponding cell 
        let dict = new Object();
        let cells = [];
        let text = "";

        let currentLine = 0;
        let currentLineNo = 0;
        let cell_counts = [];

        let map_from_line_to_label = new Object();
        // data collection -> red 
        // data cleaning -> yellow
        // data labeling -> green 
        // feature engineering -> blue
        // training -> purple
        // evaluation -> orange
        // model deployment -> pink

        var notebookCode = "";
        var res_color_map = "";

        if(programJson.cells == undefined){

            return;
        }

        var last_exe_cnt = -1;

        // relabel cells with no execution counts
        for (let cell of programJson.cells){
            
            // if((cell.execution_count == null) && (cell.cell_type === "code")){
            //     cell.execution_count = last_exe_cnt + 1;
            // }
            if(cell.execution_count == null){
                cell.execution_count = last_exe_cnt + 1;
            }
            last_exe_cnt = cell.execution_count;
        }

        var flag = false;
        var plt = "####@@@@";

        for (let cell of programJson.cells){

            if (cell.cell_type === 'code'){

                cell_counts.push(cell.execution_count);

                var sourceCode = "";

                for(let line of cell.source){
                    if(!((line[0] == '%') || (line[0] == '!'))){
                        sourceCode += line;
                    }
                    else{
                        sourceCode += '#' + line;
                    }

                    if(line.includes('import matplotlib.pyplot as')){
                        plt = line.split(" ")[3];
                        //console.log('plt is: ' + plt);
                        flag = true;
                    }


                    if((!line.includes('import ')) && flag && line.includes(plt)){
                        //console.log('entered plt\n');
                        map_from_line_to_label[currentLineNo] = 'plotting';
                        //console.log('label: plotting\n' + line + '\n');
                    }


                    if((!line.includes('import ')) && (!(line[0] == '#'))){
                    
                        if(line.includes('read_csv')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                            //console.log('label: data collection\n' + line + '\n');
                        }
                        //special case: consider improving this
                        else if(line.includes('scaler.fit')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('predict_proba')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('fit_predict')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('predict')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('accuracy_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('classification_report')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('confusion_matrix')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('f1_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('train_test_split')){
                            map_from_line_to_label[currentLineNo] = 'data labeling';
                            //console.log('label: data labeling\n' + line + '\n');
                        }
                        else if(line.includes('LinearRegression')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        // else if(line.includes('score')){
                        //     map_from_line_to_label[currentLineNo] = 'evaluation';
                        //     //console.log('label: evaluation\n' + line + '\n');
                        // }
                        else if(line.includes('permutation_importance')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('ColumnTransformer')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('OrdinalEncoder')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('HistGradientBoostingRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        // else if(line.includes('RandomizedSearchCV')){
                        //     map_from_line_to_label[currentLineNo] = 'model deployment';
                        //     //console.log('label: model deployment\n' + line + '\n');
                        // }
                        else if(line.includes('RandomizedSearchCV')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('make_classification')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                            //console.log('label: data collection\n' + line + '\n');
                        }
                        else if(line.includes('decision_function')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        // else if(line.includes('calibration_curve')){
                        //     map_from_line_to_label[currentLineNo] = 'model deployment';
                        //     //console.log('label: model deployment\n' + line + '\n');
                        // }
                        else if(line.includes('calibration_curve')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('LinearSVC')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('cross_val_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('RandomForestClassifier')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('GaussianNB')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        // else if(line.includes('CalibratedClassifierCV')){
                        //     map_from_line_to_label[currentLineNo] = 'model deployment';
                        //     //console.log('label: model deployment\n' + line + '\n');
                        // }
                        else if(line.includes('CalibratedClassifierCV')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('brier_score_loss')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('log_loss')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('fetch_lfw_people')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                            //console.log('label: data collection\n' + line + '\n');
                        }
                        else if(line.includes('PCA')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('SVC')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        // else if(line.includes('GridSearchCV')){
                        //     map_from_line_to_label[currentLineNo] = 'model deployment';
                        //     //console.log('label: model deployment\n' + line + '\n');
                        // }
                        else if(line.includes('GridSearchCV')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('fetch_20newsgroups')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                            //console.log('label: data collection\n' + line + '\n');
                        }
                        else if(line.includes('CountVectorizer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: data cleaning\n' + line + '\n');
                        }
                        else if(line.includes('HashingVectorizer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: data cleaning\n' + line + '\n');
                        }
                        else if(line.includes('TfidfVectorizer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: data cleaning\n' + line + '\n');
                        }
                        else if(line.includes('SGDClassifier')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('MLPClassifier')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('SimpleImputer')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                            //console.log('label: data cleaning\n' + line + '\n');
                        }
                        else if(line.includes('OneHotEncoder')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('GradientBoostingRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('fetch_california_housing')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                            //console.log('label: data collection\n' + line + '\n');
                        }
                        else if(line.includes('StandardScaler')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('scale')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('TransformedTargetRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('make_pipeline')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('PolynomialFeatures')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('RandomForestRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('enable_hist_gradient_boosting')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('plot_partial_dependence')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('XGBRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('make_column_transformer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('DecisionTreeClassifier')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('learning_curve')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('validation_curve')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('GradientBoostingClassifier')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('roc_auc_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('precision_recall_curve')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('BaseEstimator')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('TransformerMixin')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('clone')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('LabelBinarizer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('LogisticRegression')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('QuantileTransformer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('load_iris')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                            //console.log('label: data collection\n' + line + '\n');
                        }
                        else if(line.includes('Perceptron')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('make_blobs')){
                            map_from_line_to_label[currentLineNo] = 'data labeling';
                            //console.log('label: data labeling\n' + line + '\n');
                        }
                        else if(line.includes('DBSCAN')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('normalized_mutual_info_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('adjusted_rand_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('MiniBatchKMeans')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('KMeans')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('Birch')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('silhouette_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('.plot')){
                            map_from_line_to_label[currentLineNo] = 'plotting';
                            //console.log('label: plotting\n' + line + '\n');
                        }
                        else if(line.includes('.show')){
                            map_from_line_to_label[currentLineNo] = 'plotting';
                            //console.log('label: plotting\n' + line + '\n');
                        }
                        else if(line.includes('plt')){
                            map_from_line_to_label[currentLineNo] = 'plotting';
                            //console.log('label: plotting\n' + line + '\n');
                        }
                        else if(line.includes('MultinomialNB')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('BernoulliNB')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('ComplementNB')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('TfidfTransformer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('LabelEncoder')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('ShuffleSplit')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('make_scorer')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('recall_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('roc_curve')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('auc')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('roc_auc_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('LogisticRegressionCV')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('ParameterSampler')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('RBFSampler')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('DictVectorizer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('ParameterGrid')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('SelectFromModel')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('BernoulliRBM')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('mean_squared_error')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('StratifiedKFold')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('RFECV')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('feature_importances_')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            // console.log(line);
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('KNeighborsClassifier')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('KNeighborsRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('DecisionTreeRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('load_digits')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('load_breast_cancer')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('KFold')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('LeaveOneOut')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('BaggingClassifier')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('BaggingRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('AgglomerativeClustering')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('FeatureAgglomeration')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }






                        // newly added labelings for pandas lib
                        else if(line.includes('read_csv')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('read_table')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('read_excel')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('read_sql')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('read_json')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('read_html')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('read_clipboard')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('Datarame')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('.DatetimeIndex')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('.DataFrame')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('.head')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.tail')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.shape')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.info')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.describe')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.value_counts')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.apply')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.loc')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.iloc')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.columns')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        else if(line.includes('.isnull')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        else if(line.includes('.notnull')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        else if(line.includes('.dropna')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        else if(line.includes('.fillna')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        else if(line.includes('.astype')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        // else if(line.includes('.replace')){
                        //     map_from_cell_to_labels[cell.execution_count].add('data cleaning');
                        //     map_from_label_to_line_nums['data cleaning'] += 1;
                        // }
                        else if(line.includes('.rename')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        else if(line.includes('.set_index')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        else if(line.includes('.sort_values')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.groupby')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.pivot_table')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        // else if(line.includes('.append')){
                        //     map_from_cell_to_labels[cell.execution_count].add('data exploration');
                        //     map_from_label_to_line_nums['data exploration'] += 1;
                        // }
                        else if(line.includes('pd.concat')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                    }
                    

                    if(currentLineNo in map_from_line_to_label){
                        if(map_from_line_to_label[currentLineNo] == 'data collection'){
                            res_color_map += (cell.execution_count + '->' + 'red' + '\n');
                        }
                        else if(map_from_line_to_label[currentLineNo] == 'data cleaning'){
                            res_color_map += (cell.execution_count + '->' + 'yellow' + '\n');
                        }
                        else if(map_from_line_to_label[currentLineNo] == 'data labeling'){
                            res_color_map += (cell.execution_count + '->' + 'green' + '\n');
                        }
                        else if(map_from_line_to_label[currentLineNo] == 'feature engineering'){
                            res_color_map += (cell.execution_count + '->' + 'blue' + '\n');
                        }
                        else if(map_from_line_to_label[currentLineNo] == 'training'){
                            res_color_map += (cell.execution_count + '->' + 'purple' + '\n');
                            
                        }
                        else if(map_from_line_to_label[currentLineNo] == 'evaluation'){
                            res_color_map += (cell.execution_count + '->' + 'orange' + '\n');
                        }
                        // else if(map_from_line_to_label[currentLineNo] == 'model deployment'){
                        //     res_color_map += (cell.execution_count + '->' + 'pink' + '\n');
                        // }
                        else if(map_from_line_to_label[currentLineNo] == 'plotting'){
                            res_color_map += (cell.execution_count + '->' + 'lightblue' + '\n');
                        }
                        else if(map_from_line_to_label[currentLineNo] == 'data exploration'){
                            res_color_map += (cell.execution_count + '->' + 'pink' + '\n');
                        }

                    }

                    currentLineNo += 1;
                }


                notebookCode += sourceCode + '\n';

                let cellLength = cell.source.length;
                cell.lineNos = [currentLine, currentLine + cellLength - 1];
                cell.dependentOn = [];
                cell.cfgdependentOn = [];

                currentLine += cellLength;
                cells.push(cell);
                dict[cell.execution_count] = cell;
            }
        }

        // console.log('enter cfg!!!');
        // let cfg = utils.getControlFlow(notebookCode);
        // let blocks = cfg.blocks;

        // for(let block of blocks){
        //     if(block !== cfg.exit){
        //         let block_stmts = block.statements;

        //         let succ = cfg.getSuccessors(block);
        //         if(block_stmts[block_stmts.length - 1] == undefined){
        //             continue;
        //         }

        //         let from_line_no = block_stmts[block_stmts.length - 1].location.first_line -1;
        //         console.log(from_line_no+': '+ py.printNode(block_stmts[block_stmts.length - 1]) + '->');

        //         for(let succ_block of succ){
        //             let succ_stmts = succ_block.statements;
        //             if(succ_stmts[0] == undefined){
        //                 continue;
        //             }
        //             let to_line_no = succ_stmts[0].location.first_line - 1;

        //             console.log(to_line_no +': '+ py.printNode(succ_stmts[0]) + '\n');

        //             let cfg_pred;
        //             let cfg_succ;

        //             cells.forEach(function(item){
        //                 if (utils.isInCellBoundaries(from_line_no, item.lineNos)){
        //                     cfg_pred = item;
        //                 } 
        //                 else if (utils.isInCellBoundaries(to_line_no, item.lineNos)){
        //                     cfg_succ = item;
        //                 }
        //             });

        //             if (cfg_succ !== undefined && cfg_pred !== undefined && !cfg_succ.cfgdependentOn.includes(cfg_pred.execution_count)){

        //                 cfg_succ.cfgdependentOn.push(cfg_pred.execution_count);
        //             }

        //         }
        //     }
        // }


        // console.log('leave cfg!!!');

        flows = utils.getDefUse(notebookCode);

        // var new_name = '.' + name.split('.')[1];
        // fs.writeFile((new_name + '_no_comments.py'), notebookCode, function (err) {
        //   if (err) throw err;
        // });


        // cells.forEach(function(item){
        //     //console.log(item.execution_count);
        //     //console.log(item.source.length);
        //     //console.log(item.lineNos[0] + ", " + item.lineNos[1]);
        // })

        for (let flow of flows.items) {
            if((py.printNode(flow.toNode) != undefined) &&(py.printNode(flow.toNode)).includes('.fit')){

                let toNode_cell = 0;
                let toNodeLineNo = flow.toNode.location.first_line - 1;

                for(let cell of cells){
                    if (utils.isInCellBoundaries(toNodeLineNo, cell.lineNos)){
                        toNode_cell = cell.execution_count;
                        break;
                    } 
                }

                let fromNodeLineNo = flow.fromNode.location.first_line - 1;

                if(fromNodeLineNo in map_from_line_to_label && map_from_line_to_label[fromNodeLineNo] == 'training'){
                    for(let cell of cells){
                        if (utils.isInCellBoundaries(fromNodeLineNo, cell.lineNos)){
                            res_color_map += (toNode_cell + '->' + 'purple' + '\n');
                            break;
                        } 
                    }
                }

                if(fromNodeLineNo in map_from_line_to_label && map_from_line_to_label[fromNodeLineNo] == 'feature engineering'){
                    for(let cell of cells){
                        if (utils.isInCellBoundaries(fromNodeLineNo, cell.lineNos)){
                            res_color_map += (toNode_cell + '->' + 'blue' + '\n');
                            break;
                        } 
                    }
                }

            }
        }


        let all_defs = [];
        let all_uses = [];

        for (let flow of flows.items) {
            let defCell;
            let useCell;

            let fromNodeLineNo = flow.fromNode.location.first_line;
            let toNodeLineNo = flow.toNode.location.first_line;

            //console.log(fromNodeLineNo-1 + ': ' + py.printNode(flow.fromNode) + '-->');
            //console.log(toNodeLineNo-1 + ': ' + py.printNode(flow.toNode));
            //console.log('\n\n');

            // ignore dependencies involving import statements
            if((py.printNode(flow.fromNode) != undefined) &&(py.printNode(flow.fromNode)).includes('import ')){
                continue;
            }
            

            // no self loops i.e. 5 -> 5
            cells.forEach(function(item){
                if (utils.isInCellBoundaries(fromNodeLineNo-1, item.lineNos)){
                    defCell = item;
                } 
                else if (utils.isInCellBoundaries(toNodeLineNo-1, item.lineNos)){
                    useCell = item;
                }
            })


            if(defCell && defCell.execution_count){
                //console.log('def cell exe count = ' + defCell.execution_count + '\n');
            }
            if(useCell && useCell.execution_count){
                //console.log('use cell exe count = ' + useCell.execution_count + '\n');
            }
            
    
            if (useCell !== undefined && defCell !== undefined && !useCell.dependentOn.includes(defCell.execution_count)){
                all_defs.push(defCell);
                all_uses.push(useCell);

                useCell.dependentOn.push(defCell.execution_count);
            }

            
        }




        let sources = [];
        let sinks = [];

        for(let cell of cells){
            if(!all_uses.includes(cell)){
                //console.log('not used: ');
                //console.log(cell.execution_count);
                sources.push(cell.execution_count);
            }

            if(!all_defs.includes(cell)){
                //console.log('not def: ');
                //console.log(cell.execution_count);
                sinks.push(cell.execution_count);
            }
        }
    

        //console.log("These are all of the cell dependency relations in the notebook");
        printDependencies(cells, printMode, dict, name, res_color_map, sources, sinks, cell_counts);


    },

    printLabels: function(name) {
        const programSrc = fs.readFileSync(name).toString();
        const programJson = JSON.parse(programSrc);

        //dict is a dictionary pointing from execution_count to the corresponding cell
        let dict = new Object();
        let cells = [];
        let text = "";

        let currentLine = 0;
        let currentLineNo = 0;
        let cell_counts = [];

        let map_from_line_to_label = new Object();
        // data collection -> red
        // data cleaning -> yellow
        // data labeling -> green
        // feature engineering -> blue
        // training -> purple
        // evaluation -> orange
        // model deployment -> pink

        var notebookCode = "";
        var res_color_map = "";

        if(programJson.cells == undefined){

            return;
        }

        var last_exe_cnt = -1;

        // relabel cells with no execution counts
        for (let cell of programJson.cells){
            if(cell.execution_count == null){
                cell.execution_count = last_exe_cnt + 1;
            }
            last_exe_cnt = cell.execution_count;
        }

        var flag = false;
        var plt = "####@@@@";

        for (let cell of programJson.cells){

            if (cell.cell_type === 'code'){
                cell_counts.push(cell.execution_count);
                var sourceCode = "";
                for(let line of cell.source){
                    if(!((line[0] == '%') || (line[0] == '!'))){
                        sourceCode += line;
                    }
                    else{
                        sourceCode += '#' + line;
                    }

                    if(line.includes('import matplotlib.pyplot as')){
                        plt = line.split(" ")[3];
                        //console.log('plt is: ' + plt);
                        flag = true;
                    }


                    if((!line.includes('import ')) && flag && line.includes(plt)){
                        //console.log('entered plt\n');
                        map_from_line_to_label[currentLineNo] = 'plotting';
                        //console.log('label: plotting\n' + line + '\n');
                    }


                    if((!line.includes('import ')) && (!(line[0] == '#'))){

                        if(line.includes('read_csv')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                            //console.log('label: data collection\n' + line + '\n');
                        }
                        //special case: consider improving this
                        else if(line.includes('scaler.fit')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('predict_proba')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('fit_predict')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('predict')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('accuracy_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('classification_report')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('confusion_matrix')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('f1_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('train_test_split')){
                            map_from_line_to_label[currentLineNo] = 'data labeling';
                            //console.log('label: data labeling\n' + line + '\n');
                        }
                        else if(line.includes('LinearRegression')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                            // else if(line.includes('score')){
                            //     map_from_line_to_label[currentLineNo] = 'evaluation';
                            //     //console.log('label: evaluation\n' + line + '\n');
                        // }
                        else if(line.includes('permutation_importance')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('ColumnTransformer')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('OrdinalEncoder')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('HistGradientBoostingRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                            // else if(line.includes('RandomizedSearchCV')){
                            //     map_from_line_to_label[currentLineNo] = 'model deployment';
                            //     //console.log('label: model deployment\n' + line + '\n');
                        // }
                        else if(line.includes('RandomizedSearchCV')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('make_classification')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                            //console.log('label: data collection\n' + line + '\n');
                        }
                        else if(line.includes('decision_function')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                            // else if(line.includes('calibration_curve')){
                            //     map_from_line_to_label[currentLineNo] = 'model deployment';
                            //     //console.log('label: model deployment\n' + line + '\n');
                        // }
                        else if(line.includes('calibration_curve')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('LinearSVC')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('cross_val_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('RandomForestClassifier')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('GaussianNB')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                            // else if(line.includes('CalibratedClassifierCV')){
                            //     map_from_line_to_label[currentLineNo] = 'model deployment';
                            //     //console.log('label: model deployment\n' + line + '\n');
                        // }
                        else if(line.includes('CalibratedClassifierCV')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('brier_score_loss')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('log_loss')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('fetch_lfw_people')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                            //console.log('label: data collection\n' + line + '\n');
                        }
                        else if(line.includes('PCA')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('SVC')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                            // else if(line.includes('GridSearchCV')){
                            //     map_from_line_to_label[currentLineNo] = 'model deployment';
                            //     //console.log('label: model deployment\n' + line + '\n');
                        // }
                        else if(line.includes('GridSearchCV')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('fetch_20newsgroups')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                            //console.log('label: data collection\n' + line + '\n');
                        }
                        else if(line.includes('CountVectorizer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: data cleaning\n' + line + '\n');
                        }
                        else if(line.includes('HashingVectorizer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: data cleaning\n' + line + '\n');
                        }
                        else if(line.includes('TfidfVectorizer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: data cleaning\n' + line + '\n');
                        }
                        else if(line.includes('SGDClassifier')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('MLPClassifier')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('SimpleImputer')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                            //console.log('label: data cleaning\n' + line + '\n');
                        }
                        else if(line.includes('OneHotEncoder')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('GradientBoostingRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('fetch_california_housing')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                            //console.log('label: data collection\n' + line + '\n');
                        }
                        else if(line.includes('StandardScaler')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('scale')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('TransformedTargetRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('make_pipeline')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('PolynomialFeatures')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('RandomForestRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('enable_hist_gradient_boosting')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('plot_partial_dependence')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('XGBRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('make_column_transformer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('DecisionTreeClassifier')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('learning_curve')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('validation_curve')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('GradientBoostingClassifier')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('roc_auc_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('precision_recall_curve')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('BaseEstimator')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('TransformerMixin')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('clone')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('LabelBinarizer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('LogisticRegression')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('QuantileTransformer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('load_iris')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                            //console.log('label: data collection\n' + line + '\n');
                        }
                        else if(line.includes('Perceptron')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('make_blobs')){
                            map_from_line_to_label[currentLineNo] = 'data labeling';
                            //console.log('label: data labeling\n' + line + '\n');
                        }
                        else if(line.includes('DBSCAN')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('normalized_mutual_info_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('adjusted_rand_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('MiniBatchKMeans')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('KMeans')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('Birch')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('silhouette_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('.plot')){
                            map_from_line_to_label[currentLineNo] = 'plotting';
                            //console.log('label: plotting\n' + line + '\n');
                        }
                        else if(line.includes('.show')){
                            map_from_line_to_label[currentLineNo] = 'plotting';
                            //console.log('label: plotting\n' + line + '\n');
                        }
                        else if(line.includes('plt')){
                            map_from_line_to_label[currentLineNo] = 'plotting';
                            //console.log('label: plotting\n' + line + '\n');
                        }
                        else if(line.includes('MultinomialNB')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('BernoulliNB')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('ComplementNB')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('TfidfTransformer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('LabelEncoder')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('ShuffleSplit')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('make_scorer')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('recall_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('roc_curve')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('auc')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('roc_auc_score')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('LogisticRegressionCV')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('ParameterSampler')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('RBFSampler')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('DictVectorizer')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('ParameterGrid')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('SelectFromModel')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('BernoulliRBM')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('mean_squared_error')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('StratifiedKFold')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('RFECV')){
                            map_from_line_to_label[currentLineNo] = 'feature engineering';
                            //console.log('label: feature engineering\n' + line + '\n');
                        }
                        else if(line.includes('feature_importances_')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            // console.log(line);
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('KNeighborsClassifier')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('KNeighborsRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('DecisionTreeRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('load_digits')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('load_breast_cancer')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('KFold')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('LeaveOneOut')){
                            map_from_line_to_label[currentLineNo] = 'evaluation';
                            //console.log('label: evaluation\n' + line + '\n');
                        }
                        else if(line.includes('BaggingClassifier')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('BaggingRegressor')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('AgglomerativeClustering')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }
                        else if(line.includes('FeatureAgglomeration')){
                            map_from_line_to_label[currentLineNo] = 'training';
                            //console.log('label: training\n' + line + '\n');
                        }






                        // newly added labelings for pandas lib
                        else if(line.includes('read_csv')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('read_table')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('read_excel')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('read_sql')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('read_json')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('read_html')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('read_clipboard')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('Datarame')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('.DatetimeIndex')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('.DataFrame')){
                            map_from_line_to_label[currentLineNo] = 'data collection';
                        }
                        else if(line.includes('.head')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.tail')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.shape')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.info')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.describe')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.value_counts')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.apply')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.loc')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.iloc')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.columns')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        else if(line.includes('.isnull')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        else if(line.includes('.notnull')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        else if(line.includes('.dropna')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        else if(line.includes('.fillna')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        else if(line.includes('.astype')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                            // else if(line.includes('.replace')){
                            //     map_from_cell_to_labels[cell.execution_count].add('data cleaning');
                            //     map_from_label_to_line_nums['data cleaning'] += 1;
                        // }
                        else if(line.includes('.rename')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        else if(line.includes('.set_index')){
                            map_from_line_to_label[currentLineNo] = 'data cleaning';
                        }
                        else if(line.includes('.sort_values')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.groupby')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                        else if(line.includes('.pivot_table')){
                            map_from_line_to_label[currentLineNo] = 'data exploration';
                        }
                            // else if(line.includes('.append')){
                            //     map_from_cell_to_labels[cell.execution_count].add('data exploration');
                            //     map_from_label_to_line_nums['data exploration'] += 1;
                        // }
                        else if(line.includes('pd.concat')){
                                map_from_line_to_label[currentLineNo] = 'data exploration';
                            }
                    }


                    if(currentLineNo in map_from_line_to_label){
                        if(map_from_line_to_label[currentLineNo] == 'data collection'){
                            res_color_map += (cell.execution_count + '->' + 'red' + '\n');
                        }
                        else if(map_from_line_to_label[currentLineNo] == 'data cleaning'){
                            res_color_map += (cell.execution_count + '->' + 'yellow' + '\n');
                        }
                        else if(map_from_line_to_label[currentLineNo] == 'data labeling'){
                            res_color_map += (cell.execution_count + '->' + 'green' + '\n');
                        }
                        else if(map_from_line_to_label[currentLineNo] == 'feature engineering'){
                            res_color_map += (cell.execution_count + '->' + 'blue' + '\n');
                        }
                        else if(map_from_line_to_label[currentLineNo] == 'training'){
                            res_color_map += (cell.execution_count + '->' + 'purple' + '\n');

                        }
                        else if(map_from_line_to_label[currentLineNo] == 'evaluation'){
                            res_color_map += (cell.execution_count + '->' + 'orange' + '\n');
                        }
                            // else if(map_from_line_to_label[currentLineNo] == 'model deployment'){
                            //     res_color_map += (cell.execution_count + '->' + 'pink' + '\n');
                        // }
                        else if(map_from_line_to_label[currentLineNo] == 'plotting'){
                            res_color_map += (cell.execution_count + '->' + 'lightblue' + '\n');
                        }
                        else if(map_from_line_to_label[currentLineNo] == 'data exploration'){
                            res_color_map += (cell.execution_count + '->' + 'pink' + '\n');
                        }

                    }

                    currentLineNo += 1;
                }


                notebookCode += sourceCode + '\n';

                let cellLength = cell.source.length;
                cell.lineNos = [currentLine, currentLine + cellLength - 1];
                cell.dependentOn = [];
                cell.cfgdependentOn = [];

                currentLine += cellLength;
                cells.push(cell);
                dict[cell.execution_count] = cell;
            }
        }

        flows = utils.getDefUse(notebookCode);

        for (let flow of flows.items) {
            if((py.printNode(flow.toNode) != undefined) &&(py.printNode(flow.toNode)).includes('.fit')){

                let toNode_cell = 0;
                let toNodeLineNo = flow.toNode.location.first_line - 1;

                for(let cell of cells){
                    if (utils.isInCellBoundaries(toNodeLineNo, cell.lineNos)){
                        toNode_cell = cell.execution_count;
                        break;
                    }
                }

                let fromNodeLineNo = flow.fromNode.location.first_line - 1;

                if(fromNodeLineNo in map_from_line_to_label && map_from_line_to_label[fromNodeLineNo] == 'training'){
                    for(let cell of cells){
                        if (utils.isInCellBoundaries(fromNodeLineNo, cell.lineNos)){
                            res_color_map += (toNode_cell + '->' + 'purple' + '\n');
                            break;
                        }
                    }
                }

                if(fromNodeLineNo in map_from_line_to_label && map_from_line_to_label[fromNodeLineNo] == 'feature engineering'){
                    for(let cell of cells){
                        if (utils.isInCellBoundaries(fromNodeLineNo, cell.lineNos)){
                            res_color_map += (toNode_cell + '->' + 'blue' + '\n');
                            break;
                        }
                    }
                }

            }
        }
    return res_color_map

    }
}

