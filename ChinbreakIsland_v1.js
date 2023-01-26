#!/usr/bin/env node
// Chinbreak Island: A Progress Quest Slot module

const ChinbreakIsland_v1 = (_ => {

const GR = 0.5 + Math.sqrt(5) / 2;

const MIN_INT = -0x8000;
const MAX_INT =  0x7FFF;

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


	{ name: 'Defense',
	  description: `Ability to deflect or avoid an opponent's attack. Calculated based on equipment, stats and bonuses.` },

	{ name: 'Offense',
	  description: `Ability to penetrate an opponent's defenses in a melee attack. Calculated based on equipment, stats and bonuses.` },

	{ name: 'Potency',
	  description: `Degree of damage possible in successful melee attacks. Calculated based on equipment, stats and bonuses.` },


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


	{ name: 'Strength',
	  description: `Ability to deal damage and lift heavy things.` },

	{ name: 'Agility',
	  description: `Ability to move around, avoid death, etc.` },

	{ name: 'Endurance',
	  description: `Ability to absorb damage and retain energy.` },

	{ name: 'Intellect',
	  description: `Rating of cognitive ability and perception.` },

	{ name: 'Wisdom',
	  description: `Discernment, knowlege and sagacity.` },

	{ name: 'Charisma',
	  description: `Likeability and ability to read others.` },


	{ name: 'Spellbook1',
	  description: `Your spellbook has room for only four spells in its four
	  chapters. This is the spell in the first chapter. Learn spells via
	  copySpell() command and cast them with use().` },

	{ name: 'Spellbook2',
	  description: `Spellbook spell number 2.` },

	{ name: 'Spellbook3',
	  description: `Spellbook spell number 3.` },

	{ name: 'Spellbook4',
	  description: `Spellbook spell number 4.` },


	{ name: 'Weapon',
	  description: `The weapon is used for causing damage to one's foe. Use it
	  with the "use" command to perform a melee attack.` },

	{ name: 'Armor',
	  description: `Armor is worn on the body to protect it from damage.` },

	{ name: 'Shield',
	  description: `A shield may be held to deflect blows from one's oppenent's attacks.` },

	{ name: 'Headgear',
	  description: `Helments and other headgear help protect the head from physical trauma.` },

	{ name: 'Footwear',
	  description: `The feet and lower legs may be protected with good footwear choices.` },

	{ name: 'Mount',
	  description: `Adventurers use mounts to improve their travel speed and carrying capacity.` },

	{ name: 'Scroll',
	  description: `Scrolls, at least the scrolls we're talking about here,
	  have magic spells on them. Use em to cast the spell, or as a source for
	  copying them into your spellbook.` },

	{ name: 'Totem',
	  description: `Totems are local to specific areas and may play a part in various quests.` },


	{ name: 'Gold',
	  description: `Inventory item. Gold coins are the common medium of value
	  storage and exchange.` },

	{ name: 'Trophies',
	  description: `Inventory item. Skins, horns, teeth, etc. collected from slain enemies.` },

	{ name: 'Reagents',
	  description: `Inventory item. Various herbs and special items often needed for spellcasting.` },

	{ name: 'Ammunition',
	  description: `Inventory item. Arrows and other projectiles which may be
	  fashioned from natural resources gathered in nature.` },

	{ name: 'Rations',
	  description: `Inventory item. Adventurers eat rations every time they
	  travel. If they're out of rations, travelling takes longer due to extra
	  time spent hunting and foraging and complaining about being hungry.
	  Rations may also be eaten to raise Energy slightly, via the "use" command.` },

	{ name: 'Treasures',
	  description: `Inventory item. Exceptional items of high trade value.` },

	{ name: 'Potions',
	  description: `Inventory item. Consuming a potion via the "use" command
	  restores both energy and health to maximum.` },

	{ name: 'Sunsparks',
	  description: `Inventory item. These restore life at the moment of death. Kind of
	  expensive, but that is a pretty handy feature.` },


	{ name: 'Location',
	  description: `Current location. The localities of Chinbreak Island are numbered from one to thirty-eight.` },


	{ name: 'MobSpecies',
	  description: `Species of the nearby creature.` },

	{ name: 'MobLevel',
	  description: `Overall puissance of the nearby creature.` },

	{ name: 'MobHealth',
	  description: `Current health of the nearby creature.` },

	{ name: 'MobMaxHealth',
	  description: `Maximum health of the nearby creature.` },

	{ name: 'MobAggro',
	  description: `Greater than zero if nearby creature is aggressive towards you, i.e. attacking.` },

  	{ name: 'QuestType',
  	  description: `Identifies the rules of the current quest as listed under Quest Types. Will be zero if there is no current quest.` },

  	{ name: 'QuestStoryline',
  	  description: `Indicates the storyline of the current quest (0 for the main storyline or non-zero for a side quest).` },

	{ name: 'QuestObject',
	  description: `The item slot which is the target of the current quest, if any.` },

	{ name: 'QuestMob', // monster (by id)
	  description: `The creature type associated with the current quest, if any.` },

	{ name: 'QuestLocation', // location to perform the quest
	  description: `The location associated with the current quest, if any.` },

	{ name: 'QuestQty', // qty # required
	  description: `The quantity needed to fulfill the current quest.` },

	{ name: 'QuestProgress', // # completed
	  description: `The portion of the QuestQty which has been completed.` },

	{ name: 'QuestEnd', // town location
	  description: `The location where the quest may be completed, which may be where it was assigned.` },


	{ name: 'Act', // (up to 9, 10 = win)
	  description: `The current act. The main plot of the game takes place in nine acts.` },

	{ name: 'ActDuration', // # of something required
	  description: `The number of quests to be completed to complete the current act.` },

	{ name: 'ActProgress', // as advanced by quests
	  description: `The number of quests which have been completed for the current act.` },


	{ name: 'BalanceGold',      // bank of Bompton...
	  description: `Gold may be deposited into the Bank of Bompton. This is
	  the amount of gold under deposit by the character.` },

	{ name: 'BalanceTreasures', // ...balances
	  description: `The number of treasures under deposit by the character in
	  the Bank of Bompton.` },

	{ name: 'Seed',  // PRNG seed
	  description: `Pseudo-random number seed, used by the game engine.` },

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

const STAT_0 = Strength;
const SPELLBOOK_0 = Spellbook1;
const EQUIPMENT_0 = Weapon;
const INVENTORY_0 = Gold;

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
	train: { parameters: 'slot',
		description: `Train to improve stats (Strength, and so on).
		Training speed can be affected by various environmental factors.` },

	copySpell: { parameters: 'spellbook_slot',
		description: `Copy a spell from a scroll into your spellbook. This
		spell will replace any existing spell in that spellbook slot. The
		scroll will be destroyed in the process.

		The spellbook_slot is a value from 1 to 4.` },

	travel: { parameters: 'destination',
		description: `Travel towards a given map location. If the destination
		is reachable, this will get them one map location closer. The
		character may not choose the most efficient route, so travel
		step-by-step if more efficiency is desired.` },

	use: { parameters: 'slot',
		description: `Use the item, specified by state slot index, for its
		intended purpose. Valid slots are Spellbook slots, Potion, Rations,
		and Weapon.` },

	buy: { parameters: 'slot,qualanty',
		description: `Buy a quantity of some inventory item
		(Potions, etc.) from the local shopkeeper, You can get a
		price check by passing 0 as the quantitiy.

		<p>Or, buy a piece of equipment (EQUIPMENT_*) of a certain quality. This
		will replace any equipment already in that slot, so consider
		selling it first.` },

	sell: { parameters: 'slot,quantity',
		description: `Sell an inventory item of piece of equipment.` },

	seekQuest: { parameters: 'storyline',
		description: `While in town, ask around and listen to rumors in hopes
		of discovering adventures that await and tasks to complete.
		There's only one quest active at any given time. The parameter is
		0 for main quests (which contribute to game completion) or some
		other value for side quests (which may be completed for lulz or
		profit).` },

	completequest: {
		description: `Report back to the originator of the current quest to
		gain sundry rewards for your efforts.` },

	seek: { parameters: 'target_slot',
		description: `Comb the local area for items such as Rations, or
		Ammunition, or to hunt creatures use MobSpecies, or to find a place
		without mobs use 0, or look for the local Totem.` },

	loot: { parameters: 'slot',
		description: `Loot any nearby corpse for whatever goodies they may
		hold. The parameter is the loot you're after. All mobs can be
		looted for Trophies, and some may have other items present.` },

	rest: {
		description: `Grab some downtime to reduce fatigue and damage. Resting
		is much more effected in town than it is out in the wilderness.` },

	levelup: {
		description: `Level up! When you've accumulated enough experience, you
		can take yourself to the next level by leveling up. This will
		increase your general effectiveness accross the board, and may
		result in stat or other bonuses.` },

	give: { parameters: 'slot,quantity',
		description: `Hand over in item to whomever is nearby.` },

	drop: { parameters: 'slot,quantity',
		description: `Drop stuff right on the ground, just to get rid of it.` },

	deposit: { parameters: 'slot,quantity',
		description: `When in Bompton Town, stop at the Bank of Bompton where
		you can store Gold and Treasures. There is a
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

	interface.push('// Chinbreak Island v1\n');

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

	interface.push('\n// State vector slots');

	SLOTS.forEach((slot, index) =>
		interface.push(`const ${slot.name} = ${index}`));

	interface.push('\n// Map');

	MAP.forEach((locale, index) =>
		locale && interface.push(`const ${moniker(locale.name)} = ${index}`));

	interface.push('\n// Spells');

	SPELLS.forEach((spell, index) =>
		spell && interface.push(`const ${moniker(spell.name)} = ${index}`));

	interface.push('\n// Mob Species');

	MOBS.forEach((denizen, index) =>
		denizen && interface.push(`const ${moniker(denizen.name)} = ${index}`));

	interface.push('\n// Quest Types');

	QUEST_TYPES.forEach((questType, index) =>
		questType && interface.push(`const ${moniker(questType.name)} = ${index}`));

	interface.push('');

	return interface.join('\n');
}


function generateDocumentation() {

	let result = `<!doctype html>
<head><title>Chinbreak Island Reference</title>

<style>
* {
	font-family: Verdana, Helvetica, sans-serif;
	color: #203520;
}
h1 { font-size: 36px; }
h2 { font-size: 30px; }
h3 { font-size: 24px; }
body {
	margin: 50px 100px;
	background-color: #f8fff8;
}
h4 {
	font-size: 18px;
	margin: 16px 0 10px 0;
}
th {
	text-align: left;
}
code {
	color: #282;
}
#weaps {
	display: grid;
	grid-template-columns: 50px repeat(${NUM_WEAPON_TYPES}, 175px);
	gap: 4px;
}
#weaps .head {
	font-weight: bold;
}
div#terrains {
	display: grid;
	grid-template-columns: 30px 100px 100px 200px;
}
</style>
</head><body>
<h1>Chinbreak Island Programmer's Reference</h1>
	`;

	function head(h) { result += `<h2>${h}</h2>`; }
	function midhead(h) { result += `<h3>${h}</h3>`; }
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

	SLOTS.forEach((slot, i) => { if (slot) {
		let { name, description } = slot;

		if (i === EQUIPMENT_0) {
			midhead('Equipment');
			p('The character may equip no more than one of each equipment type.');
		} else if (i === INVENTORY_0) {
			midhead('Inventory Items');
			p(`Inventory items. The value in these slot indicates the quantity
			of each item held in the character's inventory.`);
		} else if (i === STAT_0) {
			midhead('Stats');
			p(`Character stats are a general rating of their excellence in each area of development.`);
		} else if (i === Location) {
			midhead('&nbsp;');
		}

		subhead(code(`${name} (${i})`))
		p(description);

		if (isInventorySlot(i)) {
			p(`Value: $` + DATABASE[i].value);
			p(`Weight: ${DATABASE[i].weight}#`);
		}

	} });

	head('Spells');

	p(`Spells are cast either by using a Scroll, or by using a SpellbookN
	slot, which has both and Energy and Reagent cost. Spells may be copied
	into the spellboook using the copySpell function.`);

	p(`Some spells are enchantments, meaning they remain active until the
	caster loses concentration, either by casting another spell or resting.`);

	SPELLS.forEach((spell, i) => { if (spell) {
		let {name, enchantment, description, level, costs} = spell;
		name = moniker(name) + ' (' + i + ')';
		if (enchantment) description = 'Enchantment. ' + description;
		subhead(code(name), description);
		p('Level ' + level);
		if (costs)
			p('Cost: ' + costs.map(({slot, qty}) => qty + ' ' + SLOTS[slot].name).join(', '));
	} });

	head('Weapons');

	p(`The base price of weapons is ${DATABASE[Weapon].basePrice}.`);

	subhead('Weapon Types');

	WEAPON_TYPES.forEach((w,i) => { if (w) {
		p(i + '. ' + w.name + ': ' + w.description);
	} });

	result += '<div id=weaps><div class=head>Power</div>';
	for (let w of weaponTypeNames)
		if (w) div(w, 'class=head');
	WEAPON_NAMES.forEach((w,i) => { if (w) {
		if ((i - 1) % NUM_WEAPON_TYPES === 0) {
			div(weaponPower(i));
		}
		div(i + '. ' + w);
	} });

	result += '</div>'

	head('Other Equipment');

	for (let t = EQUIPMENT_0 + 1; t < EQUIPMENT_0 + EQUIPMENT_COUNT; t += 1) {
		if (DATABASE[t]) {
			subhead(SLOTS[t].name);
			p('Base price: ' + DATABASE[t].basePrice);
			DATABASE[t].names.forEach((e,i) => {
				if (e) p(i + ': ' + e);
			});
		}
	}

	head('Terrain types');

	result += `<div id=terrains>`;
	div('ID');
	div('Terrain');
	div('Move cost');
	div('Forage');
	TERRAIN_TYPES.forEach((t,i) => { if (t) {
		div(i);
		div(t.name);
		div(t.moveCost ?? 1);
		div(t.forage ? SLOTS[t.forage.item].name + ': ' + t.forage.rate : '');
	} });
	result += `</div>`;

	head('Denizens');

	MOBS.forEach((d,i) => { if (d) {
		subhead(i + '. ' + d.name);
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
		subhead(`${tile.name} #${i}`);
		p(`Coordinates: ${latitude(i)}S x ${longitude(i)}E`);
		p(`Terrain: ${TERRAIN_TYPES[tile.terrain].name}`);
		p(`Mob level: ` + tile.level);
		if (tile.denizen)
			p(`Principal occupant: ` + MOBS[tile.denizen].name);
	} });


	head('Quests');

	p(`Quests are assigned by inquiring in towns using the seekQuest function.
	The argument to seekQuest specifies the storyline, where 0 is the main
	storyline, and non-zero values are side quests. Within a single game,
	at a given point in the story, for a given storyline, in a particular
	town, the same quest will be assigned. Hence to complete game, the
	player must complete one of the main storyline quests assigned at one
	of the towns in the game, at each point in the game.`);

	QUEST_TYPES.forEach((qt, i) => { if (qt) {
		subhead(`${qt.name} = ${i}`);
		p(qt.explanation);
	} });

	return result;
}


