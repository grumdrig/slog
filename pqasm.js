`
// Include defs for this game

external study(spell) = $36
external train(stat) = $36
external initialize(slot, value) = $36
external travel(destination) = $30
external melee() = $31
external buyItem(slot, quantity) = $32
external buyEquipment(slot, quality) = $32
external sell(slot, quantity) = $33
external seekquest() = $34
external completequest() = $35
external cast(spell_slot) = $37
external forage(target_slot) = $38
external levelup() = $39
external startGame() = $39
external give(slot, quantity) = $3A
external drop(slot, quantity) = $3A
`

const EXTERNALS = {
	study: {
		parameters: 'spell',
		opcode: 0x36,
	},
	train: {
		parameters: 'stat',
		opcode: 0x36,
	},
	initialize: {
		parameters: 'slot,value',
		opcode: 0x36,
	},
	travel: {
		parameters: 'destination',
		opcode: 0x30,
	},
	melee: {
		opcode: 0x31,
	},
	buyItem: {
		parameters: 'slot,quantity',
		opcode: 0x32,
	},
	buyEquipment: {
		parameters: 'slot,quality',
		opcode: 0x32,
	},
	sell: {
		parameters: 'slot,quantity',
		opcode: 0x33,
	},
	seekquest: {
		opcode: 0x34,
	},
	completequest: {
		opcode: 0x35,
	},
	cast: {
		parameters: 'spell_slot',
		opcode: 0x37,
	},
	forage: {
		parameters: 'target_slot',
		opcode: 0x38,
	},
	levelup: {
		opcode: 0x39,
	},
	startGame: {
		opcode: 0x39,
	},
	give: {
		parameters: 'slot,quantity',
		opcode: 0x3A,
	},
	drop: {
		parameters: 'slot,quantity',
		opcode: 0x3A,
	},
};

for (let name in EXTERNALS) {
	define(name, EXTERNALS[name].opcode);
}



const CALLS = {
	travel: {
		parameters: 'destination',
		opcode: 0x30,
	},
	melee: {
		parameters: '',
		opcode: 0x31,
	},
	buy: {
		parameters: 'slot,level',
		opcode: 0x32,
	},
	sell: {
		parameters: 'slot,qty',
		opcode: 0x33,
	},
	seekquest: {
		parameters: '',
		opcode: 0x34,
	},
	completequest: {
		parameters: '',
		opcode: 0x35,
	},
	train: {
		parameters: 'slot',
		opcode: 0x36
	},
	initialize: {
		parameters: 'slot,value',
		opcode: 0x36,
	},
	cast: {
		parameters: 'spell_slot',
		opcode: 0x37,
	},
	forage: {
		parameters: 'target_slot',
		opcode: 0x38,
	},
	levelup: {
		parameters: '',
		opcode: 0x39,
	},
	startGame: {
		parameters: '',
		opcode: 0x39,
	},
	give: {
		parameters: 'slot',
		opcode: 0x3A,
	},
};
for (let call in CALLS) {
	let { opcode, parameters } = CALLS[call];
	let externalDef = `external ${call}(${parameters}) = $${opcode.toString(16)}`;
	define(call, opcode);
}

/*
let EQUIPMENT_TYPES = {
	weapon: {
		slot: Equipment
	},
	armor: {
		slot: Equipment
	},
	shield: {
		slot: Equipment
	},
	headgear: {
		slot: Equipment
	},
	footwear: {
		slot: Equipment
	},
	amulet: {
		slot: Equipment
	},
	ring: {
		slot: Equipment
	},
	totem: {
		slot: Equipment
	},
};
*/


