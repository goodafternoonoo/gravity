/**
 * Ambient Starfield Background
 * Creates a sense of depth and slow movement for the main page background.
 */

export function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  
  // Star properties
  const starCount = 200;
  const stars = [];
  
  // Mouse parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  class Star {
    constructor() {
      this.reset();
      // Start with random z to fill the screen
      this.z = Math.random() * width; 
    }

    reset() {
      this.x = (Math.random() - 0.5) * width * 2;
      this.y = (Math.random() - 0.5) * height * 2;
      this.z = width; // Start far away
      this.size = Math.random() * 2;
      this.opacity = Math.random();
    }

    update(speed) {
      // Move towards viewer (decrease z)
      this.z -= speed;
      
      // Parallax offset
      this.x += (mouseX - targetX) * 0.005;
      this.y += (mouseY - targetY) * 0.005;

      // Reset if passed viewer
      if (this.z <= 0) {
        this.reset();
      }
    }

    draw() {
      // Perspective projection
      const x = (this.x / this.z) * width + width / 2;
      const y = (this.y / this.z) * height + height / 2;
      
      // Size gets bigger as it gets closer
      const r = (this.size / this.z) * width * 0.5; // Scale factor
      
      const newOpacity = Math.min(this.opacity, (width - this.z) / width);

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${newOpacity})`;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function init() {
    resize();
    window.addEventListener('resize', resize);
    
    // Mouse move for parallax
    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX - width / 2) * 0.1;
      targetY = (e.clientY - height / 2) * 0.1;
    });

    // Create stars
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    animate();
  }

  function animate() {
    // Smooth mouse follow
    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;

    // Clear background (or use trail effect)
    ctx.fillStyle = '#03030b'; // Match --color-bg
    ctx.fillRect(0, 0, width, height);

    // Draw Nebula/Glow (optional static gradients for depth)
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
    gradient.addColorStop(0, '#0a0a2a');
    gradient.addColorStop(1, '#03030b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    stars.forEach(star => {
      star.update(2); // Speed
      star.draw();
    });

    requestAnimationFrame(animate);
  }

  init();
}
