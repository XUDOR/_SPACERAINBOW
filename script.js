document.addEventListener('DOMContentLoaded', () => {
  const colors = [
      '#225f6e', '#53a9ad', '#a1ad39', '#b1cc11', 
      '#f2cb0a', '#efae0c', '#e8210c', '#51d0e5', 
      '#1e7777', '#878c17', '#dae858', '#a3860d', 
      '#c66709', '#ff0000', '#ffff00', '#ff0000', 
      '#1818a0', '#f2dc0f', '#aa0e0e'
  ];
  const rainContainer = document.getElementById('rain-container');

  function createRainDrop() {
      const rainDrop = document.createElement('div');
      rainDrop.classList.add('rain');
      
      // Set a random color
      rainDrop.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

      // Set random size and increasing scale
      const size = Math.random() * 10 + 5; // size between 5px and 15px initially
      rainDrop.style.width = `${size}px`;
      rainDrop.style.height = `${size}px`;

      // Set random left position
      rainDrop.style.left = `${Math.random() * 100}%`;

      // Set random duration
      const duration = Math.random() * 3 + 2; // duration between 2s and 5s
      rainDrop.style.animationDuration = `${duration}s`;

      // Set random shape and border radius
      if (Math.random() > 0.5) {
          rainDrop.style.borderRadius = '50%'; // make it a circle
      }

      // Apply rotation to a few raindrops
      if (Math.random() > 0.7) {
          rainDrop.style.animation = `fall ${duration}s linear infinite, rotate ${Math.random() * 3 + 3}s linear infinite`;
      }

      rainContainer.appendChild(rainDrop);

      // Remove the raindrop when the animation ends
      rainDrop.addEventListener('animationend', () => {
          rainContainer.removeChild(rainDrop);
      });
  }

  let interval = 20;
  let increasing = true;

  function adjustInterval() {
      createRainDrop();

      if (increasing) {
          interval++;
          if (interval >= 60) {
              increasing = false;
          }
      } else {
          interval--;
          if (interval <= 15) {
              increasing = true;
          }
      }

      clearInterval(rainInterval);
      rainInterval = setInterval(adjustInterval, interval);
  }

  let rainInterval = setInterval(adjustInterval, interval);
});
