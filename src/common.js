/**
 * Common utilities for Gravity Playground
 * Acts as a Layout Manager to reduce HTML boilerplate.
 */

function injectGlobalHead() {
  const head = document.head;

  // 1. Google Fonts
  const fonts = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Noto+Sans+KR:wght@300;400;500;700&family=Outfit:wght@300;500;700&display=swap'
  ];
  
  // Preconnects
  const preconnect1 = document.createElement('link');
  preconnect1.rel = 'preconnect';
  preconnect1.href = fonts[0];
  head.appendChild(preconnect1);

  const preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect';
  preconnect2.href = fonts[1];
  preconnect2.crossOrigin = 'anonymous'; // gstatic needs crossorigin
  head.appendChild(preconnect2);

  // Font Stylesheet
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = fonts[2];
  head.appendChild(fontLink);

  // 2. Favicon & Manifest & Meta
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/png';
  favicon.href = '/favicon.png';
  head.appendChild(favicon);

  const manifest = document.createElement('link');
  manifest.rel = 'manifest';
  manifest.href = '/manifest.json';
  head.appendChild(manifest);

  const themeMeta = document.createElement('meta');
  themeMeta.name = 'theme-color';
  themeMeta.content = '#7000ff';
  head.appendChild(themeMeta);
}

function injectBackgrounds() {
  // Check if they already exist to avoid duplicates if run twice
  if (!document.getElementById('cursor-glow')) {
    const cursorGlow = document.createElement('div');
    cursorGlow.id = 'cursor-glow';
    document.body.prepend(cursorGlow);
  }

  if (!document.getElementById('bg-canvas')) {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.id = 'bg-canvas';
    // Insert after cursor glow
    const cursorGlow = document.getElementById('cursor-glow');
    cursorGlow.after(bgCanvas);
  }
}

export function initLayout() {
  injectGlobalHead();
  injectBackgrounds();

  // Initialize Header
  const header = document.querySelector('header');
  if (!header) return;

  const currentPath = window.location.pathname;
  
  let navHTML = `
    <div class="logo"><a href="/" style="text-decoration:none; color:inherit;">GRAVITY</a></div>
    <nav>
      <a href="/" class="${currentPath === '/' || currentPath === '/index.html' ? 'active' : ''}">Home</a>
      <a href="/about.html" class="${currentPath === '/about.html' ? 'active' : ''}">About</a>
  `;

  // Add contextual link for specific experiments
  if (currentPath.includes('orbit.html')) {
    navHTML += `<a href="#" class="active">Orbit Builder</a>`;
  } else if (currentPath.includes('swarm.html')) {
    navHTML += `<a href="#" class="active">Magnetic Swarm</a>`;
  } else if (currentPath.includes('audio.html')) {
    navHTML += `<a href="#" class="active">Audio Gravity</a>`;
  } else if (currentPath.includes('fluid.html')) {
    navHTML += `<a href="#" class="active">Neon Fluid</a>`;
  } else if (currentPath.includes('typo.html')) {
    navHTML += `<a href="#" class="active">Typo Physics</a>`;
  }

  navHTML += `</nav>`;
  header.innerHTML = navHTML;

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  }
}
