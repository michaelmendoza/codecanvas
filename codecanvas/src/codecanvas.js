import { TextEditor } from "./editor";
import { CanvasEvents } from "./eventsCanvas";
import { themes } from "./themes";
import { WebGLRenderer } from "./renderWebGL";
import { CanvasRenderer } from "./renderCanvas";
import { UndoManager } from "./undoManager";

export class CodeCanvas {

    constructor(options = {}) {

        const {
            canvasId = 'glCanvas',
            theme = 'dark',
            fontsize = 14,
            initialCode = [
                '# Welcome to CodeCanvas',
                '',
                'def hello_world():',
                '    print("Hello, World!")',
                '',
            ]
        } = options;

        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        this.currentTheme = { ...themes[theme] };
        this.editor = new TextEditor(initialCode);
        this.undoManager = new UndoManager(this.editor);
        this.canvasRenderer = new CanvasRenderer(this, fontsize);
        this.webglRenderer = new WebGLRenderer(this);
        this.canvasEvents = new CanvasEvents(this);

        // Start caret blinking
        this.editor.startCaretBlinking(() => {
            this.canvasRenderer.render();
            this.webglRenderer.render();
        });    
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvasRenderer.init();
            this.canvasRenderer.render();
            this.webglRenderer.render();
        });
    }

    setTheme(theme) {
        Object.assign(this.currentTheme, themes[theme]);
        this.canvasRenderer.render();
        this.webglRenderer.render();
    }

    setFontSize(fontsize) {
        this.canvasRenderer.setFontSize(fontsize);
        this.webglRenderer.render();
    }
}
