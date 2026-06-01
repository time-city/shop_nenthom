// ============================================
// ChamCham - Color Utilities
// ============================================

function shadeHex(hex, pct) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    
    r = Math.min(255, Math.max(0, r + pct));
    g = Math.min(255, Math.max(0, g + pct));
    b = Math.min(255, Math.max(0, b + pct));
    
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}
