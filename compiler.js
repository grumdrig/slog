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
				this.lexemes.push(lexeme);

				if (lexeme.text = take(/^[$][\da-f]+/i)) {
					lexeme.literal = true;
					lexeme.value = parseInt(lexeme.text.substr(1), 16);
				} else if (lexeme.text = take(/^\d+/)) {
					lexeme.literal = true;
					lexeme.value = parseInt(lexeme.text);
				} else if (lexeme.text = take(/^[a-z_]\w*/i)) {
					lexeme.identifier = true;
				} else if (lexeme.text = take(/^[-+=<>*/%^&|!]+/i)) {
					lexeme.operator = true;
				} else if (lexeme.text = take(/^[.,~@#(){}[\]]/i)) {
					lexeme.punctuation = true;
				} else {
					this.error(`unrecognized character al line ${line_no}: '${line[0]}'`);
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

	constructor(parent, functionDefinition) {
		this.parent = parent;
		if (!parent) {
			this.code = [];
			this.unique = 1;
		}

		if (functionDefinition) {
			this.function = functionDefinition;
			functionDefinition.parameters.forEach((parameter, i) => {
				this.symbols[parameter] = { variable: true, local: true, offset: -i - 1, count: 1 };
				// this.symbols['_return_position'] = { variable: true, local: true, offset: functionParameters.count + 1, count: 1 };
			});
		}
	}

	// define(symbol, info) {
	// 	if (this.symbols[symbol]) this.error('duplicate definition ' + symbol);
	// 	this.symbols[symbol] = info;
	// }

	enclosingScope() { return (this.function && this) || (this.parent && this.parent.enclosingScope()) }

	lookup(id) { return this.symbols[id] || (this.parent && this.parent.lookup(id)) }

	defineConstant(identifier, value) {
		if (this.symbols[identifier]) this.error('duplicate definition of ' + identifier);
		this.symbols[identifier] = { constant: true, value };
	}

	defineExternal(identifier, opcode, parameters) {
		if (this.symbols[identifier]) this.error('duplicate definition of ' + identifier);
		this.symbols[identifier] = { external: true, opcode, parameters };
	}

	declareVariable(identifier, count, initializer) {
		let result;
		if (!this.parent) {
			// Global declaration
			this.emit(identifier + ':');
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

	declareFunction(identifier, declaration) {
		this.symbols[identifier] = { function: true, parameters: declaration.parameters };
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
	externals = [];
	variables = [];
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
			} else if (item = ExternalDefinition.tryParse(source)) {
				result.externals.push(item);
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
		for (let d of this.externals) d.define(context);
		for (let d of this.variables) d.declare(context);
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
		// let decl = {
		// 	offset: context.symbols.length,
		// };
		if (this.count) {
			let c = this.count.simplify(context);
			if (typeof c.literal === 'undefined')
				context.error('literal array length expected');
			// decl.count = this.count.literal;
			count = c.literal;
		}
		// context.define(this.name, decl);
		if (this.initializer) {
			let i = this.initializer.simplify(context);
			if (typeof i.literal === 'undefined')
				context.error('literal initializer expected');
			initializer = i.literal;
		}
		let record = context.declareVariable(this.name, count, initializer);

		if (record.local) {
			context.emit(`.stack ${record.initializer || 0}${record.count !== 1 ? '*' + record.count : ''}  ; declare ${record.identifier}`);
		}
	}
}

class ExternalDefinition {
	name;
	parameters = [];  // ignored
	opcode;

	static tryParse(source) {
		if (!source.lookahead('external', {identifier:true})) return false;
		let result = new ExternalDefinition;
		source.consume('external');
		result.name = source.consumeIdentifier();
		if (source.tryConsume('(')) {
			if (!source.tryConsume(')')) while (true) {
				let param = source.isLiteral() ? source.consumeLiteral() : source.consumeIdentifier();
				result.parameters.push(param);
				if (source.tryConsume(')')) break;
				source.consume(',');
			}
		}
		if (result.parameters.length > 2) source.error("excess parameters in exteral definition; limit is two");
		source.consume('=');
		result.opcode = Expression.parse(source);
		return result;
	}

	define(context) {
		let opcode = this.opcode.simplify(context);
		context.assert(opcode.literal, "literal opcode value expected");
		context.defineExternal(this.name, this.opcode.literal, this.parameters);
	}
}

// Yeah I may want a 'func' keyword. We'll see. Also the parameter syntax is weird. Or maybe
// I should use juxtaposition for arguments as well.
class FunctionDefinition {
	name;
	parameters = [];
	body;

	static tryParse(source) {
		if (!source.tryConsume('func')) return;
		let result = new FunctionDefinition();
		result.name = source.consumeIdentifier();
		if (source.tryConsume('(')) {
			if (!source.tryConsume(')')) while (true) {
				result.parameters.push(source.consumeIdentifier());
				if (source.tryConsume(')')) break;
				source.consume(',');
			}
		}
		source.consume('{');
		result.body = CodeBlock.parse(source);
		source.consume('}');
		return result;
	}

	stackFrameSize() { return this.parameters.length }

	declare(context) {
		context.declareFunction(this.name, this);
	}

	generate(context) {
		context.emit(this.name + ':');
		context = new CompilationContext(context, this);
		// context.returnValueDepth = this.parameters.length + 1;
		// context.returnLabel = uniqueLabel(this.name + '_return');
		// for (let p of this.parameters) {
		// 	context.define(p);
		// }
		this.body.generate(context);

		this.generateReturn(context, false);
	}

	generateReturn(context, withResult) {
		if (withResult)
			context.emit('storelocal 2  ; result');
		context.emit('fetch FP');
		context.emit('store SP');
		context.emit('store FP');
		context.emit('store PC  ; return'); // aka jump
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
		if (!context.enclosingLoopExit()) context.error('no enclosing loop for break');
		context.emit('.stack ' + context.enclosingLoopExit());
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
		this.expression.simplify(context).generate(context);
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
		this.test = this.test.simplify();
		this.test.generate(context);
		context.emit('unary NOT');
		context.emit('assert 0');
		context.emit('adjust -1');
	}
}

class Expression {
	static parse(source, precedence = 100) {
		if (source.tryConsume('(')) {
			let result = Expression.parse(source);
			source.consume(')');
			return result;
		}
		let lhs =
			ExternalFunctionExpression.tryParse(source) ||
			ExternalIndexExpression.tryParse(source) ||
			PrefixExpression.tryParse(source) ||
			LiteralExpression.tryParse(source) ||
			IdentifierExpression.tryParse(source);
		if (!lhs) source.error('expression expected');
		lhs = PostfixExpression.tryPostParse(lhs, source);
		let binop = BinaryExpression.operators[source.peek()];
		if (binop && binop.precedence < precedence) {
			let result = new BinaryExpression();
			result.lhs = lhs;
			result.operator = binop;
			source.next();
			result.rhs = Expression.parse(source, binop.precedence);
			return result;
		} else {
			return lhs;
		}
	}
}


class ExternalFunctionExpression {
	opcode;
	arg1;
	arg2;

	static tryParse(source) {
		if (!source.tryConsume('external', '(')) return;
		let result = new ExternalFunctionExpression();
		result.opcode = Expression.parse(source);
		source.consume(')');
		source.consume('(');
		result.arg1 = Expression.parse(source);
		source.consume(',');
		result.arg2 = Expression.parse(source);
		source.consume(')');
		return result;
	}

	simplify(context) {
		this.opcode = this.opcode.simplify(context);
		this.arg1 = this.arg1.simplify(context);
		this.arg2 = this.arg2.simplify(context);
		return this;
	}

	generate(context) {
		this.simplify(context);  // needed?
		context.assert(this.opcode.literal, 'literal value expected');
		this.arg1.generate(context);
		this.arg2.generate(context);
		context.emit('ext' + this.opcode.literal.toString(16));
	}
}

class ExternalIndexExpression {
	index;

	static tryParse(source) {
		if (!source.tryConsume('external', '[')) return;
		let result = new ExternalIndexExpression();
		result.index = Expression.parse(source);
		source.consume(']');
		return result;
	}

	simplify(context) {
		this.index = this.index.simplify(context);
		return this;
	}

	generate(context) {
		this.simplify(context); //?
		context.assert(this.index.literal);
		context.emit('fetch ' + -this.index.literal);
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
		if (reference && !reference.static) {
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
			precompute: x => !x,
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
	context.assert(lhs.generateAddress, "addressable variable expected");
	lhs.generateAddress(context); // [ &lhs ...
	context.emit('peek 0');       // [ &lhs, &lhs, ...
	context.emit('fetch');        // [ lhs, &lhs, ...
	rhs.generate(context);        // [ rhs, lhs, &lhs, ...
	ops.forEach(op => context.emit(op)) // [ result, &lhs, ...
	context.emit('peek 1');       // [ &lhs, result, &lhs, ...
	context.emit('store');        // [ &lhs, ...
	context.emit('fetch');        // [ result, ...
}


class BinaryExpression {
	lhs;
	operator;
	rhs;

	// borrowing operators and precedence rules from C
	// TODO: associativity
	static operators = {
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
				context.emit('mod');
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
		'<': {
			precedence: 6,
			precompute: (x,y) => x < y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('sub');
				context.emit('min 0');
			},
		},
		'<=': {
			precedence: 6,
			precompute: (x,y) => x <= y,
			generate: (context, lhs, rhs) => {
				rhs.generate(context);
				lhs.generate(context);
				context.emit('sub');
				context.emit('max 0');
			},
		},
		'>': {
			precedence: 6,
			precompute: (x,y) => x > y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('sub');
				context.emit('max 0');
			},
		},
		'>=': {
			precedence: 6,
			precompute: (x,y) => x >= y,
			generate: (context, lhs, rhs) => {
				rhs.generate(context);
				lhs.generate(context);
				context.emit('sub');
				context.emit('min 0');
			},
		},
		'==': {
			precedence: 7,
			precompute: (x,y) => x == y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('sub');
				context.emit('unary NOT');
			},
		},
		'!=': {
			precedence: 7,
			precompute: (x,y) => x != y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('sub');
				context.emit('unary BOOL');
			},
		},
		'&': {
			precedence: 8,
			precompute: (x,y) => x & y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('unary AND');
			},
		},
		'^': {
			precedence: 9,
			precompute: (x,y) => x ^ y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('unary XOR');
			},
		},
		'|': {
			precedence: 10,
			precompute: (x,y) => x | y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('unary OR');
			},
		},
		'&&': {
			precedence: 11,
			precompute: (x,y) => x && y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				context.emit('unary BOOL');
				rhs.generate(context);
				context.emit('unary BOOL');
				context.emit('and');
			},
		},
		'^^': {
			precedence: 12,
			precompute: (x,y) => x || y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				context.emit('unary BOOL');
				rhs.generate(context);
				context.emit('unary BOOL');
				context.emit('xor');
			},
		},
		'||': {
			precedence: 13,
			precompute: (x,y) => x || y,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				context.emit('unary BOOL');
				rhs.generate(context);
				context.emit('unary BOOL');
				context.emit('or');
			},
		},
		'=': {
			precedence: 14,
			generate: (context, lhs, rhs) => {
				context.assert(lhs.generateAddress, "addressable variable expected");
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
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'mod'),
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
	lhs;
	operator;
	args = [];

	static operators = {
		'(': {
			// Function call
			closer: ')',
			generate: (context, lhs, args) => {
				let func = lhs;
				if (func.identifier) {
					func = context.lookup(func.identifier);
					context.assert(func, 'unknown identifier ' + lhs.identifier);
				}
				if (func.external) {
					let named_params = func.parameters.filter(p => typeof p !== 'number').length;
					context.assert(named_params === args.length, `mismatch in number of arguments; expected ${named_params}, got ${args.length}`);
					for (let a of args) a.generate(context);
					if (args.length < 2) {
						let inst = '.stack ';
						if (args.length == 0) {
							inst += typeof func.parameters[0] === 'number' ? func.parameters[0] : 0;
							inst += ' ';
						}
						inst += typeof func.parameters[1] === 'number' ? func.parameters[1] : 0;
						inst += '  ; default arg';
						context.emit(inst);
					}
					context.emit('ext' + func.opcode.toString(16) + '  ; ' + lhs.identifier);
				} else {
					context.assert(func.parameters.length === args.length, `mismatch in number of arguments; expected ${func.parameters.length}, got ${args.length}`);
					const returnLabel = uniqueLabel('return');
					context.emit(`.stack 0 ${returnLabel}  ; result, returnAddr`);
					context.emit('fetch FP');
					for (let a of args) { a.generate(context) }
					// now position FP right before the arguments
					context.emit('fetch SP');
					if (args.length)
						context.emit('add ' + args.length);
					context.emit('store FP');  // set frame pointer
					context.emit('.jump ' + lhs.identifier);
					context.emit(returnLabel + ':')
					// stack: ..., RESULT, RETURN_ADDRESS, OLD_FP, ARGS... ]
				}
			},
		},
		'[': {
			// Array indexing
			closer: ']',
			generate: (context, lhs, args) => {
				lhs.generateAddress(context);
				context.assert(args.length === 1, 'expected index expression');
				args[0].generate(context);
				context.emit('add');
				context.emit('fetch');
			},
			numargs: 1,
			precompute: (lhs, args) => lhs + args[0],
		},
		/*
		'.': {
			generate: (context, lhs, args) => {
				// Not sure what to do here but it doesn't seem like we need structs
			},
			numargs: 1,
		}
		*/
	};

	constructor(lhs, operator) {
		this.lhs = lhs;
		this.operator = operator;
	}

	static tryPostParse(lhs, source) {
		let op;
		while (op = PostfixExpression.operators[source.peek()]) {
			source.next();  // skip past op
			lhs = new PostfixExpression(lhs, op);
			if (op.closer) {
				while (!source.tryConsume(op.closer)) {
					lhs.args.push(Expression.parse(source));
					if (source.tryConsume(op.closer)) break;
					source.consume(',');
				}
			} else {
				lhs.args.push(source.consumeIdentifier());
			}
			if (op.numargs && op.numargs !== lhs.args.length)
				source.error(op.numargs + " arguments expected");
		}
		return lhs;
	}

	simplify(context) {
		this.lhs = this.lhs.simplify(context);
		this.args = this.args.map(arg => arg.simplify(context));

		if (this.lhs.literal && this.operator.precompute && this.args.filter(arg => !arg.literal).length === 0)
			return new LiteralExpression(this.operator.precompute(this.lhs.literal, this.rhs.literal, this.args.map(arg => arg.literal)));
		else
			return this;
	}

	generate(context) {
		this.operator.generate(context, this.lhs, this.args);
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
	const { readFile } = require('fs');

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

	let interfaces = interface.map(filename => require(filename).generateInterface());

	let reads = positionals.map(filename =>
		new Promise((resolve, reject) => {
        	readFile(filename, 'utf8', (err, data) => {
	            if (err) {
    	            console.log(err);
        	        reject(err);
           		 } else {
	                resolve(data);
    	        }
     	   });
    	}));

	Promise.all(reads)
	.then(sources => {
		try {
			let code = compile(...interfaces.concat(sources));
			console.log(code);
		} catch (e) {
			if (e instanceof ParseError) {
				console.error('Parse Error: ' + e.message);
			} else if (e instanceof SemanticError) {
				console.error('Semantic Error: ' + e.message);
			} else {
				console.error('Compilation Error: ' + e);
			}
		}
	});
}