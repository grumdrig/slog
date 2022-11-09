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
					// Hex literal
					lexeme.literal = true;
					lexeme.value = parseInt(lexeme.text.substr(1), 16);

				} else if (lexeme.text = take(/^\d+/)) {
					// Decimal literal
					lexeme.literal = true;
					lexeme.value = parseInt(lexeme.text);

				} else if (lexeme.text = take(/^[a-z_]\w*/i)) {
					// Identifier
					lexeme.identifier = true;

				} else if (lexeme.text = take(/^'.*?'/)) {
					// Character
					if (lexeme.text.length < 3 || lexeme.text.length > 4)
						this.error('invalid character literal length ' + (lexeme.text.length - 2));
					lexeme.literal = true;
					lexeme.value = lexeme.text.charCodeAt(1);
					if (lexeme.text.length > 3) {
						lexeme.value = lexeme.value * 256 + lexeme.text.charCodeAt(2);
					}

				} else if (lexeme.text = take(/^".+?"/)) {
					// String
					lexeme.string = true;

				} else if (lexeme.text = take(/^[-+=<>*/%^&|!?]+/)) {
					// Operator
					lexeme.operator = true;

				} else if (lexeme.text = take(/^[.,~@#(){}[\]]/)) {
					// Punctuation
					lexeme.punctuation = true;

				} else if (!comment) {
					this.error(`unrecognized character at line ${line_no}: '${line[0]}'`);
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

	isString() {
		return this.lexemes[0].string;
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


function indent(s) {
	if (s.split(';')[0].search(':') >= 0) return s;
	if (s.startsWith(';;')) return s;
	return '\t' + s;
}

class CompilationContext {
	symbols = {};
	parent;

	constructor(parent) {
		this.parent = parent;
		if (!parent) {
			this.code = [];
			this.unique = 1;
			this.labels = new Set();
			this.allocations = [];
		}
	}

	uniqueLabel(realm) {
		if (!this.labels) return this.parent.uniqueLabel(realm);
		for (let i = 0; ; i += 1) {
			let result = (realm || 'unique') + '@' + i;
			if (!this.labels.has(result)) {
				this.labels.add(result);
				return result;
			}
		}
	}

	enclosingScope() { return this.function || (this.parent && this.parent.enclosingScope()) }

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
		let scope = this.enclosingScope();
		if (!scope) {
			// global
			let globalContext = this;
			while (globalContext.parent) globalContext = globalContext.parent;
			if (globalContext == this) {
				// no need for an alias
				globalContext.allocations.push({ label: identifier, count, initializer });
				// might not need all these fields either
				this.symbols[identifier] = result = { variable: true, static: true, identifier, count, initializer };
			} else {
				let label = this.uniqueLabel(identifier);
				globalContext.allocations.push({ label, count, initializer });
				this.defineAlias(identifier, new IdentifierExpression(label));
				// might not need all these fields either
				globalContext.symbols[label] = result = { variable: true, static: true, identifier: label, count, initializer };
			}
		} else {
			// Stack declaration
			// FP points at OLD_FP. Then come arguments, then local vars
			let offset = -1 - scope.allocated;

			// might not need all these fields
			this.symbols[identifier] = result = { variable: true, local: true, identifier, offset, count, initializer };

			this.emit(`.stack ${initializer || 0}${count !== 1 ? ' * ' + count : ''}  ; allocate ${identifier}`);
			scope.allocated += 1;
		}
		return result;
	}

	declareFunction(declaration) {
		this.symbols[declaration.name] = { function: declaration };
	}

	literalValue(expr) {
		expr.value ?? this.error("constant value expected");
		return expr.value;
	}

	emit(s) { this.parent ? this.parent.emit(s) : this.code.push(indent(s)) }

	emitLabel(l) { this.emit(l + ':') }

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
	tag;
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
			} else if (item = TagDefinition.tryParse(source)) {
				console.log(result.tag);
				if (result.tag) source.error("Tag already defined");
				result.tag = item;
			} else {
				result.statements.push(Statement.parse(source));
			}
		}
		return result;
	}

	generate() {
		let context = new CompilationContext();

		context.emit('.jump @main');
		context.emit('');

		for (let d of this.constants) d.define(context);
		for (let d of this.variables) d.declare(context);
		for (let d of this.macros)    d.declare(context);
		for (let d of this.functions) d.declare(context);

		context.emit('@main:');
		for (let d of this.statements) d.generate(context);
		context.emit('halt 0  ; end @main');
		context.emit('');

		// for (let d of this.variables) d.allocate(context);
		for (let { label, count, initializer } of context.allocations)  {
			context.emit(label + ':');
			if (Array.isArray(initializer)) {
				if (initializer.length > 0)
					context.emit('.data ' + initializer.join(' '));
			} else {
				if (count > 0)
					context.emit('.data ' + (initializer || 0) + (count == 1 ? '' : ' * ' + count));
			}
		}
		context.emit('');

		for (let d of this.functions) d.generate(context);

		if (this.tag) this.tag.generate(context);

		return context;
	}
}

