// PQAsm

const SLOTS = [
	{ name: 'GAMEOVER',
	  description: `The game sets this value when it comes to an end. If it
	  ever becomes non-zero, you won't be around to see it.` },

	{ name: 'RACE',
	  description: `Your character's species, choses before the game starts.
	  Each choice has it's own inherent minor strengths and weaknesses.` },

	{ name: 'LEVEL',
	  description: `As you gain experience, your level increases. Higher
	  levels mean increased abilities accross the board.` },
	{ name: 'XP',
	  description: `Experience points may be earned by defeating mobs and
	  completing quests. Earn enough and you'll be able to level up.` },

	{ name: 'YEARS',
	  description: `Years of in-game time elapsed since the start of the game.` },
	{ name: 'HOURS',
	  description: `Hours of the current year which have gone by. There are 24
	  hours in a day, 32 days in a month, 12 months in a year. Therefore,
	  there are 9216 hours in a year.` },

	{ name: 'MAX_HEALTH',
	  description: `Maximum hit points, i.e. the amount of damage you can sustain
	  before death.` },
	{ name: 'HEALTH',
	  description: `Current health level; MAX_HEALTH minus damage sustained.` },

	{ name: 'MAX_ENERGY',
	  description: `The maximum energy available to you for casting spells and
	  other exhausting tasks.` },
	{ name: 'ENERGY',
	  description: `Energy available at the moment, from MAX_ENERGY down to zero.
	  It drops as fatigue sets in.` },

	{ name: 'ARMOR_CLASS',
	  description: `Defensive rating calculated based on equipment and bonuses.` },

	{ name: 'ENCUMBRANCE',
	  description: `Total weight of carried items, not to exceed CAPACITY.` },

	{ name: 'CAPACITY',
	  description: `Maximum weight you could possibly carry.` },


	{ name: 'ENCHANTMENT',
	  description: `Active enchantment currently affecting you.` },

	{ name: 'ENCHANTMENT_LEVEL',
	  description: `Level of the current active enchantment.` },


	{ name: 'STAT_STRENGTH',
	  description: `Ability to deal damage and lift heavy things.` },

	{ name: 'STAT_AGILITY',
	  description: `Ability to move around, avoid death, etc.` },

	{ name: 'STAT_CONSTITUTION',
	  description: `Ability to absorb damage and retain energy.` },

	{ name: 'STAT_INTELLIGENCE',
	  description: `Rating of cognitive ability and perception.` },

	{ name: 'STAT_WISDOM',
	  description: `Knowlege and sagacity.` },

	{ name: 'STAT_CHARISMA',
	  description: `Likeability and ability to read others.` },

	{ name: 'SPELLBOOK_0', description: `TBA` },
	{ name: 'SPELLBOOK_1', description: `TBA` },
	{ name: 'SPELLBOOK_2', description: `TBA` },
	{ name: 'SPELLBOOK_3', description: `TBA` },

	{ name: 'EQUIPMENT_WEAPON',

	  description: `` },

	{ name: 'EQUIPMENT_ARMOR',

	  description: `` },

	{ name: 'EQUIPMENT_SHIELD',

	  description: `` },

	{ name: 'EQUIPMENT_HEADGEAR',

	  description: `` },

	{ name: 'EQUIPMENT_FOOTWEAR',

	  description: `` },

	{ name: 'EQUIPMENT_MOUNT',

	  description: `` },

	{ name: 'EQUIPMENT_RING',

	  description: `` },

	{ name: 'EQUIPMENT_TOTEM',

	  description: `` },


	{ name: 'INVENTORY_GOLD',

	  description: `` },

	{ name: 'INVENTORY_SPOILS',

	  description: `` },

	{ name: 'INVENTORY_REAGENTS',

	  description: `` },

	{ name: 'INVENTORY_RESOURCES',

	  description: `` },

	{ name: 'INVENTORY_FOOD',

	  description: `` },

	{ name: 'INVENTORY_TREASURES',

	  description: `` },

	{ name: 'INVENTORY_POTIONS',

	  description: `` },

	{ name: 'INVENTORY_LIFE_POTIONS',

	  description: `` },


	{ name: 'LOCATION',

	  description: `` },

	{ name: 'MOB_TYPE',

	  description: `` },

	{ name: 'MOB_LEVEL',

	  description: `` },

	{ name: 'MOB_DAMAGE',

	  description: `` },


	{ name: 'QUEST_OBJECT', // item, by slot, or 0

	  description: `` },

	{ name: 'QUEST_MOB', // monster (by id)

	  description: `` },

	{ name: 'QUEST_LOCATION', // location to perform the quest

	  description: `` },

	{ name: 'QUEST_QTY', // qty # required

	  description: `` },

	{ name: 'QUEST_PROGRESS', // # completed

	  description: `` },

	{ name: 'QUEST_ORIGIN', // town location

	  description: `` },


	{ name: 'ACT', // (up to 9, 10 = win)

	  description: `` },

	{ name: 'ACT_DURATION', // # of something required

	  description: `` },

	{ name: 'ACT_PROGRESS', // as advanced by quests

	  description: `` },


	{ name: 'BALANCE_GOLD',      // bank of Bompton...

	  description: `` },

	{ name: 'BALANCE_TREASURES', // ...balances

	  description: `` },


	{ name: 'ESTEEM_DUNKLINGS',

	  description: `` },

	{ name: 'ESTEEM_HARDWARVES',

	  description: `` },

	{ name: 'ESTEEM_EFFS',

	  description: `` },


	{ name: 'SEED',  // PRNG seed

	  description: `` },

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
SLOTS.forEach((slot, i) => define(slot.name, i));

const STAT_0 = STAT_STRENGTH;
const EQUIPMENT_0 = EQUIPMENT_WEAPON;
const INVENTORY_0 = INVENTORY_GOLD;

const STAT_COUNT = SPELLBOOK_0 - STAT_0;
const SPELLBOOK_COUNT = EQUIPMENT_0 - SPELLBOOK_0;
const EQUIPMENT_COUNT = INVENTORY_0 - EQUIPMENT_0;
const INVENTORY_COUNT = LOCATION - INVENTORY_0;

function isStatSlot(slot)      { return STAT_0      <= slot && slot < STAT_0 + STAT_COUNT }
function isSpellSlot(slot)     { return SPELLBOOK_0 <= slot && slot < SPELLBOOK_0 + SPELLBOOK_COUNT }
function isEquipmentSlot(slot) { return EQUIPMENT_0 <= slot && slot < EQUIPMENT_0 + EQUIPMENT_COUNT }
function isInventorySlot(slot) { return INVENTORY_0 <= slot && slot < INVENTORY_0 + INVENTORY_COUNT }


const CALLS = {
	initialize: { parameters: 'slot,value',
		description: `Before the game starts, the character may assign up to a
		total of ten points to their six stat slots (STATE_STRENGTH, etc)
		using this function.

		<p>Also, the character's RACE must be assigned.` },

	startGame: {
		description: 'Begin the game! Call initialize() as needed first.' },

	train: { parameters: 'slot',
		description: `Train to improve stats (STAT_STRENGTH, and so on).
		Training speed can be affected by various environmental factors.` },

	learn: { parameters: 'spellbook_slot,spell',
		description: `Study a spell. This spell will replace any existing
		spell in that spellbook slot; each character is limited to only
		four spells at a time, so choose wisely.

		The spellbook_slot is a value from 1 to 4, and spell is one of
		the predfined constants SPELL_*.` },

	travel: { parameters: 'destination',
		description: `Travel towards a given map location. If the destination
		is reachable, this will get them one map location closer. The
		character may not choose the most efficient route, so travel
		step-by-step if more efficiency is desired.` },

	melee: {
		description: `Battle the nearby mob. You'll do damage, they'll do
		damage, everybody's happy. Look around the local area for mobs
		first with hunt().`	},

	buy: { parameters: 'slot,qualanty',
		description: `Buy a quantity of some inventory item
		(INVENTORY_POTIONS, etc.) from the local shopkeeper, You can get a
		price check by passing 0 as the quantitiy.

		<p>Or, buy a piece of equipment (EQUIPMENT_*) of a certain quality. This
		will replace any equipment already in that slot, so consider
		selling it first.` },

	sell: { parameters: 'slot,quantity',
		description: `Sell an inventory item of piece of equipment.` },

	seekquest: {
		description: `While in town, ask around and listen to rumors in hopes
		of discovering adventures that await and tasks to complete.
		aThere's only one quest activate at any given time.` },

	completequest: {
		description: `Report back to the originator of the current quest to
		gain sundry rewards for your efforts.` },

	cast: { parameters: 'spell',
		description: `Cast a spell you've learned; effects may vary. Consumes
		reagents and saps energy.` },

	forage: { parameters: 'target_slot',
		description: `Comb the local area for INVENTORY_FOOD, or
		INVENTORY_RESOURCES, or whatever you might seek.` },

	rest: {
		description: `Grab some downtime to reduce fatigue and damage. Resting
		is much more effected in town than it is out in the wilderness.` },

	hunt: {
		description: `Search around for a mob to kill.`	},

	levelup: {
		description: `Level up! When you've accumulated enough experience, you
		can take yourself to the next level by levelling up. This will
		increase your general effectiveness accross the board, and may
		result in stat or other bonuses.` },

	give: { parameters: 'slot,quantity',
		description: `Hand over in item to whomever is nearby.` },

	drop: { parameters: 'slot,quantity',
		description: `Drop stuff right on the ground, just to get rid of it.` },

	deposit: { parameters: 'slot,quantity',
		description: `When in Bompton Town, stop at the Bank of Bompton where
		you can store INVENTORY_GOLD and INVENTORY_TREASURES. There is a
		one (1) gold charge for each transaction.` },

	withdraw: { parameters: 'slot,quantity',
		description: `Withdraw gold or treasures from the Bank of Bompton.
		There is a 1 GP fee.` },

	retire: {
		description: `End the game. It's gone on long enough already.` },

	cheat: { parameters: 'slot,quantity',
		description: `This does nothing.` },
};

Object.values(CALLS).forEach((c, i) => c.operation = 65 + i);

for (let call in CALLS) {
	define(call, CALLS[call].operation);
}


const HOURS_PER_DAY = 24;
const DAYS_PER_MONTH = 32;
const MONTHS_PER_YEAR = 12;
const HOURS_PER_YEAR = HOURS_PER_DAY * DAYS_PER_MONTH * MONTHS_PER_YEAR;


function generateInterface() {
	let interface = [];

	for (let call in CALLS) {
		let { operation, parameters } = CALLS[call];
		if (parameters)
			interface.push(`macro ${call}(${parameters}) external(${operation},${parameters})`);
		else
			interface.push(`macro ${call}() external(${operation})`);
	}

	interface.push('');

	SLOTS.forEach((slot, index) =>
		interface.push(`const ${slot.name} = ${index}`));

	interface.push('');

	SPELLS.forEach((spell, index) =>
		spell && interface.push(`const ${spell.moniker} = ${index}`));

	interface.push('');

	return interface.join('\n');
}


function generateDocumentation() {

	let result = `<style>
	#gamereference {
		width: 740px;
		padding: 0 20px;
		border: inset 1px silver;
	}
	#gamereference h4 {
		font-size: 18px;
		margin: 16px 0 10px 0;
	}
	</style>`;

	function head(h) { result += `<h3>${h}</h3>`; }
	function subhead(s, d) { result += `<h4>${s}</h4><p>${d ?? ''}`; }
	function p(text) { result += '<p>' + text + '</p>' }

	head('Gameplay Functions');

	for (let call in CALLS) {
		let { parameters, description } = CALLS[call];
		subhead(call + '(' + (parameters ?? '').replace(',',', ') + ')', description);
	}

	head('Game State Slots');

	p(`The constants listed here are indices into the game state vector.
	They are sometimes passed to the gameplay functions above (such as
	<code>train</code> or <code>give</code>); or their value may be accessed using
	the state vector access operator (<code>.</code>). For example <code>.LEVEL</code>
	is the player character's current level.`);

	for (let { name, description } of SLOTS) {
		subhead(name, description);
	}

	head('Spells');

	for (let {name, moniker, enchantment, description} of SPELLS.filter(x=>x)) {
		if (enchantment) moniker += ' (enchantment)';
		subhead(`${moniker}`, description);
	}

	return result;
}


/////////// Spells

const SPELLS = [ null, {
		name: 'Heal Yeah',
		moniker: 'HEAL_YEAH',
		level: 1,
		costs: [
			{ slot: ENERGY, qty: 1 },
			{ slot: INVENTORY_REAGENTS, qty: 1 },
			],
		effect: state => {
			let healing = 1;
			healing *= Math.pow(1.6, state[STAT_WISDOM]);
			healing = Math.round(healing);
			healing = Math.min(healing, state[MAX_HEALTH] - state[HEALTH]);
			state[HEALTH] += healing;
			return healing;
		},
		description: `Heal some or all of any damage you may have sustained.
		The effectiveness of this spell is aided by higher STAT_WISDOM`,
	}, {
		name: 'Pyroclastic Orb',
		moniker: 'PYROCLASTIC_ORB',
		level: 2,
		costs: [
			{ slot: ENERGY, qty: 2 },
			{ slot: INVENTORY_REAGENTS, qty: 2 },
			],
		effect: state => {
			return battle(state, true);
		},
		description: `Hurl a ball of flaming horror at your nearby foe, causing them damage.`,
	}, {
		name: 'Buff',
		moniker: 'BUFF',
		level: 4,
		costs: [
			{ slot: ENERGY, qty: 4 },
			{ slot: INVENTORY_REAGENTS, qty: 4 },
			],
		enchantment: [
			{ slot: STAT_STRENGTH, increment: 4 },
		],
		description: `Become just that much stronger.`,
	}, {
		name: 'Smort',
		moniker: 'SMORT',
		level: 4,
		costs: [
			{ slot: ENERGY, qty: 4 },
			{ slot: INVENTORY_REAGENTS, qty: 4 },
			],
		enchantment: [
			{ slot: STAT_INTELLIGENCE, increment: 4 },
		],
		description: `Become just that much stronger.`,
	},
];
// * Inviso
// * Become the species of the nearby mob
// * Double your money
// * Scramble the map
// * Create a ghost city where you stand
// * Go back to year 0

SPELLS.filter(x=>x).forEach((spell, index) => define(spell.moniker, index));


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
		startState: [
			// { slot: STAT_AGILITY, increment: +2 },
			// { slot: STAT_CHARISMA, increment: +1 },
			// { slot: STAT_STRENGTH, increment: -1 },
			// { slot: STAT_WISDOM, increment: -2 },
			{ slot: EQUIPMENT_WEAPON,   value: 2},
			{ slot: EQUIPMENT_HEADGEAR, value: 1},
			{ slot: INVENTORY_FOOD,     value: 1 },
		],
		description: "Likable, lithe creatures of small stature, often underestimated",
	},
	{
		name: "Hardwarf",
		plural: "Hardwarves",
		index: 2,
		esteems: 3,
		waryof: 1,
		proficiency: SMASH,
		badat: SLASH,
		startState: [
			// { slot: STAT_CONSTITUTION, increment: +2 },
			// { slot: STAT_STRENGTH, increment: +1 },
			// { slot: STAT_AGILITY, increment: -1 },
			// { slot: STAT_INTELLIGENCE, increment: -2 },
			{ slot: EQUIPMENT_WEAPON, value: 1},
			{ slot: EQUIPMENT_SHIELD, value: 1},
			{ slot: INVENTORY_GOLD,   value: 1 },
		],
		description: "Sturdy sorts with a...direct approch to problems",
	},
	{
		name: "Eelman",
		index: 3,
		esteems: 1,
		waryof: 2,
		proficiency: [POKE, SHOOT],
		badat: SMASH,
		startState: [
			{ slot: EQUIPMENT_WEAPON,   value: 3},
			{ slot: EQUIPMENT_FOOTWEAR, value: 1},
			{ slot: INVENTORY_REAGENTS, value: 1 },
		],
		description: "Proud, sometimes haughty, intellectuals",
	}
];


