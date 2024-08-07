document.addEventListener('DOMContentLoaded', () => {
    const colors = [
        '#225f6e', '#53a9ad', '#a1ad39', '#b1cc11', 
        '#f2cb0a', '#efae0c', '#e8210c', '#51d0e5', 
        '#1e7777', '#878c17', '#dae858', '#a3860d', 
        '#c66709', '#ff0000', '#ffff00', '#ff0000', 
        '#1818a0', '#f2dc0f', '#aa0e0e'
    ];
    const rainContainer = document.getElementById('rain-container');
    let colorIndex = 0;

    function createRainDrop() {
        const rainDrop = document.createElement('div');
        rainDrop.classList.add('rain');

        // Set a random color
        rainDrop.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Determine if this raindrop should be the special slow and large one
        const isSpecial = Math.random() < 0.01;

        // Set random size and increasing scale
        let size = Math.random() * 10 + 5; // size between 5px and 15px initially
        if (isSpecial) {
            size *= 0.5; // Start smaller
        }
        rainDrop.style.width = `${size}px`;
        rainDrop.style.height = `${size}px`;

        // Set random left position
        rainDrop.style.left = `${Math.random() * 100}%`;

        // Set random duration, ensuring some are slow
        let duration = Math.random() * 4 + 1; // duration between 1s and 5s
        if (isSpecial) {
            duration *= 10; // Make the special raindrop fall much slower
        }
        rainDrop.style.animationDuration = `${duration}s`;

        // Set random opacity
        rainDrop.style.opacity = Math.random() * 0.7 + 0.3; // opacity between 0.3 and 1

        // Set random shape and border radius
        if (Math.random() > 0.5) {
            rainDrop.style.borderRadius = '50%'; // make it a circle
        }

        // Apply rotation to a few raindrops
        if (Math.random() > 0.7) {
            rainDrop.style.animation = `fall ${duration}s linear infinite, rotate ${Math.random() * 2 + 2}s linear infinite`;
        }

        // Apply special scale-up for the special raindrop
        if (isSpecial) {
            rainDrop.style.animation = `fall ${duration}s linear infinite, scaleUp ${duration}s ease-in-out infinite`;
        }

        rainContainer.appendChild(rainDrop);

        // Remove the raindrop when the animation ends
        rainDrop.addEventListener('animationend', () => {
            rainContainer.removeChild(rainDrop);
        });
    }

    let interval = 10;
    let increasing = true;

    function adjustInterval() {
        createRainDrop();

        if (increasing) {
            interval++;
            if (interval >= 30) {
                increasing = false;
            }
        } else {
            interval--;
            if (interval <= 1) {
                increasing = true;
            }
        }

        clearInterval(rainInterval);
        rainInterval = setInterval(adjustInterval, interval);
    }

    let rainInterval = setInterval(adjustInterval, interval);

    // Function to gradually increase the interval to thin out raindrops
    function thinOutRaindrops() {
        interval += 2; // Increase the interval more rapidly
        if (interval > 200) { // Adjust the upper limit as needed
            clearInterval(thinOutInterval);
        } else {
            clearInterval(rainInterval);
            rainInterval = setInterval(adjustInterval, interval);
        }
    }

    let thinOutInterval = setInterval(thinOutRaindrops, 5000); // Adjust the thinning rate as needed

    // Function to periodically clean up old raindrops
    function cleanupRaindrops() {
        const raindrops = document.querySelectorAll('.rain');
        raindrops.forEach(rainDrop => {
            // Remove raindrop if it has moved out of the visible area
            if (rainDrop.getBoundingClientRect().top > window.innerHeight) {
                rainDrop.remove();
            }
        });
    }

    let cleanupInterval = setInterval(cleanupRaindrops, 3000); // Adjust the cleanup rate as needed

    // Function to change the background color rapidly
    function flashBackgroundColor() {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.style.backgroundColor = randomColor;
    }

    // Function to add a quick screen with fade-in effect for random colors
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
        colorScreen.style.transition = 'opacity 0.3s';
        document.body.appendChild(colorScreen);

        requestAnimationFrame(() => {
            colorScreen.style.opacity = 1;
        });

        setTimeout(() => {
            colorScreen.remove();
        }, 300); // Remove the color screen after 0.3 seconds
    }

    // Function to start the portal effect
    function startPortalEffect() {
        let portalInterval = setInterval(flashBackgroundColor, 50); // Change background color every 50 milliseconds
        let colorScreenInterval = setInterval(flashColorScreen, Math.random() * (1000 - 500) + 500); // Add color screens randomly between 0.5s to 1s
        setTimeout(() => {
            clearInterval(portalInterval);
            clearInterval(colorScreenInterval);
        }, 3000); // Stop the portal effect after 3 seconds
    }

    // Schedule the portal effect to happen intermittently
    function schedulePortalEffect() {
        let randomTime = Math.random() * (30000 - 10000) + 10000; // Random time between 10 and 30 seconds
        setTimeout(() => {
            startPortalEffect();
            schedulePortalEffect();
        }, randomTime);
    }

    // Start the first portal effect schedule
    schedulePortalEffect();

    // Reset the page after a total duration of 45 seconds
    setTimeout(() => {
        location.reload();
    }, 35000);
});
