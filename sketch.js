const SIZE = 800;
const TOTAL = SIZE * SIZE;
const TOTAL_BYTES = TOTAL << 2;

let grid = new Uint32Array(TOTAL);
let buf;
let arrBegin;
let arrEnd;
let started = false;
let liveMode = false;

function setup() {
	createCanvas(SIZE, SIZE).parent("#canvas");	

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

	select("#live_mode").mousePressed(() => liveMode = !liveMode);

	select("#clear").mousePressed(() => {
		for(let i = 0; i < TOTAL; i++) grid[i] = 0;
		started = false;	
	});
}

function topple() {
	if(liveMode) Module.ccall("toppleGridFast");
	else Module.ccall("toppleGrid");
	grid = Module.HEAPU32.subarray(arrBegin, arrEnd);
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
