
class Source {
	lexemes;

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
				lexemes.push({ literal: parseInt(m.substr(1), 16) });
			} else if (m = take(/^\d+/)) {
				lexemes.push({ literal: parseInt(m) });
			} else if (m = take(/^([a-z_]\W+|[.,~!@#(){}[\]]|[-+=<>*/%^&|]+)/i)) {
				// identifier or punctuation or operator
				lexemes.push(m);
			} else {
				this.error('unrecognized character');
			}
		}
	}

	consume(token) {
		if (token !== this.next()) this.error('expected: ' + token);
	}

	consumeIdentifier() {
		if (!this.peekIdentifier()) this.error('identifier expected');
		return next();
	}

	consumeLiteral() {
		if (!this.isLiteral()) this.error('literal value expected');
		return next().literal;
	}

	tryConsume(token) {
		if (this.peek(token)) return this.next();
	}

	peek(value) {
		if (!lexemes.length) return;
		if (value && lexemes[0] !== value) return;
		return lexemes[0];
	}

	peekIdentifier() {
		return typeof peek() === 'string' && peek().match(/^[a-z_]\W+$/i) && peek();
	}

	isLiteral() {
		return peek().literal || true;
	}

	next() {
		if (!lexemes.length) this.error('unexpected end of file');
		return lexemes.shift();
	}

	error(message) {
		throw new ParseError(message);
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
			if (item = ConstantDefinition.tryParse()) {
				result.constants.push(item);
			} else if (item = VariableDeclaration.tryParse()) {
				result.variables.push(item);
			} else {
				item = FunctionDefinition.parse();
				result.function.push(item);
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
		result.initializer = Expression.parse();
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
			result.initializer = Expression.parse();
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
		let a;
		while (a = source.tryConsumeIdentifier) result.parameters.push(a);
		source.consume('{');
		result.body = CodeBlock.parse(source);
		source.consume('}');
	}
}

class CodeBlock {
	constants = [];
	variables = [];
	statements = [];

	static parse(source) {
		let result = new CodeBlock();
		while (!peek('}')) {
			let item;
			if (item = ConstantDefinition.tryParse()) {
				result.constants.push(item);
			} else if (item = VariableDeclaration.tryParse()) {
				result.variables.push(item);
			} else {
				result.statements.push(Statement.parse());
			}
		}
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
			return new ExpressionStatement(Expression.parse());
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
			result = new BinaryExpression();
			result.lhs = lhs;
			result.operator = source.next();
			result.rhs = Expression.parse(source, binop.precedence);
			return result;
		} else {
			return lhs;
		}
	}
}

class LiterallExpression {
	literal;

	constructor(literal) {
		this.literal = literal;
	}

	tryParse(source) {
		if (!source.isLiteral()) return;
		return new LiteralExpression(source.consumeLiteral());
	}

	simplify(context) { return this }
}

class IdentifierExpression {
	identifier;

	tryParse(source) {
		if (!source.isIdentifier()) return;
		let result = new IndentifierExpression();
		result.identifier = source.consumeIdentifier();
		return result;
	}

	simplify(context) {
		let l = context.resolveConstant(this.identifier);
		return l ? new LiteralExpression(l) : this;
	}
}

class PrefixExpression {
	operator;
	rhs;

	static operators = {
		'+': { precompute: x => x },
		'-': { precompute: x => -x },
		'~': { precompute: x => ~x },
		'!': { precompute: x => !x },
		'*': { }
	};

	tryParse(source) {
		if (!PrefixExpressions.operators.includes(souce.peek())) return false;
		let result = new PrefixExpression();
		result.operator = source.next();
		result.rhs = Expression.parse(source, 2);
	}

	simplify(context) {
		this.rhs = this.rhs.simplify(context);
		if (this.rhs.literal && this.operator.precompute)
			return new LiteralExpression(this.operator.precompute(this.rhs.literal));
		else
			return this;
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
		},
		'/': {
			precedence: 3,
			precompute: (x,y) => x / y,
		},
		'%': {
			precedence: 3,
			precompute: (x,y) => x % y,
		},
		'+': {
			precedence: 4,
			precompute: (x,y) => x + y,
		},
		'-': {
			precedence: 4,
			precompute: (x,y) => x - y,
		},
		'<<': {
			precedence: 5,
			precompute: (x,y) => x << y,
		},
		'>>': {
			precedence: 5,
			precompute: (x,y) => x >> y,
		},
		'<': {
			precedence: 6,
			precompute: (x,y) => x < y,
		},
		'<=': {
			precedence: 6,
			precompute: (x,y) => x <= y,
		},
		'>': {
			precedence: 6,
			precompute: (x,y) => x > y,
		},
		'>=': {
			precedence: 6,
			precompute: (x,y) => x >= y,
		},
		'==': {
			precedence: 7,
			precompute: (x,y) => x == y,
		},
		'!=': {
			precedence: 7,
			precompute: (x,y) => x != y,
		},
		'&': {
			precedence: 8,
			precompute: (x,y) => x & y,
		},
		'^': {
			precedence: 9,
			precompute: (x,y) => x ^ y,
		},
		'|': {
			precedence: 10,
			precompute: (x,y) => x | y,
		},
		'&&': {
			precedence: 11,
			precompute: (x,y) => x && y,
		},
		'||': {
			precedence: 12,
			precompute: (x,y) => x || y,
		},
		'=': {
			precedence: 14,
		},
		'+=': {
			precedence: 14,
		},
		'-=': {
			precedence: 14,
		},
		'*=': {
			precedence: 14,
		},
		'/=': {
			precedence: 14,
		},
		'%=': {
			precedence: 14,
		},
		'<<=': {
			precedence: 14,
		},
		'>>=': {
			precedence: 14,
		},
		'&=': {
			precedence: 14,
		},
		'^=': {
			precedence: 14,
		},
		'|=': {
			precedence: 14,
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

	constructor(lhs, op) {
		this.lhs = lhs;
		this.operator = operator;
	}

	static tryPostParse(lhs, source) {
		let op;
		while (op = PostfixExpression.operators[source.peek()]) {
			source.next();  // skip past op
			lhs = new PostfixExpression(lhs, op);
			if (op.closer) {
				while (true) {
					lhs.arguments.push(Expression.parse(source));
					if (source.tryConsume(op.closer)) break;
					source.consume(',');
				}
			} else {
				arguments.push(source.consumeIdentifier());
			}
		}
		return lhs;
	}

}