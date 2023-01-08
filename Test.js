class Test {
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

	updateUI() {}
}

if (typeof module !== 'undefined') {
	module.exports = Test;
}
