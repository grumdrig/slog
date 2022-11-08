
const opcodes = [
  { opcode: 0x0, mnemonic: 'halt' },  // Halt execution

  { opcode: 0x1, mnemonic: 'br' },    // Branch if nonzero
  { opcode: 0x2, mnemonic: 'jmp' },   // Unconditional branch

  { opcode: 0x3, mnemonic: 'ext' },   // External call to embedding application

  { opcode: 0xA, mnemonic: 'push' },    // Push a value onto the stack
  { opcode: 0xB, mnemonic: 'stack' },   // Push multiple values onto the stack, or shrink it
  { opcode: 0xC, mnemonic: 'swap' },    // Swap top with value on stack, or register/state

  { opcode: 0xD, mnemonic: 'peek' },      // Push memory[SP + operand]
  { opcode: 0xE, mnemonic: 'fetch' },      // Push memory[operand]
  { opcode: 0xF, mnemonic: 'fetchlocal' }, // Push memory[FP + operand]

  { opcode: 0x4, mnemonic: 'poke' },      // Pop to memory[SP + operand]
  { opcode: 0x5, mnemonic: 'store' },      // Pop to memory[operand]
  { opcode: 0x6, mnemonic: 'storelocal' }, // Pop to memory[FP + operand]

  { opcode: 0x10, mnemonic: 'assert' },  // If not equal throw exception

  { opcode: 0x11, mnemonic: 'unary' },  // Apply unary operator determined by operand to top

  { opcode: 0x12, mnemonic: 'max' },  // Maximum, AX = minimum
  { opcode: 0x13, mnemonic: 'add' },  // Sum, AX = overflow
  { opcode: 0x14, mnemonic: 'sub' },  // Difference, AX = overflow
  { opcode: 0x15, mnemonic: 'mul' },  // Product, AX = overflow
  { opcode: 0x16, mnemonic: 'div' },  // Quotient, AX = mod(X,Y)
  { opcode: 0x17, mnemonic: 'pow' },  // Exponentiation, AX = X ^ 1/Y
  { opcode: 0x18, mnemonic: 'atan2' },// Arctangent, AX = fixed point result (atan2 * 256)

  { opcode: 0x1A, mnemonic: 'or' },   // Bitwise or, AX = logical or
  { opcode: 0x1B, mnemonic: 'and' },  // Bitwise and, AX = logical and
  { opcode: 0x1C, mnemonic: 'xor' },  // Bitwise exclusive or, AX = logical xor
  { opcode: 0x1D, mnemonic: 'shift' }, // Bit shift, AX = rotated-out bits
];


const STACK_MODE_FLAG = -0x400;
const INLINE_MODE_FLAG = -0x3FF;

let MNEMONICS = {};
let OPCODES = []
for (let op of opcodes) {
  if (OPCODES[op] || op < 0 || op > 0x1F) throw "Bad programmer";
  MNEMONICS[op.mnemonic] = op.opcode;
  OPCODES[parseInt(op.opcode)] = op.mnemonic;
}

const MIN_INT = -0x8000;
const MAX_INT =  0x7FFF;

const UNARY_OPERATORS = {
  0x5: { mnemonic: 'SIN', frac: true, operation: x => Math.sin(Math.PI * x / 180) },
  0x4: { mnemonic: 'COS', frac: true, operation: x => Math.cos(Math.PI * x / 180) },
  0x3: { mnemonic: 'TAN', frac: true, operation: x => Math.tan(Math.PI * x / 180) },
  0x7: { mnemonic: 'LOG', frac: true, operation: x => Math.log(x) },
  0xE: { mnemonic: 'EXP', frac: true, operation: x => Math.exp(x) },
  0x6: { mnemonic: 'INV', frac: true, operation: x => x === 0 ? 0 : MAX_INT/x },
  0x1: { mnemonic: 'NOT', operation: x => x ? 0 : 1 },
  0xB: { mnemonic: 'BOOL', operation: x => x ? 1 : 0 },
  0xA: { mnemonic: 'ABS', operation: x => Math.abs(x) },
  0x9: { mnemonic: 'NEG', operation: x => -x },
  0xC: { mnemonic: 'COMPLEMENT', operation: x => ~x },
};

let UNARY_SYMBOLS = {};
for (let u in UNARY_OPERATORS) UNARY_SYMBOLS[UNARY_OPERATORS[u].mnemonic] = parseInt(u);

