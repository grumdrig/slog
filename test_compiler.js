let { compile } = require('./compiler');

let c = compile(`
var i
var b = 2
const c = -5
main {
	i = 1
}

`);

c_no = c.split('\n').map((l,i) => (i+1) + ': ' + l).join('\n');

console.log(c_no);

let { VirtualMachine, World, Assembler } = require('./vm');

let a = new Assembler();
a.assemble(c);

console.log(a.disassemble());
