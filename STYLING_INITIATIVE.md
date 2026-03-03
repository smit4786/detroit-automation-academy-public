# 🌐 Automated Technologies - Focused Styling Initiative (ATSI)

**Status:** Draft / Implementation Started  
**Owner:** CTO / Design Team  
**Date:** March 1, 2026

---

## 🎨 Design Philosophy
Our goal is to create a unified visual language across all @AutomatedTechnologies platforms (Blog, CRM, Diary, Infrastructure, @AT_Wealth) that conveys:
1. **Precision & Automation:** Clean lines and geometric patterns.
2. **Trust & Stability:** Deep blues and slate grays.
3. **Innovation & Clarity:** High-contrast typography and minimalist white space.

---

## 🎨 Core Color Palette

### Primary Colors
- **AT Blue (`#0066CC`)**: The core brand color, representing intelligence and connectivity.
- **AT Slate (`#2C3E50`)**: For headers, footers, and foundational blocks.
- **AT Silver (`#BDC3C7`)**: For accents, borders, and modern metallic finishes.

### Surface Colors
| Mode | Background | Text (Primary) | Text (Secondary) |
|------|------------|----------------|------------------|
| **Light** | `#FFFFFF` | `#111111` | `#555555` |
| **Dark** | `#111111` | `#F4F4F4` | `#AAAAAA` |

---

## 💡 Light Mode Implementation (Hugo Blog)

We are introducing a dynamic light/dark mode for the **Automated Insights Blog**. This ensures accessibility and user preference while maintaining brand integrity.

### CSS Variable Mapping
```css
:root {
  --at-primary: #0066CC;
  --at-surface: #FFFFFF;
  --at-text: #111111;
  --at-text-muted: #555555;
}

[data-theme='dark'] {
  --at-surface: #111111;
  --at-text: #F4F4F4;
  --at-text-muted: #AAAAAA;
}
```

---

## 📑 Next Steps
1. [x] Implement `custom.css` in `blog-source/static/css/`.
2. [x] Add Theme Toggle to Hugo `site-navigation.html`.
3. [x] Audit CRM and `@AT_Diary` for alignment with AT Blue.
4. [x] Unify ecosystem theme tracking with `daa-theme` local storage key.
5. [x] Standardize header/footer across all DAA public pages (Site Parity).
6. [ ] Create reusable React/Swift UI components for the AT Design System.
