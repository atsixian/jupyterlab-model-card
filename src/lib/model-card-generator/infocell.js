class Infocell {
    constructor(text, executionCount, output, persistentId) {

        let currid = genid();
        this.text = text;
        this.executionCount = executionCount;
        //this.hasError = hasError;
        //this.executionEventId = executionEventId || genid();
        this.executionEventId = currid;
        this.persistentId = persistentId || currid;
        this.output = output;
    }
}

var ID = 0;
function genid() {
    return ID++;
}

function printInfoCell(cell) {
    let info = {"persistentId":cell.persistentId, "code":cell.text};
    try {
        info["output"] = output.toJSON();
    } catch {
        info["output"] = "";
    }
    return info
}

exports.InfoCell = Infocell;
exports.printInfoCell = printInfoCell;