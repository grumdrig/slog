// opcodes are 16 bits but only the upper 6 bits (values 0x00 to 0x3F=63) are
// opcode, the other 10 are immediate values so that's 64 instructions, and
// immediate values range from -0x1FF to 0x1FF (-511 to 511), with 0x200
// indicating stack addressing mode

// Probably should have stack grow downward since mem size is to be fixed
// (so SP should be descending in the below)

const opcodes = [
  { opcode: 0x0, mnemonic: 'halt' },
  // halt execution, parameter ignored I guess

  { opcode: 0xC, mnemonic: 'push' },
  // put a value on the stack
  // const X
  // ... => ... X ; SP += 1

  { opcode: 0xD, mnemonic: 'sethi' },
  // set high 8 bits of top of stack
  // sethi X
  // ... S => ... ((X << 8) | (S & 0xFF))


  { opcode: 0x9, mnemonic: 'adjust' },
  // remove/reserve values on the stack
  // adjust N
  // ... XN ... X1 => ... ; SP -= N
  // adjust
  // ... XN ... X1 N => ... ; SP -= N+1

  { opcode: 0xE, mnemonic: 'fetch' },
  // fetch a value at a memory location
  // fetch A
  // ... => ... [A] ; SP += 1
  // fetch
  // ... A => ... [A]

  { opcode: 0xF, mnemonic: 'fetchdata' },
  // fetchdata a value at a [distant] memory location
  // fetchdata A
  // ... => ... [DS + A] ; SP += 1
  // fetchdata
  // ... A => ... [DS + A]

  { opcode: 0x1F, mnemonic: 'peek' },
  // peek on the stack
  // peek A
  // ... => ... [SP + A] ; SP += 1
  // peek
  // ... A => ... [SP + A]

  { opcode: 0x5, mnemonic: 'store' },
  // set a value in memory
  // set A
  // ... X => ... ; [A] = X, SP -= 1
  // set
  // ... X A => ... ; [A] = X, SP -= 2

  { opcode: 0x6, mnemonic: 'storedata' },
  // storedata a value in [distant] memory
  // storedata A
  // ... X => ... ; [DS + A] = X, SP -= 1
  // storedata
  // ... X A => ... ; [DS + A] = X, SP -= 2

  { opcode: 0x15, mnemonic: 'poke' },
  // poke a value in [distant] memory
  // poke A
  // ... X => ... ; [SP + A] = X, SP -= 1
  // poke
  // ... X A => ... ; [SP + A] = X, SP -= 2


  { opcode: 0xB, mnemonic: 'branch' },
  // branch if nonzero
  // branch
  // ... V A => ... ; SP -= 2, if V != 0 then PC = A
  // branch D
  // ... V => ... ; SP -= 1, if V != 0 the PC += D

  { opcode: 0x2, mnemonic: 'jump' },
  // Unconditional branch, which we *could* handle by just setting PC

  { opcode: 0xA, mnemonic: 'bury' },  // TODO: not so sure this is useful
  // rotate stack
  // bury N (N > 0)
  // ... X1 ... XN => ... XN X1 ... X(N-1), PP?
  // bury (N > 0)
  // ... X1 ... XN N => ... XN X1 ... X(N-1), PP?
  // bury -N (N > 0)
  // ... X1 ... XN => ... X2 ... XN X1
  // bury (N > 0)
  // ... X1 ... XN -N => ... X2 ... XN X1
  // bury 0 is a noop

  { opcode: 0x20, mnemonic: 'max' },
  // max Y
  // ... X => ... max(X, Y)
  // max
  // ... X Y => ... max(X, Y) ; SP -= 1
  { opcode: 0x21, mnemonic: 'min' },
  { opcode: 0x22, mnemonic: 'add' },
  { opcode: 0x23, mnemonic: 'sub' },
  { opcode: 0x24, mnemonic: 'mul' },
  { opcode: 0x25, mnemonic: 'atan2' },
  { opcode: 0x26, mnemonic: 'pow' },
  { opcode: 0x27, mnemonic: 'div' },  // AUX = mod(X,Y)
  // bitwise
  { opcode: 0x28, mnemonic: 'or' },
  { opcode: 0x29, mnemonic: 'and' },
  { opcode: 0x2A, mnemonic: 'xor' },
  { opcode: 0x2B, mnemonic: 'shift' },
  // similar for these binary ops

  { opcode: 0x10, mnemonic: 'unary' },
  // unary OP
  // ... X => ... OP(X)

  { opcode: 0x30, mnemonic: 'walk' },
  // Walk at the given speed, as a percentage
  // walk X : ... => ...
  // walk   : ... X => ...

  { opcode: 0x31, mnemonic: 'face' },
  // Face a direction, given an angle in degrees
  // This COULD just be done by setting the special value

  { opcode: 0x32, mnemonic: 'act' },
  // Do an action with argument giving action type

  { opcode: 0x33, mnemonic: 'cast' },
  // cast N : ... => ...
  // This may affect some memory location(s)

  { opcode: 0x34, mnemonic: 'log' },
  // add ascii character to log/journal

  { opcode: 0x3F, mnemonic: 'assert' },
  // assertion of equality or else throw exception
];

