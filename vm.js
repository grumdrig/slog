// opcodes are 16 bits but only the upper 6 bits (values 0x00 to 0x3F=63) are
// opcode, the other 10 are immediate values so that's 64 instructions, and
// immediate values range from -0x1FF to 0x1FF (-511 to 511), with 0x200
// indicating stack addressing mode

// Probably should have stack grow downward since mem size is to be fixed
// (so SP should be descending in the below)

const opcodes = [
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
  // ... XN ... X1 => ... ; SP -= N, PP = XN
  // adjust
  // ... XN ... X1 N => ... ; SP -= N+1, PP = XN

  { opcode: 0xE, mnemonic: 'get' },
  // get a value at a memory location
  // get A
  // ... => ... [A] ; SP += 1
  // get
  // ... A => ... [A]

  { opcode: 0xF, mnemonic: 'fetch' },
  // fetch a value at a [distant] memory location
  // fetch A
  // ... => ... [DS + A] ; SP += 1
  // fetch
  // ... A => ... [DS + A]

  { opcode: 0x5, mnemonic: 'set' },
  // set a value in memory
  // set A
  // ... X => ... ; [A] = X, SP -= 1
  // set
  // ... X A => ... ; [A] = X, SP -= 2

  { opcode: 0x6, mnemonic: 'stash' },
  // stash a value in [distant] memory
  // stash A
  // ... X => ... ; [DS + A] = X, SP -= 1
  // stash
  // ... X A => ... ; [DS + A] = X, SP -= 2


  { opcode: 0xB, mnemonic: 'branch' },
  // branch if nonzero
  // branch
  // ... V A => ... ; SP -= 2, if V != 0 then PC = A
  // branch D
  // ... V => ... ; SP -= 1, if V != 0 the PC += D

  { opcode: 0x2, mnemonic: 'jump' },
  // Unconditional branch, which we *could* handle by just setting PC

  { opcode: 0xA, mnemonic: 'bury' },
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
  { opcode: 0x26, mnemonic: 'or' },
  { opcode: 0x27, mnemonic: 'and' },
  { opcode: 0x28, mnemonic: 'xor' },
  { opcode: 0x29, mnemonic: 'shift' },
  // similar for these binary ops

  { opcode: 0x10, mnemonic: 'unary' },
  // unary OP
  // ... X => ... OP(X)

  { opcode: 0x27, mnemonic: 'div' },
  // div Y
  // ... X => ... floor(X/Y) mod(X, Y) ; SP += 1


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
];

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
  WEATHER: 0x17,

  // Nearby mob
  MOB_SPECIES: 0x20,  // from some list.
  MOB_LEVEL: 0x21,
  MOB_AGGRO: 0x22,  // -8 = friendly, 0 = neutral, 8 = hostile
  MOB_HEALTH: 0x23,  // as %
  MOB_JOB: 0x24,  // for NPC, and more generally

  // Character sheet

  LEVEL: 0x30,
  STR: 0x31,
  DEX: 0x32,
  CON: 0x33,
  INT: 0x34,
  WIS: 0x35,
  CHA: 0x36,
  AGE: 0x37,

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
  ALTITUDE: 0x82,  // 0 = on land, -1 underground, 1 flying
  FACING: 0x83,  // degrees on compass

  STATEMENT0: 0x90,  // ASCII codes of some arbitrary blabber
  // ...
  STATEMENT15: 0x9F,

  TONE_FREQUENCY: 0xA0,
  TONE_VOLUME: 0xA1,
  // Room for polyphony
};

const ACTIONS = {
  TALK: 0x5A,
  HUNT: 0x40,
  BUY: 0xB1,
  SELL: 0x5E,
  FIGHT: 0xA7,
  REST: 0x22,
  GATHER: 0xF0,
};

class VirtualMachine {
  memory = new Array[4096].fill(0);
  special = new Array[256].fill(0);  // negative memory

  get pc() { return special[SPECIAL.PC] }
  set pc(v) { special[SPECIAL.PC] = v }

  get sp() { return special[SPECIAL.SP] }
  set sp(v) { special[SPECIAL.SP] = v }

