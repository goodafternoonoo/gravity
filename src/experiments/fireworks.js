import '../styles/style.css'
import { playSound } from '../components/sound.js';
import { initLayout } from '../components/common.js';

initLayout();

// ... existing ...

function createParticles(x, y, hue) {
  playSound.explosion();
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
