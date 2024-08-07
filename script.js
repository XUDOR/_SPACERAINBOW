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

      // Set random size
      const size = Math.random() * 20 + 10; // size between 10px and 30px
      rainDrop.style.width = `${size}px`;
      rainDrop.style.height = `${size}px`;

      // Set random left position
      rainDrop.style.left = `${Math.random() * 100}%`;

      // Set random duration
      const duration = Math.random() * 3 + 3; // duration between 3s and 6s
      rainDrop.style.animationDuration = `${duration}s`;

      // Set random shape and border radius
      if (Math.random() > 0.5) {
          const borderRadius = Math.random() * 50; // random border-radius for different shapes
          rainDrop.style.borderRadius = `${borderRadius}%`;
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

  // Create raindrops continuously
  setInterval(createRainDrop, 50); // Adjust the interval for more or fewer raindrops
});
