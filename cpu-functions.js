import { ram, getByte, setByte } from './ram.js';
import {
    pc, sr, sp, acc, xreg, yreg,
    pcInc,
    setAcc, setX, setY, setPc, setSp, setSr,
    setCarryFlag, setZeroFlag,
    getCarryFlag, getZeroFlag, getNegativeFlag,
    getCarryBit, setOverflowFlag,
    setInterruptFlag, getInterruptFlag,
    setDecimalFlag, getDecimalFlag, setNegativeFlag,
    setIrqRunning
} from './cpu-registers.js';
import { keybuf, clearKeybuf, KEYBUF_SIZE } from './keyboard.js';

export const cpuFunctions = {
    debgImplicit: () => {
        console.info(
            `\nPC   NV-BDIZC SP A  X  Y` +
            `\n${pc.toString(16)} ${printBinary(sr)} ${printHex(sp)} ${printHex(acc)} ${printHex(xreg)} ${printHex(yreg)}`
        );
    },

    debgAbsolute: () => {
        const address = getAbsoluteAddress();
        console.info(printMem(address));
    },

    erroImplicit: () => {
        console.error(`Error \n${printMem(pc - 8)} \n${printMem(pc)}`);
        cpuFunctions.debgImplicit();
    },

    jmpAbsolute: () => {
        setPc(getAbsoluteAddress());
    },

    jmpIndirect: () => {
        setPc(getByte(getAbsoluteAddress()));
    },

    jmpAbsoluteIndexedIndirectX: () => {
        const finalAddress = getByte(getAbsoluteXAddress());
        setPc(getByte(finalAddress));
    },

    jsrAbsolute: () => {
        // push high byte then low byte
        const returnAddress = (pc + 2) & 0xffff ;
        stackPush(returnAddress >> 8);
        stackPush(returnAddress & 0xff);

        setPc(getAbsoluteAddress());
    },

    rtsImplicit: () => {
        // Pulls low byte then high byte
        const lowByte = stackPull();
        const highByte = stackPull();
        const address = (highByte << 8) + lowByte;
        setPc(address & 0xffff);
    },

    rtiImplicit: () => {
        setSr(stackPull());

        // Pulls low byte then high byte
        const lowByte = stackPull();
        const highByte = stackPull();
        const address = (highByte << 8) + lowByte;
        setPc(address & 0xffff);
        setIrqRunning(false);
    },

    ldaImmediate: () => {
        setAcc(getImmediateValue());
    },

    ldaAbsolute: () => {
        setAcc(getAbsoluteValue());
    },

    ldaZeroPage: () => {
        setAcc(getZeroPageValue());
    },

    ldaZeroPageX: () => {
        setAcc(getZeroPageXValue());
    },

    ldaAbsoluteX: () => {
        setAcc(getAbsoluteXValue());
    },

    ldaAbsoluteY: () => {
        setAcc(getAbsoluteYValue());
    },

    ldaIndexedIndirectX: () => {
        setAcc(getIndexedIndirectXValue());
    },

    ldaIndirectIndexedY: () => {
        setAcc(getIndirectIndexedYValue());
    },

    ldxImmediate: () => {
        setX(getImmediateValue());
    },

    ldxZeroPage: () => {
        setX(getZeroPageValue());
    },

    ldxZeroPageY: () => {
        setX(getZeroPageYValue());
    },

    ldxAbsolute: () => {
        setX(getAbsoluteValue());
    },

    ldxAbsoluteY: () => {
        setX(getAbsoluteYValue());
    },

    ldyImmediate: () => {
        setY(getImmediateValue());
    },

    ldyZeroPage: () => {
        setY(getZeroPageValue());
    },

    ldyZeroPageX: () => {
        setY(getZeroPageXValue());
    },

    ldyAbsolute: () => {
        setY(getAbsoluteValue());
    },

    ldyAbsoluteX: () => {
        setY(getAbsoluteXValue());
    },

    staZeroPage: () => {
        setByte(getZeroPageAddress(), acc);
    },

    staZeroPageX: () => {
        setByte(getZeroPageXAddress(), acc);
    },

    staAbsolute: () => {
        setByte(getAbsoluteAddress(), acc)
    },

    staAbsoluteX: () => {
        setByte(getAbsoluteXAddress(), acc);
    },

    staAbsoluteY: () => {
        setByte(getAbsoluteYAddress(), acc);
    },

    staIndexedIndirectX: () => {
        setByte(getIndexedIndirectXAddress(), acc);
    },

    staIndirectIndexedY: () => {
        setByte(getIndirectIndexedYAddress(), acc);
    },

    stxAbsolute: () => {
        setByte(getAbsoluteAddress(), xreg)
    },

    stxZeroPage: () => {
        setByte(getZeroPageAddress(), xreg);
    },

    stxZeroPageY: () => {
        setByte(getZeroPageYAddress(), xreg);
    },

    styAbsolute: () => {
        setByte(getAbsoluteAddress(), yreg)
    },

    styZeroPage: () => {
        setByte(getZeroPageAddress(), yreg);
    },

    styZeroPageX: () => {
        setByte(getZeroPageXAddress(), yreg);
    },

    cmpImmediate: () => {
        compare(acc, getImmediateValue());
    },

    cmpZeroPage: () => {
        compare(acc, getZeroPageValue());
    },

    cmpZeroPageX: () => {
        compare(acc, getZeroPageXValue());
    },

    cmpAbsolute: () => {
        compare(acc, getAbsoluteValue());
    },

    cmpAbsoluteX: () => {
        compare(acc, getAbsoluteXValue());
    },

    cmpAbsoluteY: () => {
        compare(acc, getAbsoluteYValue());
    },

    cmpIndexedIndirectX: () => {
        compare(acc, getIndexedIndirectXValue());
    },

    cmpIndirectIndexedY: () => {
        compare(acc, getIndirectIndexedYValue());
    },

    cpxImmediate: () => {
        compare(xreg, getImmediateValue());
    },

    cpxZeroPage: () => {
        compare(xreg, getZeroPageValue());
    },

    cpxAbsolute: () => {
        compare(xreg, getAbsoluteValue());
    },

    cpyImmediate: () => {
        compare(yreg, getImmediateValue());
    },

    cpyZeroPage: () => {
        compare(yreg, getZeroPageValue());
    },

    cpyAbsolute: () => {
        compare(yreg, getAbsoluteValue());
    },

    // If zero flag is clear then branch
    bneRelative: () => {
        if (getZeroFlag() === false) {
            setPcToRelativeBranch();
        } else {
            setPc(pc + 1);
        }
    },

    // If zero flag is set then branch
    beqRelative: () => {
        if (getZeroFlag() === true) {
            setPcToRelativeBranch();
        } else {
            setPc(pc + 1);
        }
    },

    bccRelative: () => {
        if (getCarryFlag() === false) {
            setPcToRelativeBranch();
        } else {
            setPc(pc + 1);
        }
    },

    bcsRelative: () => {
        if (getCarryFlag() === true) {
            setPcToRelativeBranch();
        } else {
            setPc(pc + 1);
        }
    },

    bmiRelative: () => {
        if (getNegativeFlag() === true) {
            setPcToRelativeBranch();
        } else {
            setPc(pc + 1);
        }
    },

    bplRelative: () => {
        if (getNegativeFlag() === false) {
            setPcToRelativeBranch();
        } else {
            setPc(pc + 1);
        }
    },

    bvcRelative: () => {
        if (getOverflowFlag() === false) {
            setPcToRelativeBranch();
        } else {
            setPc(pc + 1);
        }
    },

    bvsRelative: () => {
        if (getOverflowFlag() === true) {
            setPcToRelativeBranch();
        } else {
            setPc(pc + 1);
        }
    },

    // Always branch
    braRelative: () => {
        setPcToRelativeBranch();
    },

    clcImplicit: () => {
        setCarryFlag(false);
    },

    secImplicit: () => {
        setCarryFlag(true);
    },

    adcImmediate: () => {
        adc(getImmediateValue());
    },

    adcZeroPage: () => {
        adc(getZeroPageValue());
    },

    adcZeroPageX: () => {
        adc(getZeroPageXValue());
    },

    adcAbsolute: () => {
        adc(getAbsoluteValue());
    },

    adcAbsoluteX: () => {
        adc(getAbsoluteXValue());
    },

    adcAbsoluteY: () => {
        adc(getAbsoluteYValue());
    },

    adcIndexedIndirectX: () => {
        adc(getIndexedIndirectXValue());
    },

    adcIndirectIndexedY: () => {
        adc(getIndirectIndexedYValue());
    },

    sbcImmediate: () => {
        sbc(getImmediateValue());
    },

    sbcZeroPage: () => {
        sbc(getZeroPageValue());
    },

    sbcZeroPageX: () => {
        sbc(getZeroPageXValue());
    },

    sbcAbsolute: () => {
        sbc(getAbsoluteValue());
    },

    sbcAbsoluteX: () => {
        sbc(getAbsoluteXValue());
    },

    sbcAbsoluteY: () => {
        sbc(getAbsoluteYValue());
    },

    sbcIndexedIndirectX: () => {
        sbc(getIndexedIndirectXValue());
    },

    sbcIndirectIndexedY: () => {
        sbc(getIndirectIndexedYValue());
    },

    taxImplicit: () => {
        setX(acc);
    },

    tayImplicit: () => {
        setY(acc);
    },

    tsxImplicit: () => {
        setX(sp);
    },

    txaImplicit: () => {
        setAcc(xreg);
    },

    txsImplicit: () => {
        setSp(xreg);
    },

    tyaImplicit: () => {
        setAcc(yreg);
    },

    phaImplicit: () => {
        stackPush(acc);
    },

    phpImplicit: () => {
        stackPush(sr);
    },

    plaImplicit: () => {
        setAcc(stackPull());
    },

    plpImplicit: () => {
        setSr(stackPull());
    },

    seiImplicit: () => {
        // When set, interrupts (IRQs) are ignored
        setInterruptFlag(true);
    },

    cliImplicit: () => {
        setInterruptFlag(false);
    },

    sedImplicit: () => {
        setDecimalFlag(true);
    },

    cldImplicit: () => {
        setDecimalFlag(false);
    },

    incZeroPage: () => {
        incMemory(getByteAndInc());
    },

    incZeroPageX: () => {
        const address = (getByteAndInc() + xreg) & 0xff;
        incMemory(address);
    },

    incAbsolute: () => {
        incMemory(fetch16bitValue());
    },

    incAbsoluteX: () => {
        const address = (fetch16bitValue() + xreg) & 0xffff;
        incMemory(address);
    },

    decZeroPage: () => {
        decMemory(getByteAndInc());
    },

    decZeroPageX: () => {
        const address = (getByteAndInc() + xreg) & 0xff;
        decMemory(address);
    },

    decAbsolute: () => {
        decMemory(fetch16bitValue());
    },

    decAbsoluteX: () => {
        const address = (fetch16bitValue() + xreg) & 0xffff;
        decMemory(address);
    },

    decAbsoluteX: () => {
        const address = (fetch16bitValue() + xreg) & 0xffff;
        decMemory(address);
    },

    dexImplicit: () => {
        setX(xreg - 1);
    },

    deyImplicit: () => {
        setY(yreg - 1);
    },

    inxImplicit: () => {
        setX(xreg + 1);
    },

    inyImplicit: () => {
        setY(yreg + 1);
    },

    andImmediate: () => {
        setAcc(acc & getImmediateValue());
    },

    andZeroPage: () => {
        setAcc(acc & getZeroPageValue());
    },

    andZeroPageX: () => {
        setAcc(acc & getZeroPageXValue());
    },

    andAbsolute: () => {
        setAcc(acc & getAbsoluteValue());
    },

    andAbsoluteX: () => {
        setAcc(acc & getAbsoluteXValue());
    },

    andAbsoluteY: () => {
        setAcc(acc & getAbsoluteYValue());
    },

    andIndexedIndirectX: () => {
        setAcc(acc & getIndexedIndirectXValue());
    },

    andIndirectIndexedY: () => {
        setAcc(acc & getIndirectIndexedYValue());
    },

    orImmediate: () => {
        setAcc(acc | getImmediateValue());
    },

    orZeroPage: () => {
        setAcc(acc | getZeroPageValue());
    },

    orZeroPageX: () => {
        setAcc(acc | getZeroPageXValue());
    },

    orAbsolute: () => {
        setAcc(acc | getAbsoluteValue());
    },

    orAbsoluteX: () => {
        setAcc(acc | getAbsoluteXValue());
    },

    orAbsoluteY: () => {
        setAcc(acc | getAbsoluteYValue());
    },

    orIndexedIndirectX: () => {
        setAcc(acc | getIndexedIndirectXValue());
    },

    orIndirectIndexedY: () => {
        setAcc(acc | getIndirectIndexedYValue());
    },

    eorImmediate: () => {
        setAcc(acc ^ getImmediateValue());
    },

    eorZeroPage: () => {
        setAcc(acc ^ getZeroPageValue());
    },

    eorZeroPageX: () => {
        setAcc(acc ^ getZeroPageXValue());
    },

    eorAbsolute: () => {
        setAcc(acc ^ getAbsoluteValue());
    },

    eorAbsoluteX: () => {
        setAcc(acc ^ getAbsoluteXValue());
    },

    eorAbsoluteY: () => {
        setAcc(acc ^ getAbsoluteYValue());
    },

    eorIndexedIndirectX: () => {
        setAcc(acc ^ getIndexedIndirectXValue());
    },

    eorIndirectIndexedY: () => {
        setAcc(acc ^ getIndirectIndexedYValue());
    },

    aslImplicit: () => {
        setAcc(asl(acc));
    },

    aslZeroPage: () => {
        const address = getByteAndInc();
        setByte(address, asl(getByte(address)));
    },

    aslZeroPageX: () => {
        const address = getZeroPageXAddress();
        setByte(address, asl(getByte(address)));
    },

    aslAbsolute: () => {
        const address = getAbsoluteAddress();
        setByte(address, asl(getByte(address)));
    },

    aslAbsoluteX: () => {
        const address = getAbsoluteXAddress();
        setByte(address, asl(getByte(address)));
    },

    lsrImplicit: () => {
        setAcc(lsr(acc));
    },

    lsrZeroPage: () => {
        const address = getByteAndInc();
        setByte(address, lsr(getByte(address)));
    },

    lsrZeroPageX: () => {
        const address = getZeroPageXAddress();
        setByte(address, lsr(getByte(address)));
    },

    lsrAbsolute: () => {
        const address = getAbsoluteAddress();
        setByte(address, lsr(getByte(address)));
    },

    lsrAbsoluteX: () => {
        const address = getAbsoluteXAddress();
        setByte(address, lsr(getByte(address)));
    },

    rolImplicit: () => {
        setAcc(rol(acc));
    },

    rolZeroPage: () => {
        const address = getByteAndInc();
        setByte(address, rol(getByte(address)));
    },

    rolZeroPageX: () => {
        const address = getZeroPageXAddress();
        setByte(address, rol(getByte(address)));
    },

    rolAbsolute: () => {
        const address = getAbsoluteAddress();
        setByte(address, rol(getByte(address)));
    },

    rolAbsoluteX: () => {
        const address = getAbsoluteXAddress();
        setByte(address, rol(getByte(address)));
    },

    rorImplicit: () => {
        setAcc(ror(acc));
    },

    rorZeroPage: () => {
        const address = getByteAndInc();
        setByte(address, ror(getByte(address)));
    },

    rorZeroPageX: () => {
        const address = getZeroPageXAddress();
        setByte(address, ror(getByte(address)));
    },

    rorAbsolute: () => {
        const address = getAbsoluteAddress();
        setByte(address, ror(getByte(address)));
    },

    rorAbsoluteX: () => {
        const address = getAbsoluteXAddress();
        setByte(address, ror(getByte(address)));
    },

    bitZeroPage: () => {
        const value = getZeroPageValue();
        setNegativeFlag(value);
        setOverflowFlag((value & 0b01000000) === 0b01000000);
        setZeroFlag(value & acc)
    },

    bitAbsolute: () => {
        const value = getAbsoluteValue();
        setNegativeFlag(value);
        setOverflowFlag((value & 0b01000000) === 0b01000000);
        setZeroFlag(value & acc)
    },

    // If zero flag is clear then branch
    bnejAbsolute: () => {
        if (getZeroFlag() === false) {
            setPcToAbsoluteAddress();
        } else {
            setPc(pc + 2);
        }
    },

    // If zero flag is set then branch
    beqjAbsolute: () => {
        if (getZeroFlag() === true) {
            setPcToAbsoluteAddress();
        } else {
            setPc(pc + 2);
        }
    },

    bccjAbsolute: () => {
        if (getCarryFlag() === false) {
            setPcToAbsoluteAddress();
        } else {
            setPc(pc + 2);
        }
    },

    bcsjAbsolute: () => {
        if (getCarryFlag() === true) {
            setPcToAbsoluteAddress();
        } else {
            setPc(pc + 2);
        }
    },

    ldccAddress: () => {
        const address = fetch16bitValue();
        const length = getByteAndInc();
        ram.copyWithin(memoryMap['cache'][0], address, address + length);
    },

    stccAddress: () => {
        const address = fetch16bitValue();
        const length = getByteAndInc();
        ram.copyWithin(address, memoryMap['cache'][0], memoryMap['cache'][0] + length);
    },

    brkImplicit: () => {
        const startMem = pc - (pc % 8) - 8;
        console.error(`brk ${printHex(pc-1)} \n${printMem(startMem)} \n${printMem(startMem + 8)} \n${printMem(startMem + 16)}`);
        cpuFunctions.debgImplicit();
        throw new Error('brk');
    },

    nopImplicit: () => {

    },

};