const SLOTS = [
	null,
	"RACE",
	"AGE",
	"LOCATION",

	"LEVEL",
	"XP",
	"XP_NEEDED",

	"MAX_HP",
	"DAMAGE",

	"MAX_MP",
	"FATIGUE",

	"ENCHANTMENT",
	"ENCHANTMENT_LEVEL",

	"STAT_STRENGTH",
	"STAT_AGILITY",
	"STAT_CONSTITUTION",
	"STAT_INTELLIGENCE",
	"STAT_WISDOM",
	"STAT_CHARISMA",

	"SPELL_HEAL",
	"SPELL_FIREBALL",
	"SPELL_HASTE",
	"SPELL_BUFF",
	"SPELL_LUCK",
	"SPELL_6", //

	"EQUIPMENT_WEAPON",
	"EQUIPMENT_ARMOR",
	"EQUIPMENT_SHIELD",
	"EQUIPMENT_HEADGEAR",
	"EQUIPMENT_FOOTWEAR",
	"EQUIPMENT_MOUNT",
	"EQUIPMENT_RING",
	"EQUIPMENT_TOTEM",

	"INVENTORY_GOLD",
	"INVENTORY_SPOILS",
	"INVENTORY_REAGENTS",
	"INVENTORY_RESOURCES",
	"INVENTORY_FOOD",
	"INVENTORY_TREASURES",
	"INVENTORY_POTIONS",
	"INVENTORY_LIFE_POTIONS",

	"QUEST_OBJECT", // monster or item (by slot)
	"QUEST_LOCATION", // location to perform the quest
	"QUEST_QTY", // qty # required
	"QUEST_PROGRESS", // # completed
	"QUEST_ORIGIN", // town location

	"ACT", // (up to 9, 10 = win)
	"ACT_DURATION", // # of something required
	"ACT_PROGRESS", // as advanced by quests

	"ESTEEM_DUNKLINGS",
	"ESTEEM_HARDWARVES",
	"ESTEEM_EFFS",
];


function define(symbol, value) {
	if (!symbol) return;
	if (typeof global !== 'undefined')
		Object.defineProperty(global, symbol, { value });
	if (typeof window !== 'undefined')
		Object.defineProperty(window, symbol, { value });
	if (typeof exports !== 'undefined')
		Object.defineProperty(exports, symbol, { value });
}

// const LEVEL = 1; for example
SLOTS.forEach(define);

const STAT_0 = STAT_STRENGTH;
const SPELL_0 = SPELL_HEAL;
const EQUIPMENT_0 = EQUIPMENT_WEAPON;
const INVENTORY_0 =INVENTORY_GOLD;

function isStatSlot(slot) { return STAT_0 <= slot && slot < SPELL_0 }
function isSpellSlot(slot) { return SPELL_0 <= slot && slot < EQUIPMENT_0 }
function isEquipmentSlot(slot) { return EQUIPMENT_0 <= slot && slot < INVENTORY_0 }
function isInventorySlot(slot) { return INVENTORY_0 <= slot && slot < QUEST_OBJECT }

const STAT_N = SPELL_0 - STAT_0;
// const SPELL_N = EQUIPMENT_0 - SPELL_0;
// const EQUIPMENT_N = INVENTORY_0 - EQUIPMENT_0;
// const INVENTORY_N = QUEST_OBJECT - INVENTORY_0;

// Weapon types
const SMASH = 1;
const SLASH = 2;
const SHOOT = 3;
const POKE = 4;

const RACES = [
	null,
	{
		name: "Dunkling",
		aka: "Nerfling",
		index: 1,
		esteems: 2,
		waryof: 3,
		proficiency: SLASH,
		badat: [POKE, SHOOT],
		stat_mods: {
			DEX: +2,
			CHA: +1,
			STR: -1,
			WIS: -2,
		},
		description: "Likable, lithe creatures of small stature, often underestimated",
		startingitems: { weapon: 2, hat: 1, food: 1 },
	},
	{
		name: "Hardwarf",
		plural: "Hardwarves",
		index: 2,
		esteems: 3,
		waryof: 1,
		proficiency: SMASH,
		badat: SLASH,
		stat_mods: {
			CON: +2,
			STR: +1,
			DEX: -1,
			INT: -2,
		},
		description: "Sturdy sorts with a...direct approch to problems",
		startingitem: { weapon: 1, shield: 1, gold: 1 },
	},
	{
		name: "Eff",
		index: 3,
		esteems: 1,
		waryof: 2,
		proficiency: [POKE, SHOOT],
		badat: SMASH,
		stat_mods: {
			INT: +2,
			WIS: +1,
			CON: -1,
			CHA: -2,
		},
		description: "Proud, sometimes haughty, intellectuals",
		startingitem: { weapon: 3, shoes: 1, reagent: 1 },
	}
];


