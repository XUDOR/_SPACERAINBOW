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
    const exitButton = document.createElement('button');
    exitButton.id = 'exit-button';
    exitButton.textContent = 'X';
    document.body.appendChild(exitButton);
    exitButton.style.position = 'fixed';
    exitButton.style.top = '10px';
    exitButton.style.right = '10px';
    exitButton.style.zIndex = '100';

    let portalCount = 0;
    let rainInterval;
    let thinOutInterval;
    let cleanupInterval;
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
        rainDrop.addEventListener('animationend', handleAnimationEnd);

        logMessage('Raindrop appended to the DOM', rainDrop);
    }

    function handleAnimationEnd(event) {
        logMessage('Removing raindrop', event.target);
        event.target.remove();
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

    function adjustRainInterval(newInterval) {
        clearInterval(rainInterval);
        rainInterval = setInterval(createRainDrop, newInterval);
    }

    function startRain() {
        logMessage('Starting rain');
        adjustRainInterval(100); // Start with a less dense interval
    }

    function thinOutRaindrops() {
        thinOutInterval = setInterval(() => {
            logMessage('Thinning out raindrops');
            adjustRainInterval(200); // Increase interval to reduce density
        }, 10000);
    }

    function cleanupRaindrops() {
        logMessage('Cleaning up raindrops');
        const raindrops = document.querySelectorAll('.rain');
        raindrops.forEach(rainDrop => {
            const rect = rainDrop.getBoundingClientRect();
            if (rect.top > window.innerHeight + 100 || rect.bottom < -100 || rect.left > window.innerWidth + 100 || rect.right < -100) {
                rainDrop.removeEventListener('animationend', handleAnimationEnd);
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
        animateBackgrounds();
    }

    function stopAnimation() {
        audio.pause();
        audio.currentTime = 0;
        clearInterval(rainInterval);
        clearInterval(thinOutInterval);
        clearInterval(cleanupInterval);
        clearBackgroundIntervals();
        const raindrops = document.querySelectorAll('.rain');
        raindrops.forEach(raindrop => {
            raindrop.removeEventListener('animationend', handleAnimationEnd);
            raindrop.remove();
        });
        document.body.style.backgroundColor = '';
        logMessage('Animation stopped');
    }

    function clearAllElements() {
        stopAnimation();
        document.body.innerHTML = ''; // Clear all elements from the body
        log = []; // Clear logs
        logMessage('All elements cleared');
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

    function animateBackgrounds() {
        const bgImages = [
            'images/background1.png',
            'images/background2.png',
            'images/background5.png' // Add more backgrounds if needed
        ];

        bgImages.forEach((image, index) => {
            const bg = document.createElement('div');
            bg.classList.add('animated-background');
            bg.style.backgroundImage = `url(${image})`;
            bg.style.position = 'fixed';
            bg.style.width = '120%'; // Start zoomed in
            bg.style.height = '120%'; // Start zoomed in
            bg.style.top = 0;
            bg.style.left = 0;
            bg.style.zIndex = '-1';
            bg.style.opacity = 0.7;
            document.body.appendChild(bg);
            backgrounds.push(bg);

            // Animate the background with scaling and color changes
            let scaleDirection = index % 2 === 0 ? 0.001 : -0.001; // Alternate scaling direction
            let scale = 1.2; // Start zoomed in

            const interval = setInterval(() => {
                scale += scaleDirection;
                if (scale > 1.5 || scale < 0.8) scaleDirection *= -1; // Reverse direction

                // Calculate movement based on spaceship position
                const offsetX = (spaceshipPosition.x - window.innerWidth / 2) / window.innerWidth;
                const offsetY = (spaceshipPosition.y - window.innerHeight / 2) / window.innerHeight;
                
                // Apply parallax effect and dynamic changes
                bg.style.transform = `translate(${offsetX * 20 * (index % 2 === 0 ? 1 : -1)}px, ${offsetY * 20 * (index % 2 === 0 ? 1 : -1)}px) scale(${scale})`;
                bg.style.opacity = 0.5 + 0.5 * Math.sin(Date.now() / 1000 + index); // Dynamic opacity change

                const colorIndex = Math.floor((spaceshipPosition.x / window.innerWidth) * colors.length);
                bg.style.backgroundColor = colors[colorIndex]; // Change color based on spaceship position

            }, 50);

            backgroundIntervals.push(interval);
        });
    }

    function clearBackgroundIntervals() {
        backgroundIntervals.forEach(interval => clearInterval(interval));
        backgroundIntervals = [];
    }

    startTriangle.addEventListener('click', () => {
        startTriangle.style.display = 'none';
        startAnimation();
    });

    stopButton.addEventListener('click', stopAnimation);
    downloadLogButton.addEventListener('click', downloadLog);
    downloadDomButton.addEventListener('click', downloadDomElements);

    exitButton.addEventListener('click', clearAllElements); // Add exit button functionality

    document.addEventListener('keydown', (event) => {
        const step = 10; // Increase step size for more significant movement
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
            case 'z':
                startAnimation(); // Restart animation with 'z'
                break;
            case 'x':
                clearAllElements(); // Stop and clear everything with 'x'
                break;
        }
        moveSpaceship();
    });

    // Smooth mouse movement for desktop
    document.addEventListener('mousemove', (event) => {
        spaceshipPosition.x += (event.clientX - spaceshipPosition.x) * 0.1;
        spaceshipPosition.y += (event.clientY - spaceshipPosition.y) * 0.1;
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

        // Apply linear scaling for faster transitions
        const translateX = offsetX * window.innerWidth / 2;
        const translateY = offsetY * window.innerHeight / 2;

        spaceship.style.transform = `translate(${translateX}px, ${translateY}px)`;
        rainContainer.style.transform = `translate(${-translateX * 1.5}px, ${-translateY * 0.5}px)`;

        // Adjust speed of certain raindrops based on parallax effect
        document.querySelectorAll('.rain').forEach(rainDrop => {
            const speedFactor = 1 + Math.abs(offsetX) + Math.abs(offsetY);
            rainDrop.style.animationDuration = `${Math.max(0.5, 5 / speedFactor)}s`;
        });

        // Update backgrounds based on spaceship movement for parallax effect
        backgrounds.forEach((bg, index) => {
            const direction = index % 2 === 0 ? 1 : -1;
            bg.style.transform = `translate(${offsetX * 20 * direction}px, ${offsetY * 20 * direction}px) scale(${bg.style.transform.match(/scale\(([^)]+)\)/)[1]})`;
        });
    }
});
