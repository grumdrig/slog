let { VirtualMachine } = require('./vm.js');

class TestApp {

	static create(program) { return new Int16Array(1) }

	static handleInstruction(code, ...args) {
		console.log("Test sees", code, ...args);
	}
}


let vm = VirtualMachine.createFromFile('test.bin', TestApp);
vm.run();

console.log('ok');