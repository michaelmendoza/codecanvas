import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import { CodeCanvas } from './src/codecanvas.js'
import { WebGLRenderer } from './src/webgl.js'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>

    <canvas id="glCanvas"> </canvas>
    <div id="settingsPanel">
        <label for="themeSelect">Theme:</label>
        <select id="themeSelect">
            <option value="monokai">Monokai</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </div>
  </div>
`

setupCounter(document.querySelector('#counter'))

const codeCanvas = new CodeCanvas();
const webglRenderer = new WebGLRenderer(codeCanvas.gl);
webglRenderer.renderAndDraw(codeCanvas.textCanvas);

console.log(codeCanvas);