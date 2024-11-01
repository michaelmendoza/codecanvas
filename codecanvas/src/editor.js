import { UndoManager } from "./undoManager";
import { isDelimiter, normalizeSelection } from "./utils";

export class TextEditor {

    constructor(initalCode) {
        this.lines = initalCode;                                // Initial Python code
        this.cursor = { line: 0, ch: this.lines[0].length };    // Cursor at end of first line
        this.selection = null;                                  // { start: {line, ch}, end: {line, ch} }
        this.highlights = [];                                   // Array of {line, ch, length} for all occurrences
        this.desiredColumn = this.cursor.ch;                    // Desired column for vertical cursor movements
        this.caretVisible = true;                               // Blinking caret  
        this.blinkInterval = 500;                               // Blinking caret interval
        this.renderCallback = () => {};                         // Callback for rendering blinking caret
        this.isSelecting = false;                               // Mouse selection state    
        this.scrollOffset = 0;                                  // Scrolling - Number of lines scrolled from top
        this.visibleLines = 0;                                  // Will be calculated based on canvas size
    }

    startCaretBlinking(renderCallback) {
        this.renderCallback = renderCallback;
        this.setCaretBlinking();
    }

    stopCaretBlinking() {
        clearInterval(this.caretBlinkIntervalId);
    }

    pauseCaretBlinking() {
        this.stopCaretBlinking();
        this.caretVisible = true;
        this.renderCallback();
        this.setCaretBlinking();
    }

    setCaretBlinking() {
        this.caretBlinkIntervalId = setInterval(() => {
            this.caretVisible = !this.caretVisible;
            this.renderCallback();
        }, this.blinkInterval);
    }

    /**
     * Inserts text at the current cursor position, replacing the selection if any.
     * @param {string} text 
     */
    insertText = (text) => {    
        if (this.selection) {
            this.deleteSelection();
        }
        const line = this.lines[this.cursor.line];
        const before = line.substring(0, this.cursor.ch);
        const after = line.substring(this.cursor.ch);
        this.lines[this.cursor.line] = before + text + after;
        this.cursor.ch += text.length;
        this.desiredColumn = this.cursor.ch;
        this.clearHighlights();
    }    

    /**
     * Inserts a new line at the current cursor position, splitting the current line.
     */
    insertNewLine = () => {    
        if (this.selection) {
            this.deleteSelection();
        }
        const line = this.lines[this.cursor.line];
        const before = line.substring(0, this.cursor.ch);
        const after = line.substring(this.cursor.ch);
        this.lines[this.cursor.line] = before;
        this.lines.splice(this.cursor.line + 1, 0, after);
        this.cursor.line += 1;
        this.cursor.ch = 0;
        this.desiredColumn = this.cursor.ch;
        this.clearHighlights();
    }
    
    /**
     * Deletes a character before or after the cursor.
     * @param {boolean} forward - If true, delete after the cursor (Delete key). If false, delete before (Backspace key).
     */
    deleteCharacter = (forward) => {    
        if (this.selection) {
            this.deleteSelection();
            return;
        }
        if (forward) {
            // Delete character after the cursor
            const line = this.lines[this.cursor.line];
            if (this.cursor.ch < line.length) {
                this.lines[this.cursor.line] = line.substring(0, this.cursor.ch) + line.substring(this.cursor.ch + 1);
            } else if (this.cursor.line < this.lines.length - 1) {
                // Merge with next line
                this.lines[this.cursor.line] += this.lines[this.cursor.line + 1];
                this.lines.splice(this.cursor.line + 1, 1);
            }
        } else {
            // Delete character before the cursor
            if (this.cursor.ch > 0) {
                const line = this.lines[this.cursor.line];
                this.lines[this.cursor.line] = line.substring(0, this.cursor.ch - 1) + line.substring(this.cursor.ch);
                this.cursor.ch -= 1;
                this.desiredColumn = this.cursor.ch;
            } else if (this.cursor.line > 0) {
                // Merge with previous line
                const prevLine = this.lines[this.cursor.line - 1];
                const currentLine = this.lines[this.cursor.line];
                this.cursor.ch = prevLine.length;
                this.lines[this.cursor.line - 1] = prevLine + currentLine;
                this.lines.splice(this.cursor.line, 1);
                this.cursor.line -= 1;
                this.desiredColumn = this.cursor.ch;
            }
        }
        this.clearHighlights();
    }

