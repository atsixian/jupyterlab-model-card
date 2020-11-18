var py = require("../lib/python-program-analysis/dist/es5");

module.exports = {
    getSourceFromCell: function(cell){
		return cell.source.join('')
	},

	isInCellBoundaries: function(lineNo, cellLineNos){
	    let first = cellLineNos[0];
	    let last = cellLineNos[1];
	    return (lineNo >= first && lineNo <= last);
	},

	getDefUse: function(code){
		let tree = py.parse(code);
		let cfg = new py.ControlFlowGraph(tree);
		const analyzer = new py.DataflowAnalyzer();
		const flows = analyzer.analyze(cfg).dataflows;
		return flows;
	},

	getRandomInt: function(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	breadthFirstSearch: function(cell, dict, searchDependents=false){
		let visited = new Set();
		let stack = [cell];
		let neighbors = [];
		while (stack.length > 0){
			let current = stack.pop();
			visited.add(current);
			searchDependents ? neighbors = current.dependents : neighbors = current.dependentOn;
			if (neighbors !== undefined){
				neighbors.forEach(neighbor => {
					neighbor = dict[neighbor];
					if (!visited.has(neighbor)){
						stack.push(neighbor);
					}
				});
			}
		}
		visited.delete(cell);
		return visited;
	},

	// printCell takes in an execution count and outputs the corresponding cell according to the mode parameter
	printCell: function(count, mode, dict){
		let currentCell = dict[count];
		if (mode === "code"){
			return utils.getSourceFromCell(currentCell);
		} else if (mode === "line"){
			return currentCell.lineNos;
		} else {
			// (mode == "count")
			return count;
		}
	}
}

