/**
 * Determines if a character is a delimiter.
 * @param {string} char 
 * @returns {boolean}
 */
export const isDelimiter = (char) => {
    return /\s|,|\.|!|\?|\(|\)|:|;|"/.test(char);
}

/**
 * Normalizes the selection so that start is before end.
 * @param {Object} sel - {start: {line, ch}, end: {line, ch}}
 * @returns {Object} - Normalized selection
 */
export const normalizeSelection = (sel) => {
    const a = sel.start;
    const b = sel.end;
    if (a.line < b.line || (a.line === b.line && a.ch <= b.ch)) {
        return sel;
    } else {
        return { start: b, end: a };
    }
}