const DUNKLING = 1;
const HARDWARF = 2;
const EELMAN = 3;
const GUST = 4;


///////////////// Map

const TERRAIN_TYPES = [
	null, {
		name: 'Tundra',
		color: 'white',
	}, {
		name: 'Forest',
		color: 'green',
		moveCost: 3,
	}, {
		name: 'Town',
		color: 'violet',
	}, {
		name: 'Hills',
		color: 'peru',
		moveCost: 2,
	}, {
		name: 'Mountains',
		color: 'sienna',
		moveCost: 4,
	}, {
		name: 'Plains',
		color: 'lightgreen',
		forage: { item: INVENTORY_FOOD, rate: 2 },
	}, {
		name: 'Marsh',
		color: 'olive',
		moveCost: 2.5,
		forage: { item: INVENTORY_FOOD, rate: 0 },
	}, {
		name: 'Desert',
		color: 'yellow',
		forage: { item: INVENTORY_FOOD, rate: 0 },
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
		denizen: HARDWARF,
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
		denizen: EELMAN,
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
		name: "Edl Grove",
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
		name: "Krako Mountain",
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
		denizen: HARDWARF,
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
		denizen: DUNKLING,
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
		denizen: DUNKLING,
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
		denizen: GUST,
		level: 0,
	}];