function getImmediateValue() {
    return getByteAndInc();
}

function getZeroPageValue() {
    return getByte(getByteAndInc());
}

function getZeroPageAddress() {
    return getByteAndInc();
}

function getZeroPageXAddress() {
    return (getByteAndInc() + xreg) & 0xff;
}

function getZeroPageYAddress() {
    return (getByteAndInc() + yreg) & 0xff;
}

function getZeroPageXValue() {
    return getByte(getZeroPageXAddress());
}

function getZeroPageYValue() {
    return getByte(getZeroPageYAddress());
}

function getAbsoluteAddress() {
    return fetch16bitValue();
}

function getAbsoluteXAddress() {
    return (fetch16bitValue() + xreg) & 0xffff;
}

function getAbsoluteYAddress() {
    return (fetch16bitValue() + yreg) & 0xffff;
}

/**
 * The value given is the address (16-bits) of a memory location that
 * contains the 8-bit value to be used.
 */
function getAbsoluteValue() {
    return getByte(getAbsoluteAddress());
}

/**
 * The final address is found by taking the given address as a base and
 * adding the current value of the X or Y register to it as an offset.
 */
function getAbsoluteXValue() {
    return getByte(getAbsoluteXAddress());
}

/**
 * The final address is found by taking the given address as a base and
 * adding the current value of the X or Y register to it as an offset.
 */
