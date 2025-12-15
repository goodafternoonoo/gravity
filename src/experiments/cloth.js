import '../styles/style.css'
import { initLayout } from '../components/common.js';

initLayout();

const canvas = document.getElementById('cloth-canvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('reset-btn');

let width, height;
let points = [];
let sticks = [];
let mouse = { x: 0, y: 0, px: 0, py: 0, isDown: false, button: 0 };

// Config
const GRAVITY = 0.5;
const FRICTION = 0.99;
const BOUNCE = 0.9;
const STIFFNESS = 5; // Iterations
const SPACING = 20;

class Point {
  constructor(x, y, pinned = false) {
    this.x = x;
    this.y = y;
    this.oldx = x;
    this.oldy = y;
    this.pinned = pinned;
  }

  update() {
    if (this.pinned) return;

    const vx = (this.x - this.oldx) * FRICTION;
    const vy = (this.y - this.oldy) * FRICTION;

    this.oldx = this.x;
    this.oldy = this.y;

    this.x += vx;
    this.y += vy;
    this.y += GRAVITY;

    // Boundary Constraint
    if (this.x > width) { this.x = width; this.oldx = this.x + vx * BOUNCE; }
    else if (this.x < 0) { this.x = 0; this.oldx = this.x + vx * BOUNCE; }
    
    if (this.y > height) { this.y = height; this.oldy = this.y + vy * BOUNCE; }
    else if (this.y < 0) { this.y = 0; this.oldy = this.y + vy * BOUNCE; }
  }
}

class Stick {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.length = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    this.active = true;
  }

  update() {
    if (!this.active) return;
    
    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;
    const dist = Math.hypot(dx, dy);
    
    // Prevent divide by zero
    if (dist < 0.001) return;

    // Tear condition: if stretched too much
    if (dist > this.length * 5) {
      this.active = false;
    }

    const diff = this.length - dist;
    const percent = diff / dist / 2;
    const offsetX = dx * percent;
    const offsetY = dy * percent;

    if (!this.p1.pinned) {
      this.p1.x -= offsetX;
      this.p1.y -= offsetY;
    }
    if (!this.p2.pinned) {
      this.p2.x += offsetX;
      this.p2.y += offsetY;
    }
  }

  draw() {
    if (!this.active) return;
    ctx.beginPath();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    
    // Dynamic Color based on tension?
    ctx.strokeStyle = '#00ffff'; // Neon Cyan
    ctx.stroke();
  }
}

function init() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  createCloth();
}

function createCloth() {
  points = [];
  sticks = [];

  const cols = Math.floor(width / 3 / SPACING);
  const rows = Math.floor(height / 2 / SPACING);
  const startX = width / 2 - (cols * SPACING) / 2;
  const startY = 50;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const p = new Point(startX + x * SPACING, startY + y * SPACING, y === 0); // Pin top row
      points.push(p);
      
      // Horizontal Stick
      if (x > 0) {
        sticks.push(new Stick(points[points.length - 1], points[points.length - 2]));
      }
      
      // Vertical Stick
      if (y > 0) {
        sticks.push(new Stick(points[points.length - 1], points[points.length - 1 - cols]));
      }
    }
  }
}

function update() {
  points.forEach(p => p.update());
  for (let i = 0; i < STIFFNESS; i++) {
    sticks.forEach(s => s.update());
  }
  handleMouse();
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#00ffff';
  
  // Batch path drawing for performance?
  // Individual colored sticks look better for neon though
  ctx.beginPath();
  sticks.forEach(s => {
     if(s.active) {
       ctx.moveTo(s.p1.x, s.p1.y);
       ctx.lineTo(s.p2.x, s.p2.y);
     }
  });
  ctx.stroke();
}

function handleMouse() {
  if (!mouse.isDown) return;

  // Find nearest point
  let minDist = 50;

  if (mouse.button === 2) { // Right Click: Tear (Cut)
    sticks.forEach(s => {
      if (!s.active) return;
      const dist1 = Math.hypot(s.p1.x - mouse.x, s.p1.y - mouse.y);
      const dist2 = Math.hypot(s.p2.x - mouse.x, s.p2.y - mouse.y);
      if ((dist1 + dist2) < s.length + 10) {
        s.active = false;
      }
    });
  } else { // Left Click: Drag
    points.forEach(p => {
      const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dist < minDist) {
         if(!p.pinned) {
             const dx = mouse.x - mouse.px;
             const dy = mouse.y - mouse.py;
             
             // Clamp max velocity to prevent explosion
             const maxV = 20;
             const cvx = Math.max(-maxV, Math.min(maxV, dx));
             const cvy = Math.max(-maxV, Math.min(maxV, dy));
             
             p.x = mouse.x;
             p.y = mouse.y;
             p.oldx = p.x - cvx;
             p.oldy = p.y - cvy;
         }
      }
    });
  }
}

function animate() {
  update();
  draw();
  
  mouse.px = mouse.x;
  mouse.py = mouse.y;
  
  requestAnimationFrame(animate);
}

// User Interaction
window.addEventListener('resize', init);
resetBtn.addEventListener('click', createCloth);

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

canvas.addEventListener('mousedown', (e) => {
  mouse.isDown = true;
  mouse.button = e.button;
  const pos = getMousePos(e);
  mouse.x = pos.x;
  mouse.y = pos.y;
});

window.addEventListener('mousemove', (e) => {
  const pos = getMousePos(e);
  mouse.x = pos.x;
  mouse.y = pos.y;
});

window.addEventListener('mouseup', () => mouse.isDown = false);
window.addEventListener('contextmenu', e => e.preventDefault()); // Prevent menu on right click

// Init
init();
animate();