const DUNKLING = 1;
const HARDWARF = 2;
const EFF = 3;
const GAST = 4;


// Terrain types
// This is kinda placeholder.
const TUNDRA = 1;
const FOREST = 2;
const TOWN = 3;
const HILLS = 4;
const MOUNTAINS = 5;
const PLAINS = 6;
const MARSH = 7;
const DESERT = 8;


const MOBS = [
	{
		name: "Parakeet",
		badassname: "Triplikeet",
		domain: PLAINS,
		hitdice: 1,
	}, {
		name: "Pig",
		bigname: "Spectral Pig",
		badassname: "Supersow",
		domain: HILLS,
		hitditce: 2,
	}, {
		name: "Gegnome",
		badassname: "Megegnome",
		domain: FOREST,
		hitdice: 3,
	}, {
		name: "Giant Flea",
		badassname: "Flealord",
		domain: DESERT,
		hitdice: 4,
	}, {
		name: "Zorc",
		badassname: "Zigzorc",
		domain: MOUNTAINS,
		hitdice: 5,
	}, {
		name: "Trogor",
		badassname: "Ortrogor",
		domain: HILLS,
		hitdice: 6,
	}, {
		name: "Baklakesh",
		badassname: "Huntrakesh",
		domain: MARSH,
		hitdice: 7
	}, {
		name: "Plasterbear",
		badassname: "Fasterbear",
		domain: TUNDRA,
		hitdice: 8,
	}, {
		name: "Saberon",
		badassname: "Supersaber",
		domain: FOREST,
		hitdice: 9,
	}, {
		name: "Komordem",
		badassname: "Mokomordem",
		domain: MOUNTAINS,
		hitdice: 10,
	}, {
		name: "Icehalt",
		badassname: "Ikkadrosshalt",
		domain: TUNDRA,
		hitdice: 11,
	}, {
		name: "Veilerwyrm",
		badassname: "Veilerwyrmogon",
		domain: DESERT,
		hitdice: 12,
	}
];



class Game {
	static initialize(state) {
		// Most of it happens with the initialize / startgame ops
		state[LOCATION] = -1;
		state[QUEST_LOCATION] = -1;
	}

