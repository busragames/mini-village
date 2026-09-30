// Drawings for tiles and buildings, as SVG. Every tile is 64 x 64.
const Sprites = {
  // Always the same "random" number for the same seed, so the map does not flicker
  random(seed) {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  },

  grass(seed) {
    const shades = ["#2f6b45", "#326f48", "#2c6642"];
    let svg = `<rect x="-0.5" y="-0.5" width="65" height="65" fill="${shades[Math.floor(this.random(seed) * 3)]}"/>`;
    for (let i = 0; i < 5; i++) {
      const x = 6 + this.random(seed + i * 7) * 52;
      const y = 8 + this.random(seed + i * 13) * 50;
      svg += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l2 -5 l2 5" stroke="#4a8f5f" fill="none" stroke-width="1.2"/>`;
    }
    if (this.random(seed + 99) > 0.6) {
      const x = 10 + this.random(seed + 5) * 44, y = 10 + this.random(seed + 6) * 44;
      svg += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="1.8" fill="#f3ecd8"/>`;
    }
    return svg;
  },

  terrain(tile) {
    const seed = tile.y * 20 + tile.x + 1;
    switch (tile.terrain) {
      case "water":
        return `<rect x="-0.5" y="-0.5" width="65" height="65" fill="#2c5f86"/>
          <path d="M8 20 q6 -4 12 0 t12 0" stroke="#5b92bb" fill="none" stroke-width="2" class="wave"/>
          <path d="M30 44 q6 -4 12 0 t12 0" stroke="#5b92bb" fill="none" stroke-width="2" class="wave"/>`;
      case "forest": {
        let svg = `<rect x="-0.5" y="-0.5" width="65" height="65" fill="#24553a"/>`;
        const trees = [[18, 30], [44, 26], [30, 54], [52, 56], [12, 58]];
        for (const [x, y] of trees) {
          svg += `<rect x="${x - 2}" y="${y - 6}" width="4" height="7" fill="#5a3b22"/>
            <polygon points="${x - 11},${y - 5} ${x},${y - 28} ${x + 11},${y - 5}" fill="#1b4430"/>
            <polygon points="${x - 8},${y - 14} ${x},${y - 32} ${x + 8},${y - 14}" fill="#23573b"/>`;
        }
        return svg;
      }
      case "rock":
        return this.grass(seed) + `<ellipse cx="28" cy="38" rx="17" ry="12" fill="#7d8088"/>
          <ellipse cx="24" cy="34" rx="10" ry="6" fill="#9a9ea6"/>
          <ellipse cx="46" cy="48" rx="9" ry="7" fill="#6f727a"/>`;
      case "glade":
        return `<rect x="-0.5" y="-0.5" width="65" height="65" fill="#3d7a4e"/>
          <circle cx="32" cy="34" r="22" fill="none" stroke="#e6b84f" stroke-width="1.5" stroke-dasharray="3 4" opacity="0.8"/>
          ${[[12, 18], [52, 16], [10, 50], [54, 52], [32, 8]].map(([x, y]) =>
            `<rect x="${x - 1}" y="${y}" width="2" height="4" fill="#f3ecd8"/><ellipse cx="${x}" cy="${y}" rx="4" ry="2.5" fill="#c9503f"/>`).join("")}`;
      default:
        return this.grass(seed);
    }
  },

  building(id) {
    switch (id) {
      case "grove":
        return `<g transform="translate(32,52) scale(1.4)">
          <ellipse cx="0" cy="1" rx="15" ry="3" fill="#000" opacity="0.2"/>
          <ellipse cx="0" cy="-8" rx="14" ry="10" fill="#2f7a4f"/>
          <ellipse cx="-7" cy="-12" rx="8" ry="7" fill="#3c9460"/>
          <circle cx="-5" cy="-9" r="2.3" fill="#6b7cff"/><circle cx="4" cy="-12" r="2.3" fill="#6b7cff"/>
          <circle cx="6" cy="-5" r="2.3" fill="#8a5cf6"/><circle cx="-1" cy="-4" r="2.3" fill="#6b7cff"/></g>`;
      case "lodge":
        return `<g transform="translate(30,54) scale(1.25)">
          <ellipse cx="2" cy="1" rx="18" ry="3" fill="#000" opacity="0.2"/>
          <rect x="-13" y="-18" width="26" height="18" fill="#7a5130"/>
          <polygon points="-17,-17 0,-31 17,-17" fill="#4d8a52"/>
          <rect x="-3" y="-10" width="6" height="10" fill="#e6b84f" class="glow"/>
          <rect x="15" y="-6" width="10" height="6" rx="2" fill="#a8733f"/></g>`;
      case "treehouse":
        return `<g transform="translate(32,60) scale(0.95)">
          <ellipse cx="0" cy="0" rx="14" ry="3" fill="#000" opacity="0.2"/>
          <rect x="-4" y="-46" width="8" height="46" fill="#6b4526"/>
          <ellipse cx="0" cy="-50" rx="24" ry="12" fill="#2c6b45"/>
          <rect x="-12" y="-40" width="24" height="14" fill="#9c6b3f"/>
          <polygon points="-15,-39 0,-50 15,-39" fill="#b8843f"/>
          <rect x="-3" y="-36" width="6" height="6" fill="#f2d27a" class="glow"/></g>`;
      case "well":
        return `<g transform="translate(32,48) scale(1.4)">
          <circle cx="0" cy="-10" r="14" fill="#9fc4e8" opacity="0.2" class="aura"/>
          <ellipse cx="0" cy="-5" rx="13" ry="6" fill="#8b8f99"/>
          <ellipse cx="0" cy="-7" rx="9" ry="3.5" fill="#bfe3ff" class="glow"/>
          <rect x="-12" y="-7" width="24" height="7" fill="#737884"/></g>`;
      case "worldtree":
        return `<g>
          <circle cx="32" cy="10" r="46" fill="#e6b84f" opacity="0.2" class="aura"/>
          <path d="M26 62 Q28 30 22 14 L42 14 Q36 30 38 62 Z" fill="#5a3b22"/>
          <ellipse cx="32" cy="0" rx="40" ry="24" fill="#e6b84f"/>
          <ellipse cx="12" cy="10" rx="20" ry="14" fill="#d9a73f"/>
          <ellipse cx="52" cy="10" rx="20" ry="14" fill="#d9a73f"/></g>`;
      default:
        return "";
    }
  }
};
