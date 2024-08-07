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
    let portalCount = 0;
    let rainInterval;
    let thinOutInterval;
    let cleanupInterval;
    let log = [];

    function logMessage(message) {
        log.push({ timestamp: Date.now(), message });
        console.log(message);
    }

    function createRainDrop() {
        logMessage('Creating raindrop');
        const rainDrop = document.createElement('div');
        rainDrop.classList.add('rain');

        const isSpecial = Math.random() < 0.01;
        const sides = Math.floor(Math.random() * 7) + 3; // 3 to 9 sides

        rainDrop.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        let size = Math.random() * 10 + 5;
        if (isSpecial) {
            size *= 0.3;
        }
        rainDrop.style.width = `${size}px`;
        rainDrop.style.height = `${size}px`;

        if (Math.random() > 0.5) {
            const borderRadius = Array.from({ length: 4 }, () => `${Math.random() * 50}%`).join(' ');
            rainDrop.style.borderRadius = borderRadius;
        } else {
            rainDrop.style.clipPath = `polygon(${Array.from({ length: sides }, () => `${Math.random() * 100}% ${Math.random() * 100}%`).join(', ')})`;
        }

        rainDrop.style.left = `${Math.random() * 100}%`;
        let duration = Math.random() * 4 + 1;
        if (isSpecial) {
            duration *= 15;
        }
        rainDrop.style.animationDuration = `${duration}s`;
        rainDrop.style.opacity = Math.random() * 0.7 + 0.3;

        const rotationClass = `rotate-speed-${Math.floor(Math.random() * 4) + 1}`;
        rainDrop.classList.add(rotationClass);

        if (isSpecial) {
            rainDrop.style.animation = `fall ${duration}s linear infinite, scaleUp ${duration}s ease-in-out infinite`;
        }

        rainContainer.appendChild(rainDrop);

        // Debugging output
        console.log('Raindrop styles:', rainDrop.style.cssText);
        console.log('Raindrop parent:', rainDrop.parentElement);
        console.log('Raindrop position:', rainDrop.getBoundingClientRect());

        rainDrop.addEventListener('animationend', () => {
            logMessage('Removing raindrop');
            rainContainer.removeChild(rainDrop);
        });

        logMessage(`Raindrop appended to the DOM: ${rainDrop.outerHTML}`);
    }

    function startRain() {
        logMessage('Starting rain');
        rainInterval = setInterval(createRainDrop, 100);
    }

    function thinOutRaindrops() {
        thinOutInterval = setInterval(() => {
            logMessage('Thinning out raindrops');
            clearInterval(rainInterval);
            rainInterval = setInterval(createRainDrop, 500);
        }, 5000);
    }

    function cleanupRaindrops() {
        logMessage('Cleaning up raindrops');
        const raindrops = document.querySelectorAll('.rain');
        raindrops.forEach(rainDrop => {
            if (rainDrop.getBoundingClientRect().top > window.innerHeight) {
                rainDrop.remove();
                logMessage('Raindrop cleaned up');
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
        colorScreen.style.position = 'absolute';
        colorScreen.style.top = 0;
        colorScreen.style.left = 0;
        colorScreen.style.width = '100%';
        colorScreen.style.height = '100%';
        colorScreen.style.backgroundColor = color;
        colorScreen.style.opacity = 0;
        colorScreen.style.transition = 'opacity 0.2s';
        document.body.appendChild(colorScreen);

        requestAnimationFrame(() => {
            colorScreen.style.opacity = .9;
        });

        setTimeout(() => {
            colorScreen.remove();
        }, 300);
    }

    function startPortalEffect() {
        logMessage('Starting portal effect');
        let portalInterval = setInterval(flashBackgroundColor, 20);
        let colorScreenInterval = setInterval(flashColorScreen, Math.random() * (1000 - 500) + 500);
        setTimeout(() => {
            clearInterval(portalInterval);
            clearInterval(colorScreenInterval);
            portalCount++;
        }, 3000);
    }

    function schedulePortalEffect() {
        logMessage('Scheduling portal effect');
        setTimeout(startPortalEffect, 10000); // First portal effect after 10 seconds
        setTimeout(startPortalEffect, 20000); // Second portal effect after 20 seconds
        setTimeout(startPortalEffect, 30000); // Third portal effect after 30 seconds
    }

    function startAnimation() {
        audio.play();
        startRain();
        thinOutRaindrops();
        cleanupInterval = setInterval(cleanupRaindrops, 3000);
        schedulePortalEffect();
    }

    function stopAnimation() {
        audio.pause();
        clearInterval(rainInterval);
        clearInterval(thinOutInterval);
        clearInterval(cleanupInterval);
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

    // Start the animation when the start triangle is clicked
    startTriangle.addEventListener('click', () => {
        startTriangle.style.display = 'none';
        startAnimation();
    });

    stopButton.addEventListener('click', stopAnimation);
    downloadLogButton.addEventListener('click', downloadLog);
    downloadDomButton.addEventListener('click', downloadDomElements);
});
