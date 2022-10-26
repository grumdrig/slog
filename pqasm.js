`
// Include defs for this game

external train(spell) = $36
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

const CALLS = [
	travel: {
		parameters = 'destination',
		opcode = 0x30,
	},
	melee: {
		parameters = '',
		opcode = 0x31,
	},
	buy: {
		parameters = 'slot,level',
		opcode = 0x32,
	},
	sell: {
		parameters = 'slot,qty',
		opcode = 0x33,
	},
	seekquest: {
		parameters = '',
		opcode = 0x34,
	},
	completequest: {
		parameters = '',
		opcode = 0x35,
	},
	train: {
		parameters = 'slot',
		opcode = 0x36
	},
	initialize: {
		parameters = 'slot,value',
		opcode = 0x36,
	},
	cast: {
		parameters = 'spell_slot',
		opcode = 0x37,
	},
	forage: {
		parameters = 'target_slot',
		opcode = 0x38,
	},
	levelup: {
		parameters = '',
		opcode = 0x39,
	},
	startGame: {
		parameters = '',
		opcode = 0x39,
	},
	give: {
		parameters = 'slot',
		opcode = 0x3A,
	},
];
for (let call in CALLS) {
	{ opcode, parameters } = CALLS[call];
	let externalDef = `external ${call}(${parameters}) = $${opcode.toString(16)}`;
	window[call] = opcode;
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


let slots = {
	"AgeHours",
	"Level",
	"XP",
	"XpNeeded",
	"HP",
	"Health",
	"MP",
	"Mana",
	"Strength",
	"Agility",
	"Constitution",
	"Wisdom",
	"Intelligence",
	"Charism",
	"StrengthTrain",
	"AgilityTrain",
	"ConstitutionTrain",
	"WisdomTrain",
	"IntelligenceTrain",
	"CharismTrain",
	"Enchantment",
	"EnchantmentLevel",
	"SpellLevel1", //  heal
	"SpellLevel2", //  fireball
	"SpellLevel3", //  haste
	"SpellLevel4", //  buff
	"SpellLevel5", //  luck
	"SpellLevel6", //
	"SpellTrain1",
	"SpellTrain2",
	"SpellTrain3",
	"SpellTrain4",
	"SpellTrain5",
	"SpellTrain6",
	"Equipment1", // Weapon
	"Equipment2", // Armor
	"Equipment3", // Shield
	"Equipment4", // Headgear
	"Equipment5", // Footwear
	"Equipment6", // Mount
	"Equipment7", // Ring
	"Equipment8", // Amulet
	"ArmorClass", // accumulated armor rating
	"Inventory1", // qty gold
	"Inventory2", // qty spoils
	"Inventory3", // qty reagents
	"Inventory4", // qty resources
	"Inventory5", // qty food
	"Inventory6", // qty treasures
	"Inventory7", // qty potions
	"Inventory8", // qty life potions
	"Encumbrance",
	"Location",  // grid position (col + 6 * row)
	"QuestLocation", // location to perform the quest
	"QuestObject", // monster or item (by slot)
	"QuestQty", // qty # required
	"QuestProgress", // # completed
	"QuestGiver", // town location
	"Act", // (up to 9, 10 = win)
	"ActDuration", // # of something required
	"ActProgress", // as advanced by quests
	"Esteem1", // with the fantasy race 1 dunklings (3 towns)
	"Esteem2", // with the fantasy race 2 hardwarves (2 towns)
	"Esteem3", // with the fantasy race 3 effs (one town)
}


const RACES = [
	null,
	dunkling: {
		name: "Dunkling",
		aka: "Nerfling",
		index: 1,
		esteems: 2,
		waryof: 3,
		proficiency: BLADE,
		badat: [POLEARMS, BOW],
		stat_mods: {
			DEX: +2,
			CHA: +1,
			STR: -1,
			WIS: -2,
		},
		description: "Likable, lithe creatures of small stature, often underestimated",
		startingitems: { weapon: 2, hat: 1, food: 1 },
	},
	hardwarf: {
		name: "Hardwarf",
		plural: "Hardwarves",
		index: 2,
		esteems: 3,
		waryof: 1,
		proficiency: SMASH,
		badat: BLADE
		stat_mods: {
			CON: +2,
			STR: +1,
			DEX: -1,
			INT: -2,
		},
		description: "Sturdy sorts with a...direct approch to problems",
		startingitem: { weapon: 1, shield: 1, gold: 1 },
	},
	eff: {
		name: "Eff",
		index: 3,
		esteems: 1,
		waryof: 2,
		proficiency: [POLEARMS, BOW],
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
		badassname: "Ortrogor"
		domain: HILLS,
		hitdice: 6,
	}, {
		name "Baklakesh",
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
		state[QUESTLOCATION] = -1;
	}

	static handleInstruction(state, opcode, arg1, arg2) {
		if (state[level] === 0) {
			// game hasn't begun
			if (opcode === initialize) {
				let [slot, value] = [arg1, arg2];
				if (slot !== RACE && slot !== CLASS && (STAT0 > slot || slot > STAT5))
					return -1;
				if (value < 0) return -1
				state[slot] = value;
				return state[slot];

			} else if (opcode === startGame) {
				if (state.slice(STAT0, 6).reduce((a,b) => a+b) > 10) return -1;
				if (!RACES[state[RACE]]) return -1;
				if (!CLASS_NAME[state[CLASS]]) return -1;
				// All good. Start the game.
				for (let stat = STAT0; stat <= STAT5; stat += 1) {
					// Add 3 plus race bonuses to stats
					state[stat] += 3 + (RACES[RACE].stat_mods[STATE_NAME[stat]] || 0);
				}
				state[LEVEL] = 1;
				state[LOCATION] = 11;
				state[HP] = 6 + state[CONSTITUTION];
				state[MP] = 6 + state[INTELLIGENCE];
				for (let slot in RACES[RACE].startingitems) {
					state[slot] = RACES[RACE].startingitems[slot];
				}

				return 1;
			}
			return -1;
		}

		// Game is in process
		let local = this.contructor.MAP[state[LOCATION]];

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
			pass less time depending on speed
			pass more time depending on terrain
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
			} else if (isInventorySlot(slot) {
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
			} else if (state[QUESTOBJECT] === slot)
				state[QUESTPROGRESS] += qty;
			}
			state[slot] -= qty;
			this.passTime(1, 0);
			return qty;

		} else if (opcode === seekquest) {
			this.passTime(1, 0);
			if (!isTown(state[LOCATION])) return 0;
			if (irand(2) == 0) {
				// Exterminate the ___
				state[QUESTLOCATION] = randomLocation(state[LOCATION]);
				state[QUESTOBJECT] = MAP[state[QUESTLOCATION]].randomMob();
				state[QUESTQTY] = 5 + irand(10);
			} else {
				// Bring me N of SOMETHING
				state[QUESTLOCATION] = state[LOCATION];
				state[QUESTOBJECT] = randomItem();
				state[QUESTQTY] = 5 * irand(10);
			}
			state[QUESTPROGRESS] = 0;
			state[QUESTGIVER] = state[LOCATION];
			return 1;

		} else if (opcode === completequest) {
			if (!state[QUESTOBJECT]) return -1;
			if (state[QUESTGIVER] != state[LOCATION]) return -1;
			if (state[QUESTPROGRESS] < state[QUESTQTY]) return -1;
			state[XP] += 100;
			state[ACTPROGRESS] += 1;
			if (state[ACTPROGRESS] >= state[ACTDURATION]) {
				state[ACT] += 1;
				state[ACTDURATION] = ACT_LENGTHS[state[ACT]];
				state[ACTPROGRESS] = 0;
			}
			state[QUESTOBJECT] = 0;
			state[QUESTLOCATION] = -1;
			state[QUESTGIVER] = -1;
			state[QUESTPROGRESS] = 0;
			state[QUESTQTY] = 0;
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
			let qty = Math.random() < 0.5 : 1 : 0;
			qty = Math.min(qty, inventoryCapacity(state));
			state[FORAGE] += qty;
			this.passTime(1);

		} else if (opcode === levelup) {
			if (state[XP] <= state[XP_NEEDED])
				return -1;
			state[LEVEL] += 1;
			state[XP_NEEDED] = xpNeededForLevel(state[LEVEL] + 1;
			this.passTime(1, 0);
			return 1;
		}
	}

	static battle(state, invulnerable=false) {
		if (!state[MOBTYPE]) return -1;

		let info = MOB_INFO[state[MOBTYPE];
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
