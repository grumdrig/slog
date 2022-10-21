let { compile } = require('./compiler');

let c = compile(`
var i
var b = 2
const c = -5
main {
	i = 1
}

`);

console.log(c);

let { VirtualMachine, World, Assembler } = require('./vm');

let a = new Assembler();
a.assemble(c);

console.log(a.disassemble());
