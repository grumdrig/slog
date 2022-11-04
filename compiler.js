#!/usr/bin/env node

class ParseError {
	message;
	constructor(message, location) { this.message = message }
}


class Source {
	lexemes = [];
	// Lexemes are { line_no, text, TYPE } plus maybe a numeric value

	constructor(...texts) {
		for (let text of texts)
			this.process(text);
	}

	process(text) {
		let comment = 0;
		let lines = text.split('\n');
		lines.forEach((line, l) => {
			let line_no = l + 1;
			line = line.split('//')[0];

			function take(re) {
				let result = line.match(re);
				if (result) {
					result = result[0];
					line = line.substr(result.length);
					return result;
				}
			}

			while (true) {
				line = line.trim();
				if (line.length === 0) break;

				let lexeme = { line_no };

				if (lexeme.text = take(/^[$][\da-f]+/i)) {
					lexeme.literal = true;
					lexeme.value = parseInt(lexeme.text.substr(1), 16);
				} else if (lexeme.text = take(/^\d+/)) {
					lexeme.literal = true;
					lexeme.value = parseInt(lexeme.text);
				} else if (lexeme.text = take(/^[a-z_]\w*/i)) {
					lexeme.identifier = true;
				} else if (lexeme.text = take(/^'.+?'/)) {
					lexeme.character = true;
				} else if (lexeme.text = take(/^".+?"/)) {
					lexeme.string = true;
				} else if (lexeme.text = take(/^[-+=<>*/%^&|!?]+/)) {
					lexeme.operator = true;
				} else if (lexeme.text = take(/^[.,~@#(){}[\]]/)) {
					lexeme.punctuation = true;
				} else if (!comment) {
					this.error(`unrecognized character al line ${line_no}: '${line[0]}'`);
				}

				if (lexeme.text === '/*') comment += 1;

				if (!comment) {
					this.lexemes.push(lexeme);
				}

				if (lexeme.text === '*/') {
					comment -= 1;
					if (comment < 0) this.error('unmatched block comment ender')
				}
			}
		});
	}

	consume(...tokens) {
		if (!this.tryConsume(...tokens)) this.error(`expected '${tokens.join(' ')}'`);
	}

	consumeIdentifier() {
		if (!this.isIdentifier()) this.error('identifier expected');
		return this.next().text;
	}

	consumeLiteral() {
		if (!this.lexemes[0].literal) this.error('literal value expected');
		return this.next().value;
	}

	tryConsume(...tokens) {
		if (!this.lookahead(...tokens)) return false;
		this.lexemes = this.lexemes.slice(tokens.length);
		return true;
	}

	empty() { return !this.lexemes.length }

	lookahead(...tokens) {
		if (this.lexemes.length < tokens.length) return false;
		for (let i = 0; i < tokens.length; ++i) {
			if (typeof tokens[i] === 'string') {
				if (tokens[i] !== this.lexemes[i].text) return false
			} else {
				for (let tag in tokens[i]) {
					if (!this.lexemes[i][tag]) return false;
				}
			}
		}
		return true;
	}

	peek() {
		if (this.empty()) return;
		return this.lexemes[0].text;
	}

	isIdentifier() {
		return this.lexemes[0].identifier;
	}

	isLiteral() {
		return this.lexemes[0].literal;
	}

	next() {
		if (!this.lexemes.length) {
			this.error('unexpected end of file');
		}
		return this.lexemes.shift();
	}

	error(message) {
		throw new ParseError(`${message} on line ${this.lexemes[0].line_no} at '${this.lexemes[0].text}'`);
	}
}


uniqueLabel.UNIQUE = 1;
function uniqueLabel(realm) {
	return `@${realm || ''}_${uniqueLabel.UNIQUE++}`;
}



class CompilationContext {
	symbols = {};
	parent;

	constructor(parent) {
		this.parent = parent;
		if (!parent) {
			this.code = [];
			this.unique = 1;
		}
	}

	enclosingScope() { return (this.function && this) || (this.parent && this.parent.enclosingScope()) }

	lookup(id) { return this.symbols[id] || (this.parent && this.parent.lookup(id)) }

	defineConstant(identifier, value) {
		if (this.symbols[identifier]) this.error('duplicate definition of ' + identifier);
		this.symbols[identifier] = { constant: true, value };
	}

	defineAlias(identifier, value) {
		if (this.symbols[identifier]) this.error('duplicate definition of ' + identifier);
		this.symbols[identifier] = { alias: true, value };
	}

	declareVariable(identifier, count, initializer) {
		let result;
		if (!this.parent) {
			// Global declaration
			this.emit(identifier + ':');
			if (Array.isArray(initializer))
				this.emit('.data ' + initializer.join(' ') + '  ; ' + identifier);
			else
				this.emit('.data ' + (initializer || 0) + (count == 1 ? '' : ' * ' + count) + '  ; ' + identifier);
			this.symbols[identifier] = result = { variable: true, static: true, identifier };
		} else {
			// Stack declaration
			let scope = this.enclosingScope();
			this.assert(scope, "no enclosing scope"); // seems impossible
			// FP points at OLD_FP. Then come arguments, then local vars
			let offset = -1;// - scope.function.parameters.length;
			for (let i in scope.symbols) offset -= scope.symbols[i].count;
			scope.symbols[identifier] = result = { variable: true, local: true, identifier, offset, count, initializer };
		}
		return result;
	}

	declareFunction(declaration) {
		this.symbols[declaration.name] = { function: declaration };
	}

	emit(s) { this.parent ? this.parent.emit(s) : this.code.push(s) }

	// link() {
	// 	for (let f in forwards) {
	// 		this.code[forwards[f]] = this.symbols[f];  // or something
	// 	}
	// }

	error(message) { throw new SemanticError(message) }
	assert(cond, mess) { if (!cond) this.error(mess) }
}

class SemanticError {
	message;
	constructor(m) { this.message = m }
}

class Module {
	constants = [];
	variables = [];
	macros = [];
	functions = [];
	statements = [];

	static parse(source) {
		let result = new Module();
		while (!source.empty()) {
			let item;
			if (item = ConstantDefinition.tryParse(source)) {
				result.constants.push(item);
			} else if (item = VariableDeclaration.tryParse(source)) {
				result.variables.push(item);
			} else if (item = MacroDefinition.tryParse(source)) {
				result.macros.push(item);
			} else if (item = FunctionDefinition.tryParse(source)) {
				result.functions.push(item);
			} else {
				result.statements.push(Statement.parse(source));
			}
		}
		return result;
	}

	generate() {
		let context = new CompilationContext();

		context.emit('.jump @main');

		for (let d of this.constants) d.define(context);
		for (let d of this.variables) d.declare(context);
		for (let d of this.macros)    d.declare(context);
		for (let d of this.functions) d.declare(context);

		for (let d of this.functions) d.generate(context);

		context.emit('@main:');
		for (let d of this.statements) d.generate(context);

		return context;
	}
}

class ConstantDefinition {
	name;
	value;

	static tryParse(source) {
		if (!source.tryConsume('const')) return false;
		let result = new ConstantDefinition;
		result.name = source.consumeIdentifier();
		source.consume('=');
		result.value = Expression.parse(source);
		return result;
	}

	define(context) {
		context.defineConstant(this.name, this.value.simplify(context));
	}
}

class VariableDeclaration {
	name;

	static tryParse(source) {
		if (!source.tryConsume('var')) return false;
		let result = new VariableDeclaration();
		result.name = source.consumeIdentifier();
		if (source.tryConsume('[')) {
			result.count = Expression.parse(source);
			source.consume(']');
		}
		if (source.tryConsume('=')) {
			result.initializer = Expression.parse(source);
		}
		return result;
	}

	declare(context) {
		let count = 1, initializer;
		if (this.count) {
			let c = this.count.simplify(context);
			count = c.literal ?? context.error('literal array length expected');
		}
		if (this.initializer) {
			let i = this.initializer.simplify(context);
			initializer = i.members || i.literal;
			if (typeof i.literal === 'number') {
				initializer = i.literal;
			} else if (i.members) {
				initializer = i.members.map(m => {
					if (typeof m.literal !== 'number')
						context.error('literal array initializer expected');
					return m.literal;
				});
				if (this.count && count !== initializer.length)
					context.error('array length mismatch with initializer');
				count = initializer.length;
			} else {
				context.error('literal initializer expected');
			}
		}
		let record = context.declareVariable(this.name, count, initializer);

		if (record.local) {
			context.emit(`.stack ${record.initializer || 0}${record.count !== 1 ? '*' + record.count : ''}  ; declare ${record.identifier}`);
		}
	}
}


class MacroDefinition {
	name;
	parameters = [];
	body;
	expr;

	static tryParse(source) {
		if (!source.tryConsume('macro')) return;
		let result = new MacroDefinition().continueParsing(source);
		result.macro = true;
		return result;
	}

	continueParsing(source) {
		this.name = source.consumeIdentifier();
		source.consume('(');
		if (!source.tryConsume(')')) while (true) {
			this.parameters.push(source.consumeIdentifier());
			if (source.tryConsume(')')) break;
			source.consume(',');
		}
		if (source.tryConsume('{')) {
			this.body = CodeBlock.parse(source);
			source.consume('}');
		} else {
			this.expr = Expression.parse(source);
		}
		return this;
	}

	// TODO declare or define? pick one
	declare(context) {
		context.declareFunction(this);
	}

	generateCall(context, args) {
		context = new CompilationContext(context);
		args.map((arg, i) => context.defineAlias(this.parameters[i], arg));
		if (this.body) {
			context.emit(uniqueLabel(this.name) + ':');
			context.function = this;
			context.macroReturnLabel = uniqueLabel(this.name + '_return');
			this.body.generate(context);
			if (!this.body.endsWithReturn())
				context.emit('push 0  ; default macro return value');
			context.emit(context.macroReturnLabel + ':');
		} else {
			this.expr.generate(context);
		}
	}

	generateReturn(context) {
		context.emit('.jump ' + context.enclosingScope().macroReturnLabel);
	}
}


class FunctionDefinition extends MacroDefinition {

	static tryParse(source) {
		if (!source.tryConsume('func')) return;
		return new FunctionDefinition().continueParsing(source);
	}

	stackFrameSize() { return this.parameters.length }

	generate(context) {
		context.emit(this.name + ':');
		context = new CompilationContext(context);
		this.parameters.forEach((parameter, i) => {
			context.symbols[parameter] = { variable: true, local: true, offset: -i - 1, count: 1 };
		});
		if (this.body) {
			context.function = this;
			this.body.generate(context);
			if (!this.body.endsWithReturn())
				this.generateReturn(context, false);
		} else {
			this.expr.generate(context);
			this.generateReturn(context, true);
		}
	}

	generateCall(context, args) {
		const returnLabel = uniqueLabel('return');
		context.emit(`.stack 0 ${returnLabel}  ; result, returnAddr`);
		context.emit('fetch FP');
		for (let a of args) { a.generate(context) }
		// now position FP right before the arguments
		context.emit('fetch SP');
		if (args.length)
			context.emit('add ' + args.length);
		context.emit('store FP');  // set frame pointer
		context.emit('.jump ' + this.name);
		// stack: ..., RESULT, RETURN_ADDRESS, OLD_FP, ARGS... ]
		context.emit(returnLabel + ':')
	}

	generateReturn(context, setResult) {
		if (setResult)
			context.emit('storelocal 2  ; result');
		context.emit('fetch FP');
		context.emit('store SP');
		context.emit('store FP');
		context.emit('jmp  ; return');
	}
}

class CodeBlock {
	constants = [];
	variables = [];
	statements = [];

	static parse(source) {
		let result = new CodeBlock();
		while (!source.lookahead('}')) {
			let item;
			if (item = ConstantDefinition.tryParse(source)) {
				result.constants.push(item);
			} else if (item = VariableDeclaration.tryParse(source)) {
				result.variables.push(item);
			} else {
				result.statements.push(Statement.parse(source));
			}
		}
		return result;
	}

	endsWithReturn() {
		return this.statements[this.statements.length - 1] instanceof ReturnStatement
	}

	generate(context) {
		context = new CompilationContext(context);
		for (let d of this.constants) d.define(context);
		for (let d of this.variables) d.declare(context);
		for (let d of this.statements) d.generate(context);
	}
}

class Statement {  // namespace only
	static parse(source) {
		if (source.tryConsume('break')) {
			return new BreakStatement();
		} else if (source.tryConsume('halt')) {
			return new HaltStatement();
		} else if (source.tryConsume('return')) {
			return new ReturnStatement(Expression.parse(source));
		} else if (source.lookahead('while')) {
			return WhileStatement.parse(source);
		} else if (source.lookahead('if')) {
			return IfStatement.parse(source);
		} else if (source.lookahead('assert')) {
			return AssertionStatement.parse(source);
		} else {
			return new ExpressionStatement(Expression.parse(source));
		}
	}
}

class BreakStatement {
	generate(context) {
		let loopContext = context;
		while (!loopContext.breakLabel) {
			loopContext = loopContext.parent;
			if (!loopContext) context.error('no enclosing loop for break');
		}
		context.emit('.jump ' + loopContext.breakLabel);
	}
}

class ReturnStatement {
	value;

	constructor(value) {
		this.value = value;
	}

	generate(context) {
		this.value.simplify(context).generate(context);
		let func = context.enclosingScope().function;
		func.generateReturn(context, true);
	}
}

class HaltStatement {
	generate(context) {
		context.emit('halt 0');
	}
}

class ExpressionStatement {
	expression;
	constructor(expression) { this.expression = expression }

	generate(context) {
		this.expression.simplify(context);
		this.expression.generate(context);
		context.emit('adjust -1'); // throw away resulting value
	}
}

class WhileStatement {
	condition;
	body;

	static parse(source) {
		let result = new WhileStatement();
		source.consume('while');
		result.condition = Expression.parse(source);
		source.consume('{');
		result.body = CodeBlock.parse(source);
		source.consume('}');
		return result;
	}

	generate(context) {
		context = new CompilationContext(context);
		context.breakLabel = uniqueLabel('endwhile');

		let loopStartLabel = uniqueLabel('while');
		context.emit(loopStartLabel + ':');

		// Test loop condition
		this.condition.simplify(context).generate(context);
		context.emit('unary NOT');

		// Exit loop if it's false
		context.emit('.branch ' + context.breakLabel);

		this.body.generate(context);

		context.emit('.jump ' + loopStartLabel);

		context.emit(context.breakLabel + ':');
	}
}

class IfStatement {
	condition;
	ifbody;
	elsebody;  // could be either a block or an if statement

	static parse(source) {
		let result = new IfStatement();
		source.consume('if');
		result.condition = Expression.parse(source);
		source.consume('{');
		result.ifbody = CodeBlock.parse(source);
		source.consume('}');
		if (source.tryConsume('else')) {
			if (source.lookahead('if')) {
				elsebody = IfStatement.parse(source);
			} else {
				source.consume('{');
				elsebody = CodeBlock.parse(source);
				source.consume('}');
			}
		}
		return result;
	}

	generate(context) {
		let elseLabel = uniqueLabel('else');
		this.condition.simplify(context).generate(context);
		context.emit('unary NOT');
		context.emit('.branch ' + elseLabel);

		this.ifbody.generate(context);

		context.emit(elseLabel + ':');

		if (this.elsebody) this.elsebody.generate(context);
	}
}

class AssertionStatement {
	test;

	static parse(source) {
		source.consume('assert');
		let result = new AssertionStatement();
		result.test = Expression.parse(source);
		return result;
	}

	generate(context) {
		this.test = this.test.simplify(context);
		this.test.generate(context);
		context.emit('unary NOT');
		context.emit('assert 0');
		context.emit('adjust -1');
	}
}

class Expression {
	static parse(source, precedence = 100) {
		let expr;
		if (source.tryConsume('(')) {
			expr = Expression.parse(source);
			source.consume(')');
		} else if (source.tryConsume('[')) {
			expr = new ArrayLiteralExpression();
			while (true) {
				expr.members.push(Expression.parse(source));
				if (source.tryConsume(']')) break;
				source.consume(',');
			}
		} else {
			expr = ExternalFunctionExpression.tryParse(source) ||
				   PrefixExpression.tryParse(source) ||
				   LiteralExpression.tryParse(source) ||
				   IdentifierExpression.tryParse(source);
		}
		if (!expr) source.error('expression expected');
		while (true) {
			expr = PostfixExpression.tryPostParse(expr, source);

			let binop = BinaryExpression.operators[source.peek()];
			if (binop && binop.precedence < precedence) {
				source.next();  // skip the operator
				expr = new BinaryExpression(expr, binop, Expression.parse(source, binop.precedence));
			} else {
				return expr;
			}
		}
	}
}


// Kind of unneccessary
class ExternalFunctionExpression {
	operand;
	arg1;
	arg2;

	static tryParse(source) {
		if (!source.tryConsume('external', '(')) return;
		let result = new ExternalFunctionExpression();
		result.operand = Expression.parse(source);
		if (source.tryConsume(',')) {
			result.arg1 = Expression.parse(source);
			if (source.tryConsume(',')) {
				result.arg2 = Expression.parse(source);
			}
		}
		source.consume(')');
		return result;
	}

	simplify(context) {
		this.operand = this.operand.simplify(context);
		if (this.arg1) this.arg1 = this.arg1.simplify(context);
		if (this.arg2) this.arg2 = this.arg2.simplify(context);
		return this;
	}

	generate(context) {
		this.simplify(context);  // needed?
		let operand = this.operand.literal;
		operand ?? context.error('literal value expected');
		context.assert(!!this.arg2 == (operand >= 200), 'two arguments expected');
		context.assert(!!this.arg1 == (operand >= 100), 'at least one argument expected');
		if (this.arg2) this.arg2.generate(context);
		if (this.arg1) this.arg1.generate(context);
		context.emit('ext ' + operand);
	}
}

class ArrayLiteralExpression {
	members = [];

	simplify(context) {
		this.members = this.members.map(a => a.simplify(context));
		return this;
	}
}

class LiteralExpression {
	literal;

	constructor(literal) {
		if (typeof literal !== 'number' || Number.isNaN(literal))
			throw "Invalid literal " + literal;
		this.literal = literal;
	}

	static tryParse(source) {
		if (!source.isLiteral()) return;
		return new LiteralExpression(source.consumeLiteral());
	}

	simplify(context) { return this }

	generate(context) {
		context.emit('.stack ' + this.literal);
	}
}

class IdentifierExpression {
	identifier;

	static tryParse(source) {
		if (!source.isIdentifier()) return;
		let result = new IdentifierExpression();
		result.identifier = source.consumeIdentifier();
		return result;
	}

	simplify(context) {
		let reference = context.lookup(this.identifier);
		return reference && reference.constant ? reference.value : this;
	}

	generate(context) {
		let reference = context.lookup(this.identifier);
		context.assert(reference, 'undefined identifier: ' + this.identifier);
		if (reference && reference.alias) {
			reference.value.generate(context);
		} else if (reference && !reference.static) {
			context.emit('fetchlocal ' + reference.offset + ' ; ' + this.identifier);
		} else {
			// hopefully global
			context.emit('fetch ' + this.identifier);
		}
	}

	generateAddress(context) {
		let reference = context.lookup(this.identifier);
		context.assert(reference, 'undefined identifier: ' + this.identifier);
		if (reference && reference.local) {
			// TODO should this be an opcode?
			context.emit('fetch FP  ; addr of...' );
			context.emit('add ' + reference.offset + '  ; ...' + this.identifier);
		} else {
			// hopefully global
			context.emit('.stack ' + this.identifier);
		}
	}
}

class PrefixExpression {
	operator;  // operator record from the list below
	rhs;       // Expression

	static operators = {
		'+': {
			precompute: x => x,
			generate: (context, rhs) => {
					rhs.generate(context);
				},
			},
		'-': {
			precompute: x => -x,
			generate: (context, rhs) => {
					rhs.generate(context);
					context.emit('unary NEG');
				},
			},
		'~': {
			precompute: x => ~x,
			generate: (context, rhs) => {
					rhs.generate(context);
					context.emit('unary COMPLEMENT');
				},
			},
		'!': {
			precompute: x => x ? 0 : 1,
			generate: (context, rhs) => {
					rhs.generate(context);
					context.emit('unary NOT');
				},
			},
		'*': {
			generate: (context, rhs) => {
					rhs.generate(context);
					context.emit('fetch');
				},
			},
		'&': {
			generate: (context, rhs) => {
					context.assert(rhs.generateAddress, "addressable expression expected");
					rhs.generateAddress(context);
				},
			},
		'.': {
			generate: (context, rhs) => {
					if (rhs.literal) {
						context.emit('fetch ' + (-8 - rhs.literal));
					} else {
						rhs.generate(context);
						context.emit('unary NEG');
						context.emit('sub 8');
						context.emit('fetch');
					}
				},
			}
	};

	constructor(operator, rhs) { this.operator = operator; this.rhs = rhs }

	static tryParse(source) {
		let op = PrefixExpression.operators[source.peek()];
		if (!op) return false;
		source.next(); // skip that op
		return new PrefixExpression(op, Expression.parse(source, 2));
	}

	simplify(context) {
		this.rhs = this.rhs.simplify(context);
		if (this.rhs.literal && this.operator.precompute)
			return new LiteralExpression(this.operator.precompute(this.rhs.literal));
		else
			return this;
	}

	generate(context) {
		this.operator.generate(context, this.rhs.simplify(context));
	}

}


function opassign(context, lhs, rhs, ...ops) {
	context.assert(lhs.generateAddress, "addressable expression expected");
	lhs.generateAddress(context); // [ &lhs ...
	context.emit('peek 0');       // [ &lhs, &lhs, ...
	context.emit('fetch');        // [ lhs, &lhs, ...
	rhs.generate(context);        // [ rhs, lhs, &lhs, ...
	ops.forEach(op => context.emit(op)) // [ result, &lhs, ...
	context.emit('peek 1');       // [ &lhs, result, &lhs, ...
	context.emit('store');        // [ &lhs, ...
	context.emit('fetch');        // [ result, ...
	// TODO now that i have swap, don't have to fetch the result - work that out
}


class BinaryExpression {
	lhs;
	operator;
	rhs;

	constructor(lhs, operator, rhs) { this.lhs = lhs; this.operator = operator; this.rhs = rhs }

	// Borrowing operators and precedence rules from C, except bitwise operators have higher
	// precedence than comparisons
	// TODO: associativity
	static operators = {
		'**': {
			precedence: 2.5,
			precompute: (x,y) => Math.pow(x, y),
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('pow');
			},
		},
		'%%': {  // would like to use // or */ but conflicts with notions of comments
			precedence: 2.5,
			precompute: (x,y) => Math.pow(x, 1/y),
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('pow');
				context.emit('swap AX');
			},
		},
		'*': {
			precedence: 3,
			precompute: (x,y) => x * y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('mul');
			},
		},
		'/': {
			precedence: 3,
			precompute: (x,y) => x / y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('div');
			},
		},
		'%': {
			precedence: 3,
			precompute: (x,y) => x % y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('div');
				context.emit('swap AX');
			},
		},
		'+': {
			precedence: 4,
			precompute: (x,y) => x + y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('add');
			},
		},
		'-': {
			precedence: 4,
			precompute: (x,y) => x - y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('sub');
			},
		},
		'<?': {
			precedence: 4.5,
			precompute: (x, y) => Math.min(x, y),
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('max  ; <?');
				context.emit('swap AX');
			},
		},
		'>?': {
			precedence: 4.5,
			precompute: (x, y) => Math.max(x, y),
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('max  ; >?');
			},
		},
		'<<': {
			precedence: 5,
			precompute: (x,y) => x << y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('unary NEG');
				context.emit('shift');
			},
		},
		'>>': {
			precedence: 5,
			precompute: (x,y) => x >> y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('shift');
			},
		},
		'&': {
			precedence: 5.08,
			precompute: (x,y) => x & y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('and');
			},
		},
		'^': {
			precedence: 5.09,
			precompute: (x,y) => x ^ y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('xor');
			},
		},
		'|': {
			precedence: 5.10,
			precompute: (x,y) => x | y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('or');
			},
		},
		'<': {
			precedence: 6,
			precompute: (x,y) => x < y ? 1 : 0,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('sub  ; <');
				context.emit('max 0');
				context.emit('swap AX');
			},
		},
		'<=': {
			precedence: 6,
			precompute: (x,y) => x <= y ? 1 : 0,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('sub  ; <=');
				context.emit('max 0');
				context.emit('unary NOT');
			},
		},
		'>': {
			precedence: 6,
			precompute: (x,y) => x > y ? 1 : 0,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('sub  ; >');
				context.emit('max 0');
			},
		},
		'>=': {
			precedence: 6,
			precompute: (x,y) => x >= y ? 1 : 0,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('sub  ; >=');
				context.emit('max 0');
				context.emit('swap AX');
				context.emit('unary NOT');
			},
		},
		'==': {
			precedence: 7,
			precompute: (x,y) => x == y ? 1 : 0,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('sub  ; ==');
				context.emit('unary NOT');
			},
		},
		'!=': {
			precedence: 7,
			precompute: (x,y) => x != y ? 1 : 0,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('sub  ; !=');
				context.emit('unary BOOL');
			},
		},
		'&&': {
			precedence: 11,
			precompute: (x,y) => x && y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('and  ; &&');
				context.emit('swap AX');
			},
		},
		'^^': {
			precedence: 12,
			precompute: (x,y) => (x && !y) || (!x && y) ? 1 : 0,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('xor  ; ^^');
				context.emit('swap AX');
			},
		},
		'||': {
			precedence: 13,
			precompute: (x,y) => x || y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('or  ; ||');
				context.emit('swap AX');
			},
		},
		'=': {
			precedence: 14,
			generate: (context, lhs, rhs) => {
				context.assert(lhs.generateAddress, "addressable expression expected");
				rhs.generate(context);
				context.emit('peek 0');
				lhs.generateAddress(context);
				context.emit('store');
			},
		},
		'+=': {
			precedence: 14,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'add'),
		},
		'-=': {
			precedence: 14,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'sub'),
		},
		'*=': {
			precedence: 14,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'mul'),
		},
		'/=': {
			precedence: 14,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'div'),
		},
		'%=': {
			precedence: 14,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'div', 'swap AX'),
		},
		'<<=': {
			precedence: 14,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'unary NEG', 'shift'),
		},
		'>>=': {
			precedence: 14,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'shift'),
		},
		'&=': {
			precedence: 14,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'and'),
		},
		'^=': {
			precedence: 14,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'xor'),
		},
		'|=': {
			precedence: 14,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'or'),
		},

	};

	simplify(context) {
		this.lhs = this.lhs.simplify(context);
		this.rhs = this.rhs.simplify(context);
		if (this.lhs.literal && this.operator.precompute && this.rhs.literal)
			return new LiteralExpression(this.operator.precompute(this.lhs.literal, this.rhs.literal));
		else
			return this;
	}

	generate(context) {
		this.operator.generate(context, this.lhs, this.rhs);
	}
}

