`This is all part of the early idea for the (first) game in the VM, which was
a bit too complicated to start with at least.`

let SLOTS = {
  // Environment
  TERRAIN: 0x10,
  SURROUNDINGS: 0x11,
  RESOURCE_TYPE: 0x12,  // type of visible lootable thing
  RESOURCE_QTY: 0x13,
  TIME_OF_DAY: 0x14,
  DAY_OF_YEAR: 0x15,
  YEAR: 0x16,
  MONTH: 0x17,
  MOON_PHASE: 0x18,
  WIND_SPEED: 0x19,
  WIND_DIRECTION: 0x1A,
  WEATHER: 0x1B,
  TIDE: 0x1C,
  //
  //
  //

  // Nearby mob
  MOB_SPECIES: 0x20,  // from some list.
  MOB_LEVEL: 0x21,
  MOB_AGGRO: 0x22,  // -8 = friendly, 0 = neutral, 8 = hostile
  MOB_HEALTH: 0x23,  // as %
  MOB_JOB: 0x24,  // for NPC, and more generally

  // Character sheet

  LEVEL: 0x30,
  EXPERIENCE: 0x31,
  AGE: 0x32,
  //
  STAT_0: 0x38,
  STR: 0x38,
  DEX: 0x39,
  CON: 0x3A,
  INT: 0x3B,
  WIS: 0x3C,
  CHA: 0x3D,

  DAMAGE: 0x40,
  HEALTH: 0x41,
  FATIGUE: 0x42,
  ENERGY: 0x43,
  ENCUMBRANCE: 0x44,
  CAPACITY: 0x45,

  INVENTORY_0: 0x50,
  INVENTORY_GOLD: 0x50,
  INVENTORY_REAGENTS: 0x51,
  INVENTORY_DROPS: 0x52,
  INVENTORY_HEALING_POTIONS: 0x53,
  INVENTORY_ENERGY_POTIONS: 0x54,
  INVENTORY_KEYS: 0x55,
  INVENTORY_FOOD: 0x56,
  // ...
  INVENTORY15: 0x5F,

  EQUIPMENT_0: 0x60,
  EQUIP_WEAPON: 0x60,  // Level of puissance
  // ...
  EQUIP_SHOES: 0x6F,

  SPELL_0: 0x70,  // spell level
  // ...
  SPELL_15: 0x7F,

  LONGITUDE: 0x80,  // as fixed point?
  LATITUDE: 0x81,
  LEVEL: 0x82,  // 0 = on land, -1 underground, 1 flying
  FACING: 0x83,  // degrees on compass

  STATEMENT_0: 0x90,  // ASCII codes of some arbitrary blabber
  // ...
  STATEMENT_15: 0x9F,

  // When TALK or other stuff is used, responses might go here. Not sure if
  // this is enough characters. Then this might leave logging, if any, to the
  // player.
  RESPONSE_0: 0xA0,
  // ...
  RESPONSE_15: 0xAF,

  MAP_NW: 0xB0,
  MAP_N:  0xB1,
  MAP_NE: 0xB2,
  MAP_W:  0xB3,
  MAP_X:  0xB4,
  MAP_E:  0xB5,
  MAP_SW: 0xB6,
  MAP_S:  0xB7,
  MAP_SE: 0xB8,

  // Character name (not at all sure this needs inclusion)
  NAME_0: 0xC0,
  /// ...
  NAME_15: 0xCF,

  ATTITUDE_0: 0xD0,  // reserved for game-specific attitudes / stances /
  // ...
  ATTITUDE_2: 0xDF,  // strategies / behaviors set by player

  // Game rules
  // Leveling: xp(level) = A + pow(level - 1, E/100) * M
  LEVELING_ADDEND: 0xE0,
  LEVELING_EXPONENT: 0xE1,
  LEVELING_MULTIPLIER: 0xE2,

  TONE_FREQUENCY: 0xF0,
  TONE_VOLUME: 0xF1,
  // Room for polyphony
};



const ACTIONS = {
  TALK: 0x5A,
  HUNT: 0x40,
  // BUY: 0xB1,
  // SELL: 0x5E,
  FIGHT: 0xA7,
  REST: 0x22,
  CAMP: 0xCA,
  FORAGE: 0xF0,
  GATHER: 0xF1,  // don't know what the difference might be
  SEARCH: 0x70,
  LEVEL_UP: 0x77,
};


