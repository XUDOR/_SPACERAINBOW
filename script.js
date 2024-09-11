document.addEventListener('DOMContentLoaded', () => {
    const colors = [
        '#225f6e', '#53a9ad', '#a1ad39', '#b1cc11', 
        '#f2cb0a', '#efae0c', '#e8210c', '#51d0e5', 
        '#1e7777', '#878c17', '#dae858', '#a3860d', 
        '#c66709', '#ff0000', '#ffff00', '#ff0000', 
        '#1818a0', '#f2dc0f', '#aa0e0e'
    ];
    const startTriangle = document.getElementById('start-triangle');
    const audio = document.getElementById('background-audio');
    const stopButton = document.getElementById('stop-button');
    const downloadLogButton = document.getElementById('download-log');
    const downloadDomButton = document.getElementById('download-dom');
    const spaceship = document.getElementById('spaceship');
    const exitButton = document.createElement('button');
    exitButton.id = 'exit-button';
    exitButton.textContent = 'X';
    document.body.appendChild(exitButton);
    exitButton.style.position = 'fixed';
    exitButton.style.top = '10px';
    exitButton.style.right = '10px';
    exitButton.style.zIndex = '100';

    let portalCount = 0;
    let log = [];
    let spaceshipPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let backgrounds = [];
    let backgroundIntervals = [];

    const BPM = 143;
    const MILLISECONDS_PER_MINUTE = 60000;
    const BEATS_PER_BAR = 4;
    const barDuration = (MILLISECONDS_PER_MINUTE / BPM) * BEATS_PER_BAR;
    const eighthNoteDuration = barDuration / 8;
    const sixteenthNoteDuration = barDuration / 16;

    // WebGL setup
    let gl, program, positionBuffer, colorBuffer, sizeBuffer;
    let particles = [];

    function initWebGL() {
        const canvas = document.createElement('canvas');
        resizeCanvasToDisplaySize(canvas);
        document.body.insertBefore(canvas, document.body.firstChild);

        gl = canvas.getContext('webgl');
        if (!gl) {
            console.error('WebGL not supported');
            return;
        }

        const vsSource = `
            attribute vec2 a_position;
            attribute vec3 a_color;
            attribute float a_size;
            uniform vec2 u_resolution;
            varying vec3 v_color;
            void main() {
                vec2 zeroToOne = a_position / u_resolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                gl_PointSize = a_size;
                v_color = a_color;
            }
        `;

        const fsSource = `
            precision mediump float;
            varying vec3 v_color;
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                if(length(coord) > 0.5) discard;
                gl_FragColor = vec4(v_color, 1.0);
            }
        `;

        const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
        program = createProgram(gl, vertexShader, fragmentShader);

        positionBuffer = gl.createBuffer();
        colorBuffer = gl.createBuffer();
        sizeBuffer = gl.createBuffer();

        gl.useProgram(program);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    function resizeCanvasToDisplaySize(canvas) {
        const dpr = window.devicePixelRatio;
        const { width, height } = canvas.getBoundingClientRect();
        const displayWidth = Math.round(width * dpr);
        const displayHeight = Math.round(height * dpr);

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
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
        const colorIndex = Math.floor(Math.random() * colors.length);
        const color = hexToRgb(colors[colorIndex]);
        return {
            position: [Math.random() * gl.canvas.width, 0],
            color: [color.r / 255, color.g / 255, color.b / 255],
            size: Math.random() * 10 + 5,
            speed: Math.random() * 2 + 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        };
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function updateParticles() {
        for (let i = 0; i < particles.length; i++) {
            particles[i].position[1] += particles[i].speed;
            particles[i].rotation += particles[i].rotationSpeed;
            if (particles[i].position[1] > gl.canvas.height) {
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
        gl.vertexAttribPointer(gl.getAttribLocation(program, "a_position"), 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(gl.getAttribLocation(program, "a_position"));

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(gl.getAttribLocation(program, "a_color"), 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(gl.getAttribLocation(program, "a_color"));

        gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(gl.getAttribLocation(program, "a_size"), 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(gl.getAttribLocation(program, "a_size"));

        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

        gl.drawArrays(gl.POINTS, 0, particles.length);
    }

    function animate() {
        updateParticles();
        renderParticles();
        requestAnimationFrame(animate);
    }

    function logMessage(message, element = null) {
        const logEntry = {
            timestamp: Date.now(),
            message,
            element: element ? element.outerHTML : null
        };
        log.push(logEntry);
        console.log(message, element);
    }

    function flashBackgroundColor() {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.style.backgroundColor = randomColor;
    }

    function flashColorScreen() {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const colorScreen = document.createElement('div');
        colorScreen.style.position = 'fixed';
        colorScreen.style.top = 0;
        colorScreen.style.left = 0;
        colorScreen.style.width = '100%';
        colorScreen.style.height = '100%';
        colorScreen.style.backgroundColor = color;
        colorScreen.style.opacity = 0;
        colorScreen.style.transition = 'opacity 0.2s';
        colorScreen.style.pointerEvents = 'none';
        document.body.appendChild(colorScreen);

        requestAnimationFrame(() => {
            colorScreen.style.opacity = '0.9';
        });

        setTimeout(() => {
            colorScreen.remove();
        }, 300);
    }

    function startPortalEffect() {
        logMessage('Starting portal effect');
        let portalInterval = setInterval(flashBackgroundColor, 20);
        let colorScreenInterval = setInterval(flashColorScreen, Math.random() * (1000 - 500) + 500);

        const portalDuration = 3000;
        const colorFlashes = setInterval(() => {
            const color = colors[Math.floor(Math.random() * colors.length)];
            document.body.style.backgroundColor = color;
            setTimeout(() => {
                document.body.style.backgroundColor = 'black';
            }, 100);
        }, 100);

        setTimeout(() => {
            clearInterval(portalInterval);
            clearInterval(colorScreenInterval);
            clearInterval(colorFlashes);
            portalCount++;
            document.body.style.backgroundColor = 'black';
        }, portalDuration);
    }

    function schedulePortalEffect() {
        logMessage('Scheduling portal effect');
        setTimeout(startPortalEffect, 10000);
        setTimeout(startPortalEffect, 20000);
        setTimeout(startPortalEffect, 30000);
        setTimeout(startPortalEffect, 40000);
        setTimeout(startPortalEffect, 50000);
    }

    function scheduleRainEvents() {
        setInterval(() => {
            for (let i = 0; i < 10; i++) {
                particles.push(createParticle());
            }
        }, barDuration * 4);

        setInterval(() => particles.push(createParticle()), eighthNoteDuration);

        setInterval(() => {
            for (let i = 0; i < 10; i++) {
                particles.push(createParticle());
            }
        }, barDuration);

        setInterval(() => {
            const specialParticle = createParticle();
            specialParticle.color = [1, 0.843, 0]; // Gold color
            specialParticle.size *= 2;
            particles.push(specialParticle);
        }, sixteenthNoteDuration * 4);
    }

    function animateBackgrounds() {
        const bgImages = [
            'images/background1.png',
            'images/background2.png',
            'images/background5.png'
        ];

        bgImages.forEach((image, index) => {
            const bg = document.createElement('div');
            bg.classList.add('animated-background');
            bg.style.backgroundImage = `url(${image})`;
            bg.style.position = 'fixed';
            bg.style.width = '120%';
            bg.style.height = '120%';
            bg.style.top = 0;
            bg.style.left = 0;
            bg.style.zIndex = '-1';
            bg.style.opacity = 0.7;
            document.body.appendChild(bg);
            backgrounds.push(bg);

            let scaleDirection = index % 2 === 0 ? 0.001 : -0.001;
            let scale = 1.2;

            const interval = setInterval(() => {
                scale += scaleDirection;
                if (scale > 1.5 || scale < 0.8) scaleDirection *= -1;

                const offsetX = (spaceshipPosition.x - window.innerWidth / 2) / window.innerWidth;
                const offsetY = (spaceshipPosition.y - window.innerHeight / 2) / window.innerHeight;
                
                bg.style.transform = `translate(${offsetX * 20 * (index % 2 === 0 ? 1 : -1)}px, ${offsetY * 20 * (index % 2 === 0 ? 1 : -1)}px) scale(${scale})`;
                bg.style.opacity = 0.5 + 0.5 * Math.sin(Date.now() / 1000 + index);

                const colorIndex = Math.floor((spaceshipPosition.x / window.innerWidth) * colors.length);
                bg.style.backgroundColor = colors[colorIndex];

            }, 50);

            backgroundIntervals.push(interval);
        });
    }

    function clearBackgroundIntervals() {
        backgroundIntervals.forEach(interval => clearInterval(interval));
        backgroundIntervals = [];
    }

    function startAnimation() {
        audio.play();
        initWebGL();
        for (let i = 0; i < 1000; i++) {
            particles.push(createParticle());
        }
        animate();
        schedulePortalEffect();
        scheduleRainEvents();
        animateBackgrounds();
    }

    function stopAnimation() {
        audio.pause();
        audio.currentTime = 0;
        clearBackgroundIntervals();
        particles = [];
        document.body.style.backgroundColor = '';
        logMessage('Animation stopped');
    }

    function clearAllElements() {
        stopAnimation();
        document.body.innerHTML = '';
        log = [];
        logMessage('All elements cleared');
    }

    // Finish downloadLog function
    function downloadLog() {
        const logBlob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
        const logUrl = URL.createObjectURL(logBlob);
        const link = document.createElement('a');
        link.href = logUrl;
        link.download = 'console-log.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function downloadDomElements() {
        const domElements = Array.from(document.body.children).map(child => ({
            tagName: child.tagName,
            className: child.className,
            id: child.id,
            style: child.style.cssText
        }));

        const domBlob = new Blob([JSON.stringify(domElements, null, 2)], { type: 'application/json' });
        const domUrl = URL.createObjectURL(domBlob);
        const link = document.createElement('a');
        link.href = domUrl;
        link.download = 'dom-elements.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Event Listeners
    startTriangle.addEventListener('click', () => {
        startTriangle.style.display = 'none';
        startAnimation();
    });

    stopButton.addEventListener('click', stopAnimation);
    downloadLogButton.addEventListener('click', downloadLog);
    downloadDomButton.addEventListener('click', downloadDomElements);
    exitButton.addEventListener('click', clearAllElements);

    document.addEventListener('keydown', (event) => {
        const step = 10;
        switch (event.key) {
            case 'ArrowLeft':
                spaceshipPosition.x = Math.max(0, spaceshipPosition.x - step);
                break;
            case 'ArrowRight':
                spaceshipPosition.x = Math.min(window.innerWidth, spaceshipPosition.x + step);
                break;
            case 'ArrowUp':
                spaceshipPosition.y = Math.max(0, spaceshipPosition.y - step);
                break;
            case 'ArrowDown':
                spaceshipPosition.y = Math.min(window.innerHeight, spaceshipPosition.y + step);
                break;
            case 'z':
                startAnimation();
                break;
            case 'x':
                clearAllElements();
                break;
        }
        updateSpaceshipPosition();
    });

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

    // Initial setup
    updateSpaceshipPosition();
});