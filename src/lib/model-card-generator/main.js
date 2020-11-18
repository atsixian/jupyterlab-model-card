"use strict";
// exports.__esModule = true;


/**
 * Want markdown cells to have IDs
 * Want to add cell_ids for provenance of everything
 * **/

// COMMAND: node main.js ../assets/News_Categorization_MNB.ipynb

var py = require("@andrewhead/python-program-analysis");
var graphing = require("./Graph.js").Graph;
// var fs = require('fs');
// var path = require('path');
var ic = require("./infocell");
var dep = require("./cell_deps.js");


// var args = process.argv.slice(2);
// var filePath = args[0];
var countLines = 0;


class ModelCard {
    constructor() {
        this.JSONSchema = {
            modelname:{title:"", Filename:"", cell_ids:[]},
            author:{title:"Author"},
            dataset: {title: "Dataset", description:"", links:""},
            references: {title:"References", links:[]},
            libraries:{title:"Libraries Used", lib:[]},
            misc:{title:"Miscellaneous", cell_ids:[], cells:[], lineNumbers:[], source:"", markdown:"", imports:[], functions:"", figures:[], description:"", outputs:[]},
            plotting:{title:"Plotting", cell_ids:[], cells:[], lineNumbers:[], source:"", markdown:"", imports:[], functions:"", figures:[], description:"", outputs:[]},
            datacleaning:{title:"Data Cleaning", cell_ids:[], cells:[], lineNumbers:[], source:"", markdown:"", imports:[], functions:"", figures:[], description:"", outputs:[]},
            preprocessing:{title:"Preprocessing", cell_ids:[], cells:[], lineNumbers:[], source:"", markdown:"", imports:[], functions:"", figures:[], description:"", outputs:[]},
            hyperparameters:{title:"Hyperparameters", cell_ids:[], cells:[], lineNumbers:[], source:"", markdown:"", values:""},
            modeltraining:{title:"Model Training", cell_ids:[], cells:[], lineNumbers:[], source:"", markdown:"", imports:[], functions:"", figures:[], description:"", outputs:[]},
            modelevaluation:{title:"Evaluation", cell_ids:[], cells:[], lineNumbers:[], source:"", markdown:"", imports:[], functions:"", figures:[], description:"", outputs:[]}
        }
        this.markdown = [];
        this.intended_use = "";
        this.ethical_considerations = "";
        this.developer_comments = "";
    }

    getStageLineNumbers(stage_name) {
        return this.JSONSchema[stage_name]["lineNumbers"];
    }
    getDCLineNumbers() {
        return this.JSONSchema["datacleaning"]["lineNumbers"];
    }
    getPPLineNumbers() {
        return this.JSONSchema["preprocessing"]["lineNumbers"];
    }
    getMTLineNumbers() {
        return this.JSONSchema["modeltraining"]["lineNumbers"];
    }
    getMELineNumbers() {
        return this.JSONSchema["modelevaluation"]["lineNumbers"];
    }
}
var model_card = new ModelCard();


function createCell(text, executionCount, output) {
    return new ic.InfoCell(text, executionCount, output);
}

function convertColorToLabel(content) {
    // data collection -> red
    // data cleaning -> yellow
    // data labeling -> green
    // feature engineering -> lightblue
    // training -> purple
    // evaluation -> orange
    // model deployment -> pink

    var color_map = dep.printLabels(content);

    //var colourFile = fs.readFileSync(path.resolve(__dirname, filePath.split(".ipynb")[0] + "_deps_and_labels_new.txt"), "utf8");
    var mapObj = {red:"Data collection",yellow:"Data cleaning",
        green:"Data labelling", "lightblue":"Plotting", "blue":"Feature Engineering",
        purple:"Training", orange:"Evaluation", pink:"Model deployment"};

    var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
    color_map = color_map.replace(re, function(matched){
        return mapObj[matched];
    });

    // fs.writeFile((__dirname + "/../assets/" + filePath.split(".ipynb")[0] + '_labels.txt'), color_map,
    //     function (err) {
    //         if (err) throw err;
    //         console.log('Labels file saved!');
    //     });

    color_map = color_map.split("\n");
    var new_color_map = {};

    for (let element of color_map) {
        element = element.split("->");
        new_color_map[element[0]] = element[1];
    }

    return new_color_map;
}

