
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

  { opcode: 0x30, mnemonic: 'ext30' },
  { opcode: 0x31, mnemonic: 'ext31' },
  { opcode: 0x32, mnemonic: 'ext32' },
  { opcode: 0x33, mnemonic: 'ext33' },
  { opcode: 0x34, mnemonic: 'ext34' },
  { opcode: 0x35, mnemonic: 'ext35' },
  { opcode: 0x36, mnemonic: 'ext36' },
  { opcode: 0x37, mnemonic: 'ext37' },
  { opcode: 0x38, mnemonic: 'ext38' },
  { opcode: 0x39, mnemonic: 'ext39' },
  { opcode: 0x3A, mnemonic: 'ext3A' },
  { opcode: 0x3B, mnemonic: 'ext3B' },
  { opcode: 0x3C, mnemonic: 'ext3C' },
  { opcode: 0x3D, mnemonic: 'ext3D' },
  { opcode: 0x3E, mnemonic: 'ext3E' },
  { opcode: 0x3F, mnemonic: 'ext3F' },
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
const REGISTERS = {
  PC: -1,        // Program counter register
  SP: -2,        // Stack pointer register
  FP: -3,        // Frame pointer
  AX: -4,        // Auxilliary register, gets some results
  CLOCK: -5,     // Counts clock cycles from startup
  REGISTER6: -6, // Reserved
  REGISTER7: -7, // Reserved
};

const REGISTER_NAMES = reverseMapIntoArray(REGISTERS);


function fractional(f) { return (f << 16) & 0xffff }


class VirtualMachine {
  memory = new Int16Array(4096);
  registers = new Int16Array(7);
  state;  // negative memory beyond registers
  running = true;

  get pc() { return this.registers[-1-REGISTERS.PC] }
  set pc(v) { this.registers[-1-REGISTERS.PC] = v }

  get sp() { return this.registers[-1-REGISTERS.SP] }
  set sp(v) { this.registers[-1-REGISTERS.SP] = v }

  get fp() { return this.registers[-1-REGISTERS.FP] }
  set fp(v) { this.registers[-1-REGISTERS.FP] = v }

  get ax() { return this.registers[-1-REGISTERS.AX] }
  set ax(v) { this.registers[-1-REGISTERS.AX] = v }
  set ax_fractional(f) { this.registers[-1-REGISTERS.AX] = f * 0x7fff }  // TODO insure 0 <= f <= 1

  get clock() { return this.registers[-1-REGISTERS.CLOCK] }
  set clock(v) { this.registers[-1-REGISTERS.CLOCK] = v }

  get top() { return this.fetch(this.sp) }
  set top(v) { this.store(this.sp, v) }

  store(a, v) {
    if (a < 0) {
      a = -a - 1;
      if (a < this.registers.length) {
        this.registers[a] = v;
      } else {
        a -= this.registers.length;
        if (a < this.state.length)
          this.state[a] = v;
      }
    } else if (a < this.memory.length) {
        this.memory[a] = v;
    }
  }

  fetch(a) {
    if (a < 0) {
      a = -a - 1;
      if (a < this.registers.length) return this.registers[a];
      a -= this.registers.length;
      if (a < this.state.length) return this.state[a];
      return 0;
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
    this.state = world.create();
  }

  bigstep() {
    step();
    while (this.running && ((this.memory[this.pc] & 0x3F) < 0x30)) {
      step();
    }
  }

  step() {
    let result = false;
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
      this.ax = operand;

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
      if (mnemonic === 'fetchlocal') address += this.fp;
      if (mnemonic === 'peek')  address += this.sp;
      this.push(this.fetch(address));

    } else if (mnemonic === 'store' || mnemonic === 'storelocal' || mnemonic === 'poke') {
      let value = this.pop();
      let address = operand;
      if (mnemonic === 'storelocal') address += this.fp;
      if (mnemonic === 'poke')  address += this.sp;
      if (address >= -this.registers.length)
        this.store(address, this.pop());
      // else illegal; can't manipulate state

    } else if (mnemonic === '_jmp') {
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

    // "Real"-world instructions, all of which advance character age

    } else if (opcode >= 0x30) {
      result = true;
      this.top = this.world.handleInstruction(this.state, opcode, this.top, operand);

    } else {
      throw `${this.pc}: invalid opcode ${opcode} ${mnemonic}`;
    }

    this.clock += 1;

    if (this.clock > 30000) {
      console.log("Debug limit");
      this.running = false;
    }

    return result;
  }

  alive() {
    return this.running;
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
    this.parse(lines, clone(REGISTERS, MNEMONICS, UNARY_SYMBOLS));
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
          immediate = REGISTER_NAMES[-immediate] || immediate;
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


function reverseMapIntoArray(m) {
  let result = [];
  for (let i in m) result[m[i]] = i;
 return result;
}


if (typeof exports !== 'undefined') {
  exports.VirtualMachine = VirtualMachine;
  exports.Assembler = Assembler;
}
