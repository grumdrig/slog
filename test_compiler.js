let { compile } = require('./compiler');

let source = `
external walk(direction) = $30
var i = 1  // comment
const c = -5
func main {
	i = c + 1
//	walk(i)
}
`;

function number(c) {
	return c.split('\n').map((l,i) => (i+1) + ': ' + l).join('\n');
}

console.log(number(source));

let c = compile(source);

console.log(number(c));

let { VirtualMachine, World, Assembler } = require('./vm');

let a = new Assembler();
a.assemble(c);

console.log(a.disassemble());
