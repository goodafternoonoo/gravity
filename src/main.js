import './style.css'
import { initLayout } from './common.js';
import { initBackground } from './background.js';

initLayout();
initBackground();

document.addEventListener('DOMContentLoaded', () => {
  const cursorGlow = document.getElementById('cursor-glow');
  const heroTitle = document.querySelector('.hero-title');
  const cards = document.querySelectorAll('.glass-panel');

  // Mouse move handler for global cursor effect
  document.addEventListener('mousemove', (e) => {
    // Move cursor glow
    const x = e.clientX;
    const y = e.clientY;
    
    // Using requestAnimationFrame for smoother performance
    requestAnimationFrame(() => {
      cursorGlow.style.left = `${x}px`;
      cursorGlow.style.top = `${y}px`;
    });

    // Parallax effect for hero title
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const moveX = (x - centerX) / 25;
    const moveY = (y - centerY) / 25;

    if (heroTitle) {
      heroTitle.style.transform = `rotateX(${-moveY}deg) rotateY(${moveX}deg)`;
    }
  });

  // Card Tilt Effect
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });

  // Button interaction
  const btn = document.getElementById('explore-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      // For now, just a fun console log or scroll
      console.log('Exploring gravity...');
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    });
  }
});
