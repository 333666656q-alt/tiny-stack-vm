// Tiny stack VM: byte-exact implementation of make.fun's tiny stack ISA (kit: generator/subject/ISA.md).
import { mkdirSync as M, readdirSync as R, readFileSync as F, writeFileSync as W } from 'node:fs';
import { join } from 'node:path';
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
function run(p, q) {
const n = p.length;
const D = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256), out = new Uint8Array(65536);
let s = 0, c = 0, o = 0, i = 0, pc = 0, st = 0, a, b;
try {
for (;;) {
if (st === 1e6) throw 10;
if (pc < 0 || pc >= n) throw 9;
st++;
const op = p[pc++];
switch (op) {
case 0: throw 0;
case 1:
if (pc >= n) throw 9;
if (s === 256) throw 3;
D[s++] = (p[pc++] << 24) >> 24;
break;
case 2:
if (pc + 3 >= n) throw 9;
if (s === 256) throw 3;
D[s++] = p[pc] | (p[pc + 1] << 8) | (p[pc + 2] << 16) | (p[pc + 3] << 24);
pc += 4;
break;
case 3:
if (s < 1) throw 2;
s--;
break;
case 4:
if (s < 1) throw 2;
if (s === 256) throw 3;
D[s] = D[s - 1];
s++;
break;
case 5:
if (s < 2) throw 2;
a = D[s - 1]; D[s - 1] = D[s - 2]; D[s - 2] = a;
break;
case 6:
if (s < 2) throw 2;
if (s === 256) throw 3;
D[s] = D[s - 2];
s++;
break;
case 7:
if (s < 3) throw 2;
a = D[s - 3]; D[s - 3] = D[s - 2]; D[s - 2] = D[s - 1]; D[s - 1] = a;
break;
case 16: case 17: case 18: case 19: case 20: case 21: case 22:
case 24: case 25: case 26: case 28: case 29: case 30:
case 32: case 33: case 34: {
if (s < 2) throw 2;
b = D[s - 1];
a = D[s - 2];
if (b === 0 && op >= 19 && op <= 22) throw 4;
let r;
switch (op) {
case 16: r = (a + b) | 0; break;
case 17: r = (a - b) | 0; break;
case 18: r = Math.imul(a, b); break;
case 19: r = a === (1 << 31) && b === -1 ? a : (a / b) | 0; break;
case 20: r = b === -1 ? 0 : (a % b) | 0; break;
case 21: r = Math.floor((a >>> 0) / (b >>> 0)) | 0; break;
case 22: r = ((a >>> 0) % (b >>> 0)) | 0; break;
case 24: r = a & b; break;
case 25: r = a | b; break;
case 26: r = a ^ b; break;
case 28: r = a << (b & 31); break;
case 29: r = a >> (b & 31); break;
case 30: r = (a >>> (b & 31)) | 0; break;
case 32: r = a === b ? 1 : 0; break;
case 33: r = a < b ? 1 : 0; break;
default: r = (a >>> 0) < (b >>> 0) ? 1 : 0;
}
D[s - 2] = r;
s--;
break;
}
case 23:
if (s < 1) throw 2;
D[s - 1] = -D[s - 1] | 0;
break;
case 27:
if (s < 1) throw 2;
D[s - 1] = ~D[s - 1];
break;
case 48: case 49: case 50: {
if (pc + 1 >= n) throw 9;
const rel = ((p[pc] | (p[pc + 1] << 8)) << 16) >> 16;
pc += 2;
let t = op === 48;
if (op !== 48) {
if (s < 1) throw 2;
const v = D[--s];
t = op === 49 ? v === 0 : v !== 0;
}
if (t) pc += rel;
break;
}
case 51:
if (pc + 1 >= n) throw 9;
if (c === 64) throw 7;
C[c++] = pc + 2;
pc = p[pc] | (p[pc + 1] << 8);
break;
case 52:
if (c === 0) throw 8;
pc = C[--c];
break;
case 64:
if (s < 1) throw 2;
a = D[s - 1];
if (a < 0 || a > 255) throw 6;
D[s - 1] = M[a];
break;
case 65:
if (s < 2) throw 2;
a = D[s - 1];
if (a < 0 || a > 255) throw 6;
M[a] = D[s - 2];
s -= 2;
break;
case 80: {
if (s < 1) throw 2;
const w = String(D[s - 1]);
if (o + w.length > 65536) throw 11;
s--;
for (let k = 0; k < w.length; k++) out[o++] = w.charCodeAt(k);
break;
}
case 81:
if (s < 1) throw 2;
if (o === 65536) throw 11;
out[o++] = D[--s] & 255;
break;
case 82:
if (s === 256) throw 3;
D[s++] = i < q.length ? q[i++] : -1;
break;
case 83:
if (s < 1) throw 2;
throw D[s - 1] & 255;
default: throw 5;
}
}
} catch (e) {
return { out: out.subarray(0, o), code: e };
}
}
for (const id of R(I).sort()) {
const r = run(F(join(I, id, 'program.bin')), F(join(I, id, 'input.bin')));
M(join(O, id), { recursive: true });
W(join(O, id, 'stdout.bin'), r.out);
W(join(O, id, 'exit.txt'), r.code + '\n');
}
