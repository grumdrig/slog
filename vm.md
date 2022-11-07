Virtual Machine Manual
======================


The VM is a virtual machine which can be programmed to control autonomous
character behavior in a role-playing game or other environment.


Architecture
------------

The machine has a simple instruction set with simple signed 16-bit machine
architecture, which includes:

	* A flat main memory area of signed 16-bit words ("Int16s"), of length
	  less than 32k, probably much less, addressible with positive 16-bit
	  values. It holds both code and data.

	* Four registers, also Int16s, described below, which may be accessed
	  using memory addresses -1 down to -4.

	* A vector of state variables, fetchable within the machine using negative
	  addresses -8 or less.

	* Stack-based operation, with a stack that grows downward, which shares
	  the main memory area with the code and data.

Every machine instruction shares the same addressing scheme, which packs an
unsigned 5-bit opcode and a signed 11-bit operand into a single 16-bit
instruction.


Registers
---------

The registers are are both readable and directly writable and are central to
the control flow and operation of the virtual machine.

They are:

* PC, the program counter, at memory location -1. It holds the address of the
  next instruction to be executed at any given moment. Operation of the
  machine proceeds by fetching the machine instruction at PC, incrementing
  PC, then processing the instruction.

* SP, the stack pointer, at memory location -2. It holdd the address of the
  top value on the stack. The stack grows downwards (i.e. the value of SP
  descends as the stack grows). At startup SP is initialized to point just
  past the end of main memory, and the stack is therefore empty.

* FP, the frame pointer register, at memory location -3. A small number of
  instructions add the value of FP to their operand to derive an address.
  This is intended to support allocation of space for variables on the stack,
  such as for function calls.

* AX, the auxilliary register, at memory location -4. While instructions that
  do have a result place that result on the stack, some instructions that
  have a auxilliary result place that auxilliary value in the AX register.


State Vector
------------

The state memory is accessed in the same way as the main memory, but using
negative addresses less than -7. It is readable but not writeable with the
operation of the machine such as the `store` instruction. Instead it is
passed for modification to a handler outside the VM itself using the `ext`
instruction.


Instruction Format
------------------

Every instruction is stored within a single 16-bit word. The instruction
consists of two parts:

* opcode: An unsigned 5-bit integer value
* immediate: A signed 11-bit integer value

The two are encoded in a 16 bit integer instruction by the bitwise operation:

	(immediate << 5) | opcode

The `immediate` value is used to compute the value of an `operand`, and the
`opcode` and `operand` together determine how the machine processes that
instruction.

If `immediate` is any (signed 11-bit) value other than -1024 or
-1023, then `opcode` simply takes on the value of `immediate` and the
 instrction maybe be said to be processed in "immediate mode".

In the case where the operand has value -1024 (hexadecimal -0x400, called
`STACK_MODE_TAG`), before executing the instruction, the top value is popped
from the stack and used as `operand`. The instruction may then be said to be
processed in "stack mode".

	operand = MEMORY[SP++]

And finally, if the operand has value -1023 (hexadecimal -0x3FF, called
`INLINE_MODE_TAG`), the program counter is advanced by one, and the value
skipped over is used as the operand.

	operand = MEMORY[PC++]

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


Control Flow Instructions
-------------------------


### $0 halt

Halt program execution. The machine stops running. The operand is placed in
the AX register.


### $2 `jmp`

Unconditional branch.

In both the stack-addressed form and the inline-addressed form, `PC` takes on
the value of operand.

	PC = operand

In the case of an immediate operand, the operand is an offset from the current
value of `PC`:

	PC += operand

Note that since PC has already been incremented before the instruction is
executed, the increment to PC is relative to the instruction following the
`jmp`.


### $1 branch

Branch if popped value is nonzero. That is to say, if the value removed from
the top of the stack is not equial to zero, move program execution to the
address supplied by the operand, in the manner of `jmp`.

As with `jmp`, semantics differ between the immediate and stack-addressed
forms.

When stack addressing is used, the pseudocode is:

	if MEMORY[SP++] != 0 {
		PC = operand
	}

whereas with immediate addressing, it is:

	if MEMORY[SP++] != 0 {
		PC += operand
	}


### $10 assert

Assertion of expected equality.

If the value on the top of the stack does not equal the operand, throw an
exception.

	if MEMORY[SP] != operand {
		throw
	}

