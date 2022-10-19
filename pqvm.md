PQVM Manual
===========


The PQVM is a virtual machine which can be programmed to control autonomous
character behavior in a role-playing game environment.


Architecture
------------

The machine has a simple instruction set with simple signed 16-bit machine
architecture, which includes:

	* A single flat main memory area of signed 16-bit words, of length less
	  than 32k, probably much less, addressible with positive 16-bit values.
	  It holds both code and data.

	* A signed 16-bit special memory area, probably no more than 256 words in
	  length, mostly read-only, addressible equivalently to the main memory
	  but with negative addresses

	* Stack-based operation, with a stack that grows downward, which shares
	  the main memory area with the code and data.

Every machine instruction shares the same addressing scheme, which packs an
unsigned 6-bit opcode and a signed 10-bit argument into a single 16-bit
instruction.


Special Memory
--------------

The special memory is accessed in the same way as the main memory, but using
negative addresses.

Most of the special memory a game-specific and read-only, with the exception
of a few, which may be referred to as registers. There are listed
and described in the next section.


Registers
---------

The register are are both readable and directly writable and are central to
the control flow and operation of the virtual machine itself, as opposed to
game-related information.

They are:

* PC, the program counter, at memory location -1. It holds the address of the
  next instruction to be executed at any given moment.

* SP, the stack pointer, at memory location -2. It hold the address of the top
  value on the stack. The stack grows downwards (i.e. the value of SP
  descends as the stack grows). At startup SP is initialized at the end of
  memory; that is, the value it holds at startup is the length of main
  memory, and the stack is therefore empty.

* AUX, the auxilliary register, at memory location -3. While all instructions
  that have a result place that result on the stack, a handful of
  instructions that have a secondary result place that value in the AUX
  register.

* DS, the data segment register, at memory location -4. A small number of
  instructions add the value of DS to their argument to derive an address.
  This may be useful for data that is out of reach of instruction arguments,
  which can range only as high as 511.

* INT_R, the response interrupt vector, at memory location -5. A subroutine to
  respond to events in the game may be installed in INT_R. In the case of
  certain in-game events, if INT_R is non-zero, the current value of PC is
  pushed on the stack and then execution is moved to INT_R (that is, PC gets
  the value INT_R).


Instruction Format
------------------

Every instruction is stored within a single 16-bit word. The instruction
consists of two parts:

* opcode: An unsigned 6-bit integer value
* argument: A signed 10-bit integer value

The two are encoded in a 16 instruction by the bitwise operation:

	opcode | (argument << 6)

In the case where the argument has value -512 (hexadecimal 0x200), before
executing the instruction, the top value is removed from the stack and used
as the argument instead. That is, in pseudocode:

	argument = MEMORY[SP]
	SP = SP + 1

Following this, PC is incremented. Then the instruction is executed in an
opcode-specific way, which may well affect PC, SP, other registers and
special memory, and/or main memory.

Valid instructions are described in the following sections.


Instructions
============

Instructions are listed by their numeric opcode and mnemonic. The argument supplied as an immediate value as part of the instruction, or removed from the stack in the case of stack addressing, is referred to as "argument".

A value removed from the stack is called "pop". That is, in the case
that "pop" is used, the stack is shrunk by one and what had been the top value is
the value of "pop". In pseudocode:

	pop = MEMORY[SP]
	SP = SP + 1

In pseudocode below, `push(x)` refers to growing the stack and placing `x` on
the top of it. So in pseudocode `push(x)` means

	SP = SP - 1
	MEMORY[SP] = x


Control Flow Instruction
------------------------


### $0 halt

Halt program execution. The machine stops running. Argument is ignored.


### $2 jump

Unconditional branch. PC takes on the value of argument.

	PC = argument


### $B branch

Branch if pop is nonzero.

	if pop != 0 {
		PC = argument
	}

If the value removed from the top of the stack is not equial to zero, move program execution the the address supplied by the parameter.


### $3F assert

Assertion of expected equality.

If the value on the top of the stack does not equal the parameter, throw an
exception.

	if pop != argument {
		throw
	}


