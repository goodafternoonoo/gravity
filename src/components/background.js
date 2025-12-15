/**
 * Ambient Starfield Background
 * Creates a sense of depth and slow movement for the main page background.
 */

/**
 * Neon Connectivity Network Background
 * Interactive particles connected by lines.
 */

export function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  
  // Configuration
  const particleCount = 100;
  const connectionDistance = 150;
  const mouseDistance = 200;
  
  const particles = [];
  
  // Mouse
  let mouse = { x: null, y: null };

  class Particle {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 1;
      this.vy = (Math.random() - 0.5) * 1;
      this.size = Math.random() * 2 + 1;
      this.color = 'rgb(112, 0, 255)'; // Primary Purple base
    }

    update() {
      // Move
      this.x += this.vx;
      this.y += this.vy;

      // Bounce edges
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse Interaction (Repulsion)
      if (mouse.x != null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseDistance) {
          const forceDirectionX = dx / dist;
          const forceDirectionY = dy / dist;
          const force = (mouseDistance - dist) / mouseDistance;
          const directionX = forceDirectionX * force * 3;
          const directionY = forceDirectionY * force * 3;

          this.x -= directionX;
          this.y -= directionY;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Re-init particles on drastic resize? Or just let them be
    if (particles.length === 0) {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }
  }

  function init() {
    resize();
    window.addEventListener('resize', resize);
    
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    animate();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Update and Draw Particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw Connections
    connectParticles();

    requestAnimationFrame(animate);
  }

  function connectParticles() {
    let opacityValue = 1;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const distance = dx * dx + dy * dy;

        if (distance < (connectionDistance * connectionDistance)) {
          opacityValue = 1 - (distance / (connectionDistance * connectionDistance));
          ctx.strokeStyle = `rgba(0, 210, 255, ${opacityValue * 0.5})`; // Secondary Cyan
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  init();
}