class TagDefinition {
	tag1;
	tag2;

	static tryParse(source) {
		if (!source.tryConsume('tag')) return false;
		let result = new TagDefinition();
		source.consume('(');
		result.tag1 = Expression.parse(source);
		source.consume(',');
		result.tag2 = Expression.parse(source);
		source.consume(')');
		return result;
	}

	generate(context) {
		this.tag1 = this.tag1.simplify(context);
		this.tag2 = this.tag2.simplify(context);
		if (!this.tag1.isLiteral || !this.tag2.isLiteral)
			context.error('Constant value expressions required for tag definition');
		context.emit('');
		context.emit('halt 0');
		context.emit('.data ' +
			(asCharIfPossible(this.tag1.value) ??
				'$' + this.tag1.value.toString(16)) +
			   ' $' + this.tag2.value.toString(16) + '  ; tag');
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
			count = c.value ?? context.error('literal vector length expected');
		}
		if (this.initializer) {
			let i = this.initializer.simplify(context);
			if (i.members) {
				initializer = i.members.map(m => m.value ?? context.error('literal vector initializer expected'));
				if (this.count && count !== initializer.length)
					context.error('vector length mismatch with initializer');
				count = initializer.length;
			} else {
				initializer = i.value ?? context.error('literal initializer expected');
			}
		}
		//this.decl =
		context.declareVariable(this.name, count, initializer);
	}

	/*
	allocate(context) {
		if (this.decl.static) {
			// Global declaration
			context.emit(this.decl.identifier + ':');
			if (Array.isArray(this.decl.initializer)) {
				if (this.decl.initializer.length > 0)
					context.emit('.data ' + this.decl.initializer.join(' ') + '  ; ' + this.decl.identifier);
			} else {
				if (this.decl.count > 0)
					context.emit('.data ' + (this.decl.initializer || 0) + (this.decl.count == 1 ? '' : ' * ' + this.decl.count) + '  ; ' + this.decl.identifier);
			}
			context.emit('');
		} else if (this.decl.local) {
			context.emit(`.stack ${this.decl.initializer || 0}${this.decl.count !== 1 ? '*' + this.decl.count : ''}  ; allocate ${this.decl.identifier}`);
		} else {
			throw "I don't know what";
		}
	}
	*/
}


class MacroDefinition {
	name;
	parameters = [];
	body;
	expr;

	static tryParse(source) {
		if (!source.tryConsume('macro')) return;
		return new MacroDefinition().continueParsing(source);
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

	declare(context) {
		context.declareFunction(this);
	}

	generateCall(context, args) {
		context = new CompilationContext(context);
		args.map((arg, i) => context.defineAlias(this.parameters[i], arg));
		if (this.body) {
			context.emit(';; macro ' + this.name);
			// context.function = this;
			context.returnLabel = context.uniqueLabel(this.name + '_return');
			this.body.generate(context);
			if (!this.body.willReturn)
				context.emit('push 0  ; default macro return value');
			context.emit(context.returnLabel + ':');
		} else {
			this.expr.generate(context);
		}
	}
}


class FunctionDefinition extends MacroDefinition {

	allocated = 0;

	static tryParse(source) {
		if (!source.tryConsume('func')) return;
		return new FunctionDefinition().continueParsing(source);
	}

	stackFrameSize() { return this.parameters.length }

