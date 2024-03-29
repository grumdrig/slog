Slog Virtual Machine
====================

The Slog VM is a virtual machine which can be programmed to control autonomous
character behavior in a role-playing game or other environment.


Architecture
------------

The machine operation is entirely built on signed 16-bit words ("Int16"s). It
has a small instruction set of mainly stack-based operations, and a single
address space consisting of three areas:

	* A flat main memory area, addressible by non-negative addresses. It holds
	  both code and data. It also holds the stack, which grows downwards.

	* Four registers, which besides being manipulated in various ways by the
	  instructions, may be addressed using memory addresses -1 down to -4.

	* A vector of read-only state variables, addressible using negative
	  addresses -5 and below.

Every machine instruction shares the same encoding scheme, which packs an
unsigned 5-bit opcode and a signed 11-bit parameter into a single 16-bit
instruction word.


Registers
---------

The registers are are both readable and directly writable and are central to
the control flow and operation of the virtual machine.

They are:

* PC, the program counter, at memory location -1. It holds the address of the
  next instruction to be executed at any given moment. Operation of the
  machine proceeds by fetching the machine instruction at PC, incrementing
  PC, then processing the instruction.

* SP, the stack pointer, at memory location -2. It holds the address of the
  top value on the stack. The stack grows downwards (i.e. the value of SP
  descends as the stack grows). At startup, SP is initialized to point just
  past the end of main memory, and the stack is therefore empty.

* FP, the frame pointer register, at memory location -3. A small number of
  instructions add the value of FP to their operand to derive an address.
  This is intended to support allocation of space for variables on the stack,
  such as for function calls.

* AX, the auxilliary register, at memory location -4. While instructions that
  do have a result place that result on the stack, some instructions that
  have a secondary result place that value in the AX register.


State Vector
------------

The state memory is accessed in the same way as the main memory, but using
negative addresses less than -4. It is readable, but not writeable within the
operation of the machine. Instead it is passed for modification to a handler
outside the VM itself using the `ext` instruction.

The embedding game or application within which the VM runs exposes some or all
of the game state in the state vector.


Instruction Format
------------------

Every instruction is stored within a single 16-bit word. The instruction
consists of two parts:

* opcode: An unsigned 5-bit integer value
* immediate: A signed 11-bit integer value

The two are encoded in a 16 bit integer instruction by the bitwise operation:

	instruction = (immediate << 5) | opcode

The `immediate` value is used to compute the value of an `operand`, and the
`opcode` and `operand` together determine how the machine processes that
instruction. There are three cases:

* Stack mode: In the case where the operand has value -1024
  (hexadecimal -$400), then before executing the instruction, the top value
  is popped from the stack and used as `operand`. I.e.:

	operand = MEMORY[SP++]

* Inline mode: If the operand has value -1023 (hexadecimal -$3FF), the program
  counter is advanced by one, and the value skipped over is used as the
  operand. I.e.:

	operand = MEMORY[PC++]

* Immediate mode. In all other cases, `opcode` simply takes on the value of
  `immediate`.


Valid instructions and their operations are described in the following
sections.


Instructions
============

Instructions are listed by their numeric opcode and a mnemonic. Each
instruction is provided with a operand, determined as described in the
previous section.

In this document, a value removed for use from the stack is said to "pop" from
the stack. That is, in the case that "pop" is used, the stack is shrunk by
one and what had been the top value is the value of "pop". In pseudocode, to
pop the value `x`:

	x = MEMORY[SP++]

"Pushing" a value on the stack refers to growing the stack by placing the
 valueat its top. So in pseudocode, to push `x`:

	MEMORY[--SP] = x

"Fetching" a value refers to accessing a value in main memory, a register, or
 in the state vector, per the following pseudocode:

	define fetch(address) as:
		if address >= 0:
			return MEMORY[address]
		else if address <= -5:
			return STATE[5 - address]
		else if address == -1:
			return PC
		else if address == -2:
			return SP
		else if address == -3:
			return FP
		else if address == -4:
			return AX