function getAbsoluteYValue() {
    return getByte(getAbsoluteYAddress());
}

function getIndexedIndirectXAddress() {
    const zeroPageAddress = getZeroPageXAddress();
    const lsb = getByte(zeroPageAddress);
    const msb = (getByte(zeroPageAddress + 1) << 8);
    return (lsb + msb) & 0xffff;
}

/**
 * Find the 16-bit address starting at the given location plus the
 * current X register. The value is the contents of that address.
 */
function getIndexedIndirectXValue() {
    return getByte(getIndexedIndirectXAddress());
}

function getIndirectIndexedYAddress() {
    const address = getZeroPageAddress();
    const lsb = getByte(address);
    const msb = getByte(address + 1);
    return (lsb + (msb << 8) + yreg) & 0xffff;
}

/**
Find the 16-bit address contained in the given location (and the one
following).  Add to that address the contents of the Y register.
Fetch the value stored at that address.
 */
function getIndirectIndexedYValue() {
    return getByte(getIndirectIndexedYAddress());
}

function setPcToAbsoluteAddress() {
    setPc(getAbsoluteAddress());
}

function setPcToRelativeBranch() {
    const branchValue = getZeroPageAddress();
    const value = getSignedNumber(branchValue);
    setPc(pc + value);
}

function compare(registerValue, memoryValue) {
    setCarryFlag(registerValue >= memoryValue);
    setZeroFlag(registerValue - memoryValue);
}

