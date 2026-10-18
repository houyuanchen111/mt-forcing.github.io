/* MT Forcing — buildless, offline-capable research presentation. */
(() => {
  'use strict';
  const data = window.MT_DATA;
  if (!data) return;
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const pad = number => String(number).padStart(2, '0');
  const thumbnail = url => url.replace(/ours-(\d+)\.webp$/, 'thumb-$1.webp');
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let toastTimer;
  function toast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').classList.add('is-visible');
    toastTimer = setTimeout(() => $('#toast').classList.remove('is-visible'), 3500);
  }
  async function copy(text, success) {
    const feedback = document.querySelector('dialog[open] .dialog-status');
    if (feedback) feedback.textContent = '';
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const field = document.createElement('textarea');
        field.value = text;
        field.style.cssText = 'position:fixed;left:-9999px;top:0';
        // Keep the fallback inside the active dialog: the rest of the page is inert.
        (document.querySelector('dialog[open]') || document.body).append(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        if (!copied) throw new Error('Clipboard unavailable');
      }
      if (feedback) feedback.textContent = success;
      else toast(success);
    } catch {
      const message = 'Automatic copying is unavailable. Please select and copy the text.';
      if (feedback) feedback.textContent = message;
      else toast(message);
    }
  }
  function preload(url) { const image = new Image(); image.src = url; }

  // Navigation and reading progress.
  const menuButton = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    mobileNav.hidden = true;
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileNav.hidden = !open;
  });
  $$('#mobile-nav a').forEach(link => link.addEventListener('click', closeMenu));
  matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  const sections = $$('.article-content > section');
  let scrollPending = false;
  function updateScroll() {
    const denominator = document.documentElement.scrollHeight - innerHeight;
    $('.reading-progress').style.width = `${denominator > 0 ? Math.min(100, scrollY / denominator * 100) : 0}%`;
    let active = sections[0].id;
    for (const section of sections) if (section.getBoundingClientRect().top <= 180) active = section.id;
    $$('.article-toc > a').forEach(link => {
      const current = link.hash === `#${active}`;
      link.classList.toggle('is-active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scrollPending = false;
  }
  addEventListener('scroll', () => { if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); } }, {passive:true});
  addEventListener('resize', updateScroll, {passive:true});
  updateScroll();
  $('#share-button').addEventListener('click', () => copy(location.href.split('#')[0], 'Page link copied'));

  // Hero: native video controls; playback is user initiated.
  const heroVideo = $('#hero-video');
  function stopHero() {
    heroVideo.pause();
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopHero(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { if (!entries[0].isIntersecting) stopHero(); }, {threshold:.05}).observe(heroVideo);
  }

  // Gallery: a shared geometry, slider, and all editing turns.
  const shortTitles = {'puppy':'Puppy details','forest-portrait':'Forest portrait','beach-wedding':'Beach wedding'};
  const galleryCases = ['beach-wedding','forest-portrait','puppy'].map(slug => data.cases.find(item => item.slug === slug));
  let selectedCase = galleryCases[0];
  let selectedTurn = 8;
  let compareSource = false;
  let galleryRevision = 0;
  $('#case-tabs').innerHTML = galleryCases.map((item, index) => `<button id="case-tab-${item.slug}" role="tab" aria-selected="${index === 0}" aria-controls="case-panel" tabindex="${index === 0 ? 0 : -1}" data-slug="${item.slug}">${shortTitles[item.slug]}</button>`).join('');
  function renderThumbnails() {
    $('#turn-selector').innerHTML = selectedCase.turns.map(turn => `<button data-round="${turn.round}" aria-pressed="${turn.round === selectedTurn}" aria-label="View turn ${turn.round}: ${escape(turn.summary_en)}"><img src="${thumbnail(turn.ours)}" alt="" width="150" height="101" loading="lazy"><span>${pad(turn.round)}</span></button>`).join('');
  }
  async function renderGallery() {
    const revision = ++galleryRevision;
    const turn = selectedCase.turns[selectedTurn - 1];
    const oursUrl = turn.ours;
    const baseUrl = compareSource ? selectedCase.source : turn.base;
    const candidates = [oursUrl, baseUrl].map(url => { const image = new Image(); image.src = url; return image.decode().catch(() => {}); });
    await Promise.all(candidates);
    if (revision !== galleryRevision) return;
    $('#comparison').classList.toggle('is-portrait', selectedCase.slug === 'forest-portrait');
    $('#case-panel').dataset.case = selectedCase.slug;
    $('#compare-ours').src = oursUrl;
    $('#compare-ours').alt = `${shortTitles[selectedCase.slug]}, MT Forcing turn ${selectedTurn}: ${turn.summary_en}`;
    $('#compare-base').src = baseUrl;
    $('#compare-base').alt = compareSource ? `${shortTitles[selectedCase.slug]}, original image` : `${shortTitles[selectedCase.slug]}, SenseNova-U1.5 turn ${selectedTurn}`;
    $('#compare-label-left').textContent = compareSource ? 'Original image' : 'SenseNova-U1.5';
    updateCompareAria();
    $('#gallery-round').textContent = `TURN ${pad(selectedTurn)}`;
    $('#gallery-prompt').textContent = turn.summary_en;
    $('#case-description').textContent = selectedCase.description.en;
    $('#case-panel').setAttribute('aria-labelledby', `case-tab-${selectedCase.slug}`);
    $$('#turn-selector button').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.round) === selectedTurn)));
    if (selectedTurn < 8) { preload(selectedCase.turns[selectedTurn].ours); preload(selectedCase.turns[selectedTurn].base); }
  }
  $('#case-tabs').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    selectedCase = galleryCases.find(item => item.slug === button.dataset.slug);
    $$('#case-tabs button').forEach(tab => { const active = tab === button; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    renderThumbnails();
    renderGallery();
  });
  $('#turn-selector').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    selectedTurn = Number(button.dataset.round);
    renderGallery();
  });
  $('#compare-source').addEventListener('click', () => {
    compareSource = !compareSource;
    $('#compare-source').setAttribute('aria-pressed', String(compareSource));
    renderGallery();
  });
  function updateCompareAria() {
    const range = $('#compare-range');
    range.setAttribute('aria-valuetext', `${compareSource ? 'Original image' : 'SenseNova-U1.5'} visible: ${range.value}%; MT Forcing visible: ${100 - Number(range.value)}%`);
  }
  $('#compare-range').addEventListener('input', event => {
    $('#comparison').style.setProperty('--split', `${event.target.value}%`);
    updateCompareAria();
  });
  renderThumbnails();
  renderGallery();

  // Native dialogs provide focus containment and Escape behavior.
  function showDialog(dialog) {
    stopHero();
    const feedback = $('.dialog-status', dialog);
    if (feedback) feedback.textContent = '';
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }
  $$('dialog').forEach(dialog => {
    $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
  });
  $('#open-fullscreen').addEventListener('click', () => {
    const turn = selectedCase.turns[selectedTurn - 1];
    $('#lightbox-image').src = turn.ours;
    $('#lightbox-image').alt = `${selectedCase.title.en} · MT Forcing turn ${selectedTurn}`;
    $('#lightbox-caption').textContent = `${shortTitles[selectedCase.slug]} / TURN ${pad(selectedTurn)} — ${turn.summary_en}`;
    showDialog($('#image-dialog'));
  });
  // Two complementary training signals.
  const methodCopy = {
    dmd:{kicker:'LEARNING ON SELF-ROLLOUTS',title:'A single-turn teacher.<br>Guidance at every turn.',text:'The student edits its own generated history, one turn at a time. The teacher starts from the original image and applies the accumulated instructions in a single pass, providing distribution-level guidance without carrying errors across turns.',focus:'Goal: more stable visual quality'},
    tf:{kicker:'PRESERVING THE EDITING HISTORY',title:'Learn what to preserve<br>from real editing histories.',text:'Teacher-Forcing Warmup first trains on real multi-turn editing trajectories. A lightly weighted teacher-forcing objective remains active during distribution matching, helping the student follow the editing history while limiting oversaturation and visual artifacts.',focus:'Goal: better consistency across turns'}
  };
  $$('.method-tab').forEach(button => button.addEventListener('click', () => {
    const mode = button.dataset.method;
    const content = methodCopy[mode];
    $$('.method-tab').forEach(tab => { const active = tab === button; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    $('#method-panel').dataset.mode = mode;
    $('#method-panel').setAttribute('aria-labelledby', button.id);
    $('#method-kicker').textContent = content.kicker;
    $('#method-title').innerHTML = content.title;
    $('#method-text').textContent = content.text;
    $('#method-focus').textContent = content.focus;
  }));

  // Plot original table values. Full, zero-based axes avoid overstating differences.
  let currentMetric = 'CC';
  let currentModel = 'sensenova-u15';
  const metrics = {
    CC:{name:'Content consistency',direction:'Higher is better',max:10,tick:2,unit:'Score / 10'},
    IF:{name:'Instruction following',direction:'Higher is better',max:10,tick:2,unit:'Score / 10'},
    DRS:{name:'Drift resistance',direction:'Higher is better',max:5,tick:1,unit:'Score / 5'},
    Pixel:{name:'Matched-point displacement',direction:'Lower is better',max:15,tick:3,unit:'Displacement / px'}
  };
  function renderChart() {
    const model = data.benchmark.models.find(item => item.id === currentModel);
    const metric = metrics[currentMetric];
    const base = model.base[currentMetric];
    const ours = model.ours[currentMetric];
    $('#chart-heading').textContent = metric.name;
    $('#chart-panel').setAttribute('aria-labelledby', `metric-${currentMetric}`);
    $('#chart-subtitle').textContent = `${currentMetric} · ${metric.direction}`;
    $('#chart-unit').textContent = metric.unit;
    $('#chart-base-label').textContent = model.name;
    const compact = matchMedia('(max-width: 700px)').matches;
    const width = compact ? 360 : 800, height = compact ? 270 : 300;
    const left = compact ? 30 : 40, right = compact ? 52 : 48, top = 20, bottom = 41;
    const plotWidth = width - left - right, plotHeight = height - top - bottom;
    const x = index => left + index / 7 * plotWidth;
    const y = value => top + (1 - value / metric.max) * plotHeight;
    const line = values => values.map((value,index) => `${index ? 'L':'M'}${x(index).toFixed(2)},${y(value).toFixed(2)}`).join(' ');
    let svg = `<svg viewBox="0 0 ${width} ${height}" class="${compact ? 'compact-chart' : 'wide-chart'}" role="img" aria-labelledby="chart-svg-title chart-svg-desc"><title id="chart-svg-title">${model.name}: ${metric.name} over eight editing turns</title><desc id="chart-svg-desc">${metric.direction}. Base model: ${base.join(', ')}. MT Forcing: ${ours.join(', ')}. The horizontal axis shows editing turns. The vertical axis starts at zero.</desc>`;
    for (let tick=0; tick<=metric.max; tick+=metric.tick) svg += `<line class="chart-grid" x1="${left}" x2="${width-right}" y1="${y(tick)}" y2="${y(tick)}"/><text class="chart-tick" x="${left-14}" y="${y(tick)+4}" text-anchor="end">${tick}</text>`;
    for (let index=0; index<8; index++) svg += `<text class="chart-tick" x="${x(index)}" y="${height-14}" text-anchor="middle">${index+1}</text>`;
    svg += `<text class="chart-tick" x="${width-2}" y="${height-14}" text-anchor="end" font-size="9">Turn</text>`;
    svg += `<path d="${line(ours)} L${x(7)},${y(0)} L${x(0)},${y(0)} Z" fill="#c46039" opacity=".035"/>`;
    [[base,'#837f76',model.name],[ours,'#b65833','MT Forcing']].forEach(([values,color,name]) => {
      svg += `<path class="chart-line" d="${line(values)}" stroke="${color}"/>`;
      values.forEach((value,index) => { svg += `<circle class="chart-point" cx="${x(index)}" cy="${y(value)}" r="3.5" fill="${color}" stroke="#f7f6f3" stroke-width="1.5"><title>${name} · Turn ${index+1}: ${value.toFixed(2)}</title></circle>`; });
    });
    svg += '</svg>';
    $('#results-chart').innerHTML = svg;
    const difference = currentMetric === 'Pixel' ? base[7]-ours[7] : ours[7]-base[7];
    const unit = currentMetric === 'Pixel' ? ' px' : ' points';
    $('#chart-insight').innerHTML = `<strong>Turn 8: ${ours[7].toFixed(2)} vs. ${base[7].toFixed(2)}${currentMetric==='Pixel'?' px':''}</strong><span>${difference.toFixed(2)}${unit} ${currentMetric==='Pixel'?'lower':'higher'} than the base model</span>`;
    $('#results-table').innerHTML = `<caption>${model.name} · ${metric.name} · ${metric.direction}</caption><thead><tr><th scope="col">Model / Turn</th>${base.map((_,index) => `<th scope="col">${index+1}</th>`).join('')}</tr></thead><tbody><tr><th scope="row">${model.name}</th>${base.map(value => `<td>${value.toFixed(2)}</td>`).join('')}</tr><tr><th scope="row">+ MT Forcing</th>${ours.map(value => `<td>${value.toFixed(2)}</td>`).join('')}</tr></tbody>`;
  }
  $('#model-select').addEventListener('change', event => { currentModel = event.target.value === 'u1' ? 'sensenova-u1' : 'sensenova-u15'; renderChart(); });
  $$('.chart-tabs button').forEach(button => button.addEventListener('click', () => {
    currentMetric = button.dataset.metric;
    $$('.chart-tabs button').forEach(tab => { const active = tab === button; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    renderChart();
  }));
  renderChart();
  matchMedia('(max-width: 700px)').addEventListener('change', renderChart);

  // Keyboard behavior for every tab group follows the WAI-ARIA tab pattern.
  $$('[role="tablist"]').forEach(list => list.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    const tabs = $$('[role="tab"]', list);
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus(); tabs[next].click();
  }));

  // Respect OS motion settings; the page never auto-starts an animation.
  if (reducedMotion) document.documentElement.classList.add('reduced-motion');
})();
