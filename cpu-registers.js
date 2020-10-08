import { memoryMap } from './memory-map.js';
import { printBinary, printHex } from './cpu-functions.js';

/*
https://dwheeler.com/6502/oneelkruns/asm1step.html
+-------------------------+---------------------+
|                         |  N       Z       C  |
+-------------------------+---------------------+
| A, X, or Y  <  Memory   |  1       0       0  |
| A, X, or Y  =  Memory   |  0       1       1  |
| A, X, or Y  >  Memory   |  0       0       1  |
+-----------------------------------------------+

The BIT instruction tests bits in memory with the accumulator but
changes neither.  Only processor status flags are set.  The contents
of the specified memory location are logically ANDed with the
accumulator, then the status bits are set such that,
   * N receives the initial, un-ANDed value of memory bit 7.
   * V receives the initial, un-ANDed value of memory bit 6.
   * Z is set if the result of the AND is zero, otherwise reset.
*/

let pc = memoryMap['kernal'][0]; // program counter
let sp = 0xff; // stack pointer (base ($0100) + sp) // points to next free spot

let sr =     0b0_0_0_0_0_0_0_0; // status register
const FLAGS = `N V - B D I Z C`;

const CARRY_MASK =         0b00000001; // C = Carry              1
const ZERO_MASK =          0b00000010; // Z = Zero               2
const INTERRUPT_MASK =     0b00000100; // I = Interrupt Disable  4
const DECIMAL_MODE_MASK =  0b00001000; // D = Decimal Mode       8
const BREAK_COMMAND_MASK = 0b00010000; // B = Break Command     16
const UNUSED_MASK =        0b00100000; // - = Unused            32
const OVERFLOW_MASK =      0b01000000; // V = Overflow          64
const NEGATIVE_MASK =      0b10000000; // N = Negative         128


let acc = 0x00; // Accumulator
let breg = 0x0000; // B register
let xreg = 0x00; // X register
let yreg = 0x00; // Y register

let irqRunning = false;
let suspend = false;

function pcInc() {
    setPc(pc + 1);
}

function setPc(address) {
    pc = address & 0xffff;
}

function setSp(value) {
    sp = value & 0xff;
}

function setAcc(value) {
    acc = value & 0xff;
    setZeroFlag(acc);
    setNegativeFlag(acc);
}

function setSr(value) {
    sr = value & 0xff;
}

function setX(value) {
    xreg = value & 0xff;
    setZeroFlag(xreg);
    setNegativeFlag(xreg);
}

function setY(value) {
    yreg = value & 0xff;
    setZeroFlag(yreg);
    setNegativeFlag(yreg);
}

function getCarryBit() {
    return sr & CARRY_MASK;
}

function getCarryFlag() {
    return (sr & CARRY_MASK) === CARRY_MASK;
}

// True or false
function setCarryFlag(boolValue) {
    if (boolValue === true) {
        sr = sr | CARRY_MASK;
    } else {
        sr = sr & ~CARRY_MASK;
    }
}

function getZeroFlag() {
    return (sr & ZERO_MASK) === ZERO_MASK;
}

// The value that may be zero
function setZeroFlag(value) {
    if (value === 0) {
        sr = sr | ZERO_MASK;
    } else {
        sr = sr & ~ZERO_MASK;
    }
}

function getNegativeFlag() {
    return (sr & NEGATIVE_MASK) === NEGATIVE_MASK;
}

// The value that may be negative
function setNegativeFlag(value) {
    sr = (value & NEGATIVE_MASK) | (sr & ~NEGATIVE_MASK);
}

function getOverflowFlag() {
    return (sr & OVERFLOW_MASK) === OVERFLOW_MASK;
}

// True or false
function setOverflowFlag(boolValue) {
    if (boolValue === true) {
        sr = sr | OVERFLOW_MASK;
    } else {
        sr = sr & ~OVERFLOW_MASK;
    }
}

function getInterruptFlag() {
    return (sr & INTERRUPT_MASK) === INTERRUPT_MASK;
}

// True or false
function setInterruptFlag(boolValue) {
    if (boolValue === true) {
        sr = sr | INTERRUPT_MASK;
    } else {
        sr = sr & ~INTERRUPT_MASK;
    }
}

function getDecimalFlag() {
    return (sr & DECIMAL_MODE_MASK) === DECIMAL_MODE_MASK;
}

// True or false
function setDecimalFlag(boolValue) {
    if (boolValue === true) {
        sr = sr | DECIMAL_MODE_MASK;
    } else {
        sr = sr & ~DECIMAL_MODE_MASK;
    }
}

function getIrqRunning() {
    return irqRunning;
}

function setIrqRunning(value) {
    irqRunning = value;
}

function getSuspend() {
    return suspend;
}

function setSuspend(value) {
    suspend = value;
}

export {
    pc, sp, sr, acc, xreg, yreg,
    pcInc,
    setAcc, setX, setY, setPc, setSp, setSr,
    setZeroFlag, setCarryFlag, setNegativeFlag,
    getZeroFlag, getCarryFlag, getNegativeFlag,
    getOverflowFlag, setOverflowFlag,
    getCarryBit,
    getInterruptFlag, setInterruptFlag,
    getDecimalFlag, setDecimalFlag,
    getIrqRunning, setIrqRunning,
    getSuspend, setSuspend
};