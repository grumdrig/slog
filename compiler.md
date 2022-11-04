Compiler Manual
===============

The compiler compiles the language it compiles. The language is compiled by
the compiler. None of these things have names.

The output of the compiler is assembly language. The assembler is used with
the assembly code to produce machine code. The machine code is loaded by the
virtual machine, which executes it. None of these things have names either.

Or maybe we're calling everything "Slog".

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

	assert gcd(12, 15) == 3


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
16-bit integer ("Int16"), so the only literals recognized by the compiler are
Int16s, and vectors of them. They may be specified in decimal form with an
optional sign, so that the following are valid numeric literals:

	26, -3, 0, 30000, +32

They may also be given in hexadecimal form by prededing them with a dollar
sign '$' character, like these:

	$1ff $0 -$50 +$BAD


Vectors
-------

Literal vectors are written by enclosing a sequence of comma-separated values
in brackets, like so:

	[1, 2, 3, $44, -100, 2 * pi, angle]

However, there are no vectors of vectors. Vectors only contain Int16s, and
expressions within vector literals must by resolvable to numbers at compile
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

A double-quoted string is equivalent to an vector literal, with an implied 0 at
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

Not all of them have a use in the language.


Language Structure
==================

A module, or file, is a single block of text, consisting of declarations,
definitions, and executable statements.


Variables
=========

Variables are declared with `var` followed by their name, with an optional
initializer.

	var x = 6
	var y
	var z = fibonacci(16)

Absent an initialzier, variables are initialized to 0 in the global scope, but
if declared within a function their initial value is undefined.


Vectors
=======

Vectors are a number of consecutive numeric values in memory. The may be
declared and initialized in a few different ways, demonstrated here:

	var a = [1, 2, 3]  // in memory: [1, 2, 3]
	var b[3]           // in memory: [?, ?, ?] (see below)
	var c[3] = 4       // in memory: [4, 4, 4]
	var d[3] = [5,6,7] // in memory: [5, 6, 7] (but see below)

If a vector length and a vector initializer are both given, as in the last
example, the lengths must match.

In the no-initializer case as with `b` above, the memory is initialized to 0
for global variables, but has undefined initial values within the scope of a
function.

The elements of a vector may be accessed by appending an index within
brackets. Indices are zero-based.

	assert a[1] = 2
	assert a[a[1]] = 3
	a[0] = 10
	assert a[0] == 10

Array indexing works on any expression, if you want to get into trouble. E.g.
`0[0]` is the first word in main memory. Jump program execution to address
100 with `(-1)[0] = 100` if you dare.


Looping Statement
=================

There is a single looping statement in the language, the while loop. It has
the form

`while` *condition-expr* `{` *code-block* `}`

It operates by repeatedly executing *code-block* as long as *condition-expr*
evaluates to non-zero.

The while loop can be exited using a `break` statement (or a `return`
statement, if inside of a function).

	var factorial = 1
	var n = 10
	while n > 1 {
		factorial *= n
		n -= 1
		if factorial > 15000 {
			// getting too big
			break
		}
	}


Conditional Statement
=====================

The conditional statement executes a block of code if a condition holds (that is, if *condition-expr* evaluates to a non-zero number), and optionally, another block of code otherwise.

`if` *condition-expr* `{` *code-block* `}` [`else` `{` *code-block* `}`]

if the optional *else-clause* is another if statement, the '{' '}' braces can be omitted, like so:

	if x < 0 {
		sign = -1
	} else if x > 0 {
		sign = 1
	} else {
		sign = 0
	}


Functions
=========

Functions may be defined using the `func` keyword and an identifier to name
the function. A parenthesized, comma-separated parameter list follows, then a
block of code which is executes when the function is called.

The function is called by passing a parenthesized list of comma-separated
arguments to the function.

For example:

	func factorial(x) {
		if x <= 1 {
			return x
		} else {
			return x * factorial(x - 1)
		}
	}

	assert factorial(3) == 6

Rather than a brace-enclosed block of code, a single expression may stand in
as the function body. In this case, the value of the expression is implicitly
returned by the function. For example:

	func factorialAlso(x) x <= 1 && 1 || x * factorialAlso(x - 1)

All functions return a number. Absent an explicit `return` statement, a value
of zero will be returned when execution reaches the end of the code block.


Macros
======

Macro definitions exactly mirror those of functions, except that the keyword
`macro` is used in place of `func`. Macros differ from function in that the
body replaces the macro call, at that point in the code, rather than jumping
to another portion of code where the function body resides.


Expressions
===========

The usual expresion rules from C-like languages apply. Besides literal values,
expressions can use parentheses to group operators, which may be prefix,
infix and postfix operations.


Prefix Operators
================

| Operator | Meaning                                    |
|----------|--------------------------------------------|
| `+`      | Positive sign (essentially, no effect)     |
| `-`      | Arithmetic negation                        |
| `~`      | Bitwise complement                         |
| `!`      | Logical negation (0 if non-zero, else 1)   |
| `&`      | Address-of (memory location of expression) |
| `*`      | Derefence (value at memory location)       |
| `.`      | State vector access                        |