  get aux() { return special[SPECIAL.AUX] }
  get aux() { return special[SPECIAL.AUX] }
  set aux_fractional(f) { special[SPECIAL.AUX] = f * 0x7fff }  // TODO insure 0 <= f <= 1

  get top() { return this.get(this.sp) }
  set top(v) { this.set(this.sp, v) }

  set(a, v) {
    if (a < 0) {
      a = -a;
      if (a < this.special.length)
        this.special[a] = v;
    } else if (a < this.memory.length) {
        this.memory[a] = v;
    }
  }

  get(a) {
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

  constructor(program) {
    for (let i = 0; i < program.length; ++i) {
      this.memory[i] = program[i];
    }
    this.sp = this.memory.length - 1;
  }

  step() {
    const instruction = memory[pc()];
    pc = pc + 1
    const opcode = (instruction >> 6) & 0x3F;
    const mnemonic = OPCODES[opcode].mnemonic;
    let argument = instruction & 0x3ff;
    const immediate = (argument !== 0x200);
    if (!immediate) {
      argument = this.pop();
    }

    if (mnemonic === 'push') {
      this.push(argument);

    } else if (mnemonic === 'sethi') {
      this.top = (this.top & 0xff) | (argument << 8);

    } else if (mnemonic === 'adjust') {
      this.sp += argument;

    } else if (mnemonic === 'get' || mnemonic === 'fetch') {
      let address = argument;
      if (mnemonic === 'fetch') address += this.special[SPECIAL.DS];
      this.push(this.get(argument));

    } else if (mnemonic === 'set' || mnemonic === 'stash') {
      let value = pop();
      let address = argument;
      if (mnemonic === 'stash') address += this.special[SPECIAL.DS];
      if (address >= 0 ||
         [SPECIAL.PC, SPECIAL.SP, SPECIAL.AUX, SPECIAL.DS].includes(-address)) {
        this.set(address, pop());
      } // else illegal

    } else if (mnemonic === 'branch') {
      // with immediate addressing mode, the value is an offset not an absolute
      if (immediate) argument += this.pc;
      if (pop()) this.pc = argument;

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
      this.push(Math.max(argument, this.pop()));

    } else if (mnemonic === 'min') {
      this.push(Math.min(argument, this.pop()));

    } else if (mnemonic === 'add') {
      this.push(argument + this.pop());

    } else if (mnemonic === 'sub') {
      this.push(argument - this.pop());

    } else if (mnemonic === 'mul') {
      this.push(argument * this.pop());

    } else if (mnemonic === 'exp') {
      this.push(Math.pow(argument, this.pop()));

    } else if (mnemonic === 'atan2') {
      let a = Math.atan2(argument, this.pop()) * 180 / Math.PI;
      this.push(Math.floor(a));
      this.aux_fractional = a - this.top;

    } else if (mnemonic === 'div') {
      const divisor = this.pop();
      this.push(Math.floor(argument / divisor));
      // TODO make sure to use mathematical modulus
      this.aux = argument % divisor;

    // Binary bitwise
    } else if (mnemonic === 'or') {
      this.push(argument | this.pop());

    } else if (mnemonic === 'and') {
      this.push(argument & this.pop());

    } else if (mnemonic === 'xor') {
      this.push(argument ^ this.pop());

    } else if (mnemonic === 'shift') {
      let value = this.pop();
      if (argument < 0) {
        this.push(value << argument);
        this.aux = value >> (16 - argument);
      } else {
        this.push(value >> argument);
        this.aux = value << (16 - argument);
      }

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

    }

    this.special[SPECIAL.CLOCK] += 1;
  }

  alive() {
    return this.special[SPECIAL.HEALTH] > 0 &&
           this.special[SPECIAL.CLOCK] < 0x7FFF;
  }

  run() {
    while (this.alive()) {
      step();
    }
  }
}


let MNEMONICS = {};
let OPCODES = {}
for (let op of opcodes) {
  MNEMONICS[op.mnemonic] = op.opcode;
  OPCODES[op.opcode] = op.mnemonic;
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
    this.parse(lines, clone(SPECIAL, MNEMONICS, UNARY_SYMBOLS, ACTIONS));
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
      + ' $' + ('00' + (inst & 0x3f).toString(16)).substr(-2)
      + ' $' + ('00' + (inst >> 6).toString(16)).substr(-2)
      + ' ' + OPCODES[inst & 0x3f]
      + ' ' + ((inst >> 6 === -0x200) ? '' : (inst >> 6))
      );
    return result.join('\n');
  }

}