Stack and Memory Instructions
-----------------------------


### $C push

Push a value onto the stack.

	push(argument)


### $D sethi

Set the high 8 bits of top of stack

	MEMORY[SP] = (MEMORY[SP] & 0xFF) | (argument << 8)

This is useful for values outside the range that can be represented in an immediate argument, but it's not as useful as `stack`, so I'll probably get rid of it.


### $1C stack

Push the ensuing data on the stack. This instruction behaves somewhat differently from most others. It's useful especially for values outside the range of what can be represented as an immediate argument.

	repeat `argument` times {
		SP = SP - 1
		MEMORY[SP] = MEMORY[PC]
		PC = PC + 1
	}


### $9 adjust

Remove or reserve values on the stack

	SP = SP - argument


### $E fetch

Fetch a value at a memory location and store it in the stack.

	SP = SP - 1
	MEMORY[SP] = MEMORY[argument]


### $F fetchdata

Fetch a value at a [distant] memory location and store it in the stack.

	SP = SP - 1
	MEMORY[SP] = MEMORY[DS + argument]


### $5 store

Set a value in memory to a value removed from the stack.

	MEMORY[argument] = MEMORY[SP]
	SP = SP + 1


### $6 storedata

Store a value in [distant] memory.

	MEMORY[DS + arguments] = MEMORY[SP]
	SP = SP + 1


### $1F peek

Peek on the stack.

	MEMORY[SP] = MEMORY[SP + argument]
	SP = SP - 1


### $15 poke

Set a value stored on the stack to the value popped from the stack.

	MEMORY[SP + argument] = MEMORY[SP]
	SP = SP + 1


Mathematical Instructions
-------------------------

### $10 unary

Apply a unary operation to the value at the top of the stack. The operation is
determined by the value of argument.

	MEMORY[SP] = UNARY_OPERATIONS[argument](MEMORY[SP])

A list of unary operations is forthcoming.


### $20 max
### $21 min
### $22 add
### $23 sub
### $24 mul
### $25 atan2
### $26 pow
### $27 div
### $28 or
### $29 and
### $2A xor
### $2B shift

All the binary operations use a value popped from the stack as their first
argument, and `argument` as their second argument. The result is returned to
the stack. So to clarify, in the assembly code snippet:

	push 5
	push 3
	sub

it is 3 that is subtracted from 5, not the other way around, and likewise in

	push 5
	sub 3

In the case of `div`, additionally, the remainder (e.g. the modulus of the two
parameters) is placed in AUX:

	MEMORY[SP] = MEMORY[SP] / argument
	AUX = MEMORY[SP] % argument

In the case of shift, the shifted-off bits are placed in AUX, but at the
opposite end, such that the rotation by the same amount may be computed as

	MEMORY[SP] | AUX


Gameplay Instructions
---------------------

Opcodes $30 through $37 are game-specific interactions with the game world.
Each passes their the value at the top of the stack and the argument to a game world handler function, which returns that replaces the top stack value. In pseudocode:

	MEMORY[SP] = game.handleInstruction(opcode, MEMORY[SP], argument)

The world-specific handler may affect any of the game-specific special memory,
but is not expected to alter the registers or main memory in any way.


### $30 walk
  // Walk at the given speed, as a percentage
  // walk X : ... => ...
  // walk   : ... X => ...

### $31 face
  // Face a direction, given an angle in degrees

### $32 act
  // Do an action with argument giving action type

### $33 cast
  // cast N : ... => ...
  // Parameter is the special index for the spell
  // Potentially a magic equipment slot could be specified
  // This may affect some memory location(s)

  /### $34 log
  // add ascii character to log/journal

### $35 buy
  // Buy something from NPC, category speced by parameter
  // Result code shows quantitiy purchased (0 or 1 probably)
  // buy : ... => ... result ; gold and inventory or equipment affected

### $36 sell
  // Sell something to an NPC, category speced by parameter
  // Result code shows quantitiy sold (0 or 1 probably)
  // sell : ... => ... result ; gold and inventory or equipment affected

