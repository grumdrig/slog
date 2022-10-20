
class ParseError {
	message;
	constructor(message, location) { this.message = message }
}


class Source {
	lexemes = [];

	// Most tokens are literal strings but numeric literals are stored as { literal: NUMBER }
	// so that they have a positive truth value.

	constructor(text) {

		function take(re) {
			let result = text.match(re);
			if (result) {
				result = result[0];
				text = text.substr(result.length);
				return result;
			}
		}

		while (true) {
			text = text.trim();
			if (text.length === 0) break;

			let m;
			if (m = take(/^[$][\da-f]+/i)) {
				this.lexemes.push({ literal: parseInt(m.substr(1), 16) });
			} else if (m = take(/^\d+/)) {
				this.lexemes.push({ literal: parseInt(m) });
			} else if (m = take(/^([a-z_]\w*|[.,~!@#(){}[\]]|[-+=<>*/%^&|]+)/i)) {
				// identifier or punctuation or operator
				this.lexemes.push(m);
			} else {
				this.error(`unrecognized character '${text[0]}'`);
			}
		}
	}

	consume(token) {
		if (token !== this.next()) this.error(`expected '${token}'`);
	}

	consumeIdentifier() {
		if (!this.isIdentifier()) this.error('identifier expected');
		return this.next();
	}

	consumeLiteral() {
		if (!this.isLiteral()) this.error('literal value expected');
		return this.next().literal;
	}

	tryConsume(token) {
		if (this.peek(token)) return this.next();
	}

	empty() { return !this.lexemes.length }

	peek(value) {
		if (this.empty()) return;
		if (value && this.lexemes[0] !== value) return;
		return this.lexemes[0];
	}

	isIdentifier() {
		return typeof this.peek() === 'string' && this.peek().match(/^[a-z_]\w*$/i);
	}

	isLiteral() {
		return this.peek().literal || true;
	}

	next() {
		if (!this.lexemes.length) this.error('unexpected end of file');
		return this.lexemes.shift();
	}

	error(message) {
		throw new ParseError(`${message} at ${this.lexemes.length}: ${this.lexemes[0]}`);
	}
}


class Module {
	constants = [];
	variables = [];
	functions = [];

	static parse(source) {
		let result = new Module();
		while (!source.empty()) {
			let item;
			if (item = ConstantDefinition.tryParse(source)) {
				result.constants.push(item);
			} else if (item = VariableDeclaration.tryParse(source)) {
				result.variables.push(item);
			} else {
				item = FunctionDefinition.parse(source);
				result.functions.push(item);
			}
		}
		return result;
	}
}

class ConstantDefinition {
	name;
	initializer;

	static tryParse(source) {
		if (!source.tryConsume('const')) return false;
		let result = new ConstantDefinition;
		result.name = source.consumeIdentifier();
		source.consume('=');
		result.initializer = Expression.parse(source);
		return result;
	}
}

class VariableDeclaration {
	name;
	initializer;

	static tryParse(source) {
		if (!source.tryConsume('var')) return false;
		let result = new VariableDeclaration();
		result.name = source.consumeIdentifier();
		if (source.tryConsume('=')) {
			result.initializer = Expression.parse(source);
		}
		return result;
	}
}

// Yeah I may want a 'func' keyword. We'll see.
class FunctionDefinition {
	id;
	parameters = [];
	body;

	static parse(source) {
		let result = new FunctionDefinition();
		result.id = source.consumeIdentifier();
		while (source.isIdentifier()) result.parameters.push(a.consumeIdentifier());
		source.consume('{');
		result.body = CodeBlock.parse(source);
		source.consume('}');
		return result;
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
}

class Statement {

	static parse(source) {
		if (source.tryConsume('break')) {
			return new BreakStatement();
		} else if (source.peek('while')) {
			return WhileStatement.parse(source);
		} else if (source.peek('if')) {
			return IfStatement.parse(source);
		} else {
			return new ExpressionStatement(Expression.parse(source));
		}
	}
}

class BreakStatement { }

class ExpressionStatement {
	expression;
	constructor(expression) { this.expression = expression }
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
			result.operator = source.next();
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
		let result = new IndentifierExpression();
		result.identifier = source.consumeIdentifier();
		return result;
	}

	simplify(context) {
		let l = context.resolveConstant(this.identifier);
		return l ? new LiteralExpression(l) : this;
	}

	generate(context) {
		let a = context.addressOf(this.identifier);
		if (!a) context.error('undefined identifier ' + this.identifier);
		if (immediateEligible(a)) {
			context.emit('fetch ' + a);
		} else {
			context.emit('.stack ' + a);
			context.emit('fetch');
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
				lhs.generateExpressionAddress(context);
				rhs.generate(context);
				context.emit('store');
			},
		},
		'+=': {
			precedence: 14,
			generate: (context, lhs, rhs) => {
				lhs.generateExpressionAddress(context);
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
				lhs.generateExpressionAddress(context);
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
				lhs.generateExpressionAddress(context);
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
				lhs.generateExpressionAddress(context);
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
				lhs.generateExpressionAddress(context);
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
				lhs.generateExpressionAddress(context);
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
				lhs.generateExpressionAddress(context);
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
				lhs.generateExpressionAddress(context);
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
				lhs.generateExpressionAddress(context);
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
				lhs.generateExpressionAddress(context);
				context.emit('push');
				context.emit('fetch');
				rhs.generate(context);
				context.emit('or');
				context.emit('store');
			},
		},
	};

	simplify(context) {
		this.rhs = this.rhs.simplify(context);
		if (this.rhs.literal && this.operator.precompute)
			return new LiteralExpression(this.operator.precompute(this.rhs.literal));
		else
			return this;
	}
}

class PostfixExpression {
	lhs;
	operator;
	arguments = [];

	static operators = {
		'(': { closer: ')' },
		'[': { closer: ']' },
		'.': { }
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
					lhs.arguments.push(Expression.parse(source));
					if (source.tryConsume(op.closer)) break;
					source.consume(',');
				}
			} else {
				lhs.arguments.push(source.consumeIdentifier());
			}
		}
		return lhs;
	}

	generate(context) {
		this.operator.generate(context, this.lhs, this.rhs);
	}
}

function compile(text) {
	let source = new Source(text);
	console.log(source);

	let m = Module.parse(source);
	console.log(m);
}

compile(`
var i = 5
var b
const c = -5
main {
	go()
}
go {
	state.level = 4
}`);
