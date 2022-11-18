function $(s) { return document.querySelector(s) }
function $$(s) { return document.querySelectorAll(s) }
HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
function $id(s) { return document.getElementById(s) }

function hide(win) { win.setAttribute('hidden', true) }
function show(win) { win.removeAttribute('hidden') }

function prepOS() {
	$$('[role="tab"]').forEach(tab => tab.addEventListener("click", changeTabs));

	$$(".icon").forEach(element => element.addEventListener('click', e => {
		let win = document.getElementById(element.getAttribute('data-for'));
		if (win.hasAttribute('hidden')) {
			win.removeAttribute('hidden');
			win.style.left = Math.floor(Math.random() * 100) + 'px';
			win.style.top = Math.floor(Math.random() * 100) + 'px';
		}
		bringToFront(win);
		saveWindowState();
	}));

	$$(".close").forEach(element => element.addEventListener('click', e => {
		element.parentElement.parentElement.parentElement.setAttribute('hidden', true);
		saveWindowState();
	}));

	Array.from($$(".window")).reverse().forEach(prepWindow);
}


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


