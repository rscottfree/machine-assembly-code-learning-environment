/*
Video Memory is 8000 bytes and so is extended video memory
There are currently 776 bytes of characters

Memory Map
----------
$0000 $00ff zero (size = $00ff)
$0100 $01ff stack (size = $00ff)
$0200 $02ff cache (size = $00ff)
$0400 $2340 video (size = $1f40)
$2341 $4281 extendedVideo (size = $1f40)
$4282 $458a characters (size = $0308)
$e000 $ffff kernal (size = $1fff)

*/

const videoMemSize = 8192; // See text-mode-screen
const videoCharSize = 32 * 32; // 1024. See text-mode-screen

let memoryMap = {};
memoryMap['zero'] = [0x0000, 0x00ff];
memoryMap['stack'] = [0x0100, 0x01ff];
memoryMap['cache'] = [0x0200, 0x02ff];
memoryMap['characters'] = [memoryMap['cache'][1] + 1, memoryMap['cache'][1] + (256 * 8)];
memoryMap['videoChars'] = [memoryMap['characters'][1] + 1, memoryMap['characters'][1] + videoCharSize];
memoryMap['colorChars'] = [memoryMap['videoChars'][1] + 1, memoryMap['videoChars'][1] + videoCharSize];
memoryMap['video'] = [memoryMap['colorChars'][1] + 1, memoryMap['colorChars'][1] + videoMemSize];
memoryMap['extendedVideo'] = [memoryMap['video'][1] + 1, memoryMap['video'][1] + videoMemSize];
memoryMap['kernal'] = [0xffff - 0x1fff, 0xffff];

for (let key in memoryMap) {
    console.info(printHex(memoryMap[key][0]), printHex(memoryMap[key][1]), key,
    `(size = ${printHex(memoryMap[key][1] - memoryMap[key][0] + 1)})`);
}
console.info('\n');

export function printHex(number) {
    let h = number.toString(16);
    while (h.length < 4) {
        h = '0' + h;
    }
    return `$${h}`;
}


export { memoryMap };


/*
0000-00ff zero page
-------------------
0002-0003 : Cursor location in memory
0004      : Cursor on
0005      : Cursor X location
0006      : Cursor Y location
0008-000f : Working space for kernal routines
0010-0019 : keyboard buffer
001a      : Number of characters in the keyboard buffer

0100-01ff stack
---------------

0200-02ff cache
---------------

0400-2340 video
---------------

2341-4281 extendedVideo
-----------------------

4282-458a characters
--------------------

e000-ffff kernal
----------------

fffe-ffff : irq pointer
*/