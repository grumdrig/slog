// opcodes are 16 bits but only the upper 6 bits (values 0x00 to 0x3F=63) are
// opcode, the other 10 are immediate values so that's 64 instructions, and
// immediate values range from -0x1FF to 0x1FF (-511 to 511), with 0x200
// indicating stack addressing mode

// Probably should have stack grow downward since mem size is to be fixed
// (so SP should be descending in the below)

const opcodes = [
  { opcode: 0xC, mnemonic: 'const' },
  // put a value on the stack
  // const X
  // ... => ... X ; SP += 1
  { opcode: 0xD, mnemonic: 'sethi' },
  // set high 8 bits of top of stack
  // sethi X
  // ... S => ... ((X << 8) | (S & 0xFF))


  { opcode: 0x9, mnemonic: 'pop' },
  // remove values from the stack
  // pop N
  // ... XN ... X1 => ... ; SP -= N, PP = XN
  // pop
  // ... XN ... X1 N => ... ; SP -= N+1, PP = XN

  { opcode: 0xF, mnemonic: 'fetch' },
  // fetch a value at a memory location
  // fetch A
  // ... => ... [A] ; SP += 1
  // fetch
  // ... A => ... [A]

  { opcode: 0x5, mnemonic: 'store' },
  // store a value in memory
  // store A
  // ... X => ... ; [A] = X, SP -= 1
  // store
  // ... X A => ... ; [A] = X, SP -= 2

  { opcode: 0xB, mnemonic: 'branch' },
  // branch if nonzero
  // branch
  // ... V A => ... ; SP -= 2, if V != 0 then PC = A
  // branch D
  // ... V => ... ; SP -= 1, if V != 0 the PC += D

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
  { opcode: 0x26, mnemonic: 'nand' },  // etc
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
  0x5: { mnemonic: 'sin', operation: x => Math.sin(x) },
  0x7: { mnemonic: 'log', operation: x => Math.log(x) },
  0x1: { mnemonic: 'not', operation: x => x ? 0 : 1 },
  0xA: { mnemonic: 'abs', operation: x => Math.abs(x) },
  0x9: { mnemonic: 'neg', operation: x => -x },
};

let UNARY_SYMBOLS = {};
for (let u in UNARY_OPERATORS) UNARY_SYMBOLS[UNARY_OPERATORS[u].mnemonic] = parseInt(u);

// Machine registers
const SPECIAL = {
  PC: 0x1,   // Program counter register
  SP: 0x2,   // Stack pointer register
  AUX: 0x3,  // Auxilliary register, gets some results
  CLOCK: 0x4,  // Counts clock cycles from startup

// Environment
  TERRAIN: 0x10,
  SURROUNDINGS: 0x11,
  RESOURCE_TYPE: 0x12,  // type of visible lootable thing
  RESOURCE_QTY: 0x13,

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

  HP: 0x40,
  HP_MAX: 0x41,
  MP: 0x42,
  MP_MAX: 0x43,
  ENCUMBRANCE: 0x44,
  ENCUMBRANCE_MAX: 0x45,

  INVENTORY0: 0x50, // Gold
  INVENTORY1: 0x51, // Reagents
  INVENTORY2: 0x52, // Mob drops
  INVENTORY3: 0x53, // Health potions
  INVENTORY4: 0x54, // Mana potions
  INVENTORY5: 0x55, // Keys
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

  ALLEGIANCE0: 0x90,  // ASCII codes of some arbitrary blabber
  // ...
  ALLEGIANCE15: 0x9F,

  TONE_FREQUENCY: 0xA0,
  TONE_VOLUME: 0xA1,
  // Room for polyphony
}

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

  get top() { return this.fetch(this.sp) }
  set top(v) { this.store(this.sp, v) }

  store(a, v) {
    // TODO: get bit size and signs of v right
    // TODO: don't allow setting of most specials
    if (a >= 0) this.memory[a] = v;
    else this.special[-a] = v;
  }

  fetch(a) { return (a < 0) ? this.special[-a] : this.memory[a] }  // TODO: and watch limits

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

    if (mnemonic === 'const') {
      this.push(argument);

    } else if (mnemonic === 'sethi') {
      this.top = (this.top & 0xff) | (argument << 8);

    } else if (mnemonic === 'adjust') {
      this.sp += argument;

    } else if (mnemonic === 'fetch') {
      this.push(this.fetch(argument));

    } else if (mnemonic === 'store' ) {
      let value = pop();
      let address = argument;
      if (address >= 0 ||
         [SPECIAL.PC, SPECIAL.SP, SPECIAL.AUX, SPECIAL.FACING].includes(-address)) {
        this.store(address, pop());
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
        this.store(this.a1, this.fetch(this.a2));
        this.store(this.a2, tmp);
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
      // TODO stash the overflow in aux register
      let distance = this.pop();
      this.push(distance < 0 ? argument << distance : argument >> distance);

    // Unary operators

    } else if (mnemonic === 'unary') {
      let value = pop();
      let operator = UNARY_OPS[argument];
      if (operator) {
        this.push(operator.operation(value));
      } else {
        this.push(0xBAD);
      }

    } else if (mnemonic === 'walk') {
      let a = this.special[STAT_FACING] * Math.PI / 180;
      let speed = this.special[STAT_SPEED] * argument / 100; // TODO limits etc
      this.special[STAT_LATIUDE] += Math.sin(a) * speed;
      this.special[STAT_LONGITUDE] += Math.cos(a) * speed;

    } else if (mnemonic === 'face') {
      this.special[STAT_FACING] = argument;

    } else if (mnemonic === 'act') {
      const ACTIONS = {
        0x5A1: { mnemonic: 'talk', operation: x => "complicated" },
      };
      let action = ACTIONS[argument];
      let result = 0xBAD;
      if (action) result = action.action();
      // Do something with result?

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
      let result = 0xBAD;
      if (spell) result = spell.effect();
      // TODO: do something with result?

    } else if (mnemonic === 'log') {
      this.log.push(argument);
    }

    this.special[SPECIAL.CLOCK] += 1;
  }

  alive() {
    return this.special[SPECIAL.HP] > 0 &&
           this.special[SPECIAL.CLOCK] < 0x7FFF;
  }

  run() {
    while (this.alive()) {
      step();
    }
  }
}