let world_opcodes = {
  // Just here for safekeeping. Not used.

  { opcode: 0x30, mnemonic: 'walk' },
  // Walk at the given speed, as a percentage
  // walk X : ... => ...
  // walk   : ... X => ...

  { opcode: 0x31, mnemonic: 'face' },
  // Face a direction, given an angle in degrees

  { opcode: 0x32, mnemonic: 'act' },
  // Do an action with operand giving action type

  { opcode: 0x33, mnemonic: 'cast' },
  // cast N : ... => ...
  // Parameter is the special index for the spell
  // Potentially a magic equipment slot could be specified
  // This may affect some memory location(s)

  // { opcode: 0x34, mnemonic: 'log' },
  // add ascii character to log/journal

  { opcode: 0x35, mnemonic: 'buy' },
  // Buy something from NPC, category speced by parameter
  // Result code shows quantitiy purchased (0 or 1 probably)
  // buy : ... => ... result ; gold and inventory or equipment affected

  { opcode: 0x36, mnemonic: 'sell' },
  // Sell something to an NPC, category speced by parameter
  // Result code shows quantitiy sold (0 or 1 probably)
  // sell : ... => ... result ; gold and inventory or equipment affected
];


const SHOPKEEPER = {
  type: 0x5,
  aggro: -8,
  responses: {
    hello: "Welcome to my shop!",
  },
};

const ORC = {
  type: 0xC,
  aggro: 8,
  responses: {
    hello: "Ash nazg durbatulûk",
  }
}


const terrains =  [
  {
    code: 'W',
    name: "deeps",
    passable: false,
    color: 'darkblue',
  },

  {
    code: 'w',
    name: "shallows",
    passable: "when the tide is low",
    color: 'blue',
  },

  {
    code: '.',
    name: "beach",
    passable: true,
    color: 'cornsilk',
  },

  {
    code: '_',
    name: "plain",
    passable: true,
    color: 'lawngreen',
  },

  {
    code: '#',
    name: "desert",
    passable: true,
    color: 'sandybrown',
  },

  {
    code: 'm',
    name: "hills",
    passable: true,
    color: 'chocolate',
  },

  {
    code: 'M',
    name: "mountains",
    passable: true,
    color: 'brown',
  },

  {
    code: '@',
    name: "glacier",
    passable: false,
    color: 'lightcyan',
  },

  {
    code: 'f',
    name: "mixed forest",
    passable: true,
    color: 'forestgreen',
  },

  {
    code: 't',
    name: "scrub forest",
    passable: true,
    color: 'yellowgreen',
  },

  {
    code: 'F',
    name: "evergreen forest",
    passable: true,
    color: 'darkgreen',
  },

  {
    code: 'T',
    name: "deciduous forest",
    passable: true,
    color: 'olive',
  },

  {
    code: '=',
    name: "river",
    passable: false,
    color: 'turquoise',
  },

  {
    code: '^',
    name: "bridge",
    passable: true,
    color: 'purple',
  },

  {
    code: '!',
    name: "town",
    passable: true,
    color: 'fuchsia',
  },

  {
    code: '~',
    name: "tundra",
    passable: true,
    color: 'silver',
  },

  {
    code: 'v',
    name: "marsh",
    passable: true,
    color: 'teal',
  },

];

let TERR = {};
for (let t of terrains) TERR[t.code] = t;

class World {
  // assumed to be rectangular
  height;
  width;
  tiles = [];

  constructor(map) {
    let rows = map.trim().split('\n').map(l => l.trim());
    this.height = rows.length;
    this.width = rows[0].length;

    for (let row of rows) {
      for (let tile of row) {
        let index = this.tiles.length;
        let latitude = Math.floor(index / this.width);
        let longitude = index % this.width;
        let remoteness = Math.sqrt(Math.pow(2*latitude/this.height - 1, 2) +
                                   Math.pow(2*longitude/this.width - 1, 2));
        let friendly = tile === '!';
        this.tiles.push({
          terrain: ord(tile),
          level: Math.round(2 / 2 - remoteness), // badassness of beasts
          mob: friendly ? SHOPKEEPER : ORC,
          passable: TERR[tile].passable,
          latitude,
          longitude,
        });
      }
    }
  }

  initialize(vm) {
    vm.special[SPECIAL.LEVEL] = 1;
    vm.special[SPECIAL.HEALTH] = 6;
    vm.special[SPECIAL.ENERGY] = 10;
    vm.special[SPECIAL.LEVELING_EXPONENT] = 160;
    vm.special[SPECIAL.LEVELING_ADDEND] = 0;
    vm.special[SPECIAL.LEVELING_MULTIPLIER] = 200;
  }

  static opcodes = {
    walk: 0x30,
    act: 0x31,
    buy: 0x32,
    sell: 0x33,
    cast: 0x34,
  }

  static mnemonics = reverseMapIntoArray(World.opcodes);


