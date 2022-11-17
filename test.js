let { VirtualMachine } = require('./vm.js');

class TestApp {

	static create(program) { return new Int16Array(10) }

	static handleInstruction(state, code, ...args) {
		console.log("Test sees", code, ...args);

		if (0 <= code && code < 10) {
			let old = state[code];
			state[code] = args[0];
			return old;
		}

		return -1;
	}
}


let vm = VirtualMachine.createFromFile('test.bin', TestApp);
vm.run();

console.log('ok');