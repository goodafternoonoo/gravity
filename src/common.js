/**
 * Common utilities for Gravity Playground
 */

export function initHeader() {
  const header = document.querySelector('header');
  if (!header) return;

  const currentPath = window.location.pathname;
  
  // Define navigation items
  // [Path, Label, MatchCondition]
  const navItems = [
    ['/', 'Home', (p) => p === '/' || p === '/index.html'],
    ['/about.html', 'About', (p) => p === '/about.html'],
    // We can add experiment specific links if we want them in the top nav,
    // but looking at previous design, sub-pages had [Home, About, CurrentPage].
    // To keep it clean and robust, let's implement the standard Home/About + Contextual Active.
  ];

  // However, the previous design had specific "Active" links for each experiment page.
  // e.g. Orbit page had: Home | About | Orbit Builder (Active)
  // Let's replicate this dynamic structure.

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
  } else if (currentPath === '/' || currentPath === '/index.html') {
    // On Home, usually we have "Playground" active or just Home. 
    // The previous code had "Playground" as active. 
    // Let's stick to Home | About for simplicity and standard web patterns, 
    // or if we want to follow exact previous style:
    // User requested "Playground" to be "Home". 
  }

  navHTML += `</nav>`;
  
  header.innerHTML = navHTML;
}