	generate(context) {
		context = new CompilationContext(context);
		context.emitLabel(this.name);
		this.parameters.forEach((parameter, i) => {
			context.symbols[parameter] = { variable: true, local: true, offset: -1 - this.allocated, count: 1 };
			this.allocated += 1;
		});
		if (this.body) {
			context.function = this;
			context.returnLabel = context.uniqueLabel(this.name + '_return');
			this.body.generate(context);
			if (!this.body.willReturn)
				context.emit('push 0  ; default function return value');
			context.emit(context.returnLabel + ':');
		} else {
			this.expr.generate(context);
		}

		context.emit('storelocal 2  ; store result');
		context.emit('fetch FP');
		context.emit('store SP');
		context.emit('store FP');
		context.emit('jmp  ; return from ' + this.name);
		context.emit('');
	}

	generateCall(context, args) {
		const returnLabel = context.uniqueLabel('return_from_' + this.name);
		context.emit(`.stack 0 ${returnLabel}  ; result, ret addr`);
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

	get willReturn() {
		return (this.statements[this.statements.length - 1] ?? {}).willReturn;
	}

	generate(context) {
		context = new CompilationContext(context);
		for (let d of this.constants) d.define(context);
		for (let d of this.variables) d.declare(context);
		// for (let d of this.variables) d.allocate(context);
		for (let d of this.statements) d.generate(context);
	}
}

class Statement {  // namespace only
	static parse(source) {
		if (source.tryConsume('break')) {
			return new BreakStatement();
		} else if (source.tryConsume('halt')) {
			return new HaltStatement();
		} else if (source.lookahead('emit')) {
		 	return new EmitStatement(source);
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
		let rc = context;
		while (rc && !rc.returnLabel) rc = rc.parent;
		if (!rc) context.error('return outside of enclosing scope');
		this.value.simplify(context).generate(context);
		context.emit('.jump ' + rc.returnLabel);
	}

	get willReturn() { return true }
}

class HaltStatement {
	generate(context) {
		context.emit('halt 0');
	}
}

class EmitStatement {
	instruction;
	args = [];

	constructor(source) {
		source.consume('emit');
		source.consume('(');
		this.instruction = Expression.parse(source);
		while (source.tryConsume(',')) {
			this.args.push(Expression.parse(source));
		}
		source.consume(')');
		return this;
	}

	generate(context) {
		this.instruction = this.instruction.simplify(context);
		this.args = this.args.map(a => a.simplify(context));
		for (let a of [...this.args.slice(0)].reverse()) {
			a.generate(context);
		}
		context.emit('.data ' + context.literalValue(this.instruction));
	}
}

class ExpressionStatement {
	expression;
	constructor(expression) { this.expression = expression }

	generate(context) {
		this.expression.simplify(context);
		this.expression.generate(context);
		context.emit('stack -1'); // throw away resulting value
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
				result.elsebody = IfStatement.parse(source);
			} else {
				source.consume('{');
				result.elsebody = CodeBlock.parse(source);
				source.consume('}');
			}
		}
		return result;
	}

	generate(context) {
		let endifLabel = context.uniqueLabel('endif');
		let elseLabel = this.elsebody ? context.uniqueLabel('else') : null;
		this.condition.simplify(context).generate(context);
		context.emit('unary NOT');
		context.emit('.branch ' + (elseLabel ?? endifLabel));

		this.ifbody.generate(context);

		if (this.elsebody) {
			if (!this.ifbody.willReturn)
				context.emit('.jump ' + endifLabel);
			context.emit(elseLabel + ':');
			this.elsebody.generate(context);
		}

		context.emit(endifLabel + ':');
	}

	get willReturn() {
		return this.ifbody.willReturn && (!this.elsebody || this.elsebody.willReturn);
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
		if (this.test instanceof BinaryExpression && this.test.operator.equality) {
			let lhs = this.test.lhs.simplify(context);
			let rhs = this.test.rhs.simplify(context);
			lhs.generate(context);
			rhs.generate(context);
			context.emit('assert');
		} else {
			this.test = this.test.simplify(context);
			this.test.generate(context);
			context.emit('unary NOT');
			context.emit('assert 0');
		}
		context.emit('stack -1');  // assert leaves the value on the stack
	}
}

class Expression {
	static parse(source, precedence = 100) {
		let expr;
		if (source.tryConsume('(')) {
			expr = Expression.parse(source);
			source.consume(')');
		} else {
			expr = VectorLiteralExpression.tryParse(source) ||
				   ExternalFunctionExpression.tryParse(source) ||
				   PrefixExpression.tryParse(source) ||
				   LiteralExpression.tryParse(source) ||
				   IdentifierExpression.tryParse(source);
		}
		if (!expr) source.error('expression expected');
		while (true) {
			expr = PostfixExpression.tryPostParse(expr, source);

			let binop = BinaryExpression.operators[source.peek()];
			if (binop && (binop.precedence < precedence ||
				          (binop.precedence == precedence && binop.rightAssociative))) {
				source.next();  // skip the operator
				expr = new BinaryExpression(expr, binop, Expression.parse(source, binop.precedence));
			} else {
				return expr;
			}
		}
	}
}


class ExternalFunctionExpression {
	args;

