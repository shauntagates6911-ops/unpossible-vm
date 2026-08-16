class Scratch3NodeBlocks {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getPrimitives () {
        return {
            node_runCode: this.runCode,
            node_evalReporter: this.evalReporter
        };
    }

    // Command block: runs arbitrary JS/Node code
    runCode (args) {
        const code = String(args.CODE);
        try {
            // Function constructor avoids polluting local scope
            const runner = new Function(code);
            runner();
        } catch (err) {
            console.error('Node/JS Execution Error:', err);
        }
    }

    // Reporter block: evaluates code and returns the result
    evalReporter (args) {
        const code = String(args.CODE);
        try {
            const runner = new Function(`return (${code});`);
            return runner();
        } catch (err) {
            return `Error: ${err.message}`;
        }
    }
}

module.exports = Scratch3NodeBlocks;
const Scratch3NodeBlocks = require('../blocks/scratch3_node');

module.exports = [
    // ... other block packages
    {
        implementation: Scratch3NodeBlocks,
        opcodePrefix: 'node_'
    }
];
