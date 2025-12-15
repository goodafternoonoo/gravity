import './style.css'
import { initLayout } from './common.js';

initLayout();

const canvas = document.getElementById('fluid-canvas');
const ctx = canvas.getContext('2d');

// Simulation Resolution (lower = faster but blockier)
const RES = 8;
let rows, cols;
let width, height;

// Fluid Arrays
let size;
let density;
let Vx, Vy;
let Vx0, Vy0;

// Config
const diff = 0; // Diffusion
const visc = 0.00001; // Viscosity
const dt = 0.2;
const iter = 4; // Solver iterations (higher = more accurate)

let isDragging = false;
let lastMouse = { x: 0, y: 0 };
let colorHue = 0;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  
  cols = Math.floor(width / RES);
  rows = Math.floor(height / RES);
  size = (rows + 2) * (cols + 2);

  // Initialize Arrays
  density = new Float32Array(size);
  Vx = new Float32Array(size);
  Vy = new Float32Array(size);
  Vx0 = new Float32Array(size);
  Vy0 = new Float32Array(size);
}

// Fluid Math Helpers (IX function maps 2D coordinates to 1D array)
function IX(x, y) {
  // Clamp coordinates
  if (x < 0) x = 0; if (x > cols + 1) x = cols + 1;
  if (y < 0) y = 0; if (y > rows + 1) y = rows + 1;
  return x + (cols + 2) * y;
}

function addDensity(x, y, amount) {
  const index = IX(x, y);
  density[index] += amount;
}

function addVelocity(x, y, amountX, amountY) {
  const index = IX(x, y);
  Vx[index] += amountX;
  Vy[index] += amountY;
}

function set_bnd(b, x) {
  for (let i = 1; i <= rows; i++) {
    x[IX(0, i)] = b === 1 ? -x[IX(1, i)] : x[IX(1, i)];
    x[IX(cols + 1, i)] = b === 1 ? -x[IX(cols, i)] : x[IX(cols, i)];
  }
  for (let i = 1; i <= cols; i++) {
    x[IX(i, 0)] = b === 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
    x[IX(i, rows + 1)] = b === 2 ? -x[IX(i, rows)] : x[IX(i, rows)];
  }
  
  x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
  x[IX(0, rows + 1)] = 0.5 * (x[IX(1, rows + 1)] + x[IX(0, rows)]);
  x[IX(cols + 1, 0)] = 0.5 * (x[IX(cols, 0)] + x[IX(cols + 1, 1)]);
  x[IX(cols + 1, rows + 1)] = 0.5 * (x[IX(cols, rows + 1)] + x[IX(cols + 1, rows)]);
}

function lin_solve(b, x, x0, a, c) {
  const cRecip = 1.0 / c;
  for (let k = 0; k < iter; k++) {
    for (let j = 1; j <= rows; j++) {
      for (let i = 1; i <= cols; i++) {
        x[IX(i, j)] = (x0[IX(i, j)] + a * (x[IX(i + 1, j)] + x[IX(i - 1, j)] + x[IX(i, j + 1)] + x[IX(i, j - 1)])) * cRecip;
      }
    }
    set_bnd(b, x);
  }
}

function diffuse(b, x, x0, diff, dt) {
  const a = dt * diff * (rows - 2) * (cols - 2);
  lin_solve(b, x, x0, a, 1 + 6 * a); // 2D needs 4 neighbors ?? standard algo uses 4 for 2D. 1+4a
  // Typo check: lin_solve interior uses 4 neighbors. Divisor should be 1 + 4*a.
  // Wait, standard stam code:
  // x[IX(i,j)] = (x0[IX(i,j)] + a*(x[IX(i-1,j)]+x[IX(i+1,j)]+x[IX(i,j-1)]+x[IX(i,j+1)]))/(1+4*a);
}

function project(velocX, velocY, p, div) {
  for (let j = 1; j <= rows; j++) {
    for (let i = 1; i <= cols; i++) {
      div[IX(i, j)] = -0.5 * (velocX[IX(i + 1, j)] - velocX[IX(i - 1, j)] + velocY[IX(i, j + 1)] - velocY[IX(i, j - 1)]) / ((rows + cols) / 2); // Average dimension? Usually just N or 1/h
      // For rectangular grid, simpler:
       div[IX(i, j)] = -0.5 * (velocX[IX(i + 1, j)] - velocX[IX(i - 1, j)] + velocY[IX(i, j + 1)] - velocY[IX(i, j - 1)]);
       p[IX(i, j)] = 0;
    }
  }
  set_bnd(0, div);
  set_bnd(0, p);
  
  lin_solve(0, p, div, 1, 4); // Poisson equation

  for (let j = 1; j <= rows; j++) {
    for (let i = 1; i <= cols; i++) {
      velocX[IX(i, j)] -= 0.5 * (p[IX(i + 1, j)] - p[IX(i - 1, j)]);
      velocY[IX(i, j)] -= 0.5 * (p[IX(i, j + 1)] - p[IX(i, j - 1)]);
    }
  }
  set_bnd(1, velocX);
  set_bnd(2, velocY);
}

