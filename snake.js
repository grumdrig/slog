// State vector indices
const GameOver = 0;
const Step = 1;
const Length = 2;
const HeadX = 3;
const HeadY = 4;
const FoodX = 5;
const FoodY = 6;
const Seed = 7;

const Grid0 = 8;
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
const HeadX = ${HeadX}
const HeadY = ${HeadY}
const FoodX = ${FoodX}
const FoodY = ${FoodY}
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
			state[FoodX] = i % D;
			state[FoodY] = Math.floor(i / D);
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
		state[HeadX] = state[HeadY] = Math.floor(D/2);
		cell(state, state[HeadX], state[HeadY], 1);

		plantFood(state);
		return state;
	}

	static handleInstruction(state, operation, ...args) {
		if (state[GameOver]) return 0;

		if (cell(state, state[FoodX], state[FoodY]) !== -1 ||
			cell(state, state[HeadX], state[HeadY]) !==  1) {
			Snake.dumpState(state);
			throw "Invalid game state";
		}

		let next_x = state[HeadX], next_y = state[HeadY];
		let dx = 0, dy = 0;
		if (operation === 1) {			next_y -= 1;  // N
		} else if (operation === 2) {	next_x += 1;  // E
		} else if (operation === 3) {	next_y += 1;  // S
		} else if (operation === 4) {	next_x -= 1;  // W
		} else { return -1;	}


		if (next_x < 0 || next_y < 0 || next_x >= D || next_y >= D) {
			// Ran into wall
			state[GameOver] = 1;
		} else if (cell(state, next_x, next_y) > 0) {
			// Crashed into self
			state[GameOver] = 2;
		} else if (state[Step] == 0x7FFF) {
			// Time is up
			state[GameOver] = 3;
		} else if (next_x === state[FoodX] && next_y == state[FoodY]) {
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
			cell(state, next_x, next_y, 1);
			state[HeadX] = next_x;
			state[HeadY] = next_y;
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
}


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
		if (verbosity > 0) {
			Snake.dumpState(vm.state);
			vm.dumpState();
		}
	}
}