function asl(value) {
    setCarryFlag((value & 0b10000000) === 0b10000000);
    return value << 1;
}

function lsr(value) {
    setCarryFlag((value & 0b00000001) === 0b00000001);
    return value >> 1;
}

/**
 * Shift all bits left, taking the 7 bit and moving it to the 0 bit
 */
function rol(value) {
    let carryBit = value & 0b10000000; // isolate carry
    setCarryFlag(carryBit === 0b10000000);
    value = value << 1; // rotate
    carryBit = carryBit >> 7; // move carry bit to other end of byte
    return value | carryBit; // set carry bit on value

}

function ror(value) {
    let carryBit = value & 0b00000001;
    setCarryFlag(carryBit === 0b00000001);
    value = value >> 1;
    carryBit = carryBit << 7;
    return value | carryBit;
}

function adc(value) {
    const sum = value + acc;

    if (sum >= 0 && sum <= 255) {
        setCarryFlag(false);
    } else if (sum > 255) {
        setCarryFlag(true);
    }

    setAcc(sum);
}

function sbc(value) {
    const c = getCarryFlag() === true ? 1 : 0;
    const diff = acc - value - (1 - c);

    if (diff >= 0 && diff <= 255) {
        setCarryFlag(true);
    } else if (diff < 0) {
        setCarryFlag(false);
    }

    if ((acc & 0b10000000) !== (diff & 0b10000000)) {
        setOverflowFlag(true);
    } else {
        setOverflowFlag(false);
    }

    setAcc(diff);
}