function readCells(content, new_color_map) {
    // ## Section  in Markdown
    // var contents = fs.readFileSync(path.resolve(__dirname, filePath));
    // let jsondata = JSON.parse(content);
    let jsondata = content;
    var notebookCode = "\n";
    var notebookMarkdown = "\n";
    const rewriter = new py.MagicsRewriter();
    var currStage = "misc";
    let id_count = -1;
    let flag = true;
    let programbuilder = new py.ProgramBuilder();
    // model_card.JSONSchema["modelname"]["Filename"] = filePath.split("/").slice(-1).toString();
    // TODO get name for the file with docManager
    model_card.JSONSchema["modelname"]["Filename"] = "hello";
    // console.log();
    // fs.mkdirSync("../example/" + model_card.JSONSchema["modelname"]["Filename"], { recursive: true })

    for (let cell of jsondata['cells']) {
        let sourceCode = "";
        if (cell['cell_type'] === 'markdown') {
            model_card.JSONSchema[currStage]["markdown"] += "\n" + cell['source'];
            for (let mdline of cell['source']) {
                var matches = mdline.match(/\bhttps?:\/\/[\S][^)]+/gi);
                if (matches !== null) {
                    model_card.JSONSchema["references"]["links"] = model_card.JSONSchema["references"]["links"].concat(matches);
                }
            }
            if (id_count == -1 && flag) {
                flag = false;
                model_card.JSONSchema["modelname"]["title"] = cell['source'][0];
            }
            id_count += 1;

        } else if (cell['source'][0] != undefined){
            id_count += 1;
            var key = cell['execution_count'].toString();
            if (key in new_color_map) {
                var stage = new_color_map[key];
                if (stage == "Data collection" || stage == "Data cleaning" || stage == "Data labelling") {
                    currStage = "datacleaning";
                } else if (stage == "Feature Engineering") {
                    currStage = "preprocessing";
                } else if (stage == "Training") {
                    currStage = "modeltraining";
                } else if (stage == "Evaluation") {
                    currStage = "modelevaluation";
                } else if (stage == "Plotting") {
                    currStage = "plotting";
                }
            }

            for (let line of cell['source']) {
                if (line[0] === "%") {
                    line = rewriter.rewriteLineMagic(line);
                    line = '#' + line;
                }
                countLines += 1;
                model_card.JSONSchema[currStage]["lineNumbers"].push(countLines);
                sourceCode += line;
            }
            notebookCode += sourceCode + '\n';
            let code_cell = createCell(sourceCode, cell['execution_count'], cell['outputs'][0]);
            //console.log(ic.printInfoCell(code_cell));
            //console.log("OUTPUT: ", cell["outputs"]);
            if (cell["outputs"].length != 0) {
                for (let output in cell["outputs"]) {
                    //model_card.outputs[code_cell.persistentId] += output;
                    if (cell["outputs"][output]['output_type'] == 'display_data') {
                        var bitmap = new Buffer.from(cell["outputs"][output]['data']['image/png'], 'base64');
                        // TODO figure out how to embed images in notebook
                        // fs.writeFileSync(__dirname + "/../example/" + model_card.JSONSchema["modelname"]["Filename"] + "/" + code_cell.persistentId + ".jpg", bitmap);
                        // var image = "![Hello World](data:image/png;base64," + cell["outputs"][output]['data']['image/png'];
                        //console.log(model_card.JSONSchema);
                        model_card.JSONSchema[currStage]["figures"].push(code_cell.persistentId + ".jpg");
                    }
                }
            }
            programbuilder.add(code_cell)
            model_card.JSONSchema[currStage]["cells"] += code_cell;
            //console.log(code_cell);
            //console.log(model_card.JSONSchema[currStage]["cells"]);
            model_card.JSONSchema[currStage]["source"] += sourceCode;
            model_card.JSONSchema[currStage]["cell_ids"].push(code_cell.persistentId);
        }
    }
    // id_count = persistentId
    //let code = programbuilder.buildTo("id" + id_count.toString()).text;
    model_card.JSONSchema["markdown"] = notebookMarkdown;
    // return [notebookCode, notebookMarkdown, model_card];
    return model_card.JSONSchema;
}