MAP.filter(t => t).forEach(t => {
	t.longitude ??= (t.index - 1) % 6;
	t.latitude ??= ((t.index - 1) / 6) >> 0;
});

const BOMPTON_TOWN = 18;


function generateMap() {
	let result = [];
	let cols = MAP.slice(1).reduce((a,tile) => Math.max(a, tile.longitude+1), 0);
	result.push(`<div class=themap style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:4px">`);
	MAP.slice(1).forEach(tile => {
		result.push(`<div style="grid-column:${tile.longitude+1};grid-row:${tile.latitude+1};background-color:${TERRAIN_TYPES[tile.terrain].color}">
			<div>#${tile.index}</div>
			<div>${tile.name.split(' ')[0]}<br/>
			${TERRAIN_TYPES[tile.terrain].name}</div>
			<div>level ${tile.level}</div>
		</div>`);
	});
	result.push('</div>');

	let preinfo = `<style>
		div.themap {
			display: grid;
			grid-template-columns: repeat(${cols} 1fr);
			gap: 4px;
			width: 740px;
			margin: 0 auto 0 auto;
		}
		div.themap > div {
			border: solid 1px black;
			border-radius: 6px;
			padding: 4px;
			font: 13px sans-serif;
		}
		div.themap > div > div:first-child {
			text-align: right;
		}
		div.themap > div > div:nth-child(2) {
			text-align: center;
		}
	</style>`;

	return preinfo + result.join('\n');
}

