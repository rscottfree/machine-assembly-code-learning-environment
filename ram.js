
let memoryBuffer = new ArrayBuffer(0xffff + 1); // 65_535 max value with 16 binary columns
let ram = new Uint8ClampedArray(memoryBuffer);

function getByte(address) {
    return ram[address] & 0xff;
}

function setByte(address, value) {
    ram[address] = value & 0xff;
}

function get16bitValue(address) {
    const lowByte = getByte(address);
    const highByte = getByte(address + 1);
    return (highByte << 8) + lowByte;
}

export { ram, getByte, setByte, get16bitValue };