"Storing" is just the opposite of fetching -- a value in placed into main
 memory or a register (but not the state vector).


Control Flow Instructions
-------------------------


### $0 halt

Halt program execution. The machine stops running. The operand is placed in
the AX register.


### $2 `jmp`

Unconditional branch.

In both the stack-mode form and the inline-mode form, `PC` takes on the value
of `operand`.

	PC = operand

However, in the case of an immediate operand, the operand is an offset from
the current value of `PC`:

	PC += operand

(Note that since PC has already been incremented before the instruction is
executed, the increment to PC is relative to the instruction following the
`jmp`.)


### $1 branch

Branch if popped value is nonzero. I.e., if the value removed from the top of
the stack is not equial to zero, move program execution to the address
supplied by the operand, in the manner of `jmp`.

As with `jmp`, semantics differ between the immediate and stack-addressed
forms.

When stack addressing is used, the pseudocode is:

	if MEMORY[SP++] != 0:
		PC = operand

whereas with immediate addressing, it is:

	if MEMORY[SP++] != 0:
		PC += operand


### $10 assert

Assertion of expected equality. This is for sanity testing and catching
errors.

If the value on the top of the stack does not equal the operand, throw an
exception.

	if MEMORY[SP] != operand:
		throw

Note that the value is not removed from the top of the stack; SP is not
adjusted (except as it may be in the stack-mode form).


Stack and Memory Instructions
-----------------------------


### $A push

Push the operand onto the stack.

	MEMORY[--SP] = operand


### $B stack

Push the ensuing data onto the stack. The operand is the number of ensuing
code points that will be interpreted as data and pushed onto the stack. Of
course the program counter will be advanced beyond these memory locations.

If `operand` is non-negative:

	repeat operand times:
		MEMORY[--SP] = MEMORY[PC++]

If the operand is negative, no data is pushed to the stack; instead the stack
is shortened by `-operand` by adjusting the stack pointer register.

	SP -= operand


### $C swap

If operand is positive, exchage the top stack value with the value
operand-deep in the stack.

	tmp = MEMORY[SP]
	MEMORY[SP] = MEMORY[SP + operand]
	MEMORY[SP + operand] = tmp

If operand is negative, exchange the top stack value with the register or
state variable which has operand as its (absolute, not relative to SP)
address.

	tmp = MEMORY[SP]
	MEMORY[SP] = fetch(operand)
	fetch(operand) = tmp


### $E fetch

Fetch a value with address `operand` and push it onto the stack.

	MEMORY[--SP] = MEMORY[operand]


### $F fetchlocal

Fetch a value from a memory location relative to the frame pointer register
and push it onto the stack.

	MEMORY[--SP] = MEMORY[FP + operand]


### $D peek

Fetch a value from somewhere on the stack and push it onto the stack.

	MEMORY[--SP] = MEMORY[SP + operand]

For example, `peek 0` duplicates the top of the stack.


### $5 store

Pop a value from the stack and store it in memory (or a register).

	MEMORY[operand] = MEMORY[SP++]


### $6 storelocal

Pop a value from the stack and store it relative to the frame pointer register.

	MEMORY[FP + operand] = MEMORY[SP++]


### $15 poke

Pop a value from the stack and store it somewhere on the stack.

	MEMORY[SP + operand] = MEMORY[SP++]


Mathematical Operations
-----------------------

### $10 unary

Apply a unary operation, in place, to the value at the top of the stack. The
operation is determined by the value of `operand`.

These are the valid unary operations. Here `top` represents the value on the
top of the stack:

