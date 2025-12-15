import Matter from 'matter-js';
import '../styles/style.css'
import { initLayout } from '../components/common.js';

initLayout();

// Plugin for better mouse interaction (optional but standard)
// const Matter = require('matter-js'); // Vite handles imports, but standard import above works

const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Events = Matter.Events;

// Create engine
const engine = Engine.create();
const world = engine.world;

// Input logic
const hiddenInput = document.getElementById('hidden-input');
const keyboardBtn = document.getElementById('keyboard-btn');

// Create renderer
const render = Render.create({
  element: document.getElementById('physics-world'),
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: 'transparent' // Use CSS background
  }
});

Render.run(render);

// Create runner
const runner = Runner.create();
Runner.run(runner, engine);

// Boundaries
let ground, leftWall, rightWall;

function createBoundaries() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const thickness = 200; // Thick walls to prevent tunneling

  Composite.remove(world, [ground, leftWall, rightWall].filter(Boolean));

  ground = Bodies.rectangle(width / 2, height + thickness/2 - 10, width, thickness, { 
    isStatic: true,
    render: { visible: false }
  });
  
  leftWall = Bodies.rectangle(0 - thickness/2, height / 2, thickness, height * 5, { 
    isStatic: true,
    render: { visible: false }
  });
  
  rightWall = Bodies.rectangle(width + thickness/2, height / 2, thickness, height * 5, { 
    isStatic: true,
    render: { visible: false }
  });

  Composite.add(world, [ground, leftWall, rightWall]);
  
  // Update render options
  render.canvas.width = width;
  render.canvas.height = height;
}

createBoundaries();
window.addEventListener('resize', createBoundaries);

// Mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false
    }
  }
});

Composite.add(world, mouseConstraint);

// Allow scrolling when not on canvas (though CSS prevents it mostly)
render.mouse = mouse;

// Helper to create texture from text
function createTextTexture(text) {
  const canvas = document.createElement('canvas');
  const size = 100;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Random Neon Color
  const hue = Math.floor(Math.random() * 360);
  const color = `hsl(${hue}, 100%, 70%)`;
  
  ctx.fillStyle = color;
  ctx.font = 'bold 80px Outfit';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size/2, size/2);
  
  // Glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.fillText(text, size/2, size/2);
  
  return canvas.toDataURL();
}

function spawnLetter(char) {
  const x = Math.random() * (window.innerWidth - 100) + 50;
  const y = -50;
  const size = 60;
  
  const texture = createTextTexture(char);
  
  const box = Bodies.rectangle(x, y, size, size, {
    restitution: 0.8, // Bouncy
    friction: 0.5,
    render: {
      sprite: {
        texture: texture,
        xScale: 0.8, // Adjust based on texture size
        yScale: 0.8
      }
    }
  });
  
  // Random rotation
  Matter.Body.setAngularVelocity(box, Math.random() * 0.2 - 0.1);
  
  Composite.add(world, box);
  
  // Remove if too many (performance)
  if (world.bodies.length > 50) {
    // Remove oldest dynamic body (first 3 are walls)
    // Find first non-static body
    const bodyToRemove = world.bodies.find(b => !b.isStatic && b !== box);
    if (bodyToRemove) {
      Composite.remove(world, bodyToRemove);
    }
  }
}

// Keyboard input
window.addEventListener('keydown', (e) => {
  if (e.key.length === 1) { // Single char
    spawnLetter(e.key.toUpperCase());
  }
});

// Mobile virtual keyboard support
if (keyboardBtn && hiddenInput) {
  keyboardBtn.addEventListener('click', () => {
    hiddenInput.focus();
  });
  
  hiddenInput.addEventListener('input', (e) => {
    if (e.data) {
      spawnLetter(e.data.toUpperCase());
    }
  });
}

// Initial Spawn
setTimeout(() => spawnLetter('H'), 500);
setTimeout(() => spawnLetter('E'), 800);
setTimeout(() => spawnLetter('L'), 1100);
setTimeout(() => spawnLetter('L'), 1400);
setTimeout(() => spawnLetter('O'), 1700);
