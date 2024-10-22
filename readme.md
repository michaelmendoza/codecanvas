# CodeCanvas: Simple WebGL Code Editor

This is experiment to develop a simple code editor that works in a webgl texture. Could be used in browser with a canvas element  or in a 3d game environment for say a 3d computer terminal that has a functional text editor.

Experiments are found in the `experiments` folder.
Latest experiment support:

## Features

- **Responsive Design**: Automatically adjusts to window resizing, maintaining the correct aspect ratio.
- **WebGL Rendering**: Utilizes WebGL for high-performance text rendering.
- **Blinking Caret**: Intuitive cursor that blinks to indicate the current editing position.
- **Mouse Interaction**:
  - Click to position the caret.
  - Click-and-drag to select text.
  - Double-click to select entire words and highlight all occurrences.
- **Text Highlighting**:
  - Selection highlighting with customizable colors.
  - Highlights all instances of a selected word.
- **Clipboard Operations**:
  - **Copy**: `Ctrl/Cmd + C`
  - **Cut**: `Ctrl/Cmd + X`
  - **Paste**: `Ctrl/Cmd + V`
- **Vertical Scrolling**: Navigate through large texts with smooth vertical scrolling and a visual scrollbar.
- **Theming Options**: Choose between multiple themes (Monokai, Light, Dark) to suit your preferences.
- **Undo/Redo Functionality**:
  - **Undo**: `Ctrl/Cmd + Z`
  - **Redo**: `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z`
- **Syntax Highlighting for Python**: Enhanced readability with Python syntax highlighting using the Monokai color scheme.
- **Settings Panel**: Accessible settings to switch themes and customize the editor.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/CodeCanvas.git
