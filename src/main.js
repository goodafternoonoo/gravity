import './styles/style.css'
import { initLayout } from './components/common.js';
import { initBackground } from './components/background.js';

initLayout();
initBackground();

document.addEventListener('DOMContentLoaded', () => {
  const cursorGlow = document.getElementById('cursor-glow');
  // Typing Effect
  const originalTextHTML = heroTitle.innerHTML; // Keep HTML structure (span, br)
  // For typing effect, it's easier to type plain text, but we have spans.
  // Let's type simply by setting opacity or using a library logic manually.
  // Simpler approach: Type the text content, but we have styling spans.
  // Better approach: Reveal animation.
  heroTitle.classList.add('typing-reveal'); // We'll add CSS for this potentially, Or JS typing:
  
  // Custom JS Typing that respects HTML structure is complex.
  // Let's try a simple visual hack: Set opacity 0 then fade in chars?
  // Or just type the main text.
  // Let's go with a specialized typing for "Explore the Unknown Forces"
  // Actually, let's keep it simple and robust:
  // 1. Hide everything.
  // 2. Type "Explore" (inside span)
  // 3. Type " the"
  // 4. br
  // 5. Type "Unknown Forces"

  // Reset for animation
  const s1 = "Explore";
  const s2 = " the";
  const s3 = "Unknown Forces";
  
  heroTitle.innerHTML = `<span class="gradient-text"></span><span></span><br><span></span>`;
  const spans = heroTitle.querySelectorAll('span');
  
  let delay = 0;
  const typeSpeed = 50;
  
  function typeString(str, span) {
    let i = 0;
    return new Promise(resolve => {
        const interval = setInterval(() => {
            span.textContent += str[i];
            i++;
            if(i >= str.length) {
                clearInterval(interval);
                resolve();
            }
        }, typeSpeed);
    });
  }

  async function runTyping() {
     await typeString(s1, spans[0]);
     await typeString(s2, spans[1]); // " the"
     // br is already there
     await typeString(s3, spans[3] || heroTitle.lastChild); // last child might be text node if strict
     // Actually structure is span, span, br, span. Let's fix HTML above.
  }
  
  // Re-selecting spans correctly
  heroTitle.innerHTML = `<span class="gradient-text"></span><span></span><br><span></span>`;
  const targetSpans = heroTitle.querySelectorAll('span'); // 3 spans
  
  async function startTyping() {
      await typeString(s1, targetSpans[0]);
      await typeString(s2, targetSpans[1]);
      await typeString(s3, targetSpans[2]);
  }
  
  startTyping();


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

  // Card Tilt Effect - Enhanced Sensitivity
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Increased multiplier for stronger effect
      const rotateX = (y - centerY) / 8; 
      const rotateY = (centerX - x) / 8;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });

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