let MNEMONICS = {};
let OPCODES = []
for (let op of opcodes) {
  MNEMONICS[op.mnemonic] = op.opcode;
  OPCODES[parseInt(op.opcode)] = op.mnemonic;
}

const UNARY_OPERATORS = {
  0x5: { mnemonic: 'SIN', operation: x => Math.sin(x) },
  0x7: { mnemonic: 'LOG', operation: x => Math.log(x) },
  0xE: { mnemonic: 'EXP', operation: x => Math.exp(x) },
  0x1: { mnemonic: 'NOT', operation: x => x ? 0 : 1 },
  0xA: { mnemonic: 'ABS', operation: x => Math.abs(x) },
  0x9: { mnemonic: 'NEG', operation: x => -x },
  0xC: { mnemonic: 'COMPLEMENT', operation: x => ~x },
  0x6: { mnemonic: 'INVERSE', operation: x => x === 0 ? 0 : 0x7fff/x },
};

let UNARY_SYMBOLS = {};
for (let u in UNARY_OPERATORS) UNARY_SYMBOLS[UNARY_OPERATORS[u].mnemonic] = parseInt(u);


/* having second thoughts about this
const BINARY_OPERATORS = {
    max: (a, b) => Math.max(a, b),
    min: (a, b) => Math.min(a, b),
    add: (a, b) => a + b,
    sub: (a, b) => a - b,
    mul: (a, b) => a * b,
    exp: (a, b) => Math.pow(a, b),
    atan2: (a, b) => {
      let a = Math.atan2(a, b) * 180 / Math.PI,
      return [ Math.floor(a), fractional(a - this.top);
    }
    div: (a, b) => const divisor = b,
      return Math.floor(a / divisor));
      // TODO make sure to use mathematical modulus
      this.aux = a % divisor;
    or: (a, b) => return a | b),
    and: (a, b) => return a & b),
    xor: (a, b) => return a ^ b),
    shift: (a, b) => let value = b,
      if (a < 0) {
        return value << a);
        this.aux = value >> (16 - a);
      } else {
        return value >> a);
        this.aux = value << (16 - a);
      }
*/


// Machine registers
const SPECIAL = {
  PC: 0x1,    // Program counter register
  SP: 0x2,    // Stack pointer register
  AUX: 0x3,   // Auxilliary register, gets some results
  DS: 0x4,    // Data segment register
  CLOCK: 0x5, // Counts clock cycles from startup

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

  INVENTORY_GOLD: 0x50,
  INVENTORY_REAGENTS: 0x51,
  INVENTORY_DROPS: 0x52,
  INVENTORY_HEALING_POTIONS: 0x53,
  INVENTORY_ENERGY_POTIONS: 0x54,
  INVENTORY_KEYS: 0x55,
  INVENTORY_FOOD: 0x56,
  // ...
  INVENTORY15: 0x5F,

  EQUIP_WEAPON: 0x60,  // Level of puissance
  // ...
  EQUIP_SHOES: 0x6F,

  SPELL0: 0x70,  // spell level
  // ...
  SPELL15: 0x7F,

  LONGITUDE: 0x80,  // as fixed point?
  LATITUDE: 0x81,
  LEVEL: 0x82,  // 0 = on land, -1 underground, 1 flying
  FACING: 0x83,  // degrees on compass

  STATEMENT0: 0x90,  // ASCII codes of some arbitrary blabber
  // ...
  STATEMENT15: 0x9F,

  TONE_FREQUENCY: 0xA0,
  TONE_VOLUME: 0xA1,
  // Room for polyphony

  MAP_NW: 0xB0,
  MAP_N:  0xB1,
  MAP_NE: 0xB2,
  MAP_W:  0xB3,
  MAP_X:  0xB4,
  MAP_E:  0xB5,
  MAP_SW: 0xB6,
  MAP_S:  0xB7,
  MAP_SE: 0xB8,

  // Character name
  NAME0: 0xC0,
  /// ...
  NAME15: 0xCF,

  ATTITUDE_0: 0xD0,  // reserved for game-specific attitudes / stances /
  // ...
  ATTITUDE_2: 0xDF,  // strategies / behaviors set by player

  // Game rules
  // Leveling: xp(level) = A + pow(level - 1, E/100) * M
  LEVELING_ADDEND: 0xE0,
  LEVELING_EXPONENT: 0xE1,
  LEVELING_MULTIPLIER: 0xE2,
};

