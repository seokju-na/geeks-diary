export function floor10(value: number, exponent = 0): number {
    // Shift
    let strValue = value.toString().split('e');

    value = Math.floor(+(strValue[0] + 'e' + (strValue[1]
        ? (+strValue[1] - exponent)
        : -exponent)));

    // Shift back
    strValue = value.toString().split('e');

    return +(strValue[0] + 'e' + (strValue[1] ? (+strValue[1] + exponent) : exponent));
}
