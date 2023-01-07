class TestApp {
	state;

	constructor(program) {
		this.state = new Int16Array(10);
	}

	handleInstruction(state, code, ...args) {
		console.log("Test sees", code, ...args);

		if (0 <= code && code < 10) {
			let old = state[code];
			state[code] = args[0];
			return old;
		}

		return -1;
	}
}

if (typeof module !== 'undefined') {
	module.exports = TestApp;
}