    /**
     * Deletes the currently selected text.
     */
    deleteSelection = () => {    
        const { start, end } = normalizeSelection(this.selection);
        if (start.line === end.line) {
            const line = this.lines[start.line];
            this.lines[start.line] = line.substring(0, start.ch) + line.substring(end.ch);
        } else {
            const firstLine = this.lines[start.line].substring(0, start.ch);
            const lastLine = this.lines[end.line].substring(end.ch);
            this.lines[start.line] = firstLine + lastLine;
            this.lines.splice(start.line + 1, end.line - start.line);
        }
        this.cursor = { ...start };
        this.selection = null;
        this.desiredColumn = this.cursor.ch;
        this.clearHighlights();
    }

            
    /**
     * Moves the cursor one position to the left.
     */
    moveCursorLeft = () => {
        if (this.selection) {
            this.cursor = { ...normalizeSelection(this.selection).start };
            this.selection = null;
        } else if (this.cursor.ch > 0) {
            this.cursor.ch -= 1;
        } else if (this.cursor.line > 0) {
            this.cursor.line -= 1;
            this.cursor.ch = this.lines[this.cursor.line].length;
        }
        this.desiredColumn = this.cursor.ch;
        this.clearHighlights();
    }
    
    /**
     * Moves the cursor one position to the right.
     */
    moveCursorRight = () => {
        if (this.selection) {
            this.cursor = { ...normalizeSelection(this.selection).end };
            this.selection = null;
        } else if (this.cursor.ch < this.lines[this.cursor.line].length) {
            this.cursor.ch += 1;
        } else if (this.cursor.line < this.lines.length - 1) {
            this.cursor.line += 1;
            this.cursor.ch = 0;
        }
        this.desiredColumn = this.cursor.ch;
        this.clearHighlights();
    }
    
    /**
     * Moves the cursor up one line, maintaining the desired column.
     */
    moveCursorUp = () => {
        if (this.cursor.line > 0) {
            this.cursor.line -= 1;
            const lineLength = this.lines[this.cursor.line].length;
            this.cursor.ch = Math.min(this.desiredColumn, lineLength);
        }
        this.selection = null;
        this.clearHighlights();
    }
    
    /**
     * Moves the cursor down one line, maintaining the desired column.
     */
    moveCursorDown = () => {
        if (this.cursor.line < this.lines.length - 1) {
            this.cursor.line += 1;
            const lineLength = this.lines[this.cursor.line].length;
            this.cursor.ch = Math.min(this.desiredColumn, lineLength);
        }
        this.cursor.line = Math.min(this.cursor.line, this.lines.length - 1);
        this.selection = null;
        this.clearHighlights();
    }
    
    /**
     * Selects all text in the editor.
     */
    selectAll = () => {
        this.selection = {
            start: { line: 0, ch: 0 },
            end: { line: this.lines.length - 1, ch: this.lines[this.lines.length - 1].length }
        };
        this.cursor = { line: this.lines.length - 1, ch: this.lines[this.lines.length - 1].length };
        this.desiredColumn = this.cursor.ch;
        this.highlightAllOccurrences(); // Highlight all since all text is selected
    }
    