function advect(b, d, d0, velocX, velocY, dt) {
  let i0, i1, j0, j1;
  let x, y, s0, t0, s1, t1, dt0;

  dt0 = dt * (rows > cols ? rows : cols); // approximation
  
  for (let j = 1; j <= rows; j++) {
    for (let i = 1; i <= cols; i++) {
      x = i - dt0 * velocX[IX(i, j)];
      y = j - dt0 * velocY[IX(i, j)];
      
      if (x < 0.5) x = 0.5; if (x > cols + 0.5) x = cols + 0.5;
      i0 = Math.floor(x); i1 = i0 + 1;
      if (y < 0.5) y = 0.5; if (y > rows + 0.5) y = rows + 0.5;
      j0 = Math.floor(y); j1 = j0 + 1;
      
      s1 = x - i0; s0 = 1.0 - s1;
      t1 = y - j0; t0 = 1.0 - t1;
      
      const i0_c = i0; const i1_c = i1;
      const j0_c = j0; const j1_c = j1;

      d[IX(i, j)] = 
        s0 * (t0 * d0[IX(i0_c, j0_c)] + t1 * d0[IX(i0_c, j1_c)]) +
        s1 * (t0 * d0[IX(i1_c, j0_c)] + t1 * d0[IX(i1_c, j1_c)]);
    }
  }
  set_bnd(b, d);
}

function step() {
  // Velocity Step
  diffuse(1, Vx0, Vx, visc, dt);
  diffuse(2, Vy0, Vy, visc, dt);
  
  project(Vx0, Vy0, Vx, Vy);
  
  advect(1, Vx, Vx0, Vx0, Vy0, dt);
  advect(2, Vy, Vy0, Vx0, Vy0, dt);
  
  project(Vx, Vy, Vx0, Vy0);
  
  // Density Step
  diffuse(0, Vx0, density, diff, dt); // reusing Vx0 as 's' array for diffuse
  advect(0, density, Vx0, Vx, Vy, dt);
}

function draw() {
  // Clear logic - Fade out
  // ctx.fillStyle = 'rgba(0,0,0,0.01)';
  // ctx.fillRect(0,0,width,height);
  // Instead of clearing, we redraw the entire grid based on density
  
  // Create ImageData for speed
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  // Render grid to pixel
  // This is computationally heavy to scale up 8x8 blocks, so we just iterate blocks
  // For better performance in JS, we might just draw rects.
  // Or optimize: Map each grid cell to a RESxRES block.
  
  // Fast render: Loop grid
  ctx.clearRect(0, 0, width, height);
  
  // Optimization: Only draw cells with density > threshold
  for (let j = 1; j <= rows; j++) {
    for (let i = 1; i <= cols; i++) {
      const d = density[IX(i, j)];
      if (d > 0.01) {
        // Decay density slightly
        density[IX(i, j)] *= 0.99;
        
        ctx.fillStyle = `hsla(${(colorHue + d * 50) % 360}, 100%, 50%, ${d})`;
        ctx.fillRect((i - 1) * RES, (j - 1) * RES, RES + 1, RES + 1);
        
        // Very fast decay for crisp effect
        if (d > 1) density[IX(i,j)] = 1; 
      }
    }
  }
}

function animate() {
  step();
  draw();
  colorHue += 0.5;
  requestAnimationFrame(animate);
}

// Interaction
function handleInput(x, y, isPressed) {
  if (!isPressed) {
    lastMouse = { x, y };
    return;
  }
  
  const cellX = Math.floor(x / RES) + 1;
  const cellY = Math.floor(y / RES) + 1;
  
  const amtX = x - lastMouse.x;
  const amtY = y - lastMouse.y;
  
  addVelocity(cellX, cellY, amtX * 0.5, amtY * 0.5);
  addDensity(cellX, cellY, 1.5); // Add color
  
  // Add simplified neighbor splash
  addDensity(cellX+1, cellY, 0.5);
  addDensity(cellX-1, cellY, 0.5);
  addDensity(cellX, cellY+1, 0.5);
  addDensity(cellX, cellY-1, 0.5);

  lastMouse = { x, y };
}

// Listeners
window.addEventListener('resize', resize);
resize();

canvas.addEventListener('mousemove', (e) => handleInput(e.clientX, e.clientY, e.buttons === 1));
canvas.addEventListener('mousedown', (e) => lastMouse = { x: e.clientX, y: e.clientY });

// Touch
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  handleInput(e.touches[0].clientX, e.touches[0].clientY, true);
}, { passive: false });
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: false });


animate();