| Operand | Mnemonic   | Calculation
|---------|------------|----------------------------
| $5      | sin        | top = sine(top) [^1]
| $4      | cos        | top = cosine(top)  [^1]
| $3      | tan        | top = tangent(top) [^1]
| $7      | log        | top = ln(top) [^1]
| $E      | exp        | top = e^top [^1]
| $6      | inv        | top = 32767 / top [^1]
| $1      | not        | top = top ? 0 : 1
| $B      | bool       | top = top ? 1 : 0
| $A      | abs        | top = top < 0 ? -top : top
| $9      | neg        | top = -top
| $C      | complement | top = ~top

For operations with inherently integer results:

	MEMORY[SP] = unaryOp(MEMORY[SP])

[^1]: For unary operations that in general give non-integer results, the
greatest integer less than the result is stored on the top of the stack, and
the fractional part is stored in AX, scaled by MAX_INT = 32767.

	MEMORY[SP] = floor(unaryOp(MEMORY[SP]))
	AX = frac(unaryOp(MEMORY[SP])) * MAX_INT

The other unary operations leave the AX register undisturbed.


### Binary operations

All other math instructions are binary operations. All use the value at the
top of the stack as their first argument, and `operand` as their second
argument. The result is returned to the top of the stack. Each operation has
a side effect that alters the AX register, as listed in the table below.

	MEMORY[SP] = binaryOp(MEMORY[SP], operand)
	AX = auxilliary_result_of_operation


| Opcode | Mnemonic | Primary effect                 | Auxilliary effect          |
|--------|----------|--------------------------------|----------------------------|
| $12    | max      | top = maximum(top, operand)    | AX = minimum(top, operand) |
| $13    | add      | top = top + operand            | AX = overflow [^2]         |
| $14    | sub      | top = top - operand            | AX = overflow [^2]         |
| $15    | mul      | top = top * operand            | AX = overflow [^2]         |
| $16    | div      | top = floor(top/operand)       | AX = remainder [^3]        |
| $17    | atan2    | top = arctan(top/operand) [^4] | AX = fractional part [^5]  |
| $1A    | or       | top = bitwise or               | AX = logical or [^6]       |
| $1B    | and      | top = bitwise and              | AX = logical and [^6]      |
| $1C    | xor      | top = bitwise xor              | AX = logical xor [^6]      |
| $1D    | shift    | top = bitwise shift r/l [^7]   | AX = shifted-out bits [^8] |

[^2]: Overflow is the arithmetic result minus what can be stored in an Int16
(or 0 if no overflow). In the case of mul, the mathematically correct value
may not fit in AX.

[^3]: I.e. `top % operand`.

[^4]: The result is expressed in degrees in the range[-180, 180). The stack
gets the integral part of that, so actually `floor(arctan(top/operand))`.

[^5]: Similar to unary operations with non-integer results, this is the
fractional part of the result scaled by MAX_INT, i.e. 32767.

[^6]: Logical operations treat zero as "false" and non-zero as "true". Nonzero
results are carried through, so, for example, for `or` we get:

	top = top | operand       ; bitwise or
	AX = top ? top : operand  ; logical or

[^7]: The shifts are to the right if operand is positive, or to the left if
operand is negative.

[^8]: The shifted-out bits appear in AX where they would in rotation
(unless shifted beyond). So after shifting by 16 or less, `top | AX` would
hold the bit rotation.


External Call
-------------

### $3 ext

The `ext` opcode passes control to the application in which the VM is
embedded, or in any case a handler object provided to the constructor of the
VM. The handler must expose a function called `handleInstruction`, which the
VM passes control to when processing the `ext` instruction.

The operand consists of two parts. The low-order 7 bits gives is an opaque
code passed to `handleInstruction` as the first parameter for it to
interpret, along with a handle to the state vector. The four high-order bits
give the number of additional arguments to pass to `handleInstruction`. These
are taken off the stack.

The value returned by `handleInstruction` is pushed back onto the stack.

	nargs = operand >> 7
	result = handleInstruction(operand & $7F, state, MEMORY[SP], MEMORY[SP+1],...)
	SP += nargs
	MEMORY[SP--] = result

The handler may affect the state vector however it sees fit.
