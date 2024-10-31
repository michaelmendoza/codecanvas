import { TextEditor } from "./editor";

export class CanvasEvents {
    constructor(codecanvas) {
        this.codecanvas = codecanvas;
        initializeCanvasEvents(codecanvas);
    }
}

/**
 * Creates event listeners for keyboard and mouse events
 * @param {*} canvas 
 * @param {TextEditor} editor 
 */
export const initializeCanvasEvents = (codecanvas) => {

    const canvas = codecanvas.canvas;
    const editor = codecanvas.editor;
    const canvasRenderer = codecanvas.canvasRenderer;
    const webglRenderer = codecanvas.webglRenderer;

    // Make the canvas focusable and focus it
    canvas.setAttribute('tabindex', '0');
    canvas.focus();
    
    /**
     * Gets the mouse position relative to the canvas.
     * @param {MouseEvent} e 
     * @returns {Object} - {x, y}
     */
    const getMousePosition = (e) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    // Handle keyboard events
    canvas.addEventListener('keydown', async (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
        console.log('keydown:' + e.key);

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

        editor.pauseCaretBlinking();
        canvasRenderer.render(); 
        webglRenderer.render();
    });
     
    // Handle mouse events for editor.cursor positioning and text selection
    canvas.addEventListener('mousedown', (e) => {
        const pos = getMousePosition(e);
        console.log(pos.x, pos.y);
        const newCursor = editor.getCursorFromPosition(pos.x, pos.y, canvasRenderer);
        editor.cursor = newCursor;
        editor.selection = { start: { ...editor.cursor }, end: { ...editor.cursor } };
        editor.isSelecting = true;
        editor.desiredColumn = editor.cursor.ch;
        editor.clearHighlights();
        canvasRenderer.render();
        webglRenderer.render();
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (editor.isSelecting) {
            const pos = getMousePosition(e);
            const newCursor = editor.getCursorFromPosition(pos.x, pos.y, canvasRenderer);
            editor.cursor = newCursor;
            editor.selection.end = { ...editor.cursor };
            editor.desiredColumn = editor.cursor.ch;
            editor.clearHighlights();
            canvasRenderer.render();
            webglRenderer.render();
        }
    });
    
    canvas.addEventListener('mouseup', (e) => {
        if (editor.isSelecting) {
            editor.isSelecting = false;
            // If editor.selection start and end are the same, remove editor.selection
            if (editor.selection.start.line === editor.selection.end.line && editor.selection.start.ch === editor.selection.end.ch) {
                editor.selection = null;
            }
            canvasRenderer.render();
            webglRenderer.render();
        }
    });
    
    canvas.addEventListener('mouseleave', (e) => {
        if (editor.isSelecting) {
            editor.isSelecting = false;
            // If editor.selection start and end are the same, remove editor.selection
            if (editor.selection.start.line === editor.selection.end.line && editor.selection.start.ch === editor.selection.end.ch) {
                editor.selection = null;
            }
            canvasRenderer.render();
            webglRenderer.render();
        }
    });
    
    // Handle double-click for word selection and highlighting all occurrences
    canvas.addEventListener('dblclick', (e) => {
        const pos = getMousePosition(e);
        const word = editor.getWordAtPosition(pos.x, pos.y, canvasRenderer);
        if (word) {
            editor.selection = editor.getFirstOccurrenceSelection(word);
            editor.highlightAllOccurrences(word);
            canvasRenderer.render();
            webglRenderer.render();
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

