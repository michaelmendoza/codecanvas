import { TextEditor } from "./editor";
import { normalizeSelection } from "./utils";

export class CanvasEvents {
    constructor(codecanvas) {
        this.codecanvas = codecanvas;
        this.editor = codecanvas.editor;
        this.undoManager = codecanvas.undoManager;

        this.wheelSensitivity = 1;
        this.initializeCanvasEvents(codecanvas);
    }

    /**
     * Creates event listeners for keyboard and mouse events
     * @param {*} canvas 
     * @param {TextEditor} editor 
     */
    initializeCanvasEvents = (codecanvas) => {

        const canvas = codecanvas.canvas;
        const editor = codecanvas.editor;
        const canvasRenderer = codecanvas.canvasRenderer;
        const webglRenderer = codecanvas.webglRenderer;

        // Make the canvas focusable and focus it
        canvas.setAttribute('tabindex', '0');
        canvas.focus();
        
        // Handle keyboard events
        canvas.addEventListener('keydown', async (e) => {
            e.preventDefault();
            
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
            console.log('keydown:' + e.key);

            if (e.key.length === 1 && !ctrlKey && !e.altKey && !e.metaKey) {
                this.undoManager.saveState();
                editor.insertText(e.key);
            } else if (e.key === 'Backspace') {
                this.undoManager.saveState();
                editor.deleteCharacter(false);
                if (editor.cursor.line < canvasRenderer.visibleLines - 1 + editor.scrollOffset) {
                    editor.scrollOffset = Math.max(0, editor.cursor.line - canvasRenderer.visibleLines + 1);
                }
            } else if (e.key === 'Delete') {
                this.undoManager.saveState();
                editor.deleteCharacter(true);
                if (editor.cursor.line < canvasRenderer.visibleLines - 1 + editor.scrollOffset) {
                    editor.scrollOffset = Math.max(0, editor.cursor.line - canvasRenderer.visibleLines + 1);
                }
            } else if (e.key === 'Enter') {
                this.undoManager.saveState();
                editor.insertNewLine();
                if (editor.cursor.line > canvasRenderer.visibleLines - 1) {
                    editor.scrollOffset = Math.min(editor.cursor.line - canvasRenderer.visibleLines + 1, editor.lines.length - canvasRenderer.visibleLines);
                }
            } else if (e.key === 'Tab') {
                this.undoManager.saveState();
                editor.insertText('    '); // Insert four spaces
            } else if (e.key === 'ArrowLeft') {
                editor.moveCursorLeft();
            } else if (e.key === 'ArrowRight') {
                editor.moveCursorRight();
            } else if (e.key === 'ArrowUp') {
                editor.moveCursorUp();
                if (editor.cursor.line < canvasRenderer.visibleLines - 1 + editor.scrollOffset) {
                    editor.scrollOffset = Math.max(0, editor.cursor.line - canvasRenderer.visibleLines + 1);
                }
            } else if (e.key === 'ArrowDown') {
                editor.moveCursorDown();
                if (editor.cursor.line > canvasRenderer.visibleLines - 1) {
                    editor.scrollOffset = Math.min(editor.cursor.line - canvasRenderer.visibleLines + 1, editor.lines.length - canvasRenderer.visibleLines);
                }
            } else if (ctrlKey && e.key.toLowerCase() === 'a') {
                // Select All
                editor.selectAll();
            } else if (ctrlKey && e.key.toLowerCase() === 'c') {
                // Copy
                await this.copySelection();
            } else if (ctrlKey && e.key.toLowerCase() === 'x') {
                // Cut
                this.undoManager.saveState();
                await this.cutSelection();
            } else if (ctrlKey && e.key.toLowerCase() === 'v') {
                // Paste
                this.undoManager.saveState();
                await this.pasteText();
            } else if (ctrlKey && e.key.toLowerCase() === 'z') {
                // Undo
                this.undoManager.undo();
            } else if (ctrlKey && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
                // Redo
                this.undoManager.redo();
            } else if (ctrlKey && e.key.toLowerCase() === 's') {
                // Prevent default Save dialog
            }

            editor.pauseCaretBlinking();
            canvasRenderer.render(); 
            webglRenderer.render();
        });
        
        // Handle mouse events for editor.cursor positioning and text selection
        canvas.addEventListener('mousedown', (e) => {
            const pos = this.getMousePosition(e);
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
                const pos = this.getMousePosition(e);
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
            const pos = this.getMousePosition(e);
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

        /**
         * Handles mouse wheel events for scrolling.
         */
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = Math.sign(e.deltaY) * this.wheelSensitivity;
            editor.scrollOffset += delta;
            editor.scrollOffset = Math.max(0, Math.min(editor.scrollOffset, editor.lines.length - canvasRenderer.visibleLines));            
            canvasRenderer.render();
            webglRenderer.render();
        }, { passive: false });

    }
 
    /**
     * Gets the mouse position relative to the canvas.
     * @param {MouseEvent} e 
     * @returns {Object} - {x, y}
     */
    getMousePosition = (e) => {
        const canvas = this.codecanvas.canvas;
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;   // devicePixelRatio
        const scaleY = canvas.height / rect.height; // devicePixelRatio
    
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    /**
     * Copies the selected text to the clipboard.
     */
    copySelection = async () => {
        if (!this.editor.selection) return;
        const { start, end } = normalizeSelection(this.editor.selection);
        let selectedText = '';
        for (let i = start.line; i <= end.line; i++) {
            const lineText = this.editor.lines[i];
            const startCh = (i === start.line) ? start.ch : 0;
            const endCh = (i === end.line) ? end.ch : lineText.length;
            selectedText += lineText.substring(startCh, endCh);
            if (i !== end.line) selectedText += '\n';
        }
        try {
            await navigator.clipboard.writeText(selectedText);
            console.log('Copied to clipboard:', selectedText);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    /**
     * Cuts the selected text to the clipboard and removes it from the document.
     */
    cutSelection = async () => {
        if (!this.editor.selection) return;
        await this.editor.copySelection();
        this.editor.deleteSelection();
    }

    /**
     * Pastes text from the clipboard at the current cursor position.
     */
    pasteText = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                // Save state for undo
                this.undoManager.saveState();

                if (this.editor.selection) {
                    this.editor.deleteSelection();
                }
                this.editor.insertText(text);
            }
        } catch (err) {
            console.error('Failed to paste:', err);
        }
    }

}