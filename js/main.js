document.addEventListener('alpine:init', () => {
  Alpine.data('achievementsApp', () => ({
    achievements: [],
    totalCount: 0,
    async init() {
      try {
        const res = await fetch('data/achievements.json');
        if (!res.ok) throw new Error('Failed to fetch achievements.json');
        const json = await res.json();
        this.achievements = json.achievements || [];
        this.totalCount = json.totalCount || this.achievements.length;
      } catch (e) {
        console.warn('Could not load achievements:', e);
        this.achievements = [];
        this.totalCount = 0;
      }
    },
    formatDate(d) {
      if (!d) return '';
      try { return new Date(d).toLocaleDateString(); } catch (e) { return d; }
    }
  }))

  
})
