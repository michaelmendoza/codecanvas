import { TextEditor } from "./editor";
import { isDelimiter } from "./utils";

/**
 * Creates event listeners for keyboard and mouse events
 * @param {*} canvas 
 * @param {TextEditor} editor 
 */
export const initializeKeyboardAndMouseEvents = (codecanvas) => {

    // Make the canvas focusable and focus it
    const canvas = codecanvas.canvas;
    const editor = codecanvas.editor;
    canvas.focus();
    
    // Handle keyboard events
    canvas.addEventListener('keydown', async (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

        if (e.key.length === 1 && !ctrlKey && !e.altKey && !e.metaKey) {
            // Insert character
            editor.insertText(e.key);
            e.preventDefault();
        } else if (e.key === 'Backspace') {
            editor.deleteCharacter(false);
            e.preventDefault();
        } else if (e.key === 'Delete') {
            editor.deleteCharacter(true);
            e.preventDefault();
        } else if (e.key === 'Enter') {
            editor.insertNewLine();
            e.preventDefault();
        } else if (e.key === 'Tab') {
            editor.insertText('    '); // Insert four spaces
            e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
            editor.moveCursorLeft();
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            editor.moveCursorRight();
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            editor.moveCursorUp();
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            editor.moveCursorDown();
            e.preventDefault();
        } else if (ctrlKey && e.key.toLowerCase() === 'a') {
            // Select All
            editor.selectAll();
            e.preventDefault();
        } else if (ctrlKey && e.key.toLowerCase() === 'c') {
            // Copy
            await editor.copySelection();
            e.preventDefault();
        } else if (ctrlKey && e.key.toLowerCase() === 'x') {
            // Cut
            await editor.cutSelection();
            e.preventDefault();
        } else if (ctrlKey && e.key.toLowerCase() === 'v') {
            // Paste
            await editor.pasteText();
            e.preventDefault();
        } else if (ctrlKey && e.key.toLowerCase() === 'z') {
            // Undo
            editor.undo.undo();
            e.preventDefault();
        } else if (ctrlKey && (e.key.toLowerCase() === 'y' || (isMac && e.shiftKey && e.key.toLowerCase() === 'z'))) {
            // Redo
            editor.undo.redo();
            e.preventDefault();
        } else if (ctrlKey && e.key.toLowerCase() === 's') {
            // Prevent default Save dialog
            e.preventDefault();
        }

        codecanvas.renderAndDraw();
    });
     
    // Handle mouse events for editor.cursor positioning and text selection
    canvas.addEventListener('mousedown', (e) => {
        const pos = getMousePosition(e);
        const newCursor = getCursorFromPosition(pos.x, pos.y);
        editor.cursor = newCursor;
        editor.selection = { start: { ...editor.cursor }, end: { ...editor.cursor } };
        codecanvas.isSelecting = true;
        editor.desiredColumn = editor.cursor.ch;
        clearHighlights();
        codecanvas.renderAndDraw();
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (codecanvas.isSelecting) {
            const pos = getMousePosition(e);
            const newCursor = getCursorFromPosition(pos.x, pos.y);
            editor.cursor = newCursor;
            editor.selection.end = { ...editor.cursor };
            editor.desiredColumn = editor.cursor.ch;
            clearHighlights();
            codecanvas.renderAndDraw();
        }
    });
    
    canvas.addEventListener('mouseup', (e) => {
        if (codecanvas.isSelecting) {
            codecanvas.isSelecting = false;
            // If editor.selection start and end are the same, remove editor.selection
            if (editor.selection.start.line === editor.selection.end.line && editor.selection.start.ch === editor.selection.end.ch) {
                editor.selection = null;
            }
            codecanvas.renderAndDraw();
        }
    });
    
    canvas.addEventListener('mouseleave', (e) => {
        if (codecanvas.isSelecting) {
            codecanvas.isSelecting = false;
            // If editor.selection start and end are the same, remove editor.selection
            if (editor.selection.start.line === editor.selection.end.line && editor.selection.start.ch === editor.selection.end.ch) {
                editor.selection = null;
            }
            codecanvas.renderAndDraw();
        }
    });
    
    // Handle double-click for word selection and highlighting all occurrences
    canvas.addEventListener('dblclick', (e) => {
        const pos = getMousePosition(e);
        const word = getWordAtPosition(pos.x, pos.y);
        if (word) {
            editor.selection = editor.getFirstOccurrenceSelection(word);
            editor.highlightAllOccurrences(word);
            codecanvas.renderAndDraw();
        }
    });
    
    // Prevent default drag behavior
    canvas.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

}
 
/**
 * Gets the mouse position relative to the canvas.
 * @param {MouseEvent} e 
 * @returns {Object} - {x, y}
 */
export const getMousePosition = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

/**
 * Converts mouse coordinates to cursor position in text.
 * @param {number} x 
 * @param {number} y 
 * @returns {Object} - {line, ch}
 */
export const getCursorFromPosition = (textCtx, lines, scrollOffset, x, y) => {
    // TODO: Make this work with updated ARGS
    const lineHeight = 30; // Must match rendering
    const charWidth = textCtx.measureText('M').width; // Monospace
    const startX = 10;
    const startY = 10;

    let line = Math.floor((y + scrollOffset * lineHeight - startY) / lineHeight);
    line = Math.max(0, Math.min(line, lines.length - 1));

    let ch = Math.floor((x - startX) / charWidth);
    ch = Math.max(0, ch);
    const lineLength = lines[line].length;
    ch = Math.min(ch, lineLength);

    return { line, ch };
}

/**
 * Finds the word at the given mouse position.
 * @param {number} x 
 * @param {number} y 
 * @returns {string|null}
 */
export const getWordAtPosition = (lines, x, y) => {
    const { line, ch } = getCursorFromPosition(x, y);
    const lineText = lines[line];
    if (!lineText) return null;

    // Find word boundaries
    const start = findWordStart(lineText, ch);
    const end = findWordEnd(lineText, ch);

    if (start === end) return null; // No word found

    return lineText.substring(start, end);
}

/**
 * Finds the start index of a word given a character index.
 * @param {string} text 
 * @param {number} ch 
 * @returns {number}
 */
export const findWordStart = (text, ch) => {
    if (ch > text.length) ch = text.length;
    let start = ch;
    while (start > 0 && !isDelimiter(text[start - 1])) {
        start--;
    }
    return start;
}

/**
 * Finds the end index of a word given a character index.
 * @param {string} text 
 * @param {number} ch 
 * @returns {number}
 */
export const findWordEnd = (text, ch) => {
    if (ch < 0) ch = 0;
    let end = ch;
    while (end < text.length && !isDelimiter(text[end])) {
        end++;
    }
    return end;
}