function overflow(x) { return x < MIN_INT ? x - MIN_INT : x > MAX_INT ? x - MAX_INT : 0 }

const BINARY_OPERATORS = {
    max: (a, b) => [Math.max(a, b), Math.min(a, b)],
    add: (a, b) => [a + b, overflow(a + b)],
    sub: (a, b) => [a - b, overflow(a - b)],
    mul: (a, b) => [a * b, overflow(a * b)],
    div: (a, b) => [Math.floor(a / b), a % b],
    pow: (a, b) => [Math.pow(a, b), Math.pow(a, 1/b)],
    atan2: (a, b) => {
      let t = Math.atan2(a, b) * 180 / Math.PI;
      return [Math.round(t), Math.round(t * 256)];
    },
    or: (a, b) => [a | b, a || b],
    and: (a, b) => [a & b, a && b],
    xor: (a, b) => [a ^ b, ((!b && a) || (!a && b)) || 0],
    shift: (a, b) => (b < 0) ?
      [ a << -b, ((1 << -b) - 1) & (a >> (16 - b)) ] :
      [ a >> b, 0xffff & (a << (16 - b)) ],
};


// Machine registers
const REGISTERS = {
  PC: -1,  // Program counter
  SP: -2,  // Stack pointer
  FP: -3,  // Frame pointer
  AX: -4,  // Auxilliary results of some operations
};
const NUM_REGISTERS = 4;

const REGISTER_NAMES = reverseMapIntoArray(REGISTERS);


function fractional(f) { return (f << 16) & 0xffff }


class VirtualMachine {
  memory = new Int16Array(4096);
  registers = new Int16Array(NUM_REGISTERS);
  state;  // negative memory beyond registers
  running = true;
  clock = 0;  // elapsed cycles since start

  get pc() { return this.registers[-1-REGISTERS.PC] }
  set pc(v) { this.registers[-1-REGISTERS.PC] = v }

  get sp() { return this.registers[-1-REGISTERS.SP] }
  set sp(v) { this.registers[-1-REGISTERS.SP] = v }

  get fp() { return this.registers[-1-REGISTERS.FP] }
  set fp(v) { this.registers[-1-REGISTERS.FP] = v }

  get ax() { return this.registers[-1-REGISTERS.AX] }
  set ax(v) { this.registers[-1-REGISTERS.AX] = v }
  set ax_fractional(f) { this.registers[-1-REGISTERS.AX] = f * MAX_INT }

  get top() { return this.fetch(this.sp) }
  set top(v) { this.store(this.sp, v) }

  store(a, v) {
    if (a < 0) {
      a = -a - 1;
      if (a < this.registers.length) {
        this.registers[a] = v;
      } else if (a - this.registers.length < this.state.length) {
        this.state[a - this.registers.length] = v;
      } else {
        this.error("Access violation storing address ", -a - 1);
      }
    } else if (a < this.memory.length) {
        this.memory[a] = v;
    } else {
        this.error("Access violation storing address ", a);
    }
  }

  fetch(a) {
    if (a < 0) {
      a = -a - 1;
      if (a < this.registers.length) {
        return this.registers[a];
      } else if (a - this.registers.length < this.state.length) {
        return this.state[a - this.registers.length];
      } else {
        this.error("Access violation fetching address ", -a - 1);
      }
    } else if (a < this.memory.length) {
      return this.memory[a];
    } else {
      this.error("Access violation fetching address ", -a - 1);
    }
  }

  pop() { this.sp += 1; return this.memory[this.sp - 1] }
  push(v) { this.memory[this.sp -= 1] = v }

  constructor(program, world) {
    this.world = world;
    this.programLength = program.length;
    for (let i = 0; i < program.length; ++i) {
      this.memory[i] = program[i];
    }
    this.sp = this.memory.length;  // stack size is 0
    this.state = (world ? world.create(program) : new Int16Array(1));
  }

  static createFromFile(filename, world) {
    return new VirtualMachine(readFileAsWords(filename), world);
  }

  bigstep() {
    step();
    while (this.running && ((this.memory[this.pc] & 0x1F) != 0x3)) {
      step();
    }
  }

