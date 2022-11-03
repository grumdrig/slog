Compiler Manual
===============

The compiler compiles the language it compiles. The language is compiled by
the compiler. None of these things have names.

The output of the compiler is assembly language. The assembler is used with
the assembly code to produce machine code. The machine code is loaded by the
virtual machine, which executes it. None of these things have names either.


Language
========

Source code that the compiler recognizes is written in the language. The
language is fairly simple, and somewhat C-like. There are no semicolons.

Here's an example:

	extern print(message) = $30
	print("Hello, world!")

Here's a more involved, but still not relevant, example, implementing Euclid's
algorithm:

	func gcd(a, b) {
		while a != b {
			if a > b {
				a = a - b
			} else {
				b = b - a
			}
		}
		return a
	}


Lexical Reference
=================

As the first step of compilation, the text file input is analyzed by the lexer
to produce a stream of lexemes, as per the following.


Comments
--------

Comment syntax is C-like.

The part of any line after the line comment marker `//` is ignored by the
lexer. Example:

	a = 5  // set a to this many

Any part of the source between the markers `/*` and `*/` is ignored by the lexer. These symbols can be nested. E.g.:

	/* this a comment /* deep in a comment */ comment is still going */


Identifiers
-----------

Identifiers are a familiar combination of alphanumerics and the underscore
character. Of course the first character can't be a numeral.


Numbers
-------

The target architecture of the language has only one data type, the signed
16-bit integer, so the only literals recognized by the compiler are such
integers ("Int16"s), and arrays of them. They may be specified in decimal
form with an optional sign, so that the follow are valid numeric literals:

	26, -3, 0, 30000, +32

They may also be given in hexadecimal form by prededing it with a dollar
sign '$' character, like these:

	$1ff $0 -$50 +$BAD


Arrays
------

Literal arrays are written by enclosing a sequence of comma-separated values
in brackets, like so:

	[1, 2, 3, $44, -100, 2 * pi, angle]

However, there are no arrays of arrays. Arrays only contain Int16's, and
expressions within array literals must by resolvable to numbers at compile
time.


Characters
----------

(Not implemented yet.)

A character encosed in single quites, a la:

	'c'  // equivalent to 99

is also an Int16, the ordinal of the character inside the single quotes.
However two characters may also appear inside the quotes, and the ordinals
are store in the low and high bytes of a single Int16. Thus:

	'hi' // equal to $6869


Strings
-------

(Not implemented yet.)

A double-quoted string is equivalent to an array literal, with an implied 0 at
the end. So the following are equivalent:

	"hello"

and

	[104, 101, 108, 108, 111, 0]


Operators
---------

Any number of operators characters juxtaposed are lexed as a single operator.
Many such operators are invalid in the language, so whitespace should be used
to separate operator character when separate operators are intended. Operator
characters are these:

	- + = < > * / % ^ & | ! ?


Punctuation
-----------

Punctuation character are always lexed singly, so don't need whitespace
separating them. The following are the punctuation characters:

	. , ~ @ # ( ) { } [ ]


Language Structure
==================

A module, or file, is a single block of text, consisting of declarations,
definitions, and executable statements.


Looping Statement
=================

There is a single looping statement in the language, the while loop. It has
the form

`while` *condition-expr* `{` *code-block* `}`

It operates by repeatedly executing *code-block* as long as *condition-expr*
evaluates to non-zero.


Conditional Statement
=====================


Grammar
=======


module = (const-definition | variable-declaration | function-definition | statement)*

statement = ...