	constructor(args) { this.args = args }

	static tryParse(source) {
		if (!source.tryConsume('external', '(')) return;
		return new ExternalFunctionExpression(parseArgumentList(source, ')'));
	}

	simplify(context) {
		this.args = this.args.map(a => a.simplify(context));
		return this;
	}

	generate(context) {
		// this.simplify(context);  // needed?
		context.assert(this.args.length >= 1, "external function call requires at least one argument");
		let operand = this.args[0].value ?? context.error('literal value expected');
		operand += (this.args.length - 1) * 128;
		for (let a of [...this.args.slice(1)].reverse()) {
			a.generate(context);
		}
		context.emit('ext ' + operand);
	}
}


class VectorLiteralExpression {
	members = [];

	constructor(members) { this.members = members }

	static tryParse(source) {
		if (source.tryConsume('[')) {
			return new VectorLiteralExpression(parseArgumentList(source, ']'));
		} else if (source.isString()) {
			let expr = new VectorLiteralExpression([]);
			for (let c of source.next().text.slice(1, -1))
				expr.members.push(new LiteralExpression(c.charCodeAt(0)));
			expr.members.push(new LiteralExpression(0));
			return expr;
		}
	}

	simplify(context) {
		this.members = this.members.map(a => a.simplify(context));
		return this;
	}

	generate(context) {
		context.error("a vector literal/string is not a valid expression in this context");
	}
}


class LiteralExpression {
	get isLiteral() { return true }
	value;

	constructor(value) {
		if (typeof value !== 'number' || Number.isNaN(value))
			throw "Invalid literal value " + value;
		this.value = value;
	}

	static tryParse(source) {
		if (!source.isLiteral()) return;
		return new LiteralExpression(source.consumeLiteral());
	}

	simplify(context) { return this }

	generate(context) {
		context.emit('.stack ' + this.value);
	}
}

class IdentifierExpression {
	identifier;

	constructor(identifier) {
		this.identifier = identifier;
		if (!this.identifier) throw "fit";
	 }

	static tryParse(source) {
		if (!source.isIdentifier()) return;
		return new IdentifierExpression(source.consumeIdentifier());
	}

	simplify(context) {
		let reference = context.lookup(this.identifier);
		if (reference && reference.alias) return reference.value.simplify(context);
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
			context.emit('fetch #');
			context.emit('.data ' + this.identifier);  // todo, try to make this immediate
		}
	}

