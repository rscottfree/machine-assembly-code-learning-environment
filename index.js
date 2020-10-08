import { go, resume as cpuResume } from './cpu.js';

import { printMem as showMem, printHex, printBinary, cpuFunctions } from './cpu-functions.js';
import { ram } from './ram.js';


go();

export function printMem(address) {
    console.info(showMem(address));
}

export function registers() {
    cpuFunctions.debgImplicit();
}

export function suspend() {
    setSuspend(true);
}

export function resume() {
    cpuResume(false);
}
