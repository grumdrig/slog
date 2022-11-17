function $(s) { return document.querySelector(s) }
function $$(s) { return document.querySelectorAll(s) }
HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
function $id(s) { return document.getElementById(s) }


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
	if (runimate.timer) {
		clearTimeout(runimate.timer);
		runimate.timer = null;
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
		runimate.timer = setTimeout(runimate, 100);
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


function saveWindowState() {
	let ws = {};
	Array.from($$(".window")).forEach(w => {
		ws[w.id] = {
			id: w.id,
			left: w.style.left,
			top: w.style.top,
			zIndex: w.style.zIndex ?? '',
			hidden: w.hasAttribute('hidden'),
		};
		let selected = w.$('[role="tab"][aria-selected="true"]');
		if (selected)
			ws[w.id].selectedTab = selected.getAttribute('aria-controls');
	});
	localStorage.windowState = JSON.stringify(ws);
}

function loadWindowState(hwnd) {
	let ws = JSON.parse(localStorage.windowState || '{}');
	if (ws = ws[hwnd.id]) {
		hwnd.style.left = ws.left;
		hwnd.style.top = ws.top;
		let z = parseInt(ws.zIndex);
		if (!Number.isNaN(z)) {
			hwnd.style.zIndex = z;
		}
		ws.hidden ? hwnd.setAttribute('hidden', true) : hwnd.removeAttribute('hidden');
		if (ws.selectedTab)
			changeTabs({
				target: $('[aria-controls="' + ws.selectedTab + '"]'),
				loadingWindowState: true,
			});
	}
}


function bringToFront(hwnd) {
		let hiz = 0;
		Array.from($$('.window'))
			.filter(w => w != hwnd)
			.forEach(w => hiz = Math.max(parseInt(w.style.zIndex || 0), hiz));
		hwnd.style.zIndex = hiz + 1;
}

function prepWindow(hwnd) {
	let handle = hwnd.$(".title-bar");
	const keepinside = false;

	hwnd.style.left = (hwnd.offsetLeft + 80) + 'px';
	hwnd.style.top = hwnd.offsetTop + 'px';
	hwnd.style.position = 'absolute';

	loadWindowState(hwnd);

	(handle || hwnd).addEventListener("mousedown", e => {
		hwnd.dragOrigin = { x: hwnd.offsetLeft - e.pageX,
												y: hwnd.offsetTop  - e.pageY };
		e.preventDefault();
	});
	hwnd.addEventListener("mousedown", e => {
		bringToFront(hwnd);
		saveWindowState();
		// e.preventDefault();
	});
	window.addEventListener("mousemove", e => {
		if (!e.which || !e.buttons) hwnd.dragOrigin = null;
		if (hwnd.dragOrigin) {
			let x = e.pageX + hwnd.dragOrigin.x;
			let y = e.pageY + hwnd.dragOrigin.y;
			if (keepinside) {
				x = Math.max(0, Math.min(x, document.body.clientWidth  - hwnd.offsetWidth));
				y = Math.max(0, Math.min(y, document.body.clientHeight - hwnd.offsetHeight));
			}
			hwnd.style.left = `${x}px`;
			hwnd.style.top  = `${y}px`;
			saveWindowState();
		}
	});
}


function prepIDE() {
	window.addEventListener('unload', saveChanges);

	$("#source").addEventListener('keypress', e => {
		if (e.keyCode === 13 && (e.shiftKey || e.ctrlKey || e.metaKey)) comp();
	});

	$("#asm").addEventListener('keypress', e => {
		if (e.keyCode === 13 && (e.shiftKey || e.ctrlKey || e.metaKey)) assemble();
	});

	$$('[role="tab"]').forEach(tab => tab.addEventListener("click", changeTabs));

	$$(".icon").forEach(element => element.addEventListener('click', e => {
		let win = document.getElementById(element.getAttribute('data-for'));
		if (win.hasAttribute('hidden')) {
			win.removeAttribute('hidden');
			win.style.left = rand(100) + 'px';
			win.style.top = rand(100) + 'px';
		}
		bringToFront(win);
		saveWindowState();
	}));

	$$(".close").forEach(element => element.addEventListener('click', e => {
		element.parentElement.parentElement.parentElement.setAttribute('hidden', true);
		saveWindowState();
	}));

	Array.from($$(".window")).reverse().forEach(prepWindow);

	$("#source").value = localStorage.source || "// hello, world!";
	$("#autorun").checked = JSON.parse(localStorage.autorun || "false");
	$("#autoplay").checked = JSON.parse(localStorage.autoplay || "false");
}



function changeTabs(e) {
	const target = e.target;
	const parent = target.parentNode;
	const grandparent = parent.parentNode;

	// Remove all current selected tabs
	parent
	.$$('[aria-selected="true"]')
	.forEach((t) => t.setAttribute("aria-selected", false));

	// Set this tab as selected
	target.setAttribute("aria-selected", true);

	// Hide all tab panels
	grandparent.$$('[role="tabpanel"]')
	.forEach((p) => p.setAttribute("hidden", true));

	// Show the selected panel
	grandparent.parentNode.$(`#${target.getAttribute("aria-controls")}`)
	.removeAttribute("hidden");

	if (!e.loadingWindowState)
		saveWindowState();
}


function updateDebuggerState(vm) {

	function regFmt(name, value) {
		return `${(name + ' '.repeat(23)).substr(0,23)} $${('0000'+value.toString(16)).substr(-4)} ${value}`;
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
	for (let i = Math.min(vm.sp + 5, vm.memory.length - 1); i >= vm.sp; --i) {
		let d = $("#stack").appendChild(document.createElement('pre'));
		d.innerText = `${('000' + i).substr(-4)}: $${('0000'+vm.memory[i].toString(16)).substr(-4)} ${vm.memory[i]}`;
		if (i === vm.sp) d.style.backgroundColor="yellow";
		if (i === vm.fp) d.style.border='solid 1px black';
	}

	if (vm.memory.length < $("#memory").children.length)
		$("#memory").innerText = '';  // in case the vm has changed sizes
	for (let i = 0; i < vm.memory.length; ++i) {
		let d = $("#memory").children[i] || $("#memory").appendChild(document.createElement('pre'));
		d.innerText = `${('000' + i).substr(-4)}: $${('0000'+vm.memory[i].toString(16)).substr(-4)} ${vm.memory[i]}`;
	}
}