const ACTIONS = {
  TALK: 0x5A,
  HUNT: 0x40,
  BUY: 0xB1,
  SELL: 0x5E,
  FIGHT: 0xA7,
  REST: 0x22,
  CAMP: 0xCA,
  FORAGE: 0xF0,
  GATHER: 0xF1,  // don't know what the difference might be
  SEARCH: 0x70,
  LEVEL_UP: 0x77,
};

class VirtualMachine {
  memory = new Array(4096).fill(0);
  special = new Array(256).fill(0);  // negative memory
  running = true;

  get pc() { return this.special[SPECIAL.PC] }
  set pc(v) { this.special[SPECIAL.PC] = v }

  get sp() { return this.special[SPECIAL.SP] }
  set sp(v) { this.special[SPECIAL.SP] = v }

  get aux() { return this.special[SPECIAL.AUX] }
  set aux(v) { this.special[SPECIAL.AUX] = v }
  set aux_fractional(f) { this.special[SPECIAL.AUX] = f * 0x7fff }  // TODO insure 0 <= f <= 1

  get top() { return this.fetch(this.sp) }
  set top(v) { this.set(this.sp, v) }

  store(a, v) {
    if (a < 0) {
      a = -a;
      if (a < this.special.length)
        this.special[a] = v;
    } else if (a < this.memory.length) {
        this.memory[a] = v;
    }
  }

  fetch(a) {
    if (a < 0) {
      a = -a;
      if (a >= this.special.length) return 0;
      return this.special[a];
    } else {
      if (a >= this.memory.length) return 0;
      return this.memory[a];
    }
  }

  pop() { this.sp += 1; return this.memory[this.sp - 1] }
  push(v) { this.memory[this.sp -= 1] = v }

  constructor(program, world) {
    this.world = world;
    for (let i = 0; i < program.length; ++i) {
      this.memory[i] = program[i];
    }
    this.sp = this.memory.length;  // stack size is 0
    world.initialize(this);
  }

