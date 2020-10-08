import {
    pc, getInterruptFlag, getIrqRunning, setIrqRunning, setSuspend
} from './cpu-registers.js';
import { stopVideo, drawText } from './text-mode-screen.js';
import { instructionsMap } from './instruction-set.js';
import { printHex, getByteAndInc, irqFn, cpuFunctions, printMem } from './cpu-functions.js';
import { loadKernal, debugPoints, suspendPoints } from './parser.js';
import { enableKeyboard } from './keyboard.js';


const intervalLength = 32; // milliseconds for one interval (program steps + interrupt steps)
const stepsPerInterval = 8000; // 16_000; // ~1_000_000 per second, or 1000 per millisecond, or 16_000 per 16 milliseconds
const totalIntervals = 1024; // How many intervals to execute before stopping the CPU
let intervals = 0;
let n = 0;
let start;

// The limit on how many intervals a single interrupt can use up before a CPU exception is thrown.
const irqStepsPerInterval = 1024; // 32


async function go() {
    await loadKernal();
    // setTimeout(() => {
        // startDrawing();
    // }, 2000);
    // draw();

    startDrawing();
    enableKeyboard();

    setTimeout(() => {
        console.info('start');
        console.time('totalTime');
        startStepping();
    }, 500); // wait for page to settle
}

let intervalEndReal = 0;
let intervalDiff = 0;
let intervalDelay = 0;
let intervalStart = 0;
let nexti;
let shouldSuspend = false;

function startStepping() {
    intervalStart = Date.now();
    // console.time('interval');

    // Store start time for metrics
    if (intervals === 0) {
        start = Date.now();
    }

    // Enforce max intervals (for debugging mostly)
    if (intervals >= totalIntervals) {
        console.timeEnd('totalTime');
        const diff = Date.now() - start;
        console.info('done', n, intervals, n / intervals, diff, `${diff / intervalLength} / ${totalIntervals}`);
        console.info(`${((totalIntervals / (diff / intervalLength)) * 100).toFixed(2)}% efficient`);
        cpuFunctions.debgImplicit();
        stopVideo();
        return;
    }

    // Run this interval's steps (1 step = 1 instruction + memory)
    for (nexti = 0; nexti < stepsPerInterval; nexti++) {
        n++;
        shouldSuspend = next();
        if (shouldSuspend) {
            return;
        }
    }

    // IRQ
    if (getInterruptFlag() === false) {
        setIrqRunning(true);
        irqFn();
        let irqi = 0;
        while (getIrqRunning() === true) {
            shouldSuspend = next();
            if (shouldSuspend) {
                return;
            }

            irqi++;

            if (irqi >= irqStepsPerInterval) {
                throw new Error('IRQ took too long!');
            }
        }
    }

    // Calculate remaining interval time
    intervalEndReal = Date.now();
    intervalDiff = (intervalEndReal - intervalStart);
    intervalDelay = intervalDiff >= intervalLength ? 0 : intervalLength - intervalDiff;

    scheduleNextInterval(intervalDelay);
}

function scheduleNextInterval(delay) {
    // Wait out the remainder of the interval time
    setTimeout(() => {
        intervals++;
        // console.timeEnd('interval');
        startStepping();
    }, delay);
}

function startDrawing() {
    drawText();
    requestAnimationFrame(startDrawing);
}

let nextByte;
let instFn;
let didSuspend = false;
/**
 * Process next instruction
 */
function next() {
    // Check .debug
    if (debugPoints[pc] !== undefined && debugPoints[pc].length > 0 && !didSuspend) {
        debugPoints[pc].forEach(dp => {
            if (/^\$[a-f0-9]{4}$/.test(dp)) {
                console.info('debug', `${printHex(pc)}:`, printMem(parseInt(dp.slice(1), 16)));
            } else if (dp.length > 0) {
                console.info('debug', `${printHex(pc)}:`, dp);
            } else {
                cpuFunctions.debgImplicit();
            }
        });
    }

    // Check .suspend
    if (suspendPoints[pc] !== undefined && suspendPoints[pc] === true && !didSuspend) {
        console.info('CPU SUSPENDED. Call `resume()` to continue.');
        didSuspend = true;
        setSuspend(true);
        return true;
    } else {
        didSuspend = false;
    }

    // Get and execute next machine code instruction
    nextByte = getByteAndInc();
    instFn = instructionsMap[nextByte]?.fn;

    if (instFn) {
        instFn();
    } else {
        const startMem = pc - (pc % 8) - 8;
        throw new Error(`Unknown instruction ${printHex(pc-1)}: ${printHex(nextByte)} \n${printMem(startMem)} \n${printMem(startMem + 8)} \n${printMem(startMem + 16)}`);
    }

    return false;
}

function resume() {
    scheduleNextInterval(0);
}

export { go, resume };