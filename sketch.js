const SIZE = 800;
const ENDL = SIZE - 1;
const TOTAL = SIZE * SIZE;
const TOTAL_BYTES = TOTAL << 2;
const FAST = 0, NORMAL = 1, WEBGL = 2;

let grid = new Uint32Array(TOTAL);
let buf;
let arrBegin;
let arrEnd;
let modeSelect;
let mode = FAST;
let started = false;
let gpu;
let webglTopple;

function setup() {
	createCanvas(SIZE, SIZE).parent("#canvas");	

	// REVISE
	for(let i = 0; i < TOTAL; i++) grid[i] = 0;
	grid[320400] = 1000000;

	select("#benchmark").mousePressed(() => {
		if(started) console.log("Cannot benchmark while running, please restart");
		else Module.ccall("benchmark");
	});

	select("#start").mousePressed(() => {
		buf = Module._malloc(TOTAL_BYTES);
		Module.HEAPU32.set(grid, buf >> 2);
		Module.ccall("setGrid", null, ["number"], [buf]);

		started = true;
		arrBegin = buf >> 2;
		arrEnd = arrBegin + TOTAL;
	});

	
	modeSelect = select("#mode");
	modeSelect.changed(() => {
		switch(modeSelect.value()) {
		case "fast":
			mode = FAST;
			break;
		case "normal":
			mode = NORMAL;
			break;
		case "webgl":
			mode = WEBGL;

			gpu = new GPU();
			webglTopple = gpu.createKernel(function(grid, SIZE, ENDL) {
				const i = this.thread.x;
				let sum = grid[i];

				if(sum > 3) sum -= 4;

				const col = i % SIZE, row = i / SIZE;
				const prev = i - 1, next = i + 1;
				const top = i - SIZE, bottom = i + SIZE;
				if(col != 0 && grid[prev] > 3) sum++;
				if(col != ENDL && grid[next] > 3) sum++;
				if(row != 0 && grid[top] > 3) sum++;
				if(row != ENDL && grid[bottom] > 3) sum++;

				return sum;
			}).setOutput([TOTAL]);
			break;
		}
	});

	select("#clear").mousePressed(() => {
		for(let i = 0; i < TOTAL; i++) grid[i] = 0;
		started = false;	
	});
}

function topple() {
	switch(mode) {
	case FAST:
		Module.ccall("toppleGridFast");
		grid = Module.HEAPU32.subarray(arrBegin, arrEnd);
		break;
	case NORMAL:
		Module.ccall("toppleGrid");
		grid = Module.HEAPU32.subarray(arrBegin, arrEnd);
		break;
	case WEBGL:
		grid = webglTopple(grid, SIZE, ENDL);
		break;
	}
}

function draw() {
	if(started) topple();	

	if(mouseIsPressed) grid[mouseY * SIZE + mouseX] += 1000000;	

	loadPixels();

	let pixelIndex = 0;
	for(let i = 0; i < TOTAL; i++) {
		switch(grid[i]) {
		case 0:
			pixels[pixelIndex++] = 255;
			pixels[pixelIndex++] = 255;
			pixels[pixelIndex++] = 0;
			pixels[pixelIndex++] = 255;
			break;
		case 1:
			pixels[pixelIndex++] = 0;
			pixels[pixelIndex++] = 185;
			pixels[pixelIndex++] = 63;
			pixels[pixelIndex++] = 255;
			break;
		case 2:
			pixels[pixelIndex++] = 0;
			pixels[pixelIndex++] = 104;
			pixels[pixelIndex++] = 255;
			pixels[pixelIndex++] = 255;
			break;
		case 3:
			pixels[pixelIndex++] = 122;
			pixels[pixelIndex++] = 0;
			pixels[pixelIndex++] = 200;
			pixels[pixelIndex++] = 255;
			break;
		default:
			pixels[pixelIndex++] = 255;
			pixels[pixelIndex++] = 0;
			pixels[pixelIndex++] = 0;
			pixels[pixelIndex++] = 255;
			break;
		}	
	}

	updatePixels();
}
