"use strict";
exports.__esModule = true;

var py = require("../lib/python-program-analysis/dist/es5");
var fs = require('fs');
var child = require('child_process');


var args = process.argv.slice(2);
var directory = args[0];


function analyze_notebooks(_callback) {
    function sh(cmd) {
        return new Promise(function (resolve, reject) {
            child.exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ stdout, stderr });
                }
            });
        });
    }

    sh('node analyze_notebooks ' + directory).then(
        function(result) {
            console.log(result['stdout']); // "initResolve"
            graphvisual();
            return;
        }
    )
        .catch(function(result) {
            console.log(result);
            return;
        })
    _callback();
}

function graphvisual() {
    let {PythonShell} = require('python-shell');

    fs.readdirSync(directory).forEach(file => {

        if (getExt(file) === "ipynb" && (file.indexOf('_clean') == -1)) {
            console.log('Currently processing:');
            console.log(directory + file + '\n');

            let options = {
                mode: 'text',
                pythonPath: 'C:\\Program Files\\Python38\\python',
                pythonOptions: ['-u'], // get print results in real-time
                scriptPath: './',
                args: [directory + file.split(".ipynb")[0] + "_deps_and_labels_new.txt"]
            };

            console.log(options["args"]);
            PythonShell.run('graph_visual-4.py', options,
                function (err, results) {
                    if (err) throw err;
                    console.log(results);
                    convert_nb();
                });

        }
    });

}

function convert_nb() {
    function sh(cmd) {
        return new Promise(function (resolve, reject) {
            child.exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ stdout, stderr });
                }
            });
        });
    }

    fs.readdirSync(directory).forEach(file => {
        var wholefile = directory + file;

        if ((getExt(file) === "ipynb") && (file.indexOf('_clean') == -1)) {
            console.log('Currently processing:');
            console.log(wholefile + '\n');

            sh('node convert_nb.js ' + wholefile + ' ' + wholefile.split('.ipynb')[0] + '_analysis.txt').then(
                function (result) {
                    console.log(result['stdout']); // "initResolve"
                    return "normalReturn";
                }
            )
                .catch(function (result) {
                    console.log(result);
                    return;
                })
        }
    });
}

function getExt(filename){
    return filename.substring(filename.lastIndexOf('.')+1, filename.length);
}

function randomFunction() {
    analyze_notebooks(function() {
        console.log("Finished running analyze_notebooks()");
        console.log("RANDOM");
    })

}


function main() {
    randomFunction();
}

main();