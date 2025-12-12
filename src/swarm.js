import './style.css'

const canvas = document.getElementById('swarm-canvas');
const ctx = canvas.getContext('2d');
const toggleBtn = document.getElementById('toggle-color-btn');

let width, height;
let particles = [];
let mouse = { x: -1000, y: -1000, isPressed: false };
let mode = 0; // 0: Neon Blue, 1: Fire

// Configuration
const PARTICLE_COUNT = 3000;
const FRICTION = 0.95;
const EASE = 0.1;
const REPULSION_RADIUS = 150;
const ATTRACTION_FORCE = 0.05;

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.originX = this.x;
    this.originY = this.y;
    this.size = Math.random() * 2 + 1;
    this.color = this.getColor();
  }

  getColor() {
    if (mode === 0) {
      // Neon & Cyan
      const r = 0;
      const g = Math.floor(Math.random() * 155 + 100);
      const b = 255;
      return `rgb(${r},${g},${b})`;
    } else {
      // Fire
      const r = 255;
      const g = Math.floor(Math.random() * 150);
      const b = 0;
      return `rgb(${r},${g},${b})`;
    }
  }

  update() {
    // Mouse Interaction
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (mouse.isPressed) {
      // Attraction (Black Hole)
      const forceAngle = Math.atan2(dy, dx);
      // Strong pull that gets stronger when closer, but clamped to avoid catapulting
      const force = 2; 
      
      this.vx += Math.cos(forceAngle) * force;
      this.vy += Math.sin(forceAngle) * force;
    } else {
      // Repulsion (Scatter)
      if (dist < REPULSION_RADIUS) {
        const forceAngle = Math.atan2(dy, dx);
        const force = (REPULSION_RADIUS - dist) / REPULSION_RADIUS * 5; // Stronger when closer
        
        this.vx -= Math.cos(forceAngle) * force;
        this.vy -= Math.sin(forceAngle) * force;
      }
      
      // Return to original position (gradually)
      if (dist > REPULSION_RADIUS) {
        this.vx += (this.originX - this.x) * 0.01;
        this.vy += (this.originY - this.y) * 0.01;
      }
    }

    // Physics
    this.vx *= FRICTION;
    this.vy *= FRICTION;
    
    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

function init() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
}

function animate() {
  // Trail effect (not clearing completely creates trails)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
  ctx.fillRect(0, 0, width, height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}

// Event Listeners
window.addEventListener('resize', init);

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('touchmove', (e) => {
  e.preventDefault();
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
}, { passive: false });

window.addEventListener('mousedown', () => mouse.isPressed = true);
window.addEventListener('mouseup', () => mouse.isPressed = false);

window.addEventListener('touchstart', (e) => {
  e.preventDefault();
  mouse.isPressed = true;
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
}, { passive: false });

window.addEventListener('touchend', () => {
  mouse.isPressed = false;
  mouse.x = -1000; // Move off screen
  mouse.y = -1000;
});

toggleBtn.addEventListener('click', () => {
  mode = (mode + 1) % 2;
  particles.forEach(p => p.color = p.getColor());
});

// Start
init();
animate();