  handleInstruction(special, opcode, top, operand) {
    let mnemonic = World.mnemonics[opcode];

    if (mnemonic === 'walk') {
      if (special[SPECIAL.FATIGUE] >= special[SPECIAL.ENERGY]) {
          // || Math.abs(operand) > 150) {
        // Unable to walk
        return 0;
      }

      let latitude = special[SPECIAL.LATITUDE];
      let longitude = special[SPECIAL.LONGITUDE];
      let direction = operand;
      if (direction === 0) {
        latitude -= 1;
        if (latitude < 0) return 0;
      } else if (direction === 90) {
        longitude += 1;
        if (longitude => this.width) return 0;
      } else if (direction === 180) {
        latitude += 1;
        if (latitude => this.height) return 0;
      } else if (direction === 270) {
        longitude -= 1;
        if (longitude < 0) return 0;
      } else {
        return 0;
      }
      let index = latitude * this.width + longitude;
      let tile = this.tiles[index];
      if (!tile.passable) return 0;

      special[SPECIAL.TERRAIN] = tile.terrain;
      special[SPECIAL.MOB_LEVEL] = tile.level;
      special[SPECIAL.LATITUDE] = latitude;
      special[SPECIAL.LONGITUDE] = longitude;

      this.passTime(special, 0, 1);

      return 1;
      /*
      this fatigue dynamic could be cool but let's start simple

        if (Math.random() < (Math.abs(operand) - 75) / 50)
          special[SPECIAL.FATIGUE] += 1;
        let a = special[SPECIAL.FACING] * Math.PI / 180;
        let speed = special[SPECIAL.SPEED] * operand / 100; // TODO limits etc
        if (operand < 0) speed *= 0.5;  // walking backwards is half as fast
        special[SPECIAL.LATIUDE] += Math.sin(a) * speed;
        special[SPECIAL.LONGITUDE] += Math.cos(a) * speed;
        special[SPECIAL.AX] = 1;
      */

      /*
    } else if (mnemonic === 'face') {
      special[SPECIAL.FACING] = operand;
      special[SPECIAL.AGE] += 1;
      special[SPECIAL.AX] = 1;
      */

    } else if (mnemonic === 'act') {
      let action = ACTIONS[operand];
      return action ? action.action(special) || 0 : 0;

    } else  if (mnemonic === 'buy') {
      let qty = top;
      let price = qty * 2;
      this.passTime(special, 1);
      if (special[INVENTORY_GOLD] < price) return 0;
      special[INVENTORY_GOLD] -= price;
      special[operand] += qty;
      return qty;

    } else  if (mnemonic === 'sell') {
      let qty = top;
      let price = qty * 1;
      this.passTime(special, 1);
      if (special[operand] < qty) return 0;
      special[INVENTORY_GOLD] += price;
      special[operand] -= qty;
      return qty;

    } else if (mnemonic === 'cast') {
      const SPELLS = {
        0x911: { mnemonic: 'heal', effect: _ => {
          this.mp -= 1;
          this.hp += 1;
        } },
      };
      // TODO check for availabliltiy of spell
      // TODO check mana requirements
      this.passTime(special, 1);
      let spell = SPELLS[operand];
      if (!spell) return false;
      return spell.effect() || 0;

    }
  }


  passTime(special, hours, days) {
    const HOURS_PER_DAY = 32;
    const DAYS_PER_MONTH = 32;
    const MONTHS_PER_YEAR = 16;
    if (days) hours += HOURS_PER_DAY * days;
    special[SPECIAL.TIME_OF_DAY] += hours;
    while (special[SPECIAL.TIME_OF_DAY] >= HOURS_PER_DAY) {
      special[SPECIAL.TIME_OF_DAY] -= 32;
      special[SPECIAL.DAY_OF_MONTH] += 1;
      if (special[SPECIAL.DAY_OF_MONTH] >= DAYS_PER_MONTH) {
        special[SPECIAL.DAY_OF_MONTH] -= DAYS_PER_MONTH;
        special[SPECIAL.MONTH_OF_YEAR] += 1;
        if (special[SPECIAL.MONTH_OF_YEAR] >= MONTHS_PER_YEAR) {
          special[SPECIAL.MONTH_OF_YEAR] -= MONTHS_PER_YEAR;
          special[SPECIAL.YEAR] += 1;
        }
      }
    }
  }

  action(vm, code) {
    let result = 0;
    if (code === ACTIONS.TALK) {
      this.passTime(vm, 1);
    } else if (code === ACTIONS.HUNT) {
      this.passTime(vm, 1);
    } else if (code === ACTIONS.BUY) {
      this.passTime(vm, 1);
    } else if (code === ACTIONS.SELL) {
      this.passTime(vm, 1);
    } else if (code === ACTIONS.FIGHT) {
      this.passTime(vm, 1);
    } else if (code === ACTIONS.REST) {
      this.passTime(vm, 1);
    } else if (code === ACTIONS.CAMP) {
      this.passTime(vm, 0, 1);
    } else if (code === ACTIONS.FORAGE) {
      this.passTime(vm, 1);
    } else if (code === ACTIONS.GATHER) {
      this.passTime(vm, 1);
    } else if (code === ACTIONS.SEARCH) {
      this.passTime(vm, 1);
    } else if (code === ACTIONS.LEVEL_UP) {
      this.passTime(vm, 1);
    } else {  // invalid/unknown
    }
    return result;
  }
}

if (typeof exports !== 'undefined') {
  exports.World = World;
}