// Pretty minimal way to run a simple (one-output) ShaderToy shader on any page.
// Example usage:
// <canvas></canvas>
// <script src=joy.js></script>
// <script>
// document.querySelector("canvas").joy(`
// void mainImage(out vec4 fragColor, in vec2 fragCoord) {
//     fragColor = vec4(0.5 + 0.5*cos(iTime + (fragCoord / iResolution.xy).xyx + vec3(0,2,4)),1.0);
// }`);
// </script>
// call canvas.joy(shader_code) to get a shader toy running

function shaderjoy(code, canvas) {
	if (!canvas) {
		canvas = document.body.insertBefore(document.createElement('canvas'), document.body.firstChild);
		canvas.classList.add('joy');
		canvas.style.position = 'fixed';
		canvas.style.left = '0';
		canvas.style.top = '0';
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		canvas.style.zIndex = '-1';
	}

	canvas.iMouse = [0,0,0,0];

	let gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true });

	function mousePos(e) {
		let rect = canvas.getBoundingClientRect();
		return [e.clientX - rect.left,
				rect.height - 1 - (e.clientY - rect.top)];
	}

	canvas.addEventListener("mousemove", e => {
		[canvas.iMouse[0], canvas.iMouse[1]] = mousePos(e);
	});

	canvas.addEventListener("mousedown", e => {
		[canvas.iMouse[0], canvas.iMouse[1]] = [canvas.iMouse[2], canvas.iMouse[3]] = mousePos(e);
	});

	let program = gl.createProgram();

	let aPosition = new Float32Array([
		-1, -1,
		 1, -1,
		-1,  1,
		-1,  1,
		 1, -1,
		 1,  1]);
	const apb = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, apb);
	gl.bufferData(gl.ARRAY_BUFFER, aPosition, gl.STATIC_DRAW);

	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	gl.bindBuffer(gl.ARRAY_BUFFER, apb);
	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	gl.vertexAttribDivisor(0, 0); // per-vertex

	// Vertex shader
	let vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, `#version 300 es
		precision highp float;
		in vec2 aPosition;
		void main() {
			gl_Position = vec4(aPosition, 0, 1);
		}
	`);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(vertexShader));

	// Fragment shader
	let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, `#version 300 es
		precision highp float;

		uniform vec3      iResolution;  // viewport resolution (in pixels)
		uniform float     iTime;        // shader playback time (in seconds)
		uniform float     iGlobalTime;  // obsolescent progenitor of iTime
		uniform float     iTimeDelta;   // render time (in seconds)
		uniform mediump int iFrame;     // shader playback frame
		uniform vec4      iMouse;       // mouse coords. xy: current (if MLB down), zw: click
		uniform vec4      iDate;        // (year, month, day, time in seconds)

		out vec4 FragColor;

		#line 1
		${code}

		void main() {
			mainImage(FragColor, gl_FragCoord.xy);
		}
	`);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(fragmentShader));

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
	gl.useProgram(program);

	window.requestAnimationFrame(tick);

	let T0, T1 = 0, FRAME = 0;

	function tick(clock) {
		if (!canvas.parentNode) return;

		gl.viewport(0, 0, canvas.width, canvas.height);
		if (T0 === undefined) T1 = T0 = clock;
		if (clock - T1 >= 1000/24) {
			FRAME++;
			const now = (clock - T0)/1000;
			gl.uniform3f(gl.getUniformLocation(program, "iResolution"), canvas.width, canvas.height, 1);
			gl.uniform1f(gl.getUniformLocation(program, "iTime"), now);
			gl.uniform1f(gl.getUniformLocation(program, "iGlobalTime"), now);
			gl.uniform1f(gl.getUniformLocation(program, "iTimeDelta"), (clock - T1) / 1000);
			gl.uniform1i(gl.getUniformLocation(program, "iFrame"), FRAME);
			gl.uniform4fv(gl.getUniformLocation(program, "iMouse"), canvas.iMouse);
			let today = new Date();
			gl.uniform4f(gl.getUniformLocation(program, "iDate"), today.getFullYear(), today.getMonth(), today.getDay(), +today);
			T1 = clock;

			gl.drawArrays(gl.TRIANGLES, 0, 6);
		}

		window.requestAnimationFrame(tick);
	}
}
