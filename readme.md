# Simple WebGL Code Editor

This is experiment to develop a simple code editor that works in a webgl texture. Could be used in browser with a canvas element  or in a 3d game environment for say a 3d computer terminal that has a functional text editor.

Experiments are found in the `experiments` folder.
Latest experiment support:

- Responsive resizing with correct aspect ratio.
- Text rendering using an offscreen 2D canvas as a WebGL texture.
- Blinking caret (cursor).
- Mouse interaction for moving the caret and selecting text.
- Text highlighting for selection and all occurrences of selected words.
- Double-click to select a word and highlight all its occurrences.
- Clipboard operations: Copy (Ctrl/Cmd + C), Paste (Ctrl/Cmd + V), Cut (Ctrl/Cmd + X).
- Undo/Redo functionality: Undo (Ctrl/Cmd + Z), Redo (Ctrl/Cmd + Y).
- Theming options: Monokai (Python), Light, Dark.
- Syntax highlighting for Python using Monokai theme.