function printLineDefUse(code, model_card, markdown_contents){
    let tree = py.parse(code);
    let cfg = new py.ControlFlowGraph(tree);

    const analyzer = new py.DataflowAnalyzer();

    const flows = analyzer.analyze(cfg).dataflows;
    console.log(analyzer.getFuncDefs());
    var importScope = {};
    var lineToCode = {};

    for (let flow of flows.items) {
        let fromNode = py.printNode(flow.fromNode).split("\n");
        let toNode = py.printNode(flow.toNode).split("\n");
        lineToCode[flow.fromNode.location.first_line] = fromNode[0];
        lineToCode[flow.fromNode.location.last_line] = fromNode[fromNode.length-1];
        lineToCode[flow.toNode.location.last_line] = toNode[toNode.length-1];
        lineToCode[flow.toNode.location.first_line] = toNode[0];

        //p(analyzer.getFuncDefs());
        if (flow.fromNode.type === "from" || flow.fromNode.type === "import") {
            importScope[flow.fromNode.location.first_line] = -1;
        } else if (flow.fromNode.type === "def") {
            console.log("function");
            // need to implement line to Cell
        }

        //g.setEdge(flow.fromNode.location.first_line.toString(), flow.toNode.location.first_line.toString());

    }
    var n = countLines;
    // need graph size to be size of lineToCode, not number of edges
    var numgraph = new graphing(n+1);

    for (let flow of flows.items) {
        numgraph.addEdge(flow.fromNode.location.first_line, flow.toNode.location.first_line);
    }
    findImportScope(importScope, lineToCode, numgraph, model_card, markdown_contents);

}

function findImportScope(importScope, lineToCode, numgraph, model_card, markdown_contents) {
    var importCode = Object.keys(importScope);
    var scopes = {};
    var imports = {};

    for (let lineNum of importCode) {
        var result = numgraph.findLongestPathSrc(numgraph.edge.length, parseInt(lineNum))
        scopes[lineNum] = result[1];
        var order = result[1];
        //console.log(lineToCode[lineNum]);
        //console.log("START: ", lineNum.toString(), " END: ", scopes[lineNum]);
        imports[lineToCode[lineNum]] = "START:" + lineNum.toString() + "\t" + " END:" + scopes[lineNum];
        if (model_card.getDCLineNumbers().includes(parseInt(lineNum))) {
            model_card.JSONSchema["datacleaning"]["imports"].push(lineToCode[lineNum]);
        } else if (model_card.getPPLineNumbers().includes(parseInt(lineNum))) {
            model_card.JSONSchema["preprocessing"]["imports"].push(lineToCode[lineNum]);
        }else if (model_card.getMTLineNumbers().includes(parseInt(lineNum))) {
            model_card.JSONSchema["modeltraining"]["imports"].push(lineToCode[lineNum]);
        }else if (model_card.getMELineNumbers().includes(parseInt(lineNum))) {
            model_card.JSONSchema["modelevaluation"]["imports"].push(lineToCode[lineNum]);
        }

    }
    //console.log(model_card.JSONSchema["preprocessing"]["imports"]);
    generateLibraryInfo(imports, markdown_contents);
}