	static MAP = [{
			index: 0,
			name: "Watha",
			terrain: TUNDRA,
			level: 7
		}, {
			index: 1,
			name: "Maak",
			terrain: TUNDRA,
			level: 5,
		}, {
			index: 2,
			same: "Wolfin Forest",
			terrain: FOREST,
			level: 2,
		}, {
			index: 3,
			name: "Hohamp",
			terrain: TOWN,
			level: 0,
		}, {
			index: 4,
			name: "Skiddo",
			terrain: HILLS,
			level: 1,
		}, {
			index: 5,
			name: "Chinbreak Cliff",
			terrain: MOUNTAINS,
			level: 7,

		}, {
			index: 6,
			name: "Yar",
			terrain: TOWN,
			level: 0,
		}, {
			index: 7,
			name: "Deepni Woods",
			terrain: FOREST,
			level: 7,
		}, {
			index: 8,
			name: "Barkmot Forest",
			terrain: FOREST,
			level: 7,
		}, {
			index: 9,
			name: "Goldona Hills",
			terrain: HILLS,
			level: 3,
		}, {
			index: 10,
			name: "Breezeby Peak",
			terrain: MOUNTAINS,
			level: 5,
		}, {
			index: 11,
			name: "Iperko Forest",
			terrain: FOREST,
			level: 1,

		}, {
			index: 12,
			name: "Blesh Grove",
			terrain: FOREST,
			level: 2,
		}, {
			index: 13,
			name: "Donday Hill",
			terrain: HILLS,
			level: 3,
		}, {
			index: 14,
			name: "Skidge Mountain",
			terrain: MOUNTAINS,
			level: 5,
		}, {
			index: 15,
			name: "Krack Mountain",
			terrain: MOUNTAINS,
			level: 7,
		}, {
			index: 16,
			name: "Sprue Forest",
			terrain: FOREST,
			level: 2,
		}, {
			index: 17,
			name: "Bompton",
			terrain: TOWN,
			denizen: DUNKLING,
			level: 0,

		}, {
			index: 18,
			name: "Terfu Plain",
			terrain: PLAINS,
			level: 3,
		}, {
			index: 19,
			name: "Blue Mist Mountains",
			terrain: MOUNTAINS,
			level: 1,
		}, {
			index: 20,
			name: "Pillary",
			terrain: TOWN,
			civilization: HARDWARF,
			level: 0,
		}, {
			index: 21,
			name: "Grein Hills",
			terrain: HILLS,
			level: 3,
		}, {
			index: 22,
			name: "Woofa Plain",
			terrain: PLAINS,
			level: 2,
		}, {
			index: 23,
			name: "Hallon Prairie",
			terrain: PLAINS,
			level: 1,

		}, {
			index: 24,
			name: "Donga Marsh",
			terrain: MARSH,
			level: 1,
		}, {
			index: 25,
			name: "Panar Plain",
			terrain: PLAINS,
			level: 2,
		}, {
			index: 26,
			name: "Owlholm Woods",
			terrain: FOREST,
			level: 4,
		}, {
			index: 27,
			name: "Papay Forest",
			terrain: FOREST,
			level: 3,
		}, {
			index: 28,
			name: "Delial",
			terrain: TOWN,
			civilization: DUNKLING,
			level: 0,
		}, {
			index: 29,
			name: "Solla Desert",
			terrain: DESERT,
			level: 1,

		}, {
			index: 30,
			name: "Cholar",
			terrain: TOWN,
			civilization: DUNKLING,
			level: 0,
		}, {
			index: 31,
			name: "Ritoli Marsh",
			terrain: MARSH,
			level: 4,
		}, {
			index: 32,
			name: "Arapet Plains",
			terrain: PLAINS,
			level: 6,
		}, {
			index: 33,
			name: "Wheewit Forest",
			terrain: FOREST,
			level: 5,
		}, {
			index: 34,
			name: "Enotar Plains",
			terrain: PLAINS,
			level: 4,
		}, {
			index: 35,
			name: "Noonaf Wastes",
			terrain: DESERT,
			level: 5,

		}, {
			index: 36,
			name: "Emkell Peak",
			terrain: MOUNTAINS,
			level: 9,
		}, {
			index: 37,
			name: "Sygnon Tower",
			terrain: TOWN,
			civilization: GAST,
			level: 0,
		}];


