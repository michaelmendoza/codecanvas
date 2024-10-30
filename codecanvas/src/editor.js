import { UndoManager } from "./undo";
import { isDelimiter, normalizeSelection } from "./utils";

export class TextEditor {

    constructor() {
        this.lines = ['# Welcome to the Python Editor', '', 'def hello_world():', '    print("Hello, World!")', '']; // Sample Python code
        this.cursor = { line: 0, ch: this.lines[0].length };    // Cursor at end of first line
        this.selection = null;                                  // { start: {line, ch}, end: {line, ch} }
        this.highlights = [];                                   // Array of {line, ch, length} for all occurrences
        this.desiredColumn = this.cursor.ch;                    // Desired column for vertical cursor movements

        this.undo = new UndoManager(this);
    }

    /**
     * Inserts text at the current cursor position, replacing the selection if any.
     * @param {string} text 
     */
    insertText = (text) => {
        // Save state for undo
        this.undo.saveState();
    
        if (this.selection) {
            this.deleteSelection();
        }
        const line = this.lines[cursor.line];
        const before = line.substring(0, cursor.ch);
        const after = line.substring(cursor.ch);
        this.lines[this.cursor.line] = before + text + after;
        this.cursor.ch += text.length;
        this.desiredColumn = this.cursor.ch;
        this.clearHighlights();
        //renderAndDraw();
    }    

    /**
     * Inserts a new line at the current cursor position, splitting the current line.
     */
    insertNewLine = () => {
        // Save state for undo
        this.undo.saveState();
    
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
        //renderAndDraw();
    }
    
    /**
     * Deletes a character before or after the cursor.
     * @param {boolean} forward - If true, delete after the cursor (Delete key). If false, delete before (Backspace key).
     */
    deleteCharacter = (forward) => {
        // Save state for undo
        this.undo.saveState();
    
        if (selection) {
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
        //renderAndDraw();
    }

    /**
     * Deletes the currently selected text.
     */
    deleteSelection = () => {
        // Save state for undo
        this.undo.saveState();
    
        const { start, end } = normalizeSelection(selection);
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
        this.desiredColumn = cursor.ch;
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
            this.cursor.ch = lines[this.cursor.line].length;
        }
        this.desiredColumn = this.cursor.ch;
        this.clearHighlights();
        //renderAndDraw();
    }
    
    /**
     * Moves the cursor one position to the right.
     */
    moveCursorRight = () => {
        if (this.selection) {
            this.cursor = { ...normalizeSelection(this.selection).end };
            this.selection = null;
        } else if (this.cursor.ch < lines[this.cursor.line].length) {
            this.cursor.ch += 1;
        } else if (this.cursor.line < lines.length - 1) {
            this.cursor.line += 1;
            this.cursor.ch = 0;
        }
        this.desiredColumn = this.cursor.ch;
        this.clearHighlights();
        //renderAndDraw();
    }
    
    /**
     * Moves the cursor up one line, maintaining the desired column.
     */
    moveCursorUp = () => {
        if (this.cursor.line > 0) {
            this.cursor.line -= 1;
            const lineLength = lines[this.cursor.line].length;
            this.cursor.ch = Math.min(this.desiredColumn, lineLength);
        }
        this.selection = null;
        this.clearHighlights();
        //renderAndDraw();
    }
    
    /**
     * Moves the cursor down one line, maintaining the desired column.
     */
    moveCursorDown = () => {
        if (this.cursor.line < lines.length - 1) {
            this.cursor.line += 1;
            const lineLength = lines[this.cursor.line].length;
            this.cursor.ch = Math.min(this.desiredColumn, lineLength);
        }
        this.selection = null;
        this.clearHighlights();
        //renderAndDraw();
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
        //renderAndDraw();
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
        for (let i = 0; i < lines.length; i++) {
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
     * Copies the selected text to the clipboard.
     */
    copySelection = async () => {
        if (!this.selection) return;
        const { start, end } = normalizeSelection(this.selection);
        let selectedText = '';
        for (let i = start.line; i <= end.line; i++) {
            const lineText = this.lines[i];
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
        if (!this.selection) return;
        await this.copySelection();
        this.deleteSelection();
    }

    /**
     * Pastes text from the clipboard at the current cursor position.
     */
    pasteText = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                // Save state for undo
                this.undo.saveState();

                if (this.selection) {
                    this.deleteSelection();
                }
                this.insertText(text);
            }
        } catch (err) {
            console.error('Failed to paste:', err);
        }
    }

}