  step() {
    const instruction = this.memory[this.pc];
    const opcode = instruction & 0x3F;
    const mnemonic = OPCODES[opcode];
    let argument = (instruction >> 6);// & 0x3ff;
    // console.log(opcode, argument, this.pc, this.top, this.memory.slice(this.sp));
    this.pc += 1
    const immediate = (argument !== -0x200);
    if (!immediate) {
      argument = this.pop();
    }

    if (mnemonic === 'halt') {
      this.running = false;
      this.special[SPECIAL.AUX] = argument;

    } else if (mnemonic === 'push') {
      this.push(argument);

    } else if (mnemonic === 'sethi') {
      this.top = (this.top & 0xff) | (argument << 8);

    } else if (mnemonic === 'adjust') {
      this.sp += argument;

    } else if (mnemonic === 'fetch' || mnemonic === 'fetchdata' || mnemonic == 'peek') {
      let address = argument;
      if (mnemonic === 'fetchdata') address += this.special[SPECIAL.DS];
      if (mnemonic === 'peek')  address += this.special[SPECIAL.SP];
      this.push(this.fetch(address));

    } else if (mnemonic === 'store' || mnemonic === 'storedata' || mnemonic === 'poke') {
      let value = pop();
      let address = argument;
      if (mnemonic === 'storedata') address += this.special[SPECIAL.DS];
      if (mnemonic === 'poke')  address += this.special[SPECIAL.SP];
      if (address >= 0 ||
         [SPECIAL.PC, SPECIAL.SP, SPECIAL.AUX, SPECIAL.DS].includes(-address)) {
        this.set(address, pop());
      } // else illegal

    } else if (mnemonic === 'branch') {
      // with immediate addressing mode, the value is an offset not an absolute
      if (immediate) argument += this.pc;
      if (this.pop()) this.pc = argument;

    } else if (mnemonic === 'bury') {
      // TODO might be backwards
      let offset = argument < 0 ? -1 : 1;
      let depth = Math.abs(argument);
      for (let i = 0; i < depth; ++i) {
        let a1 = this.sp + i;
        let a2 = this.sp + (i + offset + depth) % depth
        let tmp = this.fetch(a1);
        this.set(this.a1, this.fetch(this.a2));
        this.set(this.a2, tmp);
      }

    // Binary arithmetic
    } else if (mnemonic === 'max') {
      this.push(Math.max(this.pop(), argument));

    } else if (mnemonic === 'min') {
      this.push(Math.min(this.pop(), argument));

    } else if (mnemonic === 'add') {
      this.push(this.pop() + argument);

    } else if (mnemonic === 'sub') {
      this.push(this.pop() - argument);

    } else if (mnemonic === 'mul') {
      this.push(this.pop() * argument);

    } else if (mnemonic === 'pow') {
      this.push(Math.pow(this.pop(), argument));

    } else if (mnemonic === 'atan2') {
      let a = Math.atan2(this.pop(), argument) * 180 / Math.PI;
      this.push(Math.floor(a));
      this.aux_fractional = a - this.top;

    } else if (mnemonic === 'div') {
      const dividend = this.pop();
      const divisor = argument;
      this.push(Math.floor(dividend / divisor));
      // TODO make sure to use mathematical modulus
      this.aux = dividend % divisor;

    // Binary bitwise
    } else if (mnemonic === 'or') {
      this.push(this.pop() | argument);

    } else if (mnemonic === 'and') {
      this.push(this.pop() & argument);

    } else if (mnemonic === 'xor') {
      this.push(this.pop() ^ argument);

    } else if (mnemonic === 'shift') {
      let value = this.pop();
      if (argument < 0) {
        this.push(value << argument);
        this.aux = value >> (15 + argument);
      } else {
        this.push(value >> argument);
        this.aux = value & ((1 << argument) - 1);
      }
      // console.log(this.aux, this.fetch(-SPECIAL.AUX), this.special[SPECIAL.AUX]);

    // Unary operators

    } else if (mnemonic === 'unary') {
      let value = pop();
      let operator = UNARY_OPERATORS[argument];
      if (operator) {
        let result = operator.operation(value);
        this.push(Math.floor(result));
        this.aux_fractional = result - Math.floor(result);
      } else {
        this.push(0xBAD);
      }

    // "Real"-world instructions, all of which advance character age and set
    //  a boolean value in AUX indication if the instruction completed

    } else if (mnemonic === 'walk') {
      this.special[SPECIAL.AGE] += 1;
      if (this.special[SPECIAL.FATIGUE] >= this.special[SPECIAL.ENERGY]
          || Math.abs(argument) > 150) {
        // Unable to walk
        this.special[SPECIAL.AUX] = 0;
      } else {
        if (Math.random() < (Math.abs(argument) - 75) / 50)
          this.special[SPECIAL.FATIGUE] += 1;
        let a = this.special[SPECIAL.FACING] * Math.PI / 180;
        let speed = this.special[SPECIAL.SPEED] * argument / 100; // TODO limits etc
        if (argument < 0) speed *= 0.5;  // walking backwards is half as fast
        this.special[SPECIAL.LATIUDE] += Math.sin(a) * speed;
        this.special[SPECIAL.LONGITUDE] += Math.cos(a) * speed;
        this.special[SPECIAL.AUX] = 1;
      }

    } else if (mnemonic === 'face') {
      this.special[SPECIAL.FACING] = argument;
      this.special[SPECIAL.AGE] += 1;
      this.special[SPECIAL.AUX] = 1;

    } else if (mnemonic === 'act') {
      let action = ACTIONS[argument];
      let result = 0;
      if (action) result = action.action() ? 1 : 0;
      this.special[SPECIAL.AGE] += 1;
      this.special[SPECIAL.AUX] = result;

    } else if (mnemonic === 'cast') {
      const SPELLS = {
        0x911: { mnemonic: 'heal', effect: _ => {
          this.mp -= 1;
          this.hp += 1;
        } },
      };
      // TODO check for availabliltiy of spell
      // TODO check mana requirements
      let spell = SPELLS[argument];
      let result = 0;
      if (spell) result = spell.effect() ? 1 : 0;
      this.special[SPECIAL.AGE] += 1;
      this.special[SPECIAL.AUX] = result;

    } else if (mnemonic === 'log') {
      this.log.push(argument);
      this.special[SPECIAL.AGE] += 1;
      this.special[SPECIAL.AUX] = 1;

    } else if (mnemonic === 'assert') {
      if(this.top !== argument) {
        console.log("ASSERTION FAILURE at", this.pc, this.top, argument);
        throw "assertion failure";
      }

    }

    this.special[SPECIAL.CLOCK] += 1;
  }