let MNEMONICS = {};
for (let op of opcodes) {
  MNEMONICS[op.mnemonic] = op.opcode;
  MNEMONICS[op.opcode] = op.mnemonic;
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
  static tokenre = /[a-zA-Z_][0-9a-zA-Z_]*|[:=]|[-+]?(0x)?[0-9]+/g;

  macros = {};
  labels = {};
  forwardReferences = {};
  code = new Int16Array(4096);
  macroInProgress;
  pc = 0;

  assert(truth, message) {
    if (!truth) {
      throw `ASSEMBLY ERROR AT LINE ${this.pc + 1}: ${message}`;
    }
  }

  assemble(text) {
    let lines = this.lex(text);
    this.parse(lines, clone(SPECIAL, MNEMONICS, UNARY_SYMBOLS));
    this.link();
  }

  lex(text) {
    let result = [];
    let lines = text.split('\n');
    for (let line_no = 0; line_no < lines.length; ++line_no) {
      let line = lines[line_no];
      line = line.split(';')[0];
      line = line.trim();
      line = line.match(Assembler.tokenre) || [];
      // TODO: this doesn't watch for syntax errors. frankly it's pretty terrible.
      line = line.map(t => Number.isNaN(parseInt(t)) ? t : parseInt(t));
      result.push(line);
    }
    return result;
  }

  parse(lines, symbols) {
    symbols = clone(symbols);
    for (let line_no = 0; line_no < lines.length; ++line_no) {
      let tokens = lines[line_no];

      tokens = tokens.map(t => typeof symbols[t] === 'undefined' ? t : symbols[t]);

      let inst = tokens[0];   // though it may also not be an actual inst
      let arg = tokens[1];    // though it may also be an operator
      let third = tokens[2];  // though there may not be a third

      if (this.macroInProgress) {
        if (inst === 'end') {
          this.assert(tokens.length === 1, "unexpected junk after 'end'");
          this.macroInProgress = null;
        } else {
          this.macros[this.macroInProgress].body.push(tokens);
        }
      }

      else if (tokens.length > 0) {

        if (tokens.length === 2 && arg === ':') {
          // LABEL:
          this.assert(is_identifier(inst), "identifier expected");
          this.assert(!this.labels[inst], "label already defined");
          this.labels[inst] = this.pc

        } else if (arg === '=') {
          // NAME = VALUE ;  symbolic constant
          this.assert(tokens.length === 3, "invalid constant definition");
          this.assert(typeof third === 'number', "numeric value expected");
          symbols[inst] = third;

        } else if (inst === 'macro') {
          this.assert(tokens.length >= 2, "macro name expected");

          // macro NAME [ARGS...]
          this.macroInProgress = arg;
          this.macros[arg] = {
            name: arg,
            parameters: tokens.slice(2),
            body: []
          }

        } else if (this.macros[inst]) {

          let m = this.macros[inst];
          this.assert(m.parameters.length == tokens.slice(1).length, "mismatch in macro parameter count");

          let ss = {}
          for (let i = 0; i < m.parameters.length; ++i) {
            ss[m.parameters[i]] = tokens[i + 1];
          }

          this.parse(m.body, ss);

        } else if (typeof inst === 'number') {
          // INST [ARG]
          this.assert(tokens.length <= 2, "unexpected characters following instruction");

          if (tokens.length === 1) {
            // INST  ; instruction in stack addressing mode
            this.emit(inst, 0x200);

          } else {
            // INST ARG  ; instruction with immediate argument

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

  disassemble() {
    let result = Array.from(this.code.slice(0, this.pc)).map((inst, num) =>
      `${num}:  ${inst} $${('0000' + (inst & 0xffff).toString(16)).substr(-4)}  $${(inst & 0x3f).toString(16)} ${(inst >> 6)}  ${MNEMONICS[inst & 0x3f]} ${inst >> 6 === -0x200 ? '' : inst >> 6}`);
    return result.join('\n');
  }

}

let a = new Assembler();
a.assemble(`
  sub 3
  pi = 314
  macro fish
    cast
    cast
  end
  worm:
  mul -2
  unary abs
  branch worm
  branch bird
  add pi
  bird:
  cast
  fish
  `);
console.log(a.disassemble());
console.log('PC', a.pc);
// a.code.push(3);
