import { TextEditor } from "./editor";
import { initializeKeyboardAndMouseEvents } from "./events";
import { themes } from "./themes";
import { tokenizePython } from "./tokenizer";
import { normalizeSelection } from "./utils";
import { WebGLRenderer } from "./webgl";

export class CodeCanvas {

    constructor() {

        this.editor = new TextEditor();

        // Get the WebGL canvas and set its size
        this.canvas = document.getElementById('glCanvas');
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
         
         // Ensure WebGL is available
        if (!this.gl) {
             alert("WebGL not supported, please use a different browser.");
        }
        
        // Offscreen canvas for text rendering
        this.textCanvas = document.createElement('canvas');
        this.textCtx = this.textCanvas.getContext('2d');        
        this.init();

        this.webglRenderer = new WebGLRenderer(this.gl);
        this.webglRenderer.renderAndDraw(this.textCanvas);
    }

    init() {
        
        // Blinking caret
        this.caretVisible = true;
        this.blinkInterval = 500; // milliseconds
        
        // Mouse selection state
        this.isSelecting = false;
        
        // Scrolling
        this.scrollOffset = 0; // Number of lines scrolled from top
        this.visibleLines = 0; // Will be calculated based on canvas size

        // Current Theme
        this.currentTheme = themes.monokai;

        this.initializeCanvas();
        this.renderTextCanvas();    
        initializeKeyboardAndMouseEvents(this);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.initializeCanvas();
            this.renderTextCanvas();
            this.webglRenderer.renderAndDraw(this.textCanvas);
        });
    }

    /**
     * Initializes the canvases and sets up their sizes.
     */
    initializeCanvas = () => {
        // Set WebGL canvas size
        //canvas.width = window.innerWidth;
        //canvas.height = window.innerHeight;
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    
        // Set offscreen canvas size to match WebGL canvas size for correct aspect ratio
        this.textCanvas.width = this.canvas.width;
        this.textCanvas.height = this.canvas.height;
    
        // Calculate visible lines (not directly used but can be useful)
        // visibleLines = Math.floor(textCanvas.height / 30);
    }

    /**
     * Renders text, selection, caret, and syntax highlighting on the offscreen canvas.
     */
    renderTextCanvas = () => {
        // Clear the canvas with the background color
        this.textCtx.fillStyle = this.currentTheme.background;
        this.textCtx.fillRect(0, 0, this.textCanvas.width, this.textCanvas.height);

        // Draw highlights for all occurrences
        if (this.editor.highlights.length > 0) {
            this.textCtx.fillStyle = this.currentTheme.highlight; // Highlight color
            this.editor.highlights.forEach(({ line, ch, length }) => {
                const charWidth = this.textCtx.measureText('M').width; // Monospace
                const x = 10 + ch * charWidth;
                const y = 10 + line * 30 - this.scrollOffset * 30;
                const width = this.textCtx.measureText(this.editor.lines[line].substring(ch, ch + length)).width;
                const height = 30; // Line height

                this.textCtx.fillRect(x, y, width, height);
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
                const charWidth = this.textCtx.measureText('M').width; // Monospace
                const x = 10 + startCh * charWidth;
                const y = 10 + i * 30 - this.scrollOffset * 30;
                const width = this.textCtx.measureText(selectedText).width;
                const height = 30; // Line height to eliminate gaps

                this.textCtx.fillStyle = this.currentTheme.selection; // Selection color
                this.textCtx.fillRect(x, y, width, height);
            }
        }

        // Draw the text with syntax highlighting
        this.textCtx.textBaseline = 'top';
        this.textCtx.font = '24px monospace';

        for (let i = 0; i < this.editor.lines.length; i++) {
            const y = 10 + i * 30 - this.scrollOffset * 30;
            if (y + 30 < 0 || y > this.textCanvas.height) continue; // Skip rendering lines outside the viewport

            const tokens = tokenizePython(this.editor.lines[i]);
            let x = 10;
            tokens.forEach(token => {
                this.textCtx.fillStyle = this.currentTheme.syntax[token.type] || this.currentTheme.syntax.default;
                this.textCtx.fillText(token.value, x, y);
                x += this.textCtx.measureText(token.value).width;
            });
        }

        // Draw the caret if visible and within the viewport
        if (this.caretVisible) {
            const { x, y } = this.getCaretCoordinates();
            if (y >= -30 && y <= this.textCanvas.height) { // Check if caret is visible
                this.textCtx.beginPath();
                this.textCtx.moveTo(x, y);
                this.textCtx.lineTo(x, y + 24); // 24px height matching font size
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
        const y = 10 + line * 30 - this.scrollOffset * 30;
        return { x, y };
    }

    /**
     * Draws the vertical scrollbar.
     */
    drawScrollbar = () => {
        const scrollbarWidth = 10;
        const totalHeight = this.editor.lines.length * 30;
        const visibleHeight = this.textCanvas.height;
        const scrollbarHeight = Math.max((visibleHeight / totalHeight) * visibleHeight, 20);
        const scrollbarY = (this.scrollOffset / (this.editor.lines.length - Math.floor(visibleHeight / 30))) * (visibleHeight - scrollbarHeight);

        this.textCtx.fillStyle = 'rgba(128, 128, 128, 0.5)';
        this.textCtx.fillRect(this.textCanvas.width - scrollbarWidth - 5, scrollbarY + 10, scrollbarWidth, scrollbarHeight);
    }
}
