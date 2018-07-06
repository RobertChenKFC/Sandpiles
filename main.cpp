#include <emscripten.h>
#include <iostream>
#include <cstdint>
#include <chrono>
#include <cstring>

uint32_t *grid;
const uint32_t SIZE = 800;
const uint32_t TOTAL = 640000; 
const uint32_t ENDL = 799;
const uint32_t TOTAL_BYTES = 2560000;

uint32_t front = 320400, back = 320400;

int main() {
	std::cout << "Module ready" << std::endl;
}

extern "C" {

	EMSCRIPTEN_KEEPALIVE
	void setGrid(uint32_t* input) {
		grid = input;
		std::cout << "Setting grid to " << (uint32_t)input << std::endl;
	}

	EMSCRIPTEN_KEEPALIVE
	void toppleGrid() {
		for(uint32_t n = 0; n < 1000; n++) {
			for(uint32_t i = front; i <= back; i++) {
				if(grid[i] > 3) {
					grid[i] -= 4;
					const uint32_t col = i % SIZE, row = i / SIZE;
					const uint32_t prev = i - 1, next = i + 1;
					const uint32_t top = i - SIZE, bottom = i + SIZE;
					if(col != 0) {
						grid[prev]++;
						if(prev < front) front = prev;
					}
					if(col != ENDL) {
						grid[next]++;
						if(next > back) back = next;
					}
					if(row != 0) {
						grid[top]++;
						if(top < front) front = top;
					}
					if(row != ENDL) {
						grid[bottom]++;
						if(bottom > back) back = bottom;
					}
				}	
			}	
		}
	}

	EMSCRIPTEN_KEEPALIVE
	void toppleGridFast() {
		for(uint32_t n = 0; n < 10; n++) {
			for(uint32_t i = front; i <= back; i++) {
				if(grid[i] > 3) {
					grid[i] -= 4;
					const uint32_t col = i % SIZE, row = i / SIZE;
					const uint32_t prev = i - 1, next = i + 1;
					const uint32_t top = i - SIZE, bottom = i + SIZE;
					if(col != 0) {
						grid[prev]++;
						if(prev < front) front = prev;
					}
					if(col != ENDL) {
						grid[next]++;
						if(next > back) back = next;
					}
					if(row != 0) {
						grid[top]++;
						if(top < front) front = top;
					}
					if(row != ENDL) {
						grid[bottom]++;
						if(bottom > back) back = bottom;
					}
				}	
			}	
		}
	}

	EMSCRIPTEN_KEEPALIVE
	void benchmark() {
		uint32_t *test = new uint32_t[TOTAL];	
		std::memset(test, 0, TOTAL_BYTES);
		test[320400] = 1000000;	

		auto start = std::chrono::high_resolution_clock::now();

		for(uint32_t n = 0; n < 10000; n++) {
			for(uint32_t i = 0; i < TOTAL; i++) {
				if(test[i] > 3) {
					test[i] -= 4;
					const uint32_t col = i % SIZE, row = i / SIZE;
					if(col != 0) test[i - 1]++;
					if(col != ENDL) test[i + 1]++;
					if(row != 0) test[i - SIZE]++;
					if(row != ENDL) test[i + SIZE]++;
				}	
			}
		}

		auto end = std::chrono::high_resolution_clock::now();
		std::chrono::duration<double> diff = end - start;
		std::cout << "Benchmark took " << diff.count() << "s" << std::endl;

		delete[] test;
	}

}