class PostfixExpression {
	static tryPostParse(lhs, source) {
		let op;
		while (true) {
			if (source.tryConsume('(')) {
				lhs = new FunctionCallExpression(lhs);
				if (!source.tryConsume(')')) {
					while (true) {
						lhs.args.push(Expression.parse(source));
						if (source.tryConsume(')')) break;
						source.consume(',');
					}
				}
			} else if (source.tryConsume('[')) {
				lhs = new IndexExpression(lhs);
				lhs.index = Expression.parse(source);
				source.consume(']');
			} else {
				// Don't see a need for member access operator '.'
				return lhs;
			}
		}
	}
}

class FunctionCallExpression {
	lhs;
	args = [];

	constructor(lhs) { this.lhs = lhs }

	generate(context) {
		let func = this.lhs;
		if (func.identifier) {
			func = context.lookup(func.identifier) ?? context.error(func, 'unknown identifier ' + this.lhs.identifier);
		}
		func = func.function ?? context.error('attempt to call non-function');
		context.assert(func.parameters.length === this.args.length, `mismatch in number of arguments; expected ${func.parameters.length}, got ${this.args.length}`);

		func.generateCall(context, this.args);
	}

	simplify(context) {
		this.lhs = this.lhs.simplify(context);
		this.args = this.args.map(arg => arg.simplify(context));
		return this;
	}
}



