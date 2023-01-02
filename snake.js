const Snake = (_ => {

const SLOTS = [
	{ name: 'GameOver' },
	{ name: 'Seed' },
	{ name: 'Step' },
	{ name: 'Length' },
	{ name: 'Food' },
	{ name: 'Head' },
];

// State vector indices
const GameOver = 0;
const Seed = 1;
const Step = 2;
const Length = 3;
const Food = 4;
const Head = 5;

const MaxLength = 1000;
const D = 64;

const INTERFACE = `/// Target: Snake v1.0

macro north() external(1)
macro east()  external(2)
macro south() external(3)
macro west()  external(4)

const GameOver = ${GameOver}
const Seed = ${Seed}
const Step = ${Step}
const Length = ${Length}
const Food = ${Food}
const Head = ${Head}

const MaxLength = ${MaxLength}
const D = ${D}
`;


// Generalized from https://stackoverflow.com/a/12996028/167531
function hash(...keys) {
	let x = 0;
	for (let k of keys) x = ((x ^ (k >> 16) ^ k) * 0x45d9f3b) & 0x7fffffff;
	x = (((x >> 16) ^ x) * 0x45d9f3b) & 0x7fffffff;
	x = (x >> 16) ^ x;
	return x ;
}

function snakeAt(state, cell) {
	for (let s = 0; s < state[Length]; s += 1)  {
		if (state[Head + s] === cell) {
			return true;
		}
	}
	return false;
}

function plantFood(state) {
	for (let attempt = 0; attempt < 1000; attempt += 1) {
		let i = hash(state[Seed], state[Step], 0xF00D, attempt) % (D * D);
		let ok = true;
		if (!snakeAt(state, i)) {
			state[Food] = i;
			return;
		}
	}
	vm.dumpState(true);
	throw "Couldn't find a place for food";
}


class Snake {

	static create(code) {
		let state = new Int16Array(Head + MaxLength);
		state[Seed] = hash(0x54ec, ...code);
		state[Length] = 1;
		state[Head] = Math.floor(D/2) * (1 + D);

		plantFood(state);
		return state;
	}

	static title = "Snake";

	static SLOTS = SLOTS;

	static windowContent = `
			<canvas width=400 height=400 id=snakepit></canvas>
			<div>Score: <span id=score>0</span></div>
			<div id=gameover></div>`;

	static updateUI(state) {
		let can = $('#snakepit');
		let ctx = can.getContext('2d');

		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, can.width, can.height);
		for (let s = -1; s < state[Length]; s += 1) {
			if (s === 0) {
				ctx.fillStyle = 'white';
			} else if (s < 0) {
				ctx.fillStyle = 'red';
			} else {
				let c = 255 - Math.floor(128 * s/state[Length]);
				ctx.fillStyle = 'rgb(0,'+c+',0)';
			}
			let i = state[Head + s];
			let x = i % D;
			let y = Math.floor(i / D);
			ctx.fillRect(x * can.width / D, y * can.height / D, can.width / D, can.height / D);
		}

		$("#score").innerText = this.score(vm.state);

		$('#gameover').innerText =
			vm.state[GameOver] == 0 ? '' :
			vm.state[GameOver] == 1 ? 'Game Over. Victory!' :
			vm.state[GameOver] == 2 ? 'Game Over. Crashed into self.' :
			vm.state[GameOver] == 3 ? 'Game Over. Time is up.' :
			vm.state[GameOver] == 4 ? 'Game Over. Crashed into wall.' :
			'Game Over: ' + vm.state[GameOver];
	}

	static score(state) { return state[Length] - 1 }

	static handleInstruction(state, operation, ...args) {
		if (state[GameOver]) return 0;

		let next_x = state[Head] % D;
		let next_y = Math.floor(state[Head] / D);
		if        (operation === 1) {	next_y -= 1;  // N
		} else if (operation === 2) {	next_x += 1;  // E
		} else if (operation === 3) {	next_y += 1;  // S
		} else if (operation === 4) {	next_x -= 1;  // W
		} else { return -1;	}

		let next = next_x + D * next_y;

		if (next_x < 0 || next_y < 0 || next_x >= D || next_y >= D) {
			// Ran into wall
			state[GameOver] = 4;
		} else if (state[Step] == 0x7FFF) {
			// Time is up
			state[GameOver] = 3;
		} else if (next === state[Food]) {
			// Found food
			state[Length] += 1;
			if (state[Length] >= MaxLength)
				state[GameOver] = 1;  // victory
			else
				plantFood(state);
		} else if (snakeAt(state, next)) {
			// Crashed into self
			state[GameOver] = 2;
		}

		if (!state[GameOver]) {
			for (let i = state[Length] - 1; i > 0; i -= 1) {
				state[Head + i] = state[Head + i - 1];
			}
			state[Head] = next;
			state[Step] += 1;
		}

		return 1;
	}

	static generateInterface() { return INTERFACE; }

	// This is awkward. Unify with the other one better
	static playmation(vm, butStop) {
		vm.bigstep();

		this.updateUI(vm.state);

		if (vm.alive()) {
			if (!butStop)
				window.gameplayTimer = setTimeout(_ => this.playmation(vm), 10);//vm.state[Length] > 12 ? 1000 : 10);
		} else {
			vm.dumpState(true);
			// for (let i = 0; i < vm.memory.length; i += 1)
			// 	if (vm.memory[i])
			// 		console.log(i, vm.memory[i]);
		}
	}

}




return Snake; })();


if (typeof module !== 'undefined') {
	module.exports = Snake;
}


if (typeof module !== 'undefined' && !module.parent) {
	// Called with node as main module
	const { parseArgs } = require('util');
	const { readFileSync, writeFileSync } = require('fs');

	const { values, positionals } = parseArgs({
		options: {
			verbose: {
				type: 'boolean',
				short: 'v',
				multiple: true,
			},
		},
		allowPositionals: true,
	});
	const flags = values;

	const verbosity = (flags.verbose || []).length;

	if (positionals.length) {
		let { readFileAsWords, VirtualMachine } = require('./vm.js');
		let code = readFileAsWords(positionals[0]);
		let vm = new VirtualMachine(code, Snake);
		if (verbosity > 1) vm.trace = true;
		vm.run();
		console.log('Score: ', Snake.score(vm.state));
		if (verbosity > 0) {
			vm.dumpState(true);
		}
	}
}