  step() {
    let result = false;
    const instruction = this.memory[this.pc];
    const opcode = instruction & 0x1F;
    const mnemonic = OPCODES[opcode];
    let operand = (instruction >> 5);
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
        this.error(`ASSERTION FAILURE AT ${this.pc}: top ${this.top} != operand ${operand}`);
      }

    } else if (mnemonic === 'push') {
      this.push(operand);

    } else if (mnemonic === 'stack') {
      if (operand < 0)
        this.sp -= operand;
      else for (let i = 0; i < operand; i += 1)
        this.push(this.memory[this.pc++]);

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
        this.store(address, value);
      // else illegal; can't manipulate state

    } else if (mnemonic === 'swap') {
      let t = this.top;
      if (operand > 0) {
        this.top = this.fetch(this.sp + operand);
        this.store(this.sp + operand, t);
      } else if (operand < 0) {
        this.top = this.fetch(operand);
        this.store(operand, t);
      } else {
        // noop
      }

    } else if (mnemonic === 'jmp') {
      // with immediate addressing mode, the value is an offset not an absolute
      if (immediateMode) operand += this.pc;
      this.pc = operand;

    } else if (mnemonic === 'br') {
      // with immediate addressing mode, the value is an offset not an absolute
      if (immediateMode) operand += this.pc;
      if (this.pop()) this.pc = operand;

    // Unary operators
    } else if (mnemonic === 'unary') {
      let value = this.pop();
      let operator = UNARY_OPERATORS[operand] ?? this.error("invalid unary operator");
      let result = operator.operation(value);
      this.push(Math.floor(result));
      if (operator.frac)
        this.ax_fractional = result - Math.floor(result);

    // Binary operators
    } else if (BINARY_OPERATORS[mnemonic]) {
      let result = BINARY_OPERATORS[mnemonic](this.top, operand);
      if (typeof result === 'number') {
        this.top = result;
      } else {
        this.top = result[0];
        this.ax = result[1];
      }

    // External instruction handled by the embedding app
    } else if (mnemonic == 'ext') {
      result = true;
      let args = [];
      for (let i = 0; i < operand >> 7; ++i) args.push(this.pop());
      this.push(this.world.handleInstruction(this.state, operand & 0x7F, ...args));

    } else {
      this.error(`${this.pc}: invalid opcode ${opcode} ${mnemonic ?? ''}`);
    }

    this.clock += 1;

    if (this.clock > 1000*1000) {
      console.log("**************** Debug limit reached");
      this.running = false;
    }

    // Check various sanity conditions. Potentially a programmer might want to
    // violate them for some hacky reason but we'll worry about that
    // problem if we encounter it.
    if (this.pc < 0 || this.pc >= this.memory.length ||
        this.sp < this.programLength || this.sp > this.memory.length ||
        this.fp < 0 || this.fp > this.memory.length) {
      this.error("Invalid machine state");
    }

    return result;
  }

  alive() {
    return this.running && !this.state[0];
  }

  run() {
    while (this.alive()) {
      this.step();
    }
  }

  error(message) {
    console.log('VM ERROR', message);
    this.dumpState();
    this.running = false;
    throw message;
  }

  dumpState() {
    console.log(`PC: ${this.pc}  SP: ${this.sp}  FP: ${this.fp}  AX: ${this.ax}  Clock: ${this.clock}`);
  }
}


function is_identifier(id) {
  return id.match(IDRE);
}