	static handleInstruction(state, opcode, arg1, arg2) {
		if (state[LEVEL] === 0) {
			// game hasn't begun
			if (opcode === initialize) {
				let [slot, value] = [arg1, arg2];
				if (slot !== RACE && slot !== CLASS && (STAT_0 > slot || slot > STAT5))
					return -1;
				if (value < 0) return -1
				state[slot] = value;
				return state[slot];

			} else if (opcode === startGame) {
				if (state.slice(STAT_0, SPELL_0).reduce((a,b) => a+b) > 10) return -1;
				if (!RACES[state[RACE]]) return -1;
				// All good. Start the game.
				for (let stat = STAT_0; stat < SPELL_0; stat += 1) {
					// Add 3 plus race bonuses to stats
					state[stat] += 3 + (RACES[RACE].stat_mods[SLOTS[stat]] || 0);
				}
				state[LEVEL] = 1;
				state[LOCATION] = 11;
				state[MAX_HP] = 6 + state[STAT_CONSTITUTION];
				state[MAX_MP] = 6 + state[STAT_INTELLIGENCE];
				for (let slot in RACES[RACE].startingitems) {
					state[slot] = RACES[RACE].startingitems[slot];
				}

				return 1;
			}
			return -1;
		}

		// Game is in process
		let local = this.MAP[state[LOCATION]];

		if (opcode === travel) {
			const destination = arg1;
			if (state[LOCATION] === destination) return 0;
			if (destination < 0 || destination >= MAP_W * MAP_H)
				return -1;
			let [x0, y0] = [state[LOCATION] % MAP_W, (state[LOCATION] / MAP_W) >> 0];
			let [x1, y1] = [destination % MAP_W, (destination / MAP_W) >> 0];
			if (Math.abs(x1 - x0) > Math.abs(y1 - y0)) {
				y1 = y0;
				x1 = (x1 < x0) ? x0 - 1 : x0 + 1;
			} else {
				x1 = x0;
				y1 = (y1 < y0) ? y0 - 1 : y0 + 1;
			}
			state[LOCATION] = x1 + MAP_W * y1;
			let hours = 24;
			hours = statMod(hours, speed(state));
			hours *= terrain.movementCost || 1;
			this.passTime(0, 1);
			return 1;

		} else if (opcode === melee) {
			return this.battle(state);

		} else if (opcode === buy) {
			let slot = arg1;
			let qty, levelToBe, capacity;
			if (isEquipmentSlot(slot)) {
				qty = 1;
				levelToBe = arg2;
				capacity = state[slot] ? 0 : 1;
			} else if (isInventorySlot(slot)) {
				qty = arg2;
				levelToBe = state[slot] + qty;
				capacity = carryAbility(state) - encumbrance(state);
			} else {
				return -1;
			}
			let price = local.price[slot];
			if (!price) return -1;  // Make sure it's available here

			if (arg2 === 0) {
				// It's a price check only
				this.passTime(1);
				return price;
			}

			price *= qty;
			if (state[GOLD] < price) return -1;  // Can't afford it
			if (capacity < qty) return -1;  // No room

			// You may proceed with the purchase
			state[GOLD] -= price;
			state[slot] = levelToBe;
			this.passTime(1);
			return qty;

		} else if (opcode === sell || opcode === give) {
			let [slot, qty] = [arg1, arg2];
			if (isEquipmentSlot(slot)) {
				qty = Math.max(qty, 1);
			} else if (isInventorySlot(slot)) {
				qty = Math.max(qty, state[slot]);
			} else {
				return -1;
			}
			let price = qty * 0.5 * marketValue(slot);
			if (opcode !== give) {
				state[GOLD] += price;
			} else if (state[QUEST_OBJECT] === slot) {
				state[QUEST_PROGRESS] += qty;
			}
			state[slot] -= qty;
			this.passTime(1, 0);
			return qty;

		} else if (opcode === seekquest) {
			this.passTime(1, 0);
			if (!isTown(state[LOCATION])) return 0;
			if (irand(2) == 0) {
				// Exterminate the ___
				state[QUEST_LOCATION] = randomLocation(state[LOCATION]);
				state[QUEST_OBJECT] = MAP[state[QUEST_LOCATION]].randomMob();
				state[QUEST_QTY] = 5 + irand(10);
			} else {
				// Bring me N of SOMETHING
				state[QUEST_LOCATION] = state[LOCATION];
				state[QUEST_OBJECT] = randomItem();
				state[QUEST_QTY] = 5 * irand(10);
			}
			state[QUEST_PROGRESS] = 0;
			state[QUEST_GIVER] = state[LOCATION];
			return 1;

		} else if (opcode === completequest) {
			if (!state[QUEST_OBJECT]) return -1;
			if (state[QUEST_GIVER] != state[LOCATION]) return -1;
			if (state[QUEST_PROGRESS] < state[QUEST_QTY]) return -1;
			state[XP] += 100;
			state[ACTPROGRESS] += 1;
			if (state[ACTPROGRESS] >= state[ACTDURATION]) {
				state[ACT] += 1;
				state[ACTDURATION] = ACT_LENGTHS[state[ACT]];
				state[ACTPROGRESS] = 0;
			}
			state[QUEST_OBJECT] = 0;
			state[QUEST_LOCATION] = -1;
			state[QUEST_GIVER] = -1;
			state[QUEST_PROGRESS] = 0;
			state[QUEST_QTY] = 0;
			return 1;

		} else  if (opcode === train) {
			let slot = arg1;
			if (!inTown(state[LOCATION])) return -1;
			if (!isSpellSlot(slot) && !isStatSlot(slot)) return -1;
			this.passTime(0, 1);
			let chance = Math.exp(1/5, 1.5);
			// TODO other factors, like race, stats
			if (Math.random() < chance) {
				state[slot] += 1;
				return 1;
			} else {
				return 0;
			}

		} else if (opcode === cast) {
			let spell = arg1;
			if (!isSpellSlot(spell)) return -1;
			let level = state[spell];
			if (level < 1) return -1;
			const manaused = 1;
			this.passTime(1);
			if (state[FATIGUE] + manaused > state[ENERGY])
				return -1;
			state[FATIGUE] += manaused;
			if (spell === HEAL) {
				state[DAMAGE] = Math.min(state[DAMAGE] - level, 0);
			} else if (spell === FIREBALL) {
				return this.battle(state, true);
			} else if (spell === HASTE || spell === BUFF || spell === INVISIBILITY || spell === LUCK) {
				state[ENCHANTMENT] = spell;
				state[ENCHANTMENTLEVEL] = spell;
				// TODO: effects of these
			} else {
				return -1;
			}
			return level;

		} else if (opcode === forage) {
			let target = arg1;
			if (target === MOBTYPE) {
				state[MOBTYPE] = location.mobtype;
				state[MOBLEVEL] = location.moblevel;
			}
			let qty = Math.random() < 0.5 ? 1 : 0;
			qty = Math.min(qty, inventoryCapacity(state));
			state[FORAGE] += qty;
			this.passTime(1);

		} else if (opcode === levelup) {
			if (state[XP] <= state[XP_NEEDED])
				return -1;
			state[LEVEL] += 1;
			state[XP_NEEDED] = xpNeededForLevel(state[LEVEL] + 1);
			this.passTime(1, 0);
			return 1;
		}
	}

