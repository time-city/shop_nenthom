# The Scent Lab - Quick Start Guide

## 📂 File Structure Overview

```
Project Root: /Users/admin/nen_thom/
│
├── 📄 index.html              ← START HERE (Main entry point)
├── 📄 README.md               (Full documentation)
├── 📄 QUICKSTART.md           (This file)
│
├── 📁 css/                    (7 modular stylesheets)
│   ├── global.css             (Reset, animations, responsive)
│   ├── header.css             (Logo, nav, icons)
│   ├── left-panel.css         (Steps, buttons, swatches)
│   ├── canvas.css             (3D container)
│   ├── bottom-bar.css         (Price, CTA)
│   ├── auth.css               (Login/Register panel)
│   └── cart.css               (Cart drawer)
│
└── 📁 js/                     (6 modular scripts)
    ├── state.js               (State & pricing logic)
    ├── three-scene.js         (3D candle model)
    ├── ui-controls.js         (Panel interactions)
    ├── modals.js              (Popups & drawers)
    ├── cart.js                (Shopping cart)
    └── init.js                (Startup)
```

## 🚀 Getting Started

### Step 1: Open in Browser
```bash
# Simply open in any modern browser:
# - Chrome/Edge/Firefox/Safari
# - Local or hosted server
open index.html
```

### Step 2: No Installation Required
✅ Works immediately in browser
✅ All dependencies via CDN
✅ No build step needed
✅ No npm/node required

## 🎮 How to Interact

### Left Panel (Customization)
- **Step 1**: Click jar type buttons → 3D updates instantly
- **Step 2**: Click color swatches → Wax color changes
- **Step 3**: Click scent buttons → Price updates
- **Step 4**: Click lid buttons → 3D regenerates

### 3D Canvas (Right Panel)
- **Left-click + Drag**: Rotate candle
- **Mouse Wheel**: Zoom in/out
- **Right-click + Drag**: Pan view
- Auto-rotates when idle

### Bottom Bar
- Shows current total price
- Updates with every customization
- "Add to Cart" button

### Header
- **Profile Icon**: Opens login/register
- **Cart Icon**: Shows cart drawer
  - Badge shows item count
  - Click to open cart

## 💡 Key Features

### Real-Time 3D Updates
```
User selects color → JavaScript updates state → Three.js re-renders → UI reflects change
```

### Data Persistence
- Configuration auto-saves to `localStorage`
- Survives page refresh
- Check browser console: `JSON.parse(localStorage.getItem('scentLabConfig'))`

### Modular CSS
- 7 separate files for easy maintenance
- Each module handles one component
- Easy to add new features

### Modular JavaScript
- 6 separate files following separation of concerns
- Easy to debug
- Easy to extend

## 🎨 Customization Examples

### Change Gold Color
Edit `css/header.css` and `css/auth.css`:
```css
color: #FFD700;  /* Replace #D4AF37 */
```

### Adjust Layout Split
Edit `css/left-panel.css` and `css/canvas.css`:
```css
#left-panel { width: 40%; }  /* was 35% */
#canvas-container { width: 60%; }  /* was 65% */
```

### Add New Scent
Edit `js/state.js`:
```javascript
scent: {
    gardenia: 8,
    vanilla: 15,  // NEW
}
```

Edit `index.html`:
```html
<button class="btn-option" data-scent="vanilla">Vanilla</button>
```

## 🐛 Troubleshooting

### 3D Canvas is Black/Not Rendering
- Check browser console for errors
- Ensure Three.js CDN is loading (check Network tab)
- Clear cache and reload

### Styles Not Applying
- Check CSS file paths are correct
- Ensure all `<link>` tags in `index.html` are present
- Check browser developer tools (F12) for 404s

### Buttons Not Working
- Open browser console (F12)
- Check for JavaScript errors
- Verify all `<script>` tags are in correct order

### localStorage Not Working
- Check if running on localhost or HTTPS
- Private/Incognito mode may have restricted localStorage
- Check browser privacy settings

## 📊 Browser DevTools Tips

### Check State
```javascript
// In console:
console.log(state);
console.log(localStorage.getItem('scentLabConfig'));
```

### Test Price Calculation
```javascript
// In console:
calculatePrice();  // Returns current total
```

### Debug 3D Scene
```javascript
// In console:
console.log(scene);
console.log(camera);
console.log(renderer);
```

## 🎯 Performance Notes

- Uses `requestAnimationFrame` for smooth 60fps
- Efficient material switching (no geometry recreation)
- Auto-damping on OrbitControls
- Debounced window resize events

## 📱 Mobile Support

- Responsive layout (stacks vertically on small screens)
- Touch-friendly buttons
- Canvas scales to container size
- Tap to activate controls

## 🔐 Security Considerations

- No sensitive data stored (cart/user data in localStorage only)
- All third-party CDNs are reputable
- No external API calls by default
- Ready for backend integration

## 🚀 Deployment

### Simple Web Server (Python)
```bash
cd /Users/admin/nen_thom
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Simple Web Server (Node.js)
```bash
npm install -g http-server
cd /Users/admin/nen_thom
http-server
```

### Netlify Deploy
- Drag folder to netlify.com
- Instant deployment
- Automatic HTTPS

### Vercel Deploy
```bash
npm i -g vercel
vercel /Users/admin/nen_thom
```

## 📚 Code Navigation

### To Add a New Feature
1. Create new CSS in `css/` folder
2. Import in `index.html`
3. Create HTML in `index.html`
4. Add JavaScript in `js/` folder
5. Import script in `index.html`
6. Test in browser

### To Debug
1. Open `index.html` in browser
2. Press F12 to open DevTools
3. Check Console tab for errors
4. Use debugger breakpoints
5. Check Network tab for CDN issues

## 🎓 Learning Resources

- **Three.js**: https://threejs.org/docs/
- **OrbitControls**: https://threejs.org/examples/misc_controls_orbit.html
- **Tailwind CSS**: https://tailwindcss.com/docs
- **localStorage API**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

## 📞 Support

For issues or questions:
1. Check browser console (F12)
2. Review README.md
3. Check QUICKSTART.md (this file)
4. Review relevant JS file comments
5. Check CSS file for styling issues

---

**Happy customizing! 🕯️✨**
