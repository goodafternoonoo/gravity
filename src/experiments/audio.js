import '../styles/style.css'
import { initLayout } from '../components/common.js';

initLayout();

const canvas = document.getElementById('audio-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-mic-btn');
const overlay = document.getElementById('audio-overlay');
const controlsUi = document.getElementById('controls-ui');

let width, height;
let audioContext;
let analyser;
let source;
let dataArray;
let isRunning = false;
let colorHue = 0;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

async function initAudio(stream = null, file = null) {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256; // 128 frequency bins
  
  if (stream) {
    source = audioContext.createMediaStreamSource(stream);
  } else if (file) {
    // File processing
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;
    source.start(0);
  }

  source.connect(analyser);
  // If file, also connect to destination (speakers) to hear it. Mic doesn't need this (feedback loop).
  if (file) {
    analyser.connect(audioContext.destination);
  }

  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  
  isRunning = true;
  overlay.style.display = 'none';
  controlsUi.style.display = 'block';
  animate();
}

function drawDualWave(bufferLength) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = 100;

  // Bass frequencies (lower indices) affect radius
  let bass = 0;
  for (let i = 0; i < 10; i++) {
    bass += dataArray[i];
  }
  bass = bass / 10;
  const scale = 1 + (bass / 256) * 0.5;

  // Draw Central Star/Circle
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${colorHue}, 100%, 50%)`;
  ctx.shadowBlur = bass;
  ctx.shadowColor = `hsl(${colorHue}, 100%, 50%)`;
  ctx.fill();
  ctx.restore();

  // Draw Circular Wave
  ctx.beginPath();
  for (let i = 0; i < bufferLength; i++) {
    const value = dataArray[i];
    const angle = (i / bufferLength) * Math.PI * 2;
    const offset = radius + (value / 256) * 100 * scale;
    
    // Create symmetry
    const x = cx + Math.cos(angle) * offset;
    const y = cy + Math.sin(angle) * offset;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.strokeStyle = `hsl(${colorHue + 60}, 100%, 70%)`;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Particles (High frequencies)
  const trouble = dataArray[bufferLength - 10];
  if (trouble > 100) {
     drawShockwave(cx, cy, scale);
  }
}

let shockwaves = [];
function drawShockwave(x, y, scale) {
  shockwaves.push({ r: 100 * scale, opacity: 1 });
}

function animate() {
  if (!isRunning) return;
  requestAnimationFrame(animate);

  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Trail effect
  ctx.fillRect(0, 0, width, height);

  colorHue = (colorHue + 0.5) % 360;
  
  drawDualWave(analyser.frequencyBinCount);

  // Update Shockwaves
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i];
    sw.r += 5;
    sw.opacity -= 0.02;

    if (sw.opacity <= 0) {
      shockwaves.splice(i, 1);
    } else {
      ctx.beginPath();
      ctx.arc(width/2, height/2, sw.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${sw.opacity})`;
      ctx.stroke();
    }
  }
}

// Events
window.addEventListener('resize', resize);
resize();

startBtn.addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => initAudio(stream))
    .catch(err => {
      console.error(err);
      alert('Microphone access denied.');
    });
});

// Drag & Drop
window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('audio/')) {
    initAudio(null, file);
  }
});
