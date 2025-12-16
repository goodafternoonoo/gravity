import Matter from 'matter-js';
import '../styles/style.css'
import { initLayout } from '../components/common.js';
import { playSound } from '../components/sound.js';

initLayout();

const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Composites = Matter.Composites,
      Common = Matter.Common,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Composite = Matter.Composite,
      Bodies = Matter.Bodies;

// Create engine
const engine = Engine.create();
const world = engine.world;

// Create renderer
const render = Render.create({
  element: document.getElementById('physics-world'), // Will check if this exists or use canvas
  canvas: document.getElementById('jelly-canvas'),
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false, // We will custom render or use debug
    background: 'transparent',
    showAngleIndicator: false
  }
});

// Custom Render Loop (because built-in softbody render is just dots/lines)
// We want glowing neon skins.
// Actually, let's use the built-in renderer first to verify physics, 
// then maybe add custom rendering in 'afterRender' event if needed.
// Matter.js Render module draws constraints as lines. We can style them.
render.options.wireframes = false; 

// Run the renderer
Render.run(render);

// Create runner
const runner = Runner.create();
Runner.run(runner, engine);

// Boundaries
let ground, leftWall, rightWall, topWall;

function createBoundaries() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const thickness = 100;

  Composite.remove(world, [ground, leftWall, rightWall, topWall].filter(Boolean));

  const options = { 
      isStatic: true,
      render: { visible: false }
  };

  ground = Bodies.rectangle(width / 2, height + thickness/2, width, thickness, options);
  leftWall = Bodies.rectangle(0 - thickness/2, height / 2, thickness, height, options);
  rightWall = Bodies.rectangle(width + thickness/2, height / 2, thickness, height, options);
  topWall = Bodies.rectangle(width / 2, -height*2, width, thickness, options); // Open top

  Composite.add(world, [ground, leftWall, rightWall, topWall]);
  
  render.canvas.width = width;
  render.canvas.height = height;
}

createBoundaries();
window.addEventListener('resize', createBoundaries);

// Soft Body Creator
function createJelly(x, y) {
    const particleOptions = { 
        friction: 0.05,
        frictionStatic: 0.1,
        render: { 
            fillStyle: '#00d2ff', // Cyan Neon
            strokeStyle: '#00d2ff',
            lineWidth: 1
        }
    };

    const constraintOptions = { 
        stiffness: 0.9,
        render: { 
            strokeStyle: '#7000ff', // Purple Neon connections
            lineWidth: 2,
            type: 'line'
        }
    };

    // Columns, Rows, ColumnGap, RowGap, CrossBrace, ParticleRadius, ParticleOptions, ConstraintOptions
    const jelly = Composites.softBody(x, y, 5, 5, 0, 0, true, 18, particleOptions, constraintOptions);

    Composite.add(world, jelly);
    playSound.pop();
}

// Initial Jelly
createJelly(window.innerWidth / 2, 200);

// Interaction
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
render.mouse = mouse;

// UI Events
document.getElementById('add-jelly-btn').addEventListener('click', () => {
    createJelly(Math.random() * (window.innerWidth - 100) + 50, 100);
});

document.getElementById('reset-btn').addEventListener('click', () => {
    Composite.clear(world, false); // Clear all bodies
    Composite.add(world, [ground, leftWall, rightWall, topWall, mouseConstraint]); // Re-add statics
    createJelly(window.innerWidth / 2, 200);
});

// Custom Rendering Enhancements (Glow)
Matter.Events.on(render, 'afterRender', function() {
    const ctx = render.context;
    
    // Apply a global glow effect to everything drawn
    // Note: This is expensive if we do it for every constraint manual draw.
    // Since we are using built-in renderer, we can just overlay?
    // Actually, built-in render doesn't support 'shadowBlur' easily on entities.
    // Let's iterate bodies and draw glow dots.
    
    ctx.globalCompositeOperation = 'screen';
    
    const bodies = Composite.allBodies(world);

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00d2ff';
    
    // Optimisation: Only draw glow for circles (particles)
    ctx.beginPath();
    for (let i = 0; i < bodies.length; i += 1) {
        const body = bodies[i];
        if (!body.isStatic && body.circleRadius) {
            ctx.moveTo(body.position.x, body.position.y);
            ctx.arc(body.position.x, body.position.y, body.circleRadius, 0, 2 * Math.PI);
        }
    }
    ctx.fillStyle = '#00d2ff';
    ctx.fill();
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
});