    /**
     * Selects a specific word in the document.
     * @param {string} word 
     */
    selectWord = (word) => {
        if (!word) return;

        for (let i = 0; i < this.lines.length; i++) {
            let ch = this.lines[i].indexOf(word);
            if (ch !== -1) {
                // Ensure full word match
                const before = ch === 0 || isDelimiter(this.lines[i][ch - 1]);
                const after = (ch + word.length === this.lines[i].length) || isDelimiter(this.lines[i][ch + word.length]);
                if (before && after) {
                    this.selection = {
                        start: { line: i, ch: ch },
                        end: { line: i, ch: ch + word.length }
                    };
                    break; // Select first occurrence only
                }
            }
        }
    }

    /**
     * Highlights all occurrences of a given word in the document.
     * @param {string} [word] - If no word is provided, clears all highlights
     */
    highlightAllOccurrences = (word = null) => {
        if (!word) {
            // If no word is provided, highlight all text as part of selection
            this.highlights = [];
            return;
        }
        this.highlights = [];
        const normalizedWord = word.toLowerCase();
        this.lines.forEach((lineText, lineIndex) => {
            let chIndex = 0;
            const normalizedLine = lineText.toLowerCase();
            while ((chIndex = normalizedLine.indexOf(normalizedWord, chIndex)) !== -1) {
                // Ensure full word match
                const before = chIndex === 0 || isDelimiter(lineText[chIndex - 1]);
                const after = (chIndex + word.length === lineText.length) || isDelimiter(lineText[chIndex + word.length]);
                if (before && after) {
                    this.highlights.push({ line: lineIndex, ch: chIndex, length: word.length });
                }
                chIndex += word.length;
            }
        });
    }
    
    /**
     * Clears all highlight occurrences.
     */
    clearHighlights = () => {
        this.highlights = [];
    }


    /**
     * Finds and selects the first occurrence of a word.
     * @param {string} word 
     * @returns {Object|null}
     */
    getFirstOccurrenceSelection = (word) => {
        for (let i = 0; i < this.lines.length; i++) {
            let ch = this.lines[i].indexOf(word);
            if (ch !== -1) {
                // Ensure full word match
                const before = ch === 0 || isDelimiter(this.lines[i][ch - 1]);
                const after = (ch + word.length === this.lines[i].length) || isDelimiter(this.lines[i][ch + word.length]);
                if (before && after) {
                    return {
                        start: { line: i, ch: ch },
                        end: { line: i, ch: ch + word.length }
                    };
                }
            }
        }
        return null;
    }
        
    /**
     * Converts mouse coordinates to cursor position in text.
     * @param {number} x 
     * @param {number} y 
     * @returns {Object} - {line, ch}
     */
    getCursorFromPosition = (x, y, canvasRenderer) => {
        const { lineHeight, charWidth, startX, startY } = canvasRenderer;
        let line = Math.floor((y + this.scrollOffset * lineHeight - startY) / lineHeight);
        line = Math.max(0, Math.min(line, this.lines.length - 1));

        let ch = Math.floor((x - startX) / charWidth);
        ch = Math.max(0, ch);
        const lineLength = this.lines[line].length;
        ch = Math.min(ch, lineLength);

        return { line, ch };
    }

    /**
     * Finds the word at the given mouse position.
     * @param {number} x 
     * @param {number} y 
     * @returns {string|null}
     */
    getWordAtPosition = (x, y, canvasRenderer) => {
        const { line, ch } = this.getCursorFromPosition(x, y, canvasRenderer);
        const lineText = this.lines[line];
        if (!lineText) return null;

        // Find word boundaries
        const start = this.findWordStart(lineText, ch);
        const end = this.findWordEnd(lineText, ch);

        if (start === end) return null; // No word found

        return lineText.substring(start, end);
    }

    /**
     * Finds the start index of a word given a character index.
     * @param {string} text 
     * @param {number} ch 
     * @returns {number}
     */
    findWordStart = (text, ch) => {
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
    findWordEnd = (text, ch) => {
        if (ch < 0) ch = 0;
        let end = ch;
        while (end < text.length && !isDelimiter(text[end])) {
            end++;
        }
        return end;
    }

}
