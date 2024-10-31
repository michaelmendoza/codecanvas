import { tokenizePython } from "./tokenizer";
import { normalizeSelection } from "./utils";

export class CanvasRenderer {
    constructor(codecanvas) {
    
        this.fontSize = 24;
        this.lineHeight = this.fontSize * 1.25;
        this.startX = 10;
        this.startY = 10;
        this.caretOffsetY = -5;
        this.textCanvas = document.createElement('canvas');
        this.textCtx = this.textCanvas.getContext('2d'); 

        this.codecanvas = codecanvas;
        this.currentTheme = codecanvas.currentTheme;
        this.editor = codecanvas.editor;
        this.init();
        this.render();
    }

    get charWidth () {
        return this.textCtx.measureText('M').width; // Monospace
    }

    get visibleLines () {
        return Math.floor(this.textCanvas.height / this.lineHeight);
    }

    /**
     * Initializes the canvases and sets up their sizes.
     */
    init = () => {
        // Set WebGL canvas size
        this.codecanvas.canvas.width = this.codecanvas.canvas.clientWidth;
        this.codecanvas.canvas.height = this.codecanvas.canvas.clientHeight;
    
        // Set offscreen canvas size to match WebGL canvas size for correct aspect ratio
        this.textCanvas.width = this.codecanvas.canvas.width;
        this.textCanvas.height = this.codecanvas.canvas.height;
    
        // Set text rendering properties
        this.textCtx.textBaseline = 'top';
        this.textCtx.font = `${this.fontSize}px monospace`;
    }

    /**
     * Renders text, selection, caret, and syntax highlighting on the offscreen canvas.
     */
    render = () => {
        // Clear the canvas with the background color
        this.textCtx.fillStyle = this.currentTheme.background;
        this.textCtx.fillRect(0, 0, this.textCanvas.width, this.textCanvas.height);

        // Draw highlights for all occurrences
        if (this.editor.highlights.length > 0) {
            this.textCtx.fillStyle = this.currentTheme.highlight; // Highlight color
            this.editor.highlights.forEach(({ line, ch, length }) => {
                const charWidth = this.textCtx.measureText('M').width; // Monospace
                const x = this.startX + ch * this.charWidth;
                const y = this.startY + line * this.lineHeight - this.editor.scrollOffset * this.lineHeight + this.caretOffsetY;
                const width = this.textCtx.measureText(this.editor.lines[line].substring(ch, ch + length)).width;

                this.textCtx.fillRect(x, y, width, this.lineHeight);
            });
        }

        // Draw selection background if any
        if (this.editor.selection) {
            const { start, end } = normalizeSelection(this.editor.selection);
            for (let i = start.line; i <= end.line; i++) {
                const lineText = this.editor.lines[i];
                const startCh = (i === start.line) ? start.ch : 0;
                const endCh = (i === end.line) ? end.ch : lineText.length;
                const selectedText = lineText.substring(startCh, endCh);
                const x = this.startX + startCh * this.charWidth;
                const y = this.startY + i * this.lineHeight - this.editor.scrollOffset * this.lineHeight + this.caretOffsetY;
                const width = this.textCtx.measureText(selectedText).width;
                const height = this.lineHeight; // Line height to eliminate gaps

                this.textCtx.fillStyle = this.currentTheme.selection; // Selection color
                this.textCtx.fillRect(x, y, width, height);
            }
        }

        // Draw text
        for (let i = 0; i < this.editor.lines.length; i++) {
            const y = this.startY + i * this.lineHeight - this.editor.scrollOffset * this.lineHeight;
            if (y + this.lineHeight < 0 || y > this.textCanvas.height) continue; // Skip rendering lines outside the viewport

            const tokens = tokenizePython(this.editor.lines[i]);
            let x = this.startX;
            tokens.forEach(token => {
                this.textCtx.fillStyle = this.currentTheme.syntax[token.type] || this.currentTheme.syntax.default;
                this.textCtx.fillText(token.value, x, y);
                x += this.textCtx.measureText(token.value).width;
            });
        }

        // Draw the caret if visible and within the viewport
        if (this.editor.caretVisible) {
            const { x, y } = this.getCaretCoordinates();
            if (y >= -this.lineHeight && y <= this.textCanvas.height) { // Check if caret is visible
                this.textCtx.beginPath();
                this.textCtx.moveTo(x, y + this.caretOffsetY);
                this.textCtx.lineTo(x, y + this.lineHeight + this.caretOffsetY); 
                this.textCtx.strokeStyle = this.currentTheme.caret;
                this.textCtx.lineWidth = 2;
                this.textCtx.stroke();
            }
        }

        // Draw the scrollbar
        this.drawScrollbar();
    }

    /**
     * Gets the caret coordinates based on cursor position.
     * @returns {Object} - {x, y}
     */
    getCaretCoordinates = () => {
        const { line, ch } = this.editor.cursor;
        const lineText = this.editor.lines[line] || '';
        const charWidth = this.textCtx.measureText('M').width; // Monospace
        const x = 10 + ch * charWidth;
        const y = 10 + line * this.lineHeight - this.editor.scrollOffset * this.lineHeight;
        return { x, y };
    }

    /**
     * Draws the vertical scrollbar.
     */
    drawScrollbar = () => {
        const scrollbarWidth = 10;
        const totalHeight = this.editor.lines.length * 30;
        const visibleHeight = this.textCanvas.height;

        if (totalHeight > visibleHeight) {
            const scrollbarHeight = Math.max((visibleHeight / totalHeight) * visibleHeight, 20);
            const scrollbarY = (this.editor.scrollOffset / (this.editor.lines.length - Math.floor(visibleHeight / 30))) * (visibleHeight - scrollbarHeight);
            this.textCtx.fillStyle = 'rgba(128, 128, 128, 0.5)';
            this.textCtx.fillRect(this.textCanvas.width - scrollbarWidth - 5, scrollbarY + 10, scrollbarWidth, scrollbarHeight);
        }
    }
}