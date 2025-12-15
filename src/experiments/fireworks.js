import '../styles/style.css'
import { initLayout } from '../components/common.js';

initLayout();

const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');

// UI Controls
const gravityInput = document.getElementById('gravity');
const gravityVal = document.getElementById('val-gravity');
const autoBtn = document.getElementById('auto-btn');

let width, height;
let fireworks = [];
let particles = [];
let GRAVITY = 0.2;
let isAuto = false;
let autoInterval = null;

class Firework {
  constructor(sx, sy, tx, ty) {
    this.x = sx;
    this.y = sy;
    this.tx = tx;
    this.ty = ty;
    this.distanceToTarget = Math.hypot(sx - tx, sy - ty);
    this.distanceTraveled = 0;
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = 2;
    this.acceleration = 1.05;
    this.brightness = Math.random() * 50 + 50;
    this.targetRadius = 1;
    this.hue = Math.random() * 360;
  }

  update(index) {
    this.speed *= this.acceleration;
    
    const vx = Math.cos(this.angle) * this.speed;
    const vy = Math.sin(this.angle) * this.speed;
    
    this.distanceTraveled = Math.hypot(this.x - this.tx, this.y - this.ty);
    
    if (this.distanceTraveled < this.distanceToTarget * 0.1 || this.speed > this.distanceToTarget) {
      // Reached target
      createParticles(this.tx, this.ty, this.hue);
      fireworks.splice(index, 1);
    } else {
      this.x += vx;
      this.y += vy;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    const prevX = this.x - Math.cos(this.angle) * 10;
    const prevY = this.y - Math.sin(this.angle) * 10;
    ctx.lineTo(prevX, prevY);
    ctx.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
    ctx.stroke();
    
    // Target marker
    // ctx.beginPath();
    // ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
    // ctx.stroke();
  }
}

class Particle {
  constructor(x, y, hue) {
    this.x = x;
    this.y = y;
    this.hue = hue;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 5 + 1; // Explosion force
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;
    this.friction = 0.95;
    this.gravity = GRAVITY;
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.005;
  }

  update(index) {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity; // Apply gravity

    this.x += this.vx;
    this.y += this.vy;
    
    this.alpha -= this.decay;

    if (this.alpha <= 0) {
      particles.splice(index, 1);
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
    ctx.fill();
  }
}

function createParticles(x, y, hue) {
  const particleCount = 50;
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(x, y, hue));
  }
}

function init() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function animate() {
  // Trail effect
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Fading trails
  ctx.fillRect(0, 0, width, height);
  
  ctx.globalCompositeOperation = 'lighter'; // Additive blending for neon glow

  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update(i);
    if(fireworks[i]) fireworks[i].draw();
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].gravity = GRAVITY; // Dynamic gravity update
    particles[i].update(i);
    if(particles[i]) particles[i].draw();
  }

  requestAnimationFrame(animate);
}

// Controls
gravityInput.addEventListener('input', (e) => {
  GRAVITY = parseFloat(e.target.value);
  gravityVal.textContent = GRAVITY;
});

autoBtn.addEventListener('click', () => {
  isAuto = !isAuto;
  autoBtn.textContent = `자동 발사: ${isAuto ? '켜기' : '끄기'}`;
  
  if (isAuto) {
    autoInterval = setInterval(() => {
        launchRandom();
    }, 800);
  } else {
    clearInterval(autoInterval);
  }
});

function launchRandom() {
    const sx = Math.random() * width;
    const sy = height;
    const tx = Math.random() * width;
    const ty = Math.random() * (height / 2);
    fireworks.push(new Firework(sx, sy, tx, ty));
}

// Interaction
window.addEventListener('resize', init);

// Fix Coordinate Logic immediately
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

canvas.addEventListener('mousedown', (e) => {
  const pos = getMousePos(e);
  // Launch from bottom center to click position
  // Or launch from bottom x to click position?
  // Let's launch from bottom random x to click
  const sx = Math.random() * (width * 0.4) + width * 0.3; // Center-ish launch
  const sy = height;
  fireworks.push(new Firework(sx, sy, pos.x, pos.y));
});

// Init
init();
animate();
