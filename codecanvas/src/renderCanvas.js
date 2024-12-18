import { tokenizePython } from "./tokenizer";
import { normalizeSelection } from "./utils";

export class CanvasRenderer {
    constructor(codecanvas, fontSize) {
    
        // Set CodeCanvas properties
        this.codecanvas = codecanvas;
        this.currentTheme = codecanvas.currentTheme;
        this.editor = codecanvas.editor;

        // Set text rendering properties
        this.devicePixelRatio = window.devicePixelRatio || 1;

        this.fontSize = fontSize;
        this.scaledFontSize = fontSize * this.devicePixelRatio;
        this.lineHeight = this.scaledFontSize * 1.25;
        this.lineNumberWidth = 50;
        this.startX = (10 + this.lineNumberWidth) * this.devicePixelRatio;
        this.startY = 10 * this.devicePixelRatio;
        this.caretOffsetY = -0.15 * this.lineHeight;

        // Create offscreen canvas and context
        this.textCanvas = document.createElement('canvas');
        this.textCtx = this.textCanvas.getContext('2d'); 

        // Initialize canvas and render
        this.init();
        this.render();
    }

    get charWidth () {
        return this.textCtx.measureText('M').width; // Monospace
    }

    get visibleLines () {
        return Math.floor(this.textCanvas.height / this.lineHeight / this.devicePixelRatio) - 1;
    }

    /** Updates text rendering properties based on fontsize */
    setFontSize = (fontSize) => {
        this.scaledFontSize = fontSize * this.devicePixelRatio;
        this.lineHeight = this.scaledFontSize * 1.25;
        this.caretOffsetY = -0.15 * this.lineHeight;
    }

    /**
     * Initializes the canvases and sets up their sizes.
     */
    init = () => {

        const canvasWidth = this.codecanvas.canvas.clientWidth;
        const canvasHeight = this.codecanvas.canvas.clientHeight;

        // Set WebGL canvas size
        this.codecanvas.canvas.width = canvasWidth * this.devicePixelRatio;
        this.codecanvas.canvas.height = canvasHeight * this.devicePixelRatio;
    
        // Set CSS size to desired size
        this.codecanvas.canvas.style.width = `${canvasWidth}px`;
        this.codecanvas.canvas.style.height = `${canvasHeight}px`;

        // Set offscreen canvas size to match WebGL canvas size for correct aspect ratio
        this.textCanvas.width = this.codecanvas.canvas.width * this.devicePixelRatio;
        this.textCanvas.height = this.codecanvas.canvas.height * this.devicePixelRatio;
    
        // Set CSS size for the offscreen canvas
        this.textCanvas.style.width = `${canvasWidth}px`;
        this.textCanvas.style.height = `${canvasHeight}px`;

        // Set canvas scaling
        this.textCtx.scale(this.devicePixelRatio, this.devicePixelRatio);

        // Set text rendering properties
        this.textCtx.textBaseline = 'top';
        this.textCtx.font = `${this.scaledFontSize}px monospace`;
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
                this.textCtx.textAlign = "left";
                this.textCtx.fillStyle = this.currentTheme.syntax[token.type] || this.currentTheme.syntax.default;
                this.textCtx.fillText(token.value, x, y);
                x += this.textCtx.measureText(token.value).width;
            });
        }

        // Loop through visible lines and draw line numbers
        for (let i = 0; i < this.editor.lines.length; i++) {
            const y = this.startY + i * this.lineHeight - this.editor.scrollOffset * this.lineHeight;
            if (y + this.lineHeight < 0 || y > this.textCanvas.height) continue; // Skip lines outside the viewport

            const lineNumber = (i + 1).toString();
            const x = this.startX - this.lineNumberWidth; 

            // Draw the line number
            this.textCtx.textAlign = "right";
            if (i === this.editor.cursor.line) {
                this.textCtx.fillStyle = this.currentTheme.activeLineNumberColor || '#EEE';
            }
            else {
                this.textCtx.fillStyle = this.currentTheme.lineNumberColor || '#888';
            }
            this.textCtx.fillText(lineNumber, x, y);
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
        const x = this.startX + ch * this.charWidth;
        const y = this.startY + line * this.lineHeight - this.editor.scrollOffset * this.lineHeight;
        return { x, y };
    }

    /**
     * Draws the vertical scrollbar.
     */
    drawScrollbar = () => {
        const scrollbarWidth = 10;
        const scrollbarPadding = { x: 5, y: 5 };
        const totalHeight = this.editor.lines.length * this.lineHeight;
        const visibleHeight = this.visibleLines * this.lineHeight;
        const visibleWidth = this.textCanvas.width / this.devicePixelRatio;
        const canvasHeight = this.textCanvas.height / this.devicePixelRatio;

        if (totalHeight > visibleHeight) {
            const scrollbarHeight = Math.max((visibleHeight / totalHeight) * canvasHeight, 20);
            const scrollbarY = (this.editor.scrollOffset / (this.editor.lines.length - Math.floor(visibleHeight / this.lineHeight))) * (canvasHeight - scrollbarHeight);
            this.textCtx.fillStyle = 'rgba(128, 128, 128, 0.5)';
            this.textCtx.fillRect(visibleWidth - scrollbarWidth - scrollbarPadding.x, scrollbarY + scrollbarPadding.y, scrollbarWidth, scrollbarHeight - 2 * scrollbarPadding.y);
        }
    }
}