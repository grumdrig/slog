
class ParseError {
	message;
	constructor(message, location) { this.message = message }
}


class Source {
	lexemes = [];
	// Lexemes are { line_no, text, TYPE } plus maybe a numeric value

	constructor(text) {

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
				} else if (lexeme.text = take(/^[-+=<>*/%^&|]+/i)) {
					lexeme.operator = true;
				} else if (lexeme.text = take(/^[.,~!@#(){}[\]]/i)) {
					lexeme.punctuation = true;
				} else {
					this.error(`unrecognized character al line ${line_no}: '${line[0]}'`);
				}
			}
		});
	}

	consume(token) {
		if (token !== this.next().text) this.error(`expected '${token}'`);
	}

	consumeIdentifier() {
		if (!this.isIdentifier()) this.error('identifier expected');
		return this.next().text;
	}

	consumeLiteral() {
		if (!this.lexemes[0].literal) this.error('literal value expected');
		return this.next().value;
	}

	tryConsume(token) {
		if (this.peek(token)) return this.next().text;
	}

	empty() { return !this.lexemes.length }

	peek(value) {
		if (this.empty()) return;
		if (value && this.lexemes[0].text !== value) return;
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
		throw new ParseError(`${message} at line ${this.lexems[0].line_no}: ${this.lexemes[0]}`);
	}
}


class CompilationContext {
	// symbols = {};
	constants = {};
	parent;
	// forwards = {};

	constructor(parent, functionDefinition) {
		this.parent = parent;
		if (!parent) {
			this.code = [];
			this.unique = 1;
		}

		if (functionDefinition) {
			this.function = functionDefinition;
			this.scope = {};
			functionDefinition.parameters.forEach((parameter, i) => {
				this.scope[parameter] = { offset: i + 1, count: 1 };
				this.scope['_return_position'] = { offset: functionParameters.count + 1, count: 1 };
			});
		}
	}

	// define(symbol, info) {
	// 	if (this.symbols[symbol]) this.error('duplicate definition ' + symbol);
	// 	this.symbols[symbol] = info;
	// }

	enclosingFunction() { return this.function || (this.parent && this.parent.enclosingFunction()) }

	enclosingScope() { return this.scope || (this.parent && this.parent.enclosingScope()) }

	lookup(id) { return (this.enclosingScope() || {})[id]; }

	declareVariable(name, count, initializer) {
		if (!this.parent) {
			// Global declaration
			this.emit(name + ':');
			this.emit('.data ' + (initializer || 0) + (count == 1 ? '' : ' * ' + count));
		} else {
			let scope = this.enclosingScope();
			this.assert(scope, "no enclosing scope"); // seems impossible
			let offset = 0;
			for (let i in scope) offset += scope[i].countl
			scope[name] = { name, offset, count, initializer };
		}
	}

	defineConstant(identifier, value) {
		if (this.constants[identifier]) this.error('duplicate definition');
		this.constants[identifier] = value;
	}

	emit(s) { this.parent ? this.parent.emit(s) : this.code.push(s) }

	// link() {
	// 	for (let f in forwards) {
	// 		this.code[forwards[f]] = this.symbols[f];  // or something
	// 	}
	// }