function incMemory(address) {
    const value = getByte(address);
    setByte(address, value + 1);
}

function decMemory(address) {
    const value = getByte(address);
    setByte(address, value - 1);
}

function stackPush(value) {
    setByte((0x0100 + sp) & 0xffff, value);
    setSp(sp - 1);
}

function stackPull() {
    setSp(sp + 1);
    return getByte((0x0100 + sp) & 0xffff);
}

// Read and return a 16 bit address
export function fetch16bitValue() {
    const lowByte = getByteAndInc();
    const highByte = getByteAndInc();
    const address = (highByte << 8) + lowByte;
    return address & 0xffff;
}

export function getByteAndInc() {
    const b = getByte(pc);
    pcInc();
    return b;
}

export function printHex(number, pad) {
    if (!pad) {
        pad = number <= 0xff ? 2 : 4;
    }
    let h = number.toString(16);
    while (h.length < pad) {
        h = '0' + h;
    }
    return h;
}

export function printMem(startAddress) {
    const m = [];
    ram.slice(startAddress, startAddress + 8).forEach(v => m.push(printHex(v)));
    return `${printHex(startAddress, 4)} ${m.join(' ')}`;
}

export function printBinary(number) {
    let b = number.toString(2);
    while (b.length < 8) {
        b = '0' + b;
    }
    return b;
}