class IndexExpression {
	lhs;
	index;

	constructor(lhs) { this.lhs = lhs }

	generateAddress(context) {
		this.lhs.generateAddress(context);
		this.index.generate(context);
		context.emit('add');
	}

	generate(context) {
		if (this.lhs.members) {
			context.error('array literal constant not available at runtime; use a var');
		} else {
			this.generateAddress(context);
			context.emit('fetch');
		}
	}

	simplify(context) {
		this.lhs = this.lhs.simplify(context);
		this.index = this.index.simplify(context);
		if (this.lhs.literal && this.index.literal) {
			return new LiteralExpression(this.lhs.literal + this.index.literal);
		} else if (this.lhs.members && this.index.literal) {
			if (this.index.literal < 0 || this.index.literal >= this.lhs.members.length)
				context.error('index out of range');
			return this.lhs.members[this.index.literal];
		} else {
			return this;
		}
	}
}


function compile(...texts) {
	let source = new Source(...texts);
	// console.log(source);

	let m = Module.parse(source);
	// console.log(m);

	let c = m.generate();

	return c.code.join('\n');
}

if (typeof exports !== 'undefined') {
	exports.compile = compile;
}


if (typeof module !== 'undefined' && !module.parent) {
	// Called with node as main module
	const { parseArgs } = require('util');
	const { readFileSync, writeFileSync } = require('fs');

	const { values: { output, interface }, positionals } = parseArgs({
		options: {
			output: {
				type: "string",
				short: "o",
			},
			interface: {
				type: 'string',
				short: 'i',
				multiple: true,
			},
		},
		allowPositionals: true,
	});

	let interfaces = (interface || []).map(filename => require(filename).Game.generateInterface());

	let sources = positionals.map(filename => readFileSync(filename, 'utf8'));

	let code;
	try {
		code = compile(...interfaces.concat(sources));
	} catch (e) {
		if (e instanceof ParseError) {
			console.error('Parse Error: ' + e.message);
		} else if (e instanceof SemanticError) {
			console.error('Semantic Error: ' + e.message);
		} else {
			console.error('Compilation Error: ' + e);
		}
		process.exit(-1);
	}

	if (output) {
		writeFileSync(output, code, 'utf8');
	} else {
		console.log(code);
	}
}
