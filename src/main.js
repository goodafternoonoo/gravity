import './styles/style.css'
import { initLayout } from './components/common.js';
import { initBackground } from './components/background.js';

initLayout();
initBackground();

document.addEventListener('DOMContentLoaded', () => {
  const cursorGlow = document.getElementById('cursor-glow');
  const heroTitle = document.querySelector('.hero-title');
  const cards = document.querySelectorAll('.glass-panel');

  // Typing Effect
  if (heroTitle) {
    const s1 = "Explore";
    const s2 = " the";
    const s3 = "Unknown Forces";
    
    // Clear initial content transparently to avoid layout shift, but here we replace structure
    // We recreate the structure: <span gradient>Explore</span> the <br> Unknown Forces
    // But we want to type it.
    heroTitle.innerHTML = `<span class="gradient-text"></span><span></span><br><span></span>`;
    const targetSpans = heroTitle.querySelectorAll('span');
    
    // Typing function
    const typeSpeed = 50;
    function typeString(str, span) {
      if (!span) return Promise.resolve();
      let i = 0;
      return new Promise(resolve => {
        const interval = setInterval(() => {
          span.textContent += str[i];
          i++;
          if (i >= str.length) {
            clearInterval(interval);
            resolve();
          }
        }, typeSpeed);
      });
    }

    async function startTyping() {
      // Small initial delay
      await new Promise(r => setTimeout(r, 300));
      await typeString(s1, targetSpans[0]); // Explore
      await typeString(s2, targetSpans[1]); // the
      await typeString(s3, targetSpans[2]); // Unknown Forces
    }
    
    startTyping();
  }

  // Mouse move handler for global cursor effect
  document.addEventListener('mousemove', (e) => {
    // Move cursor glow
    const x = e.clientX;
    const y = e.clientY;
    
    requestAnimationFrame(() => {
      if(cursorGlow) {
          cursorGlow.style.left = `${x}px`;
          cursorGlow.style.top = `${y}px`;
      }
    });

    /* Parallax effect removed by user request (2025-12-15)
    if (heroTitle) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const moveX = (x - centerX) / 25;
        const moveY = (y - centerY) / 25;
        heroTitle.style.transform = `rotateX(${-moveY}deg) rotateY(${moveX}deg)`;
    }
    */
  });

  // Card Tilt Effect - Enhanced
  // Tilt effect removed by user request (2025-12-15)
  /*
  const isAbout = window.location.pathname.includes('about.html');
  
  cards.forEach(card => {
    if (isAbout) return; // Disable tilt completely on About page

    card.addEventListener('mouseenter', () => {
      // Remove transition for instant follow
      card.style.transition = 'none';
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const isAbout = window.location.pathname.includes('about.html');
      const divisor = isAbout ? 60 : 10; // Extremely subtle on About page
      const scale = isAbout ? 1.0 : 1.05; // No scale on About page

      // Stronger and inverted for 3D look
      const rotateX = (centerY - y) / divisor; 
      const rotateY = (x - centerX) / divisor;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    });
    
    card.addEventListener('mouseleave', () => {
      // Restore transition for smooth reset
      card.style.transition = 'all 0.5s ease';
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
  */

  // Button interaction
  const btn = document.getElementById('explore-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    });
  }
});