  alive() {
    return this.running &&
           this.special[SPECIAL.DAMAGE] < this.special[SPECIAL.HEALTH] &&
           this.special[SPECIAL.CLOCK] < 30;
           this.special[SPECIAL.AGE] < 0x7FFF;
  }

  run() {
    while (this.alive()) {
      this.step();
    }
  }
}


function is_identifier(id) {
  return id.match(/^[a-zA-Z_][0-9a-zA-Z_]*$/);
}

function clone(...objs) {
  // shallow is all I need
  let result = {};
  for (let obj of objs)
    for (let i in obj)
      result[i] = obj[i];
  return result;
}


function negate(dict) {
  let result = {};
  for (let i in dict)
    result[i] = -dict[i];
  return result;
}


class Assembler {
  static tokenre = /[a-zA-Z_][0-9a-zA-Z_]*|[:=()[\]{}!@#$%^&*]|[-+]?(0x)?[0-9]+|"[^"]*"|'./g;

  macros = {};
  labels = {};
  forwardReferences = {};
  code = new Int16Array(4096);
  macroInProgress;
  pc = 0;

  assert(truth, message) {
    if (!truth) {
      throw this.line + `\nASSEMBLY ERROR AT LINE ${this.line_no + 1}: ${message}`;
    }
  }

  assemble(text) {
    let lines = this.lex(text);
    this.parse(lines, clone(negate(SPECIAL), MNEMONICS, UNARY_SYMBOLS, ACTIONS));
    this.link();
  }

  lex(text) {
    // TODO: this doesn't watch well for syntax errors. frankly it's pretty terrible.
    let result = [];
    let lines = text.split('\n');
    function resolve(t) {
      if (!Number.isNaN(parseInt(t))) return [parseInt(t)];
      if (t[0] === "'") return [ord(t.slice(1))];
      if (t[0] === '"') return t.slice(1, t.length - 1).split('').map(ord);
      return [t];
    }
    for (let line_no = 0; line_no < lines.length; ++line_no) {
      let line = lines[line_no];
      let tokens = line.split(';')[0];
      tokens = tokens.trim();
      tokens = tokens.match(Assembler.tokenre) || [];
      tokens = tokens.reduce((l, t) => l.concat(resolve(t)), []);
      result.push({ line_no, line, tokens });
    }
    return result;
  }

  parse(lines, symbols) {
    symbols = clone(symbols);
    for (let line of lines) {
      this.line_no = line.line_no;
      this.line = line.line;
      let tokens = line.tokens;

      tokens = tokens.map(t => typeof symbols[t] === 'undefined' ? t : symbols[t]);

      let inst = tokens[0];   // though it may also not be an actual inst
      let arg = tokens[1];    // though it may also be an operator
      let third = tokens[2];  // though there may not be a third

      if (this.macroInProgress) {
        if (inst === 'end') {
          this.assert(tokens.length === 1, "unexpected junk after 'end'");
          this.macroInProgress = null;
        } else {
          this.macros[this.macroInProgress].body.push(line);
        }
      }

      else if (tokens.length > 0) {

        if (tokens.length === 2 && arg === ':') {
          "LABEL:"
          this.assert(is_identifier(inst), "identifier expected");
          this.assert(!this.labels[inst], "label already defined");
          this.labels[inst] = this.pc

        } else if (arg === '=') {
          "NAME = VALUE ;  symbolic constant"
          this.assert(tokens.length === 3, "invalid constant definition");
          this.assert(typeof third === 'number', "numeric value expected: " + third);
          symbols[inst] = third;

        } else if (inst === 'macro') {
          this.assert(tokens.length >= 2, "macro name expected");

          "macro NAME [ARGS...]  ; begin macro definition"
          this.macroInProgress = arg;
          this.macros[arg] = {
            name: arg,
            parameters: tokens.slice(2),
            body: []
          }

        } else if (inst === 'data') {
          let last;
          let multiply = false;
          for (let t of tokens.slice(1)) {
            if (t === '*') {
              multiply = true;
            } else {
              this.assert(typeof t === 'number', `numeric value expected <${typeof t} ${t}>`);
              if (multiply) {
                this.assert(t > 0, "positive value expected");
                for (let i = 1; i < t; ++i) this.data(last);
                multiply = false;
              } else {
                last = t;
                this.data(t);
              }
            }
          }

        } else if (this.macros[inst]) {

          "MACRO [ARGS...]  ; expand a macro"
          let m = this.macros[inst];
          this.assert(m.parameters.length == tokens.slice(1).length, "mismatch in macro parameter count");

          let ss = clone(symbols);
          for (let i = 0; i < m.parameters.length; ++i) {
            ss[m.parameters[i]] = tokens[i + 1];
          }

          this.parse(m.body, ss);

        } else if (typeof inst === 'number') {
          "INST [ARG]  ; a regular instruction"
          this.assert(tokens.length <= 2, "unexpected characters following instruction");

          if (tokens.length === 1) {
            "INST  ; instruction in stack addressing mode"
            this.emit(inst, 0x200);

          } else {
            "INST ARG  ; instruction with an immediate argument"

            if (typeof arg === 'number') {
              this.emit(inst, arg);
            } else {
              this.forwardReferences[this.pc] = arg;
              this.emit(inst, 0);
            }

          }

        } else {
          this.assert(false, "parse error: " + tokens.join(' '));
        }
      }
    }
  }

  link() {
    for (let pc of Object.keys(this.forwardReferences)) {
      let symbol = this.forwardReferences[pc];
      this.assert(typeof this.labels[symbol] !== 'undefined', "undefined label: " + symbol);
      this.reemit(pc, this.code[pc] & 0x3f, this.labels[symbol]);
    }
  }

  emit(opcode, parameter = 0x200) {
    this.reemit(this.pc++, opcode, parameter);
  }

  reemit(pc, opcode, parameter = 0x200) {
    this.code[pc] = opcode | (parameter << 6);
  }

  data(value) {
    this.code[this.pc++] = value;
  }

  disassemble() {
    let result = Array.from(this.code.slice(0, this.pc)).map((inst, num) =>
        ('000' + num).substr(-4)
      + ' $' + ('0000' + (inst & 0xffff).toString(16)).substr(-4)
      + ' ' + ('     ' + inst).substr(-6)
      + ' ' + ((32 <= inst && inst < 128) ? `'${String.fromCharCode(inst)}` : '  ')
      + '  $' + ('00' + (inst & 0x3f).toString(16)).substr(-2)
      + ' $' + ('00' + (0x3ff & (inst >> 6)).toString(16)).substr(-2)
      + ' ' + OPCODES[inst & 0x3f]
      + ' ' + ((inst >> 6 === -0x200) ? '' : (inst >> 6))
      );
    return result.join('\n');
  }

}

// Testing:


function ord(c) { return c.charCodeAt(0) }

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

