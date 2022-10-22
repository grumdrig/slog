let { compile } = require('./compiler');

let source = `
var i = 1  // comment
const c = -5
main {
	i = c + 1
}
`;

console.log(source);

let c = compile(source);

c_no = c.split('\n').map((l,i) => (i+1) + ': ' + l).join('\n');

console.log(c_no);

let { VirtualMachine, World, Assembler } = require('./vm');

let a = new Assembler();
a.assemble(c);

console.log(a.disassemble());
