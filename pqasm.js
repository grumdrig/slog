// PQAsm

const SLOTS = [
	'GAMEOVER',

	'RACE',
	'LEVEL',
	'XP',

	'HOURS',
	'YEARS',

	'MAX_HP',
	'DAMAGE',

	'MAX_MP',
	'FATIGUE',

	'ARMOR_CLASS',
	'ENCUMBRANCE',
	'CAPACITY',

	'ENCHANTMENT',
	'ENCHANTMENT_LEVEL',

	'STAT_STRENGTH',
	'STAT_AGILITY',
	'STAT_CONSTITUTION',
	'STAT_INTELLIGENCE',
	'STAT_WISDOM',
	'STAT_CHARISMA',

	'SPELL_HEAL',
	'SPELL_FIREBALL',
	'SPELL_HASTE',
	'SPELL_BUFF',
	'SPELL_LUCK',
	'SPELL_6', //

	'EQUIPMENT_WEAPON',
	'EQUIPMENT_ARMOR',
	'EQUIPMENT_SHIELD',
	'EQUIPMENT_HEADGEAR',
	'EQUIPMENT_FOOTWEAR',
	'EQUIPMENT_MOUNT',
	'EQUIPMENT_RING',
	'EQUIPMENT_TOTEM',

	'INVENTORY_GOLD',
	'INVENTORY_SPOILS',
	'INVENTORY_REAGENTS',
	'INVENTORY_RESOURCES',
	'INVENTORY_FOOD',
	'INVENTORY_TREASURES',
	'INVENTORY_POTIONS',
	'INVENTORY_LIFE_POTIONS',

	'LOCATION',
	'MOB_TYPE',
	'MOB_LEVEL',
	'MOB_DAMAGE',

	'QUEST_OBJECT', // item, by slot, or 0
	'QUEST_MOB', // monster (by id)
	'QUEST_LOCATION', // location to perform the quest
	'QUEST_QTY', // qty # required
	'QUEST_PROGRESS', // # completed
	'QUEST_ORIGIN', // town location

	'ACT', // (up to 9, 10 = win)
	'ACT_DURATION', // # of something required
	'ACT_PROGRESS', // as advanced by quests

	'ESTEEM_DUNKLINGS',
	'ESTEEM_HARDWARVES',
	'ESTEEM_EFFS',

	'SEED',  // PRNG seed
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
const INVENTORY_0 = INVENTORY_GOLD;

const STAT_COUNT = SPELL_0 - STAT_0;
const SPELL_COUNT = EQUIPMENT_0 - SPELL_0;
const EQUIPMENT_COUNT = INVENTORY_0 - EQUIPMENT_0;
const INVENTORY_COUNT = LOCATION - INVENTORY_0;

function isStatSlot(slot)      { return STAT_0      <= slot && slot < STAT_0 + STAT_COUNT }
function isSpellSlot(slot)     { return SPELL_0     <= slot && slot < SPELL_0 + SPELL_COUNT }
function isEquipmentSlot(slot) { return EQUIPMENT_0 <= slot && slot < EQUIPMENT_0 + EQUIPMENT_COUNT }
function isInventorySlot(slot) { return INVENTORY_0 <= slot && slot < INVENTORY_0 + INVENTORY_COUNT }


const CALLS = {
	initialize: {
		parameters: 'slot,value',
		opcode: 0x36,
		description: `Before the game starts, the character may assign up to
a total of ten points to their six stat slots using this function. Also, the
character's race much be assigned using this function with the slot value
RACE.`,
	},
	startGame: {
		opcode: 0x39,
	},
	train: {
		parameters: 'stat',
		opcode: 0x36,
	},
	study: {
		parameters: 'spell',
		opcode: 0x36,
		description: `Study a spell. Repeated study sessions will enable the
character to learn the spell or increase thier mastery of it. The character is
limited to only four spells, so choose wisely.`,
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
	rest: {
		parameters: DAMAGE,
		opcode: 0x38,
	},
	hunt: {
		parameters: '$' + MOB_TYPE.toString(16),
		opcode: 0x38,
	},
	levelup: {
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

for (let call in CALLS) {
	define(call, CALLS[call].opcode);
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


function generateInterface() {
	let interface = [];

	for (let call in CALLS) {
		let { opcode, parameters } = CALLS[call];
		let externalDef = `external ${call}(${parameters || ''}) = $${opcode.toString(16)}`;
		interface.push(externalDef);
	}

	interface.push('');

	SLOTS.forEach((slot, index) => interface.push(`const ${slot} = ${index}`));

	interface.push('');

	return interface.join('\n');
}

if (typeof process !== 'undefined' && process.argv.includes('--generate-interface')) {
	console.log(generateInterface());
	process.exit();
}

/////////// Weapons

const WEAPON_DB = [null, {
	name: 'Smash',
	list: [
			'Piece of Firewood',
			'Claw Hammer',
			'Club',
			'Great Club',
			'Mace',
			'Maul',
			'Spikemace',
			'Warhammer',
			'Morning Star',
			'+1 Blessed Mace',
			'+2 Bloodthirsty Club',
			'+3 Animated Mace',
			'+4 Gunpowder Hammer',
			'+5 Medusa Mace',
			'+6 Vampyric Hammer',
			'+7 Doomsday Warhammer'
		],
	}, {
		name: 'Slash',
		list: [
			'Steak knife',
			'Dirk',
			'Dagger',
			'Short Sword',
			'Long Sword',
			'Broadsword',
			'Claymore',
			'Bastard sword',
			'Two-handed sword',
			'+1 Magic Sword',
			'+2 Vicious Sword',
			'+3 Stabbity Sword',
			'+4 Dancing Sword',
			'+5 Invisible Sword',
			'+6 Vorpal Sword',
			'+7 Doom Sword'],
	}, {
		name: 'Shoot',
		list:  [
			'Bag of Rocks',
			'Sling',
			'Short Bow',
			'Blunderbuss',
			'Longbow',
			'Crankbow',
			'Crossbow',
			'Compound Bow',
			'Culverin',
			'+1 Precision Bow',
			'+2 Fire Bow',
			'+3 Destruction Bow',
			'+4 Heatseeking Bow',
			'+5 Mindbender Bow',
			'+6 Bow of Terror',
			'+7 Doomsayer Bow'
			],
	}, {
		name: 'Chop',
		list: [
			'Hatchet',
			'Tomahawk',
			'Axe',
			'Battleadze',
			'Baddleaxe',
			'Kreen',
			'War Axe',
			'Double Axe',
			'Filigreed Axe',
			'+1 Mithril Axe',
			'+2 Whirling Axe',
			'+3 Strike Waraxe',
			'+4 Bombastic Adze',
			'+5 Howling Kreen',
			'+6 Fireedge Axe',
			'+7 Galaxy Axe'
			],
	}, {
		name: 'Poke',
		list: [
			'Sharpened stick',
			'Eelspear',
			'Spear',
			'Pole-adze',
			'Spontoon',
			'Lance',
			'Halberd',
			'Poleax',
			'Bandyclef',
			'+1 Enchanted Javelin',
			'+2 Cobra Spear',
			'+3 Hungry Eelspear',
			'+4 Deadly Peen-arm',
			'+5 Nightmare Longiron',
			'+6 Nuclear Poleax',
			'+7 Doommaker Spear'
		],
	}
];

function interleaveArrays(...as) {
	for (let a of as) if (a.length != as[0].length) throw "Weapon lists are different lengths";
	let result = new Array(as[0].length * as.length);
	let n = 0;
	for (let i = 0; i < as[0].length; ++i)
		for (let a of as)
			result[n++] = a[i];
	return result;
}

const WEAPON_NAMES = [''].concat(interleaveArrays(...WEAPON_DB.filter(x=>x).map(w => w.list)));
// Weapon types
const SMASH = 1;
const SLASH = 2;
const SHOOT = 3;
const POKE = 4;
const AXE = 5;
const NUM_WEAPON_TYPES = 5;

function weaponPower(n) {
	return Math.floor((n + NUM_WEAPON_TYPES - 1) / NUM_WEAPON_TYPES);
}

function weaponType(n) { return (n - 1) % NUM_WEAPON_TYPES }

/////// Armor and other equipment

const HEADGEAR_NAMES = ['',
	'Cap',
	'Helmet',
	'Warhelm',
	'Tower Helm',
	'+1 Shield Helm',
	'+2 Winged Helm',
	'+3 Horned Helm',
	'+4 Disruption Helm',
	'+5 Apocalypse Cap'];

const ARMOR_NAMES = ['',
	'Clothing',
	'Cloth Armor',
	'Leather Suit',
	'Chainmail',
	'Split Mail',
	'Plate Mail',
	'+1 Safety Mail',
	'+2 Holy Mail',
	'+3 Shimmering Mail',
	'+4 Phase Armor',
	'+5 Midnight Plate',
	'+6 Horrorplate'];

const SHIELD_NAMES = ['',
	'Cookie Sheet',
	'Round Shield',
	'Battle Shield',
	'War Shield',
	'Tower Shield',
	'+1 Lucky Shield',
	'+2 Shield of Nope',
	'+3 Plasma Shield',
	'+4 Mecha Barrier',
	'+5 Dimension Door'];

const FOOTWEAR_NAMES = ['',
	'Shoes',
	'Boots',
	'Chainmail Boots',
	'Platemail Leggings',
	'+1 Dragoon Boots',
	'+2 Dragon Boots',
	'+3 Magic Slippers',
	'+4 Superboots',
	'+5 Moon Skippers'];

const MOUNT_NAMES = ['',
	'Tricycle',
	'Goat',
	'Donkey',
	'Mule',
	'Horse',
	'Warhorse',
	'+1 Fancy Horse',
	'+2 Pseudogoat',
	'+3 Hammerhorse',
	'+4 Firehorse',
	'+5 Kelpie'];



///////// Races

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
		startingitems: [
			{ slot: EQUIPMENT_WEAPON, value: 2},
			{ slot: EQUIPMENT_HEADGEAR, value: 1},
			{ slot: INVENTORY_FOOD, value: 1 },
		],
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
		startingitems: [
			{ slot: EQUIPMENT_WEAPON, value: 1},
			{ slot: EQUIPMENT_SHIELD, value: 1},
			{ slot: INVENTORY_GOLD, value: 1 },
		],
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
		startingitems: [
			{ slot: EQUIPMENT_WEAPON, value: 3},
			{ slot: EQUIPMENT_FOOTWEAR, value: 1},
			{ slot: INVENTORY_REAGENTS, value: 1 },
		],
	}
];


const DUNKLING = 1;
const HARDWARF = 2;
const EFF = 3;
const GAST = 4;


///////////////// Map

const TERRAIN_TYPES = [
	null, {
		name: 'Tundra',
	}, {
		name: 'Forest',
		moveCost: 3,
	}, {
		name: 'Town',
	}, {
		name: 'Hills',
		moveCost: 2,
	}, {
		name: 'Mountains',
		moveCost: 4,
	}, {
		name: 'Plains',
		forage: 2,
	}, {
		name: 'Marsh',
		moveCost: 2.5,
		forage: 0,
	}, {
		name: 'Desert',
		forage: 0,
	}];

TERRAIN_TYPES.forEach((info, index) => {
	if (info) define(info.name.toUpperCase(), index);
});


// const TUNDRA = 1;
// const FOREST = 2;
// const TOWN = 3;
// const HILLS = 4;
// const MOUNTAINS = 5;
// const PLAINS = 6;
// const MARSH = 7;
// const DESERT = 8;


const MOBS = [
	null,
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
		hitdice: 2,
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


const MAP = [null,
	{
		index: 1,
		name: "Watha",
		terrain: TUNDRA,
		level: 7
	}, {
		index: 2,
		name: "Maak",
		terrain: TUNDRA,
		level: 5,
	}, {
		index: 3,
		name: "Wolfin Forest",
		terrain: FOREST,
		level: 2,
	}, {
		index: 4,
		name: "Hohamp",
		terrain: TOWN,
		level: 0,
	}, {
		index: 5,
		name: "Skiddo",
		terrain: HILLS,
		level: 1,
	}, {
		index: 6,
		name: "Chinbreak Cliff",
		terrain: MOUNTAINS,
		level: 7,

	}, {
		index: 7,
		name: "Yar",
		terrain: TOWN,
		level: 0,
	}, {
		index: 8,
		name: "Deepni Woods",
		terrain: FOREST,
		level: 7,
	}, {
		index: 9,
		name: "Barkmot Forest",
		terrain: FOREST,
		level: 7,
	}, {
		index: 10,
		name: "Goldona Hills",
		terrain: HILLS,
		level: 3,
	}, {
		index: 11,
		name: "Breezeby Peak",
		terrain: MOUNTAINS,
		level: 5,
	}, {
		index: 12,
		name: "Iperko Forest",
		terrain: FOREST,
		level: 1,

	}, {
		index: 13,
		name: "Blesh Grove",
		terrain: FOREST,
		level: 2,
	}, {
		index: 14,
		name: "Donday Hill",
		terrain: HILLS,
		level: 3,
	}, {
		index: 15,
		name: "Skidge Mountain",
		terrain: MOUNTAINS,
		level: 5,
	}, {
		index: 16,
		name: "Edl Mountain",
		terrain: MOUNTAINS,
		level: 4,
	}, {
		index: 17,
		name: "Sprue Forest",
		terrain: FOREST,
		level: 2,
	}, {
		index: 18,
		name: "Bompton",
		terrain: TOWN,
		denizen: DUNKLING,
		level: 0,

	}, {
		index: 19,
		name: "Terfu Plain",
		terrain: PLAINS,
		level: 3,
	}, {
		index: 20,
		name: "Blue Mist Mountains",
		terrain: MOUNTAINS,
		level: 1,
	}, {
		index: 21,
		name: "Pillary",
		terrain: TOWN,
		civilization: HARDWARF,
		level: 0,
	}, {
		index: 22,
		name: "Grein Hills",
		terrain: HILLS,
		level: 3,
	}, {
		index: 23,
		name: "Woofa Plain",
		terrain: PLAINS,
		level: 2,
	}, {
		index: 24,
		name: "Hallon Prairie",
		terrain: PLAINS,
		level: 1,

	}, {
		index: 25,
		name: "Donga Marsh",
		terrain: MARSH,
		level: 1,
	}, {
		index: 26,
		name: "Panar Plain",
		terrain: PLAINS,
		level: 2,
	}, {
		index: 27,
		name: "Owlholm Woods",
		terrain: FOREST,
		level: 4,
	}, {
		index: 28,
		name: "Papay Forest",
		terrain: FOREST,
		level: 3,
	}, {
		index: 29,
		name: "Delial",
		terrain: TOWN,
		civilization: DUNKLING,
		level: 0,
	}, {
		index: 30,
		name: "Solla Desert",
		terrain: DESERT,
		level: 1,

	}, {
		index: 31,
		name: "Cholar",
		terrain: TOWN,
		civilization: DUNKLING,
		level: 0,
	}, {
		index: 32,
		name: "Ritoli Marsh",
		terrain: MARSH,
		level: 4,
	}, {
		index: 33,
		name: "Arapet Plains",
		terrain: PLAINS,
		level: 6,
	}, {
		index: 34,
		name: "Wheewit Forest",
		terrain: FOREST,
		level: 5,
	}, {
		index: 35,
		name: "Enotar Plains",
		terrain: PLAINS,
		level: 4,
	}, {
		index: 36,
		name: "Noonaf Wastes",
		terrain: DESERT,
		level: 5,

	}, {
		index: 37,
		name: "Emkell Peak",
		latitude: 3,
		longitude: 8,
		neighbors: [38],
		terrain: MOUNTAINS,
		level: 9,
	}, {
		index: 38,
		name: "Sygnon Tower",
		latitude: 4,
		longitude: 8,
		neighbors: [37],
		terrain: TOWN,
		civilization: GAST,
		level: 0,
	}];

MAP.filter(t => t).forEach(t => {
	t.longitude = (t.index - 1) % 6;
	t.latitude = ((t.index - 1) / 6) >> 0;
});


///////////////


function carryCapacity(state) {
	return state[STAT_STRENGTH] >> 8 + state[EQUIPMENT_MOUNT];
}

function encumbrance(state) {
	// Gold doesn't count much against encumbrance
	return state[INVENTORY_GOLD] >> 8 +
		state.slice(INVENTORY_GOLD + 1, INVENTORY_0 + INVENTORY_COUNT)
			  .reduce((q, v) => q + v);
}

function armorClass(state) {
	return state[EQUIPMENT_ARMOR] +
			state[EQUIPMENT_SHIELD] +
			state[EQUIPMENT_HEADGEAR] +
			state[EQUIPMENT_FOOTWEAR];
}

// Generalized hopefully well from
// https://stackoverflow.com/a/12996028/167531
function hash(...keys) {
	let x = 0;
	for (let k of keys) x = ((x ^ (k >> 16) ^ k) * 0x45d9f3b) & 0x7fffffff;
    x = (((x >> 16) ^ x) * 0x45d9f3b) & 0x7fffffff;
    x = (x >> 16) ^ x;
    return x ;
}

let TASK = '';

class Game {
	static create(code) {
		let state = new Int16Array(SLOTS.length);
		state[SEED] = hash(0x3FB9, ...code);
		return state;
	}

	static generateInterface = generateInterface;

	static RACE_NAMES = RACES.map(r => (r && r.name) || 'TBD');
	static TERRAIN_TYPES = TERRAIN_TYPES;
	static MOBS = MOBS;
	static MAP = MAP;
	static EQUIPMENT_NAMES = [
		WEAPON_NAMES,
		ARMOR_NAMES,
		SHIELD_NAMES,
		HEADGEAR_NAMES,
		FOOTWEAR_NAMES,
		MOUNT_NAMES];

	static dumpState(state) {
		for (let i = 0; i < SLOTS.length; ++i)
			if (state[i])
				console.log(SLOTS[i] + ': ' + state[i]);
	}

	static handleInstruction(state, opcode, arg1, arg2) {
		let result = this._handleInstruction(state, opcode, arg1, arg2);
		state[CAPACITY] = carryCapacity(state);
		state[ENCUMBRANCE] = encumbrance(state);
		state[ARMOR_CLASS] = armorClass(state);
		return result;
	}

	static _handleInstruction(state, opcode, arg1, arg2) {

		let seed = hash(state[SEED], 0x5EED, opcode, arg1, arg2);
		state[SEED] = seed;

		// seed and key are integers on [0, 0x7fffffff]
		// result is real on [0, 1)
		function rand(...keys) {
			seed = hash(seed, 0xf70a75);
			if (seed < 0) throw "Bad random algorithm";
			return seed / 0x7fffffff;
		}

		// random integer given keys on [0, ..., scale-1]
		function irand(scale) {
			seed = hash(seed, 0x147e9e7);
			if (seed < 0) throw "Bad random algorithm";
			return seed % scale;
		}

		function d(pips) { return irand(pips) + 1 }

		function randomPick(a) { return a[irand(a.length)] }

		function STR() { return state[STAT_CONSTITUTION] >> 8 }
		function DEX() { return state[STAT_AGILITY] >> 8 }
		function CON() { return state[STAT_CONSTITUTION] >> 8 }
		function INT() { return state[STAT_INTELLIGENCE] >> 8 }
		function WIS() { return state[STAT_WISDOM] >> 8 }
		function CHA() { return state[STAT_CHARISMA] >> 8 }

		function battle(invulnerable=false) {
			if (!state[MOB_TYPE]) return -1;

			let info = MOBS[state[MOB_TYPE]];
			if (!info) return -1;

			if (info.esteemSlot)
				state[info.esteemSlot] = Math.max(state[info.esteemSlot] - 1, 0);

			let mobLevel = info.hitdice;
			let mobOffsense = info.hitdice;
			let mobDefense = info.hitdice;
			let mobSharpness = info.hitdice;
			let mobMaxHP = info.hitdice * 2;

			// Player attack
			function rollAttack(offsense, defense, sharpness) {
				let DIE = 10;
				let attackRoll = d(DIE);
				let defenseRoll = d(DIE);
				if (attackRoll === 1) return 0;
				if (attackRoll === DIE || attackRoll + offsense > defenseRoll + defense) {
					let damage = d(sharpness);
					if (defenseRoll == DIE && damage > 1) damage = 1;
					if (defenseRoll == 1) damage >>= 1;
					return damage;
				} else {
					return 0;
				}
			}

			function STR() { return state[STAT_CONSTITUTION] >> 8 }
			function DEX() { return state[STAT_AGILITY] >> 8 }
			function CON() { return state[STAT_CONSTITUTION] >> 8 }
			function INT() { return state[STAT_INTELLIGENCE] >> 8 }
			function WIS() { return state[STAT_WISDOM] >> 8 }
			function CHA() { return state[STAT_CHARISMA] >> 8 }

			const playerAttack = DEX() + weaponPower(state[EQUIPMENT_WEAPON]);

			let dealtToMob = rollAttack(DEX(), mobDefense, STR());
			let dealtToPlayer = rollAttack(mobOffsense, DEX(), mobSharpness);

			if (DEX() + d(6) >= mobLevel + d(6)) {
				// Player attacks first
				state[MOB_DAMAGE] += dealtToMob;
				if (state[MOB_DAMAGE] < mobMaxHP) {
					state[DAMAGE] += dealtToPlayer;
				}
			} else {
				state[DAMAGE] += dealtToPlayer;
				if (state[DAMAGE] < state[MAX_HP]) {
					state[MOB_DAMAGE] += dealtToMob;
				}
			}

			let levelDisadvantage = state[MOB_LEVEL] - state[LEVEL];
			if (state[MOB_DAMAGE] >= mobMaxHP) {
				state[XP] += 10 * state[MOB_LEVEL] * Math.pow(1.5, levelDisadvantage);
				let ndrops = Math.min(1, carryCapacity(state));
				state[INVENTORY_SPOILS] += ndrops;
				if (state[MOB_TYPE] == state[QUEST_MOB]) state[QUEST_PROGRESS] += 1;
				state[MOB_DAMAGE] = 0;
				state[MOB_TYPE] = 0;
				state[MOB_LEVEL] = 0;
			}

			if (state[DAMAGE] >= state[MAX_HP]) {
				state[DAMAGE] = state[MAX_HP];
				if (state[INVENTORY_LIFE_POTIONS] > 0) {
					state[INVENTORY_LIFE_POTIONS] -= 1;
					state[DAMAGE] = state[HEALTH] - 1;  // or 0?
				} else {
					// dead. now what?
				}
				return 0;
			} else {
				return 1;
			}

			// let damage = Math.pow(1.5, levelDisadvantage);
			// state[DAMAGE] = Math.min(state[DAMAGE] + damage, state[HEALTH]);
		}


		if (state[LEVEL] === 0) {
			// game hasn't begun
			if (opcode === initialize) {
				let [slot, value] = [arg1, arg2];
				if (value < 0) return -1
				if (slot === RACE) {
					state[slot] = value;
				} else if (STAT_0 <= slot && slot < STAT_0 + STAT_COUNT) {
					state[slot] = value << 8;
				} else {
					return -1;
				}
				return state[slot];

			} else if (opcode === startGame) {
				if (state.slice(STAT_0, STAT_0 + STAT_COUNT).reduce((a,b) => a+b) >> 8 > 10) return -1;
				let raceinfo = RACES[state[RACE]];
				if (!raceinfo) return -1;
				// All good. Start the game.
				for (let stat = STAT_0; stat < STAT_0 + STAT_COUNT; stat += 1) {
					// Add 3 plus race bonuses to stats
					state[stat] += (3 + (raceinfo.stat_mods[SLOTS[stat]] || 0)) << 8;
				}
				state[LEVEL] = 1;
				state[LOCATION] = 18;
				state[MAX_HP] = 6 + CON();
				state[MAX_MP] = 6 + INT();
				for (let { slot, value } of raceinfo.startingitems) {
					state[slot] = value;
				}

				return 1;
			}
			return -1;
		}

		// Game is in process

		let local = this.MAP[state[LOCATION]];
		let questal = this.MAP[state[QUEST_LOCATION]];

		function passTime(task, hours, days) {
			TASK = task;  // TODO this is inelegant
			const HOURS_PER_DAY = 24;
			if (days) hours += HOURS_PER_DAY * days;
			const hoursPerYear = 24 * 365;
			state[HOURS] += hours;
			while (state[HOURS] > hoursPerYear) {
				state[HOURS] -= hoursPerYear;
				state[YEARS] += 1;
			}
		}

		function randomLocation() {
			// A random location on the main island
			// TODO consider local
			return d(36);
		}

		function randomMob() {
			return d(MOBS.length - 1);
		}

		function inventoryCapacity() {
			return Math.max(0, carryCapacity(state) - encumbrance(state));
		}

		if (opcode === travel) {
			const destination = arg1;
			if (destination === state[LOCATION]) return 0;
			let remote = this.MAP[destination];
			if (!remote) return -1;
			if (local.neighbors) {
				if (!local.neighbors.includes(destination)) return -1;
			} else {
				// we're in the 6x6 grid
				let [x0, y0] = [local.longitude, local.latitude];
				let [x1, y1] = [remote.longitude, remote.latitude];
				if (Math.abs(x1 - x0) > Math.abs(y1 - y0)) {
					y1 = y0;
					x1 = (x1 < x0) ? x0 - 1 : x0 + 1;
				} else {
					x1 = x0;
					y1 = (y1 < y0) ? y0 - 1 : y0 + 1;
				}
				remote = this.MAP[x1 + 6 * y1 + 1];
				if (!remote) return -1;  // but shouldn't happen
			}
			let hours = 24;
			let travelspeed = (CON() + state[EQUIPMENT_MOUNT]) / 5;
			let terrain = TERRAIN_TYPES[remote.terrain];
			hours *= terrain.moveCost || 1;
			hours = Math.round(hours / travelspeed);
			state[LOCATION] = remote.index;
			state[MOB_TYPE] = 0;
			state[MOB_LEVEL] = 0;
			state[MOB_DAMAGE] = 0;
			passTime('Travelling', hours);
			return 1;

		} else if (opcode === melee) {
			passTime('Fighting', 1);
			return battle();

		} else if (opcode === buyItem) {
			let slot = arg1;
			let qty, levelToBe, capacity;
			if (isEquipmentSlot(slot)) {
				qty = 1;
				levelToBe = arg2;
				capacity = state[slot] ? 0 : 1;
			} else if (isInventorySlot(slot)) {
				qty = arg2;
				levelToBe = state[slot] + qty;
				capacity = carryCapacity(state) - encumbrance(state);
			} else {
				return -1;
			}
			let price = local.price[slot];
			if (!price) return -1;  // Make sure it's available here

			if (arg2 === 0) {
				// It's a price check only
				passTime('Checking prices', 1);
				return price;
			}

			price *= qty;
			if (state[GOLD] < price) return -1;  // Can't afford it
			if (capacity < qty) return -1;  // No room

			// You may proceed with the purchase
			state[GOLD] -= price;
			state[slot] = levelToBe;
			passTime('Buying', 1);
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
			function marketValue(slot) {
				// TODO
				return 1;
			}
			let price = qty * 0.5 * marketValue(slot);
			if (opcode !== give) {
				state[INVENTORY_GOLD] += price;
			} else if (state[QUEST_OBJECT] === slot) {
				state[QUEST_PROGRESS] += qty;
			}
			state[slot] -= qty;
			passTime('Selling', 1, 0);
			return qty;

		} else if (opcode === seekquest) {
			passTime('Asking around about quests', 1, 0);
			if (local.terrain !== TOWN) return -1;
			let questTypes = [_ => {
				// Exterminate the ___
				state[QUEST_LOCATION] = randomLocation();
				state[QUEST_MOB] = randomMob();
				state[QUEST_OBJECT] = 0;
				state[QUEST_QTY] = 5 + d(10);
			}, _ => {
				// Bring me N of SOMETHING
				state[QUEST_LOCATION] = 0;
				state[QUEST_OBJECT] = INVENTORY_0 + irand(INVENTORY_COUNT);
				state[QUEST_MOB] = 0;
				state[QUEST_QTY] = 5 * d(10);
			}, _ => {
				if (state[EQUIPMENT_TOTEM]) {
					// Deliver this totem
					state[QUEST_OBJECT] = EQUIPMENT_TOTEM;
					state[QUEST_LOCATION] = randomLocation();
					state[QUEST_QTY] = 0;
				} else {
					// Seek the totem
					state[QUEST_OBJECT] = EQUIPMENT_TOTEM;
					state[QUEST_LOCATION] = randomLocation();
					state[QUEST_QTY] = 1;
				}
			}];
			randomPick(questTypes)();
			state[QUEST_PROGRESS] = 0;
			state[QUEST_ORIGIN] = state[LOCATION];
			return 1;

		} else if (opcode === completequest) {
			if (!state[QUEST_OBJECT] && !state[QUEST_MOB]) return -1;
			if (state[QUEST_ORIGIN] != state[LOCATION]) return -1;
			if (state[QUEST_PROGRESS] < state[QUEST_QTY]) return -1;
			state[XP] += 100;
			state[ACTPROGRESS] += 1;
			if (state[ACTPROGRESS] >= state[ACTDURATION]) {
				state[ACT] += 1;
				state[ACTDURATION] = ACT_LENGTHS[state[ACT]];
				state[ACTPROGRESS] = 0;
			}
			state[QUEST_OBJECT] = 0;
			state[QUEST_MOB] = 0;
			state[QUEST_LOCATION] = 0;
			state[QUEST_ORIGIN] = 0;
			state[QUEST_PROGRESS] = 0;
			state[QUEST_QTY] = 0;
			return 1;

		} else  if (opcode === train) {
			// aka study
			let slot = arg1;
			if (local.terrain !== TOWN) return -1;
			if (!isSpellSlot(slot) && !isStatSlot(slot)) return -1;
			if (state[slot] >> 8 >= 99) return 0;
			if (isSpellSlot(slot) && state.filter((v, s) => isSpellSlot(s) &&
					((v >> 8) || (s === slot))).length > 4) {
				return -1;  // max spells already learned
			}
			passTime(opcode === train ? 'Training' : 'Studying', 0, 1);
			let learns = Math.round(256 * Math.exp(1/5, 1.5));
			// TODO other factors, like race, stats, random chance?
			state[slot] += learns;
			return state[slot];

		} else if (opcode === cast) {
			let spell = arg1;
			if (!isSpellSlot(spell)) return -1;
			let level = state[spell];
			if (level < 1) return -1;
			const manaused = 1;
			passTime('Casting', 1);
			if (state[FATIGUE] + manaused > state[ENERGY])
				return -1;
			state[FATIGUE] += manaused;
			if (spell === HEAL) {
				state[DAMAGE] = Math.min(state[DAMAGE] - level, 0);
			} else if (spell === FIREBALL) {
				return battle(true);
			} else if (spell === HASTE || spell === BUFF || spell === INVISIBILITY || spell === LUCK) {
				state[ENCHANTMENT] = spell;
				state[ENCHANTMENTLEVEL] = spell;
				// TODO: effects of these
			} else {
				return -1;
			}
			return level;

		} else if (opcode === forage) {  // or hunt, or rest
			let target = arg1;
			let qty;
			if (target === MOB_TYPE) {
				state[MOB_TYPE] = 0;
				state[MOB_LEVEL] = 0;
				state[MOB_DAMAGE] = 0;
				for (let i = 0; i < 4; ++i) {
					// location.mobtype;
					let t = randomMob();
					let l = MOBS[t].hitdice + d(2) - d(2);
					if (!state[MOB_TYPE] || Math.abs(l - local.level) <
											Math.abs(state[MOB_LEVEL] - local.level)) {
						state[MOB_TYPE] = t;
						state[MOB_LEVEL] = l;
					}
				}
				state[MOB_DAMAGE] = 0;
				qty = state[MOB_TYPE] ? 1 : 0;
			} else if (target === DAMAGE) {
				passTime('Resting', 0, 1);
				let heal = d(CON());
				if (local.terrain !== TOWN)
					heal = Math.round(heal * rand() * rand());
				heal = Math.min(heal, state[DAMAGE]);
				state[DAMAGE] -= heal;
				return heal;

			} else if (target === EQUIPMENT_TOTEM) {
				passTime('Hunting for the totem', 6);
				if (d(20) <= INT()) {
					state[EQUIPMENT_TOTEM] = state[LOCATION];
					return 1;
				} else {
					return 0;
				}

			} else if (isInventorySlot(target)) {
				if (!inventoryCapacity()) return -1;
				qty = rand() < 0.5 ? 1 : 0;
				qty = Math.min(qty, inventoryCapacity());
				state[target] += qty;
			} else {
				return -1;
			}
			passTime(target === MOB_TYPE ? 'Hunting' : 'Foraging', 1);
			return qty;

		} else if (opcode === levelup) {
			if (state[LEVEL] >= 99) return 0;
			if (state[XP] < this.xpNeededForLevel(state[LEVEL] + 1))
				return 0;
			state[LEVEL] += 1;
			passTime('Levelling up', 1, 0);
			return 1;
		}

		if (state[DAMAGE] >= state[MAX_HP]) {
			state[GAMEOVER] = 0xDEAD;
		} else if (state[YEARS] >= 10) {
			state[GAMEOVER] = 0xA9ED;
		} else if (state[ACT] > 9) {
			state[GAMEOVER] = 0x1;
		}
	}

	static xpNeededForLevel(level) {
		return 0 + Math.floor(Math.pow(level - 1, 1.6)) * 200;
	}

}

if (typeof exports !== 'undefined') {
	exports.Game = Game;
	exports.generateInterface = generateInterface;
}

