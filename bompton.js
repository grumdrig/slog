// PQAsm

const SLOTS = [
	{ name: 'GameOver',
	  description: `The game sets this value when it comes to an end. If it
	  ever becomes non-zero, you won't be around to see it.` },

	{ name: 'Species',
	  description: `Your character's species, choses before the game starts.
	  Each choice has it's own inherent minor strengths and weaknesses.` },

	{ name: 'Level',
	  description: `As you gain experience, your level increases. Higher
	  levels mean increased abilities accross the board.` },
	{ name: 'Experience',
	  description: `Experience points may be earned by defeating mobs and
	  completing quests. Earn enough and you'll be able to level up.` },

	{ name: 'Years',
	  description: `Years of in-game time elapsed since the start of the game.` },
	{ name: 'Hours',
	  description: `Hours of the current year which have gone by. There are 24
	  hours in a day, 32 days in a month, 12 months in a year. Therefore,
	  there are 9216 hours in a year.` },

	{ name: 'MaxHealth',
	  description: `Maximum hit points, i.e. the amount of damage you can sustain
	  before death.` },
	{ name: 'Health',
	  description: `Current health level; MaxHealth minus damage sustained.` },

	{ name: 'MaxEnergy',
	  description: `The maximum energy available to you for casting spells and
	  other exhausting tasks.` },
	{ name: 'Energy',
	  description: `Energy available at the moment, from MaxEnergy down to zero.
	  It drops as fatigue sets in.` },

	{ name: 'ArmorClass',
	  description: `Defensive rating calculated based on equipment and bonuses.` },

	{ name: 'Encumbrance',
	  description: `Total weight of carried items, not to exceed Capacity.` },

	{ name: 'Capacity',
	  description: `Maximum weight you could possibly carry.` },


	{ name: 'Enchantment',
	  description: `Active enchantment currently affecting you.` },


	{ name: 'StatStrength',
	  description: `Ability to deal damage and lift heavy things.` },

	{ name: 'StatAgility',
	  description: `Ability to move around, avoid death, etc.` },

	{ name: 'StatConstitution',
	  description: `Ability to absorb damage and retain energy.` },

	{ name: 'StatIntelligence',
	  description: `Rating of cognitive ability and perception.` },

	{ name: 'StatWisdom',
	  description: `Knowlege and sagacity.` },

	{ name: 'StatCharisma',
	  description: `Likeability and ability to read others.` },


	{ name: 'Spellbook1',
	  description: `Your spellbook has room for only four spells in its four
	  chapters. This is the spell in the first chapter.` },

	{ name: 'Spellbook2',
	  description: `Spellbook spell number 2.` },

	{ name: 'Spellbook3',
	  description: `Spellbook spell number 3.` },

	{ name: 'Spellbook4',
	  description: `Spellbook spell number 4.` },


	{ name: 'EquipmentWeapon',

	  description: `` },

	{ name: 'EquipmentArmor',

	  description: `` },

	{ name: 'EquipmentShield',

	  description: `` },

	{ name: 'EquipmentHeadgear',

	  description: `` },

	{ name: 'EquipmentFootwear',

	  description: `` },

	{ name: 'EquipmentMount',

	  description: `` },

	{ name: 'EquipmentRing',

	  description: `` },

	{ name: 'EquipmentTotem',

	  description: `` },


	{ name: 'InventoryGold',

	  description: `` },

	{ name: 'InventorySpoils',

	  description: `` },

	{ name: 'InventoryReagents',

	  description: `` },

	{ name: 'InventoryResources',

	  description: `` },

	{ name: 'InventoryFood',

	  description: `` },

	{ name: 'InventoryTreasures',

	  description: `` },

	{ name: 'InventoryPotions',

	  description: `` },

	{ name: 'InventoryLifePotions',

	  description: `` },


	{ name: 'Location',

	  description: `` },

	{ name: 'MobType',

	  description: `` },

	{ name: 'MobLevel',

	  description: `` },

	{ name: 'MobDamage',

	  description: `` },


	{ name: 'QuestObject', // item, by slot, or 0

	  description: `` },

	{ name: 'QuestMob', // monster (by id)

	  description: `` },

	{ name: 'QuestLocation', // location to perform the quest

	  description: `` },

	{ name: 'QuestQty', // qty # required

	  description: `` },

	{ name: 'QuestProgress', // # completed

	  description: `` },

	{ name: 'QuestOrigin', // town location

	  description: `` },


	{ name: 'Act', // (up to 9, 10 = win)

	  description: `` },

	{ name: 'ActDuration', // # of something required

	  description: `` },

	{ name: 'ActProgress', // as advanced by quests

	  description: `` },


	{ name: 'BalanceGold',      // bank of Bompton...

	  description: `` },

	{ name: 'BalanceTreasures', // ...balances

	  description: `` },

	{ name: 'Name',
	  description: `The name by which you...are to be called? You know, a name. Ten characters or less.` },
	{ name: 'Name2' },
	{ name: 'Name3' },
	{ name: 'Name4' },
	{ name: 'Name5' },
	{ name: 'Name6' },
	{ name: 'Name7' },
	{ name: 'Name8' },
	{ name: 'Name9' },
	{ name: 'Name10' },

	{ name: 'Seed',  // PRNG seed

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

// const Level = 1; for example
SLOTS.forEach((slot, i) => define(slot.name, i));

const STAT_0 = StatStrength;
const SPELLBOOK_0 = Spellbook1;
const EQUIPMENT_0 = EquipmentWeapon;
const INVENTORY_0 = InventoryGold;
const NAME_0 = Name;

const STAT_COUNT = SPELLBOOK_0 - STAT_0;
const SPELLBOOK_COUNT = EQUIPMENT_0 - SPELLBOOK_0;
const EQUIPMENT_COUNT = INVENTORY_0 - EQUIPMENT_0;
const INVENTORY_COUNT = Location - INVENTORY_0;
const NAME_COUNT = Seed - NAME_0;

function isStatSlot(slot)      { return STAT_0      <= slot && slot < STAT_0 + STAT_COUNT }
function isSpellSlot(slot)     { return SPELLBOOK_0 <= slot && slot < SPELLBOOK_0 + SPELLBOOK_COUNT }
function isEquipmentSlot(slot) { return EQUIPMENT_0 <= slot && slot < EQUIPMENT_0 + EQUIPMENT_COUNT }
function isInventorySlot(slot) { return INVENTORY_0 <= slot && slot < INVENTORY_0 + INVENTORY_COUNT }


const CALLS = {
	initialize: { parameters: 'slot,value',
		description: `Before the game starts, the character may assign up to a
		total of ten points to their six stat slots (STATE_STRENGTH, etc)
		using this function.` },

	startgame: { parameters: 'species',
		description: 'Pick a species for your character and begin the game!' },

	setname: { parameters: 'string', zeroTerminatedArray: true,
		description: "Pick a name, or we'll pick one for you." },

	train: { parameters: 'slot',
		description: `Train to improve stats (StatStrength, and so on).
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
		(InventoryPotions, etc.) from the local shopkeeper, You can get a
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
		description: `Comb the local area for InventoryFood, or
		InventoryResources, or whatever you might seek.` },

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
		you can store InventoryGold and InventoryTreasures. There is a
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
		let { operation, parameters, zeroTerminatedArray } = CALLS[call];
		let arguments = parameters;
		if (zeroTerminatedArray) {
			operation *= -1;
			arguments = '&' + arguments;
		}
		if (parameters)
			interface.push(`macro ${call}(${parameters}) external(${operation},${arguments})`);
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
	the state vector access operator (<code>.</code>). For example <code>.Level</code>
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
			{ slot: Energy, qty: 1 },
			{ slot: InventoryReagents, qty: 1 },
			],
		effect: state => {
			let healing = 1;
			healing *= Math.pow(1.6, state[StatWisdom]);
			healing = Math.round(healing);
			healing = Math.min(healing, state[MaxHealth] - state[Health]);
			state[Health] += healing;
			return healing;
		},
		description: `Heal some or all of any damage you may have sustained.
		The effectiveness of this spell is aided by higher wisdom`,
	}, {
		name: 'Pyroclastic Orb',
		moniker: 'PYROCLASTIC_ORB',
		level: 2,
		costs: [
			{ slot: Energy, qty: 2 },
			{ slot: InventoryReagents, qty: 2 },
			],
		effect: state => {
			return battle(state, true);
		},
		description: `Hurl a ball of flaming horror at your nearby foe, causing them damage.`,
	}, {
		name: 'Spectral Coinpurse',
		moniker: 'SPECTRAL_COINPURSE',
		level: 5,
		costs: [
			{ slot: Energy, qty: 5 },
			{ slot: InventoryReagents, qty: 5 },
			],
		duration: 24,
		effect: state => {
			let winnings = Math.min(roomFor(InventoryGold, state), state[InventoryGold]);
			return state[InventoryGold] += winnings;
		},
		description: `Double. Your. Money.... Overnight!`,
	}, {
		name: 'Delta P',
		moniker: 'DELTA_P',
		description: `Release a massive pressure discontinuity.`
	}, {
		name: 'History Lessen',
		moniker: 'HISTORY_LESSEN',
		level: 10,
		costs: [
			{ slot: Energy, qty: 10 },
			{ slot: InventoryReagents, qty: 10 },
			],
		effect: state => {
			return state[Years] = 0;
		},
		description: `Go back to when this crazy adventure all started. You get to keep your stuff though.`,
	}, {
		name: "Morph's Outpost",
		moniker: 'MORPHS_OUTPOST',
		level: 3,
		costs: [
			{ slot: Energy, qty: 3 },
			{ slot: InventoryReagents, qty: 3 },
			],
		effect: state => {
			if (!state[MobType]) return -1;
			// TODO: lose current species bonuses
			return state[Species] = state[MobType];
			// TODO: this won't work yet
		},
		description: `Turn yourself in to one of those things. One of those things over there.`,
	}, {
		name: 'Buff',
		moniker: 'BUFF',
		level: 4,
		costs: [
			{ slot: Energy, qty: 4 },
			{ slot: InventoryReagents, qty: 4 },
			],
		enchantment: [
			{ slot: StatStrength, increment: 4 },
		],
		description: `Become just that much stronger.`,
	}, {
		name: 'Invisibility',
		moniker: 'INVISIBILITY',
		level: 6,
		costs: [
			{ slot: Energy, qty: 6 },
			{ slot: InventoryReagents, qty: 6 },
			],
		enchantment: [],
		description: `This doesn't do anything to help; it's just cool.`,
	}, {
		name: 'Smort',
		moniker: 'SMORT',
		level: 4,
		costs: [
			{ slot: Energy, qty: 4 },
			{ slot: InventoryReagents, qty: 4 },
			],
		enchantment: [
			{ slot: StatIntelligence, increment: 4 },
		],
		description: `Become just that much stronger.`,
	}, {
		name: 'Scrambled Eggs',
		moniker: 'SCRAMBLED_EGGS',
		level: 9,
		costs: [
			{ slot: Energy, qty: 9 },
			{ slot: InventoryReagents, qty: 9 },
			],
		enchantment: [],
		effect: (state, spellid) => {
			if (state[Location] > 36) return -1;
			state[Enchantment] = spellid + (state[Location] << 8);
		},
		description: `Royally scramble the island.`,
	}, {
		name: 'Ghost Town',
		moniker: 'GHOST_TOWN',
		level: 5,
		costs: [
			{ slot: Energy, qty: 5 },
			{ slot: InventoryReagents, qty: 5 },
			],
		enchantment: [],
		effect: (state, spellid) => {
			if (state[Location] > 36) return -1;
			state[Enchantment] = spellid + (state[Location] << 8);
			// TODO: the effect
		},
		description: `Bring a ghost town into existence where you now stand.`,
	},
];

SPELLS.forEach((spell, index) => spell && define(spell.moniker, index));


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
		forage: { item: InventoryFood, rate: 2 },
	}, {
		name: 'Marsh',
		color: 'olive',
		moveCost: 2.5,
		forage: { item: InventoryFood, rate: 0 },
	}, {
		name: 'Desert',
		color: 'yellow',
		forage: { item: InventoryFood, rate: 0 },
	}];

TERRAIN_TYPES.forEach((info, index) => {
	if (info) define(info.name.toUpperCase(), index);
});


// Denizens

const DENIZENS = [
	null,
	{
		name: "Dunkling",
		moniker: 'DUNKLING',
		aka: "Nerfling",
		playable: true,
		index: 1,
		esteems: 2,
		waryof: 3,
		proficiency: SLASH,
		badat: [POKE, SHOOT],
		startState: [
			// { slot: StatAgility, increment: +2 },
			// { slot: StatCharisma, increment: +1 },
			// { slot: StatStrength, increment: -1 },
			// { slot: StatWisdom, increment: -2 },
			{ slot: EquipmentWeapon,   value: 2},
			{ slot: EquipmentHeadgear, value: 1},
			{ slot: InventoryFood,     value: 1 },
		],
		description: "Likable, lithe creatures of small stature, often underestimated",
	},
	{
		name: "Hardwarf",
		moniker: 'HARDWARF',
		plural: "Hardwarves",
		playable: true,
		index: 2,
		esteems: 3,
		waryof: 1,
		proficiency: SMASH,
		badat: SLASH,
		startState: [
			// { slot: StatConstitution, increment: +2 },
			// { slot: StatStrength, increment: +1 },
			// { slot: StatAgility, increment: -1 },
			// { slot: StatIntelligence, increment: -2 },
			{ slot: EquipmentWeapon, value: 1},
			{ slot: EquipmentShield, value: 1},
			{ slot: InventoryGold,   value: 1 },
		],
		description: "Sturdy sorts with a...direct approch to problems",
	},
	{
		name: "Eelman",
		moniker: 'EELMAN',
		playable: true,
		index: 3,
		esteems: 1,
		waryof: 2,
		proficiency: [POKE, SHOOT],
		badat: SMASH,
		startState: [
			{ slot: EquipmentWeapon,   value: 3},
			{ slot: EquipmentFootwear, value: 1},
			{ slot: InventoryReagents, value: 1 },
		],
		description: "Proud, sometimes haughty, intellectuals",
	}, {
		name: "Gust",
	}, {
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

DENIZENS.forEach((d, index) => {
	if (d) define(d.name.replace(' ', '_'), index);
});

const MAP = [null,
	{
		name: "Watha",
		terrain: TUNDRA,
		level: 7
	}, {
		name: "Maak",
		terrain: TUNDRA,
		level: 5,
	}, {
		name: "Wolfin Forest",
		terrain: FOREST,
		level: 2,
	}, {
		name: "Hohamp",
		terrain: TOWN,
		denizen: Hardwarf,
		level: 0,
	}, {
		name: "Skiddo",
		terrain: HILLS,
		level: 1,
	}, {
		name: "Chinbreak Cliff",
		terrain: MOUNTAINS,
		level: 7,

	}, {
		name: "Yar",
		terrain: TOWN,
		denizen: Eelman,
		level: 0,
	}, {
		name: "Deepni Woods",
		terrain: FOREST,
		level: 7,
	}, {
		name: "Barkmot Forest",
		terrain: FOREST,
		level: 7,
	}, {
		name: "Goldona Hills",
		terrain: HILLS,
		level: 3,
	}, {
		name: "Breezeby Peak",
		terrain: MOUNTAINS,
		level: 5,
	}, {
		name: "Iperko Forest",
		terrain: FOREST,
		level: 1,

	}, {
		name: "Edl Grove",
		terrain: FOREST,
		level: 2,
	}, {
		name: "Donday Hill",
		terrain: HILLS,
		level: 3,
	}, {
		name: "Skidge Mountain",
		terrain: MOUNTAINS,
		level: 5,
	}, {
		name: "Krako Mountain",
		terrain: MOUNTAINS,
		level: 4,
	}, {
		name: "Sprue Forest",
		terrain: FOREST,
		level: 2,
	}, {
		name: "Bompton",
		terrain: TOWN,
		denizen: Dunkling,
		level: 0,

	}, {
		name: "Terfu Plain",
		terrain: PLAINS,
		level: 3,
	}, {
		name: "Blue Mist Mountains",
		terrain: MOUNTAINS,
		level: 1,
	}, {
		name: "Pillary",
		terrain: TOWN,
		denizen: Hardwarf,
		level: 0,
	}, {
		name: "Grein Hills",
		terrain: HILLS,
		level: 3,
	}, {
		name: "Woofa Plain",
		terrain: PLAINS,
		level: 2,
	}, {
		name: "Hallon Prairie",
		terrain: PLAINS,
		level: 1,

	}, {
		name: "Donga Marsh",
		terrain: MARSH,
		level: 1,
	}, {
		name: "Panar Plain",
		terrain: PLAINS,
		level: 2,
	}, {
		name: "Owlholm Woods",
		terrain: FOREST,
		level: 4,
	}, {
		name: "Papay Forest",
		terrain: FOREST,
		level: 3,
	}, {
		name: "Delial",
		terrain: TOWN,
		denizen: Dunkling,
		level: 0,
	}, {
		name: "Solla Desert",
		terrain: DESERT,
		level: 1,

	}, {
		name: "Cholar",
		terrain: TOWN,
		denizen: Dunkling,
		level: 0,
	}, {
		name: "Ritoli Marsh",
		terrain: MARSH,
		level: 4,
	}, {
		name: "Arapet Plains",
		terrain: PLAINS,
		level: 6,
	}, {
		name: "Wheewit Forest",
		terrain: FOREST,
		level: 5,
	}, {
		name: "Enotar Plains",
		terrain: PLAINS,
		level: 4,
	}, {
		name: "Noonaf Wastes",
		terrain: DESERT,
		level: 5,

	}, {
		name: "Emkell Peak",
		neighbors: [38],
		terrain: MOUNTAINS,
		level: 9,
	}, {
		name: "Sygnon Tower",
		neighbors: [37],
		terrain: TOWN,
		denizen: Gust,
		level: 0,
	}];

const BOMPTON_TOWN = 18;

function longitude(location) { return location > 36 ? 8 : (location - 1) % 6; }
function latitude(location) { return location > 36 ? location - 34 : ((location - 1) / 6) >> 0; }

function mapInfo(location, state) {
	if (0 < location && location <= 36 && (state[Enchantment] & 0xFF) == SCRAMBLED_EGGS) {
		let fixed = state[Enchantment] >> 8;
		location = (((location + 36 - fixed) * 23) + fixed - 1) % 36 + 1;  // whew!
	}
	return MAP[location];
}


function generateMap(scrambleFrom) {
	let result = [];
	let cols = 9;
	result.push(`<div class=themap style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:4px">`);
	for (let l = 1; l <= 38; ++l) {
		let location = l;
		if (scrambleFrom) {
			let fixed = scrambleFrom;
			if (location <= 36) location = (((location + 36 - fixed) * 23) + fixed - 1) % 36 + 1;
		}
		let tile = MAP[location];
		result.push(`<div style="grid-column:${longitude(l)+1};grid-row:${latitude(l)+1};background-color:${TERRAIN_TYPES[tile.terrain].color}">
			<div>#${l}</div>
			<div>${tile.name.split(' ')[0]}<br/>
			${TERRAIN_TYPES[tile.terrain].name}</div>
			<div>level ${tile.level}</div>
		</div>`);
	}
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
	return state[StatStrength] + state[EquipmentMount];
}

const INVENTORY_INFO = [];
INVENTORY_INFO[InventoryGold] =        { value: 1, weight: 1/256 };
INVENTORY_INFO[InventorySpoils] =      { value: 1, weight: 1 };
INVENTORY_INFO[InventoryReagents] =    { value: 1, weight: 1 };
INVENTORY_INFO[InventoryResources] =   { value: 1, weight: 1 };
INVENTORY_INFO[InventoryFood] =        { value: 1, weight: 1 };
INVENTORY_INFO[InventoryTreasures] =   { value: 1000, weight: 3 };
INVENTORY_INFO[InventoryPotions] = 	   { value: 1, weight: 1 };
INVENTORY_INFO[InventoryLifePotions] = { value: 1, weight: 1 };


function encumbrance(state) {
	let result = 0
	for (let i = INVENTORY_0; i < INVENTORY_0 + INVENTORY_COUNT; i += 1) {
		result += INVENTORY_INFO[i].weight * state[i];
	}
	return Math.floor(result);
}

function roomFor(item, state) {
	let available = carryCapacity(state) - encumbrance(state);
	return Math.floor(available / INVENTORY_INFO[item].weight);
}

function armorClass(state) {
	return state[EquipmentArmor] +
			state[EquipmentShield] +
			state[EquipmentHeadgear] +
			state[EquipmentFootwear];
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

function itemsName(sloth) {
	return SLOTS[sloth].name.substr(9).toLowerCase();
}


let TASK = '';

class Game {
	static create(code) {
		let state = new Int16Array(SLOTS.length);
		state[Seed] = hash(0x3FB9, ...code);
		return state;
	}

	static generateInterface = generateInterface;
	static generateMap = generateMap;
	static generateDocumentation = generateDocumentation;

	static SPECIES_NAMES = DENIZENS.map(r => (r && r.name) || '');
	static TERRAIN_TYPES = TERRAIN_TYPES;
	static DENIZENS = DENIZENS;
	static MAP = MAP;
	static mapInfo = mapInfo;
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

	static handleInstruction(state, operation, ...args) {
		let result = this._handleInstruction(state, operation, ...args);

		if (state[Level] > 0) {
			state[Capacity] = carryCapacity(state);
			state[Encumbrance] = encumbrance(state);
			state[ArmorClass] = armorClass(state);

			if (state[Health] <= 0) {
				state[GameOver] = 86;
			} else if (state[Years] >= 100) {
				state[GameOver] = 100;
			} else if (state[Act] > 9) {
				state[GameOver] = 1;
			}
		}

		return result;
	}

	static _handleInstruction(state, operation, ...args) {
		let arg1 = args[0];
		let arg2 = args[1];

		let seed = hash(state[Seed], 0x5EED, state[Years], state[Hours], operation, ...args);

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

		function battle(invulnerable=false) {
			if (!state[MobType]) return -1;

			let info = DENIZENS[state[MobType]];
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

			const playerAttack = state[StatAgility] + weaponPower(state[EquipmentWeapon]);

			let dealtToMob = rollAttack(state[StatAgility], mobDefense, state[StatStrength]);
			let dealtToPlayer = rollAttack(mobOffsense, state[StatAgility], mobSharpness);

			if (state[StatAgility] + d(6) >= mobLevel + d(6)) {
				// Player attacks first
				state[MobDamage] += dealtToMob;
				if (state[MobDamage] < mobMaxHP) {
					state[Health] -= Math.min(dealtToPlayer, state[Health]);
				}
			} else {
				state[Health] -= Math.min(dealtToPlayer, state[Health]);
				if (state[Health] > 0) {
					state[MobDamage] += dealtToMob;
				}
			}

			let levelDisadvantage = state[MobLevel] - state[Level];
			if (state[MobDamage] >= mobMaxHP) {
				state[Experience] += 10 * state[MobLevel] * Math.pow(1.5, levelDisadvantage);
				let ndrops = Math.min(1, carryCapacity(state));
				state[InventorySpoils] += ndrops;
				if (state[MobType] == state[QuestMob]) state[QuestProgress] += 1;
				state[MobDamage] = 0;
				state[MobType] = 0;
				state[MobLevel] = 0;
			}

			if (state[Health] <= 0) {
				if (state[InventoryLifePotions] > 0) {
					state[InventoryLifePotions] -= 1;
					state[Health] = 1;  // or max health?
				} else {
					// dead. now what?
				}
				return 0;
			} else {
				return 1;
			}
		}

		function actUp() {
			if (state[ActProgress] >= state[ActDuration]) {
				state[Act] += 1;
				const ACT_LENGTHS = [10, 10, 10, 10, 10, 10, 10, 10, 10, 0]
				state[ActDuration] = ACT_LENGTHS[state[Act] - 1];
				state[ActProgress] = 0;
			}
		}

		if (operation === cheat) {
			// Remove this some time
			let [slot, value] = [arg1, arg2];
			state[slot] = value;
			return value;
		}

		if (state[Level] === 0) {
			// game hasn't begun
			if (operation === initialize) {
				let [slot, value] = [arg1, arg2];
				if (value < 0) return -1
				if (isStatSlot(slot)) {
					state[slot] = value;
				} else {
					return -1;
				}
				return state[slot];

			} else if (operation === setname) {
				for (let i = 0; i < NAME_COUNT; ++i) {
					state[Name + i] = i < args.length ? args[i] : 0;
				}

			} else if (operation === startgame) {
				let species = arg1;
				let speciesinfo = DENIZENS[species];
				if (!speciesinfo) return -1;

				state[Species] = species;

				if (state.slice(STAT_0, STAT_0 + STAT_COUNT).reduce((a,b) => a+b) > 10) return -1;
				// All good. Start the game.

				// Have to add two to keep from going negative
				for (let stat = STAT_0; stat < STAT_0 + STAT_COUNT; stat += 1)
					state[stat] += 2;

				for (let { slot, increment, value } of speciesinfo.startState ?? [])
					state[slot] = value ?? (state[slot] + increment)

				state[Level] = 1;
				state[Location] = BOMPTON_TOWN;
				state[Health] = state[MaxHealth] = 6 + state[StatConstitution];
				state[Energy] = state[MaxEnergy] = 6 + state[StatIntelligence];
				actUp();
				passTime('Loading', 1);

				return 1;
			}
			return -1;
		}

		// Game is in process

		let local = mapInfo(state[Location], state);
		let questal = mapInfo(state[QuestLocation], state);

		function passTime(task, hours, days) {
			TASK = task;  // TODO this is inelegant
			if (TASK[TASK.length - 1] !== '.') TASK += '...';
			if (days) hours += HOURS_PER_DAY * days;
			state[Hours] += hours;
			while (state[Hours] > HOURS_PER_YEAR) {
				state[Hours] -= HOURS_PER_YEAR;
				state[Years] += 1;
			}
		}

		function randomLocation() {
			// A random location on the main island
			// TODO consider current locality
			return d(36);
		}

		function randomMob() {
			while (true) {
				let mob = d(DENIZENS.length - 1);
				if (DENIZENS[mob].hitdice) return mob;
			}
		}

		function inventoryCapacity() {
			return Math.max(0, carryCapacity(state) - encumbrance(state));
		}

		if (operation === travel) {
			let destination = arg1;
			if (destination === state[Location]) return 0;
			let remote = mapInfo(destination, state);
			if (!remote) return -1;
			let goal = remote;
			if (local.neighbors) {
				if (!local.neighbors.includes(destination)) return -1;
			} else {
				// we're in the 6x6 grid
				let [x0, y0] = [longitude(state[Location]), latitude(state[Location])];
				let [x1, y1] = [longitude(destination), latitude(destination)];
				if (Math.abs(x1 - x0) > Math.abs(y1 - y0)) {
					y1 = y0;
					x1 = (x1 < x0) ? x0 - 1 : x0 + 1;
				} else {
					x1 = x0;
					y1 = (y1 < y0) ? y0 - 1 : y0 + 1;
				}
				destination = x1 + 6 * y1 + 1;
				remote = mapInfo(destination, state);
				if (!remote) return -1;  // but shouldn't happen
			}
			let hours = 24;
			let travelspeed = (state[StatConstitution] + state[EquipmentMount]) / 5;
			let terrain = TERRAIN_TYPES[remote.terrain];
			hours *= terrain.moveCost || 1;
			hours = Math.round(hours / travelspeed);
			state[Location] = destination;
			state[MobType] = 0;
			state[MobLevel] = 0;
			state[MobDamage] = 0;
			let plan = 'Travelling to ' + remote.name;
			if (goal !== remote) plan += ' en route to ' + goal.name;
			passTime(plan, hours);
			return 1;

		} else if (operation === melee) {
			if (!state[MobType]) return -1;
			passTime('Engaging this ' + DENIZENS[state[MobType]].name.toLowerCase() + ' in battle!', 1);
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
			passTime('Buying some ' + itemsName(slot), 3);
			return qty;

		} else if (operation === sell || operation === give || operation === drop) {
			let [slot, qty] = [arg1, arg2];
			let unitValue;
			if (isEquipmentSlot(slot)) {
				qty = Math.min(qty, 1);
				unitValue = state[slot];
				if (!unitValue) return -1;
				if (slot === EquipmentWeapon) unitValue = weaponPower(unitValue);
				unitValue = Math.round(Math.pow(1.6, unitValue));
			} else if (isInventorySlot(slot)) {
				qty = Math.min(qty, state[slot]);
				unitValue = INVENTORY_INFO[slot].value;
			} else {
				return -1;
			}
			if (qty <= 0) return -1;
			let price = qty * 0.5 * unitValue;
			if (operation === sell) {
				state[InventoryGold] += Math.floor(price);
			}
			if (operation === give && state[QuestObject] === slot) {
				state[QuestProgress] += qty;
			}
			state[slot] -= qty;
			if (operation === sell) {
				passTime('Selling some ' + itemsName(slot), 3);
			} else if (operation === give) {
				passTime('Giving away some ' + itemsName(slot), 1);
			} else if (operation === drop) {
				passTime('Cleaning out some extra ' + itemsName(slot) + ' from my backpack', 1);
			}

			return qty;

		} else if (operation === deposit || operation == withdraw) {

			let [slot, qty] = [arg1, arg2];
			const isDeposit = (operation === deposit);

			if (qty < 0) return -1;  // nice try hacker
			if (state[Location] != BOMPTON_TOWN) return -1;  // you're not at the bank

			if (state[InventoryGold] + state[BalanceGold] <= 0)
				return -1;  // Can't afford it

			let bankSlot;
			if (slot == InventoryGold) bankSlot = BalanceGold;
			else if (slot == InventoryTreasures) bankSlot = BalanceTreasures;
			else return -1;  // Bank doesn't deal in this item

			let fromSlot = isDeposit ? slot : bankSlot;
			let toSlot =  isDeposit ? bankSlot : slot;

			qty = Math.min(qty, state[fromSlot]);

			let availableCapacity = isDeposit ? MAX_INT - state[toSlot] : roomFor(slot, state);
			qty = Math.min(qty, availableCapacity);

			if (qty > 0) {
				state[fromSlot] -= qty;
				state[toSlot] += qty;

				// Charge a 1 gold commission per transaction
				if (isDeposit) {
					state[state[InventoryGold] > 0 ? InventoryGold : BalanceGold] -= 1;
				} else {
					state[state[BalanceGold] > 0 ? BalanceGold : InventoryGold] -= 1;
				}

				passTime('Making a bank ' + isDeposit ? 'deposit' : 'withdrawal', 1);
			}

			return qty;

		} else if (operation === seekquest) {
			passTime('Asking around about quests', 1, 0);
			if (local.terrain !== TOWN) return -1;
			let questTypes = [_ => {
				// Exterminate the ___
				state[QuestLocation] = randomLocation();
				state[QuestMob] = randomMob();
				state[QuestObject] = 0;
				state[QuestQty] = 5 + d(10);
			}, _ => {
				// Bring me N of SOMETHING
				state[QuestLocation] = 0;
				state[QuestObject] = INVENTORY_0 + irand(INVENTORY_COUNT);
				state[QuestMob] = 0;
				state[QuestQty] = 5 * d(10);
			}, _ => {
				if (state[EquipmentTotem]) {
					// Deliver this totem
					state[QuestObject] = EquipmentTotem;
					state[QuestLocation] = randomLocation();
					state[QuestQty] = 0;
				} else {
					// Seek the totem
					state[QuestObject] = EquipmentTotem;
					state[QuestLocation] = randomLocation();
					state[QuestQty] = 1;
				}
			}];
			randomPick(questTypes)();
			state[QuestProgress] = 0;
			state[QuestOrigin] = state[Location];
			return 1;

		} else if (operation === completequest) {
			if (!state[QuestObject] && !state[QuestMob]) return -1;
			if (state[QuestOrigin] && (state[QuestOrigin] != state[Location])) return -1;
			if (state[QuestProgress] < state[QuestQty]) return -1;
			state[Experience] += 100;
			state[ActProgress] += 1;
			actUp();
			state[QuestObject] = 0;
			state[QuestMob] = 0;
			state[QuestLocation] = 0;
			state[QuestOrigin] = 0;
			state[QuestProgress] = 0;
			state[QuestQty] = 0;
			passTime('Taking care of paperwork; this quest is done!', 3);
			return 1;

		} else  if (operation === train) {
			let slot = arg1;
			if (local.terrain !== TOWN) return -1;
			if (!isStatSlot(slot)) return -1;
			if (state[slot] >= 99) return 0;
			let hours = 24;
			hours *= Math.pow(1.6, state[slot]);
			hours *= 10 / (10 + state[StatWisdom]);
			// TODO: town stat-learning bonuses
			// TODO: racial stat-learning bonuses
			passTime('Training up ' + SLOTS[slot].name.substr(4).toLowerCase(), Math.round(hours));
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
			hours *= 10 / (10 + state[StatWisdom]);
			// TODO: town spell-learning bonuses?
			// TODO: racial spell-learning bonuses?
			passTime('Inscribing "' + spell.name + '" into my spell book', Math.round(hours));
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

			passTime('Casting ' + spell.name, spell.duration ?? 10);

			for (let { slot, qty } of spell.costs)
				state[slot] -= qty;

			if (spell.enchantment) {
				let current = SPELLS[state[Enchantment] & 0xFF];
				if (current) {
					// Reverse current enchantment
					for (let { slot, increment } of current.enchantment) {
						state[slot] -= increment;
					}
				}
				for (let { slot, increment } of spell.enchantment) {
					state[slot] += increment;
				}
				state[Enchantment] = spellType;
			}

			if (spell.effect) return spell.effect(state, spellType);

			return spellType;

		} else if (operation === hunt) {
			passTime('Hunting for a suitable local victim', 1);
			state[MobType] = 0;
			state[MobLevel] = 0;
			state[MobDamage] = 0;
			for (let i = 0; i < 4; ++i) {
				// location.mobtype;
				let t = randomMob();
				let l = DENIZENS[t].hitdice + d(2) - d(2);
				if (!state[MobType] || Math.abs(l - local.level) <
										Math.abs(state[MobLevel] - local.level)) {
					state[MobType] = t;
					state[MobLevel] = l;
				}
			}
			state[MobDamage] = 0;
			return state[MobType] ? 1 : 0;

		} else if (operation === rest) {
			passTime('Resting up', 0, 1);
			let hp = d(state[StatConstitution]);
			if (local.terrain !== TOWN)
				hp = Math.round(hp * rand() * rand());
			hp = Math.min(hp, state[MaxHealth] - state[Health]);
			state[Health] += hp;

			let mp = d(state[StatWisdom]);
			if (local.terrain !== TOWN)
				mp = Math.round(mp * rand() * rand());
			mp = Math.min(mp, state[MaxEnergy] - state[Energy]);
			state[Energy] += mp;

			return hp + mp;

		} else if (operation === forage) {
			let target = arg1;
			let qty;
			if (target === EquipmentTotem) {
				passTime('Seeking the local totem', 6);
				if (d(20) <= state[StatIntelligence]) {
					state[EquipmentTotem] = state[Location];
					return 1;
				} else {
					return 0;
				}
			}

			if (!isInventorySlot(target)) return -1;
			if (roomFor(target, state) < 1) return -1;

			qty = rand() < 0.5 ? 1 : 0;
			qty = Math.min(qty, inventoryCapacity());
			state[target] += qty;

			passTime('Foraging for ' + itemsName(target), 1);
			return qty;

		} else if (operation === levelup) {
			if (state[Level] >= 99) return 0;
			if (state[Experience] < this.xpNeededForLevel(state[Level] + 1))
				return 0;
			state[Level] += 1;
			state[Health] = state[MaxHealth] += 3 + additiveStatBonus(state[StatConstitution]);
			state[Energy] = state[MaxEnergy] += 3 + additiveStatBonus(state[StatWisdom]);
			passTime('Levelling up', 1);
			return 1;

		} else if (operation === retire) {
			state[GameOver] = 401;

		} else {
			state[GameOver] = 333;
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
			'generate-interface': {
				type: 'boolean',
			},
			'generate-map': {
				type: 'boolean',
			},
			'generate-documentation': {
				type: 'boolean',
			},
		},
		allowPositionals: true,
	});
	const flags = values;

	const verbosity = (flags.verbose || []).length;

	if (flags['generate-interface']) {
		console.log(generateInterface());
	}
	if (flags['generate-map']) {
		console.log(generateMap());
	}
	if (flags['generate-documentation']) {
		console.log(generateMap());
	}

	if (positionals) {
		let { readFileAsWords, VirtualMachine } = require('./vm.js');
		let code = readFileAsWords(positionals[0]);
		let vm = new VirtualMachine(code, Game);
		if (verbosity > 1) vm.trace = true;
		vm.run();
		if (verbosity > 0) {
			Game.dumpState(vm.state);
			vm.dumpState();
		}
	}
}
