import '../styles/style.css'
import { initLayout } from '../components/common.js';

initLayout();

const canvas = document.getElementById('voyage-canvas');
const ctx = canvas.getContext('2d');

// Controls
const speedInput = document.getElementById('speed');
const speedVal = document.getElementById('val-speed');

let width, height;
let stars = [];
let STAR_COUNT = 1500;
let speed = 5;
let mouse = { x: 0, y: 0, active: false };
let isHyperdrive = false;

class Star {
  constructor() {
    this.init();
  }

  init() {
    this.x = (Math.random() - 0.5) * width * 2; // Wide field
    this.y = (Math.random() - 0.5) * height * 2;
    this.z = Math.random() * width; // Depth
    this.pz = this.z; // Previous Z for trails
  }

  update() {
    // Move towards camera
    let currentSpeed = isHyperdrive ? 100 : speed;
    
    this.z -= currentSpeed;

    // Reset if passed camera
    if (this.z < 1) {
      this.init();
      this.z = width;
      this.pz = this.z;
    }
  }

  draw() {
    // Simple 3D Projection
    // Origin is center of screen
    const cx = width / 2;
    const cy = height / 2;

    // Mouse steering effectively shifts the vanishing point or rotates the world
    // Let's shift the star positions opposite to mouse to simulate turning
    let offsetX = 0;
    let offsetY = 0;
    
    if (mouse.active) {
        offsetX = (mouse.x - cx) * 2;
        offsetY = (mouse.y - cy) * 2;
    }

    const sx = (this.x - offsetX) / this.z * width + cx;
    const sy = (this.y - offsetY) / this.z * width + cy;

    const r = (1 - this.z / width) * 4; // Size based on distance

    // Previous position for streak
    const psx = (this.x - offsetX) / this.pz * width + cx;
    const psy = (this.y - offsetY) / this.pz * width + cy;

    this.pz = this.z;

    // Draw
    ctx.beginPath();
    ctx.moveTo(psx, psy);
    ctx.lineTo(sx, sy);
    
    // Color based on speed - Blue/White normally, Red/Shift during Hyperdrive
    let hue = isHyperdrive ? 300 : 220; // Magenta vs Blue
    let sat = isHyperdrive ? 100 : 50;
    let alpha = (1 - this.z / width);

    ctx.lineWidth = r;
    ctx.strokeStyle = `hsla(${hue}, ${sat}%, 80%, ${alpha})`;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

function init() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star());
  }
}

function animate() {
  // Clear with fade for motion blur feel? 
  // For starfield, clearing completely is usually cleaner, but trails are handled in Star.draw
  ctx.fillStyle = '#0a0a0f'; // Deep space black
  ctx.fillRect(0, 0, width, height);

  stars.forEach(star => {
    star.update();
    star.draw();
  });

  requestAnimationFrame(animate);
}

// Events
window.addEventListener('resize', init);

speedInput.addEventListener('input', (e) => {
  speed = parseFloat(e.target.value);
  speedVal.textContent = speed;
});

// Mouse Interaction
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

window.addEventListener('mousemove', (e) => {
    const pos = getMousePos(e);
    mouse.x = pos.x;
    mouse.y = pos.y;
    mouse.active = true;
});

// Hyperdrive on click
canvas.addEventListener('mousedown', () => isHyperdrive = true);
canvas.addEventListener('mouseup', () => isHyperdrive = false);
canvas.addEventListener('touchstart', () => isHyperdrive = true);
canvas.addEventListener('touchend', () => isHyperdrive = false);

init();
animate();
