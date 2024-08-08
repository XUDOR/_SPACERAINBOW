document.addEventListener('DOMContentLoaded', () => {
    const colors = [
        '#225f6e', '#53a9ad', '#a1ad39', '#b1cc11', 
        '#f2cb0a', '#efae0c', '#e8210c', '#51d0e5', 
        '#1e7777', '#878c17', '#dae858', '#a3860d', 
        '#c66709', '#ff0000', '#ffff00', '#ff0000', 
        '#1818a0', '#f2dc0f', '#aa0e0e'
    ];
    const rainContainer = document.getElementById('rain-container');
    const startTriangle = document.getElementById('start-triangle');
    const audio = document.getElementById('background-audio');
    const stopButton = document.getElementById('stop-button');
    const downloadLogButton = document.getElementById('download-log');
    const downloadDomButton = document.getElementById('download-dom');
    const spaceship = document.getElementById('spaceship');
    let portalCount = 0;
    let rainInterval;
    let thinOutInterval;
    let cleanupInterval;
    let log = [];
    let spaceshipPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const BPM = 143;
    const MILLISECONDS_PER_MINUTE = 60000;
    const BEATS_PER_BAR = 4;

    const barDuration = (MILLISECONDS_PER_MINUTE / BPM) * BEATS_PER_BAR;
    const eighthNoteDuration = barDuration / 8;
    const sixteenthNoteDuration = barDuration / 16;

    function logMessage(message, element = null) {
        const logEntry = {
            timestamp: Date.now(),
            message,
            element: element ? element.outerHTML : null
        };
        log.push(logEntry);
        console.log(message, element);
    }

    function createRainDrop() {
        logMessage('Creating raindrop');
        const rainDrop = document.createElement('div');
        rainDrop.classList.add('rain');

        const isSpecial = Math.random() < 0.01;
        const isPlanet = Math.random() < 0.05;

        rainDrop.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        let size = Math.random() * 10 + 5;
        if (isSpecial) {
            size *= 0.3;
        }
        if (isPlanet) {
            size *= 2;
            rainDrop.classList.add('planet');
        }
        rainDrop.style.width = `${size}px`;
        rainDrop.style.height = `${size}px`;

        if (isPlanet || Math.random() > 0.5) {
            rainDrop.style.borderRadius = '50%';
        } else {
            const sides = Math.floor(Math.random() * 7) + 3;
            rainDrop.style.clipPath = `polygon(${Array.from({ length: sides }, () => `${Math.random() * 100}% ${Math.random() * 100}%`).join(', ')})`;
        }

        rainDrop.style.left = `${Math.random() * 100}%`;
        let duration = Math.random() * 3 + 2;
        if (isSpecial) {
            duration *= 10;
        }

        const rotationClass = `rotate-speed-${Math.floor(Math.random() * 4) + 1}`;
        rainDrop.classList.add(rotationClass);

        rainDrop.style.animation = isSpecial
            ? `fall ${duration}s linear, scaleUp ${duration}s ease-in-out, ${rotationClass} ${duration}s linear`
            : `fall ${duration}s linear, ${rotationClass} ${duration}s linear`;

        rainDrop.style.opacity = Math.random() * 0.7 + 0.3;

        rainContainer.appendChild(rainDrop);

        logMessage('Raindrop created', rainDrop);
        rainDrop.addEventListener('animationend', () => {
            logMessage('Removing raindrop', rainDrop);
            rainDrop.remove();
        });

        logMessage('Raindrop appended to the DOM', rainDrop);
    }

    function createSpecialRainDrop() {
        const rainDrop = document.createElement('div');
        rainDrop.classList.add('rain', 'special');
        rainDrop.style.width = '20px';
        rainDrop.style.height = '20px';
        rainDrop.style.backgroundColor = 'gold';
        rainDrop.style.borderRadius = '50%';
        rainDrop.style.left = `${Math.random() * 100}%`;
        rainDrop.style.animation = `fall ${Math.random() * 3 + 4}s linear, rotate-speed-1 ${Math.random() * 10 + 10}s linear infinite`;
        rainContainer.appendChild(rainDrop);
    }

    function createBurstOfRaindrops() {
        for (let i = 0; i < 10; i++) {
            setTimeout(createRainDrop, i * 50);
        }
    }

    function startRain() {
        logMessage('Starting rain');
        rainInterval = setInterval(createRainDrop, 50);
    }

    function thinOutRaindrops() {
        thinOutInterval = setInterval(() => {
            logMessage('Thinning out raindrops');
            clearInterval(rainInterval);
            rainInterval = setInterval(createRainDrop, 100);
        }, 10000);
    }

    function cleanupRaindrops() {
        logMessage('Cleaning up raindrops');
        const raindrops = document.querySelectorAll('.rain');
        raindrops.forEach(rainDrop => {
            const rect = rainDrop.getBoundingClientRect();
            if (rect.top > window.innerHeight + 100 || rect.bottom < -100 || rect.left > window.innerWidth + 100 || rect.right < -100) {
                rainDrop.remove();
                logMessage('Raindrop cleaned up', rainDrop);
            }
        });
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
            createSpecialRainDrop();
            createBurstOfRaindrops();
        }, barDuration * 4);

        setInterval(createRainDrop, eighthNoteDuration);

        setInterval(createBurstOfRaindrops, barDuration);

        setInterval(createSpecialRainDrop, sixteenthNoteDuration * 4);
    }

    function createEndTriangle() {
        const endTriangle = document.createElement('div');
        endTriangle.id = 'end-triangle';
        document.body.appendChild(endTriangle);

        endTriangle.addEventListener('animationend', () => {
            endTriangle.remove();
        });
    }

    function startAnimation() {
        audio.play();
        startRain();
        thinOutRaindrops();
        cleanupInterval = setInterval(cleanupRaindrops, 3000);
        schedulePortalEffect();
        scheduleRainEvents();
    }

    function stopAnimation() {
        audio.pause();
        audio.currentTime = 0;
        clearInterval(rainInterval);
        clearInterval(thinOutInterval);
        clearInterval(cleanupInterval);
        const raindrops = document.querySelectorAll('.rain');
        raindrops.forEach(raindrop => raindrop.remove());
        document.body.style.backgroundColor = '';
        logMessage('Animation stopped');
    }

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
        const domElements = Array.from(rainContainer.children).map(child => {
            return {
                tagName: child.tagName,
                className: child.className,
                style: child.style.cssText,
                rect: child.getBoundingClientRect()
            };
        });

        const domBlob = new Blob([JSON.stringify(domElements, null, 2)], { type: 'application/json' });
        const domUrl = URL.createObjectURL(domBlob);
        const link = document.createElement('a');
        link.href = domUrl;
        link.download = 'dom-elements.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    startTriangle.addEventListener('click', () => {
        startTriangle.style.display = 'none';
        startAnimation();
    });

    stopButton.addEventListener('click', stopAnimation);
    downloadLogButton.addEventListener('click', downloadLog);
    downloadDomButton.addEventListener('click', downloadDomElements);

    audio.addEventListener('ended', () => {
        createEndTriangle();
        audio.currentTime = 0;
        audio.play();
    });

    // Handle arrow keys for desktop
    document.addEventListener('keydown', (event) => {
        const step = 10;
        switch (event.key) {
            case 'ArrowLeft':
                spaceshipPosition.x -= step;
                break;
            case 'ArrowRight':
                spaceshipPosition.x += step;
                break;
            case 'ArrowUp':
                spaceshipPosition.y -= step;
                break;
            case 'ArrowDown':
                spaceshipPosition.y += step;
                break;
        }
        moveSpaceship();
    });

    // Handle touch movement for mobile
    document.addEventListener('touchmove', (event) => {
        const touch = event.touches[0];
        spaceshipPosition.x = touch.clientX;
        spaceshipPosition.y = touch.clientY;
        moveSpaceship();
    });

    // Function to move the spaceship and apply parallax effect
    function moveSpaceship() {
        const maxX = window.innerWidth - 50;
        const maxY = window.innerHeight - 50;
        spaceshipPosition.x = Math.max(0, Math.min(spaceshipPosition.x, maxX));
        spaceshipPosition.y = Math.max(0, Math.min(spaceshipPosition.y, maxY));

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const offsetX = (spaceshipPosition.x - centerX) / centerX;
        const offsetY = (spaceshipPosition.y - centerY) / centerY;

        spaceship.style.transform = `translate(${offsetX * 100}px, ${offsetY * 30}px)`;
        rainContainer.style.transform = `translate(${-offsetX * 50}px, ${-offsetY * 15}px)`;
    }
});
