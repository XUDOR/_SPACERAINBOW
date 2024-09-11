// Constants
const BPM = 143;
const MILLISECONDS_PER_MINUTE = 60000;
const BEATS_PER_BAR = 4;
const BAR_DURATION = (MILLISECONDS_PER_MINUTE / BPM) * BEATS_PER_BAR;
const EIGHTH_NOTE_DURATION = BAR_DURATION / 8;
const SIXTEENTH_NOTE_DURATION = BAR_DURATION / 16;

// WebGL setup
let gl;
let program;
let positionBuffer;
let colorBuffer;
let sizeBuffer;
let particles = [];

function initWebGL() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    gl = canvas.getContext('webgl');
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    // Vertex shader
    const vsSource = `
        attribute vec2 a_position;
        attribute vec3 a_color;
        attribute float a_size;
        varying vec3 v_color;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            gl_PointSize = a_size;
            v_color = a_color;
        }
    `;

    // Fragment shader
    const fsSource = `
        precision mediump float;
        varying vec3 v_color;
        void main() {
            gl_FragColor = vec4(v_color, 1.0);
        }
    `;

    // Create shader program
    const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
    program = createProgram(gl, vertexShader, fragmentShader);

    // Get attribute locations
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    const sizeAttributeLocation = gl.getAttribLocation(program, "a_size");

    // Create buffers
    positionBuffer = gl.createBuffer();
    colorBuffer = gl.createBuffer();
    sizeBuffer = gl.createBuffer();

    // Enable attributes
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.enableVertexAttribArray(sizeAttributeLocation);

    // Set up attribute pointers
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.vertexAttribPointer(sizeAttributeLocation, 1, gl.FLOAT, false, 0, 0);
}

function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

function createParticle() {
    return {
        position: [Math.random() * 2 - 1, 1],
        color: [Math.random(), Math.random(), Math.random()],
        size: Math.random() * 10 + 5,
        speed: Math.random() * 0.01 + 0.005
    };
}

function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
        particles[i].position[1] -= particles[i].speed;
        if (particles[i].position[1] < -1) {
            particles[i] = createParticle();
        }
    }
}

function renderParticles() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    const positions = new Float32Array(particles.flatMap(p => p.position));
    const colors = new Float32Array(particles.flatMap(p => p.color));
    const sizes = new Float32Array(particles.map(p => p.size));

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.DYNAMIC_DRAW);

    gl.useProgram(program);
    gl.drawArrays(gl.POINTS, 0, particles.length);
}

// Animation loop
function animate() {
    updateParticles();
    renderParticles();
    requestAnimationFrame(animate);
}

// Initialize
function init() {
    initWebGL();
    for (let i = 0; i < 1000; i++) {
        particles.push(createParticle());
    }
    animate();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const startTriangle = document.getElementById('start-triangle');
    const audio = document.getElementById('background-audio');
    const stopButton = document.getElementById('stop-button');
    const downloadLogButton = document.getElementById('download-log');
    const downloadDomButton = document.getElementById('download-dom');
    const spaceship = document.getElementById('spaceship');

    let spaceshipPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    startTriangle.addEventListener('click', () => {
        startTriangle.style.display = 'none';
        audio.play();
        init();
    });

    stopButton.addEventListener('click', () => {
        audio.pause();
        audio.currentTime = 0;
        // Additional stop logic here
    });

    downloadLogButton.addEventListener('click', () => {
        // Implement log download logic
    });

    downloadDomButton.addEventListener('click', () => {
        // Implement DOM elements download logic
    });

    // Spaceship movement
    document.addEventListener('mousemove', (event) => {
        spaceshipPosition.x += (event.clientX - spaceshipPosition.x) * 0.1;
        spaceshipPosition.y += (event.clientY - spaceshipPosition.y) * 0.1;
        updateSpaceshipPosition();
    });

    document.addEventListener('touchmove', (event) => {
        const touch = event.touches[0];
        spaceshipPosition.x = touch.clientX;
        spaceshipPosition.y = touch.clientY;
        updateSpaceshipPosition();
    });

    function updateSpaceshipPosition() {
        const maxX = window.innerWidth - 50;
        const maxY = window.innerHeight - 50;
        spaceshipPosition.x = Math.max(0, Math.min(spaceshipPosition.x, maxX));
        spaceshipPosition.y = Math.max(0, Math.min(spaceshipPosition.y, maxY));

        spaceship.style.transform = `translate(${spaceshipPosition.x}px, ${spaceshipPosition.y}px)`;
    }
});

// CSS Optimizations
const style = document.createElement('style');
style.textContent = `
    .spaceship {
        position: absolute;
        width: 50px;
        height: 50px;
        background-image: url('images/SPACESHIP1.svg');
        background-size: contain;
        background-repeat: no-repeat;
        z-index: 10;
        will-change: transform;
    }

    .start-triangle {
        width: 0;
        height: 0;
        border-left: 25vw solid transparent;
        border-right: 25vw solid transparent;
        border-bottom: 50vh solid white;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        z-index: 20;
    }
`;
document.head.appendChild(style);