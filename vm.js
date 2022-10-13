// opcodes are 16 bits but only the upper 6 bits (values 0x00 to 0x3F) are
// opcode, the other 10 are immediate values so that's 64 instructions, and
// immediate values range from -0x3FF to 0x3FF, with 0x400 indicating stack
// addressing mode

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

  { opcode: 0x10, mnemonic: 'sin' },
  // sin X
  // ... => ... sin(X degrees)
  { opcode: 0x11, mnemonic: 'log' },
  { opcode: 0x12, mnemonic: 'not' },
  { opcode: 0x13, mnemonic: 'abs' }, // maybe
  // similarly for these unary ops

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
  0x514: { mnemonic: 'sin', operation: x => Math.sin(x) },
  0x709: { mnemonic: 'log', operation: x => Math.log(x) },
  0x000: { mnemonic: 'not', operation: x => x ? 0 : 1 },
  0xAB5: { mnemonic: 'abs', operation: x => Math.abs(x) },
  0x4E9: { mnemonic: 'neg', operation: x => -x },
};

// Machine registers
const SPECIAL_PC = 0x1;   // Program counter register
const SPECIAL_SP = 0x2;   // Stack pointer register
const SPECIAL_AUX = 0x3;  // Auxilliary register, gets some results
const SPECIAL_CLOCK = 0x4;  // Counts clock cycles from startup

// Environment
const SPECIAL_TERRAIN = 0x10;
const SPECIAL_SURROUNDINGS = 0x11;
const SPECIAL_RESOURCE_TYPE = 0x12;  // type of visible lootable thing
const SPECIAL_RESOURCE_QTY = 0x13;

// Nearby mob
const SPECIAL_MOB_SPECIES = 0x20;  // from some list.
const SPECIAL_MOB_LEVEL = 0x21;
const SPECIAL_MOB_AGGRO = 0x;  // -8 = friendly, 0 = neutral, 8 = hostile
const SPECIAL_MOB_HEALTH = 0x;  // as %
const SPECIAL_MOB_JOB = 0x;  // for NPC, and more generally
const SPECIAL_MOB_ = 0x;

// Character sheet

const SPECIAL_LEVEL = 0x30;
const SPECIAL_STR = 0x31;
const SPECIAL_DEX = 0x32;
const SPECIAL_CON = 0x33;
const SPECIAL_INT = 0x34;
const SPECIAL_WIS = 0x35;
const SPECIAL_CHA = 0x36;

const SPECIAL_HP = 0x40;
const SPECIAL_HP_MAX = 0x41;
const SPECIAL_MP = 0x42;
const SPECIAL_MP_MAX = 0x43;
const SPECIAL_ENCUMBRANCE = 0x44;
const SPECIAL_ENCUMBRANCE_MAX = 0x45;

const SPECIAL_INVENTORY0 = 0x50; // Gold
const SPECIAL_INVENTORY1 = 0x51; // Reagents
const SPECIAL_INVENTORY2 = 0x52; // Mob drops
const SPECIAL_INVENTORY3 = 0x53; // Health potions
const SPECIAL_INVENTORY4 = 0x54; // Mana potions
const SPECIAL_INVENTORY5 = 0x55; // Keys
// ...
const SPECIAL_INVENTORY15 = 0x5F;

const SPECIAL_EQUIP_WEAPON = 0x60;  // Level of puissance
// ...
const SPECIAL_EQUIP_SHOES = 0x6F;

const SPECIAL_SPELL0 = 0x70;  // spell level
// ...
const SPECIAL_SPELL15 = 0x7F;

const SPECIAL_LONGITUDE = 0x80;  // as fixed point?
const SPECIAL_LATITUDE = 0x81;
const SPECIAL_ALTITUDE = 0x82;  // 0 = on land, -1 underground, 1 flying
const SPECIAL_FACING = 0x83;  // degrees on compass

const SPECIAL_ALLEGIANCE0 = 0x90;  // ASCII codes of some arbitrary shit
// ...
const SPECIAL_ALLEGIANCE15 = 0x9F;

const SPECIAL_TONE_FREQUENCY = 0xA0;
const SPECIAL_TONE_VOLUME = 0xA1;
// Room for polyphony


class VirtualMachine {
  memory = new Array[4096].fill(0);
  special = new Array[256].fill(0);  // negative memory

  get pc() { return special[SPECIAL_PC] }
  set pc(v) { special[SPECIAL_PC] = v }

  get sp() { return special[SPECIAL_SP] }
  set sp(v) { special[SPECIAL_SP] = v }

  get aux() { return special[SPECIAL_AUX] }
  get aux() { return special[SPECIAL_AUX] }
  set aux_fractional(f) { special[SPECIAL_AUX] = f * 0x7fff }  // TODO insure 0 <= f <= 1

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
  }

  step() {
    const instruction = memory[pc()];
    pc = pc + 1
    const opcode = (instruction >> 6) & 0x3F;
    const mnemonic = OPCODES[opcode].mnemonic;
    let argument = instruction & 0x3ff;
    const immediate = (argument !== 0x400);
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

    } else if (mnemonic: 'store' ) {
      let value = pop();
      let address = argument;
      if (address >= 0 ||
         [SPECIAL_PC, SPECIAL_SP, SPECIAL_AUX, SPECIAL_FACING].includes(-address)) {
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

    this.special[SPECIAL_CLOCK] += 1;
  }

  alive() {
    return this.special[SPECIAL_HP] > 0 &&
           this.special[SPECIAL_CLOCK] < 0x7FFF;
  }

  run() {
    while (this.alive()) {
      step();
    }
  }
}