// True if 7 bit is set
export function isNegative(number) {
    const msb = 0b10000000;
    return (number & msb) === msb;
}

export function getSignedNumber(number) {
    if (isNegative(number)) {
        return -(parseInt(number.toString(2).replace(/[01]/g, m => {
            if (m === '0') return '1';
            if (m === '1') return '0';
        }), 2) + 1);
    } else {
        return number;
    }
}

export function irqFn() {
    readKeyboardBuffer();

    const lowByte = getByte(0xfffe);
    const highByte = getByte(0xffff);
    const address = (highByte << 8) + lowByte;

    // push program counter onto stack
    const pcHighByte = pc >> 8;
    stackPush(pcHighByte);
    const pcLowByte = pc & 0x00ff;
    stackPush(pcLowByte);

    // push status register onto stack
    stackPush(sr);

    // Start running interrupt code
    setPc(address);
}

/**
 * Copy key presses into memory
 */
function readKeyboardBuffer() {
    // Read keyboard into key buffer (keyboard maintains a mirrored buffer to this one)
    const newKeys = keybuf.filter(k => k && k > 0); // Newest first
    clearKeybuf();
    let memKeybufSize = getByte(0x001a);
    let currentKeybufMem = []; // Newest first
    const START_KEYBUF = 0x0010;
    const KEYBUF_COUNT = 0x001a;

    // populate array with existing memory values
    for (let i = 0; i < memKeybufSize; i++) {
        currentKeybufMem.push(getByte(START_KEYBUF + i));
    }

    // add new keys to memory keybuf
    while (newKeys.length !== 0 && currentKeybufMem.length < KEYBUF_SIZE) {
        currentKeybufMem.unshift(newKeys.pop());
    }

    // Set new keybuf size
    setByte(KEYBUF_COUNT, currentKeybufMem.length);

    // Write back to memory
    for (let i = 0; i < currentKeybufMem.length; i++) {
        setByte(i + START_KEYBUF, currentKeybufMem[i]);
    }
}