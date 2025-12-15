import '../styles/style.css'
import { initLayout } from '../components/common.js';
import { playSound } from '../components/sound.js';

initLayout();

const canvas = document.getElementById('pendulum-canvas');
const ctx = canvas.getContext('2d');

// UI Controls
const trailInput = document.getElementById('trail');
const trailVal = document.getElementById('val-trail');
const gInput = document.getElementById('g');
const gVal = document.getElementById('val-g');
const resetBtn = document.getElementById('reset-btn');

let width, height;

// Physics Constants
let r1 = 150;
let r2 = 150;
let m1 = 10;
let m2 = 10;
let a1 = Math.PI / 2;
let a2 = Math.PI / 2;
let a1_v = 0;
let a2_v = 0;
let g = 1;

let path = [];
let maxPath = 50;

function init() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  path = [];
}

function reset() {
  a1 = Math.PI / 2;
  a2 = Math.PI / 2;
  a1_v = 0;
  a2_v = 0;
  path = [];
  playSound.whoosh(); // Reset sound
}

function update() {
  // Double Pendulum Equations of Motion (Lagrangian Mechanics)
  let num1 = -g * (2 * m1 + m2) * Math.sin(a1);
  let num2 = -m2 * g * Math.sin(a1 - 2 * a2);
  let num3 = -2 * Math.sin(a1 - a2) * m2;
  let num4 = a2_v * a2_v * r2 + a1_v * a1_v * r1 * Math.cos(a1 - a2);
  let den = r1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
  let a1_a = (num1 + num2 + num3 * num4) / den;

  num1 = 2 * Math.sin(a1 - a2);
  num2 = (a1_v * a1_v * r1 * (m1 + m2));
  num3 = g * (m1 + m2) * Math.cos(a1);
  num4 = a2_v * a2_v * r2 * m2 * Math.cos(a1 - a2);
  den = r2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
  let a2_a = (num1 * (num2 + num3 + num4)) / den;

  a1_v += a1_a;
  a2_v += a2_a;
  a1 += a1_v;
  a2 += a2_v;

  // Damping (optional, for realism)
  // a1_v *= 0.999;
  // a2_v *= 0.999;

  // Calculate positions
  const cx = width / 2;
  const cy = height / 3;

  let x1 = r1 * Math.sin(a1) + cx;
  let y1 = r1 * Math.cos(a1) + cy;

  let x2 = x1 + r2 * Math.sin(a2);
  let y2 = y1 + r2 * Math.cos(a2);

  // Store path
  path.push({ x: x2, y: y2 });
  if (path.length > maxPath) {
    path.shift();
  }

  return { cx, cy, x1, y1, x2, y2 };
}

function draw() {
  const { cx, cy, x1, y1, x2, y2 } = update();

  // Trail effect (fade out old frames)
  // Instead of full clear, we can do trail effect with rect
  ctx.fillStyle = 'rgba(10, 10, 26, 0.3)'; // Match bg color with alpha
  ctx.fillRect(0, 0, width, height);

  // Draw Path (Neon)
  ctx.beginPath();
  if (path.length > 0) {
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }
  }
  ctx.strokeStyle = '#00d2ff';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#00d2ff';
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset

  // Draw Pendulum Arm 1
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Draw Pendulum Arm 2
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Draw Masses
  ctx.beginPath();
  ctx.arc(x1, y1, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#7000ff';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x2, y2, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#00d2ff';
  ctx.fill();

  requestAnimationFrame(draw);
}

// Events
window.addEventListener('resize', init);

trailInput.addEventListener('input', (e) => {
    maxPath = parseInt(e.target.value);
    trailVal.textContent = maxPath;
});

gInput.addEventListener('input', (e) => {
    g = parseFloat(e.target.value);
    gVal.textContent = g;
});

resetBtn.addEventListener('click', reset);

init();
draw();