	static armorClass(state) {
		// accumulated armor rating
		return TODO;
	}

	static encumbrance(state) {
		return TODO;
	}

	static battle(state, invulnerable=false) {
		if (!state[MOBTYPE]) return -1;

		let info = MOB_INFO[state[MOBTYPE]];
		if (!info) return -1;

		if (info.esteemSlot)
			state[info.esteemSlot] = Math.max(state[info.esteemSlot] - 1, 0);

		let levelDisadvantage = state[MOBLEVEL] - state[LEVEL];
		let damage = Math.pow(1.5, levelDisadvantage);
		state[DAMAGE] = Math.min(state[DAMAGE] + damage, state[HEALTH]);
		if (state[DAMAGE] >= state[HEALTH]) {
			if (state[LIFEPOTIONS] > 0) {
				state[LIFEPOTIONS] -= 1;
				state[DAMAGE] = state[HEALTH] - 1;  // or 0?
			} else {
				// dead. now what?
			}
			return 0;
		} else {
			state[XP] = 10 * Math.pow(1.5, levelDisadvantage);
			let ndrops = Math.min(1, carryCapacity());
			state[INVENTORY_DROPS] += ndrops;
			return 1;
		}
	}

	static passTime(special, hours, days) {
		const HOURS_PER_DAY = 24;
		if (days) hours += HOURS_PER_DAY * days;
		state[AGEHOURS] += hours;
	}
}

state = new Array(SLOTS.length).fill(0);
Game.initialize(state);
Game.handleInstruction(state, study, 1, 1);
Game.handleInstruction(state, train, 1, 1);
Game.handleInstruction(state, initialize, 1, 1);
Game.handleInstruction(state, travel, 1, 1);
Game.handleInstruction(state, melee, 1, 1);
Game.handleInstruction(state, buyItem, 1, 1);
Game.handleInstruction(state, buyEquipment, 1, 1);
Game.handleInstruction(state, sell, 1, 1);
Game.handleInstruction(state, seekquest, 1, 1);
Game.handleInstruction(state, completequest, 1, 1);
Game.handleInstruction(state, cast, 1, 1);
Game.handleInstruction(state, forage, 1, 1);
Game.handleInstruction(state, levelup, 1, 1);
Game.handleInstruction(state, startGame, 1, 1);
Game.handleInstruction(state, give, 1, 1);
Game.handleInstruction(state, drop, 1, 1);
console.log(state);