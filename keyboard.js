const KEYBUF_SIZE = 10;

// Keep the last 10 keys pressed; overflow is disgarded
let keybuf = [];

// Map<browser's KeyboardEvent.key, internal code>
const keymap = new Map();

function enableKeyboard() {
    console.log('keyboard enabled');
    document.body.addEventListener('keydown', event => {
        if (keymap[event.key] !== undefined && keybuf.length < 10) {
            keybuf.unshift(keymap[event.key]);
            // console.log('keydown', event.key, keymap[event.key], keybuf);
        } else if (keymap[event.key] === undefined) {
            console.info('key is undefined: ', event.key);
        }
    });
}

const keys = [
    ` `,
    `!`,
    `"`,
    `#`,
    `$`,
    `%`,
    `&`,
    `'`,
    `(`,
    `)`,
    `*`,
    `+`,
    `,`,
    `-`,
    `.`,
    `/`,
    `0`,
    `1`,
    `2`,
    `3`,
    `4`,
    `5`,
    `6`,
    `7`,
    `8`,
    `9`,
    `:`,
    `;`,
    `<`,
    `=`,
    `>`,
    `?`,
    `@`,
    `A`,
    `B`,
    `C`,
    `D`,
    `E`,
    `F`,
    `G`,
    `H`,
    `I`,
    `J`,
    `K`,
    `L`,
    `M`,
    `N`,
    `O`,
    `P`,
    `Q`,
    `R`,
    `S`,
    `T`,
    `U`,
    `V`,
    `W`,
    `X`,
    `Y`,
    `Z`,
    `[`,
    `\\`,
    ']',
    '^',
    '_',
    `\``,
    `a`,
    `b`,
    `c`,
    `d`,
    `e`,
    `f`,
    `g`,
    `h`,
    `i`,
    `j`,
    `k`,
    `l`,
    `m`,
    `n`,
    `o`,
    `p`,
    `q`,
    `r`,
    `s`,
    `t`,
    `u`,
    `v`,
    `w`,
    `x`,
    `y`,
    `z`,
    `{`,
    `|`,
    `}`,
    `~`,
    `£`,
    ``,
];

for (let i = 0; i < keys.length; i++) {
    keymap['' + keys[i]] = i + 0x20;
}

keymap['Enter'] = 13;

function clearKeybuf() {
    keybuf = [];
}

export { enableKeyboard, keybuf, clearKeybuf, KEYBUF_SIZE };

