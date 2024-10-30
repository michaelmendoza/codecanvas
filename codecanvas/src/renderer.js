/**
 * Renders text, selection, caret, and syntax highlighting on the offscreen canvas.
 */
const renderTextCanvas = (textCanvas, textCtx) => {
    // Clear the canvas with the background color
    textCtx.fillStyle = currentTheme.background;
    textCtx.fillRect(0, 0, textCanvas.width, textCanvas.height);

    // Draw highlights for all occurrences
    if (highlights.length > 0) {
        textCtx.fillStyle = currentTheme.highlight; // Highlight color
        highlights.forEach(({ line, ch, length }) => {
            const charWidth = textCtx.measureText('M').width; // Monospace
            const x = 10 + ch * charWidth;
            const y = 10 + line * 30 - scrollOffset * 30;
            const width = textCtx.measureText(lines[line].substring(ch, ch + length)).width;
            const height = 30; // Line height

            textCtx.fillRect(x, y, width, height);
        });
    }

    // Draw selection background if any
    if (selection) {
        const { start, end } = normalizeSelection(selection);
        for (let i = start.line; i <= end.line; i++) {
            const lineText = lines[i];
            const startCh = (i === start.line) ? start.ch : 0;
            const endCh = (i === end.line) ? end.ch : lineText.length;
            const selectedText = lineText.substring(startCh, endCh);
            const charWidth = textCtx.measureText('M').width; // Monospace
            const x = 10 + startCh * charWidth;
            const y = 10 + i * 30 - scrollOffset * 30;
            const width = textCtx.measureText(selectedText).width;
            const height = 30; // Line height to eliminate gaps

            textCtx.fillStyle = currentTheme.selection; // Selection color
            textCtx.fillRect(x, y, width, height);
        }
    }

    // Draw the text with syntax highlighting
    textCtx.textBaseline = 'top';
    textCtx.font = '24px monospace';

    for (let i = 0; i < lines.length; i++) {
        const y = 10 + i * 30 - scrollOffset * 30;
        if (y + 30 < 0 || y > textCanvas.height) continue; // Skip rendering lines outside the viewport

        const tokens = tokenizePython(lines[i]);
        let x = 10;
        tokens.forEach(token => {
            textCtx.fillStyle = currentTheme.syntax[token.type] || currentTheme.syntax.default;
            textCtx.fillText(token.value, x, y);
            x += textCtx.measureText(token.value).width;
        });
    }

    // Draw the caret if visible and within the viewport
    if (caretVisible) {
        const { x, y } = getCaretCoordinates();
        if (y >= -30 && y <= textCanvas.height) { // Check if caret is visible
            textCtx.beginPath();
            textCtx.moveTo(x, y);
            textCtx.lineTo(x, y + 24); // 24px height matching font size
            textCtx.strokeStyle = currentTheme.caret;
            textCtx.lineWidth = 2;
            textCtx.stroke();
        }
    }

    // Draw the scrollbar
    drawScrollbar();
}

/**
 * Normalizes the selection so that start is before end.
 * @param {Object} sel - {start: {line, ch}, end: {line, ch}}
 * @returns {Object} - Normalized selection
 */
function normalizeSelection(sel) {
    const a = sel.start;
    const b = sel.end;
    if (a.line < b.line || (a.line === b.line && a.ch <= b.ch)) {
        return sel;
    } else {
        return { start: b, end: a };
    }
}

/**
 * Gets the caret coordinates based on cursor position.
 * @returns {Object} - {x, y}
 */
function getCaretCoordinates() {
    const { line, ch } = cursor;
    const lineText = lines[line] || '';
    const charWidth = textCtx.measureText('M').width; // Monospace
    const x = 10 + ch * charWidth;
    const y = 10 + line * 30 - scrollOffset * 30;
    return { x, y };
}



/**
 * Renders and draws the scene.
 */
function renderAndDraw() {
    updateTexture();
    drawScene();
}

    // Initial render
    renderAndDraw();

/**
 * Draws the vertical scrollbar.
 */
function drawScrollbar() {
    const scrollbarWidth = 10;
    const totalHeight = lines.length * 30;
    const visibleHeight = textCanvas.height;
    const scrollbarHeight = Math.max((visibleHeight / totalHeight) * visibleHeight, 20);
    const scrollbarY = (scrollOffset / (lines.length - Math.floor(visibleHeight / 30))) * (visibleHeight - scrollbarHeight);

    textCtx.fillStyle = 'rgba(128, 128, 128, 0.5)';
    textCtx.fillRect(textCanvas.width - scrollbarWidth - 5, scrollbarY + 10, scrollbarWidth, scrollbarHeight);
}