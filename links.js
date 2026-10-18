/* Add the official project URLs here when each resource is published. */
window.MT_LINKS = {
  arxiv: '',
  github: '',
  huggingface: ''
};

(() => {
  'use strict';
  const resources = {
    arxiv: {name: 'arXiv', description: 'The arXiv preprint is not available yet. You can read the current research manuscript below.'},
    github: {name: 'GitHub', description: 'The code repository is not public yet. The official repository link will appear here when it is available.'},
    huggingface: {name: 'Hugging Face', description: 'The Hugging Face release is not available yet. The official project link will appear here when it is available.'}
  };
  const dialog = document.querySelector('#resource-dialog');
  document.querySelectorAll('[data-resource]').forEach(link => {
    const key = link.dataset.resource;
    const resource = resources[key];
    const configured = window.MT_LINKS[key].trim();
    if (configured) {
      try {
        const url = new URL(configured);
        if (url.protocol !== 'https:') throw new Error('Use an HTTPS project URL.');
        link.href = url.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.removeAttribute('aria-haspopup');
        link.setAttribute('aria-label', `Open MT Forcing on ${resource.name} (opens in a new tab)`);
        const status = link.querySelector('.resource-status');
        if (status) status.textContent = 'Explore ↗';
        return;
      } catch { /* Leave incomplete URLs in the explicit coming-soon state. */ }
    }
    link.addEventListener('click', event => {
      event.preventDefault();
      document.querySelector('#hero-video')?.pause();
      document.querySelector('#resource-title').textContent = `${resource.name} · Coming soon`;
      document.querySelector('#resource-description').textContent = resource.description;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    });
  });
})();
