emcc -o index.js main.cpp -s WASM=1 -s EXPORTED_FUNCTIONS="['_setGrid', '_toppleGrid', '_benchmark']" -s EXTRA_EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']" -O3 -s TOTAL_MEMORY=67108864 -std=c++11
