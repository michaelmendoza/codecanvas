import { TextEditor } from "./editor";
import { CanvasEvents } from "./eventsCanvas";
import { themes } from "./themes";
import { WebGLRenderer } from "./renderWebGL";
import { CanvasRenderer } from "./renderCanvas";

export class CodeCanvas {

    constructor(options = {}) {

        const {
            canvasId = 'glCanvas',
            initialCode = [
                '# Welcome to CodeCanvas',
                '',
                'def hello_world():',
                '    print("Hello, World!")',
                ''
            ]
        } = options;

        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        this.currentTheme = themes.monokai;
        this.editor = new TextEditor(initialCode);
        this.canvasRenderer = new CanvasRenderer(this);
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
}
