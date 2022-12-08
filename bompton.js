// Bompton Island: A Progress Quest Slot module

const Bompton = (_ => {

const GR = 0.5 + Math.sqrt(5) / 2;

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

	{ name: 'TrainingPoints',
	  description: `Training points are required to be able to train up stats.` },

	{ name: 'ArmorClass',
	  description: `Defensive rating calculated based on equipment and bonuses.` },

	{ name: 'Encumbrance',
	  description: `Total weight of carried items, not to exceed Capacity.` },
	{ name: 'Capacity',
	  description: `Maximum weight you could possibly carry.` },

	{ name: 'Enchantment',
	  description: `Active enchantment currently affecting you.` },

	{ name: 'TrophyMob',
	  description: `If all trophies were looted from the same mob type, that's
	  kept track of here. When trophies are looted from multiple mob species,
	  they tend to get all jumbled up and confused.` },


	{ name: 'StatStrength',
	  description: `Ability to deal damage and lift heavy things.` },

	{ name: 'StatAgility',
	  description: `Ability to move around, avoid death, etc.` },

	{ name: 'StatEndurance',
	  description: `Ability to absorb damage and retain energy.` },

	{ name: 'StatIntellect',
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
	  description: `The weapon is used for causing damage to one's foe.` },

	{ name: 'EquipmentArmor',
	  description: `Armor is worn on the body to protect it from damage.` },

	{ name: 'EquipmentShield',
	  description: `A shield may be held to deflect blows from one's oppenent's attacks.` },

	{ name: 'EquipmentHeadgear',
	  description: `Helments and other headgear help protect the head from physical trauma.` },

	{ name: 'EquipmentFootwear',
	  description: `The feet and lower legs may be protected with good footwear choices.` },

	{ name: 'EquipmentMount',
	  description: `Adventurers use mounts to improve their travel speed and carrying capacity.` },

	{ name: 'EquipmentRing',
	  description: `Rings can serve for decoration, and may also be imbued with magical powers.` },

	{ name: 'EquipmentTotem',
	  description: `Totems are local to specific areas and may play a part in various quests.` },


	{ name: 'InventoryGold',
	  description: `Gold coins are the common medium of value storage and exchange.` },

	{ name: 'InventoryTrophies',
	  description: `Skins, horns, teeth, etc. collected from slain enemies.` },

	{ name: 'InventoryReagents',

	  description: `` },

	{ name: 'InventoryResources',

	  description: `` },

	{ name: 'InventoryFood',
	  description: `Adventures eat food every time they travel. If they're out
	  of food, travelling takes longer due to extra time spent hunting and
	  foraging and complaining about being hungry.` },

	{ name: 'InventoryTreasures',

	  description: `` },

	{ name: 'InventoryPotions',

	  description: `` },

	{ name: 'InventoryLifePotions',

	  description: `` },


	{ name: 'Location',
	  description: `Current location. The localities of Bompton Island are numbered from one to thirty-eight.` },

	{ name: 'MobSpecies',
	  description: `Species of the nearby creature.` },

	{ name: 'MobLevel',
	  description: `Overall puissance of the nearby creature.` },

	{ name: 'MobHealth',
	  description: `Current health of the nearby creature.` },

	{ name: 'MobMaxHealth',
	  description: `Maximum health of the nearby creature.` },


	{ name: 'QuestObject',
	  description: `The item which is the target of the current quest, or 0 if none.` },

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

const STAT_COUNT = SPELLBOOK_0 - STAT_0;
const SPELLBOOK_COUNT = EQUIPMENT_0 - SPELLBOOK_0;
const EQUIPMENT_COUNT = INVENTORY_0 - EQUIPMENT_0;
const INVENTORY_COUNT = Location - INVENTORY_0;

function isStatSlot(slot)      { return STAT_0      <= slot && slot < STAT_0 + STAT_COUNT }
function isSpellSlot(slot)     { return SPELLBOOK_0 <= slot && slot < SPELLBOOK_0 + SPELLBOOK_COUNT }
function isEquipmentSlot(slot) { return EQUIPMENT_0 <= slot && slot < EQUIPMENT_0 + EQUIPMENT_COUNT }
function isInventorySlot(slot) { return INVENTORY_0 <= slot && slot < INVENTORY_0 + INVENTORY_COUNT }


// TODO bell() commmand? CHA makes it more accurate

const CALLS = {
	startgame: { parameters: 'species',
		description: 'Pick a species for your character and begin the game!' },

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

	loot: {
		description: `Loot any nearby corpse for whatever goodies they may
		hold. Now, if they aren't a corpse, then this is an attempt to
		pickpocket.` },

	rest: {
		description: `Grab some downtime to reduce fatigue and damage. Resting
		is much more effected in town than it is out in the wilderness.` },

	hunt: {
		description: `Search around for a mob to kill.`	},

	levelup: {
		description: `Level up! When you've accumulated enough experience, you
		can take yourself to the next level by leveling up. This will
		increase your general effectiveness accross the board, and may
		result in stat or other bonuses.` },

	viewcinematic: {
		description: `To complete each act, you must return to Bompton Town
		and view the in-game cinematic to usher in the next act of the
		plot. Or at the completion of the final Act IX, conclude the game!` },

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
const DAYS_PER_MONTH = 30;
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
		spell && interface.push(`const ${moniker(spell.name)} = ${index}`));

	interface.push('');

	return interface.join('\n');
}


function generateDocumentation() {

	let result = `<!doctype html>
<head><title>Bompton Island Reference</title>

<style>
* {
	font-family: Verdana, Helvetica, sans-serif;
}
h1 {
	font-size: 40px;
}
body {
	margin: 50px 100px;
}
h4 {
	font-size: 18px;
	margin: 16px 0 10px 0;
}
#weaps {
	display: grid;
	grid-template-columns: 20px 150px 50px 20px;
	gap: 0;
}
#weaps div {
	padding: 0;
	margin: 0;
}
</style>
</head><body>
<h1>Bompton Island Programmer's Reference</h1>
	`;

	function head(h) { result += `<h3>${h}</h3>`; }
	function subhead(s, d) { result += `<h4>${s}</h4><p>${d ?? ''}`; }
	function p(text) { result += '<p>' + text + '</p>' }
	function div(text, and) { result += `<div ${and ?? ''}>${text}</div>` }

	function code(text) { return '<code>' + text + '</code>'; }
	function i(text) { return '<i>' + text + '</i>' }

	head('Gameplay Functions');

	for (let call in CALLS) {
		let { parameters, description } = CALLS[call];
		subhead(code(call + '(' + i(parameters ?? '').replace(',',', ') + ')'), description);
	}

	head('Game State Slots');

	p(`The constants listed here are indices into the game state vector. These
	indices are passed to some of the gameplay functions above (such as
	<code>train</code> or <code>give</code>).`)

	p(`The current value of any state vector element may be accessed using the
	state vector access operator (<code>.</code>). For example
	<code>.Level</code> is the player character's current level.`);

	for (let { name, description } of SLOTS) {
		subhead(code(name), description);
	}

	head('Spells');

	p(`Spell are cast using the \`cast\` function. Use the spell name, replacing
		spaces with underscores. For example, \`cast(Heal_Yeah)\`. Each spell has
		an energy cost and may consume physical reagents too. Spells may be learned
		using the \`learn\` gameplay function.`);

	p(`Some spells are enchantments, meaning they remain active until the
	caster loses concentration, either by casting another spell or resting.`);

	for (let {name, enchantment, description, level, costs} of SPELLS.filter(x=>x)) {
		if (enchantment) name += ' (enchantment)';
		subhead(code(name), description);
		p('Level ' + level);
		if (costs)
			p('Cost: ' + costs.map(({slot, qty}) => qty + ' ' + SLOTS[slot].name).join(', '));
	}

	head('Weapons');
	result += '<div class=listview id=weaps>';
	div('n', 'class=header');
	div('Weapon', 'class=header');
	div('Type', 'class=header');
	div('Power', 'class=header');
	WEAPON_NAMES.forEach((w,i) => {
		if (w) {
			div(i);
			div(w);
			div(weaponTypeNames[weaponType(i)]);
			div(weaponPower(i));
		}
	});

	result += '</div>'

	head('Equipment');
	for (let t = EQUIPMENT_0; t < EQUIPMENT_0 + EQUIPMENT_COUNT; t += 1) {
		if (DATABASE[t]) {
			subhead(SLOTS[t].name);
			p('Base price: ' + DATABASE[t].basePrice);
			DATABASE[t].names.forEach((e,i) => {
				if (e) p(i + ': ' + e);
			});
		}
	}

	head('Terrain types');
	TERRAIN_TYPES.forEach((t,i) => { if (t) {
		subhead(t.name);
		p('Move cost: ' + (t.moveCost ?? 1));
		if (t.forage) p('Forage: ' + SLOTS[t.forage.item].name + ' ' + t.forage.rate);
	} });

	head('Denizens');

	DENIZENS.forEach((d,i) => { if (d) {
		subhead(d.name);
		if (d.description) p(d.description);
		if (d.playable) p("Playable species.");
		if (d.domain) p("Often found in " + TERRAIN_TYPES[d.domain].name + '.');
		let prof = '';
		if (d.proficiency) p('Proficient with ' + d.proficiency.map(t => weaponTypeNames[t]).join(' and ') + ' weapons. ');
		// TODO: don't really need the badat shit
		// TODO: stat bonuses
		if (d.hitdice) p('General formidableness rating is ' + d.hitdice);
	} });

	head('Map Locations');


	MAP.forEach((tile,i) => { if (tile && !tile.ephemeral) {
		subhead(`${tile.name} (#${i})`);
		p(`Coordinates: ${latitude(i)}S x ${longitude(i)}E`);
		p(`Terrain: ${TERRAIN_TYPES[tile.terrain].name}`);
		p(`Mob level: ` + tile.level);
		if (tile.denizen)
			p(`Principal occupant: ` + DENIZENS[tile.denizen].name);
	} });


	head('Inventory Items');

	for (let i = INVENTORY_0; i < INVENTORY_0 + INVENTORY_COUNT; i += 1) {
		subhead(SLOTS[i].name);
		p(`Value: $` + DATABASE[i].value);
		p(`Weight: ${DATABASE[i].weight}#`);
	}

	return result;
}


/////////// Spells

const SPELLS = [ null, {
		name: 'Heal Yeah',
		level: 1,
		costs: [
			{ slot: Energy, qty: 1 },
			{ slot: InventoryReagents, qty: 1 },
			],
		effect: state => {
			let healing = 1;
			healing *= Math.pow(GR, state[StatWisdom]);
			healing = Math.round(healing);
			healing = Math.min(healing, state[MaxHealth] - state[Health]);
			state[Health] += healing;
			return healing;
		},
		description: `Heal some or all of any damage you may have sustained.
		The effectiveness of this spell is aided by higher wisdom`,
	}, {
		name: 'Pyroclastic Orb',
		level: 2,
		costs: [
			{ slot: Energy, qty: 2 },
			{ slot: InventoryReagents, qty: 2 },
			],
		effect: state => {
			return battle(true);
		},
		description: `Hurl a ball of flaming horror at your nearby foe, causing them damage.`,
	}, {
		name: 'Horsewheels',
		level: 3,
		costs: [
			{ slot: InventoryReagents, qty: 3 },
			],
		enchantment: [],  // handled in code: speed boost
	}, {
		name: 'Spectral Coinpurse',
		level: 5,
		costs: [
			{ slot: Energy, qty: 5 },
			{ slot: InventoryReagents, qty: 5 },
			],
		duration: 24,
		effect: state => {
			let winnings = Math.min(roomFor(InventoryGold, state), state[InventoryGold]);
			return inc(InventoryGold, winnings);
		},
		description: `Double. Your. Money.... Overnight! <sup>*</sup>Terms and conditions apply. Doubling is limited by cargo capacity.`,
	}, {
		name: 'Delta P',
		description: `Release a massive pressure discontinuity.`
		// TODO an effect
	}, {
		name: 'History Lessen',
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
		name: "Xform",
		level: 3,
		costs: [
			{ slot: Energy, qty: 3 },
			{ slot: InventoryReagents, qty: 3 },
			],
		effect: state => {
			if (!state[MobSpecies]) return -1;
			// TODO: lose current species bonuses
			return state[Species] = state[MobSpecies];
			// TODO: this won't work yet
		},
		description: `Turn yourself in to one of those things. One of those things over there.`,
	}, {
		name: 'Buff',
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
		level: 6,
		costs: [
			{ slot: Energy, qty: 6 },
			{ slot: InventoryReagents, qty: 6 },
			],
		enchantment: [],
		description: `This doesn't do anything to help; it's just cool.`,
	}, {
		name: 'Smort',
		level: 4,
		costs: [
			{ slot: Energy, qty: 4 },
			{ slot: InventoryReagents, qty: 4 },
			],
		enchantment: [
			{ slot: StatIntellect, increment: 4 },
		],
		description: `Become just that much stronger.`,
	}, {
		name: 'Scrambled Eggs',
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
		level: 5,
		costs: [
			{ slot: Energy, qty: 5 },
			{ slot: InventoryReagents, qty: 5 },
			],
		enchantment: [],
		effect: (state, spellid) => {
			if (state[Location] > 36) return -1;
			state[Enchantment] = spellid + (state[Location] << 8);
		},
		description: `Bring a ghost town into existence where you now stand.`,
	}, {
		name: 'Health Plan',
		level: 8,
		costs: [
			{ slot: Energy, qty: 30 },
			{ slot: InventoryReagents, qty: 20 },
			],
		effect: state => {
			state[Health] = Math.min(MAX_INT, state[Health] + state[InventoryGold]);
			state[InventoryGold] = 0;
		},
		description: `Money CAN buy you health, because magic.`,
	}, {
		name: 'Macrobian',
		// TODO get rid of these monikers and just use the spell name
		level: 15,
		costs: [
			{ slot: InventoryTreasures, qty: 49 },
			],
		effect: state => {
			state[Years] = Math.min(state[Years], 14);
		},
		description: `Drink from the magical spring of youth.`,
	},
];

function moniker(s) {
	return s.replace(' ', '_');
}

SPELLS.forEach((spell, index) => spell && define(moniker(spell.name), index));


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

function weaponType(n) { return 1 + (n - 1) % NUM_WEAPON_TYPES }

const weaponTypeNames = [];
WEAPON_DB.forEach((t, i) => { if (t) weaponTypeNames[i] = t.name} );

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
const NUM_HEADGEAR = HEADGEAR_NAMES.length - 1;

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
const NUM_ARMOR = ARMOR_NAMES.length - 1;

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


const DATABASE = [];
DATABASE[EquipmentWeapon] = {
	names: WEAPON_NAMES,
	count: WEAPON_NAMES.length - 1,
	basePrice: 15,
};
DATABASE[EquipmentHeadgear] = {
	names: HEADGEAR_NAMES,
	count: HEADGEAR_NAMES.length - 1,
	basePrice: 10,
};
DATABASE[EquipmentArmor] = {
	names: ARMOR_NAMES,
	count: ARMOR_NAMES.length - 1,
	basePrice: 20,
};
DATABASE[EquipmentShield] = {
	names: SHIELD_NAMES,
	count: SHIELD_NAMES.length - 1,
	basePrice: 10,
};
DATABASE[EquipmentFootwear] = {
	names: FOOTWEAR_NAMES,
	count: FOOTWEAR_NAMES.length - 1,
	basePrice: 10,
};
DATABASE[EquipmentMount] = {
	names: MOUNT_NAMES,
	count: MOUNT_NAMES.length - 1,
	basePrice: 20,
};


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

// TODO stat adjustments for mobs

const DENIZENS = [
	null,
	{
		name: "Dunkling",
		aka: "Nerfling",
		playable: true,
		esteems: 2,
		waryof: 3,
		proficiency: [SLASH],
		badat: [POKE, SHOOT],
		startState: [
			{ slot: StatAgility, increment: +2 },
			{ slot: StatCharisma, increment: +1 },
			{ slot: StatStrength, increment: -1 },
			{ slot: StatWisdom, increment: -2 },

			{ slot: EquipmentWeapon,   value: 2},
			{ slot: EquipmentHeadgear, value: 1},
			{ slot: InventoryFood,     value: 1 },
		],
		description: "Likable, lithe creatures of small stature, often underestimated",
		occurrence: 0.2,
	},
	{
		name: "Hardwarf",
		plural: "Hardwarves",
		playable: true,
		esteems: 3,
		waryof: 1,
		proficiency: [SMASH],
		badat: SLASH,
		startState: [
			{ slot: StatEndurance, increment: +2 },
			{ slot: StatStrength, increment: +1 },
			{ slot: StatAgility, increment: -1 },
			{ slot: StatIntellect, increment: -2 },

			{ slot: EquipmentWeapon, value: 1},
			{ slot: EquipmentShield, value: 1},
			{ slot: InventoryGold,   value: 1 },
		],
		description: "Sturdy sorts with a...direct approch to problems",
		occurrence: 0.1,
	},
	{
		name: "Eelman",
		playable: true,
		esteems: 1,
		waryof: 2,
		proficiency: [POKE, SHOOT],
		badat: SMASH,
		startState: [
			{ slot: StatIntellect, increment: +2 },
			{ slot: StatWisdom, increment: +1 },
			{ slot: StatEndurance, increment: -1 },
			{ slot: StatCharisma, increment: -2 },

			{ slot: EquipmentWeapon,   value: 3},
			{ slot: EquipmentFootwear, value: 1},
			{ slot: InventoryReagents, value: 1 },
		],
		description: "Proud, sometimes haughty, intellectuals",
		occurrence: 0.1,
	}, {
		name: "Gust",
		hitdice: 10,
		occurrence: 0.01,
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
	}, {
		name: "Main Boss",  // TODO: need a name
		domain: MOUNTAINS,
		hitdice: 16,
		occurrence: 0,
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
		trainingBoost: StatEndurance,
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
		trainingBoost: StatWisdom,
		learningBoost: 1,
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
		trainingBoost: StatCharisma,
		level: 0,
		hasBank: true,

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
		trainingBoost: StatStrength,
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
		trainingBoost: StatAgility,
		level: 0,
	}, {
		name: "Solla Desert",
		terrain: DESERT,
		level: 1,

	}, {
		name: "Cholar",
		terrain: TOWN,
		denizen: Dunkling,
		trainingBoost: StatIntellect,
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
		offshore: true,
	}, {
		name: "Sygnon Tower",
		neighbors: [37],
		terrain: TOWN,
		denizen: Gust,
		level: 0,
		offshore: true,

	}, {
		name: "Gus Town",
		terrain: TOWN,
		denizen: Gust,
		level: 8,
		ephemeral: true,
	}];

const MAINLAND_TOWNS = [];

MAP.forEach((tile,index) => {
	if (tile) {
		if (tile.terrain === TOWN) {
			tile.forSale = [];
			if (!tile.offshore)
				MAINLAND_TOWNS.push(index);
		}
		define(tile.name.toUpperCase().replace(' ', '_'), index);
	}
});

// Make items available for sale
let nextTown = 0;
function sellAt(slot, item, coord) {
	MAP[coord].forSale.push({ slot, item });
}
for (let slot = EQUIPMENT_0; slot < EQUIPMENT_0 + EQUIPMENT_COUNT; slot += 1) {
	let db = DATABASE[slot];
	if (db) {
		for (let item = 1; item <= db.count; ++item) {
			let power = item;
			let maxPower = db.count;
			if (slot === EquipmentWeapon) {
				power = weaponPower(item);
				maxPower /= NUM_WEAPON_TYPES;
			}
			if (power <= 2) {
				for (let t = 0; t < MAINLAND_TOWNS.length; ++t) {
					sellAt(slot, item, MAINLAND_TOWNS[t]);
				}
			} else if (power == maxPower) {
				sellAt(slot, item, SYGNON_TOWER);
			} else {
				sellAt(slot, item, MAINLAND_TOWNS[nextTown]);
				nextTown = (nextTown + 1) % MAINLAND_TOWNS.length;
			}
		}
	}
}


function longitude(location) { return location > 36 ? 8 : (location - 1) % 6; }
function latitude(location) { return location > 36 ? location - 34 : ((location - 1) / 6) >> 0; }

function mapInfo(location, state) {
	if (0 < location && location <= 36 && (state[Enchantment] & 0xFF) == Scrambled_Eggs) {
		let fixed = state[Enchantment] >> 8;
		location = (((location + 36 - fixed) * 23) + fixed - 1) % 36 + 1;  // whew!
	}
	else if ((state[Enchantment] & 0xFF) === Ghost_Town &&
			 (state[Enchantment] >> 8) === location) {
		location = 39;
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

DATABASE[InventoryGold] =        { value: 1, weight: 1/256 };
DATABASE[InventoryTrophies] =    { value: 1/10, weight: 1 };
DATABASE[InventoryReagents] =    { value: 1, weight: 1 };
DATABASE[InventoryResources] =   { value: 1/10, weight: 1 };
DATABASE[InventoryFood] =        { value: 1, weight: 1 };
DATABASE[InventoryTreasures] =   { value: 1000, weight: 3 };
DATABASE[InventoryPotions] = 	 { value: 100, weight: 1 };
DATABASE[InventoryLifePotions] = { value: 10000, weight: 1 };


function encumbrance(state) {
	let result = 0
	for (let i = INVENTORY_0; i < INVENTORY_0 + INVENTORY_COUNT; i += 1) {
		result += DATABASE[i].weight * state[i];
	}
	return Math.floor(result);
}

function roomFor(item, state) {
	let available = carryCapacity(state) - encumbrance(state);
	return Math.floor(available / DATABASE[item].weight);
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


function clearMob(state) {
	state[MobSpecies] = 0;
	state[MobLevel] = 0;
	state[MobHealth] = 0;
	state[MobMaxHealth] = 0;
}

function clearQuest(state) {
	state[QuestObject] = 0;
	state[QuestMob] = 0;
	state[QuestLocation] = 0;
	state[QuestOrigin] = 0;
	state[QuestProgress] = 0;
	state[QuestQty] = 0;
}


let TASK = '';

class Bompton {
	static title = 'Progress Quest Slog: Bompton Island';

	static get windowContent() { return BOMPTON_WINDOW_CONTENT }

	static create(code) {
		let state = new Int16Array(SLOTS.length);
		state[Seed] = hash(0x3FB9, ...code);
		return state;
	}

	static prepareIDE() {
		$("#worldmap").innerHTML = this.generateMap();

		for (let call in CALLS) {
			let { parameters, operation, description } = CALLS[call];
			let b = $("#control-buttons").appendChild(document.createElement('button'));
			b.addEventListener('click', _ => gameplay(operation));
			b.innerText = `${call}(${parameters ?? ''})`;
			b.hint = description ?? '';
		}
	}

	static updateUI(state) { updateGame(state) }

	static generateInterface = generateInterface;
	static generateMap = generateMap;
	static generateDocumentation = generateDocumentation;

	static SPECIES_NAMES = DENIZENS.map(r => (r && r.name) || '');
	static TERRAIN_TYPES = TERRAIN_TYPES;
	static DENIZENS = DENIZENS;
	static MAP = MAP;
	static mapInfo = mapInfo;
	static DATABASE = DATABASE;
	static SLOTS = SLOTS;


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

			if (state[InventoryTrophies] === 0)
				state[TrophyMob] = 0;
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

		function rollAttack(offsense, defense, sharpness) {
			let DIE = 10;
			let attackRoll = d(DIE);
			let defenseRoll = d(DIE);
			if (attackRoll === 1) return 0;
			if (attackRoll === DIE || attackRoll + offsense > defenseRoll + defense) {
				let damage = d(Math.max(1, sharpness));
				if (defenseRoll == DIE && damage > 1) damage = 1;
				if (defenseRoll == 1) damage >>= 1;
				return damage;
			} else {
				return 0;
			}
		}

		function doMobAttack() {
			let info = DENIZENS[state[MobSpecies]];
			if (!info) return 0;
			const defense = state[StatAgility] + state[ArmorClass];
			let damage = rollAttack(state[MobLevel], defense, state[MobLevel]);
			dec(Health, Math.min(state[Health], damage));

			if (state[Health] <= 0) {
				if (state[InventoryLifePotions] > 0) {
					dec(InventoryLifePotions, 1);
					state[Health] = 1;  // or max health?
				} else {
					state[GameOver] = 86;
				}
				return 0;
			} else {
				return 1;
			}
		}

		function doPlayerAttack() {
			if (state[MobHealth] <= 0) return;
			let info = DENIZENS[state[MobSpecies]];
			if (!info) return;
			const offense = state[StatAgility] + weaponPower(state[EquipmentWeapon]);
			const sharpness = state[StatStrength] + weaponPower(state[EquipmentWeapon]);
			let damage = rollAttack(offense, state[MobLevel], sharpness);
			dec(MobHealth, Math.min(state[MobHealth], damage));

			if (state[MobHealth] <= 0) {
				let levelDisadvantage = state[MobLevel] - state[Level];
				inc(Experience, 10 * state[MobLevel] * Math.pow(GR, levelDisadvantage));
				if (state[MobSpecies] == state[QuestMob] && !state[QuestObject]) inc(QuestProgress);
			}
		}

		function battle(invulnerable=false) {
			if (!state[MobSpecies]) return -1;
			if (state[MobHealth] <= 0) return -1;

			let info = DENIZENS[state[MobSpecies]];
			if (!info) return -1;

			if (info.esteemSlot)
				dec(state[info.esteemSlot], 1);


			if (state[StatAgility] + d(6) >= state[MobLevel] + d(6)) {
				// Player attacks first
				doPlayerAttack();
				if (state[MobHealth] > 0) {
					doMobAttack();
				}
			} else {
				// Mob attacks first
				doMobAttack();
				if (state[Health] > 0) {
					doPlayerAttack();
				}
			}
		}

		function endEnchantment() {
			let current = SPELLS[state[Enchantment] & 0xFF];
			if (current) {
				// Reverse current enchantment
				for (let { slot, increment } of current.enchantment) {
					dec(slot, increment);
				}
			}
			state[Enchantment] = 0;
		}

		function actUp() {
			if (state[ActProgress] < state[ActDuration]) return false;

			inc(Act);
			//                   1  2  3  4  5  6   7   8  9
			const ACT_LENGTHS = [6, 7, 8, 7, 8, 9, 10, 10, 7, 0]
			state[ActDuration] = ACT_LENGTHS[state[Act] - 1];
			state[ActProgress] = 0;
			return true;
		}

		if (operation === cheat) {
			// Remove this some time
			let [slot, value] = [arg1, arg2];
			state[slot] = value;
			return value;
		}

		if (state[Level] === 0) {
			// game hasn't begun
			if (operation === startgame) {
				let species = arg1;
				let speciesinfo = DENIZENS[species];
				if (!speciesinfo) return -1;

				state[Species] = species;

				if (state.slice(STAT_0, STAT_0 + STAT_COUNT).reduce((a,b) => a+b) > 10) return -1;
				// All good. Start the game.

				// Have to add two to keep from going negative
				for (let stat = STAT_0; stat < STAT_0 + STAT_COUNT; stat += 1)
					inc(stat, 2);

				for (let { slot, increment, value } of speciesinfo.startState ?? [])
					state[slot] = value ?? (state[slot] + increment)

				state[Level] = 1;
				state[Location] = BOMPTON;
				state[Health] = state[MaxHealth] = 6 + state[StatEndurance];
				state[Energy] = state[MaxEnergy] = 6 + state[StatIntellect];
				state[TrainingPoints] = 10;
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
			inc(Hours, hours);
			while (state[Hours] > HOURS_PER_YEAR) {
				inc(Hours, -HOURS_PER_YEAR);
				inc(Years);
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
				if (rand() < (DENIZENS[mob].occurrence ?? 1)) return mob;
			}
		}

		function randomMobNearLevel(goal, repeats=4) {
			let type = randomMob();
			let level = DENIZENS[type].hitdice;
			for (let i = 0; i < repeats; ++i) {
				let t = randomMob();
				let l = DENIZENS[t].hitdice;

				if (Math.abs(l - goal) < Math.abs(level - goal)) {
					type = t;
					level = l;
				}
			}
			return type;
		}


		function inventoryCapacity() {
			return Math.max(0, carryCapacity(state) - encumbrance(state));
		}

		function inc(slot, qty=1) {
			const MIN_INT = -0x8000;
			const MAX_INT =  0x7FFF;
			return state[slot] = Math.min(MAX_INT, Math.max(MIN_INT, state[slot] + qty));
		}

		function dec(slot, qty=1) { return inc(slot, -qty) }


		if (operation === travel) {
			if (state[Encumbrance] > state[Capacity] * 1.5) return -1; // vastly over-encumbered
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
			let travelspeed = (state[StatEndurance] + state[EquipmentMount]) / 5;
			if (state[Enchantment] === Horsewheels) travelspeed += 1;
			let terrain = TERRAIN_TYPES[remote.terrain];
			hours *= terrain.moveCost || 1;
			if (state[Encumbrance] > state[Capacity]) hours *= 2;  // over-encumbered
			if (state[InventoryFood] >= 1)
				dec(InventoryFood)
			else
				hours *= 2;
			hours = Math.round(hours / travelspeed);
			state[Location] = destination;
			clearMob(state);
			let plan = 'Travelling to ' + remote.name;
			if (goal !== remote) plan += ' en route to ' + goal.name;
			passTime(plan, hours);
			return 1;

		} else if (operation === melee) {
			if (!state[MobSpecies]) return -1;
			passTime('Engaging this ' + DENIZENS[state[MobSpecies]].name.toLowerCase() + ' in battle!', 1);
			return battle();

		} else if (operation === loot) {
			if (!state[MobSpecies]) return -1;
			if (state[MobHealth] > 0 && d(20) > state[StatAgility]) {
				doMobAttack();
				if (state[Health] <= 0) return 0;
				let info = DENIZENS[state[MobSpecies]];
				if (info.esteemSlot)
					dec(state[info.esteemSlot], 1);
			}

			if (state[TrophyMob] == state[MobSpecies] || state[InventoryTrophies] == 0)
				state[TrophyMob] = state[MobSpecies];
			else
				state[TrophyMob] = 0;
			inc(InventoryTrophies);
			clearMob(state);

		} else if (operation === buy) {
			let slot = arg1;
			if (!local.forSale) return -1;  // nothing to buy here
			let qty, levelToBe, price;
			if (isEquipmentSlot(slot)) {
				qty = 1;
				levelToBe = arg2;
				if (local.forSale.filter(fsi => fsi.slot === slot &&
					                             fsi.item == levelToBe).length === 0)
					return -1;
				if (!DATABASE[slot] || !DATABASE[slot].basePrice) return -1;
				price = Math.round(DATABASE[slot].basePrice * Math.exp(GR, levelToBe));
			} else if (isInventorySlot(slot)) {
				// TODO generally can't buy some items
				qty = arg2;
				if (qty < 0) return -1;
				levelToBe = Math.min(MAX_INT, state[slot] + qty);
				price = DATABASE[slot].value;
			} else {
				return -1;
			}

			// TODO: consider local effect on price
			// TODO: consider charisma

			if (arg2 === 0) {
				// It's a price check only
				passTime('Checking prices', 1);
				return price;
			}

			price *= qty;
			if (state[InventoryGold] < price) return -1;  // Can't afford it

			// You may proceed with the purchase
			inc(InventoryGold, -price);
			state[slot] = levelToBe;
			passTime('Buying some ' + itemsName(slot), 3);
			return qty;

		} else if (operation === sell || operation === give || operation === drop) {
			if (operation === sell && local.terrain != TOWN) return -1;
			let [slot, qty] = [arg1, arg2];
			let unitValue, newqty;
			if (isEquipmentSlot(slot)) {
				qty = Math.min(qty, 1);
				unitValue = state[slot];
				if (!unitValue) return -1;
				if (slot === EquipmentWeapon) unitValue = weaponPower(unitValue);
				unitValue = Math.round(Math.pow(GR, unitValue));
				newqty = 0;
			} else if (isInventorySlot(slot)) {
				qty = Math.min(qty, state[slot]);
				newqty = state[slot] - qty;
				unitValue = DATABASE[slot].value;
			} else {
				return -1;
			}
			if (qty <= 0) return -1;
			let price = qty * 0.5 * unitValue;
			if (operation === sell) {
				inc(InventoryGold, Math.floor(price));
			}
			if (operation === give &&
					state[QuestObject] === slot &&
					state[Location] === state[QuestOrigin] &&
					[0,state[TrophyMob]].includes(state[QuestMob])) {
				if (state[QuestObject] === EquipmentTotem) {
					if (state[QuestProgress] === 1)
						state[QuestProgress] = 2;
				} else {
					inc(QuestProgress, qty);
				}
			}
			state[slot] = newqty;
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
			if (state[Location].hasBank) return -1;  // you're not at the bank

			if (state[InventoryGold] + state[BalanceGold] <= 0)
				return -1;  // Can't afford it

			let bankSlot;
			if (slot == InventoryGold) bankSlot = BalanceGold;
			else if (slot == InventoryTreasures) bankSlot = BalanceTreasures;
			else return -1;  // Bank doesn't deal in this item

			let fromSlot = isDeposit ? slot : bankSlot;
			let toSlot =  isDeposit ? bankSlot : slot;

			qty = Math.min(qty, state[fromSlot]);

			if (qty > 0) {
				dec(fromSlot, qty);
				inc(toSlot,   qty);

				// Charge a 1 gold commission per transaction
				if (isDeposit) {
					dec(state[InventoryGold] > 0 ? InventoryGold : BalanceGold);
				} else {
					dec(state[BalanceGold] > 0 ? BalanceGold : InventoryGold);
				}

				passTime('Making a bank ' + isDeposit ? 'deposit' : 'withdrawal', 1);
			}

			return qty;

		} else if (operation === seekquest) {
			let hours = 4 + Math.round(20 * Math.pow(GR, -state[StatCharisma]));
			passTime('Asking around about quests', hours);

			clearQuest(state);

			if (local.terrain !== TOWN) return -1;

			if (state[Act] == 9) {
				if (state[ActProgress] < 3) {
					// Bring the totem from origin to location
					state[QuestObject] = EquipmentTotem;
					state[QuestOrigin] = d(36);
					do { state[QuestLocation] = d(36);
					} while (state[QuestLocation] == state[QuestOrigin]);
					state[QuestQty] = 2; // pick up, drop off
				} else if (state[ActProgress] == state[ActDuration] - 1) {
					state[QuestMob] = Main_Boss;
					state[QuestQty] = 1;
					state[QuestLocation] = EMKELL_PEAK;
				} else {
					// Exterminate the ___
					state[QuestLocation] = EMKELL_PEAK;
					state[QuestMob] = randomMobNearLevel(state[Act], state[StatCharisma]);
					state[QuestObject] = 0;
					state[QuestQty] = 25 + d(4) - d(4);
				}
			} else {
				let questTypes = [_ => {
					// Exterminate the ___
					state[QuestLocation] = randomLocation();
					state[QuestMob] = randomMobNearLevel(state[Act], state[StatCharisma]);
					state[QuestObject] = 0;
					state[QuestQty] = 2 + 2 * state[Act] + d(2) - d(2);  // TODO use charisma here (instead?)
				}, _ => {
					// Bring me N trophies
					state[QuestLocation] = randomLocation();
					state[QuestObject] = InventoryTrophies;
					state[QuestMob] = randomMobNearLevel(state[Act], state[StatCharisma]);
					let qty = 1 + state[Act] + d(2) - d(2);
					state[QuestQty] = qty;
				}, _ => {
					// Bring me N of SOMETHING generally
					let value = state[Level] * 100 * Math.pow(GR, -state[StatCharisma]) * (0.5 * rand());
					state[QuestLocation] = randomLocation();
					state[QuestObject] = InventoryResources;  // something you can forage for
					state[QuestMob] = 0;
					let qty = Math.max(1, Math.round(value / DATABASE[state[QuestObject]].value));
					state[QuestQty] = qty;
				}];
				randomPick(questTypes)();
				state[QuestOrigin] = state[Location];
			}
			state[QuestProgress] = 0;
			return 1;

		} else if (operation === completequest) {
			if (!state[QuestObject] && !state[QuestMob]) return -1;
			if (state[QuestOrigin] && (state[QuestOrigin] != state[Location])) return -1;
			if (state[QuestProgress] < state[QuestQty]) return -1;
			inc(Experience, 50 * state[Act]);
			inc(ActProgress);
			clearQuest(state);
			if (state[Act] === 9 && state[ActProgress] === 3) {
				passTime('Being magically transported to Sygnon Isle!', 3);
				state[Location] = SYGNON_TOWER;
			} else {
				passTime('Taking care of paperwork; this quest is done!', 3);
			}
			return 1;

		} else if (operation === viewcinematic) {
			if (local.terrain !== TOWN) return -1;  // TODO should be just bompton or sygnon
			if (actUp()) {
				passTime('Viewing a beautifully rendered in-game cinematic sequence', 2);
				inc(TrainingPoints);
				inc(InventoryTreasures);
			}

		} else  if (operation === train) {
			let slot = arg1;
			if (local.terrain !== TOWN) return -1;
			if (!isStatSlot(slot)) return -1;
			if (state[TrainingPoints] <= 0) return -1;
			if (state[slot] >= 99) return 0;
			let hours = 24;
			hours *= Math.pow(GR, state[slot]);
			hours *= 10 / (10 + (state[StatWisdom] + (local.trainingBoost == slot ? 1 : 0)));
			hours = Math.min(1, Math.round(hours));
			// TODO: special stat-learning bonuses (special as in species)
			// TODO: DEX helps with STR and CON
			// TODO: INT helps with CHA and WIS

			passTime('Training up ' + SLOTS[slot].name.substr(4).toLowerCase(), hours);
			inc(slot);
			dec(TrainingPoints);
			return state[slot];

		} else  if (operation == learn) {
			let [slot, spellType] = [arg1 - 1 + SPELLBOOK_0, arg2];
			let spell = SPELLS[spellType];
			if (!spell) return -1;
			if (local.terrain !== TOWN) return -1;
			if (!isSpellSlot(slot)) return -1;
			let hours = 24;
			hours *= Math.pow(GR, spell.level);
			hours *= 10 / (10 + (state[StatWisdom] + (local.learningBoost ?? 0)));
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

			// TODO have int and or wis help

			let level = spell.level;

			for (let { slot, qty } of spell.costs)
				if (state[slot] < qty) return -1;

			passTime('Casting ' + spell.name, spell.duration ?? 10);

			for (let { slot, qty } of spell.costs)
				dec(slot, qty);

			endEnchantment();

			if (spell.enchantment) {
				for (let { slot, increment } of spell.enchantment) {
					inc(slot, increment);
				}
				state[Enchantment] = spellType;
			}

			if (spell.effect) return spell.effect(state, spellType);

			return spellType;

		} else if (operation === hunt) {
			passTime('Hunting for a suitable local victim', 1);
			clearMob(state);
			let type;
			if (state[QuestMob] && state[QuestLocation] === state[Location] && irand(4) == 0) {
				type = state[QuestMob];
			} else if (local.denizen && (!local.density || d(100) <= local.density)) {
				type = local.denizen;
			} else {
				type = randomMobNearLevel(local.level);
			}
			let level = DENIZENS[type].hitdice ?? Math.min(d(10), Math.min(d(10), d(10)));
			level += d(2) - d(2);
			state[MobSpecies] = type;
			state[MobLevel] = level;
			state[MobHealth] = state[MobMaxHealth] = 2 + level * 2;
			return state[MobSpecies] ? 1 : 0;

		} else if (operation === rest) {
			endEnchantment();

			passTime('Resting up', 0, 1);
			let hp = d(state[StatEndurance]);
			if (local.terrain !== TOWN)
				hp = Math.round(hp * rand() * rand());
			hp = Math.min(hp, state[MaxHealth] - state[Health]);
			inc(Health, hp);

			let mp = d(state[StatWisdom]);
			if (local.terrain !== TOWN)
				mp = Math.round(mp * rand() * rand());
			mp = Math.min(mp, state[MaxEnergy] - state[Energy]);
			inc(Energy, mp);

			return hp + mp;

		} else if (operation === forage) {
			let target = arg1;
			let qty;
			if (target === EquipmentTotem) {
				passTime('Seeking the local totem', 6);
				if (d(20) <= state[StatIntellect]) {
					state[EquipmentTotem] = state[Location];
					if (state[QuestObject] === EquipmentTotem &&
							state[Location] === state[QuestLocation]) {
						state[QuestProgress] = 1;
					}
					return 1;
				} else {
					return 0;
				}
			}

			// TODO int or perception helps

			if (!isInventorySlot(target)) return -1;

			let chance = 1/3;
			if (state[Location] === state[QuestLocation] &&
					target === state[QuestObject]) {
				chance = 2/3;
			}

			qty = rand() < chance ? 1 : 0;
			inc(target, qty);

			passTime('Foraging for ' + itemsName(target), 1);
			return qty;

		} else if (operation === levelup) {
			if (local.terrain != TOWN) return -1;
			if (state[Level] >= 99) return 0;
			if (state[Experience] < this.xpNeededForLevel(state[Level] + 1))
				return 0;
			inc(Level);
			state[Health] = inc(MaxHealth, 3 + additiveStatBonus(state[StatEndurance]));
			state[Energy] = inc(MaxEnergy, 3 + additiveStatBonus(state[StatWisdom]));
			inc(TrainingPoints, 2);
			passTime('Leveling up', 1);
			return 1;

		} else if (operation === retire) {
			state[GameOver] = 401;

		} else {
			state[GameOver] = 333;
			console.log("Invalid operation");
		}
	}

	static xpNeededForLevel(level) {
		if (level <= 1) return 0;
		return 0 + Math.floor(Math.pow(level - 1, GR)) * 200;
	}

}

function additiveStatBonus(stat) {
	return Math.round(Math.pow(GR, stat)) - 1;
}


/////////////////// UI ///////////////////////////////


const BOMPTON_WINDOW_CONTENT = `
<style>	/* Styling for the character sheet */

/*#game-window { width: 600px }*/

#sheet {
	display: grid;
	grid-template-columns: 200px 200px 230px;
	gap: 4px;
}

#col1, #col2, #col3 {
	grid-row: 1;
	display: grid;
	grid-template-columns: 1fr;
	gap: 4px;
	/*width: 300px;*/
}
#col1 { grid-column: 1; }
#col2 { grid-column: 2; }
#col3 { grid-column: 3; }
#col1 > div, #col2 > div, #col3 > div {
	display: grid;
	grid-template-columns: 2fr 1fr;
}
#col1 > #vitals { grid-template-columns: 3fr 3fr }
#col1 > #stats { grid-template-columns: 3fr 1fr 3fr 1fr }
#col1 > #spells { grid-template-columns: 1fr 2fr }
#col2 > #equipment {	grid-template-columns: 1fr 1fr;	}
#col3 > #environment { grid-template-columns: 2fr 3fr; }
#col3 > #encounter   { grid-template-columns: 2fr 3fr; }
#col3 > #quest { grid-template-columns: 3fr 7fr; }
#col3 > #plot { grid-template-columns: 3fr 7fr; }

#spells > div:nth-child(2n+3) { font-style: italic }

#tp, #encumbrance {
	float: right;
	padding-right: 4px;
}

#encumbrance {
	display: inline-block;
	width: 90px;
	background-color: white;
}

#questdesc {
	grid-column: 1/3;
}
#questdesc {
	font-style: italic;
}

div.footer {
	grid-column: 1/3;
	background-color: rgb(236, 233, 216);
	// height: 14px;
	padding-top: 3px !IMPORTANT;
}

div.header {
	grid-column: 1 / 3;
	height: 14px;
}

#stats > div.header {
	grid-column: 1/5;
}

.listview {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	/*grid-auto-rows: 200px;*/
	gap: 2px;
	position: relative;
	border: inset 2px #ddd;
	background-color: white;
}
.listview div {
	/*padding-left: 2px;*/
	padding: 0 1px;
}
.listview .header {
	background-color: #ece9d8;
	border: outset 1px #ddd;
	border-right: groove 1px #ddd;
}

.changed {
	background-color: #ffa
}

.dead { background-color: #fcc }

[role="progressbar"] {
	height: 15px;
	border: 1px solid #888;
	border-radius: 3px;
	overflow: hidden;
	background-color: white;
}
[role="progressbar"] > div {
	overflow: hidden;
	height: 13px;
	margin: 1px;
}
[role="progressbar"] > div:first-child {
	/*box-shadow: inset 0 0 1px #fff;*/
	background-color: #ace97c;
}
[role="progressbar"] > div:nth-child(2) {
	text-align: center;
	width: 100%;
}

[role="progressbar"] {
	position: relative;
}
[role="progressbar"] > * {
	position: absolute;
	top: 0;
	left: 0;
}

#task { margin: 1px 0 2px 0; }

.prog {
	border: 1px solid #888;
	border-radius: 3px;
	height: 11px; /* TODO this needs to be 12px to properly fit text inside but that's one pixel too big for the current space alloted to the other rows with just text, so we need to resolve that somehow */
	text-align: center;
	margin-right: 1px;
}

#elapsed {
/*	grid-column: 1 / 3;
	text-align: center;
*/
	float: right;
}
</style>


<div id=sheet>
	<div id=col1>
		<div id=vitals class=listview>
			<div class=header>Vital Statistics</div>
			<div>Name</div><div id="name"></div>
			<div>Species</div><div id="species"></div>
			<div>Level</div><div id="level"></div>
			<div>Experience</div><div id="xp" class=prog data-warning='#CDFF2F'></div>
			<div>Health</div><div id="health" class=prog></div>
			<div>Energy</div><div id="energy" class=prog></div>
			<div>Enchantment</div><div id="enchantment"></div>
		</div>

		<div id=stats class=listview>
			<div class=header>Stats <span id=tp></span></div>
			<div>Strength</div>  <div id="s0"></div>
			<div>Agility</div>   <div id="s1"></div>
			<div>Endurance</div> <div id="s2"></div>
			<div>Intellect</div> <div id="s3"></div>
			<div>Wisdom</div>    <div id="s4"></div>
			<div>Charisma</div>  <div id="s5"></div>
		</div>

		<div id=spells class=listview>
			<div class=header>Spell Book</div>
			<div id=bt0>&nbsp;</div> <div id="b0"></div>
			<div id=bt1>&nbsp;</div> <div id="b1"></div>
			<div id=bt2>&nbsp;</div> <div id="b2"></div>
			<div id=bt3>&nbsp;</div> <div id="b3"></div>
		</div>
	</div>

	<div id=col2>
		<div id=equipment class=listview>
			<div class=header>Equipment	(Armor Class: <span id=armorClass></span>)</div>
			<div>Weapon</div>   <div id=e0></div>
			<div>Armor</div>    <div id=e1></div>
			<div>Shield</div>   <div id=e2></div>
			<div>Headgear</div> <div id=e3></div>
			<div>Footwear</div> <div id=e4></div>
			<div>Mount</div>    <div id=e5></div>
			<div>Ring</div>     <div id=e6></div>
			<div>Totem</div>    <div id=e7></div>
		</div>
		<div id=inventory class=listview>
			<div class=header>Inventory</div>
			<div>Gold</div><div id=i0></div>
			<div id=trophies>Trophies</div><div id=i1></div>
			<div>Reagents</div><div id=i2></div>
			<div>Resources</div><div id=i3></div>
			<div>Rations</div><div id=i4></div>
			<div>Treasures</div><div id=i5></div>
			<div>Healing Potions</div><div id=i6></div>
			<div>Life Potions</div><div id=i7></div>
			<div class=footer>Encumbrance<div id=encumbrance class=prog data-warning='#fb4' data-emergency='#f99'></div></div>
		</div>
	</div>

	<div id=col3>
		<div id=environment class=listview>
			<div class=header>Environment</div>
			<div>Date</div><div id=date></div>
			<div>Hour-of-Day</div><div id=time></div>
			<div>Coordinates</div><div id=location></div>
			<div>Locale</div><div id=locale></div>
			<div>Terrain</div><div id=terrain></div>
		</div>
		<div id=encounter class=listview>
			<div class=header>Encounter</div>
			<div>Creature</div><div id=mob></div>
			<div>Health</div><div id=mobHealth class=prog></div>
		</div>
		<div id=quest class=listview>
			<div class=header>Quest</div>
			<div>Goal</div><div id=questgoal></div>
			<div id=questdesc></div>
			<div>Progress</div> <div id=questprogress class=prog></div>
		</div>
		<div id=plot class=listview>
			<div class=header>Game Progress</div>
			<div id=act></div><div id=actprogress class=prog></div>
			<div>Overall</div> <div id=gameprogress class=prog></div>
		</div>
	</div>
</div>

<div id=task-area class=status-bar>
	<div class=status-bar-field>
		<div id=elapsed></div>
		<div id=task >Loading...</div>
		<div id=taskbar role="progressbar" aria-valuemin=0 aria-valuemax=100 aria-valuenow=90>
			<div></div>
			<div></div>
		</div>
	</div>
</div>`;


function setBar(id, value, end, start=0, color='#ace97c') {
	let bar = $id(id);
	if (value > end && bar.getAttribute('data-warning')) color = bar.getAttribute('data-warning');
	if (value > (end - start) * 1.5 && bar.getAttribute('data-emergency')) color = bar.getAttribute('data-emergency');
	let progress = end == start ? 0 : Math.round(100 * (value - start) / (end - start));
	let bi = `linear-gradient(left, ${color}, ${color} ${progress}%, transparent ${progress}%, transparent 100%)`
	bar.style.backgroundImage = bi;
	bar.style.backgroundImage = '-webkit-' + bi;
}


function plural(s) {
	if (s.endsWith('y'))
		return s.slice(0,-1) + 'ies';
	else if (s.endsWith('us'))
		return s.slice(0,-2) + 'i';
	else if (s.endsWith('ch') || s.endsWith('x') || s.endsWith('s') || s.endsWith( 'sh'))
		return s + 'es';
	else if (s.endsWith('f'))
		return s.slice(0,-1) + 'ves';
	else if (s.endsWith('man') || s.endsWith('Man'))
		return s.slice(0,-2) + 'en';
	else return s + 's';
}

function properCase(s) {
	return s[0].toUpperCase() + s.substr(1).toLowerCase();
}

function toRoman(n) {
	if (!n) return "O";
	var s = "";
	function _rome(dn,ds) {
		if (n >= dn) {
			n -= dn;
			s += ds;
			return true;
		} else return false;
	}
	if (n < 0) {
		s = "-";
		n = -n;
	}

	while (_rome(10000,"T")) {0;}
	_rome(9000,"MT");
	_rome(5000,"A");
	_rome(4000,"MA");
	while (_rome(1000,"M")) {0;}
	_rome(900,"CM");
	_rome(500,"D");
	_rome(400,"CD");
	while (_rome(100,"C")) {0;}
	_rome(90,"XC");
	_rome(50,"L");
	_rome(40,"XL");
	while (_rome(10,"X")) {0;}
	_rome(9,"IX");
	_rome(5,"V");
	_rome(4,"IV");
	while (_rome(1,"I")) {0;}
	return s;
}


function readableTime(hours, years) {
	let t = years * HOURS_PER_YEAR + hours;
	let calendar = t % HOURS_PER_DAY + ' hours';
	t = (t / HOURS_PER_DAY) >> 0;
	if (t) {
		calendar = t % DAYS_PER_MONTH + ' days, ' + calendar;
		t = (t / DAYS_PER_MONTH) >> 0;
		if (t) {
			calendar = t % MONTHS_PER_YEAR + ' months, ' + calendar;
			t = (t / MONTHS_PER_YEAR) >> 0;
			if (t) {
				calendar = t + ' years, ' + calendar;
			}
		}
	}
	return calendar;
}


const MONTHS = [
	'Injender',
	'Fimbrular',
	'Morchak',
	'Apulia',
	'Milm',
	'Yunke',
	'Ioli',
	'Bargus',
	'Hipsember',
	'Extorber',
	'Orbvemer',
	'Dipnorther',
];

function updateGame(state) {

	function unhilite(timed) {
		$$('.changed').forEach(elt => elt.classList.remove('changed'));
		if (!timed && updateGame.UNHILITE)
			clearTimeout(updateGame.UNHILITE);
		updateGame.UNHILITE = null;
	}

	unhilite();

	function set(id, value) {
		value = value ?? '';
		value = value.toString();
		let elt = document.getElementById(id);
		if (!state[Level] > 0) value = '&nbsp;';
		if (elt.innerHTML !== value) {
			elt.innerHTML = value;
			if (state[Level] > 0) {
				if (!updateGame.UNHILITE) {
					updateGame.UNHILITE = setTimeout(_ => unhilite(true), 5000);
				}
				elt.classList.add('changed');
			}
		}
	}

	function setProgress(id, value, end, start = 0) {
		if (end != 0)
			set(id, `${value}&nbsp;/&nbsp;${end}`);
		else
			set(id, '&nbsp;');
		setBar(id, value, end, start);
	}

	set('species', Bompton.SPECIES_NAMES[state[Species]]);
	set('level', state[Level]);
	setProgress('xp', state[Experience],
			Bompton.xpNeededForLevel(state[Level] + 1),
			Bompton.xpNeededForLevel(state[Level]));
	setProgress('health', state[Health], state[MaxHealth]);
	if (state[Health] == 0 && state[MaxHealth] > 0)
		$id('health').classList.add('dead');
	else
		$id('health').classList.remove('dead');
	setProgress('energy', state[Energy], state[MaxEnergy]);
	let spell = SPELLS[state[Enchantment] & 0xFF];
	set('enchantment', spell ? spell.name : '');

	for (let i = 0; i < STAT_COUNT; ++i) {
		set('s' + i, state[STAT_0 + i]);
	}
	$('#tp').innerText = state[TrainingPoints] ? 'TP: ' + state[TrainingPoints] : '';

	for (let i = 0; i < SPELLBOOK_COUNT; ++i) {
		const slot = SPELLBOOK_0 + i;
		let spell = state[slot];
		if (spell) {
			set('bt' + i, 'Chapter ' + toRoman(i+1));
			set('b' + i, SPELLS[spell].name);
		} else {
			set('bt' + i, '&nbsp;');
			set('b' + i, '');
		}
	}

	for (let i = 0; i < EQUIPMENT_COUNT; ++i) {
		let slot = EQUIPMENT_0 + i;
		let v = state[slot];
		if (!v)
			set('e' + i, '');
		else if (slot === EquipmentRing)
			set('e' + i, 'Ring of ' + SLOTS[v].name);
		else if (slot === EquipmentTotem)
			set('e' + i, Bompton.MAP[v].name.split(' ')[0] + ' Totem');
		else {
			const names = (Bompton.DATABASE[slot] ?? {}).names;
			set('e' + i, names[v] || v);
		}
	}
	set('armorClass', state[ArmorClass]);

	for (let i = 0; i < INVENTORY_COUNT; ++i) {
		set('i' + i, state[INVENTORY_0 + i]);
	}
	setProgress('encumbrance', state[Encumbrance], state[Capacity]);
	$id('trophies').innerText = state[TrophyMob] && state[InventoryTrophies] ?
		DENIZENS[state[TrophyMob]].name + ' trophies' : 'Trophies';

	/*
	if (state[Encumbrance] <= state[Capacity]) {
		$id('encumbrance').classList.remove('warning');
		$id('encumbrance').classList.remove('dead');
	} else if (state[Encumbrance] <= state[Capacity] * 1.5) {
		$id('encumbrance').classList.add('warning');
		$id('encumbrance').classList.remove('dead');
	} else {
		$id('encumbrance').classList.add('dead');
		$id('encumbrance').classList.remove('warning');
	}*/

	let local = Bompton.mapInfo(state[Location], state) || {};

	$id('gameprogress').title = readableTime(state[Hours], state[Years]);
	// set('elapsed', readableTime(state[Hours], state[Years]));

	let t = state[Hours];
	let hour = t % HOURS_PER_DAY;
	t = (t / HOURS_PER_DAY) >> 0;
	let day = t % DAYS_PER_MONTH;
	let month = (t / DAYS_PER_MONTH) >> 0;
	set('date', `${day + 1} ${MONTHS[month]}, ${state[Years] + 600}`);
	set('time', hour + 'h');

	set('location', state[Location] ?
		`#${state[Location]} &lt;${longitude(state[Location])}, ${latitude(state[Location])}&gt;` : '');
	set('locale', local ? local.name + ' #' + state[Location] : '');
	set('terrain', (Bompton.TERRAIN_TYPES[local.terrain] ?? {}).name);
	set('mob', state[MobSpecies] ?
		`${Bompton.DENIZENS[state[MobSpecies]].name} (level ${state[MobLevel]})` : '');
	setProgress('mobHealth', state[MobHealth], state[MobMaxHealth]);
	if (state[MobHealth] == 0 && state[MobMaxHealth] > 0)
		$id('mobHealth').classList.add('dead');
	else
		$id('mobHealth').classList.remove('dead');


	let questal = Bompton.mapInfo(state[QuestLocation], state);
	questal &&= questal.name;
	let original = Bompton.mapInfo(state[QuestOrigin], state);
	original &&= original.name;
	const friendlySlotNames = {
		EquipmentTotem: 'totem',
		InventoryGold: 'gold',
		InventoryTrophies: 'trophies',
		InventoryReagents: 'reagents',
		InventoryResources: 'resources',
		InventoryFood: 'food',
		InventoryTreasures: 'treasures',
		InventoryPotions: 'healing potions',
		InventoryLifePotions: 'life potions',
	};
	set('questgoal',
		state[QuestObject] === EquipmentTotem ? 'Deliver the totem' :
		state[QuestObject] == InventoryTrophies ? `Bring me ${state[QuestQty]} ${DENIZENS[state[QuestMob]].name.toLowerCase()} trophies` :
		state[QuestObject] ? `Bring me ${state[QuestQty]} ${friendlySlotNames[SLOTS[state[QuestObject]].name]}` :
		state[QuestMob] ? 	 `Exterminate the ` + plural(DENIZENS[state[QuestMob]].name) :
		'&nbsp;');
	set('questdesc',
		state[QuestObject] === EquipmentTotem ? `Collect the ${questal} Totem and deliver it to ${original}` :
		state[QuestObject] == InventoryTrophies ? `The ${plural(DENIZENS[state[QuestMob]].name.toLowerCase())} in ${questal} are getting out of line. Bring proof of death back to me here in ${original}.` :
		state[QuestObject] ? `We of ${original} stand in need of ${friendlySlotNames[SLOTS[state[QuestObject]].name]}. They say there's no shortage of them in ${questal}.` :
		state[QuestMob] ? 	 `It's time to put an end to these ${plural(DENIZENS[state[QuestMob]].name)}. You'll find plenty of them to kill in ${questal}.` :
		'<br>&nbsp;');
	setProgress('questprogress', state[QuestProgress], state[QuestQty]);

	set('act', state[Act] > 9 ? 'Afterlife' : 'Act ' + toRoman(state[Act]));
	if (state[ActDuration])
		set('actprogress', Math.round(100 * state[ActProgress]/state[ActDuration]) + '%');
	else
		set('actprogress', '0%');
	setBar('actprogress', state[ActProgress], state[ActDuration]);
	set('gameprogress', `${Math.round(100 * Math.max(0, state[Act] - 1) / 9)}%`);
	setBar('gameprogress', state[Act] - 1, 9);

	if (state[Level] == 0) {
		TASK = '&nbsp;';
	} else if (state[GameOver] === 401) {
		TASK = 'Game over. Character has retired.';
	} else if (state[GameOver] === 333) {
		TASK = 'Game over. Simulation has crashed!';
	} else if (state[GameOver] === 100) {
		TASK = 'Game over. Character has aged out.';
	} else if (state[GameOver] === 86) {
		TASK = 'Game over. You died.';
	} else if (state[GameOver] === 1) {
		TASK = 'Game complete! Victory!';
	} else if (state[GameOver]) {
		TASK = 'Game over!';
	} else if (!vm.running) {
		TASK = 'Halted.';
	}
	$id('task').innerHTML = TASK;
	setTaskBar();
}


function gameplay(inst, arg1, arg2) {
	arg1 = arg1 || eval($("#arg1").value);
	arg2 = arg2 || eval($("#arg2").value);
	let result = Bompton.handleInstruction(vm.state, inst, arg1, arg2);
	$("#result").innerText = result;
	updateDebuggerState(vm);
	updateGame(vm.state);
}

Bompton.playmation = function(vm, butStop) {
	function age() { return vm.state[Years] * HOURS_PER_YEAR + vm.state[Hours] }
	let before = age();
	while (vm.alive() && age() == before) {
		vm.step();
	}
	animate.duration = 1000 * Math.round(Math.sqrt(2 * (age() - before)));
	animate.progress = 0;
	$id('task').innerText = TASK;
	setTaskBar();
	if (!butStop)
		window.gameplayTimer = setTimeout(animate, 10);
}



function animate() {
	animate.progress += 10;
	setTaskBar();
	if (animate.progress >= animate.duration) {
		if (typeof updateDebuggerState !== 'undefined') // TODO awkward as hell
			updateDebuggerState(vm);
		Bompton.updateUI(vm.state);
		if (vm.alive())
			window.gameplayTimer = setTimeout(_ => Bompton.playmation(vm), 1);
	} else {
		window.gameplayTimer = setTimeout(animate, 10);
	}
}

function setTaskBar() {
	// setBar('task', animate.progress, animate.duration, 0, '#ace97c');
	let bar  = $('#taskbar > div:nth-child(1)');
	let text = $('#taskbar > div:nth-child(2)');
	if (animate.duration > 0) {
		let pct = 100 * animate.progress / animate.duration;
		bar.style.width = pct.toFixed(2) + "%";
		text.innerText = Math.round(pct) + '%';
	} else {
		bar.style.width = 0;
		text.innerText = "";
	}
}



return Bompton; })();


if (typeof module !== 'undefined') {
	module.exports = Bompton;
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
		console.log(`<link rel=stylesheet href="node_modules/xp.css/dist/XP.css">`);
		console.log(Bompton.generateDocumentation());
	}

	if (positionals.length) {
		let { readFileAsWords, VirtualMachine } = require('./vm.js');
		let code = readFileAsWords(positionals[0]);
		let vm = new VirtualMachine(code, Bompton);
		if (verbosity > 1) vm.trace = true;
		vm.run();
		if (verbosity > 0) {
			Bompton.dumpState(vm.state);
			vm.dumpState();
		}
	}
}
