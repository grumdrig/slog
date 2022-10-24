`I think we need a frame pointer, not a data segment.
Here's the plan. Rename
When a function is called
CALL a:
  .data 0 ; return value
  push [PC]
  push [FP]
  oldSP = SP
  push arg1
  ...
  push arg2
  FP = oldSP
  PC = a
RETURN v:
  [FP-3] = v  ; return value
  SP = FP
  FP = pop()
  PC = pop()
  push(v)  ; this is another way to do it

Looks like its better to handle this at the compiler level rather than as an
instruction.
`


const opcodes = [
  { opcode: 0x0, mnemonic: 'halt' },
  // halt execution, parameter ignored I guess

  { opcode: 0x10, mnemonic: 'assert' },
  // assertion of equality or else throw exception

  { opcode: 0xC, mnemonic: 'push' },
  // put a value on the stack
  // push X
  // ... => ... X ; SP += 1

  { opcode: 0x1C, mnemonic: 'stack' },
  // push the ensuing data on the stack
  // .stack D1 D2 ... DN
  // stack N .data D1 D2 ... DN
  // ... => DN ... D1 ...

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

  { opcode: 0xF, mnemonic: 'fetchlocal' },

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

  { opcode: 0x6, mnemonic: 'storelocal' },

  { opcode: 0x15, mnemonic: 'poke' },
  // poke a value in [distant] memory
  // poke A
  // ... X => ... ; [SP + A] = X, SP -= 1
  // poke
  // ... X A => ... ; [SP + A] = X, SP -= 2


  { opcode: 0xB, mnemonic: '_br' },
  // _br if nonzero
  // _br
  // ... V A => ... ; SP -= 2, if V != 0 then PC = A
  // _br D
  // ... V => ... ; SP -= 1, if V != 0 the PC += D

  { opcode: 0x2, mnemonic: '_jmp' },
  // Unconditional branch, which we *could* handle by just setting PC

  // { opcode: 0xA, mnemonic: 'bury' },  // TODO: not so sure this is useful
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

  // { opcode: 0x12, mnemonic: 'call' },
  // Call a subroutine, saving and adjusting the frame pointer

  // { opcode: 0x13, mnemonic: 'ret' },
  // Return from a function, restoring the frame pointer

  { opcode: 0x11, mnemonic: 'unary' },
  // unary OP
  // ... X => ... OP(X)

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
  { opcode: 0x27, mnemonic: 'div' },  // AX = mod(X,Y)
  // bitwise
  { opcode: 0x28, mnemonic: 'or' },
  { opcode: 0x29, mnemonic: 'and' },
  { opcode: 0x2A, mnemonic: 'xor' },
  { opcode: 0x2B, mnemonic: 'shift' },
  // similar for these binary ops




  // Move these to world/game

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

const STACK_MODE_FLAG = -0x200;
const INLINE_MODE_FLAG = -0x1FF;

let MNEMONICS = {};
let OPCODES = []
for (let op of opcodes) {
  MNEMONICS[op.mnemonic] = op.opcode;
  OPCODES[parseInt(op.opcode)] = op.mnemonic;
}

const UNARY_OPERATORS = {
  0x5: { mnemonic: 'SIN', operation: x => Math.sin(Math.PI * x / 180) },
  0x4: { mnemonic: 'COS', operation: x => Math.cos(Math.PI * x / 180) },
  0x3: { mnemonic: 'TAN', operation: x => Math.tan(Math.PI * x / 180) },
  0x7: { mnemonic: 'LOG', operation: x => Math.log(x) },
  0xE: { mnemonic: 'EXP', operation: x => Math.exp(x) },
  0x1: { mnemonic: 'NOT', operation: x => x ? 0 : 1 },
  0xB: { mnemonic: 'BOOL', operation: x => x ? 1 : 0 },
  0xA: { mnemonic: 'ABS', operation: x => Math.abs(x) },
  0x9: { mnemonic: 'NEG', operation: x => -x },
  0xC: { mnemonic: 'COMPLEMENT', operation: x => ~x },
  0x6: { mnemonic: 'INVERSE', operation: x => x === 0 ? 0 : 0x7fff/x },
};

let UNARY_SYMBOLS = {};
for (let u in UNARY_OPERATORS) UNARY_SYMBOLS[UNARY_OPERATORS[u].mnemonic] = parseInt(u);


// having second thoughts about this
const BINARY_OPERATORS = {
    max: (a, b) => Math.max(a, b),
    min: (a, b) => Math.min(a, b),
    add: (a, b) => a + b,
    sub: (a, b) => a - b,
    mul: (a, b) => a * b,
    exp: (a, b) => Math.pow(a, b),
    atan2: (a, b) => {
      let t = Math.atan2(a, b) * 180 / Math.PI;
      return [ Math.floor(t), fractional(t - Math.floor(t)) ];
    },
    div: (a, b) => [ Math.floor(a / b), a % b ],
    or: (a, b) => a | b,
    and: (a, b) => a & b,
    xor: (a, b) => a ^ b,
    shift: (a, b) => (b < 0) ?
      [ a << -b, ((1 << -b) - 1) & (a >> (16 - b)) ] :
      [ a >> b, 0xffff & (a << (16 - b)) ],
};


// Machine registers
const SPECIAL = {
  PC: 0x1,    // Program counter register
  SP: 0x2,    // Stack pointer register
  FP: 0x3,    // Frame pointer
  AX: 0x4,    // Auxilliary register, gets some results
  INT_R: 0x5, // Spoken response interrupt vector (or 0)
  CLOCK: 0xF, // Counts clock cycles from startup

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

const SPECIAL_OPS = reverseMapIntoArray(SPECIAL);


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


function fractional(f) { return (f << 16) & 0xffff }


class VirtualMachine {
  memory = new Int16Array(4096);//.fill(0);
  special = new Int16Array(256);//.fill(0);  // negative memory
  running = true;

  get pc() { return this.special[SPECIAL.PC] }
  set pc(v) { this.special[SPECIAL.PC] = v }

  get sp() { return this.special[SPECIAL.SP] }
  set sp(v) { this.special[SPECIAL.SP] = v }

  get fp() { return this.special[SPECIAL.FP] }
  set fp(v) { this.special[SPECIAL.FP] = v }

  get ax() { return this.special[SPECIAL.AX] }
  set ax(v) { this.special[SPECIAL.AX] = v }
  set ax_fractional(f) { this.special[SPECIAL.AX] = f * 0x7fff }  // TODO insure 0 <= f <= 1

  get top() { return this.fetch(this.sp) }
  set top(v) { this.store(this.sp, v) }

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
    let operand = (instruction >> 6);// & 0x3ff;
    const stackMode = (operand == STACK_MODE_FLAG);
    const inlineMode = (operand == INLINE_MODE_FLAG);
    const immediateMode = !stackMode && !inlineMode;
    if (stackMode) {
      operand = this.pop();
    } else if (inlineMode) {
      operand = this.memory[++this.pc];
    }
    if (this.trace) console.log(`${this.pc}: ${OPCODES[opcode] || opcode.toString(16)} ${immediateMode ? operand : '--'} [${this.memory.slice(this.sp)}] [${Array.from(this.memory.slice(this.sp)).map(m => '$'+m.toString(16))}] ax=${this.ax}=${this.ax.toString(16)}`);
    this.pc += 1

    if (mnemonic === 'halt') {
      this.running = false;
      this.special[SPECIAL.AX] = operand;

    } else if (mnemonic === 'assert') {
      if(this.top !== operand) {
        console.log(`ASSERTION FAILURE AT ${this.pc}: top ${this.top} != operand ${operand}`);
        throw "assertion failure";
      }

    } else if (mnemonic === 'push') {
      this.push(operand);

    } else if (mnemonic === 'stack') {
      for (let i = 0; i < operand; i += 1)
        this.push(this.memory[this.pc++]);

    } else if (mnemonic === 'adjust') {
      this.sp -= operand;

    } else if (mnemonic === 'fetch' || mnemonic === 'fetchlocal' || mnemonic == 'peek') {
      let address = operand;
      if (mnemonic === 'fetchlocal') address += this.special[SPECIAL.FP];
      if (mnemonic === 'peek')  address += this.special[SPECIAL.SP];
      this.push(this.fetch(address));

    } else if (mnemonic === 'store' || mnemonic === 'storelocal' || mnemonic === 'poke') {
      let value = this.pop();
      let address = operand;
      if (mnemonic === 'storelocal') address += this.special[SPECIAL.FP];
      if (mnemonic === 'poke')  address += this.special[SPECIAL.SP];
      if (address >= 0 ||
         [SPECIAL.PC, SPECIAL.SP, SPECIAL.AX, SPECIAL.DS].includes(-address)) {
        this.store(address, this.pop());
      } // else illegal

    } else if (mnemonic === '_jmp') {
      console.log('jump!', immediateMode, operand, this.pc);
      if (immediateMode) operand += this.pc;
      this.pc = operand;

    } else if (mnemonic === '_br') {
      // with immediate addressing mode, the value is an offset not an absolute
      if (immediateMode) operand += this.pc;
      if (this.pop()) this.pc = operand;

/*
    } else if (mnemonic === 'call') {
      this.push(this.pc);
      this.push(this.fp);
      let frameSP = this.pc;

      push arg1
      ...
      push arg2
      FP = oldSP
      PC = a


    } else if (mnemonic === 'ret') {
    [FP-3] = v  ; return value
    SP = FP
    FP = pop()
    PC = pop()
    push(v)  ; this is another way to do it
    */

      /*
    } else if (mnemonic === 'bury') {
      // TODO might be backwards
      let offset = operand < 0 ? -1 : 1;
      let depth = Math.abs(operand);
      for (let i = 0; i < depth; ++i) {
        let a1 = this.sp + i;
        let a2 = this.sp + (i + offset + depth) % depth
        let tmp = this.fetch(a1);
        this.store(this.a1, this.fetch(this.a2));
        this.store(this.a2, tmp);
      }
      */

    // Unary operators
    } else if (mnemonic === 'unary') {
      let value = this.pop();
      let operator = UNARY_OPERATORS[operand];
      if (operator) {
        let result = operator.operation(value);
        this.push(Math.floor(result));
        this.ax_fractional = result - Math.floor(result);
      } else {
        throw "invalid unary operator"
        this.push(0xBAD);
      }

    // Binary operators
    } else if (BINARY_OPERATORS[mnemonic]) {
      let result = BINARY_OPERATORS[mnemonic](this.top, operand);
      if (typeof result === 'number') {
        this.top = result;
      } else {
        this.top = result[0];
        this.ax = result[1];
      }

    // "Real"-world instructions, all of which advance character age and set
    //  a boolean value in AX indication if the instruction completed

    } else if (opcode >= 0x30) {
      this.top = this.world.handleInstruction(this.special, opcode, this.top, operand);

    } else {
      throw `${this.pc}: invalid opcode ${opcode} ${mnemonic}`;
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
  return id.match(/^[@]?[a-zA-Z_][0-9a-zA-Z_]*$/);
}

function fitsAsImmediate(v) {
  // Return true if the value can be represented in 10-bits
  return typeof v === 'number' && -0x1ff < v && v < 0x200;
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

function toLowerCase(s) {
  return s.toLowerCase ? s.toLowerCase() : s;
}

class Assembler {
  static tokenre = /[.][a-z]+|[@a-zA-Z_][0-9a-zA-Z_]*|[:=()[\]{}!#%^&*]|[-+]?[0-9]+|[-+]?[$][a-fA-F0-9]+|"[^"]*"|'./g;

  macros = {};
  labels = {};
  forwardCodeReferences = {};
  forwardDataReferences = {};
  code = new Int16Array(4096);
  macroInProgress;
  pc = 0;
  line_no_adjustment = 1;

  assert(truth, message) {
    if (!truth) {
      throw this.line + `\nASSEMBLY ERROR AT LINE ${this.line_no + this.line_no_adjustment}: ${message}`;
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
      let n = parseInt(t.replace('$','0x'));
      if (!Number.isNaN(n)) return [n];
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
      let operand = tokens[1];    // though it may also be an operator
      let third = tokens[2];  // though there may not be a third

      if (this.macroInProgress) {
        if (inst === toLowerCase('.end')) {
          this.assert(tokens.length === 1, "unexpected junk after '.end'");
          this.macroInProgress = null;
        } else {
          this.macros[this.macroInProgress].body.push(line);
        }
      }

      else if (tokens.length > 0) {

        if (tokens.length === 2 && operand === ':') {
          "LABEL:"
          this.assert(is_identifier(inst), "identifier expected");
          this.assert(!this.labels[inst], "label already defined");
          this.labels[inst] = this.pc

        } else if (operand === '=') {
          "NAME = VALUE ;  symbolic constant"
          this.assert(tokens.length === 3, "invalid constant definition");
          this.assert(typeof third === 'number', "numeric value expected: " + third);
          symbols[inst] = third;

        } else if (inst === toLowerCase('.macro')) {
          this.assert(tokens.length >= 2, "macro name expected");

          ".macro NAME [operandS...]  ; begin macro definition"
          this.macroInProgress = operand;
          this.macros[operand] = {
            name: operand,
            parameters: tokens.slice(2),
            body: []
          }

        } else if (inst === toLowerCase('.data')) {
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

        } else if (inst === toLowerCase('.stack')) {
          this.assert(tokens.length > 1, "data expected following '.stack'");
          if (tokens.length === 2 && fitsAsImmediate(tokens[1])) {
            this.emit(MNEMONICS.push, tokens[1]);
          } else {
            this.emit(MNEMONICS.stack, tokens.length - 1);
            for (let t of tokens.slice(1)) {
              this.data(t);
            }
          }

        } else if (inst === toLowerCase('.line')) {
          this.assert(tokens.length === 2, "expected '.line LINE_NUMBER'");
          this.assert(typeof operand === 'number', "numeric value expected");
          this.line_no_adjustment = operand - this.line_no;

        } else if (inst === toLowerCase('.jump')) {
          this.assert(tokens.length === 2, "label of target for jump (only) expected");
          this.assert(typeof operand === 'string', "label of target for jump expected");
          // TODO: immediate mode
          this.emit(MNEMONICS._jmp, INLINE_MODE_FLAG);
          this.data(operand);

        } else if (inst === toLowerCase('.branch')) {
          this.assert(tokens.length === 2, "label of target for branch (only) expected");
          this.assert(typeof operand === 'string', "label of target for branch expected");
          // TODO: immediate mode
          this.emit(MNEMONICS._br, INLINE_MODE_FLAG);
          this.data(operand);

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
          "INST [OPERAND]  ; a regular instruction"
          this.assert(tokens.length <= 2, "unexpected characters following instruction");

          if (tokens.length === 1) {
            "INST  ; instruction in stack addressing mode"
            this.emit(inst, STACK_MODE_FLAG);

          } else {
            "INST operand  ; instruction with an immediate operand"

            if (typeof operand === 'number') {
              this.emit(inst, operand);
            } else {
              this.forwardCodeReferences[this.pc] = operand;
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
    for (let pc of Object.keys(this.forwardCodeReferences)) {
      let symbol = this.forwardCodeReferences[pc];
      this.assert(typeof this.labels[symbol] !== 'undefined', "undefined label: " + symbol);
      this.reemit(pc, this.code[pc] & 0x3f, this.labels[symbol]);
    }
    for (let pc of Object.keys(this.forwardDataReferences)) {
      let symbol = this.forwardDataReferences[pc];
      this.assert(typeof this.labels[symbol] !== 'undefined', "undefined label: " + symbol);
      this.redata(pc, this.labels[symbol]);
    }
  }

  emit(opcode, parameter) {
    this.reemit(this.pc++, opcode, parameter);
  }

  reemit(pc, opcode, parameter) {
    this.assert(-0x200 <= parameter && parameter <= 0x200, `immediate parameter (${parameter}) out of range`);
    this.assert(0 <= opcode && opcode <= 0x3f, `opcode (${opcode}) out of range`);
    this.code[pc] = opcode | (parameter << 6);
  }

  data(value) {
    if (typeof value === 'string') {
      this.forwardDataReferences[this.pc] = value;
      value = 0x70D0;  // placeholder
    }
    this.redata(this.pc++, value);
  }

  redata(pc, value) {
    // this.assert(-0x8000 <= value && value <= 0x7FFF, `value <${value}> out of range`);
    this.assert(-0xffff <= value && value <= 0xffff, `value <${value}> out of range`);
    this.code[pc] = value;
  }

  disassemble(address) {
    if (typeof address === 'number') {
      let inst = this.code[address];
      let disa;
      if (address > 0 && isInlineModeInstruction(this.code[address - 1])) {
        disa = '.data ' + inst;
      } else {
        let opcode = OPCODES[inst & 0x3f] || '??';
        let immediate = isStackModeInstruction(inst) ? '' :
                        isInlineModeInstruction(inst) ? ':::' :
                        (inst >> 6);
        if (['fetch','store'].includes(opcode))
          immediate = SPECIAL_OPS[-immediate] || immediate;
        disa = ('$' + ('00' + (inst & 0x3f).toString(16)).substr(-2)
          + ' $' + ('00' + (0x3ff & (inst >> 6)).toString(16)).substr(-3)
          + ' ' + opcode
          + ' ' + immediate);
      }

      return (
        ('000' + address).substr(-4)
          + ': $' + ('0000' + (inst & 0xffff).toString(16)).substr(-4)
          + ' ' + ('     ' + inst).substr(-6)
          + ' ' + ((32 <= inst && inst < 128) ? `'${String.fromCharCode(inst)}` : '  ')
          + '  ' + disa);
    } else {
      let result = Array.from(this.code.slice(0, this.pc)).map((inst, num) =>
        this.disassemble(num));
      return result.join('\n');
    }
  }

}

function isInlineModeInstruction(inst) {
  return INLINE_MODE_FLAG === (inst >> 6);
}

function isStackModeInstruction(inst) {
  return STACK_MODE_FLAG === (inst >> 6);
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

function reverseMapIntoArray(m) {
  let result = [];
  for (let i in m) result[m[i]] = i;
 return result;
}


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
  exports.VirtualMachine = VirtualMachine;
  exports.World = World;
  exports.Assembler = Assembler;
}