function generateLibraryInfo(imports, markdown_contents) {
    // let library_defs = JSON.parse(fs.readFileSync(__dirname + "/../assets/library_defs.json"));
    //console.log("## Libraries Used ##");
    markdown_contents += "## Libraries Used ##" + "\n";
    var libraries = {"pandas":[], "numpy":[], "matplotlib":[], "sklearn":[], "tensorflow":[], "pytorch":[], "OTHER":[]};

    for (let im of Object.keys(imports)) {
        if (im.includes("pandas")){
            libraries["pandas"].push(im);
        } else if (im.includes("numpy")) {
            libraries["numpy"].push(im);
        } else if(im.includes("matplotlib")) {
            libraries["matplotlib"].push(im);
        } else if(im.includes("sklearn")) {
            libraries["sklearn"].push(im);
        } else if (im.includes("tensorflow")) {
            libraries["tensorflow"].push(im);
        } else if (im.includes("pytorch")) {
            libraries["pytorch"].push(im);
        } else {
            libraries["OTHER"].push(im);
        }
    }

    for (let lib of Object.keys(libraries)) {
        if (libraries[lib].length > 0) {
            //console.log("### From the library ", lib, " ###");
            //console.log(library_defs[lib]["description"]);
            markdown_contents += "#### From the library " + lib + " ####" + "\n";
            for (let element of libraries[lib]) {
                markdown_contents += element + "    " + imports[element] + "\n" + "\n";
            }
            //libraries[lib].forEach(element => console.log(element, "\t", imports[element]));
            //console.log("--");
        }
    }

}


function generateMarkdown(model_card, notebookCode, markdown_contents) {

    var keys = Object.keys( model_card.JSONSchema );

    for( var i = 0,length = keys.length; i < length; i++ ) {
        if (keys[i] == 'libraries') {
            printLineDefUse(notebookCode, model_card);
        } else {
            var stageKeys = Object.keys(model_card.JSONSchema[keys[i]]);
            for (let stageKey of stageKeys) {
                if (stageKey == 'title') {
                    markdown_contents += "## " + model_card.JSONSchema[keys[i]][stageKey] + " ##" + "\n";
                } else {
                    if (stageKey == 'source') {
                        //markdown_contents += "### " + stageKey + " ###" + "\n";
                        //markdown_contents += "``` " + "\n" + model_card.JSONSchema[keys[i]][stageKey] + "\n" + " ```" + "\n";

                    } else if (stageKey == "outputs") {
                        markdown_contents += "### " + stageKey + " ###" + "\n";
                        markdown_contents += model_card.JSONSchema[keys[i]][stageKey] + "\n";
                        //var image = document.createElement('img');
                        //image.src = "data:image/png;base64," + base64JsonData;


                    } else if (stageKey == "imports" || stageKey == "markdown") {
                        continue;
                    } else if (stageKey == "figures") {
                        markdown_contents += "### " + stageKey + " ###" + "\n";
                        for (let image of model_card.JSONSchema[keys[i]][stageKey]) {
                            //![id5](./image/id5.jpg)
                            markdown_contents += "![" + image + "](" + "../example/" +
                                model_card.JSONSchema["modelname"]["Filename"] + "/" + image + ")" + "\n";
                        }
                    } else if (keys[i] == "references" && stageKey == "links") {
                        for (let link of model_card.JSONSchema['references']['links']) {
                            markdown_contents += link + "\n";
                        }
                    }else {
                        markdown_contents += "### " + stageKey + " ###" + "\n";
                        markdown_contents += JSON.stringify(model_card.JSONSchema[keys[i]][stageKey]) + "\n";
                    }
                }
            }
        }


    }
    //console.log(markdown_contents);
    // fs.writeFile('ModelCard.md', markdown_contents, (err) => {
    //     if (err) throw err;
    //     console.log('Model card saved');
    //     //console.log(model_card);
    // });

}

/**
 * Generate model card contents in an object
 */
export function generateModelCard(content) {

    var new_color = convertColorToLabel(content);
    const res = readCells(content, new_color);
    console.log(res);

}