The `&` address-of operator only applies to addressible expressions: variables
and vector-index expressions.


Infix Operators
===============


| Operator | Meaning                     |
|----------|-----------------------------|
| `**`     | Power                       |
| `%%`     | Root                        |
| `*`      | Multiplication              |
| `/`      | Division                    |
| `%`      | Remainder                   |
| `+`      | Addition                    |
| `-`      | Subtraction                 |
| `<?`     | Minimum                     |
| `>?`     | Maximum                     |
| `<<`     | Bit shift left              |
| `>>`     | Bit shift right             |
| `&`      | Bitwise and                 |
| `^`      | Bitwise xor                 |
| `\|`      | Bitwise or                  |
| `<`      | Less than                   |
| `<=`     | Less than or equal to       |
| `>`      | Greater than                |
| `>=`     | Greater than or equal to    |
| `==`     | Equal to                    |
| `!=`     | Not equal to                |
| `&&`     | Logical and                 |
| `^^`     | Logical xor                 |
| `\|\|`     | Logical or                  |
| `=`      | Assignment                  |
| `+=`     | Increment                   |
| `-=`     | Decrement                   |
| `*=`     | Multiplication-assignment   |
| `/=`     | Division-assignment         |
| `%=`     | Remainder-assignment        |
| `<<=`    | Bit-shift-left-assignment   |
| `>>=`    | Bit-shift-right-assignment  |
| `&=`     | Bitwise-and-assignment      |
| `^=`     | Bitwise-xor-assignment      |
| `\|=`     | Bitwise-or-assignment       |

Most of these will be familiar to most programmers.

The `<?` minimum and `>?` maximum operators are probably self-explanatory.

The `%%` root operator calculates nth root, so for `x %% y`, the result is `x`
to the `1/y`th power, as an integer.

Of course the assignment and operator-assignment operators can only have
addressible expression on their left hand side: variables and vector index
expressions.


State Variables and the External Function
=========================================

Per the design of the Slog virtual machine, Slog programs have access to the
game in which they are embedded in two ways: external function calls, and
access to state variables.

The state variables are read-only within the program. They are accessed with
the state-access operator `.` followed by a state variable index. The valid
indices will normally be defined as constants using an interface published by
the embedding game.

So for example:

	const LIVES = $20  // interface definition

	if .LIVES == 1 {
		// Oh no! Need to be more careful.
		activateCarefulMode()
	}

The external function call is a special function named `external`, the first
parameter of which is an opaque code number defining the effect of the
function call. The call is dispatched to the embedding game or application.

The embedding game should provide macro definitions give semantic meaning to
the code numbers. So:

	// Interface definition:
	macro hunt(quarry) external(135, quarry)
	macro eat(quarry) external(136, quarry)
	const HUNGER = 10
	const RABBITS = 11

	// Player logic:
	if .HUNGER > 0 {
		hunt(RABBITS)
		if .RABBITS > 0 {
			eat(RABBITS)
		}
	}



Grammar
=======

The nitty gritty.

	module := (constant-definition | variable-declaration | function-definition | external-definition | statement)*

	constant-definition := 'const' identifier '=' expr

	variable-declaration := 'var' identifier ('[' expr ']')? ('=' expr)

	function-definition := 'func' function-def-tail

	function-def-tail := identifier '(' function-parameter-list? ')' function-body

	function-body := '{' code-block '}' | expr

	function-parameter-list := identifier (',' function-parameter-list)?

	code-block := (constant-definition | variable-declaration | statement)*

	macro-definition := 'macro' function-def-tail

	statement := while-statement | if-statement | expression-statement | return-statement | break-statement | halt-statement | assertion-statement

	while-statement := 'while' expr '{' code-block '}'

	if-statement := 'if' expr '{' code-block '}' else-clause?

	else-clause := 'else' ('{' code-block '}' | if-statement)

	expression-statement := expr

	return-statement := 'return' expr

	break-statement := 'break'

	halt-statement := 'halt'

	assertion-statement := 'assert' expr

	expr := atomic-expression (postfix-operation)* (binary-operator expr)?

	atomic-expression := number | indentifier | vector-literal | '(' expr ')' | prefix-expression | external-function-expression | external-index-expression

	prefix-expression := ('+' | '-' | '~' | '!' | '&' | '*' | '.') expr

	postfix-operation := function-call-operation | vector-index-operation

	function-call-operation := '(' argument-list? ')'

	vector-index-operation := '[' expr ']'

	binary-operator := '**' | '%%' | '*' | '/' | '%' | '+' | '-' | '<?' | '>?' | '<<' | '>>' | '&' | '^' | '|' | '<' | '<=' | '>' | '>=' | '==' | '!=' | '&&' | '^^' | '||' | '=' | '+=' | '-=' | '*=' | '/=' | '%=' | '<<=' | '>>=' | '&=' | '^=' | '|='

	external-function-expression := 'external' '(' argument-list ')'

	argument-list := expr (',' argument-list)?

	number := /[$][\da-f]+/i | /\d+/

	identifier := /[a-z_]\w*/i
