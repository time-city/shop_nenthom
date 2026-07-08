# TODO - Admin Hybrid Light (Sidebar Dark)

## Step 1: Audit & plan
- [x] Read current admin layout CSS in `src/app/globals.css` (sidebar/header/card/table already mostly light)
- [x] Read `DetailOrderAdmin` to identify remaining hardcoded dark/light classes

## Step 2: Implement theme fixes (step-by-step)
- [x] Update `src/components/admin/order/detailOrderAdmin.tsx`:
  - [x] Convert hardcoded `text-white`, `bg-black/20`, `border-white/*`, `text-white/50`, etc. to dark text / light card styles
  - [x] Ensure tables + timeline sections use readable colors on `#F5F0E8` background


## Step 3: Verify (after code change)
- [ ] Run dev/build minimally to catch TS/compile errors (no repeated `npm run build`)
- [ ] Manually check in browser:
  - [ ] Header + main content background/be colors
  - [ ] Sidebar remains dark
  - [ ] Detail order page readability (customer/payment/products/timeline)

