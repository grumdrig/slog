Slog Assembler Manual
=====================


The Slog assembler turns barely human-friendly assembly source code into very
computer-friendly Slog VM machine code.


Syntax
------

Identifiers consist of one or more identifier characters, which are
alphanumerals plus the underscore character and the dollar sign. However, the
first character may not be a numeral.

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

All instructions may be given in either of three forms:

	*opcode*

or

	*opcode* #

or

	*opcode* *operand*


The first is equivalent to the stack-mode form

	*opcode* -$400

which in the machine architecture causes that the operand is taken from the
stack rather than supplied as as immediate value within with the
instruction.

The second, with the symbol `#` following the opcode, is equivalent to

	*opcode* -$3FF

which signals inline mode, wherein the word following the instruction is used
as the operand.

In all other cases, the operand is a literal value, which is referred to as
immediate mode.


In all cases each assembly instruction generates a machine instruction, a
16-bit number, using the bitwise calculation:

 	opcode | (parameter << 5)

In the description of the effects on the stack of the instructions below, it
is assumed that if stack mode or inline mode is used, the operand has already
been read from the stack or main memory.

Descriptions of each instruction are given in the Slog VM manual.


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
followed by arbitrary assembly code (perhaps including other macro
expansions), until an`.end` directive is reached.

The macro may then be used in code, much like an instruction.

To give an example:

	.macro min x
		max x
		swap AX
	.end

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

Assembler directives provide some small level of convenience to the coder.
Case is not significant, so, for example, `.DATA` may be used in place of
`.data`.

### `.target` *name*

Name the target in which the assembled strategy is meant to execute. This
information may be used by other tools to run the strategy in its target
embedding.


### `.macro` *name* [*args*]

Begin a macro definition, with optional arguments. (See the section on
macros.)


### `.end`

End a macro definition.


### `.data` [data]

Values following the `.data` directive are emitted directly as machine code.
The data can be numeric values or symbolic values defined elsewhere, or may
be either of these with a repetition specifier of the form:

	*value* `*` *repetition*

which is equivalent to *value* repeated *repetition* number of times. For
example the following are equivalent:

	.data 20*3

	.data 20 20 20


### `.stack` *data*

The `.stack` directive uses the `stack` instruction to push a number of values
onto the stack, supplying the correct value to the `stack` instruction.

So for example the following are equivalent:

	.stack 10 20 30

	stack 3
	.data 10 20 30

Where possible (i.e. in the case that *data* is a single value, which in turn
is within the range of values representable as an immediate), the directive
is implemented as a `push` instruction.


### .jump and .branch

The `.jump` and `.branch` directives simplify using the `jmp` and `br`
instruction, which have different semantics depending on whether immediate
mode is used. So

	.jump *label*

and

	.branch *label*

Generate `jmp` or `br` instructions in whichever mode is appropriate to the
distance of the branch.