Note that the value is not removed from the stack; SP is not adjusted
(except as it may be in the stack-addressed form).


Stack and Memory Instructions
-----------------------------


### $A push

Push the operand onto the stack.

	MEMORY[--SP] = operand


### $B stack

Push the ensuing data onto the stack. The operand is the number of ensuing
code points that will be interpreted as data and pushed onto the stack. Of
course the program counter will be advanced beyond these memory locations.

	repeat `operand` times {
		MEMORY[--SP] = MEMORY[PC++]
	}

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
state variable which has operand as its address.

	tmp = MEMORY[SP]
	MEMORY[SP] = MEMORY[operand]
	MEMORY[operand] = tmp



### $E fetch

Fetch a value at a memory location and push it onto the stack.

	MEMORY[--SP] = MEMORY[operand]


### $F fetchlocal

Fetch a value from a memory location relative to the frame pointer register
and push it onto the stack.

	MEMORY[--SP] = MEMORY[FP + operand]


### $D peek

Fetch a value from somewhere on the stack and push it onto the stack.

	MEMORY[--SP] = MEMORY[SP + operand]

For example `peek 0` duplicates the top of the stack.



### $5 store

Pop a value from the stack and store it in memory.

	MEMORY[operand] = MEMORY[SP++]


### $6 storelocal

Pop a value from the stack and store it relative to the frame pointer register.

	MEMORY[FP + operand] = MEMORY[SP++]


### $15 poke

Pop a value from the stack and store it somewhere on the stack.

	MEMORY[SP + operand] = MEMORY[SP++]


Mathematical Instructions
-------------------------

### $10 unary

Apply a unary operation, in place, to the value at the top of the stack. The
operation is determined by the value of operand.

These are the valid unary operations. Here `x` represents the value on top of
the stack:

| Operand | Mnemonic   | Calculation
|---------|------------|--------------------
| $5      | sin        | x = sine(x) [^1]
| $4      | cos        | x = cosine(x)  [^1]
| $3      | tan        | x = tangent(x) [^1]
| $7      | log        | x = ln(x) [^1]
| $E      | exp        | x = e^x [^1]
| $6      | inv        | x = 32767 / x [^1]
| $1      | not        | x = x ? 0 : 1
| $B      | bool       | x = x ? 1 : 0
| $A      | abs        | x = abs(x)
| $9      | neg        | x = -x
| $C      | complement | x = ~x

For operations with inherently integer results:

	MEMORY[SP] = unaryOp(MEMORY[SP])

[^1]: For unary operations that in general give non-integer results, the
greatest integer less than the result is stored on the top of the stack, and
the fractional part is stored in AX, scaled by MAX_INT = 32767.

	MEMORY[SP] = floor(unaryOp(MEMORY[SP], operand))
	AX = frac(unaryOp(MEMORY[SP], operand)) * MAX_INT

The other unary operations leave the AX register undisturbed.


### Binary operations

All other math instructions are binary operations. All use a value at the top
of the stack as their first argument, and `operand` as their second argument.
The result is returned to the top of the stack.

All binary operations have a side effect that alters the AX register. Refer to
the list of binary operations for details.

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
(or 0 if no overflow). In the case of mul, this value may not fit in an
Int16.

[^3]: I.e. `top % operand`.

[^4]: The value returned is expressed in degrees. The stack gets the integral
part of that, so actually `floor(arctan(top/operand))`. The result is in the
range[-180, 180).

[^5]: As with unary operations with non-integer results, this is the
fractional part of the result scaled by MAX_INT, i.e. 32767.

[^6]: Logical operations treat zero as "false" and non-zero as "true". Nonzero
results are carried through, so, for example, for `or` we get:

	top = top | operand       ; bitwise
	AX = top ? top : operand  ; logical

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
VM. The handler must expose a function called `handleInstruction`, which the VM passes control to when processing the `ext` instruction.

The operand consists of two parts. The low-order 7 bits gives is an opaque
code passed to `handleInstruction` as the first parameters for it to
interpret, along with a handle to the state vector. The four high-order bits
give the number of additional arguments to pass to `handleInstruction`. These
are taken off the stack.

The value returned by `handleInstruction` is pushed back onto the stack.

	nargs = operand >> 7
	result = handleInstruction(operand & $7F, state, MEMORY[SP], MEMORY[SP+1],...)
	SP += nargs
	MEMORY[SP--] = result

The handler may affect the state vector however it sees fit.
