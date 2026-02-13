// Consolidated previously-inline scripts: year, fallback renderers, menu toggle, durations
(function(){
  'use strict';

  // Update copyright year
  (function(){
    try { const el = document.getElementById('year'); if (el) el.textContent = new Date().getFullYear(); } catch(e){}
  })();

  // Durations renderer (replaces .js-duration content safely)
  (function(){
    function formatMonthYear(d) {
      try { return new Date(d).toLocaleString(undefined, { month: 'short', year: 'numeric' }); } catch(e){ return d; }
    }
    function formatDurationMonths(totalMonths) {
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      const parts = [];
      if (years > 0) parts.push(years + ' yr' + (years===1 ? '' : 's'));
      if (months > 0) parts.push(months + ' mo' + (months===1 ? '' : 's'));
      return parts.join(' ');
    }
    function computeAndRender(){
      const els = document.querySelectorAll('.js-duration');
      els.forEach(el => {
        const s = el.dataset.start;
        const e = el.dataset.end;
        if (!s) return;
        const start = new Date(s);
        const end = (e && e.toLowerCase() !== 'present') ? new Date(e) : new Date();
        let totalMonths = (end.getFullYear() - start.getFullYear())*12 + (end.getMonth() - start.getMonth());
        if (totalMonths < 0) totalMonths = 0;
        const duration = formatDurationMonths(totalMonths);
        const startLabel = formatMonthYear(start);
        const endLabel = (e && e.toLowerCase() !== 'present') ? formatMonthYear(end) : 'Present';
        while (el.firstChild) el.removeChild(el.firstChild);
        const rangeSpan = document.createElement('span');
        rangeSpan.className = 'range';
        rangeSpan.textContent = startLabel + ' — ' + endLabel;
        el.appendChild(rangeSpan);
        if (duration) {
          const durSpan = document.createElement('span');
          durSpan.className = 'hidden md:inline';
          durSpan.textContent = ' · ' + duration;
          el.appendChild(durSpan);
        }
      });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', computeAndRender); else computeAndRender();
  })();

  // Vanilla-JS fallback renderer for certifications and achievements
  (function(){
    function createText(el, tag, className, text) {
      const n = document.createElement(tag);
      if (className) n.className = className;
      if (text) n.textContent = text;
      el.appendChild(n);
      return n;
    }
    async function fetchJson(path) {
      try {
        const res = await fetch(path);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
      } catch (e) { return null; }
    }

    function renderCertifications(root) {
      if (!root) return;
      // Ensure we render inside the scrolling container used by the Alpine template
      let scrollContainer = root.querySelector('.flex-1.overflow-y-auto') || root.querySelector('.mt-3.flex-1.overflow-y-auto.pr-2');
      if (!scrollContainer) {
        // create the same structure the Alpine template used
        scrollContainer = document.createElement('div');
        scrollContainer.className = 'mt-3 flex-1 overflow-y-auto pr-2';
        root.appendChild(scrollContainer);
      }
      const listHolder = scrollContainer.querySelector('ul') || (function(){ const ul=document.createElement('ul'); ul.className='space-y-3'; scrollContainer.appendChild(ul); return ul; })();
      listHolder.innerHTML = '';
      (async () => {
        const ms = await fetchJson('data/ms-certifications.json') || { certifications: [] };
        const other = await fetchJson('data/other-certifications.json') || { certifications: [] };
        const fallbackBadge = 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-general-badge.svg';
        const msItems = (Array.isArray(ms.certifications) ? ms.certifications : []).map(c => ({
          ...c,
          issuer: 'Microsoft',
          iconUrl: (c.iconUrl && (c.iconUrl.startsWith('http') ? c.iconUrl : (c.iconUrl.startsWith('/') ? 'https://learn.microsoft.com/en-us' + c.iconUrl : c.iconUrl))) || fallbackBadge,
          certificationURL: (c.certificationURL && (c.certificationURL.startsWith('http') ? c.certificationURL : 'https://learn.microsoft.com/en-us' + (c.certificationURL.startsWith('/') ? c.certificationURL : '/' + c.certificationURL)))
        }));
        const otherItems = (Array.isArray(other.certifications) ? other.certifications : []).map(c => {
          const issuer = c.issuer || 'Other';
          let icon = c.iconUrl ? (c.iconUrl.startsWith('/') ? c.iconUrl.slice(1) : c.iconUrl) : '';
          if (!icon && issuer === 'Sitecore') icon = 'assets/sitecore.png';
          if (!icon) icon = fallbackBadge;
          const certUrl = c.certificationURL && (c.certificationURL.startsWith('http') ? c.certificationURL : ('https://learn.microsoft.com/en-us' + (c.certificationURL && c.certificationURL.startsWith('/') ? c.certificationURL : (c.certificationURL ? '/' + c.certificationURL : ''))));
          return { ...c, issuer, iconUrl: icon, certificationURL: certUrl };
        });
        const merged = [...msItems, ...otherItems].map(i => ({ ...i, iconUrl: i.iconUrl || fallbackBadge }));
        let latest = merged.slice().sort((a,b) => new Date(b.dateEarned || 0) - new Date(a.dateEarned || 0)).slice(0,5);
        // If the top results are all Microsoft and there are non-MS items available,
        // ensure at least one non-MS certification is shown so other providers remain visible.
        if (otherItems.length > 0 && latest.every(it => (it.issuer || '').toLowerCase() === 'microsoft')) {
          // find a non-MS item from merged
          const nonMs = merged.find(it => (it.issuer || '').toLowerCase() !== 'microsoft');
          if (nonMs) {
            // replace the last slot with this non-MS item
            latest[latest.length - 1] = nonMs;
          }
        }
        for (const item of latest) {
          const li = document.createElement('li'); li.className='flex items-center justify-between border p-3 rounded';
          const left = document.createElement('div'); left.className='flex items-center gap-3';
          const img = document.createElement('img'); img.src = item.iconUrl || fallbackBadge; img.alt='badge'; img.className='w-12 h-12 object-contain rounded';
          left.appendChild(img);
          const meta = document.createElement('div');
          meta.className = 'min-w-0';
          createText(meta,'div','text-sm font-semibold', item.name || item.title || '');
          createText(meta,'div','text-xs text-gray-500', item.issuer || '');
          createText(meta,'div','text-xs text-gray-500', (item.dateEarned ? new Date(item.dateEarned).toLocaleDateString() : ''));
          left.appendChild(meta);
          li.appendChild(left);
          const right = document.createElement('div');
          const span = document.createElement('span');
          const statusText = (item.status && String(item.status)) || '';
          if (statusText.toLowerCase() === 'active') {
            span.className = 'inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 asanza-badge';
            span.textContent = 'Active';
          } else if (statusText.toLowerCase() === 'expired') {
            span.className = 'inline-block px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 asanza-badge';
            span.textContent = 'Expired';
          } else {
            span.className = 'inline-block px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 asanza-badge';
            span.textContent = statusText || 'Unknown';
          }
          right.appendChild(span);
          li.appendChild(right);
          listHolder.appendChild(li);
        }
      })();
    }

    function renderAchievements(root) {
      if (!root) return;
      let scrollContainer = root.querySelector('.flex-1.overflow-y-auto') || root.querySelector('.mt-3.flex-1.overflow-y-auto.pr-2');
      if (!scrollContainer) {
        scrollContainer = document.createElement('div');
        scrollContainer.className = 'mt-3 flex-1 overflow-y-auto pr-2';
        root.appendChild(scrollContainer);
      }
      const listHolder = scrollContainer.querySelector('ul') || (function(){ const ul=document.createElement('ul'); ul.className='space-y-3'; scrollContainer.appendChild(ul); return ul; })();
      listHolder.innerHTML = '';
      (async () => {
        const json = await fetchJson('data/achievements.json') || { achievements: [] };
        // friendly category mapping for achievements (show user-friendly labels)
        const categoryMap = {
          'learningpaths': 'Learning Path',
          'learningpath': 'Learning Path',
          'modules': 'Module',
          'module': 'Module'
        };
        function titleizeCategory(s){
          if (!s) return '';
          const lower = String(s).toLowerCase();
          if (categoryMap[lower]) return categoryMap[lower];
          // fallback: replace dashes/underscores, remove trailing plural 's', and title-case
          const cleaned = s.replace(/[-_]/g,' ').replace(/\s+$/,'').replace(/s$/i,'');
          return cleaned.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
        const items = (Array.isArray(json.achievements) ? json.achievements : []).map(a => ({
          ...a,
          imageUrl: (a.imageUrl && (a.imageUrl.startsWith('http') ? a.imageUrl : (a.imageUrl.startsWith('/') ? 'https://learn.microsoft.com/en-us' + a.imageUrl : a.imageUrl))),
          displayCategory: titleizeCategory(a.category)
        }));
        const latest = items.slice().sort((a,b) => new Date(b.grantedOn || 0) - new Date(a.grantedOn || 0)).slice(0,5);
        for (const a of latest) {
          const li = document.createElement('li'); li.className='flex items-center justify-between border p-3 rounded';
          const left = document.createElement('div'); left.className='flex items-center gap-3';
          const img = document.createElement('img'); img.src = a.imageUrl || 'assets/badge.svg'; img.alt='badge'; img.className='w-12 h-12 object-contain rounded';
          left.appendChild(img);
          const meta = document.createElement('div');
          meta.className = 'min-w-0';
          createText(meta,'div','text-sm font-semibold', a.title || '');
          createText(meta,'div','text-xs text-gray-500', a.displayCategory || '');
          createText(meta,'div','text-xs text-gray-500', (a.grantedOn ? new Date(a.grantedOn).toLocaleDateString() : ''));
          left.appendChild(meta);
          li.appendChild(left);
          const right = document.createElement('div');
          const span = document.createElement('span'); span.className='inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 asanza-badge'; span.textContent = 'Completed';
          right.appendChild(span);
          li.appendChild(right);
          listHolder.appendChild(li);
        }
      })();
    }

    function runFallbacks(){
      if (typeof window.Alpine === 'undefined') {
        renderCertifications(document.getElementById('certifications-root'));
        renderAchievements(document.getElementById('achievements-root'));
      }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runFallbacks); else runFallbacks();
  })();

  // Simple header/mobile menu toggle replacement for Alpine
  (function(){
    function setOpenState(header, btn, menu, isOpen) {
      if (!header || !btn || !menu) return;
      if (isOpen) {
        header.setAttribute('data-open','true');
        btn.setAttribute('aria-expanded','true');
        menu.style.display = '';
        const svgs = btn.querySelectorAll('svg'); if (svgs[0]) svgs[0].style.display = 'none'; if (svgs[1]) svgs[1].style.display = '';
      } else {
        header.removeAttribute('data-open');
        btn.setAttribute('aria-expanded','false');
        menu.style.display = 'none';
        const svgs = btn.querySelectorAll('svg'); if (svgs[0]) svgs[0].style.display = ''; if (svgs[1]) svgs[1].style.display = 'none';
      }
    }
    function init(){
      const header = document.querySelector('header[x-data]');
      if (!header) return;
      const btn = header.querySelector('button[aria-expanded]');
      const menu = header.querySelector('div[x-show]');
      if (!btn || !menu) return;
      setOpenState(header, btn, menu, false);
      btn.addEventListener('click', function(){ const isOpen = header.getAttribute('data-open') === 'true'; setOpenState(header, btn, menu, !isOpen); });
      window.__asanza_setMenuOpen = function(v){ setOpenState(header, btn, menu, !!v); };
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  })();

})();
