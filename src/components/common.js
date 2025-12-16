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

  // Prevent zooming on mobile
  const viewportMeta = document.createElement('meta');
  viewportMeta.name = 'viewport';
  viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  // Check if viewport already exists (some HTML might have it) and remove it/replace it
  const existingViewport = head.querySelector('meta[name="viewport"]');
  if (existingViewport) {
      existingViewport.remove();
  }
  head.appendChild(viewportMeta);
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
  } else if (currentPath.includes('galaxy.html')) {
    navHTML += `<a href="#" class="active">Galaxy Generator</a>`;
  } else if (currentPath.includes('cloth.html')) {
    navHTML += `<a href="#" class="active">Neon Cloth</a>`;
  } else if (currentPath.includes('fireworks.html')) {
    navHTML += `<a href="#" class="active">Fireworks Gravity</a>`;
  } else if (currentPath.includes('voyage.html')) {
    navHTML += `<a href="#" class="active">Cosmic Voyage</a>`;
  } else if (currentPath.includes('pendulum.html')) {
    navHTML += `<a href="#" class="active">Chaos Pendulum</a>`;
  } else if (currentPath.includes('jelly.html')) {
    navHTML += `<a href="#" class="active">Neon Jelly</a>`;
  } else if (currentPath.includes('brush.html')) {
    navHTML += `<a href="#" class="active">Gravity Brush</a>`;
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
  
  initControlPanel();
}

function initControlPanel() {
  const panel = document.querySelector('.control-panel');
  if (!panel) return;

  const title = panel.querySelector('h3');
  if (title) {
    // Add Toggle Indicator
    title.style.cursor = 'pointer';
    title.style.display = 'flex';
    title.style.justifyContent = 'space-between';
    title.style.alignItems = 'center';
    
    const indicator = document.createElement('span');
    indicator.textContent = '▼';
    indicator.style.fontSize = '0.8em';
    indicator.style.transition = 'transform 0.3s';
    title.appendChild(indicator);

    // Toggle Logic
    title.addEventListener('click', () => {
      panel.classList.toggle('collapsed');
      // Rotate indicator
      if (panel.classList.contains('collapsed')) {
        indicator.style.transform = 'rotate(-90deg)';
      } else {
        indicator.style.transform = 'rotate(0deg)';
      }
    });

    // Auto-collapse on mobile initially to save space?
    if (window.innerWidth <= 768) {
       panel.classList.add('collapsed');
       indicator.style.transform = 'rotate(-90deg)';
    }
  }
}
