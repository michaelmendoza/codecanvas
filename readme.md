# CodeCanvas: Simple WebGL Code Editor

CodeCanvas is a lightweight, canvas-based code editor built using JavaScript and WebGL. It aims to provide a smooth and responsive coding experience directly within the browser. This editor is rendered on a WebGL texture and offers a basic code editor with syntax highlighting and other essential editor features.

This is project is an experiment to develop a simple code editor that works in a webgl texture. CodeCanvas can be used in browser with a canvas element or in a 3d game environment for say a 3d computer terminal that has a functional text editor. This project is still in active development and a roadmap is available in the `docs` folder.

## **Table of Contents**

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Customization](#customization)
  - [Themes](#themes)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## **Features**

- **Canvas Rendering**: Utilizes HTML5 Canvas and WebGL for high-performance rendering.
- **WebGL Rendering**: Utilizes WebGL for rendering a text editor on a texture.
- **Syntax Highlighting**: Supports syntax highlighting for Python code out of the box.
- **Line Numbers**: Displays line numbers for better code navigation.
- **Caret and Selection Management**: Handles text input, cursor movement, and text selection.
- **Clipboard Operations**: Supports copy, cut, and paste operations using the clipboard API.
- **Undo/Redo Functionality**: Implements an undo manager to track changes and revert actions.
- **Customizable Themes**: Offers theming support to switch between different color schemes.
- **Syntax Highlighting for Python**: Supports only Python syntax highlighting for now.

## **Getting Started**

### **Prerequisites**

- **Web Browser**: A modern web browser that supports HTML5 Canvas and WebGL (e.g., Chrome, Firefox, Edge).
- **Node.js and npm**: For setting up a development environment and managing dependencies.

### **Installation**

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/codecanvas.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd codecanvas
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Start the Development Server**

   ```bash
   npm run dev
   ```

   This will start a local development server and open the editor in your default browser.

## **Usage**

- **Typing and Editing**: Click on the editor canvas to focus and start typing your code.
- **Cursor Movement**: Use arrow keys to navigate through the code.
- **Selection**: Click and drag to select text or use `Shift` with arrow keys.
- **Clipboard Operations**:
  - **Copy**: `Ctrl+C` (or `Cmd+C` on Mac)
  - **Cut**: `Ctrl+X` (or `Cmd+X` on Mac)
  - **Paste**: `Ctrl+V` (or `Cmd+V` on Mac)
- **Undo/Redo**:
  - **Undo**: `Ctrl+Z` (or `Cmd+Z` on Mac)
  - **Redo**: `Ctrl+Y` or `Ctrl+Shift+Z` (or `Cmd+Shift+Z` on Mac)
- **Scrolling**: Use the mouse wheel or trackpad to scroll through the code.

### **Themes**

CodeCanvas comes with a few built-in themes, including Monokai, Light, and Dark. You can switch themes by calling the `setTheme` method:

```javascript
codeCanvas.setTheme('monokai'); // Options: 'monokai', 'light', 'dark'
```

To add a new theme, modify the `themes.js` file and define your color scheme.

## **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## **Contributing**

Contributions are welcome! 