function fitsAsImmediate(v) {
  // Return true if the value can be represented in 10-bits
  return typeof v === 'number' && -0x3ff < v && v < 0x400;
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

const IDRE = /^\.?[@a-z_][@\w]*/i;

class AssemblyError {
  message;
  constructor(message) { this.message = message }
}

class Assembler {
  macros = {};
  labels = {};
  forwardCodeReferences = {};
  forwardDataReferences = {};
  code = new Int16Array(4096);
  macroInProgress;
  pc = 0;
  line_no_adjustment = 1;

  error(message) {
    throw this.line + `\nASSEMBLY ERROR AT LINE ${this.line_no + this.line_no_adjustment}: ${message}`;
  }

  assert(truth, message) {
    if (!truth) this.error(message);
  }

  static assemble(text) {
    let asm = new Assembler();
    let lines = asm.lex(text);
    asm.parse(lines, clone(REGISTERS, MNEMONICS, UNARY_SYMBOLS));
    asm.link();
    return asm;
  }

  lex(text) {
    let result = [];
    let lines = text.split('\n');

    for (let line_no = 0; line_no < lines.length; ++line_no) {
      this.line_no = line_no;
      let line = lines[line_no];
      let code = line.split(';')[0];
      code = code.trim();

      let inst = { line_no, line, tokens: [] };

      function take(re) {
        let result = code.match(re);
        if (result) {
          result = result[0];
          code = code.substr(result.length).trim();
          return result;
        }
      }

      while (code.length) {

        let lexeme;
        if (lexeme = take(/^[$][-+]?[\da-f]+/i)) {
          // Hex literal: $10 $AF $-a0 $+a0
          inst.tokens.push(parseInt(lexeme.substr(1), 16));

        } else if (lexeme = take(/^[-+]?\d+/)) {
          // Decimal literal: 10 -10 +10
          inst.tokens.push(parseInt(lexeme));

        } else if (lexeme = take(IDRE)) {
          // Identifier: name .name @some_name@1
          inst.tokens.push(lexeme);

        } else if (lexeme = take(/^'..?/)) {
          // Character literal: 'c or 'cc
          if (lexeme.length === 3) {
            inst.tokens.push(ord(lexeme[1]) * 256 + ord(lexeme[2]));
          } else {
            inst.tokens.push(ord(lexeme[1]));
          }

        } else if (lexeme = take(/^".+?"/)) {
          // String: "hello"
          inst.tokens = inst.tokens.concat(lexeme.slice(1, lexeme.length - 1)
            .split('').map(ord));

        } else if (lexeme = take(/^[:=()[\]{}!#%^&*]/)) {
          // Punctuation: : = ( ) etc.
          inst.tokens.push(lexeme);

        } else {
          this.error(`unrecognized character at line ${line_no}: '${line[0]}'`);
        }
      }

      result.push(inst);
    }
    return result;
  }

  parse(lines, symbols) {
    symbols = clone(symbols);
    for (let line of lines) {
      this.line_no = line.line_no;
      this.line = line.line;
      let tokens = line.tokens;

      tokens = tokens.map(t => symbols[t] ?? t);

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
          this.emit(MNEMONICS.jmp, INLINE_MODE_FLAG);
          this.data(operand);

        } else if (inst === toLowerCase('.branch')) {
          this.assert(tokens.length === 2, "label of target for branch (only) expected");
          this.assert(typeof operand === 'string', "label of target for branch expected");
          // TODO: immediate mode
          this.emit(MNEMONICS.br, INLINE_MODE_FLAG);
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
      this.assert(typeof this.labels[symbol] !== 'undefined', "undefined code label: " + symbol);
      let opcode = this.code[pc] & 0x1f;
      let operand = this.labels[symbol];
      if (['jmp', 'br'].includes(OPCODES[opcode])) {
        // In immediate mode, jmp and br are relative to the (post-instruction) pc
        operand = operand - (pc + 1);
      }
      this.reemit(pc, opcode, operand);
    }
    for (let pc of Object.keys(this.forwardDataReferences)) {
      let symbol = this.forwardDataReferences[pc];
      this.assert(typeof this.labels[symbol] !== 'undefined', "undefined data label: " + symbol);
      this.redata(pc, this.labels[symbol]);
    }
    let lastNontrivialIndex = this.code.reduce((n, v, i) => v ? i : n);
    this.code = this.code.slice(0, lastNontrivialIndex + 1);
  }

  emit(opcode, parameter) {
    this.reemit(this.pc++, opcode, parameter);
  }

  reemit(pc, opcode, parameter) {
    this.assert(-0x400 <= parameter && parameter < 0x400, `immediate parameter (${parameter}) out of range`);
    this.assert(0 <= opcode && opcode <= 0x1f, `opcode (${opcode}) out of range`);
    this.code[pc] = opcode | (parameter << 5);
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
      let inst = this.code[address] || 0;
      let disa;
      if (address > 0 && isInlineModeInstruction(this.code[address - 1] || 0)) {
        disa = '.data ' + inst;
      } else {
        let opcode = OPCODES[inst & 0x1f] || '??';
        let immediate = isStackModeInstruction(inst) ? '' :
                        isInlineModeInstruction(inst) ? ':::' :
                        (inst >> 5);
        if (['fetch','store'].includes(opcode))
          immediate = REGISTER_NAMES[immediate] || immediate;
        disa = ('$' + ('00' + (inst & 0x1f).toString(16)).substr(-2)
          + ' $' + ('00' + (0x7ff & (inst >> 5)).toString(16)).substr(-3)
          + ' ' + opcode
          + ' ' + immediate);
      }

      return (
        ('000' + address).substr(-4)
          + ': $' + ('0000' + (inst & 0xffff).toString(16)).substr(-4)
          + ' ' + ('     ' + inst).substr(-6)
          + ' ' + ((asCharIfPossible(inst) ?? '') + '    ').substr(0,3)
          + ' ' + disa
          );
    } else {
      let result = Array.from(this.code.slice(0, this.pc)).map((inst, num) =>
        this.disassemble(num));
      return result.join('\n');
    }
  }
}


function asCharIfPossible(v) {
  let lsb = v & 0xFF;
  if (32 < lsb && lsb < 127) {
    lsb = String.fromCharCode(lsb);
    let msb = v >> 8;
    if (32 < msb && msb < 127)
      return "'" + String.fromCharCode(msb) + lsb;
    else if (msb === 0)
      return "'" + lsb;
  }
}


function isInlineModeInstruction(inst) {
  return INLINE_MODE_FLAG === (inst >> 5);
}

function isStackModeInstruction(inst) {
  return STACK_MODE_FLAG === (inst >> 5);
}

// Testing:


function ord(c) { return c.charCodeAt(0) }


function reverseMapIntoArray(m) {
  let result = [];
  for (let i in m) result[m[i]] = i;
 return result;
}


function readFileAsWords(filename) {
    const { readFileSync } = require('fs');
    let buffer = readFileSync(filename);
    var ab = new ArrayBuffer(buffer.length);
    let view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i)
      view[i] = buffer[i];
    return new Int16Array(ab);
}

if (typeof exports !== 'undefined') {
  exports.VirtualMachine = VirtualMachine;
  exports.Assembler = Assembler;
  exports.readFileAsWords = readFileAsWords;
}


if (typeof module !== 'undefined' && !module.parent) {
  // Called with node as main module
  const { parseArgs } = require('util');
  const { readFileSync, writeFileSync } = require('fs');

  const { values, positionals } = parseArgs({
    options: {
      assemble: {
        type: 'string',
        short: 'a',
      },
      output: {
        type: 'string',
        short: 'o',
      },
      disassemble: {
        type: 'string',
        short: 'd',
      },
      load: {
        type: 'string',
        short: 'l',
      },
      interface: {
        type: 'string',
        short: 'i',
      },
      verbose: {
        type: 'boolean',
        short: 'v',
        multiple: true,
      },
      quiet: {
        type: 'boolean',
        short: 'q',
        multiple: true,
      },
      run: {
        type: 'boolean',
        short: 'r',
      },
    },
  });
  const flags = values;

  const verbosity = 1 + (flags.verbose || []).length - (flags.quiet || []).length;
  let code;

  if (flags.assemble) {
    let source = readFileSync(flags.assemble, 'utf8');

    let asm;
    try {
      asm = Assembler.assemble(source);
      code = asm.code;
    } catch (e) {
      if (e instanceof AssemblyError) {
        console.error('Assembly Error: ' + e);
        process.exit(-1);
      } else {
        throw e;
      }
    }

    if (flags.disassemble) {
      writeFileSync(flags.disassemble, asm.disassemble(), 'utf8');
    }

    if (flags.output) {
      writeFileSync(flags.output, asm.code);
    }
  }

  if (flags.load) {
    code = readFileAsWords(flags.load);
  }

  let Game;
  if (flags.interface) {
    Game = require(flags.interface).Game;
  }

  if (flags.run) {
    if (!code) {
      console.error('To run the machine, specify assembly source with `-a FILENAME` or binary with `-l FILENAME`');
      process.exit(-2);
    }
    if (!code) {
      console.error('To run the machine, specify game with `-i PATH/FILENAME`');
      process.exit(-2);
    }
    let vm = new VirtualMachine(code, Game);
    if (verbosity > 1) vm.trace = true;
    vm.run();
    if (verbosity > 0) {
      if (Game)
        Game.dumpState(vm.state);
      vm.dumpState();
    }
  }
}
