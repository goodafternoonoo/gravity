import '../styles/style.css'
import { initLayout } from '../components/common.js';

initLayout();

const canvas = document.getElementById('orbit-canvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clear-btn');

let width, height;
let sun = { x: 0, y: 0, mass: 20000, radius: 40 };
let planets = [];
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let dragCurrent = { x: 0, y: 0 };

// Physics Constants
const G = 0.5;
const TRAIL_LENGTH = 50;

class Planet {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = Math.random() * 5 + 3; // Random size 3-8
    this.mass = this.radius;
    this.color = `hsl(${Math.random() * 60 + 180}, 100%, 70%)`; // Cyan/Blue hues
    this.trail = [];
  }

  update() {
    // Gravity Force
    const dx = sun.x - this.x;
    const dy = sun.y - this.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    // Collision with Sun
    if (dist < sun.radius + this.radius) {
      return false; // Destroy planet
    }

    const force = (G * sun.mass) / distSq;
    const ax = force * (dx / dist);
    const ay = force * (dy / dist);

    this.vx += ax;
    this.vy += ay;
    this.x += this.vx;
    this.y += this.vy;

    // Trail logic
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > TRAIL_LENGTH) {
      this.trail.shift();
    }

    return true; // Keep planet
  }

  draw() {
    // Draw Trail
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw Planet
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
  }
}

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  sun.x = width / 2;
  sun.y = height / 2;
}

function drawSun() {
  ctx.beginPath();
  ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffaa00';
  ctx.shadowBlur = 50;
  ctx.shadowColor = '#ff5500';
  ctx.fill();
  
  // Sun Glow
  ctx.beginPath();
  ctx.arc(sun.x, sun.y, sun.radius * 1.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 100, 0, 0.1)';
  ctx.fill();
}

function drawDragLine() {
  if (!isDragging) return;

  ctx.beginPath();
  ctx.moveTo(dragStart.x, dragStart.y);
  ctx.lineTo(dragCurrent.x, dragCurrent.y);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.setLineDash([5, 5]); // Dashed line
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Draw predicted trajectory (Optional, visual candy)
  ctx.beginPath();
  ctx.arc(dragStart.x, dragStart.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  drawSun();

  // Update & Draw Planets
  for (let i = planets.length - 1; i >= 0; i--) {
    if (!planets[i].update()) {
      planets.splice(i, 1); // Remove dead planet
      // Todo: Add explosion effect?
    } else {
      planets[i].draw();
    }
  }

  drawDragLine();

  requestAnimationFrame(animate);
}

// Event Listeners
// Event Listeners
window.addEventListener('resize', resize);

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  const pos = getMousePos(e);
  dragStart = { x: pos.x, y: pos.y };
  dragCurrent = { x: pos.x, y: pos.y };
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  isDragging = true;
  // Touch needs clientX/Y from first touch
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  dragStart = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  dragCurrent = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
}, { passive: false });

window.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const pos = getMousePos(e);
    dragCurrent = { x: pos.x, y: pos.y };
  }
});

window.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (isDragging) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    dragCurrent = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }
}, { passive: false });

window.addEventListener('mouseup', (e) => {
  if (!isDragging) return;
  isDragging = false;
  
  const pos = getMousePos(e);
  
  // Calculate launch velocity
  // Reverse the direction so pulling back shoots forward (slingshot style)
  const vx = (dragStart.x - pos.x) * 0.05;
  const vy = (dragStart.y - pos.y) * 0.05;
  
  planets.push(new Planet(dragStart.x, dragStart.y, vx, vy));
});

window.addEventListener('touchend', (e) => {
  if (!isDragging) return;
  isDragging = false;
  
  // Use dragCurrent for the end position since there are no touches in touchend
  const vx = (dragStart.x - dragCurrent.x) * 0.05;
  const vy = (dragStart.y - dragCurrent.y) * 0.05;
  
  planets.push(new Planet(dragStart.x, dragStart.y, vx, vy));
});

clearBtn.addEventListener('click', () => {
  planets = [];
});

// Init
resize();
animate();