// Testing:


function ord(c) { return c.charCodeAt(0) }

const SHOPKEEPER = 0x5;
const ORC = 0xC;

class World {
  // assumed to be rectangular
  height;
  width;
  tiles = [];

  constructor(map) {
    let rows = map.trim().split('/n').map(l => l.trim());
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
          level: Math.round(2 / 2 - remoteness), // badessness of beasts
          mobtype: friendly ? SHOPKEEPER : ORC,
          mob_aggro: friendly ? -8 : 8,
        });
      }
    }
  }
}

let world = new World(`
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWW~~~~~~~~WWWWWW
WWWWWWWWWWWWWWW~~~~~F~~~~~~~WWWW
WWWWWWWWWWWWWWW~FFFFFTTTTTTTTwWW
WWWWWWWWWWWWWWFFFF!FTTTTTTTTTwwW
WWWWWWWwWWWWWWWFFFFFvvTTTTTTTwwW
WWWWWm_wWWww______FFvvvvvv_TTwwW
WWWW_m_wwww__________==vv__TTwwW
WWW_mmmwwww_________==vvvvv_wwWW
WW_mmm_wwww________==_v__W_WwwWW
WW_MMm_wWWw______===__Mm____wwwW
WWmMmm_wWW.___=^==TT_MMm___.wwwW
WWmmm__wWW.__==TTTTTmM@mm_..wwwW
WW_____wWW._==TTTTTmm!@Mm_..wwwW
WW__!_fwWW===!!__T_mMM@Mmm..wwwW
WW___ffwWW.__!!___mMM@MMmm_wwwwW
WWw_fffWWW_______mMM@Mmmm_wwwwwW
WWw_fffWWW______mmM@MMm___wwWWwW
WWwwwfWWWWW_____mMMMMmmT_wwWWWWW
WWWWwwWWWW_______MMmmmTTTTwWWWWW
WWWWWWWWWW_____#___TTTTTTTwwWWWW
WWWWWWWwW___####___TTTTTTTTwWWWW
WWWWWWww___!##_______TTTTTwwWWWW
WWWWWWw######______WWWWTTT_wWWWW
WWWWWww######_WWWWWWWWWWww_wwWWW
WWWWWw######WWWWWWWWWWWWWw_wwWWW
WWWWww##WWWWWWWWWw__mWWWWwwwwWWW
WWWWwwWWWWWWWWWWww_!mwWWWWWWwWWW
WWWWwWWWWWWWWWWWw____wwWWWWWWWWW
WWWWwWWWWWWWWWwwwwwwwwwwWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
`);



let a = new Assembler();
a.assemble(`
macro face
  set FACING
end

macro faceangle angle
  push angle
  set FACING
end

macro face_east
  faceangle 90
end

macro branch_if_greater label
  sub
  min 0
  branch label
end

macro not
  unary NOT
end

jump raid

data 0 1 2 3 4*10

data "hello"

raid:

face_east

head_to_killing_fields:
get LONGITUDE
get LEVEL
sub
min 0
branch_if_greater battle_loop
walk
jump head_to_killing_fields

battle_loop:

get HEALTH
div 2
not
branch dying

hunt:
act HUNT
get MOB_LEVEL
not
branch hunt

fight:

get MOB_LEVEL
not
branch killed
act FIGHT
jump fight

killed:

get RESOURCE_TYPE
sub INVENTORY_DROPS
not
branch battle_loop
act GATHER
jump killed

dying:

faceangle -90
get LONGITUDE
max 0
not
branch rest
walk
jump dying

rest:

act REST
get DAMAGE
branch rest

sell:

act SELL
get INVENTORY_DROPS
branch sell

jump raid
  `);
console.log(a.disassemble());
console.log('PC', a.pc);
// a.code.push(3);
