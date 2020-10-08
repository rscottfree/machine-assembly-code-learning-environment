import {
    instructions, indexedIndirectXZeroPageRe,
    indirectIndexedYZeroPageRe, indexedIndirectXRe
} from './instruction-set.js';
import { ram } from './ram.js';
import { memoryMap } from './memory-map.js';
import { printMem, printHex } from './cpu-functions.js';


export const debugPoints = {};
export const suspendPoints = {};

export async function loadKernal() {
    let fileName = 'kernal.s';

    const response = await fetch(`./prgs/${fileName}`);
    const fileText = await response.text();
    return parseKernalFile(fileText);
}


function parseKernalFile(fileText) {
    const lines = fileText.split('\n')
        .map(w => w.trim())
        .filter(w => w && w.trim() !== '');


    let krami = memoryMap['kernal'][0];
    let allLineWords = [];

    // remove comments and split into words
    for (let linesi = 0; linesi < lines.length; linesi++) {
        if (lines[linesi][0] === ';') {
            continue;
        }

        let lineWords = lines[linesi].split(';')[0]; // remove comments
        // Split on spaces and remove whitespace and empty words
        allLineWords.push(lineWords.split(' ')
            .map(lineWord => lineWord.trim())
            .filter(lineWord => !!lineWord));
    }

    const labelRe = /\[[a-z]{1}[a-z0-9\-_]{3,}\]/;
    let labels = [];
    let labelSubs = [];

    const pcLabelRe = /^\*=$/;

    let valueLabels = [];
    const valueLabelRe = /\[[a-z]{1}[a-z0-9\-_]{3,}\]=/;

    // Find value labels; remove these lines from the code
    allLineWords = allLineWords.filter(lineWords => {
        if (valueLabelRe.test(lineWords[0])) {
            valueLabels.push({
                name: lineWords[0].slice(0, -1),
                value: lineWords[1],
            });

            return false;
        }

        return true;
    });

    // Replace value labels with their values in the assembly
    for (let linesi = 0; linesi < allLineWords.length; linesi++) {
        const lineWords = allLineWords[linesi];
        for (let lineWordi = 0; lineWordi < lineWords.length; lineWordi++) {
            const match = lineWords[lineWordi].match(labelRe);
            if (match !== null) {
                const v = valueLabels.find(vl => vl.name === match[0]);
                if (v !== undefined) {
                    lineWords[lineWordi] = lineWords[lineWordi].replace(v.name, v.value);
                }
            }
        }
    }

    for (let linesi = 0; linesi < allLineWords.length; linesi++) {
        const lineWords = allLineWords[linesi];
        const instructionWord = lineWords[0].trim();

        let filtered = instructions
            .filter(ins => ins.as.toLowerCase() === instructionWord)
            .filter(ins => !!ins)
            .map(instruction => {
                const rightIns = instruction.ins.filter(ins => {
                    return ins.re.test('' + (lineWords[1] ?? ''));
                });

                if (rightIns && rightIns.length > 1) {
                    throw new Error('Multiple instructions match the word', lineWords[1], rightIns);
                }

                return {
                    as: instruction.as,
                    de: instruction.de,
                    ...rightIns && rightIns.length > 0 ? rightIns[0] : {},
                };
            });

        const instruction = filtered && filtered.length > 0
            && filtered[0]?.mc !== undefined ? filtered[0] : undefined;

        // If instruction is undefined then it's a label or pseudo instruction
        if (instruction === undefined) {
            if (pcLabelRe.test(instructionWord)) {
                krami = parseInt(lineWords.slice(1)[0].slice(1, 5), 16);
            } else if (labelRe.test(instructionWord)) {
                // Add a label
                labels.push({
                    location: krami,
                    name: instructionWord,
                });
            } else if (/\.byte/.test(instructionWord)) {
                lineWords.slice(1).forEach(word => {
                    if (!/\$[a-f0-9]{2}/.test(word)) {
                        throw new Error(`.byte value is invalid: ${word} (${lineWords})`);
                    }

                    ram[krami++] = parseInt(word.slice(1), 16);
                });
            } else if (/\.debug/.test(instructionWord)) {
                if (debugPoints[krami] === undefined) {
                    debugPoints[krami] = [];
                }

                const debugText = lineWords.slice(1).join(' ');
                debugPoints[krami].push(debugText);
            } else if (/\.suspend/.test(instructionWord)) {
                suspendPoints[krami] = true;
            } else {
                console.error('bad instruction', lineWords.join(' '));
                throw new Error(`Unrecognized text on line ${linesi + 1}: ${instructionWord} (${lineWords.join(' ')})`);
            }
        } else if (instruction !== undefined) {
            ram[krami++] = instruction.mc;
            let words = [];

            // Split up 16 bit words into two different words for inserting into ram
            lineWords.slice(1).forEach(word => {
                if (indexedIndirectXRe.test(word)) {
                    // ($0000, x) - new jmp
                    const v = word.slice(1, 5);
                    words.push('$' + v.slice(3));
                    words.push(v.slice(0, 3));
                } else if (indexedIndirectXZeroPageRe.test(word) || indirectIndexedYZeroPageRe.test(word)) {
                    // ($00, x) or ($00), y
                    words.push(word.slice(1, 4))
                } else if (/\$[a-f0-9]{4}/.test(word)) { // $0000
                    words.push('$' + word.slice(3));
                    words.push(word.slice(0, 3));
                } else if (labelRe.test(word)) {
                    words.push(word);
                    words.push(undefined);
                } else {
                    words.push(word);
                }
            });

            if (words.length !== Math.max(instruction.wo - 1, 0)) {
                throw new Error(`Number of words do not match instruction ${printHex(instruction.mc)} ${instruction.as}. ${words.length + 1} instead of ${instruction.wo}`)
            }

            // Loop through all words needed for this instruction
            for (let word of words) {
                // See if it's a number
                if (word && (word[0] === '#' || word[0] === '$' || word[0] === '%')) {
                    let hex = true;
                    if (word[0] === '#') {
                        hex = word[1] === '$';
                        word = word.substring(2);
                    } else {
                        hex = word[0] === '$';
                        word = word.substring(1);
                    }

                    ram[krami++] = parseInt(word, hex ? 16 : 2);
                } else if (word && labelRe.test(word)) { // it's a label
                    labelSubs.push({
                        location: krami,
                        name: word,
                    });
                    // TODO: Set to error interrupt address
                    // So if it doesn't get replaced there is an error (no label)
                    // Or should the parser throw an error?
                    ram[krami++] = 0xea; // NOP
                    ram[krami++] = 0xea;
                }
            }
        }
    }

    // Put label locations in ram where they were found
    labelSubs.forEach(sub => {
        const l = labels.find(label => label.name === sub.name);

        if (l !== undefined) {
            const lowByte = l.location & 0x00ff;
            const highByte = (l.location & 0xff00) >> 8;
            ram[sub.location] = lowByte;
            ram[sub.location + 1] = highByte;
        }
    });


    const kernalToPrint = 15;
    for (let i = 0; /*i < kernalToPrint*/; i ++) {
        const start = memoryMap['kernal'][0] + (8 * i);
        console.info(printMem(start));
        if (ram[start] === 0x00 && ram[start + 1] === 0x00) {
            break;
        }
    }
}


