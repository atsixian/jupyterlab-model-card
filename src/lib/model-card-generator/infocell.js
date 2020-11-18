// @ts-nocheck
// export var Infocell = /** @class */ (function () {
//     function InfoCell(text, executionCount, output, persistentId) {
//         //if (hasError === void 0) { hasError = false; }
//         let currid = genid();
//         this.text = text;
//         this.executionCount = executionCount;
//         //this.hasError = hasError;
//         //this.executionEventId = executionEventId || genid();
//         this.executionEventId = currid;
//         this.persistentId = persistentId || currid;
//         this.output = output;

//     }
//     InfoCell.prototype.deepCopy = function () { return this; }; // not used for Infoing
//     return InfoCell;
// }());
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
    return 'id' + (ID++);
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

//# sourceMappingURL=infocell.js.map