# FinanceFlow

**Personal Finance Dashboard** — A modern, fully interactive frontend web application for tracking income, expenses, balances, and spending patterns.

![FinanceFlow](https://img.shields.io/badge/FinanceFlow-Personal%20Finance-10b981?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)

## Project Overview

FinanceFlow is a production-ready personal finance dashboard built entirely with vanilla web technologies. It allows users to:

- Record income and expense transactions
- Monitor total balance, income, expenses, and savings in real time
- Visualize spending patterns with interactive charts
- Set and track monthly savings goals
- Filter, search, edit, and delete transactions
- Switch between light and dark themes

All data is stored locally in the browser using `localStorage` — no backend required.

## Features

- **Dashboard**
  - Dynamic summary cards (Balance, Income, Expense, Savings)
  - Month selector to view historical data
  - Spending analytics bar chart with period filters (7 Days / 30 Days / 6 Months / 1 Year)
  - Expense-by-category doughnut chart
  - Monthly savings goal progress bar
  - Recent transactions list
  - Quick-add transaction form

- **Transactions**
  - Full transaction list with search
  - Filter by type (All / Income / Expense)
  - Filter by category
  - Sort by date or amount
  - Edit and delete with confirmation modal

- **Analytics**
  - Income vs Expense overview
  - Category breakdown chart
  - Top spending categories ranking
  - Savings rate calculation

- **Settings**
  - Profile (name & email)
  - Currency preference
  - Savings goal configuration
  - Theme switcher (Light / Dark / System)
  - Reset to demo data

- **UX & Polish**
  - Responsive design (desktop sidebar → mobile bottom navigation)
  - Collapsible sidebar
  - Global search
  - Notification panel
  - Toast notifications
  - Smooth micro-interactions
  - Empty states
  - Demo data on first launch
  - Full keyboard accessibility (Escape closes modals)

## Technologies

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling, responsive layout, dark mode |
| Vanilla JavaScript | Application logic, state, DOM |
| Chart.js (CDN) | Interactive charts |
| localStorage | Client-side persistence |
| Google Fonts (Inter) | Typography |

**No frameworks** (React, Vue, etc.) and **no backend**.

## Folder Structure

```
financeflow/
├── index.html          # Main HTML structure
├── style.css           # Complete design system & responsive styles
├── script.js           # Application logic (modular functions)
├── README.md           # This file
└── assets/
    └── icons/          # Reserved for custom icons (currently using inline SVG + emoji)
```

## How to Run

1. Clone or download this repository.
2. Open the project folder.
3. Simply open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).

No build step, no server, no dependencies to install.

```bash
# Optional: serve locally with a simple HTTP server
npx serve .
# or
python -m http.server 8000
```

Then navigate to `http://localhost:3000` (or the port shown).

## Sample Data

On first launch, FinanceFlow seeds demo transactions for October 2026 so the dashboard is immediately usable. A small “Demo data” badge appears at the bottom. Once you add, edit, or delete any transaction, the badge disappears and your data persists across refreshes.

## Color System

| Role | Color |
|------|-------|
| Primary | Dark Navy / Charcoal (`#0f172a`) |
| Accent | Emerald Green (`#10b981`) |
| Income | Green |
| Expense | Red / Coral |
| Background | Very Light Gray / Off-white |
| Cards | White |

Dark mode inverts the palette while keeping accent colors consistent.

## Future Improvements

- Export transactions to CSV / PDF
- Multi-currency conversion with live rates
- Budget limits per category with alerts
- Recurring transactions
- PWA support (installable, offline)
- Data import from bank CSV
- More chart types (line trends over months)
- User authentication (optional cloud sync)

## License

MIT License — feel free to use this project for learning, portfolios, or personal use.

---

Built with care as a portfolio-ready personal finance dashboard.