function setupVariables() {
    // Variables can be 1 or 2 words (8 or 16 bit values)

    const variables = [
        {
            mc: 0x10, // machine code
            iv: 0x01, // initial value
            ad: undefined, // address in ram
            wo: 1, // words (1 or 2)
            as: '_crsx', // assembly instruction
            de: 'Cursor X location', // description
        },
        {
            mc: 0x11,
            iv: 0x02,
            ad: undefined,
            wo: 1,
            as: '_crsy',
            de: 'Cursor Y location',
        },
        {
            mc: 0x12,
            iv: memoryMap['video'][0],
            ad: undefined,
            wo: 2,
            as: '_vids',
            de: 'Video memory start location',
        },
        {
            mc: 0x13,
            iv: memoryMap['characters'][0],
            ad: undefined,
            wo: 2,
            as: '_chrs',
            de: 'Character memory start location',
        },
    ];

    let vari = memoryMap['variables'][0];
    variables.forEach(v => {
        v.ad = vari;

        if (v.wo === 2) {
            const lowByte = v.iv & 0x00ff;
            const highByte = (v.iv & 0xff00) >> 8;
            ram[v.ad] = lowByte;
            ram[v.ad + 1] = highByte;
            vari += 2;
        } else {
            ram[v.ad] = v.iv;
            vari++;
        }

        if (vari > memoryMap['variables'][1]) {
            throw new Error('No more room for variables');
        }
    });

    return variables;
}