/////////// Spells

const SPELLS = [ null, {
		name: 'Heal Yeah',
		level: 1,
		effect: state => {
			let healing = 1;
			healing *= Math.pow(GR, state[Wisdom]);
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
		effect: state => {
			if (!state[MobHealth]) return 0;

			let info = MOBS[state[MobSpecies]];

			if (info.esteemSlot)
				dec(state[info.esteemSlot], 1);

			inc(MobAggro);

			damageMob(state, rollAttack(state[Intellect]));
		},
		description: `Hurl a ball of flaming horror at your nearby foe, causing them damage.`,
	}, {
		name: 'Horsewheels',
		level: 3,
		enchantment: [],  // handled in code: speed boost
		description: `Let's put some wheels on that hoss! Increases travel speed.`,
	}, {
		name: 'Spectral Coinpurse',
		level: 5,
		duration: 24,
		effect: state => {
			let winnings = Math.min(roomFor(Gold, state), state[Gold]);
			return inc(Gold, winnings);
		},
		description: `Double. Your. Money.... Overnight! <sup>*</sup>Terms and conditions apply. Doubling is limited by cargo capacity.`,
	}, {
		name: 'Good Luck With That',
		level: 4,
		description: `Increases luck.`,
		enchantment: [],
		// TODO an effect
	}, {
		name: 'History Lessen',
		level: 10,
		effect: state => {
			return state[Years] = 0;
		},
		description: `Go back to when this crazy adventure all started. You get to keep your stuff though.`,
	}, {
		name: "Radical Sympathy",
		level: 7,
		effect: state => {
			if (!state[MobSpecies]) return -1;

			// Lose current species mods
			for (let { slot, increment } of (MOBS[state[Species]].startState ?? [])) {
				if (increment) {
					state[slot] -= increment;
				}
			}

			state[Species] = state[MobSpecies];

			// Apply new species mods
			for (let { slot, increment } of (MOBS[state[Species]].startState ?? [])) {
				if (increment) {
					state[slot] += increment;
				}
			}

			return state[Species];
		},
		description: `Transform yourself into a member of the same species as the nearby creature.`,
	}, {
		name: 'Buff',
		level: 4,
		enchantment: [
			{ slot: Strength, increment: 4 },
		],
		description: `Become just that much stronger.`,
	}, {
		name: 'Shiny',
		level: 6,
		enchantment: [],
		description: `This doesn't do anything to help; it's just cool.`,
	}, {
		name: 'Smort',
		level: 4,
		enchantment: [
			{ slot: Intellect, increment: 4 },
		],
		description: `Become just that much smarter.`,
	}, {
		name: 'Scrambled Eggs',
		level: 9,
		enchantment: [],
		effect: (state, spellid) => {
			if (state[Location] > 36) return -1;
			state[Enchantment] = spellid + (state[Location] << 8);
		},
		description: `Royally scramble the island.`,
	}, {
		name: 'Astral Edifice',
		level: 5,
		enchantment: [],
		effect: (state, spellid) => {
			if (state[Location] > 36) return -1;
			state[Enchantment] = spellid + (state[Location] << 8);
		},
		description: `Bring a ghost town into existence where you now stand.`,
	}, {
		name: 'Health Plan',
		level: 20,
		effect: state => {
			state[Health] = Math.min(MAX_INT, state[Health] + state[Gold]);
			state[Gold] = 0;
		},
		description: `Money CAN buy you health, because magic.`,
	}, {
		name: 'Macrobian',
		level: 15,
		costs: [
			{ slot: Treasures, qty: 49 },
			],
		effect: state => {
			state[Years] = Math.min(state[Years], 14);
		},
		description: `Drink from the magical spring of youth.`,
	},
];

function moniker(s) {
	return s.replaceAll(' ', '_');
}

SPELLS.forEach((spell, index) => spell && define(moniker(spell.name), index));


/////////// Weapons

const WEAPON_DB = [null, {
	name: 'Blunt',
	list: [
			'Firewood Chunk',
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
			'+7 Doomsday Warmaul'
		],
	}, {
		name: 'Bladed',
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
		name: 'Ranged',
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
		name: 'Axes',
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
		name: 'Polearms',
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

WEAPON_TYPES = [ null,
	{ name: 'Blunt',    description: 'Truncheons and such for old fashioned clobbering purposes' },
	// to hit: str  dam: str  cost: less
	{ name: 'Bladed',   description: `Swords, etc. You really can't go wrong with swords.` },
	// to hit: agil  dam: str  cost: more  def: +1
	{ name: 'Ranged',   description: 'Bows and other projectile launchers.' },
	// to hit: agil  dam: wis  ammo?
	{ name: 'Polearms', description: 'Spears and other long, pointy things.' },
	// to hit: agil  dam: agil&str
	{ name: 'Axes',     description: 'The clubbing power of blunt weapons combined with the slicing power of blades.' },
	// to hit: agil & str  dam: str
];
const NUM_WEAPON_TYPES = WEAPON_TYPES.length - 1;
WEAPON_TYPES.forEach((w,i) => w && define(w.name, i));

function weaponPower(n) {
	return Math.floor((n + NUM_WEAPON_TYPES - 1) / NUM_WEAPON_TYPES);
}

function weaponType(n) { return n > 0 ? 1 + (n - 1) % NUM_WEAPON_TYPES : 0 }

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
	'Splint Mail',
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
	'+5 Lava Shark',
	'+6 Kelpie'];


const DATABASE = [];
DATABASE[Weapon] = {
	names: WEAPON_NAMES,
	count: WEAPON_NAMES.length - 1,
	basePrice: 15,
};
DATABASE[Headgear] = {
	names: HEADGEAR_NAMES,
	count: HEADGEAR_NAMES.length - 1,
	basePrice: 10,
};
DATABASE[Armor] = {
	names: ARMOR_NAMES,
	count: ARMOR_NAMES.length - 1,
	basePrice: 20,
};
DATABASE[Shield] = {
	names: SHIELD_NAMES,
	count: SHIELD_NAMES.length - 1,
	basePrice: 10,
};
DATABASE[Footwear] = {
	names: FOOTWEAR_NAMES,
	count: FOOTWEAR_NAMES.length - 1,
	basePrice: 10,
};
DATABASE[Mount] = {
	names: MOUNT_NAMES,
	count: MOUNT_NAMES.length - 1,
	basePrice: 20,
};
DATABASE[Scroll] = {
	names: SPELLS,
	count: SPELLS.length - 1,
	basePrice: 50,
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
		forage: { item: Rations, rate: 2 },
	}, {
		name: 'Marsh',
		color: 'olive',
		moveCost: 2.5,
		forage: { item: Rations, rate: 0 },
	}, {
		name: 'Desert',
		color: 'yellow',
		forage: { item: Rations, rate: 0 },
	}];

TERRAIN_TYPES.forEach((info, index) => {
	if (info) define(info.name.toUpperCase(), index);
});


// Denizens

// TODO stat adjustments for mobs

function amap(...init) {
	let result = new Array();
	for (let i = 0; i < init.length; i += 2) result[init[i]] = init[i+1];
	return result;
}

const MOBS = [
	null,
	{
		name: "Dunkling",
		aka: "Nerfling",
		playable: true,
		esteems: 2,
		waryof: 3,
		proficiency: amap(
			Bladed,   +1,
			Polearms, -1,
			Ranged,   -1),
		startState: [
			{ slot: Agility,  increment: +2 },
			{ slot: Charisma, increment: +1 },
			{ slot: Strength, increment: -1 },
			{ slot: Wisdom,   increment: -2 },

			{ slot: Weapon,   value: 2},
			{ slot: Headgear, value: 1},
			{ slot: Rations,  value: 1 },
		],
		description: "Likable, lithe creatures of small stature, often underestimated.",
		occurrence: 0.2,
	},
	{
		name: "Hardwarf",
		plural: "Hardwarves",
		playable: true,
		esteems: 3,
		waryof: 1,
		proficiency: amap(
			Blunt,  +1,
			Bladed, -1),
		startState: [
			{ slot: Endurance, increment: +2 },
			{ slot: Strength, increment: +1 },
			{ slot: Agility, increment: -1 },
			{ slot: Intellect, increment: -2 },

			{ slot: Weapon, value: 1},
			{ slot: Shield, value: 1},
			{ slot: Gold,   value: 1 },
		],
		description: "Sturdy sorts with an unsubtle demeanor.",
		occurrence: 0.1,
	},
	{
		name: "Eelman",
		playable: true,
		esteems: 1,
		waryof: 2,
		proficiency: amap(
			Polearms, +1,
			Ranged,   +1,
			Blunt,    -1),
		startState: [
			{ slot: Intellect, increment: +2 },
			{ slot: Wisdom, increment: +1 },
			{ slot: Endurance, increment: -1 },
			{ slot: Charisma, increment: -2 },

			{ slot: Weapon,   value: 3},
			{ slot: Footwear, value: 1},
			{ slot: Reagents, value: 1 },
		],
		description: "Proud, sometimes haughty, intellectuals.",
		occurrence: 0.1,
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
		drops: Rations,
	}, {
		name: "Noteti",
		badassname: "Innoteti",
		domain: FOREST,
		hitdice: 3,
	}, {
		name: "Polycorn",
		badassname: "Epicorn",
		domain: DESERT,
		hitdice: 4,
	}, {
		name: "Zorc",
		badassname: "Zigzorc",
		domain: MOUNTAINS,
		hitdice: 5,
	}, {
		name: "Boglard",
		badassname: "Bognivore",
		domain: MARSH,
		hitdice: 6,
	}, {
		name: "Baklakesh",
		badassname: "Huntrakesh",
		domain: HILLS,
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
		name: "Gust",
		hitdice: 10,
		occurrence: 0.01,
		domain: TOWN,
		description: "Indistict forms, seemingly sentient.",
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
		name: "Mox Klatryon",
		domain: MOUNTAINS,
		hitdice: 14,
		occurrence: 0,
		drops: Treasures,
	}
];

MOBS.forEach((d, index) => {
	if (d) define(d.name.replace(' ', '_'), index);
});

const Main_Boss = Mox_Klatryon;

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
		trainingBoost: Endurance,
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
		trainingBoost: Wisdom,
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
		trainingBoost: Charisma,
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
		trainingBoost: Strength,
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
		trainingBoost: Agility,
		level: 0,
	}, {
		name: "Solla Desert",
		terrain: DESERT,
		level: 1,

	}, {
		name: "Cholar",
		terrain: TOWN,
		denizen: Dunkling,
		trainingBoost: Intellect,
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
		name: "_____",
		terrain: TOWN,
		denizen: Gust,
		density: GR,
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
		define(moniker(tile.name), index);
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
			if (slot === Weapon) {
				power = weaponPower(item);
				maxPower /= NUM_WEAPON_TYPES;
			} else if (slot === Scroll) {
				power = SPELLS[item].level;
			}
			if (power <= 3) {
				for (let t = 0; t < MAINLAND_TOWNS.length; ++t) {
					sellAt(slot, item, MAINLAND_TOWNS[t]);
				}
			} else if (power == maxPower) {
				sellAt(slot, item, Sygnon_Tower);
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
	else if ((state[Enchantment] & 0xFF) === Astral_Edifice &&
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



DATABASE[Ammunition] =  { value: 1/10,  weight: 1/10,  scarcity: 10,       };
DATABASE[Trophies] =    { value: 1,     weight: 1,     scarcity: 50,       };
DATABASE[Gold] =        { value: 1,     weight: 1/100, scarcity: 10000,    };
DATABASE[Rations] =     { value: 1,     weight: 1,     scarcity: 10,       forageStat: Offense };
DATABASE[Reagents] =    { value: 10,    weight: 1/10,  scarcity: 100,      };
DATABASE[Potions] = 	{ value: 100,   weight: 1,     scarcity: 100000,   };
DATABASE[Treasures] =   { value: 1000,  weight: 3,     scarcity: 1000000,  };
DATABASE[Sunsparks] =   { value: 10000, weight: 1,     scarcity: 10000000, };



function roomFor(item, state) {
	let available = state[Capacity] - state[Encumbrance];
	return Math.floor(available / DATABASE[item].weight);
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

class Prng {
	seed;

	// keys are integers on [0, 0x7fffffff]
	constructor(...keys) {
		this.seed = hash(...keys);
	}

	#eat(key = 0xea7f00d) {
		this.seed = hash(this.seed, key);
		if (this.seed < 0 || this.seed > 0x7fffffff) throw "Bad random algorithm";
		return this.seed;
	}

	// result is real on [0, 1)
	rand(...keys) {
		return this.#eat(0xf70a75) / 0x7fffffff;
	}

	// random integer given keys on [0, ..., scale-1]
	irand(scale) {
		return this.#eat(0x147e9e7) % scale;
	}

	d(pips) { return pips ? this.irand(pips) + 1 : 0 }

	civRoll(att, def) { return this.irand(att + def) < att }

	pick(a) { return a[this.irand(a.length)] }
}

function indefiniteItems(slot, qty) {
	let name = SLOTS[slot].name.toLowerCase();
	const vowels = 'aeiouAEIOU';
	if (qty === 1) {
		if (vowels.includes(name[0]))
			return 'an ' + name;
		else
			return 'a ' + name;
	} else {
		return qty + ' ' + name;
	}
}

function damageMob(state, damage) {
	if (state[MobHealth] <= 0) return;

	state[MobHealth] = Math.max(0, state[MobHealth] - damage);

	if (state[MobHealth] <= 0) {
		let levelDisadvantage = state[MobLevel] - state[Level];
		state[Experience] += Math.round(10 * state[MobLevel] * Math.pow(GR, levelDisadvantage));
		if (state[MobSpecies] == state[QuestMob] && !state[QuestObject]) 
			state[QuestProgress] += 1;
		state[MobAggro] = 0;
	}
}

function clearMob(state) {
	state[MobSpecies] = 0;
	state[MobLevel] = 0;
	state[MobHealth] = 0;
	state[MobMaxHealth] = 0;
	state[MobAggro] = 0;
}

function clearQuest(state) {
	state[QuestType] = 0;
	state[QuestStoryline] = 0;
	state[QuestObject] = 0;
	state[QuestMob] = 0;
	state[QuestLocation] = 0;
	state[QuestEnd] = 0;
	state[QuestProgress] = 0;
	state[QuestQty] = 0;
}

const QUEST_TYPES = [ null,
	{
		// Exterminate the ___
		name: "Exterminate_Mob",
		title: `Exterminate the $MS`,
		description: `Put an end to these $MS. You'll find plenty of them to kill in $L.`,
		explanation: `Execute the required quantity of a particular creature.
		(They needn't be in the quest location, but there will be many of
		them to be found there.)`,
	}, {
		// Bring me N trophies
		name: "Collect_Trophies",
		title: `Bring me $N $M trophies`,
		description: `The $M in $L are too much. Bring proof of death back to me here in $E.`,
		explanation: `Return to the quest ending location a hand over a
		certain quantity of trophies of a particular monster. They can be
		obtained by killing said creature and looting the corpse. You must
		have trophies from only that creature for them to count towards
		quest completion.`,
	}, {
		// Bring me N of some item
		name: "Collect_Item",
		title: `Bring me $N $O`,
		description: `We of $E stand in need of $O. They say there's no shortage in $L.`,
		explanation: `Simply hand over a certain quantity of some item at the
		quest ending location. They may be obtained however you like but
		they may be foraged with greater ease than usual at the quest location.`,
	}, {
		// Bring the totem from origin to location
		name: "Transport_Totem",
		title: 'Deliver the totem',
		description: `Collect the $L Totem and deliver it to $E`,
		explanation: `Obtain the totem paticular to the quest location
		(by seeking for it there) and hand it over at the quest end location.`,
	}, {
		// Cutscene
		name: 'Cutscene',
		// location: specified elsehow
		// qty: likewise
		title: 'Cutscene',
		description: `Watch, amazed, as important events around you advance the plot.`,
		explanation: `Simply call seek(QuestProgress) the required number of times
		at the specified location.`,
	}
];


QUEST_TYPES.forEach((q, index) => {
	if (q) define(q.name, index);
});

const SCRIPT = [{
	act: 'Prologue',
	length: 1,
	scripts: [{
		quest: 0,
		location: Bompton,
		script: `Parakeets twitter and squirrels chitter outside your cottage in Bompton Town.
But doesn't it seem lately that the local wildlife has been acting odd? ...Aggressive?
There's a rustling of underbrush and suddenly the town is under attack!
Squirrels! Rabbits! Parakeets! ... Wild boars! Tigers! Feral gnomes!
You flee in fear to the shore. From Sygnon Isle yonder, there's a rumble and a black cloud.
You return. Town hall is in flames. There are many corpses... You gather a few supplies...
You vow you'll help the people of Bompton and put an end to whatever evil is afoot!`
.split('\n')}],
}, {
	length: 6,
}, {
	length: 7,
}, {
	length: 8,
}, {
	length: 7,
}, {
	length: 8,
}, {
	length: 9,
}, {
	length: 10,
}, {
	length: 10,
}, {
	length: 7,
}, {
	act: 'Epilogue',
	length: 1,
}];


function pickQuestLocation(state, qrng) {
	if (mapInfo(state[Location], state).offshore)
		return Emkell_Peak;
	let qloc = state[Location];
	for (let dist = state[Act] + qrng.irand(2); dist > 0; dist -= 1) {
		// Random walk to find the quest location
		let x = longitude(qloc);
		let y = latitude(qloc);
		let d = 2 * qrng.irand(2) - 1;
		let dloc;
		if (qrng.irand(2)) {
			if (x + d < 0 || x + d >= 6) d *= -1;
			dloc = 1 + 6 * y + (x + d);
		} else {
			if (y + d < 0 || y + d >= 6) d *= -1;
			dloc = 1 + 6 * (y + d) + x;
		}
		if (dloc != state[Location]) qloc = dloc;
	}
	return qloc;
}

function questScript(act, quest) {
	act = SCRIPT[act];
	if (!act || !act.scripts) return;
	return act.scripts.filter(s => s.quest == quest || s.quest + act.length == quest)[0];
}

function assignQuest(state, storyline) {
	if (!SCRIPT[state[Act]]) return;

	let qrng = new Prng(state[Seed], 0x9035D, state[Act], state[ActProgress], state[Location], storyline);

	state[QuestStoryline] = storyline;

	let script = questScript(state[Act], state[ActProgress]);
	if (script) {
		state[QuestType] = Cutscene;
		state[QuestLocation] = script.location;
		state[QuestQty] = script.script.length;

	} else {

		function pickQuestMob(act) {
			let maxlev = act + qrng.irand(act);
			let minlev = act - Math.min(qrng.irand(act), qrng.irand(act));
			let options = [];
			MOBS.forEach((mob,index) => {
				if (mob && minlev <= mob.hitdice && mob.hitdice <= maxlev)
					options.push(index);
			});
			return qrng.pick(options);
		}

		if (!storyline && state[Act] == 9) {
			if (state[ActProgress] < 3) {
				state[QuestType] = Transport_Totem;
				state[QuestObject] = Totem;
				state[QuestEnd] = qrng.d(36);
				do { state[QuestLocation] = qrng.d(36);
				} while (state[QuestLocation] == state[QuestEnd]);
				state[QuestQty] = 2; // pick up, drop off
			} else if (state[ActProgress] == state[ActDuration] - 1) {
				state[QuestType] = Exterminate_Mob;
				state[QuestMob] = Main_Boss;
				state[QuestQty] = 1;
				state[QuestLocation] = Emkell_Peak;
			} else {
				state[QuestType] = Exterminate_Mob;
				state[QuestLocation] = Emkell_Peak;
				state[QuestMob] = pickQuestMob(state[Act]);
				state[QuestObject] = 0;
				state[QuestQty] = 25 + qrng.d(4) - qrng.d(4);
			}
		} else {
			state[QuestLocation] = pickQuestLocation(state, qrng);
			state[QuestEnd] = state[Location];
			const roll = qrng.d(3);
			if (roll === 1) {
				state[QuestType] = Exterminate_Mob;
				state[QuestMob] = pickQuestMob(state[Act]);
				state[QuestQty] = 2 + 2 * state[Act] + qrng.d(2) - qrng.d(2);  // TODO use charisma here (instead?)
			} else if (roll === 2) {
				state[QuestType] = Collect_Trophies;
				state[QuestObject] = Trophies;
				state[QuestMob] = pickQuestMob(state[Act]);
				state[QuestQty] = 1 + state[Act] + qrng.d(2) - qrng.d(2);
			} else {
				state[QuestType] = Collect_Item;
				state[QuestObject] = qrng.pick([Ammunition, Trophies]);
				// TODO add Gold and Rations to this list, which will need smarter AI
				state[QuestQty] = Math.max(2, 5 + state[Act] * 3 - qrng.irand(state[Charisma]));;
			}
		}
	}
}

function describeQuest(state, title) {
	if (!state[QuestType]) return '&nbsp;';
	let result = QUEST_TYPES[state[QuestType]][title ? 'title' : 'description'];
	let questal = Chinbreak.mapInfo(state[QuestLocation], state);
	let original = Chinbreak.mapInfo(state[QuestEnd], state);
	result = result
		.replace('$N', state[QuestQty])
		.replace('$MS', state[QuestMob] && plural(MOBS[state[QuestMob]].name))
		.replace('$M', state[QuestMob] && MOBS[state[QuestMob]].name.toLowerCase())
		.replace('$O', state[QuestObject] && SLOTS[state[QuestObject]].name.toLowerCase())
		.replace('$L', questal && questal.name)
		.replace('$E', original && original.name);
	if (state[QuestStoryline] === 0)
		result = '👑 ' + result;
	return result;
}


let TASK = '';
let REALTIME;  // more global cheesiness

class Chinbreak {
	state;
	characterName;

	static title = 'Progress Quest Slog: Chinbreak Island';

	static get windowContent() { return CHINBREAK_WINDOW_CONTENT }

	constructor(code, ...args) {
		this.state = new Int16Array(SLOTS.length);
		this.state[Seed] = hash(0x3FB9, ...code);
		REALTIME = 0;

		this.characterName = args[1] ?? 'Test Pilot';

		const species = args[0] ?? 1;
		this.handleInstruction(this.state, 0, species);  // start the game
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

	updateUI() {
		$('#name').innerText = this.characterName;
		updateGame(this.state);
		animate.progress = animate.duration = 0;
		setTaskBar();
	}

	static generateInterface = generateInterface;
	static generateMap = generateMap;
	static generateDocumentation = generateDocumentation;

	static SPECIES_NAMES = MOBS.map(r => (r && r.name) || '');
	static TERRAIN_TYPES = TERRAIN_TYPES;
	static MOBS = MOBS;
	static MAP = MAP;
	static mapInfo = mapInfo;
	static DATABASE = DATABASE;
	static SLOTS = SLOTS;


	dumpState(state) {
		let nfo = [];
		for (let i = 0; i < SLOTS.length; ++i)
			if (state[i])
				nfo.push(SLOTS[i].name + ': ' + state[i]);
		let m = 2 + Math.max(...nfo.map(l => l.length));
		let cols = Math.max(Math.floor(79 / m), 1);
		let rows = Math.ceil(nfo.length / cols);
		for (let i = 0; i < rows; i += 1)  {
			let row = '';
			for (let c = 0; c < cols; c += 1) {
				let n = i + c * rows;
				if (n < nfo.length)
					row += (nfo[n] + ' '.repeat(m)).substr(0, m);
			}
			console.log(row);
		}
	}

	handleInstruction(state, operation, ...args) {
		let before = age(state);

		let result = this._handleInstruction(state, operation, ...args);

		REALTIME += realTimeSeconds(age(state) - before);

		// Various state values are calculable from other state values
		// but we store them in the state vector for convenience and visibility

		let encumbrance = 0
		for (let i = INVENTORY_0; i < INVENTORY_0 + INVENTORY_COUNT; i += 1) {
			encumbrance += DATABASE[i].weight * state[i];
		}
		state[Encumbrance] = Math.floor(encumbrance);
		state[Capacity] = state[Strength] + state[Mount];

		let prof = MOBS[state[Species]].proficiency ?? 0;
		if (prof) prof = prof[weaponType(state[Weapon])] ?? 0;

		state[Offense] = state[Agility] + weaponPower(state[Weapon]) + prof;
		state[Potency] = Math.round(Math.pow(state[Strength], 1/GR)) + weaponPower(state[Weapon]) + prof;
		state[Defense] =
			state[Agility] +
			state[Armor] +
			state[Shield] +
			state[Headgear] +
			state[Footwear];

		if (state[Health] <= 0) {
			state[GameOver] = 86;
		} else if (state[Years] >= 100) {
			state[GameOver] = 100;
		} else if (state[Act] > 9) {
			state[GameOver] = 1;
		}

		if (state[Trophies] === 0)
			state[TrophyMob] = 0;

		return result;
	}

	_handleInstruction(state, operation, ...args) {
		let arg1 = args[0];
		let arg2 = args[1];

		let rng = new Prng(state[Seed], 0x5EED, state[Years], state[Hours], operation, ...args);

		function d(n) { return rng.d(n) }

		function rollAttack(offense, defense, potency) {
			if (rng.civRoll(offense, defense)) {
				return rng.d(Math.max(1, potency));
			} else {
				return 0;
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

			let act = SCRIPT[state[Act]];
			if (!act) return false;

			inc(Act);
			state[ActDuration] = act ? act.length : 0;
			state[ActProgress] = 0;
			return true;
		}

		if (operation === cheat) {
			// TODO: Remove this some time
			let [slot, value] = [arg1, arg2];
			state[slot] = value;
			return value;
		}

		if (state[Level] === 0) {
			// Game hasn't begun. This gets called once in the constructor to initialize it
			let species = arg1;
			let speciesinfo = MOBS[species];
			if (!speciesinfo || !speciesinfo.playable) {
				species = Dunkling;
				speciesinfo = MOBS[species];
			}

			state[Species] = species;

			// Have to add two to keep from going negative
			for (let stat = STAT_0; stat < STAT_0 + STAT_COUNT; stat += 1)
				state[stat] = 2;

			for (let { slot, increment, value } of speciesinfo.startState ?? [])
				state[slot] = value ?? (state[slot] + increment)

			state[Level] = 1;
			state[Location] = Bompton;
			state[Health] = state[MaxHealth] = 2 + state[Endurance];
			state[Energy] = state[MaxEnergy] = 0 + state[Intellect];
			state[TrainingPoints] = 10;
			state[ActDuration] = SCRIPT[state[Act]].length;

			passTime('Loading', 1);

			return;
		}

		// Game is in process

		let local = mapInfo(state[Location], state);
		let questal = mapInfo(state[QuestLocation], state);

		function passTime(task, hours, days) {
			TASK = task;  // this global is inelegant
			if (TASK[TASK.length - 1] !== '.') TASK += '...';
			if (days) hours += HOURS_PER_DAY * days;
			inc(Hours, hours);
			while (state[Hours] > HOURS_PER_YEAR) {
				inc(Hours, -HOURS_PER_YEAR);
				inc(Years);
			}
		}

		function randomMob(rng) {
			while (true) {
				let mob = rng.d(MOBS.length - 1);
				if (rng.rand() < (MOBS[mob].occurrence ?? 1)) return mob;
			}
		}

		function randomMobNearLevel(goal, repeats, rng) {
			let type = randomMob(rng);
			let level = MOBS[type].hitdice;
			for (let i = 0; i < repeats; ++i) {
				let t = randomMob(rng);
				let l = MOBS[t].hitdice;

				if (Math.abs(l - goal) < Math.abs(level - goal)) {
					type = t;
					level = l;
				}
			}
			return type;
		}


		function inc(slot, qty=1) {
			return state[slot] = Math.min(MAX_INT, Math.max(MIN_INT, state[slot] + qty));
		}

		function dec(slot, qty=1) { return inc(slot, -qty) }

		if (state[MobAggro] && state[MobHealth] > 0) {
			// do mob attack before anything else happens
			let info = MOBS[state[MobSpecies]];
			let damage = rollAttack(state[MobLevel], state[Defense], state[MobLevel]);
			dec(Health, Math.min(state[Health], damage));

			if (state[Health] <= 0) {
				if (state[Sunsparks] > 0) {
					dec(Sunsparks);
					state[Health] = 1;  // ...or should it be max health?
				} else {
					state[GameOver] = 86;
					return 0;
				}
			}
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

			let travelspeed = (state[Endurance] + state[Mount]) / 5;
			if (state[Enchantment] === Horsewheels) travelspeed += 1;

			let hours = 24 / travelspeed;
			let terrain = TERRAIN_TYPES[remote.terrain];
			hours *= terrain.moveCost || 1;

			if (state[Encumbrance] > state[Capacity] * 1.5) hours *= 16; // vastly over-encumbered
			else if (state[Encumbrance] > state[Capacity])  hours *= 2;  // over-encumbered

			if (state[Rations] >= 1)
				dec(Rations)
			else
				hours *= 2;

			hours = Math.round(hours);

			state[Location] = destination;

			clearMob(state);

			let plan = 'Travelling to ' + remote.name;
			if (goal !== remote) plan += ' en route to ' + goal.name;
			passTime(plan, hours);

			return 1;

		} else if (operation === use) {
			let slot = arg1;
			if (!state[slot]) return -1;

			if (isSpellSlot(slot) || slot === Scroll) {
				let spellType = state[slot];
				let spell = SPELLS[spellType];
				if (!spell) return -1;

				if (isSpellSlot(slot)) {
					// TODO have int and or wis help

					let costs = spell.costs ?? [
	                       { slot: Energy, qty: spell.level },
	                       { slot: Reagents, qty: spell.level },
	                   ];

					for (let { slot, qty } of costs)
						if (state[slot] < qty) return -1;

					for (let { slot, qty } of costs)
						dec(slot, qty);
				} else {
					state[Scroll] = 0;
				}

				passTime('Casting ' + spell.name, spell.duration ?? 10);

				endEnchantment();

				if (spell.enchantment) {
					for (let { slot, increment } of spell.enchantment) {
						inc(slot, increment);
					}
					state[Enchantment] = spellType;
				}

				if (spell.effect) return spell.effect(state, spellType);

				return spellType;

			} else if (isInventorySlot(slot)) {
				dec(slot);
				if (slot === Potions) {
					state[Health] = Math.max(state[Health], state[MaxHealth]);
					state[Energy] = Math.max(state[Energy], state[MaxEnergy]);
					passTime('Quaffing an potion', 1);
				} else if (slot === Rations) {
					if (state[Energy] < state[MaxEnergy])
						inc(Energy);
					passTime('Taking a moment to eat something', 1);
				} else {
					return -1;
				}
				return 1;

			} else if (slot === Weapon) {
				// Melee weapon attack
				if (!state[MobSpecies]) return -1;
				if (state[MobHealth] <= 0) return -1;

				let info = MOBS[state[MobSpecies]];

				passTime('Engaging this ' + info.name.toLowerCase() + ' in battle!', 1);

				if (info.esteemSlot)
					dec(state[info.esteemSlot], 1);

				inc(MobAggro);

				let offense = state[Offense];

				if (weaponType(state[Weapon]) == Ranged) {
					if (state[Ammunition] > 0) {
						dec(Ammunition);
					} else {
						offense = 1;  // bludgeoning with the weapon is not very effective
					}
				}

				damageMob(state, rollAttack(state[Offense], state[MobLevel], state[Potency]));

			} else if (slot === Footwear) {
				if (!state[MobSpecies]) return -1;
				if (state[MobHealth] <= 0) return -1;

				let info = MOBS[state[MobSpecies]];

				passTime('Kicking this ' + info.name.toLowerCase() + ' with disdain', 1);

				if (info.esteemSlot)
					dec(state[info.esteemSlot], 1);

				inc(MobAggro);

				damageMob(state, rollAttack(state[Footwear], state[MobLevel], 1));
			}
			return -1;

		} else if (operation === loot) {
			if (!state[MobSpecies] || state[MobHealth] > 0) return -1;
			let info = MOBS[state[MobSpecies]];

			let slot = arg1;

			passTime('Looting the corpse of this ' + info.name.toLowerCase(), 1);

			if (slot === Trophies || (info.drops && slot === info.drops)) {
				if (slot === Trophies) {
					if (state[TrophyMob] == state[MobSpecies] || state[Trophies] == 0)
						state[TrophyMob] = state[MobSpecies];
					else
						state[TrophyMob] = 0;
				}
				inc(slot);
			}

			clearMob(state);

			return 


		} else if (operation === buy) {
			let slot = arg1;
			if (!local.forSale) return -1;  // nothing to buy here
			let qty, levelToBe, price, description;
			if (isEquipmentSlot(slot)) {
				qty = 1;
				levelToBe = arg2;
				if (local.forSale.filter(fsi => fsi.slot === slot &&
					                             fsi.item == levelToBe).length === 0)
					return -1;
				if (!DATABASE[slot] || !DATABASE[slot].basePrice) return -1;
				// TODO store the price in the forSale DB
				price = Math.round(DATABASE[slot].basePrice * Math.pow(GR, levelToBe - 1));
				description = SLOTS[slot].name.toLowerCase() + ': ' + DATABASE[slot].names[levelToBe].name;
			} else if (isInventorySlot(slot)) {
				qty = arg2;
				if (qty < 0) return -1;
				levelToBe = Math.min(MAX_INT, state[slot] + qty);
				price = DATABASE[slot].value;
				description = indefiniteItems(slot, qty)
			} else {
				return -1;
			}

			// TODO: consider local effect on price
			// TODO: in particular prices should be high in Sygnon

			if (state[Charisma] < 1) {
				price *= 2 - state[Charisma]; // 0 cha pays double, -1 pays triple, etc
			} else {
				// 1 cha pays 50% extra, 2 pays 33% extra, etc
				price = price * (1 + 1 / (1 + state[Charisma]));
			}

			if (arg2 === 0) {
				// It's a price check only
				passTime('Checking prices', 1);
				return Math.ceil(price);
			}

			price *= qty;

			price = Math.ceil(price);

			if (state[Gold] < price) return -1;  // Can't afford it

			// You may proceed with the purchase
			inc(Gold, -price);
			state[slot] = levelToBe;
			passTime('Buying ' + description, 3);
			return qty;

		} else if (operation === sell || operation === give || operation === drop) {
			if (operation === sell && local.terrain != TOWN) return -1;
			let [slot, qty] = [arg1, arg2];
			let unitValue, newqty;
			if (isEquipmentSlot(slot)) {
				qty = Math.min(qty, 1);
				unitValue = state[slot];
				if (!unitValue) return -1;
				if (slot === Weapon) unitValue = weaponPower(unitValue);
				unitValue = Math.round(Math.pow(GR, unitValue));
				newqty = 0;
			} else if (isInventorySlot(slot)) {
				qty = Math.min(qty, state[slot]);
				newqty = state[slot] - qty;
				unitValue = DATABASE[slot].value;
				if (slot === Trophies && state[TrophyMob]) {
					const d = MOBS[state[TrophyMob]];
					if (d.hitdice)
						unitValue *= Math.pow(GR, d.hitdice);
				}
			} else {
				return -1;
			}
			if (qty <= 0) return -1;
			if (operation === sell) {
				let price = qty * unitValue;
				price /= (1 + 1 / Math.max(1, state[Charisma]));
				let intprice = Math.floor(price);
				let frac = price - intprice;
				if (rng.rand() < frac) intprice += 1;  // fractional values reflected in probabilities
				inc(Gold, intprice);
			}
			if (operation === give &&
					state[QuestObject] === slot &&
					state[Location] === state[QuestEnd] &&
					[0,state[TrophyMob]].includes(state[QuestMob])) {
				if (state[QuestObject] === Totem) {
					if (state[QuestProgress] === 1)
						state[QuestProgress] = 2;
				} else {
					inc(QuestProgress, qty);
				}
			}
			state[slot] = newqty;
			if (operation === sell) {
				passTime('Selling ' + indefiniteItems(slot, qty), 3);
			} else if (operation === give) {
				passTime('Giving away ' + indefiniteItems(slot, qty), 1);
			} else if (operation === drop) {
				passTime('Cleaning out ' + indefiniteItems(slot, qty) + ' from my backpack', 1);
			}

			return qty;

		} else if (operation === deposit || operation == withdraw) {

			let [slot, qty] = [arg1, arg2];
			const isDeposit = (operation === deposit);

			if (qty < 0) return -1;  // nice try hacker
			if (!local.hasBank) return -1;  // you're not at the bank

			if (state[Gold] + state[BalanceGold] <= 0)
				return -1;  // Can't afford it

			let bankSlot;
			if (slot == Gold) bankSlot = BalanceGold;
			else if (slot == Treasures) bankSlot = BalanceTreasures;
			else return -1;  // Bank doesn't deal in this item

			let fromSlot = isDeposit ? slot : bankSlot;
			let toSlot =  isDeposit ? bankSlot : slot;

			qty = Math.min(qty, state[fromSlot]);

			if (qty > 0) {
				dec(fromSlot, qty);
				inc(toSlot,   qty);

				// Charge a 1 gold commission per transaction
				if (isDeposit) {
					dec(state[Gold] > 0 ? Gold : BalanceGold);
				} else {
					dec(state[BalanceGold] > 0 ? BalanceGold : Gold);
				}

				passTime('Making a bank ' + isDeposit ? 'deposit' : 'withdrawal', 1);
			}

			return qty;

		} else if (operation === seekQuest) {
			const storyline = arg1;

			let hours = 4 + Math.round(20 * Math.pow(GR, -state[Charisma]));
			passTime('Asking around about quests', hours);

			clearQuest(state);

			if (local.terrain !== TOWN) return 0;

			assignQuest(state, storyline);

			return 1;

		} else if (operation === completequest) {
			if (!state[QuestType]) return -1;
			if (state[QuestEnd] && (state[QuestEnd] != state[Location])) return -1;
			if (state[QuestProgress] < state[QuestQty]) return -1;
			inc(Experience, 50 * state[Act]);
			if (state[QuestStoryline] === 0)
				inc(ActProgress);
			clearQuest(state);
			if (state[Act] === 9 && state[ActProgress] === 3) {
				passTime('Being magically transported to Sygnon Isle!', 3);
				state[Location] = Sygnon_Tower;
			} else {
				passTime('Completing paperwork', 2);
			}

			if (actUp()) {
				inc(TrainingPoints);
				inc(Treasures);
			}

			return 1;

		} else  if (operation === train) {
			let slot = arg1;
			if (local.terrain !== TOWN) return -1;
			if (!isStatSlot(slot)) return -1;
			if (state[TrainingPoints] <= 0) return -1;
			if (state[slot] >= 99) return 0;
			let hours = 24;
			hours *= Math.pow(GR, state[slot]);
			hours *= 10 / (10 + (state[Wisdom] + (local.trainingBoost == slot ? 1 : 0)));
			hours = Math.min(1, Math.round(hours));
			// TODO: special stat-learning bonuses (special as in species)
			// TODO: DEX helps with STR and CON
			// TODO: INT helps with CHA and WIS

			passTime('Training up ' + SLOTS[slot].name.toLowerCase(), hours);
			inc(slot);
			dec(TrainingPoints);
			return state[slot];

		} else  if (operation == copySpell) {
			let slot = arg1;
			let spell = SPELLS[state[Scroll]];
			if (!spell) return -1;
			if (local.terrain !== TOWN) return -1;
			if (!isSpellSlot(slot)) return -1;

			// Must be nth level to use nth level spell
			// Not sure if this is good
			if (spell.level > state[Level])
				return -1;

			if (spell.level > state[Energy])
				return -1;

			let hours = 24;
			hours *= Math.pow(GR, spell.level);
			hours *= 10 / (10 + (state[Wisdom] + (local.learningBoost ?? 0)));
			// TODO: town spell-learning bonuses?
			// TODO: racial spell-learning bonuses?

			passTime('Inscribing "' + spell.name + '" into my spell book', Math.round(hours));

			dec(Energy, spell.level);

			state[slot] = state[Scroll];
			state[Scroll] = 0;

			return state[slot];

		} else if (operation === rest) {
			endEnchantment();

			passTime('Resting up', 0, 1);
			let hp = d(state[Endurance]);
			if (local.terrain !== TOWN)
				hp = Math.round(hp * rng.rand() * rng.rand());
			hp = Math.min(hp, state[MaxHealth] - state[Health]);
			inc(Health, hp);

			let mp = d(state[Wisdom]);
			if (local.terrain !== TOWN)
				mp = Math.round(mp * rng.rand() * rng.rand());
			mp = Math.min(mp, state[MaxEnergy] - state[Energy]);
			inc(Energy, mp);

			return hp + mp;

		} else if (operation === seek) {
			// TODO int or perception helps
			let target = arg1;
			let qty;
			if (target === 0) {
				passTime('Finding some alone time', 1);
				clearMob(state);
				return 1;

			} else if (target === Totem) {
				passTime('Seeking the local totem', 6);
				if (d(20) <= state[Intellect]) {
					state[Totem] = state[Location];
					if (state[QuestObject] === Totem &&
							state[Location] === state[QuestLocation]) {
						state[QuestProgress] = 1;
					}
					return 1;
				} else {
					return 0;
				}

			} else if (target === MobSpecies) {
				passTime('Hunting for a suitable local victim', 2);
				clearMob(state);
				let type;
				if (state[QuestMob] && state[QuestLocation] === state[Location] && rng.irand(4) == 0) {
					type = state[QuestMob];
				} else if (local.denizen && (!local.density || d(100) <= local.density)) {
					type = local.denizen;
				} else {
					type = randomMobNearLevel(local.level, 10, rng);
				}
				let level = MOBS[type].hitdice ?? Math.min(d(10), Math.min(d(10), d(10)));
				level += d(2) - d(2);
				state[MobSpecies] = type;
				state[MobLevel] = level;
				state[MobHealth] = state[MobMaxHealth] = 2 + level * 4;
				state[MobAggro] = 0;
				return state[MobSpecies] ? 1 : 0;

			} else if (isInventorySlot(target)) {
				let resistance = DATABASE[target].scarcity ?? Number.NaN;
				if (state[Location] === state[QuestLocation] &&
						target === state[QuestObject]) {
					resistance >>= 1;
				}

				let ability = state[DATABASE[target].forageStat ?? Intellect];

				let qty = rng.civRoll(ability, resistance) ? 1 : 0;
				inc(target, qty);

				passTime('Foraging for ' + indefiniteItems(target, 1), 1);
				return qty;

			} else if (target === QuestProgress) {
				// Advance the plot in a cutscene quest
				if (state[QuestType] !== Cutscene) return -1;
				if (state[QuestProgress] >= state[QuestQty]) return -1;
				if (state[Location] != state[QuestLocation]) return -1;
				let script = questScript(state[Act], state[ActProgress]);
				passTime(script.script[state[QuestProgress]], 8);
				inc(QuestProgress);
				return 1;

			} else {
				return -1;
			}

		} else if (operation === levelup) {
			if (local.terrain != TOWN) return -1;
			if (state[Level] >= 99) return 0;
			if (state[Experience] < Chinbreak.xpNeededForLevel(state[Level] + 1))
				return -1;
			inc(Level);
			state[Health] = inc(MaxHealth, 3 + additiveStatBonus(state[Endurance]));
			state[Energy] = inc(MaxEnergy, 3 + additiveStatBonus(state[Wisdom]));
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


const CHINBREAK_WINDOW_CONTENT = `
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

.aggro {
	color: #b00;
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
			<div>Defense</div><div id="defense"></div>
			<div>Offense</div><div id="offense"></div>
			<div>Potency</div><div id="potency"></div>
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
			<div class=header>Equipment</div>
			<div>Weapon</div>   <div id=e0></div>
			<div>Armor</div>    <div id=e1></div>
			<div>Shield</div>   <div id=e2></div>
			<div>Headgear</div> <div id=e3></div>
			<div>Footwear</div> <div id=e4></div>
			<div>Mount</div>    <div id=e5></div>
			<div>Scroll</div>   <div id=e6></div>
			<div>Totem</div>    <div id=e7></div>
		</div>
		<div id=inventory class=listview>
			<div class=header>Inventory</div>
			<div>Gold</div><div><span id=i0></span><span id=balgold></span></div>
			<div id=trophies>Trophies</div><div id=i1></div>
			<div>Reagents</div><div id=i2></div>
			<div>Ammunition</div><div id=i3></div>
			<div>Rations</div><div id=i4></div>
			<div>Treasures</div><div><span id=i5></span><span id=baltreasure></span></div>
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
			<div>Creature</div><div><span id=mob></span></div>
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


function readableRealTime(sec) {
	let t = sec;
	let result = (t % 60) + 's';
	t = (t / 60) >> 0;
	if (!t) return result;
	result = (t % 60) + 'm ' + result;
	t = (t / 60) >> 0;
	if (!t) return result;
	result = (t % 24) + 'h ' + result;
	t = (t / 24) >> 0;
	if (!t) return result;
	result = (t % 365) + 'd ' + result;
	t = (t / 365) >> 0;
	if (!t) return result;
	return t + 'y ' + result;
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

	set('species', Chinbreak.SPECIES_NAMES[state[Species]]);
	set('level', state[Level]);
	setProgress('xp', state[Experience],
			Chinbreak.xpNeededForLevel(state[Level] + 1),
			Chinbreak.xpNeededForLevel(state[Level]));
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
		else if (slot === Scroll)
			set('e' + i, 'Scroll of ' + SPELLS[v].name);
		else if (slot === Totem)
			set('e' + i, Chinbreak.MAP[v].name.split(' ')[0] + ' Totem');
		else {
			const names = (Chinbreak.DATABASE[slot] ?? {}).names;
			set('e' + i, names[v] || v);
		}
	}
	set('defense', state[Defense]);
	set('offense', state[Offense]);
	set('potency', state[Potency]);

	for (let i = 0; i < INVENTORY_COUNT; ++i) {
		set('i' + i, state[INVENTORY_0 + i]);
	}
	set('balgold', state[BalanceGold] ? ' (' + state[BalanceGold] + ')' : '');
	set('baltreasure', state[BalanceTreasures] ? ' (' + state[BalanceTreasures] + ')' : '');
	setProgress('encumbrance', state[Encumbrance], state[Capacity]);
	$id('trophies').innerText = state[TrophyMob] && state[Trophies] ?
		MOBS[state[TrophyMob]].name + ' trophies' : 'Trophies';

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

	let local = Chinbreak.mapInfo(state[Location], state) || {};

	$id('gameprogress').title = readableTime(state[Hours], state[Years]);
	$id('elapsed').innerText = readableRealTime(REALTIME);

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
	set('terrain', (Chinbreak.TERRAIN_TYPES[local.terrain] ?? {}).name);
	set('mob', state[MobSpecies] ?
		`${Chinbreak.MOBS[state[MobSpecies]].name} (level ${state[MobLevel]})` : '');
	if (state[MobAggro] > 0)
		$('#mob').classList.add('aggro');
	else
		$('#mob').classList.remove('aggro');
	setProgress('mobHealth', state[MobHealth], state[MobMaxHealth]);
	if (state[MobHealth] == 0 && state[MobMaxHealth] > 0)
		$id('mobHealth').classList.add('dead');
	else
		$id('mobHealth').classList.remove('dead');


	set('questgoal', describeQuest(state, true));
	set('questdesc', describeQuest(state, false));
	setProgress('questprogress', state[QuestProgress], state[QuestQty]);

	set('act', (SCRIPT[state[Act]] ?? {}).act ?? 'Act ' + toRoman(state[Act]));
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
	let result = game.handleInstruction(vm.state, inst, arg1, arg2);
	$("#result").innerText = result;
	updateDebuggerState(vm);
	updateGame(vm.state);
}

function realTimeSeconds(hours) {
	return Math.round(Math.sqrt(2 * hours));
}

function age(state) { return state[Years] * HOURS_PER_YEAR + state[Hours] }

Chinbreak.playmation = function(vm, butStop) {
	let before = age(vm.state);
	while (vm.alive() && age(vm.state) == before) {
		vm.step();
	}
	animate.duration = 1000 * realTimeSeconds(age(vm.state) - before);
	animate.progress = 0;
	$id('task').innerText = TASK;
	setTaskBar();
	if (!butStop)
		window.gameplayTimer = setTimeout(animate, 10);
}



function animate() {
	animate.progress += 10;
	if (animate.progress >= animate.duration) {
		if (typeof updateDebuggerState !== 'undefined') // TODO awkward as hell
			updateDebuggerState(vm);
		game.updateUI();
		if (vm.alive())
			window.gameplayTimer = setTimeout(_ => Chinbreak.playmation(vm), 1);
	} else {
		setTaskBar();
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



return Chinbreak; })();


if (typeof module !== 'undefined') {
	module.exports = ChinbreakIsland_v1;
}


function usage() {
	const prog = process.argv[1];
	console.log(`Progress Quest Slog: Chinbreak Island

Generate the game interface header or supporting documentation.

Usage:
	./${prog} --generate-interface		Output the game interface (as Slog code)
	./${prog} --generate-map			Output the game map as HTML
	./${prog} --generate-documentation	Output game documentation HTML
`);
	process.exit();
}

if (typeof module !== 'undefined' && !module.parent) {
	// Called with node as main module
	const { parseArgs } = require('util');
	const { readFileSync, writeFileSync } = require('fs');

	const { values, positionals } = parseArgs({
		options: {
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
	});
	const flags = values;

	if (flags['generate-interface']) {
		console.log(ChinbreakIsland_v1.generateInterface());
	}
	if (flags['generate-map']) {
		console.log(generateMap());
	}
	if (flags['generate-documentation']) {
		console.log(`<link rel=stylesheet href="node_modules/xp.css/dist/XP.css">`);
		console.log(ChinbreakIsland_v1.generateDocumentation());
	}
}
