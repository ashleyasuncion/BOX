document.addEventListener('DOMContentLoaded', () => {

  // ══════════════════════════════════════
  // TOPBAR NAVIGATION
  // ══════════════════════════════════════

  const icons = document.querySelectorAll('.topbar-icon');
  const activePage = document.body.dataset.page;

  const pages = {
    home: 'main-home.html',
    borrow: 'main-borrow.html',
    lend: 'main-lend.html',
    found: 'main-found.html',
    lost: 'main-lost.html'
  };

  icons.forEach(icon => {
    const nav = icon.dataset.nav;

    if (nav === activePage) {
      icon.style.opacity = '1';
    } else {
      icon.style.opacity = '0.35';
    }

    icon.addEventListener('click', () => {
      if (nav === activePage) return;
      if (pages[nav]) window.location.href = pages[nav];
    });

    icon.addEventListener('mouseenter', () => {
      if (nav !== activePage) icon.style.opacity = '0.7';
    });

    icon.addEventListener('mouseleave', () => {
      if (nav !== activePage) icon.style.opacity = '0.35';
    });
  });

  // ══════════════════════════════════════
  // ACCOUNTS
  // ══════════════════════════════════════

  const ACCOUNTS = [
    { user: 'student', pass: 'pass123', redirect: 'main-home.html' },
    { user: 'anna@plp.edu', pass: 'anna2025', redirect: 'main-home.html' },
    { user: '2024-00123', pass: 'mypass', redirect: 'main-home.html' }
  ];

  // ══════════════════════════════════════
  // STORIES
  // ══════════════════════════════════════

  const STORIES = [
    { img: 'images/stories/story-box.png', link: 'box.html' },
    { img: 'images/stories/story-01.png' },
    { img: 'images/stories/story-02.png' },
    { img: 'images/stories/story-03.png' },
    { img: 'images/stories/story-04.png' },
    { img: 'images/stories/story-05.png' },
    { img: 'images/stories/story-06.png' },
    { img: 'images/stories/story-07.png' }
  ];

  const strip = document.getElementById('storiesStrip');

  if (strip) {
    STORIES.forEach(story => {
      const card = story.link
        ? Object.assign(document.createElement('a'), { href: story.link })
        : document.createElement('div');

      card.className = 'story-card';

      const img = document.createElement('img');
      img.src = story.img;
      img.alt = '';
      img.loading = 'lazy';
      img.draggable = false;

      card.appendChild(img);
      strip.appendChild(card);
    });
  }

  // ══════════════════════════════════════
  // SEARCH — shared helper
  // ══════════════════════════════════════

  /* Highlight matching text inside a string */
  function highlight(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'),
      '<mark>$1</mark>');
  }

  /* Case-insensitive match */
  function matches(text, query) {
    return text.toLowerCase().includes(query.toLowerCase());
  }

  // ══════════════════════════════════════
  // SEARCH — Feed pages
  // (home, lost, found, borrow)
  // ══════════════════════════════════════

  const FEED_PAGES = ['home', 'lost', 'found', 'borrow'];

  if (FEED_PAGES.includes(activePage)) {

    /* ── Collect all card data from the DOM ── */
    function collectFeedItems() {
      const items = [];
      document.querySelectorAll('.card').forEach(card => {

        const titleEl = card.querySelector('.item-title');
        const descEl = card.querySelector('.item-desc');
        const locEl = card.querySelector('.location');
        const flagEl = card.querySelector('.flag-icon');
        const iconEl = card.querySelector('.media-thumb i');
        const linkEl = card.querySelector('.card-body-link');
        const nameEl = card.querySelector('.user-name');

        const title = titleEl ? titleEl.textContent.trim() : '';
        const desc = descEl ? descEl.textContent.trim() : '';
        const location = locEl ? locEl.textContent.trim() : '';
        const username = nameEl ? nameEl.textContent.trim() : '';

        /* Detect flag type from class */
        let flag = 'lost';
        if (flagEl) {
          if (flagEl.classList.contains('flag-found')) flag = 'found';
          else if (flagEl.classList.contains('flag-lend')) flag = 'lend';
          else if (flagEl.classList.contains('flag-borrow')) flag = 'borrow';
        }

        /* Icon class e.g. "ti ti-mouse" */
        const iconClass = iconEl ? iconEl.className : 'ti ti-package';

        /* Destination href */
        const href = linkEl ? linkEl.getAttribute('href') : '#';

        items.push({ title, desc, location, username, flag, iconClass, href });
      });
      return items;
    }

    /* ── Build a result card element ── */
    function buildFeedResult(item, query) {
      const a = document.createElement('a');
      a.className = 'search-result-card';
      a.href = item.href;

      /* Icon */
      const iconWrap = document.createElement('div');
      iconWrap.className = 'search-result-icon';
      iconWrap.innerHTML = `<i class="${item.iconClass}"></i>`;

      /* Body */
      const body = document.createElement('div');
      body.className = 'search-result-body';

      const titleEl = document.createElement('div');
      titleEl.className = 'search-result-title';
      titleEl.innerHTML = highlight(item.title, query);

      const meta = document.createElement('div');
      meta.className = 'search-result-meta';

      const flag = document.createElement('span');
      flag.className = `search-result-flag search-result-flag-${item.flag}`;
      flag.textContent = item.flag.charAt(0).toUpperCase() + item.flag.slice(1);

      const loc = document.createElement('span');
      loc.className = 'search-result-location';
      loc.innerHTML = `<i class="ti ti-map-pin"></i>${item.location}`;

      meta.appendChild(flag);
      meta.appendChild(loc);
      body.appendChild(titleEl);
      body.appendChild(meta);

      a.appendChild(iconWrap);
      a.appendChild(body);
      return a;
    }

    /* ── Render results into the panel ── */
    function renderFeedResults(query, resultsEl, allItems) {
      resultsEl.innerHTML = '';

      if (!query.trim()) {
        resultsEl.innerHTML = `
          <div class="search-hint">
            <i class="ti ti-search"></i>
            <p>Search posts by title,<br>description or location</p>
          </div>`;
        return;
      }

      const filtered = allItems.filter(item =>
        matches(item.title, query) ||
        matches(item.desc, query) ||
        matches(item.location, query) ||
        matches(item.username, query)
      );

      if (filtered.length === 0) {
        resultsEl.innerHTML = `
          <div class="search-no-results">
            <i class="ti ti-zoom-cancel"></i>
            <p>No results for <strong>"${query}"</strong><br>Try different keywords</p>
          </div>`;
        return;
      }

      const count = document.createElement('div');
      count.className = 'search-result-count';
      count.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;
      resultsEl.appendChild(count);

      filtered.forEach(item => {
        resultsEl.appendChild(buildFeedResult(item, query));
      });
    }

    /* ── Build & inject overlay markup ── */
    function buildFeedSearchOverlay() {
      const screen = document.querySelector('.screen');
      if (!screen) return;

      const overlay = document.createElement('div');
      overlay.className = 'search-overlay';
      overlay.id = 'searchOverlay';
      overlay.innerHTML = `
        <div class="search-overlay-backdrop" id="searchBackdrop"></div>
        <div class="search-panel">
          <div class="search-panel-bar">
            <i class="ti ti-search"></i>
            <input
              type="text"
              class="search-panel-input"
              id="searchPanelInput"
              placeholder="Search posts…"
              autocomplete="off"
            />
            <button class="search-panel-cancel" id="searchCancel">Cancel</button>
          </div>
          <div class="search-results" id="searchResults">
            <div class="search-hint">
              <i class="ti ti-search"></i>
              <p>Search posts by title,<br>description or location</p>
            </div>
          </div>
        </div>`;

      screen.appendChild(overlay);

      const input = overlay.querySelector('#searchPanelInput');
      const resultsEl = overlay.querySelector('#searchResults');
      const backdrop = overlay.querySelector('#searchBackdrop');
      const cancelBtn = overlay.querySelector('#searchCancel');

      /* Collect items once on open so DOM is ready */
      let allItems = [];

      function openSearch() {
        allItems = collectFeedItems();
        overlay.classList.add('active');
        setTimeout(() => input.focus(), 80);
      }

      function closeSearch() {
        overlay.classList.remove('active');
        input.value = '';
        resultsEl.innerHTML = `
          <div class="search-hint">
            <i class="ti ti-search"></i>
            <p>Search posts by title,<br>description or location</p>
          </div>`;
      }

      /* Topbar search icon trigger */
      const searchIcon = document.querySelector('.topbar-search');
      if (searchIcon) searchIcon.addEventListener('click', openSearch);

      backdrop.addEventListener('click', closeSearch);
      cancelBtn.addEventListener('click', closeSearch);

      input.addEventListener('input', () => {
        renderFeedResults(input.value, resultsEl, allItems);
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeSearch();
      });
    }

    buildFeedSearchOverlay();
  }

  // ══════════════════════════════════════
  // SEARCH — Lend page (grid)
  // ══════════════════════════════════════

  if (activePage === 'lend') {

    /* ── Collect grid items ── */
    function collectLendItems() {
      const items = [];
      document.querySelectorAll('.box-item').forEach(item => {
        const iconEl = item.querySelector('.box-item-img i');
        const labelEl = item.querySelector('.box-item-label');
        const linkEl = item.closest('a') || item;

        const labelText = labelEl ? labelEl.textContent.trim() : '';
        const iconClass = iconEl ? iconEl.className : 'ti ti-package';

        /* Extract price/free and name */
        const priceEl = labelEl ? labelEl.querySelector('.box-price') : null;
        const freeEl = labelEl ? labelEl.querySelector('.box-free') : null;
        const price = priceEl ? priceEl.textContent.trim() : null;
        const isFree = !!freeEl;

        /* Item name = label text minus the price/free part */
        const name = labelText.replace(/^[^⋅]+⋅\s*/, '').trim() ||
          labelText.split('⋅').pop().trim();

        const href = linkEl.tagName === 'A' ? linkEl.getAttribute('href') : '#';

        items.push({ name, labelText, iconClass, price, isFree, href });
      });
      return items;
    }

    /* ── Build lend result card ── */
    function buildLendResult(item, query) {
      const el = document.createElement(item.href !== '#' ? 'a' : 'div');
      el.className = 'search-result-card-grid';
      if (item.href !== '#') el.href = item.href;

      const iconWrap = document.createElement('div');
      iconWrap.className = 'search-result-icon';
      iconWrap.innerHTML = `<i class="${item.iconClass}"></i>`;

      const body = document.createElement('div');
      body.className = 'search-result-body';

      const titleEl = document.createElement('div');
      titleEl.className = 'search-result-title';
      titleEl.innerHTML = highlight(item.name, query);

      const meta = document.createElement('div');
      meta.className = 'search-result-meta';

      if (item.isFree) {
        const badge = document.createElement('span');
        badge.className = 'search-result-price-free';
        badge.textContent = 'FREE';
        meta.appendChild(badge);
      } else if (item.price) {
        const badge = document.createElement('span');
        badge.className = 'search-result-price';
        badge.textContent = item.price;
        meta.appendChild(badge);
      }

      const lendBadge = document.createElement('span');
      lendBadge.className = 'search-result-flag search-result-flag-lend';
      lendBadge.textContent = 'Lend';
      meta.appendChild(lendBadge);

      body.appendChild(titleEl);
      body.appendChild(meta);
      el.appendChild(iconWrap);
      el.appendChild(body);
      return el;
    }

    /* ── Render lend results ── */
    function renderLendResults(query, resultsEl, allItems) {
      resultsEl.innerHTML = '';

      if (!query.trim()) {
        resultsEl.innerHTML = `
          <div class="search-hint">
            <i class="ti ti-search"></i>
            <p>Search items available to borrow</p>
          </div>`;
        return;
      }

      const filtered = allItems.filter(item =>
        matches(item.name, query) ||
        matches(item.labelText, query)
      );

      if (filtered.length === 0) {
        resultsEl.innerHTML = `
          <div class="search-no-results">
            <i class="ti ti-zoom-cancel"></i>
            <p>No results for <strong>"${query}"</strong></p>
          </div>`;
        return;
      }

      const count = document.createElement('div');
      count.className = 'search-result-count';
      count.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;
      resultsEl.appendChild(count);

      filtered.forEach(item => {
        resultsEl.appendChild(buildLendResult(item, query));
      });
    }

    /* ── Build & inject overlay for lend page ── */
    function buildLendSearchOverlay() {
      const screen = document.querySelector('.screen');
      if (!screen) return;

      const overlay = document.createElement('div');
      overlay.className = 'search-overlay';
      overlay.id = 'searchOverlay';
      overlay.innerHTML = `
        <div class="search-overlay-backdrop" id="searchBackdrop"></div>
        <div class="search-panel">
          <div class="search-panel-bar">
            <i class="ti ti-search"></i>
            <input
              type="text"
              class="search-panel-input"
              id="searchPanelInput"
              placeholder="Search lend items…"
              autocomplete="off"
            />
            <button class="search-panel-cancel" id="searchCancel">Cancel</button>
          </div>
          <div class="search-results" id="searchResults">
            <div class="search-hint">
              <i class="ti ti-search"></i>
              <p>Search items available to borrow</p>
            </div>
          </div>
        </div>`;

      screen.appendChild(overlay);

      const input = overlay.querySelector('#searchPanelInput');
      const resultsEl = overlay.querySelector('#searchResults');
      const backdrop = overlay.querySelector('#searchBackdrop');
      const cancelBtn = overlay.querySelector('#searchCancel');
      let allItems = [];

      function openSearch() {
        allItems = collectLendItems();
        overlay.classList.add('active');
        setTimeout(() => input.focus(), 80);
      }

      function closeSearch() {
        overlay.classList.remove('active');
        input.value = '';
        resultsEl.innerHTML = `
          <div class="search-hint">
            <i class="ti ti-search"></i>
            <p>Search items available to borrow</p>
          </div>`;
      }

      const searchIcon = document.querySelector('.topbar-search');
      if (searchIcon) searchIcon.addEventListener('click', openSearch);

      backdrop.addEventListener('click', closeSearch);
      cancelBtn.addEventListener('click', closeSearch);

      input.addEventListener('input', () => {
        renderLendResults(input.value, resultsEl, allItems);
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeSearch();
      });
    }

    buildLendSearchOverlay();
  }

  // ══════════════════════════════════════
  // SEARCH — Box page (inline input)
  // ══════════════════════════════════════

  if (activePage === 'box') {

    const boxInput = document.querySelector('.box-search-input');
    if (!boxInput) return;

    /* ── Collect box grid items ── */
    function collectBoxItems() {
      const items = [];
      document.querySelectorAll('.box-item').forEach(item => {
        const titleEl = item.querySelector('.box-item-title');
        const subEl = item.querySelector('.box-item-sub');
        const linkEl = item.closest('a') || item;

        items.push({
          el: item,
          title: titleEl ? titleEl.textContent.trim() : '',
          sub: subEl ? subEl.textContent.trim() : '',
          href: linkEl.tagName === 'A' ? linkEl.getAttribute('href') : null
        });
      });
      return items;
    }

    const boxItems = collectBoxItems();

    /* ── Filter grid items in place ── */
    function filterBoxItems(query) {
      let visibleCount = 0;

      boxItems.forEach(({ el, title, sub }) => {
        const show = !query.trim() ||
          matches(title, query) ||
          matches(sub, query);

        /* The wrapping element might be <a> or the item itself */
        const wrapper = el.closest('a') || el;
        wrapper.style.display = show ? '' : 'none';

        if (show) visibleCount++;
      });

      /* Show/hide no-results message */
      let noRes = document.getElementById('boxNoResults');
      if (visibleCount === 0 && query.trim()) {
        if (!noRes) {
          noRes = document.createElement('div');
          noRes.id = 'boxNoResults';
          noRes.className = 'search-no-results';
          noRes.style.gridColumn = '1 / -1';
          noRes.innerHTML = `
            <i class="ti ti-zoom-cancel"></i>
            <p>No items found for <strong>"${query}"</strong></p>`;
          document.querySelector('.box-grid').appendChild(noRes);
        }
        noRes.style.display = 'flex';
      } else if (noRes) {
        noRes.style.display = 'none';
      }
    }

    boxInput.addEventListener('input', () => {
      filterBoxItems(boxInput.value);
    });

    /* Clear filter on Escape */
    boxInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        boxInput.value = '';
        filterBoxItems('');
        boxInput.blur();
      }
    });
  }

});