  walk(latitude, longitude, direction) {
    if (direction === 0) {
      latitude -= 1;
      if (latitude < 0) return null;
    } else if (direction === 90) {
      longitude += 1;
      if (longitude => this.width) return null;
    } else if (direction === 180) {
      latitude += 1;
      if (latitude => this.height) return null;
    } else if (direction === 270) {
      longitude -= 1;
      if (longitude < 0) return null;
    } else {
      return null;
    }
    let index = latitude * this.width + longitude;
    return this.tiles[index];
  }

  passTime(vm, hours, days) {
    const HOURS_PER_DAY = 32;
    const DAYS_PER_MONTH = 32;
    const MONTHS_PER_YEAR = 16;
    if (days) hours += HOURS_PER_DAY * days;
    vm.specials[SPECIALS.TIME_OF_DAY] += hours;
    while (vm.specials[SPECIALS.TIME_OF_DAY] >= HOURS_PER_DAY) {
      vm.specials[SPECIALS.TIME_OF_DAY] -= 32;
      vm.specials[SPECIALS.DAY_OF_MONTH] += 1;
      if (vm.specials[SPECIALS.DAY_OF_MONTH] >= DAYS_PER_MONTH) {
        vm.specials[SPECIALS.DAY_OF_MONTH] -= DAYS_PER_MONTH;
        vm.specials[SPECIALS.MONTH_OF_YEAR] += 1;
        if (vm.specials[SPECIALS.MONTH_OF_YEAR] >= MONTHS_PER_YEAR) {
          vm.specials[SPECIALS.MONTH_OF_YEAR] -= MONTHS_PER_YEAR;
          vm.specials[SPECIALS.YEAR] += 1;
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
  exports.VirtualMachine = VirtualMachine;
  exports.World = World;
  exports.Assembler = Assembler;
}