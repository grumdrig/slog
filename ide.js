function $(s) { return document.querySelector(s) }
function $$(s) { return document.querySelectorAll(s) }
HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
function $id(s) { return document.getElementById(s) }


function createDebuggerWindow() {
	let div = document.body.appendChild(document.createElement('div'));
	div.outerHTML = `
<div class=window hidden id=debugger-window>
	<div class="title-bar">
		<div class="title-bar-text">Debugger</div>
		<div class="title-bar-controls">
			<button aria-label="Close" class=close></button>
		</div>
	</div>

	<div class="window-body">
		<div id=debugger>
			<span>Execution point</span>
			<span>Stack [<span id=stackdepth></span>]</span>

			<div id=codepoint></div>
			<div id=stack></div>

			<span>Registers &amp; State</span>
			<span>Memory</span>

			<div class=brain><div id=registers></div></div>
			<div class=brain><div id='memory'></div></div>
		</div>
		<div class=nobo>
			<button onclick="step()">Step</button>
			<button onclick="bigstep()">Bigstep</button>
			<button onclick="runimate()">Runimate</button>
			<button onclick="run()">Run</button>
			<button onclick="play()">Play</button>
			<button onclick="reset()">Reset</button>
		</div>
		<div class="status-bar" id=debugbar>
			<p class="status-bar-field" id=r0>PC</p>
			<p class="status-bar-field" id=r1>SP</p>
			<p class="status-bar-field" id=r2>FP</p>
			<p class="status-bar-field" id=r3>AX</p>
			<p class="status-bar-field" id=clock>CK</p>
		</div>
	</div>
</div>
`;

	document.body.appendChild(document.createElement('div')).outerHTML = `
<div class=icon data-for=debugger-window>
	<img src=debugger.png>
	<div>Debugger</div>
</div>`;

}

function createEditorWindow() {
	document.body.appendChild(document.createElement('div')).outerHTML = `
	<div class=window id=editor-window>
	<div class="title-bar">
		<div class="title-bar-text">Source Code Editor</div>
		<div class="title-bar-controls">
			<button aria-label="Close" class=close></button>
		</div>
	</div>
	<div class="window-body" id="sources">
		<section class="tabs">
			<menu role="tablist" aria-label="Editor Tabs">
				<button role="tab" aria-selected="true" aria-controls="tab-A">Source</button>
				<button role="tab" aria-controls="tab-B">Assembly</button>
				<button role="tab" aria-controls="tab-C">Disassembly</button>
				<button role="tab" aria-controls="tab-D">Interface</button>
			</menu>
			<article role="tabpanel" id="tab-A">
				<textarea rows=16 cols=50 id=source></textarea><br/>
				<button onclick="comp()">Compile</button>
				<span style="margin-left: 10px">&nbsp;</span>
				<input type=checkbox id=autorun><label for=autorun>Autorun</label></input>
				<input type=checkbox id=autoplay><label for=autoplay>Autoplay</label></input>
				<input type=checkbox id=importinterface checked><label for=importinterface>Import interface</label></input>
			</article>
			<article role="tabpanel" hidden id="tab-B">
				<textarea rows=16 cols=50 id=asm></textarea>
				<button onclick="assemble()">Assemble</button>
			</article>
			<article role="tabpanel" hidden id="tab-C">
				<textarea readonly rows=18 cols=50 id=machine></textarea>
			</article>
			<article role="tabpanel" hidden id="tab-D">
				<textarea readonly rows=18 cols=60 id=interface></textarea>
			</article>
		</section>
		<div class="status-bar">
			<p class="status-bar-field" id=errors></p>
		</div>
	</div>
</div>`;

	document.body.appendChild(document.createElement('div')).outerHTML = `
<div class=icon data-for=editor-window>
	<img src=editor.png>
	<div>Editor</div>
</div>`;
}




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
	updateGame(vm.state);
}

function bigstep() {
	stopRunimation();
	playmation(true);
	updateDebuggerState(vm);
	updateGame(vm.state);
}

function stopRunimation() {
	if (runimate.timer) {
		clearTimeout(runimate.timer);
		runimate.timer = null
		$id('task').innerHTML = 'Paused';
		animate.progress = 0;
		setTaskBar();
	}
}

function runimate() {
	if (vm.alive()) {
		let calledOut = vm.step();
		updateDebuggerState(vm);
		if (calledOut) updateGame(vm.state);
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
	updateGame(vm.state);
}

function play() {
	stopRunimation();
	bringToFront($id('game-window'));
	vm.running = true;
	playmation();
}

function setTaskBar() {
	// setBar('task', animate.progress, animate.duration, 0, '#ace97c');
	let bar  = $('#taskbar > div:nth-child(1)');
	let text = $('#taskbar > div:nth-child(2)');
	if (animate.duration > 0) {
		let pct = 100 * animate.progress / animate.duration;
		bar.style.width = pct.toFixed(2) + "%";
		text.innerText = Math.round(pct) + '%';
	} else {
		bar.style.width = 0;
		text.innerText = "";
	}
}



function reset() {
	stopRunimation();
	vm = new VirtualMachine(asm.code, Game);
	updateDebuggerState(vm);
	updateGame(vm.state);
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
			.forEach(w => hiz = Math.max(parseInt(w.style.zIndex ?? 0), hiz));
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

	createDebuggerWindow();
	createEditorWindow();

	$("#source").addEventListener('keypress', e => {
		if (e.keyCode === 13 && (e.shiftKey || e.ctrlKey || e.metaKey)) comp();
	});

	$("#asm").addEventListener('keypress', e => {
		if (e.keyCode === 13 && (e.shiftKey || e.ctrlKey || e.metaKey)) assemble();
	});

	$$('[role="tab"]').forEach(tab => tab.addEventListener("click", changeTabs));

	$("#interface").value = Game.generateInterface();

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
		d.innerText = regFmt(SLOTS[i] ? SLOTS[i].name : i, vm.state[i]);
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