	uniqueLabel(realm) { return this.parent ? this.parent.uniqueLabel(realm) :
		`@${realm}_${this.unique++}`;
	}

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
	functions = [];
	externals = [];

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
			} else {
				item = FunctionDefinition.parse(source);
				result.functions.push(item);
			}
		}
		return result;
	}

	generate() {
		let context = new CompilationContext();

		context.emit('.jump main');

		for (let c of this.constants) c.generate(context);
		for (let v of this.variables) v.generate(context);
		for (let f of this.functions) f.generate(context);

		// context.link();

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

	generate(context) {
		context.defineConstant(this.name, this.value);
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

	generate(context) {
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
		context.declareVariable(this.name, count, initializer);
	}
}

class ExternalDefinition {
	name;
	parameters = [];  // ignored
	opcode;

	static tryParse(source) {
		if (!source.tryConsume('external')) return false;
		let result = new ExternalDefinition;
		result.name = source.consumeIdentifier();
		if (source.tryConsume('(')) {
			if (!source.tryConsume(')')) while (true) {
				result.parameters.push(source.consumeIdentifier());
				if (source.tryConsume(')')) break;
				source.consume(',');
			}
		}
		source.consume('=');
		result.opcode = Expression.parse(source);
		return result;
	}

	generate(context) {
		let opcode = this.opcode.simplify(context);
		context.assert(opcode.literal, "literal opcode value expected");
		context.defineExternal(this.name, this.opcode.literal);
	}
}

// Yeah I may want a 'func' keyword. We'll see. Also the parameter syntax is weird. Or maybe
// I should use juxtaposition for arguments as well.
class FunctionDefinition {
	name;
	parameters = [];
	body;

	static parse(source) {
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

	generate(context) {
		context.emit(this.name + ':');
		context = new CompilationContext(context, this);
		// context.returnValueDepth = this.parameters.length + 1;
		// context.returnLabel = context.uniqueLabel(this.name + '_return');
		// for (let p of this.parameters) {
		// 	context.define(p);
		// }
		this.body.generate(context);

		this.generateReturn(context);
	}

	generateReturn(context) {
		context.emit('adjust ' + -(this.parameters.length));
		if (this.name === 'main') {
			context.emit('halt 0');
		} else {
			context.emit('jump'); // return
		}
	}
}

class CodeBlock {
	constants = [];
	variables = [];
	statements = [];

	static parse(source) {
		let result = new CodeBlock();
		while (!source.peek('}')) {
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
		for (let c of this.constants) c.generate(context);
		for (let v of this.variables) v.generate(context);
		for (let s of this.statements) s.generate(context);
	}
}

class Statement {  // namespace only
	static parse(source) {
		if (source.tryConsume('break')) {
			return new BreakStatement();
		} else if (source.tryConsume('return')) {
			return new ReturnStatement(Expression.parse(source));
		} else if (source.peek('while')) {
			return WhileStatement.parse(source);
		} else if (source.peek('if')) {
			return IfStatement.parse(source);
		} else {
			return new ExpressionStatement(Expression.parse(source));
		}
	}
}

class BreakStatement {
	generate(context) {
		if (!context.enclosingLoopExit()) context.error('no enclosing loop for break');
		emit('.stack ' + context.enclosingLoopExit());
	}
}

class ReturnStatement {
	value;

	constructor(value) {
		this.value = value;
	}

	generate(context) {
		let func = context.enclosingFunction();
		if (!func) context.error('no enclosing function for return');

		this.value.generate(context);

		if (func.name === 'main') {
			context.emit('halt');
		} else {
			context.emit('storelocal -3');  // save the return value
			context.emit('fetch FP');
			context.emit('store SP');
			context.emit('store FP');
			context.emit('store PC'); // aka jump
		}
	}
}

class ExpressionStatement {
	expression;
	constructor(expression) { this.expression = expression }

	generate(context) {
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
		context.breakLabel = context.uniqueLabel('endwhile');

		let loopStartLabel = context.uniqueLabel('while');
		context.emit(loopStartLabel + ':');

		// Test loop condition
		this.condition.generate(context);
		context.emit('unary NOT');

		// Exit loop if it's false
		context.emit('.branch ' + breakLabel);

		this.body.generate(context);

		context.emit('.jump ' + loopStartLabel);

		context.emit(breakLabel + ':');
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
			if (source.peek('if')) {
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
		let elseLabel = context.uniqueLabel('else');
		this.condition.generate(context);
		context.emit('unary NOT');
		context.emit('.branch ' + elseLabel);

		this.ifbody.generate(context);

		context.emit(elseLabel + ':');

		if (this.elsebody) this.elsebody.generate(context);
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

class LiteralExpression {
	literal;

	constructor(literal) {
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
		let l = context.resolveConstant(this.identifier);
		return l ? new LiteralExpression(l) : this;
	}

	generate(context) {
		let reference = context.lookup(this.identifier);
		if (reference) {
			context.emit('peek ' + reference.offset + ' ; ' + this.identifier);
		} else {
			// hopefully global
			context.emit('fetch ' + this.identifier);
		}
	}
}

class PrefixExpression {
	operator;
	rhs;

	static operators = {
		'+': {
			precompute: x => x,
			generate: context => null,
			},
		'-': {
			precompute: x => -x,
			generate: context => context.emit('unary NEGATE'),
			},
		'~': {
			precompute: x => ~x,
			generate: context => context.emit('unary COMPLEMENT'),
			},
		'!': {
			precompute: x => !x,
			generate: context => context.emit('unary NOT'),
			},
		'*': {
			generate: context => context.emit('fetch'),
			}
	};

	static tryParse(source) {
		if (!PrefixExpression.operators[source.peek()]) return false;
		let result = new PrefixExpression();
		result.operator = source.next();
		result.rhs = Expression.parse(source, 2);
		return result;
	}

	simplify(context) {
		this.rhs = this.rhs.simplify(context);
		if (this.rhs.literal && this.operator.precompute)
			return new LiteralExpression(this.operator.precompute(this.rhs.literal));
		else
			return this;
	}

	generate(context) {
		rhs.generate(context);
		this.operator.generate(context);
	}

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
				context.emit('unary NEGATE');
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
				context.assert(lhs.identifier, "identifier expected at left hand side of assignment");
				context.emit('.stack ' + lhs.identifier);
				rhs.generate(context);
				context.emit('store');
			},
		},
		/*
		'+=': {
			precedence: 14,
			generate: (context, lhs, rhs) => {
				context.assert(lhs.identifier, "identifier expected at left hand side of assignment");
				context.emit(lhs.identifier + ':');
				context.emit('push');
				context.emit('fetch');
				rhs.generate(context);
				context.emit('add');
				context.emit('store');
			},
		},
		'-=': {
			precedence: 14,
			generate: (context, lhs, rhs) => {
				context.assert(lhs.identifier, "identifier expected at left hand side of assignment");
				context.emit(lhs.identifier + ':');
				context.emit('push');
				context.emit('fetch');
				rhs.generate(context);
				context.emit('sub');
				context.emit('store');
			},
		},
		'*=': {
			precedence: 14,
			generate: (context, lhs, rhs) => {
				context.assert(lhs.identifier, "identifier expected at left hand side of assignment");
				context.emit(lhs.identifier + ':');
				context.emit('push');
				context.emit('fetch');
				rhs.generate(context);
				context.emit('mul');
				context.emit('store');
			},
		},
		'/=': {
			precedence: 14,
			generate: (context, lhs, rhs) => {
				context.assert(lhs.identifier, "identifier expected at left hand side of assignment");
				context.emit(lhs.identifier + ':');
				context.emit('push');
				context.emit('fetch');
				rhs.generate(context);
				context.emit('div');
				context.emit('store');
			},
		},
		'%=': {
			precedence: 14,
			generate: (context, lhs, rhs) => {
				context.assert(lhs.identifier, "identifier expected at left hand side of assignment");
				context.emit(lhs.identifier + ':');
				context.emit('push');
				context.emit('fetch');
				rhs.generate(context);
				context.emit('mod');
				context.emit('store');
			},
		},
		'<<=': {
			precedence: 14,
			generate: (context, lhs, rhs) => {
				context.assert(lhs.identifier, "identifier expected at left hand side of assignment");
				context.emit(lhs.identifier + ':');
				context.emit('push');
				context.emit('fetch');
				rhs.generate(context);
				context.emit('unary NEGATE');
				context.emit('shift');
				context.emit('store');
			},
		},
		'>>=': {
			precedence: 14,
			generate: (context, lhs, rhs) => {
				context.assert(lhs.identifier, "identifier expected at left hand side of assignment");
				context.emit(lhs.identifier + ':');
				context.emit('push');
				context.emit('fetch');
				rhs.generate(context);
				context.emit('shift');
				context.emit('store');
			},
		},
		'&=': {
			precedence: 14,
			generate: (context, lhs, rhs) => {
				context.assert(lhs.identifier, "identifier expected at left hand side of assignment");
				context.emit(lhs.identifier + ':');
				context.emit('push');
				context.emit('fetch');
				rhs.generate(context);
				context.emit('and');
				context.emit('store');
			},
		},
		'^=': {
			precedence: 14,
			generate: (context, lhs, rhs) => {
				context.assert(lhs.identifier, "identifier expected at left hand side of assignment");
				context.emit(lhs.identifier + ':');
				context.emit('push');
				context.emit('fetch');
				rhs.generate(context);
				context.emit('xor');
				context.emit('store');
			},
		},
		'|=': {
			precedence: 14,
			generate: (context, lhs, rhs) => {
				context.assert(lhs.identifier, "identifier expected at left hand side of assignment");
				context.emit(lhs.identifier + ':');
				context.emit('push');
				context.emit('fetch');
				rhs.generate(context);
				context.emit('or');
				context.emit('store');
			},
		},
		*/
	};

	simplify(context) {
		this.rhs = this.rhs.simplify(context);
		if (this.rhs.literal && this.operator.precompute)
			return new LiteralExpression(this.operator.precompute(this.rhs.literal));
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
				context.assert(lhs.identifier, 'function identifier expected');

				let func = context.lookup(lhs.identifier);
				if (func.opcode) {
					// external opcode
					for (let a of args) { a.generate(context) }
					context.emit(func.opcode);
				} else {
					// regular function call
					context.emit('.data 0 ; return value');
					context.emit('fetch PC');
					context.emit('fetch FP');
					for (let a of args) { a.generate(context) }
					context.emit('fetch SP');
					context.emit('sub ' + args.length);
					context.emit('store FP');
					context.emit('.jump ' + lhs.identifier);
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
		},
		/*
		'.': {
			generate: (context, lhs, args) => {
				// Not sure what to do here but it doesn't seem like we need structs
			},
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
		}
		return lhs;
	}

	generate(context) {
		this.operator.generate(context, this.lhs, this.args);
	}
}

function compile(text) {
	let source = new Source(text);
	console.log(source);

	let m = Module.parse(source);
	console.log(m);

	let c = m.generate();

	return c.code.join('\n');
}

if (typeof exports !== 'undefined') {
	exports.compile = compile;
}