import { cpuFunctions } from './cpu-functions.js';

/**************
Instruction Set
---------------

https://www.masswerk.at/6502/6502_instruction_set.html#ROL


***************/
const addressOrLabel = /^((\$[0-9a-f]{4})|(\[[a-z]{1}[a-z0-9\-_]{3,}\]))$/;

const implicitRe = /^$/; // implied
const immediateRe = /^#((\$[0-9a-f]{2})|(%[0-1]{8}))$/;
const zeroPageRe = /^((\$[0-9a-f]{2})|(%[0-1]{8}))$/;
const zeroPageXRe = /^(((\$[0-9a-f]{2})|(%[0-1]{8})),x)$/;
const zeroPageYRe = /^(((\$[0-9a-f]{2})|(%[0-1]{8})),y)$/;
const absoluteRe = addressOrLabel; // /^\$[0-9a-f]{4}$/;
const absoluteXRe = /^\$[0-9a-f]{4},x$/;
const absoluteYRe = /^\$[0-9a-f]{4},y$/;
const indirectRe = /^\(\$[0-9a-f]{4}\)$/;
const indexedIndirectXRe = /^\(\$[0-9a-f]{4},x\)$/; // 650c2
const indexedIndirectXZeroPageRe = /^\(\$[0-9a-f]{2},x\)$/;
const indirectIndexedYZeroPageRe = /^\(\$[0-9a-f]{2}\),y$/;
const instructions = [
    {
        as: 'brk',
        de: 'Break interrupt',
        ins: [{
            mc: 0x00,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.brkImplicit,
        }]
    },
    {
        as: 'debg',
        de: 'Debug the registers or debug a memory address',
        ins: [{
            mc: 0x02,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.debgImplicit,
        }, {
            mc: 0x03,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.debgAbsolute,
        }],
    },
    {
        as: 'erro',
        de: 'Error; log to console',
        ins: [{
            mc: 0x04,
            wo: 1,
            re: immediateRe,
            fn: cpuFunctions.erroImplicit,
        }]
    },
    {
        as: 'jmp',
        de: 'Jump to address',
        ins: [{
            mc: 0x4c,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.jmpAbsolute,
        }, {
            mc: 0x6c,
            wo: 3,
            re: indirectRe,
            fn: cpuFunctions.jmpIndirect,
        }, {
            mc: 0x7c,
            wo: 3,
            re: indexedIndirectXRe,
            fn: cpuFunctions.jmpAbsoluteIndexedIndirectX,
        }]
    },
    {
        as: 'jsr',
        de: 'Jump to subroutine',
        ins: [{
            mc: 0x20,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.jsrAbsolute,
        }]
    },
    {
        as: 'rts',
        de: 'Return from subroutine',
        ins: [{
            mc: 0x60,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.rtsImplicit,
        }]
    },
    {
        as: 'rti',
        de: 'Return from interrupt',
        ins: [{
            mc: 0x40,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.rtiImplicit,
        }]
    },
    {
        as: 'lda',
        de: 'Load into the accumulator',
        ins: [{
            mc: 0xa9,
            wo: 2,
            re: immediateRe,
            fn: cpuFunctions.ldaImmediate,
        }, {
            mc: 0xa5,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.ldaZeroPage,
        },
        {
            mc: 0xb5,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.ldaZeroPageX,
        },
        {
            mc: 0xad,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.ldaAbsolute,
        },
        {
            mc: 0xbd,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.ldaAbsoluteX,
        },
        {
            mc: 0xb9,
            wo: 3,
            re: absoluteYRe,
            fn: cpuFunctions.ldaAbsoluteY,
        },
        {
            mc: 0xa1,
            wo: 2,
            re: indexedIndirectXZeroPageRe,
            fn: cpuFunctions.ldaIndexedIndirectX,
        },
        {
            mc: 0xb1,
            wo: 2,
            re: indirectIndexedYZeroPageRe,
            fn: cpuFunctions.ldaIndirectIndexedY,
        }]
    },
    {
        as: 'ldx',
        de: 'Load into the X register',
        ins: [{
            mc: 0xa2,
            wo: 2,
            re: immediateRe,
            fn: cpuFunctions.ldxImmediate,
        }, {
            mc: 0xa6,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.ldxZeroPage,
        },
        {
            mc: 0xb6,
            wo: 2,
            re: zeroPageYRe,
            fn: cpuFunctions.ldxZeroPageY,
        },
        {
            mc: 0xae,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.ldxAbsolute,
        },
        {
            mc: 0xbe,
            wo: 3,
            re: absoluteYRe,
            fn: cpuFunctions.ldxAbsoluteY,
        }]
    },
    {
        as: 'ldy',
        de: 'Load into the Y register',
        ins: [{
            mc: 0xa0,
            wo: 2,
            re: immediateRe,
            fn: cpuFunctions.ldyImmediate,
        }, {
            mc: 0xa4,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.ldyZeroPage,
        },
        {
            mc: 0xb4,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.ldyZeroPageX,
        },
        {
            mc: 0xac,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.ldyAbsolute,
        },
        {
            mc: 0xbc,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.ldyAbsoluteX,
        }]
    },
    {
        as: 'sta',
        de: 'Store Accumulator to memory',
        ins: [{
            mc: 0x85,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.staZeroPage,
        }, {
            mc: 0x95,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.staZeroPageX,
        }, {
            mc: 0x8d,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.staAbsolute,
        }, {
            mc: 0x9d,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.staAbsoluteX,
        }, {
            mc: 0x99,
            wo: 3,
            re: absoluteYRe,
            fn: cpuFunctions.staAbsoluteY,
        }, {
            mc: 0x81,
            wo: 2,
            re: indexedIndirectXZeroPageRe,
            fn: cpuFunctions.staIndexedIndirectX,
        }, {
            mc: 0x91,
            wo: 2,
            re: indirectIndexedYZeroPageRe,
            fn: cpuFunctions.staIndirectIndexedY,
        }]
    },
    {
        as: 'stx',
        de: 'Store X register to memory',
        ins: [{
            mc: 0x86,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.stxZeroPage,
        }, {
            mc: 0x96,
            wo: 2,
            re: zeroPageYRe,
            fn: cpuFunctions.stxZeroPageY,
        }, {
            mc: 0x8e,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.stxAbsolute,
        }]
    },
    {
        as: 'sty',
        de: 'Store Y register to memory',
        ins: [{
            mc: 0x84,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.styZeroPage,
        }, {
            mc: 0x94,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.styZeroPageX,
        }, {
            mc: 0x8c,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.styAbsolute,
        }]
    },
    {
        as: 'cmp',
        de: 'Compare to Accumulator',
        ins: [{
            mc: 0xc9,
            wo: 2,
            re: immediateRe,
            fn: cpuFunctions.cmpImmediate,
        }, {
            mc: 0xc5,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.cmpZeroPage,
        }, {
            mc: 0xd5,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.cmpZeroPageX,
        }, {
            mc: 0xcd,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.cmpAbsolute,
        }, {
            mc: 0xdd,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.cmpAbsoluteX,
        }, {
            mc: 0xd9,
            wo: 3,
            re: absoluteYRe,
            fn: cpuFunctions.cmpAbsoluteY,
        }, {
            mc: 0xc1,
            wo: 2,
            re: indexedIndirectXZeroPageRe,
            fn: cpuFunctions.cmpIndexedIndirectX,
        }, {
            mc: 0xd1,
            wo: 2,
            re: indirectIndexedYZeroPageRe,
            fn: cpuFunctions.cmpIndirectIndexedY,
        }]
    },
    {
        as: 'cpx',
        de: 'Compare to X Register',
        ins: [{
            mc: 0xe0,
            wo: 2,
            re: immediateRe,
            fn: cpuFunctions.cpxImmediate,
        }, {
            mc: 0xe4,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.cpxZeroPage,
        }, {
            mc: 0xec,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.cpxAbsolute,
        }]
    },
    {
        as: 'cpy',
        de: 'Compare to Y Register',
        ins: [{
            mc: 0xc0,
            wo: 2,
            re: immediateRe,
            fn: cpuFunctions.cpyImmediate,
        }, {
            mc: 0xc4,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.cpyZeroPage,
        }, {
            mc: 0xcc,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.cpyAbsolute,
        }]
    },
    {
        as: 'bne',
        de: 'Branch if not equal; zero flag clear',
        ins: [{
            mc: 0xd0,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.bneRelative,
        }]
    },
    {
        as: 'beq',
        de: 'Branch if equal; zero flag set',
        ins: [{
            mc: 0xf0,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.beqRelative,
        }]
    },
    {
        as: 'bcc',
        de: 'Branch if carry is clear',
        ins: [{
            mc: 0x90,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.bccRelative,
        }]
    },
    {
        as: 'bcs',
        de: 'Branch if carry is set',
        ins: [{
            mc: 0xb0,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.bcsRelative,
        }]
    },
    {
        as: 'bmi',
        de: 'Branch on result minus',
        ins: [{
            mc: 0x30,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.bmiRelative,
        }]
    },
    {
        as: 'bvc',
        de: 'Branch on overflow clear',
        ins: [{
            mc: 0x50,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.bvcRelative,
        }]
    },
    {
        as: 'bvs',
        de: 'Branch on overflow set',
        ins: [{
            mc: 0x70,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.bvsRelative,
        }]
    },
    {
        as: 'bpl',
        de: 'Branch on result plus',
        ins: [{
            mc: 0x10,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.bplRelative,
        }]
    },
    {
        as: 'bra',
        de: 'Branch always',
        ins: [{
            mc: 0x80,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.braRelative,
        }]
    },
    {
        as: 'clc',
        de: 'Clear carry flag',
        ins: [{
            mc: 0x18,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.clcImplicit,
        }]
    },
    {
        as: 'sec',
        de: 'Set carry flag',
        ins: [{
            mc: 0x38,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.secImplicit,
        }]
    },
    {
        as: 'adc',
        de: 'Add with Carry',
        ins: [{
            mc: 0x69,
            wo: 2,
            re: immediateRe,
            fn: cpuFunctions.adcImmediate,
        }, {
            mc: 0x65,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.adcZeroPage,
        }, {
            mc: 0x75,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.adcZeroPageX,
        }, {
            mc: 0x6d,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.adcAbsolute,
        }, {
            mc: 0x7d,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.adcAbsoluteX,
        }, {
            mc: 0x79,
            wo: 3,
            re: absoluteYRe,
            fn: cpuFunctions.adcAbsoluteY,
        }, {
            mc: 0x61,
            wo: 2,
            re: indexedIndirectXZeroPageRe,
            fn: cpuFunctions.adcIndexedIndirectX,
        }, {
            mc: 0x71,
            wo: 2,
            re: indirectIndexedYZeroPageRe,
            fn: cpuFunctions.adcIndirectIndexedY,
        }]
    },
    {
        as: 'sbc',
        de: 'Subtract with Carry',
        ins: [{
            mc: 0xe9,
            wo: 2,
            re: immediateRe,
            fn: cpuFunctions.sbcImmediate,
        }, {
            mc: 0xe5,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.sbcZeroPage,
        }, {
            mc: 0xf5,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.sbcZeroPageX,
        }, {
            mc: 0xed,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.sbcAbsolute,
        }, {
            mc: 0xfd,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.sbcAbsoluteX,
        }, {
            mc: 0xf9,
            wo: 3,
            re: absoluteYRe,
            fn: cpuFunctions.sbcAbsoluteY,
        }, {
            mc: 0xe1,
            wo: 2,
            re: indexedIndirectXZeroPageRe,
            fn: cpuFunctions.sbcIndexedIndirectX,
        }, {
            mc: 0xf1,
            wo: 2,
            re: indirectIndexedYZeroPageRe,
            fn: cpuFunctions.sbcIndirectIndexedY,
        }]
    },
    {
        as: 'tax',
        de: 'Transfer accumulator to X',
        ins: [{
            mc: 0xaa,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.taxImplicit,
        }]
    },
    {
        as: 'tay',
        de: 'Transfer accumulator to Y',
        ins: [{
            mc: 0xa8,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.tayImplicit,
        }]
    },
    {
        as: 'tsx',
        de: 'Transfer stack pointer to X',
        ins: [{
            mc: 0xba,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.tsxImplicit,
        }]
    },
    {
        as: 'txa',
        de: 'Transfer X to the accumulator',
        ins: [{
            mc: 0x8a,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.txaImplicit,
        }]
    },
    {
        as: 'txs',
        de: 'Transfer X to the stack pointer',
        ins: [{
            mc: 0x9a,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.txsImplicit,
        }]
    },
    {
        as: 'tya',
        de: 'Transfer Y to the accumulator',
        ins: [{
            mc: 0x98,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.tyaImplicit,
        }]
    },
    {
        as: 'pha',
        de: 'Push accumulator to the stack',
        ins: [{
            mc: 0x48,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.phaImplicit,
        }]
    },
    {
        as: 'php',
        de: 'Push status register to the stack',
        ins: [{
            mc: 0x08,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.phpImplicit,
        }]
    },
    {
        as: 'pla',
        de: 'Pull accumulator from the stack',
        ins: [{
            mc: 0x68,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.plaImplicit,
        }]
    },
    {
        as: 'plp',
        de: 'Pull status register from the stack',
        ins: [{
            mc: 0x28,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.plpImplicit,
        }]
    },
    {
        as: 'sei',
        de: 'Set interrupt disable',
        ins: [{
            mc: 0x78,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.seiImplicit,
        }]
    },
    {
        as: 'cli',
        de: 'Clear interrupt disable',
        ins: [{
            mc: 0x58,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.cliImplicit,
        }]
    },
    {
        as: 'sed',
        de: 'Set decimal flag',
        ins: [{
            mc: 0xf8,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.sedImplicit,
        }]
    },
    {
        as: 'cld',
        de: 'Clear decimal flag',
        ins: [{
            mc: 0xd8,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.cldImplicit,
        }]
    },
    {
        as: 'inc',
        de: 'Increment memory',
        ins: [{
            mc: 0xe6,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.incZeroPage,
        }, {
            mc: 0xf6,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.incZeroPageX,
        }, {
            mc: 0xee,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.incAbsolute,
        }, {
            mc: 0xfe,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.incAbsoluteX,
        }]
    },
    {
        as: 'dec',
        de: 'Decrement memory',
        ins: [{
            mc: 0xc6,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.decZeroPage,
        }, {
            mc: 0xd6,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.decZeroPageX,
        }, {
            mc: 0xce,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.decAbsolute,
        }, {
            mc: 0xde,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.decAbsoluteX,
        }]
    },
    {
        as: 'inx',
        de: 'Increment X Register',
        ins: [{
            mc: 0xe8,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.inxImplicit,
        }]
    },
    {
        as: 'iny',
        de: 'Increment Y Register',
        ins: [{
            mc: 0xc8,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.inyImplicit,
        }]
    },
    {
        as: 'dex',
        de: 'Decrement X Register',
        ins: [{
            mc: 0xca,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.dexImplicit,
        }]
    },
    {
        as: 'dey',
        de: 'Decrement Y Register',
        ins: [{
            mc: 0x88,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.deyImplicit,
        }]
    },
    {
        as: 'and',
        de: 'Logical AND on accumulator',
        ins: [{
            mc: 0x29,
            wo: 2,
            re: immediateRe,
            fn: cpuFunctions.andImmediate,
        }, {
            mc: 0x25,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.andZeroPage,
        }, {
            mc: 0x35,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.andZeroPageX,
        }, {
            mc: 0x2d,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.andAbsolute,
        }, {
            mc: 0x3d,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.andAbsoluteX,
        }, {
            mc: 0x39,
            wo: 3,
            re: absoluteYRe,
            fn: cpuFunctions.andAbsoluteY,
        }, {
            mc: 0x21,
            wo: 2,
            re: indexedIndirectXZeroPageRe,
            fn: cpuFunctions.andIndexedIndirectX,
        }, {
            mc: 0x31,
            wo: 2,
            re: indirectIndexedYZeroPageRe,
            fn: cpuFunctions.andIndirectIndexedY,
        }]
    },
    {
        as: 'ora',
        de: 'Logical OR on accumulator',
        ins: [{
            mc: 0x09,
            wo: 2,
            re: immediateRe,
            fn: cpuFunctions.orImmediate,
        }, {
            mc: 0x05,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.orZeroPage,
        }, {
            mc: 0x15,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.orZeroPageX,
        }, {
            mc: 0x0d,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.orAbsolute,
        }, {
            mc: 0x1d,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.orAbsoluteX,
        }, {
            mc: 0x19,
            wo: 3,
            re: absoluteYRe,
            fn: cpuFunctions.orAbsoluteY,
        }, {
            mc: 0x01,
            wo: 2,
            re: indexedIndirectXZeroPageRe,
            fn: cpuFunctions.orIndexedIndirectX,
        }, {
            mc: 0x11,
            wo: 2,
            re: indirectIndexedYZeroPageRe,
            fn: cpuFunctions.orIndirectIndexedY,
        }]
    },
    {
        as: 'eor',
        de: 'Exclusive OR on accumulator',
        ins: [{
            mc: 0x49,
            wo: 2,
            re: immediateRe,
            fn: cpuFunctions.eorImmediate,
        }, {
            mc: 0x45,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.eorZeroPage,
        }, {
            mc: 0x55,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.eorZeroPageX,
        }, {
            mc: 0x4d,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.eorAbsolute,
        }, {
            mc: 0x5d,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.eorAbsoluteX,
        }, {
            mc: 0x59,
            wo: 3,
            re: absoluteYRe,
            fn: cpuFunctions.eorAbsoluteY,
        }, {
            mc: 0x41,
            wo: 2,
            re: indexedIndirectXZeroPageRe,
            fn: cpuFunctions.eorIndexedIndirectX,
        }, {
            mc: 0x51,
            wo: 2,
            re: indirectIndexedYZeroPageRe,
            fn: cpuFunctions.eorIndirectIndexedY,
        }]
    },
    {
        as: 'asl',
        de: 'Shift left one bit',
        ins: [{
            mc: 0x0a,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.aslImplicit,
        }, {
            mc: 0x06,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.aslZeroPage,
        }, {
            mc: 0x16,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.aslZeroPageX,
        }, {
            mc: 0x0e,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.aslAbsolute,
        }, {
            mc: 0x1e,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.aslAbsoluteX,
        }]
    },
    {
        as: 'lsr',
        de: 'Shift right one bit',
        ins: [{
            mc: 0x4a,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.lsrImplicit,
        }, {
            mc: 0x46,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.lsrZeroPage,
        }, {
            mc: 0x56,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.lsrZeroPageX,
        }, {
            mc: 0x4e,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.lsrAbsolute,
        }, {
            mc: 0x5e,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.lsrAbsoluteX,
        }]
    },
    {
        as: 'rol',
        de: 'Rotate one bit left',
        ins: [{
            mc: 0x2a,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.rolImplicit,
        }, {
            mc: 0x26,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.rolZeroPage,
        }, {
            mc: 0x36,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.rolZeroPageX,
        }, {
            mc: 0x2e,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.rolAbsolute,
        }, {
            mc: 0x3e,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.rolAbsoluteX,
        }]
    },
    {
        as: 'ror',
        de: 'Rotate one bit right',
        ins: [{
            mc: 0x6a,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.rorImplicit,
        }, {
            mc: 0x66,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.rorZeroPage,
        }, {
            mc: 0x76,
            wo: 2,
            re: zeroPageXRe,
            fn: cpuFunctions.rorZeroPageX,
        }, {
            mc: 0x6e,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.rorAbsolute,
        }, {
            mc: 0x7e,
            wo: 3,
            re: absoluteXRe,
            fn: cpuFunctions.rorAbsoluteX,
        }]
    },
    {
        as: 'bit',
        de: 'Test bits with accumulator',
        ins: [{
            mc: 0x24,
            wo: 2,
            re: zeroPageRe,
            fn: cpuFunctions.bitZeroPage,
        }, {
            mc: 0x2c,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.bitAbsolute,
        }]
    },
    {
        as: 'ldcc',
        de: 'Load into the cache the values starting at the address up to value',
        ins: [{
            mc: 0x12,
            wo: 4,
            re: /^\$[a-f0-9]{4} \$[a-f0-9]{2}$/,
            fn: cpuFunctions.ldccAddress,
        }]
    },
    {
        as: 'stcc',
        de: 'Store the cache up to the value in the given address.',
        ins: [{
            mc: 0x13,
            wo: 4,
            re: /^\$[a-f0-9]{4} \$[a-f0-9]{2}$/,
            fn: cpuFunctions.stccAddress,
        }]
    },
    {
        as: 'bnej',
        de: 'Branch if zero is clear and jump to address',
        ins: [{
            mc: 0x14,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.bnejAbsolute,
        }]
    },
    {
        as: 'beqj',
        de: 'Branch if zero is set and jump to address',
        ins: [{
            mc: 0x17,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.beqjAbsolute,
        }]
    },
    {
        as: 'bccj',
        de: 'Branch if carry is clear and jump to address',
        ins: [{
            mc: 0x1a,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.bccjAbsolute,
        }]
    },
    {
        as: 'bcsj',
        de: 'Branch if carry is set and jump to address',
        ins: [{
            mc: 0x1b,
            wo: 3,
            re: absoluteRe,
            fn: cpuFunctions.bcsjAbsolute,
        }]
    },
    {
        as: 'nop',
        de: 'No Operation',
        ins: [{
            mc: 0xea,
            wo: 1,
            re: implicitRe,
            fn: cpuFunctions.nopImplicit,
        }]
    },
];

const instructionsMap = {};

instructions.forEach(opCode => {
    (opCode?.ins ?? []).forEach(instruction => {
        instructionsMap[instruction.mc] = {
            as: opCode.as,
            de: opCode.de,
            ...instruction ?? {},
        };
    });
});

export { instructions, instructionsMap, indexedIndirectXRe, indexedIndirectXZeroPageRe, indirectIndexedYZeroPageRe };