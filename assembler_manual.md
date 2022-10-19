CHASM Assembler Manual
======================


The assembler turns barely human-friendly assembly source code into
computer-friendly CHASM machine code.


Syntax
------

Identifiers consist of one or more identifier characters, which are
alphanumerals plus the underscore character. However the first character may
not be a numeral.

Decimal numeric literals are an optional `+` or `-` sign, followed by one or
more numerals.

Hexadecimal numeric literals are an option sign, followed by the `$`
character, followed by one or more hexadecimal numerals (`0`-`9`, `a`-`f`,
and `A`-`F`).

Each non-blank line of assembly source may contain an instruction, a label, a
macro, a constant definition, or an assembler directive, each of which are
described below. Each line may contain no more than one of these, and
whitespace must separate numeric literals and identifiers, but whitespace is
not otherwise significant.

A semicolon `;` begins a comment; it and the characters following it are
ignored by the assembler.


Instructions
------------

All instructions may be given in either of two forms:

	*opcode*

or

	*opcode* *parameter*


The former is equivalent to the stack-addressed form

	*opcode* -$200

which in the machine architecture causes that the parameter is taken from the
stack rather than supplied as as immediate value within with the
instruction.

In either case each instruction in code generates a single machine
instruction, a 16-bit number, using the bitwise calculation:

 	opcode | (parameter << 6)

In description of the effects on the stack of the instructions below, it is
assumed that if stack-addressing is used, the parameter has already been
removed from the stack.

Descriptions of each instruction follow.

[However, these should be in the VM manual.]


## Control flow manipulation


### $0 halt

Halt program execution.


### $2 jump

Unconditional branch.


### $B branch

Branch if nonzero.

If the value removed from the top of the stack is not equial to zero, move program execution the the address supplied by the parameter.


### $3F assert

Assertion of expected equality.

If the value on the top of the stack does not equal the parameter, throw an
exception.


## Stack and memory


### $C push

Push a value onto the stack.


### $1C stack
  // push the ensuing data on the stack
  // .stack D1 D2 ... DN
  // stack N .data D1 D2 ... DN
  // ... => DN ... D1 ...

### $D sethi
  // set high 8 bits of top of stack
  // sethi X
  // ... S => ... ((X << 8) | (S & 0xFF))

### $9 adjust
  // remove/reserve values on the stack
  // adjust N
  // ... XN ... X1 => ... ; SP -= N
  // adjust
  // ... XN ... X1 N => ... ; SP -= N+1

### $E fetch
  // fetch a value at a memory location
  // fetch A
  // ... => ... [A] ; SP += 1
  // fetch
  // ... A => ... [A]

### $F fetchdata
  // fetchdata a value at a [distant] memory location
  // fetchdata A
  // ... => ... [DS + A] ; SP += 1
  // fetchdata
  // ... A => ... [DS + A]

### $5 store
  // set a value in memory
  // set A
  // ... X => ... ; [A] = X, SP -= 1
  // set
  // ... X A => ... ; [A] = X, SP -= 2

### $6 storedata
  // storedata a value in [distant] memory
  // storedata A
  // ... X => ... ; [DS + A] = X, SP -= 1
  // storedata
  // ... X A => ... ; [DS + A] = X, SP -= 2

### $1F peek
  // peek on the stack
  // peek A
  // ... => ... [SP + A] ; SP += 1
  // peek
  // ... A => ... [SP + A]

### $15 poke
  // poke a value in [distant] memory
  // poke A
  // ... X => ... ; [SP + A] = X, SP -= 1
  // poke
  // ... X A => ... ; [SP + A] = X, SP -= 2


## Math operations

### $10 unary
  // unary OP
  // ... X => ... OP(X)

### $20 max
  // max Y
  // ... X => ... max(X, Y)
  // max
  // ... X Y => ... max(X, Y) ; SP -= 1
### $21 min
### $22 add
### $23 sub
### $24 mul
### $25 atan2
### $26 pow
### $27 div' },  // AUX = mod(
  // bitwise
### $28 or
### $29 and
### $2A xor
### $2B shift
  // similar for these binary ops


## Gameplay


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



Labels
------

An identifier followed by a `:` defines a label, which symbolically refers to
an address. This can be used, for example, as the target of a `jump`
instruction, or as a reference to stored data. For example:

	jump MoreCode

	SomeData:
	.data 5

	MoreCode:

	fetch SomeData
	assert 5

As this example implies, labels may be used before (as well as after) they are
defined.


Macros
------

Macros provide a shorthand for a sequence of code that can be expanded
elsewhere in the assembler source. Arguments may be provided to change how
the code is expanded. Macros must be defined before they are used.

Macros are defined by the `.macro` directive, with optional parameters,
followed by arbitrary code (perhaps including other macro expansions), until
a `.end` directive is reached.

The macro may then be used in code, much like an instruction.

To give an example:

	.macro branch_if_greater Label
		sub
		min 0
		branch Label
	.end

	push 5
	push 4
	branch_if_greater OfCourseItIs
	halt  ; will not be reached
	OfCourseItIs:
	; code contiues


Constants
---------

Symbols may be given a numeric value and then used elsewhere in the code by
using the form:

	*name* `=` *value*

So, for example, the following are equivalent:

	push 7

	distance = 7
	push distance

A number of constants, such as opcode mnemonics, are pre-defined in the
assembler.


Directives
----------

Assembler directives provide some small level of convenience to the coder. Case is not significant, so, for example, `.DATA` may be used in place of `.data`.


### `.macro` *name* [*args*]

Begin a macro definition, with optional arguments. (See the section on
macros.)


### `.end`

End a macro definition.


### `.data` [data]

Values following the `.data` directive are emitted directly as machine code.
The data can be numeric values or symbolic values defined elsewhere, or may be either of these with a repetition specifier of the form:

	*value* `*` *repetitions*

which is equivalent *value* repeated *repetition* number of times. For example
the following are equivalent:

	.data 20*3

	.data 20 20 20


### `.stack` *data*

Uses the `stack` instruction to pushes a number of values onto the stack, but supplies the correct value to the `stack` instruction in a less error-prone way.

So for example the following are equivalent:

	.stack 10 20 30

	stack 3
	.data 10 20 30


