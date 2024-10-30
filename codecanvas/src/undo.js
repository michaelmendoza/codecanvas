/** UndoManager manages undo/redo for TextEditor */
export class UndoManager {
    constructor(textEditor) {
        this.textEditor = textEditor;

        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 100; // Limit undo stack size
    }

    /** Saves the current state to the undo stack. */
    saveState = () => {
        // Limit undo stack size
        if (this.undoStack.length >= this.maxStackSize) {
            this.undoStack.shift();
        }
        // Deep copy of lines and cursor
        this.undoStack.push({
            lines: JSON.parse(JSON.stringify(this.textEditor.lines)),
            cursor: { ...this.textEditor.cursor },
            selection: this.textEditor.selection ? {
                start: { ...this.textEditor.selection.start },
                end: { ...this.textEditor.selection.end }
            } : null
        });
        // Clear redo stack
        this.redoStack.length = 0;
    }

    /** Performs the undo operation. */
    undo = () => {
        if (this.undoStack.length === 0) return;
        const currentState = {
            lines: JSON.parse(JSON.stringify(this.textEditor.lines)),
            cursor: { ...this.textEditor.cursor },
            selection: this.textEditor.selection ? {
                start: { ...this.textEditor.selection.start },
                end: { ...this.textEditor.selection.end }
            } : null
        };
        this.redoStack.push(currentState);
        const prevState = this.undoStack.pop();

        this.textEditor.lines = JSON.parse(JSON.stringify(prevState.lines));
        this.textEditor.cursor = { ...prevState.cursor };
        this.textEditor.selection = prevState.selection ? {
            start: { ...prevState.selection.start },
            end: { ...prevState.selection.end }
        } : null;
        //clearHighlights();
        //renderAndDraw();
    }

    /** Performs the redo operation. */
    redo = () => {
        if (this.redoStack.length === 0) return;
        const currentState = {
            lines: JSON.parse(JSON.stringify(this.textEditor.lines)),
            cursor: { ...this.textEditor.cursor },
            selection: this.textEditor.selection ? {
                start: { ...this.textEditor.selection.start },
                end: { ...this.textEditor.selection.end }
            } : null
        };
        this.undoStack.push(currentState);
        const nextState = this.redoStack.pop();

        this.textEditor.lines = JSON.parse(JSON.stringify(nextState.lines));
        this.textEditor.cursor = { ...nextState.cursor };
        this.textEditor.selection = nextState.selection ? {
            start: { ...nextState.selection.start },
            end: { ...nextState.selection.end }
        } : null;
        //clearHighlights();
        //renderAndDraw();
    }
}