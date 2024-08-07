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
    let portalCount = 0;
    let triangleCreated = false;

    function createRainDrop() {
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
            // Apply geometric shapes
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

        rainDrop.addEventListener('animationend', () => {
            rainContainer.removeChild(rainDrop);
        });
    }

    function createTriangle() {
        const triangle = document.createElement('div');
        triangle.style.width = 0;
        triangle.style.height = 0;
        triangle.style.borderLeft = '50vw solid transparent';
        triangle.style.borderRight = '50vw solid transparent';
        triangle.style.borderBottom = '100vh solid white';
        triangle.style.position = 'absolute';
        triangle.style.left = `${Math.random() * 100}%`;
        triangle.style.top = `${Math.random() * -10}%`;
        triangle.style.animation = `fall ${Math.random() * 15 + 5}s linear infinite, scaleUp ${Math.random() * 15 + 5}s ease-in-out infinite`;
        rainContainer.appendChild(triangle);

        triangle.addEventListener('animationend', () => {
            rainContainer.removeChild(triangle);
        });
    }

    let interval = 50; // Higher initial interval to reduce density
    let rainInterval;

    function adjustInterval() {
        createRainDrop();

        clearInterval(rainInterval);
        rainInterval = setInterval(adjustInterval, interval);
    }

    function startRain() {
        rainInterval = setInterval(adjustInterval, interval);
    }

    function thinOutRaindrops() {
        interval += 10; // Increase the interval more rapidly
        if (interval > 200) {
            clearInterval(thinOutInterval);
        } else {
            clearInterval(rainInterval);
            rainInterval = setInterval(adjustInterval, interval);
        }
    }

    let thinOutInterval = setInterval(thinOutRaindrops, 2000);

    function cleanupRaindrops() {
        const raindrops = document.querySelectorAll('.rain');
        raindrops.forEach(rainDrop => {
            if (rainDrop.getBoundingClientRect().top > window.innerHeight) {
                rainDrop.remove();
            }
        });
    }

    let cleanupInterval = setInterval(cleanupRaindrops, 3000);

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
        let portalInterval = setInterval(flashBackgroundColor, 20);
        let colorScreenInterval = setInterval(flashColorScreen, Math.random() * (1000 - 500) + 500);
        setTimeout(() => {
            clearInterval(portalInterval);
            clearInterval(colorScreenInterval);
            interval = 50;
            portalCount++;

            if (portalCount >= 3 && !triangleCreated) {
                createTriangle();
                triangleCreated = true;
            }
        }, 3000);
    }

    function schedulePortalEffect() {
        let barsElapsed = 0;
        const barInterval = (60 / 143) * 1000 * 4; // Calculate duration of one bar at 143 BPM

        setInterval(() => {
            barsElapsed++;
            if (barsElapsed % 33 === 0) {
                startPortalEffect();
            }
        }, barInterval);
    }

    startTriangle.addEventListener('click', () => {
        audio.play();
        startTriangle.style.display = 'none';
        schedulePortalEffect();
        startRain();
    });

    setTimeout(() => {
        location.reload();
    }, (60 / 143) * 1000 * 4 * 72); // Reload after 72 bars
});
