const Snake = (_ => {

const SLOTS = [
	{ name: 'GameOver' },
	{ name: 'Step' },
	{ name: 'Length' },
	{ name: 'Head' },
	{ name: 'Food' },
	{ name: 'Seed' },
];

// State vector indices
const GameOver = 0;
const Step = 1;
const Length = 2;
const Head = 3;
const Food = 4;
const Seed = 5;

const Grid0 = 6;
const D = 20;

const INTERFACE = `
tag('Sn', $101)

macro north() external(1)
macro east()  external(2)
macro south() external(3)
macro west()  external(4)

const GameOver = ${GameOver}
const Step = ${Step}
const Length = ${Length}
const Head = ${Head}
const Food = ${Food}
const Seed = ${Seed}
const Grid0 = ${Grid0}
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

function icell(state, i, value) {
	if (typeof value !== 'undefined')
		state[i + Grid0] = value;
	return state[i + Grid0];
}

function cell(state, x, y, value) { return icell(state, x + y * D, value) }


function plantFood(state) {
	for (let attempt = 0; attempt < 1000; attempt += 1) {
		let i = hash(state[Seed], state[Step], 0xF00D, attempt) % (D * D);
		if (icell(state, i) === 0) {
			icell(state, i, -1);
			state[Food] = i;
			return;
		}
	}
	Snake.dumpState(state);
	throw "Couldn't find a place for food";
}


class Snake {

	static create(code) {
		let state = new Int16Array(Grid0 + D * D);
		state[Seed] = hash(0x54ec, ...code);
		state[Length] = 1;
		state[Head] = Math.floor(D/2) * (1 + D);
		icell(state, state[Head], 1);

		plantFood(state);
		return state;
	}

	static name = "Snake";
	static SLOTS = SLOTS;

	static windowContent = `
			<canvas width=400 height=400 id=snakepit></canvas>
			<div>Score: <span id=score>0</span></div>
			<div id=gameover></div>`;

	static updateUI(state) {
		let can = $('#snakepit');
		let ctx = can.getContext('2d');

		for (let i = 0; i < D * D; i++) {
			let s = state[Grid0 + i];
			if (s > 1) {
				ctx.fillStyle = 'white';
			} else if (s === 1) {
				ctx.fillStyle = '#0a0';
			} else if (s < 0) {
				ctx.fillStyle = 'red';
			} else {
				ctx.fillStyle = 'black';
			}
			let x = i % D;
			let y = Math.floor(i / D);
			ctx.fillRect(x * can.width / D + 1, y * can.height / D + 1, can.width / D - 2, can.height / D - 2);
			ctx.strokeStyle = '#444';
			ctx.strokeRect(x * can.width / D, y * can.height / D, can.width / D, can.height / D);
		}

		$("#score").innerText = this.score(vm.state);

		$('#gameover').innerText =
			vm.state[GameOver] == 0 ? '' :
			vm.state[GameOver] == 1 ? 'Game Over. Crashed into wall.' :
			vm.state[GameOver] == 2 ? 'Game Over. Crashed into self.' :
			vm.state[GameOver] == 3 ? 'Game Over. Time is up.' :
			'Game Over: ' + vm.state[GameOver];
	}

	static score(state) { return state[Length] - 1 }

	static handleInstruction(state, operation, ...args) {
		if (state[GameOver]) return 0;

		if (icell(state, state[Food]) !== -1 ||
			icell(state, state[Head]) !==  1) {
			Snake.dumpState(state);
			throw "Invalid game state";
		}

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
			state[GameOver] = 1;
		} else if (icell(state, next) > 0) {
			// Crashed into self
			state[GameOver] = 2;
		} else if (state[Step] == 0x7FFF) {
			// Time is up
			state[GameOver] = 3;
		} else if (next === state[Food]) {
			// Found food
			state[Length] += 1;
			plantFood(state);
		}

		if (!state[GameOver]) {
			for (let i = 0; i < D * D; ++i) {
				let v = icell(state, i);
				if (v >= state[Length]) {
					icell(state, i, 0);
				} else if (v > 0) {
					icell(state, i, v + 1);
				}
			}
			icell(state, next, 1);
			state[Head] = next;
			state[Step] += 1;
		}

		return 1;
	}

	static generateInterface() { return INTERFACE; }

	static dumpState(state) {
		state.forEach((v,i) => {
			if (v) console.log(`${i}: ${v}`);
		});
	}

	// This is awkward. Unify with the other one better
	static playmation(vm, butStop) {
		vm.bigstep();

		this.updateUI(vm.state);

		if (vm.alive()) {
			if (!butStop)
				setTimeout(_ => this.playmation(vm), 10);//vm.state[Length] > 12 ? 1000 : 10);
		} else {
			this.dumpState(vm.state);
			vm.dumpState();
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
			Snake.dumpState(vm.state);
			vm.dumpState();
		}
	}
}
