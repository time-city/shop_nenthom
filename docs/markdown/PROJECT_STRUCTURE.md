# ChamCham Studio & ChamCham - Project Structure

## 🎨 Two Projects Created

### Project 1: ChamCham (Light Luxury Candles - Vietnamese)
**Theme:** Ultra-minimalist light luxury aesthetic with natural color palette

**Pages:**
- `index.html` - Shop & 3D Candle Configurator
- `about-lumiere.html` - Story & Craftsmanship
- `contact-lumiere.html` - Contact & FAQ

**Modular CSS Files (8 files):**
- `css/global.css` - Global reset, typography, base styles
- `css/header.css` - Navigation styling
- `css/hero.css` - Hero section, buttons
- `css/candle.css` - 3D candle animations, flame effects
- `css/configurator.css` - Customization panel, color picker, preview
- `css/features.css` - Benefits/features grid
- `css/footer.css` - Footer styling

**Modular JS Files (4 files):**
- `js/state.js` - State management, prices config
- `js/utils.js` - Helper functions (color shading)
- `js/ui-controls.js` - Event handlers for customization
- `js/main.js` - [Reserved for initialization if needed]

**Features:**
✅ Real-time 3D candle preview with animated flame
✅ 6 scent options, 6 wax colors, 3 sizes, 3 packaging options
✅ Live price calculation
✅ Vietnamese language
✅ Fully responsive design

---

### Project 2: ChamCham Studio (Ultra-Minimalist Luxury - English)
**Theme:** Deep black background, maroon accents, gold typography

**Pages:**
- `index.html` - Shop with split-screen 3D configurator
- `about.html` - About us with team/values
- `contact.html` - Contact form + FAQ

**CSS:** Tailwind CDN + `css/style.css` (custom utilities)
**JS:** `js/main.js` - Three.js 3D scene setup with orbit controls

**Features:**
✅ Three.js 3D candle model with real-time material updates
✅ MeshPhysicalMaterial with glass transparency
✅ OrbitControls for interactive 3D rotation
✅ Frosted/clear glass, 6 wax colors, gold lid option
✅ localStorage persistence for customization

---

## 📁 Project Directory Structure

```
/Users/admin/nen_thom/
├── index.html                 [ChamCham - Main Shop]
├── about-lumiere.html         [ChamCham - About Page]
├── contact-lumiere.html       [ChamCham - Contact Page]
│
├── css/
│   ├── global.css            [Global reset & typography]
│   ├── header.css            [Navigation]
│   ├── hero.css              [Hero section & buttons]
│   ├── candle.css            [3D animations, flame]
│   ├── configurator.css      [Customizer panel, colors]
│   ├── features.css          [Benefits cards]
│   ├── footer.css            [Footer]
│   └── style.css             [ChamCham custom styles]
│
├── js/
│   ├── state.js              [State & pricing]
│   ├── utils.js              [Color utilities]
│   ├── ui-controls.js        [Event handlers]
│   └── main.js               [Three.js scenes]
│
├── images/                   [Product images folder]
│
└── [ChamCham pages]
    ├── contact.html
    └── about.html
```

---

## 🚀 Getting Started

### ChamCham (index.html)
1. Open `index.html` in browser
2. Uses modular CSS files (separate imports for each component)
3. JS loads: state.js → utils.js → ui-controls.js
4. Configurator is fully functional with live preview

### ChamCham Studio
1. Open `index.html` (different project, different styling)
2. Uses Tailwind CDN + custom CSS
3. Three.js 3D scene in right panel
4. Left panel controls for real-time updates

---

## 🎯 Key Implementation Details

### ChamCham
- **Color Scheme:** Cream (#FAF8F5), Dark Brown (#1a1814), Tan (#8B7355)
- **Typography:** Cormorant Garamond (serif), DM Sans (sans-serif)
- **Animations:** Floating candle, flickering flame, glowing effects
- **State Management:** Plain JavaScript object with localStorage support

### ChamCham Studio
- **Color Scheme:** Black (#000000), Maroon (#5C2D2B), Gold (#D4AF37)
- **Typography:** Playfair Display (serif), Montserrat (sans-serif)
- **3D Engine:** Three.js r128 with OrbitControls
- **Materials:** MeshPhysicalMaterial with transmission/roughness for glass

---

## ✨ Navigation Structure

### ChamCham Internal Links:
- index.html → [Bộ sưu tập - active]
- index.html → about-lumiere.html [Câu chuyện]
- index.html → contact-lumiere.html [Liên hệ]

### ChamCham Internal Links:
- index.html → [Shop - active]
- index.html → about.html [About]
- index.html → contact.html [Contact]

---

## 📝 Notes

✅ **Complete Separation:** Both projects are independent with their own styling
✅ **Modular Architecture:** CSS & JS split for maintainability
✅ **Responsive Design:** Both projects work on all screen sizes
✅ **Zero Dependencies:** Pure HTML/CSS/JS (except CDN libraries)
✅ **Production Ready:** All files optimized and organized

---

**Last Updated:** April 28, 2026
**Status:** ✅ Complete & Ready to Deploy
