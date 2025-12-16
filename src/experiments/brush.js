import '../styles/style.css'
import { initLayout } from '../components/common.js';
import { playSound } from '../components/sound.js';

initLayout();

const canvas = document.getElementById('brush-canvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clear-brush-btn');

let width, height;
let particles = [];
let vectors = []; // Array of {x, y, angle, strength}

// Config
const PARTICLE_COUNT = 2000;
const BRUSH_RADIUS = 50;
const VECTOR_LIFETIME = 1000; // Vectors don't die in this version, or do they?
// Let's make drawn paths persistent until cleared.

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2 + 1;
    this.life = Math.random() * 100 + 100;
    this.color = `hsl(${Math.random() * 60 + 200}, 100%, 70%)`; // Blue-ish
  }

  update() {
    // Influence from vectors
    let influenced = false;
    
    // Optimization: Grid-based lookup would be better, but for < 500 vectors array is simple.
    // If vectors array gets huge, we limit it.
    
    for (let v of vectors) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const distSq = dx*dx + dy*dy;
        
        if (distSq < BRUSH_RADIUS * BRUSH_RADIUS * 4) { // Influence range
            const force = 0.5;
            this.vx += Math.cos(v.angle) * force;
            this.vy += Math.sin(v.angle) * force;
            influenced = true;
            this.color = `hsl(${Math.random() * 60 + 300}, 100%, 70%)`; // Pink when influenced
        }
    }

    if (!influenced) {
        // Slight friction/return to normal
        this.vx *= 0.95;
        this.vy *= 0.95;
        // Drift color back
        // this.color = `hsl(220, 100%, 70%)`; 
    } else {
        this.vx *= 0.9;
        this.vy *= 0.9;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.life--;

    if (this.life <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
        this.reset();
    }
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
  for(let i=0; i<PARTICLE_COUNT; i++) {
      particles.push(new Particle());
  }
}

function animate() {
  // Trail effect
  ctx.fillStyle = 'rgba(3, 3, 11, 0.2)'; 
  ctx.fillRect(0, 0, width, height);

  // Draw Vectors (Optional, for debug or cool effect)
//   ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
//   ctx.beginPath();
//   for(let v of vectors) {
//       ctx.moveTo(v.x, v.y);
//       ctx.lineTo(v.x + Math.cos(v.angle)*10, v.y + Math.sin(v.angle)*10);
//   }
//   ctx.stroke();

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}

// Interaction
let isDrawing = false;
let lastX = 0;
let lastY = 0;

function addVector(x, y, lx, ly) {
    const angle = Math.atan2(y - ly, x - lx);
    // Add vector at current position pointing in direction of movement
    vectors.push({ x, y, angle });
    
    // Performance limit
    if (vectors.length > 500) {
        vectors.shift();
    }
}

// Canvas-only touch/mouse listeners
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    lastX = e.clientX;
    lastY = e.clientY;
});
canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        addVector(e.clientX, e.clientY, lastX, lastY);
        lastX = e.clientX;
        lastY = e.clientY;
        if(Math.random() > 0.8) playSound.pop(); // Sound effect
    }
});
canvas.addEventListener('mouseup', () => isDrawing = false);

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const touch = e.touches[0];
    lastX = touch.clientX;
    lastY = touch.clientY;
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDrawing) {
        const touch = e.touches[0];
        addVector(touch.clientX, touch.clientY, lastX, lastY);
        lastX = touch.clientX;
        lastY = touch.clientY;
    }
}, { passive: false });

canvas.addEventListener('touchend', () => isDrawing = false);


clearBtn.addEventListener('click', () => {
    vectors = [];
    particles.forEach(p => p.reset());
});

window.addEventListener('resize', init);

init();
animate();
