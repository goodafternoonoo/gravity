import '../styles/style.css'
import { initLayout } from '../components/common.js';

initLayout();

const canvas = document.getElementById('galaxy-canvas');
const ctx = canvas.getContext('2d');

// UI Controls
const armsInput = document.getElementById('arms');
const expInput = document.getElementById('expansion');
const armsVal = document.getElementById('val-arms');
const expVal = document.getElementById('val-exp');
const toggleBtn = document.getElementById('toggle-color-btn');

let width, height;
let stars = [];
let angleX = 0;
let angleY = 0;
let isDragging = false;
let lastMouse = { x: 0, y: 0 };
let colorMode = 0; // 0: Milky Way, 1: Neon Pink/Cyan

// Config
const STAR_COUNT = 5000;
let ARMS = 3;
let ARM_SPREAD = 0.5; // Expansion
const CORE_SIZE = 30;

class Star {
  constructor() {
    this.reset();
  }

  reset() {
    // Distance from center (Random but weighted towards center)
    this.dist = Math.random() * Math.random() * 400 + CORE_SIZE; 
    
    // Angle based on arms plus random spread
    // Logarithmic Spiral: theta = a + b * r
    const armIndex = Math.floor(Math.random() * ARMS);
    const armAngle = (Math.PI * 2 / ARMS) * armIndex;
    
    // Spiral factor
    const spiralAngle = this.dist * ARM_SPREAD * 0.05; 
    
    // Random scatter for volume
    const scatter = (Math.random() - 0.5) * 0.5;

    this.angle = armAngle + spiralAngle + scatter;
    
    // 3D position
    this.x = Math.cos(this.angle) * this.dist;
    this.z = Math.sin(this.angle) * this.dist;
    // Thickness (y-axis) gaussian-like distribution
    this.y = (Math.random() - 0.5) * Math.min(50, 2000/this.dist); 

    this.size = Math.random() * 1.5 + 0.5;
    this.color = this.getColor();
  }

  getColor() {
    if (colorMode === 0) {
      // Natural (Blue/White/Gold)
      if (Math.random() > 0.9) return '#ffaa00'; // Gold core
      return `rgba(200, 220, 255, ${Math.random()})`;
    } else {
      // Neon (Pink/Cyan)
      return Math.random() > 0.5 
        ? `rgba(255, 0, 150, ${Math.random()})`
        : `rgba(0, 255, 255, ${Math.random()})`;
    }
  }

  update(speed) {
    // Rotate entire galaxy
    const oldX = this.x;
    const oldZ = this.z;
    const cosA = Math.cos(speed);
    const sinA = Math.sin(speed);
    
    this.x = oldX * cosA - oldZ * sinA;
    this.z = oldX * sinA + oldZ * cosA;
  }
}

function init() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  
  generateStars();
}

function generateStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star());
  }
}

// 3D Projection Calculation
function project3D(x, y, z) {
  // Manual 3D rotation based on mouse drag (angleX, angleY)
  // Rotate around X axis
  let y1 = y * Math.cos(angleX) - z * Math.sin(angleX);
  let z1 = y * Math.sin(angleX) + z * Math.cos(angleX);
  
  // Rotate around Y axis
  let x2 = x * Math.cos(angleY) - z1 * Math.sin(angleY);
  let z2 = x * Math.sin(angleY) + z1 * Math.cos(angleY);
  
  // Perspective project
  const fov = 400;
  const scale = fov / (fov + z2 + 400); // Camera distance
  
  return {
    x: x2 * scale + width / 2,
    y: y1 * scale + height / 2,
    scale: scale,
    z: z2 // for z-sorting
  };
}

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Trails
  ctx.fillRect(0, 0, width, height);
  
  // Update and Project
  const projected = [];
  
  stars.forEach(star => {
    star.update(0.002); // Auto rotation speed
    const proj = project3D(star.x, star.y, star.z);
    
    // Frustum culling approximation
    if (proj.scale > 0) {
      projected.push({ ...proj, color: star.color, size: star.size });
    }
  });
  
  // Z-sort for correct occlusion (painter's algorithm)
  projected.sort((a, b) => b.z - a.z);
  
  // Draw
  projected.forEach(p => {
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.size * p.scale, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Draw Center Black Hole/Core
  const sunProj = project3D(0, 0, 0);
  if (sunProj.scale > 0) {
    const r = CORE_SIZE/2 * sunProj.scale;
    const g = ctx.createRadialGradient(sunProj.x, sunProj.y, 0, sunProj.x, sunProj.y, r*4);
    g.addColorStop(0, 'rgba(255, 255, 255, 1)');
    g.addColorStop(0.2, 'rgba(255, 200, 100, 0.5)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sunProj.x, sunProj.y, r * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(animate);
}

// User Interaction
window.addEventListener('resize', init);

// Controls
armsInput.addEventListener('input', (e) => {
  ARMS = parseInt(e.target.value);
  armsVal.textContent = ARMS;
  generateStars();
});

expInput.addEventListener('input', (e) => {
  ARM_SPREAD = parseFloat(e.target.value);
  expVal.textContent = ARM_SPREAD;
  generateStars();
});

toggleBtn.addEventListener('click', () => {
  colorMode = (colorMode + 1) % 2;
  generateStars();
});

// Drag to Rotate
// Drag to Rotate
canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  lastMouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
});
canvas.addEventListener('mouseup', () => isDragging = false);

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - lastMouse.x;
    const dy = y - lastMouse.y;
    
    angleY += dx * 0.005;
    angleX -= dy * 0.005; // Invert Y for natural feel
    
    // Clamp X rotation
    angleX = Math.max(-Math.PI/2, Math.min(Math.PI/2, angleX));
    
    lastMouse = { x, y };
  }
});

// Init
init();
animate();
