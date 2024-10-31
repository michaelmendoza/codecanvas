
export class WebGLRenderer {
    constructor(canvas, textCanvas) {
        this.canvas = canvas;
        this.textCanvas = textCanvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        // Ensure WebGL is available
        if (!this.gl) {
            alert("WebGL not supported, please use a different browser.");
        }

        this.initializeWebGL(this.gl);
    }

    initializeWebGL = (gl) => {
        // Compile shaders and create program
        const program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc);
        gl.useProgram(program);
        
        // Look up attribute and uniform locations    
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        const uvLocation = gl.getAttribLocation(program, 'a_texCoord');
        const textureLocation = gl.getUniformLocation(program, 'u_texture');
        const uniforms = { texture: textureLocation }
        const attributes = { uv: uvLocation, position: positionLocation }
    
        // Initialize buffers and attributes
        initializeBuffers(gl, attributes);
    
        // Create and set up texture
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
        // Set viewport
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
            this.renderAndDraw();
        });

        // Create references
        this.uniforms = uniforms;
        this.attributes = attributes;
        this.texture = texture;
    }

    updateTexture = () => {
        updateTexture(this.gl, this.texture, this.textCanvas)
    }

    drawScene = () => { 
        drawScene(this.gl, this.texture, this.uniforms.texture);
    }

    renderAndDraw = () => {
        this.updateTexture(this.textCanvas);
        this.drawScene();
    }
}

// Create and compile shader programs
const vertexShaderSrc = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main(){
        gl_Position = vec4(a_position, 0, 1);
        v_texCoord = a_texCoord;
    }
`;
    
const fragmentShaderSrc = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    void main(){
        gl_FragColor = texture2D(u_texture, v_texCoord);
    }
`;
    
// Function to compile shader
const compileShader = (gl, shaderSource, shaderType) => {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(!success){
        console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
    
// Function to create shader program
const createProgram = (gl, vertexSrc, fragmentSrc) => { 
    const vertexShader = compileShader(gl, vertexSrc, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentSrc, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(!success){
        console.error('Program linking failed:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

const initializeBuffers = (gl, attributes) => {
// Create 2d space geometry positions
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
        -1, -1, // Bottom-left
        1, -1,  // Bottom-right
        -1, 1,  // Top-left
        -1, 1,  // Top-left
        1, -1,  // Bottom-right
        1,  1,  // Top-right
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Create texture coordinates
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    const texCoords = new Float32Array([
        0, 1, // Bottom-left
        1, 1, // Bottom-right
        0, 0, // Top-left
        0, 0, // Top-left
        1, 1, // Bottom-right
        1, 0, // Top-right
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    // Enable attributes
    gl.enableVertexAttribArray(attributes.position);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(
        attributes.position,
        2,          // size
        gl.FLOAT,   // type
        false,      // normalize
        0,          // stride
        0           // offset
    );

    gl.enableVertexAttribArray(attributes.uv);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(
        attributes.uv,
        2,          // size
        gl.FLOAT,   // type
        false,      // normalize
        0,          // stride
        0           // offset
    );

}

/**
 * Updates the WebGL texture with the current textCanvas content.
 */
const updateTexture = (gl, texture, imageCanvas) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        imageCanvas
    );
}

/**
 * Draws the WebGL scene by rendering the textured rectangle.
 */
const drawScene = (gl, texture, textureUniform) => {
    gl.clearColor(0, 0, 0, 0); // Transparent background
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1i(textureUniform, 0); // Texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
