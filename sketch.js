const SIZE = 800;
const ENDL = SIZE - 1;
const TOTAL = SIZE * SIZE;
const TOTAL_BYTES = TOTAL << 2;

let grid = new Uint32Array(TOTAL);
let buf;
let arrBegin;
let arrEnd;
let started = false;
let liveMode = false;
let front = 320400;
let back = 320400;

function setup() {
	createCanvas(SIZE, SIZE).parent("#canvas");	

	for(let i = 0; i < TOTAL; i++) grid[i] = 0;
	grid[320400] = 1000000;

	select("#benchmark").mousePressed(() => {
		if(started) console.log("Cannot benchmark while running, please refresh");
		else Module.ccall("benchmark");
	});

	select("#start").mousePressed(() => {
		buf = Module._malloc(TOTAL_BYTES);
		Module.HEAPU32.set(grid, buf >> 2);
		Module.ccall("setGrid", null, ["number"], [buf]);

		// test
		Module.ccall("setGrid", null, ["number"], [buf]);

		started = true;
		arrBegin = buf >> 2;
		arrEnd = arrBegin + TOTAL;
	});

	select("#live_mode").mousePressed(() => {
		liveMode = !liveMode;	
	});

}

function topple() {
	if(liveMode) {
		for(let n = 0; n < 5; n++) {
			for(let i = front; i <= back; i++) {
				if(grid[i] > 3) {
					grid[i] -= 4;
					const col = i % SIZE, row = floor(i / SIZE);
					if(col != 0) {
						grid[i - 1]++;
						front = (i - 1) < front ? (i - 1) : front;
					}
					if(col != ENDL) {
						grid[i + 1]++;
						back = (i + 1) > back ? (i + 1) : back;
					}
					if(row != 0) {
						grid[i - SIZE]++;
						front = (i - SIZE) < front ? (i - SIZE) : front;
					}
					if(row != ENDL) {
						grid[i + SIZE]++;
						back = (i + SIZE) > back ? (i + SIZE) : back;
					}
				}	
			}	
		}
	}
	else {
		Module.ccall("toppleGrid");
		grid = Module.HEAPU32.subarray(arrBegin, arrEnd);
	}
}

function draw() {
	if(started) topple();	

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