///////////////


function carryCapacity(state) {
	return state[STAT_STRENGTH] + state[EQUIPMENT_MOUNT];
}

function encumbrance(state) {
	// Gold doesn't count much against encumbrance
	return (state[INVENTORY_GOLD] >> 8) +
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
	static generateMap = generateMap;
	static generateDocumentation = generateDocumentation;

	static RACE_NAMES = RACES.map(r => (r && r.name) || '');
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
				console.log(SLOTS[i].name + ': ' + state[i]);
	}

	static handleInstruction(state, operation, arg1, arg2) {
		let result = this._handleInstruction(state, operation, arg1, arg2);

		if (state[LEVEL] > 0) {
			state[CAPACITY] = carryCapacity(state);
			state[ENCUMBRANCE] = encumbrance(state);
			state[ARMOR_CLASS] = armorClass(state);

			if (state[HEALTH] <= 0) {
				state[GAMEOVER] = 0xDED;
			} else if (state[YEARS] >= 100) {
				state[GAMEOVER] = 0xA9E;
			} else if (state[ACT] > 9) {
				state[GAMEOVER] = 0x1;
			}
		}

		return result;
	}

	static _handleInstruction(state, operation, arg1, arg2) {

		let seed = hash(state[SEED], 0x5EED, operation, arg1, arg2);
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

		function STR() { return state[STAT_CONSTITUTION] }
		function DEX() { return state[STAT_AGILITY] }
		function CON() { return state[STAT_CONSTITUTION] }
		function INT() { return state[STAT_INTELLIGENCE] }
		function WIS() { return state[STAT_WISDOM] }
		function CHA() { return state[STAT_CHARISMA] }

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

			function STR() { return state[STAT_CONSTITUTION] }
			function DEX() { return state[STAT_AGILITY] }
			function CON() { return state[STAT_CONSTITUTION] }
			function INT() { return state[STAT_INTELLIGENCE] }
			function WIS() { return state[STAT_WISDOM] }
			function CHA() { return state[STAT_CHARISMA] }

			const playerAttack = DEX() + weaponPower(state[EQUIPMENT_WEAPON]);

			let dealtToMob = rollAttack(DEX(), mobDefense, STR());
			let dealtToPlayer = rollAttack(mobOffsense, DEX(), mobSharpness);

			if (DEX() + d(6) >= mobLevel + d(6)) {
				// Player attacks first
				state[MOB_DAMAGE] += dealtToMob;
				if (state[MOB_DAMAGE] < mobMaxHP) {
					state[HEALTH] -= Math.min(dealtToPlayer, state[HEALTH]);
				}
			} else {
				state[HEALTH] -= Math.min(dealtToPlayer, state[HEALTH]);
				if (state[HEALTH] > 0) {
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

			if (state[HEALTH] <= 0) {
				if (state[INVENTORY_LIFE_POTIONS] > 0) {
					state[INVENTORY_LIFE_POTIONS] -= 1;
					state[HEALTH] = 1;  // or max health?
				} else {
					// dead. now what?
				}
				return 0;
			} else {
				return 1;
			}
		}

		function actUp() {
			if (state[ACT_PROGRESS] >= state[ACT_DURATION]) {
				state[ACT] += 1;
				const ACT_LENGTHS = [10, 10, 10, 10, 10, 10, 10, 10, 10, 0]
				state[ACT_DURATION] = ACT_LENGTHS[state[ACT] - 1];
				state[ACT_PROGRESS] = 0;
			}
		}

		if (operation === cheat) {
			// Remove this some time
			let [slot, value] = [arg1, arg2];
			state[slot] = value;
			return value;
		}

		if (state[LEVEL] === 0) {
			// game hasn't begun
			if (operation === initialize) {
				let [slot, value] = [arg1, arg2];
				if (value < 0) return -1
				if (slot === RACE) {
					state[slot] = value;
				} else if (STAT_0 <= slot && slot < STAT_0 + STAT_COUNT) {
					state[slot] = value;
				} else {
					return -1;
				}
				return state[slot];

			} else if (operation === startGame) {
				if (state.slice(STAT_0, STAT_0 + STAT_COUNT).reduce((a,b) => a+b) > 10) return -1;
				let raceinfo = RACES[state[RACE]];
				if (!raceinfo) return -1;
				// All good. Start the game.

				// Have to add two to keep from going negative
				for (let stat = STAT_0; stat < STAT_0 + STAT_COUNT; stat += 1)
					state[stat] += 2;

				for (let { slot, increment, value } of raceinfo.startState ?? [])
					state[slot] = value ?? (state[slot] + increment)

				state[LEVEL] = 1;
				state[LOCATION] = BOMPTON_TOWN;
				state[HEALTH] = state[MAX_HEALTH] = 6 + CON();
				state[ENERGY] = state[MAX_ENERGY] = 6 + INT();
				actUp();

				return 1;
			}
			return -1;
		}

		// Game is in process

		let local = this.MAP[state[LOCATION]];
		let questal = this.MAP[state[QUEST_LOCATION]];

		function passTime(task, hours, days) {
			TASK = task;  // TODO this is inelegant
			if (TASK[TASK.length - 1] !== '.') TASK += '...';
			if (days) hours += HOURS_PER_DAY * days;
			state[HOURS] += hours;
			while (state[HOURS] > HOURS_PER_YEAR) {
				state[HOURS] -= HOURS_PER_YEAR;
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

		if (operation === travel) {
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

		} else if (operation === melee) {
			passTime('Fighting', 1);
			return battle();

		} else if (operation === buy) {
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

		} else if (operation === sell || operation === give || operation === drop) {
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
			if (operation !== give) {
				state[INVENTORY_GOLD] += price;
			} else if (state[QUEST_OBJECT] === slot) {
				state[QUEST_PROGRESS] += qty;
			}
			state[slot] -= qty;
			passTime('Selling', 1, 0);
			return qty;

		} else if (operation === deposit || operation == withdraw) {

			let [slot, qty] = [arg1, arg2];
			const isDeposit = (operation === deposit);

			if (qty < 0) return -1;  // nice try hacker
			if (state[LOCATION] != BOMPTON_TOWN) return -1;  // you're not at the bank

			if (state[INVENTORY_GOLD] + state[BALANCE_GOLD] <= 0)
				return -1;  // Can't afford it

			let bankSlot;
			if (slot == INVENTORY_GOLD) bankSlot = BALANCE_GOLD;
			else if (slot == INVENTORY_TREASURES) bankSlot = BALANCE_TREASURES;
			else return -1;  // Bank doesn't deal in this item

			let fromSlot = isDeposit ? slot : bankSlot;
			let toSlot =  isDeposit ? bankSlot : slot;

			qty = Math.min(qty, state[fromSlot]);

			// TODO not considering weight of item
			let availableCapacity = isDeposit ? MAX_INT - state[toSlot] : state[CAPACITY] - state[ENCUMBRANCE];
			qty = Math.min(qty, availableCapacity);

			if (qty > 0) {
				state[fromSlot] -= qty;
				state[toSlot] += qty;

				// Charge a 1 gold commission per transaction
				if (isDeposit) {
					state[state[INVENTORY_GOLD] > 0 ? INVENTORY_GOLD : BALANCE_GOLD] -= 1;
				} else {
					state[state[BALANCE_GOLD] > 0 ? BALANCE_GOLD : INVENTORY_GOLD] -= 1;
				}

				passTime('Making a bank ' + isDeposit ? 'deposit' : 'withdrawal', 1);
			}

			return qty;

		} else if (operation === seekquest) {
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

		} else if (operation === completequest) {
			if (!state[QUEST_OBJECT] && !state[QUEST_MOB]) return -1;
			if (state[QUEST_ORIGIN] && (state[QUEST_ORIGIN] != state[LOCATION])) return -1;
			if (state[QUEST_PROGRESS] < state[QUEST_QTY]) return -1;
			state[XP] += 100;
			state[ACT_PROGRESS] += 1;
			actUp();
			state[QUEST_OBJECT] = 0;
			state[QUEST_MOB] = 0;
			state[QUEST_LOCATION] = 0;
			state[QUEST_ORIGIN] = 0;
			state[QUEST_PROGRESS] = 0;
			state[QUEST_QTY] = 0;
			return 1;

		} else  if (operation === train) {
			let slot = arg1;
			if (local.terrain !== TOWN) return -1;
			if (!isStatSlot(slot)) return -1;
			if (state[slot] >= 99) return 0;
			let hours = 24;
			hours *= Math.pow(1.6, state[slot]);
			hours *= 10 / (10 + state[STAT_WISDOM]);
			// TODO: town stat-learning bonuses
			// TODO: racial stat-learning bonuses
			passTime('Training', Math.round(hours));
			state[slot] += 1;
			return state[slot];

		} else  if (operation == learn) {
			let [slot, spellType] = [arg1 - 1 + SPELLBOOK_0, arg2];
			let spell = SPELLS[spellType];
			if (!spell) return -1;
			if (local.terrain !== TOWN) return -1;
			if (!isSpellSlot(slot)) return -1;
			let hours = 24;
			hours *= Math.pow(1.6, spell.level);
			hours *= 10 / (10 + state[STAT_WISDOM]);
			// TODO: town spell-learning bonuses?
			// TODO: racial spell-learning bonuses?
			passTime('Learning a spell', Math.round(hours));
			state[slot] = spellType;
			return state[slot];

		} else if (operation === cast) {
			let spellType = arg1;
			let spell = SPELLS[spellType];
			if (!spell) return -1;

			if (state.slice(SPELLBOOK_0, SPELLBOOK_0 + SPELLBOOK_COUNT)
				.filter((spell, slot) => spell == spellType)
				.length == 0) return -1;  // Don't know it

			let level = spell.level;

			for (let { slot, qty } of spell.costs)
				if (state[slot] < qty) return -1;

			passTime('Casting', 1);

			for (let { slot, qty } of spell.costs)
				state[slot] -= qty;

			if (spell.enchantment) {
				let current = SPELLS[state[ENCHANTMENT]];
				if (current) {
					// Reverse current enchantment
					for (let { slot, increment } of current.enchantment) {
						state[slot] -= increment;
					}
				}
				for (let { slot, increment } of spell.enchantment) {
					state[slot] += increment;
				}
				state[ENCHANTMENT] = spellType;
			}

			if (spell.effect) return spell.effect(state);

			return spellType;

		} else if (operation === hunt) {
			passTime('Hunting', 1);
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
			return state[MOB_TYPE] ? 1 : 0;

		} else if (operation === rest) {
			passTime('Resting', 0, 1);
			let hp = d(CON());
			if (local.terrain !== TOWN)
				hp = Math.round(hp * rand() * rand());
			hp = Math.min(hp, state[MAX_HEALTH] - state[HEALTH]);
			state[HEALTH] += hp;

			let mp = d(WIS());
			if (local.terrain !== TOWN)
				mp = Math.round(mp * rand() * rand());
			mp = Math.min(mp, state[MAX_ENERGY] - state[ENERGY]);
			state[ENERGY] += mp;

			return hp + mp;

		} else if (operation === forage) {
			let target = arg1;
			let qty;
			if (target === EQUIPMENT_TOTEM) {
				passTime('Seeking the local totem', 6);
				if (d(20) <= INT()) {
					state[EQUIPMENT_TOTEM] = state[LOCATION];
					return 1;
				} else {
					return 0;
				}
			}

			if (!isInventorySlot(target)) return -1;
			if (!inventoryCapacity()) return -1;

			qty = rand() < 0.5 ? 1 : 0;
			qty = Math.min(qty, inventoryCapacity());
			state[target] += qty;

			passTime('Foraging', 1);
			return qty;

		} else if (operation === levelup) {
			if (state[LEVEL] >= 99) return 0;
			if (state[XP] < this.xpNeededForLevel(state[LEVEL] + 1))
				return 0;
			state[LEVEL] += 1;
			state[HEALTH] = state[MAX_HEALTH] += 3 + additiveStatBonus(state[STAT_CONSTITUTION]);
			state[ENERGY] = state[MAX_ENERGY] += 3 + additiveStatBonus(state[STAT_WISDOM]);
			passTime('Levelling up', 1, 0);
			return 1;

		} else if (operation === retire) {
			state[GAMEOVER] = 0x401;

		} else {
			state[GAMEOVER] = 0xEEE;
			console.log("Invalid operation");
		}
	}

	static xpNeededForLevel(level) {
		return 0 + Math.floor(Math.pow(level - 1, 1.6)) * 200;
	}

}

function additiveStatBonus(stat) {
	return Math.round(Math.pow(1.6, stat)) - 1;
}

if (typeof exports !== 'undefined') {
	exports.Game = Game;
}

if (typeof module !== 'undefined' && !module.parent) {
	// Opened by nodejs as main module
	if (process.argv.includes('--generate-interface')) {
		console.log(generateInterface());
		process.exit();
	}

	if (process.argv.includes('--generate-map')) {
		console.log(generateMap());
		process.exit();
	}
}

