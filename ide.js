

// Where are these? I confuse
//let asm, vm;
let asm;

function saveChanges() {
	localStorage.source = $("#source").value;
	localStorage.autorun = JSON.stringify($("#autorun").checked);
	localStorage.autoplay = JSON.stringify($("#autoplay").checked);
}


function comp(initialLoad) {
	if (!initialLoad)
		saveChanges();
	$("#errors").innerHTML = '&nbsp;';
	$("#errors").classList.remove("err");
	try {
		let sources = [$("#source").value];
		if ($('#importinterface').checked) sources.unshift(Game.generateInterface());
		$("#asm").value = compile(...sources);
		if (assemble()) {
			$("#errors").innerText = `Compiled length: ${asm.pc} words (memory size ${vm.memory.length})`;
			if ($("#autorun").checked)
				run();
			else if ($("#autoplay").checked)
				play();
		}
	} catch (e) {
		let message;
		if (e instanceof ParseError) {
			message = 'Parse Error: ' + e.message;
		} else if (e instanceof SemanticError) {
			message = 'Semantic Error: ' + e.message;
		} else {
			message = 'Compilation Error: ' + e;
		}
		console.log(e);
		$("#errors").classList.add("err");
		$("#errors").innerText = message
	}
}


function assemble() {
	$("#errors").innerHTML = '&nbsp;';
	$("#errors").classList.remove("err");
	try {
		asm = Assembler.assemble($("#asm").value);
		$("#machine").value = asm.disassemble();
		reset();
		return true;
	} catch (e) {
		$("#errors").classList.add("err");
		$("#errors").innerText = e.toString();
	}

}

function step() {
	stopRunimation();
	vm.step();
	updateDebuggerState(vm);
	Game.updateUI(vm.state);
}

function bigstep() {
	stopRunimation();
	Game.playmation(vm, true);
	updateDebuggerState(vm);
	Game.updateUI(vm.state);
}

function stopRunimation() {
	if (window.gameplayTimer) {
		clearTimeout(window.gameplayTimer);
		window.gameplayTimer = null;
/*
will probably need to get this into Bompton somehow:
		$id('task').innerHTML = 'Paused';
		animate.progress = 0;
		setTaskBar();
		*/
	}
}

function runimate() {
	if (vm.alive()) {
		let calledOut = vm.step();
		updateDebuggerState(vm);
		if (calledOut) Game.updateUI(vm.state);
		window.gameplayTimer = setTimeout(runimate, 100);
	}
}

function run() {
	stopRunimation();
	vm.running = true;
	while (vm.alive()) {
		vm.step();
	}
	updateDebuggerState(vm);
	Game.updateUI(vm.state);
}

function play() {
	stopRunimation();
	bringToFront($id('game-window'));
	vm.running = true;
	Game.playmation(vm);
}

function reset() {
	stopRunimation();
	vm = new VirtualMachine(asm.code, Game);
	updateDebuggerState(vm);
	Game.updateUI(vm.state);
}

function rand(m) { return Math.floor(Math.random() * m) }
function crand(s) { return s * (Math.random() - Math.random()) }




function prepIDE() {
	window.addEventListener('unload', saveChanges);

	$("#source").addEventListener('keypress', e => {
		if (e.keyCode === 13 && (e.shiftKey || e.ctrlKey || e.metaKey)) comp();
	});

	$("#asm").addEventListener('keypress', e => {
		if (e.keyCode === 13 && (e.shiftKey || e.ctrlKey || e.metaKey)) assemble();
	});

	prepOS();

	$("#source").value = localStorage.source || "// hello, world!";
	$("#autorun").checked = JSON.parse(localStorage.autorun || "false");
	$("#autoplay").checked = JSON.parse(localStorage.autoplay || "false");
}



function updateDebuggerState(vm) {

	function hexDec(v) {
		return '$' + ('0000'+(v & 0xFFFF).toString(16)).substr(-4) + ' ' + ('     ' + v).substr(-6);
	}

	function regFmt(name, value) {
		return `${(name + ' '.repeat(23)).substr(0,23)} ` + hexDec(value);
	}

	// Registers & State
	let n = 0;
	for (let i = 0; i < vm.registers.length; ++i, ++n) {
		let address = -i - 1;
		let d = $("#registers").children[n] ||
						$("#registers").appendChild(document.createElement('pre'));
		d.innerText = regFmt(REGISTER_NAMES[address] || i, vm.registers[i]);

		let r = $("#r" + i);
		if (r) r.innerText = d.innerText;
	}
	$("#clock").innerText = '⏳ ' + vm.clock;

	if (!$("#registers").children[n])
		$('#registers').appendChild(document.createElement('hr'));
	n += 1;
	for (let i = 0; i < vm.state.length; ++i, ++n) {
		let d = $("#registers").children[n] ||
						$("#registers").appendChild(document.createElement('pre'));
		d.innerText = regFmt(Game.SLOTS[i] ? Game.SLOTS[i].name : i, vm.state[i]);
	}

	$("#codepoint").innerText = '';
	if (asm)
	for (let p = -3; p <= 3; ++p) {
		let d = $("#codepoint").appendChild(document.createElement('pre'));
		d.innerText = (vm.pc + p < 0 ? ' ' : asm.disassemble(vm.pc + p)) + '\n';
		if (p === 0) d.style.backgroundColor="yellow";
	}

	$("#stackdepth").innerText = vm.memory.length - vm.sp;
	$("#stack").innerText = '';
	for (let i = vm.sp; i < vm.memory.length; ++i) {
		let d = $("#stack").appendChild(document.createElement('pre'));
		d.innerText = `${('000' + i).substr(-4)}: ` + hexDec(vm.memory[i]);
		if (i === vm.sp) d.style.backgroundColor="yellow";
		if (i === vm.fp) d.style.border='solid 1px black';
	}

	if (vm.memory.length < $("#memory").children.length)
		$("#memory").innerText = '';  // in case the vm has changed sizes
	for (let i = 0; i < vm.memory.length; ++i) {
		let d = $("#memory").children[i] || $("#memory").appendChild(document.createElement('pre'));
		let addr = (asm && asm.symbolTable[i]) ?
			(asm.symbolTable[i] + '    ').substr(0,4) :
			('000' + i).substr(-4);
		d.innerText = addr + ': ' + hexDec(vm.memory[i]);
	}
}

