document.addEventListener('alpine:init', () => {
  Alpine.data('achievementsApp', () => ({
    achievements: [],
    totalCount: 0,
    q: '',
    filter: '',
    loading: true,
    error: '',
    async init() {
      this.loading = true;
      this.error = '';
      try {
        const res = await fetch('data/achievements.json');
        if (!res.ok) throw new Error('Failed to fetch achievements.json');
        const json = await res.json();
        const items = (json.achievements || []).map(a => ({
          ...a,
          imageUrl: this.buildAchievementUrl(a.imageUrl),
          detailsUrl: this.buildDetailsUrl(a.url)
        }));
        this.achievements = items;
        this.totalCount = json.totalCount || this.achievements.length;
      } catch (e) {
        console.warn('Could not load achievements:', e);
        this.achievements = [];
        this.totalCount = 0;
        this.error = 'Unable to load achievements.';
      } finally {
        this.loading = false;
      }
    },
    normalizeUrl(u) {
      if (!u) return u;
      return u.startsWith('/') ? u.slice(1) : u;
    },
    buildAchievementUrl(u) {
      if (!u) return undefined;
      if (u.startsWith('http://') || u.startsWith('https://')) return u;
      if (u.startsWith('/')) return `https://learn.microsoft.com/en-us${u}`;
      return u;
    },
    buildDetailsUrl(u) {
      if (!u) return undefined;
      if (u.startsWith('http://') || u.startsWith('https://')) return u;
      const path = u.startsWith('/') ? u : `/${u}`;
      return `https://learn.microsoft.com/en-us${path}`;
    },
    get latest() {
      try {
        return (this.achievements || []).slice().sort((a,b) => new Date(b.grantedOn || 0) - new Date(a.grantedOn || 0)).slice(0,5);
      } catch (e) { return this.achievements || []; }
    },
    displayCategory(cat) {
      if (!cat) return '';
      const key = cat.toLowerCase();
      if (key === 'learningpaths' || key === 'learningpath') return 'Learning Path';
      if (key === 'modules' || key === 'module') return 'Module';
      return cat.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    formatDate(d) {
      if (!d) return '';
      try { return new Date(d).toLocaleDateString(); } catch (e) { return d; }
    },
    timeAgo(d) {
      if (!d) return '';
      try {
        const then = new Date(d);
        const now = new Date();
        const diff = now - then;
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        const month = 30 * day;
        const year = 365 * day;
        if (diff < day) {
          const hrs = Math.floor(diff / hour) || 1;
          return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
        }
        if (diff < month) {
          const days = Math.floor(diff / day);
          return `${days} day${days === 1 ? '' : 's'} ago`;
        }
        if (diff < year) {
          const months = Math.floor(diff / month);
          return `${months} month${months === 1 ? '' : 's'} ago`;
        }
        return null;
      } catch (e) { return null; }
    },
    formatCompleted(d) {
      const rel = this.timeAgo(d);
      if (rel) return `Completed ${rel}`;
      return this.formatDate(d);
    }
  }));

  Alpine.data('certificationsApp', () => ({
    certifications: [],
    loading: true,
    error: '',
    async init() {
      this.loading = true;
      this.error = '';
      try {
        const tryFetchAny = async (paths) => {
          let lastErr = null;
          for (const p of paths) {
            try {
              const res = await fetch(p);
              if (!res.ok) throw new Error(`HTTP ${res.status} for ${p}`);
              return await res.json();
            } catch (err) {
              console.debug('fetch failed for', p, err);
              lastErr = err;
            }
          }
          throw lastErr || new Error('All fetch attempts failed');
        };

        const msPaths = ['data/ms-certifications.json', './data/ms-certifications.json', 'data/ms-certifications.json'];
        const otherPaths = ['data/other-certifications.json', './data/other-certifications.json', 'data/other-certifications.json'];

        let msJson = null;
        let otherJson = null;
        try { msJson = await tryFetchAny(msPaths); } catch (e) { console.debug('ms-certifications not found', e); }
        try { otherJson = await tryFetchAny(otherPaths); } catch (e) { console.debug('other-certifications not found', e); }

        const fallbackBadge = 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-general-badge.svg';

        const msItems = (msJson && Array.isArray(msJson.certifications) ? msJson.certifications : []).map(c => {
          const issuer = 'Microsoft';
          const rawIcon = c.iconUrl || '';
          const icon = rawIcon ? this.buildIconUrl(rawIcon) : fallbackBadge;
          return {
            ...c,
            issuer,
            iconUrl: icon,
            certificationURL: this.buildLearnUrl(c.certificationURL),
            _source: 'ms'
          };
        });

        const otherItems = (otherJson && Array.isArray(otherJson.certifications) ? otherJson.certifications : []).map(c => {
          const issuer = c.issuer || 'Other';
          let icon = c.iconUrl ? (c.iconUrl.startsWith('/') ? c.iconUrl.slice(1) : c.iconUrl) : '';
          if (issuer === 'Sitecore') {
            icon = 'assets/sitecore.png';
          }
          return {
            ...c,
            issuer,
            iconUrl: icon || undefined,
            certificationURL: this.normalizeUrl(c.certificationURL),
            _source: 'other'
          };
        });

        const merged = [...msItems, ...otherItems].map(item => {
          if (!item.iconUrl) item.iconUrl = fallbackBadge;
          return item;
        });

        this.certifications = merged.slice().sort((a,b) => new Date(b.dateEarned || 0) - new Date(a.dateEarned || 0)).slice(0,5);
      } catch (e) {
        console.warn('Could not load certifications:', e);
        this.certifications = [];
        this.error = `Unable to load certifications. ${e && e.message ? e.message : ''}`;
      } finally {
        this.loading = false;
      }
    },
    normalizeUrl(u) { if (!u) return u; return u.startsWith('/') ? u.slice(1) : u; },
    buildLearnUrl(u) { if (!u) return undefined; if (u.startsWith('http://') || u.startsWith('https://')) return u; const path = u.startsWith('/') ? u : `/${u}`; return `https://learn.microsoft.com/en-us${path}`; },
    buildIconUrl(u) { if (!u) return u; if (u.startsWith('/media/')) return `https://learn.microsoft.com/en-us${u}`; return u.startsWith('/') ? u.slice(1) : u; },
    timeAgo(d) {
      if (!d) return '';
      try {
        const then = new Date(d);
        const now = new Date();
        const diff = now - then;
        const minute = 60 * 1000; const hour = 60 * minute; const day = 24 * hour; const month = 30 * day; const year = 365 * day;
        if (diff < day) { const hrs = Math.floor(diff / hour) || 1; return `${hrs} hour${hrs === 1 ? '' : 's'} ago`; }
        if (diff < month) { const days = Math.floor(diff / day); return `${days} day${days === 1 ? '' : 's'} ago`; }
        if (diff < year) { const months = Math.floor(diff / month); return `${months} month${months === 1 ? '' : 's'} ago`; }
        return null;
      } catch (e) { return null; }
    },
    formatIssued(d) { const rel = this.timeAgo(d); if (rel) return `Issued ${rel}`; return this.formatDate(d); },
    get latest() { try { return (this.certifications || []).slice().sort((a,b) => new Date(b.dateEarned) - new Date(a.dateEarned)).slice(0,5); } catch (e) { return this.certifications || []; } },
    formatDate(d) { if (!d) return ''; try { return new Date(d).toLocaleDateString(undefined, {year:'numeric', month:'long', day:'numeric'}); } catch(e) { return d; } }
  }));

});

// Improve mobile anchor behavior: close mobile menu first then scroll
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header[x-data]');
  if (!header) return;

  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

  header.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (ev) {
      const href = this.getAttribute('href');
      if (!href || !href.startsWith('#') || !isMobile()) return;
      ev.preventDefault();

      // Close Alpine mobile menu if available
      try {
        if (header.__x && header.__x.$data && typeof header.__x.$data.open !== 'undefined') {
          header.__x.$data.open = false;
        }
      } catch (e) { /* ignore */ }

      // Wait for menu collapse then scroll to target smoothly
      setTimeout(() => {
        const targetEl = document.querySelector(href);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Update the hash without jumping
          try { history.replaceState(null, '', href); } catch (e) { location.hash = href; }
        }
      }, 220);
    });
  });
});

// Contact form: submit via AJAX to Formspree
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('my-form');
  if (!form) return;
  const status = document.getElementById('my-form-status');
  const btn = document.getElementById('my-form-button');

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!form.action) return;
    status.textContent = '';
    btn.disabled = true;

    const fd = new FormData(form);
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        status.className = 'text-sm mt-2 text-green-600';
        status.textContent = 'Thanks — your message has been sent.';
        form.reset();
      } else {
        let msg = 'Oops! There was a problem submitting the form.';
        try { const json = await res.json(); if (json && json.error) msg = json.error; } catch(e) {}
        status.className = 'text-sm mt-2 text-red-600';
        status.textContent = msg;
      }
    } catch (err) {
      status.className = 'text-sm mt-2 text-red-600';
      status.textContent = 'Network error. Please try again later.';
    } finally {
      btn.disabled = false;
    }
  });
});
