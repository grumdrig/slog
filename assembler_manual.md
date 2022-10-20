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

Hexadecimal numeric literals consist of: an optional sign, followed by the `$`
character, followed by one or more hexadecimal numerals (`0`-`9`, `a`-`f`,
and `A`-`F`).

Each non-blank line of assembly source may contain an instruction, a label, a
macro, a constant definition, or an assembler directive, each of which are
described below. Each line may contain no more than one of these, and
whitespace must separate numeric literals and identifiers, but whitespace is
not otherwise significant.

A semicolon `;` begins a comment; it, and the characters following it, are
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

Descriptions of each instruction are given in the PQVM manual.


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

In the case that *data* is a single value, which in turn is representable as
an immediate, or in other words, if possible, the directive is implemented as
a `push` instruction.