	generateAddress(context) {
		let reference = context.lookup(this.identifier);
		context.assert(reference, 'undefined identifier: ' + this.identifier);
		if (reference && reference.local) {
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
					if (rhs.isLiteral) {
						const NUM_REGISTERS = 4;
						context.emit('fetch ' +  (-1 - NUM_REGISTERS - rhs.value));
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
		if (this.rhs.isLiteral && this.operator.precompute)
			return new LiteralExpression(this.operator.precompute(this.rhs.value));
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
	context.emit('peek 0');       // [ result, result, &lhs, ...
	context.emit('swap 2');       // [ &lhs, result, result, ...
	context.emit('store');        // [ result, ...
}


class BinaryExpression {
	lhs;
	operator;
	rhs;

	constructor(lhs, operator, rhs) { this.lhs = lhs; this.operator = operator; this.rhs = rhs }

	// Borrowing operators and precedence rules from C, except bitwise operators have higher
	// precedence than comparisons
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
				context.emit('sub        ; <= ...');
				context.emit('max 0      ; <= ...');
				context.emit('unary NOT  ; <=');
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
			equality: true,
			precedence: 7,
			precompute: (x,y) => x == y ? 1 : 0,
			generate: (context, lhs, rhs) => {
				lhs.generate(context);
				rhs.generate(context);
				context.emit('sub       ; == ...');
				context.emit('unary NOT ; ==');
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
				let cutLabel = context.uniqueLabel('and_shorcut');
				context.emit('peek 0');
				context.emit('unary NOT');
				context.emit('.branch ' + cutLabel);
				context.emit('stack -1');
				rhs.generate(context);
				context.emitLabel(cutLabel);
			},
		},
		'^^': {
			precedence: 12,
			precompute: (x,y) => ((!y && x) || (!x && y)) || 0,
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
				let cutLabel = context.uniqueLabel('or_shortcut');
				context.emit('peek 0'); // dup
				context.emit('.branch ' + cutLabel);
				context.emit('stack -1');
				rhs.generate(context);
				context.emitLabel(cutLabel);
			},
		},

		'=': {
			precedence: 14,
			rightAssociative: true,
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
			rightAssociative: true,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'add'),
		},
		'-=': {
			precedence: 14,
			rightAssociative: true,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'sub'),
		},
		'*=': {
			precedence: 14,
			rightAssociative: true,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'mul'),
		},
		'/=': {
			precedence: 14,
			rightAssociative: true,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'div'),
		},
		'%=': {
			precedence: 14,
			rightAssociative: true,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'div', 'swap AX'),
		},
		'<<=': {
			precedence: 14,
			rightAssociative: true,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'unary NEG', 'shift'),
		},
		'>>=': {
			precedence: 14,
			rightAssociative: true,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'shift'),
		},
		'&=': {
			precedence: 14,
			rightAssociative: true,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'and'),
		},
		'^=': {
			precedence: 14,
			rightAssociative: true,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'xor'),
		},
		'|=': {
			precedence: 14,
			rightAssociative: true,
			generate: (context, lhs, rhs) => opassign(context, lhs, rhs, 'or'),
		},

	};

	simplify(context) {
		this.lhs = this.lhs.simplify(context);
		this.rhs = this.rhs.simplify(context);
		if (this.lhs.isLiteral && this.operator.precompute && this.rhs.isLiteral)
			return new LiteralExpression(this.operator.precompute(this.lhs.value, this.rhs.value));
		else
			return this;
	}

	generate(context) {
		this.operator.generate(context, this.lhs, this.rhs);
	}
}

function parseArgumentList(source, ender) {
	let args = [];
	if (!source.tryConsume(ender)) {
		while (true) {
			args.push(Expression.parse(source));
			if (!source.tryConsume(',')) break;
		}
		source.consume(ender);
	}
	return args;
}

class PostfixExpression {
	static tryPostParse(lhs, source) {
		let op;
		while (true) {
			if (source.tryConsume('(')) {
				lhs = new FunctionCallExpression(lhs, parseArgumentList(source, ')'));
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
	args;

	constructor(lhs, args) { this.lhs = lhs; this.args = args }

	generate(context) {
		let func = this.lhs;
		if (func.identifier) {
			func = context.lookup(func.identifier) ?? context.error('unknown identifier ' + this.lhs.identifier);
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
		context.assert(this.lhs.generateAddress, "addressable expression expected");
		this.lhs.generateAddress(context);
		this.index.generate(context);
		context.emit('add');
	}

	generate(context) {
		if (this.lhs.members) {
			context.error('literal vector constant not available at runtime; use a var');
		} else {
			this.generateAddress(context);
			context.emit('fetch');
		}
	}

	simplify(context) {
		this.lhs = this.lhs.simplify(context);
		this.index = this.index.simplify(context);
		if (this.lhs.isLiteral && this.index.isLiteral) {
			return new LiteralExpression(this.lhs.value + this.index.value);
		} else if (this.lhs.members && this.index.isLiteral) {
			if (this.index.value < 0 || this.index.value >= this.lhs.members.length)
				context.error('index out of range');
			return this.lhs.members[this.index.value];
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
		code = compile(...interfaces.concat(sources));
/*	try {
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
	}*/

	if (output) {
		writeFileSync(output, code, 'utf8');
	} else {
		console.log(code);
	}
}
