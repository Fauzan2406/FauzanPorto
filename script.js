/* ========================================
   FinanceFlow — Main Application Script
   ======================================== */

// ---------- Constants & Categories ----------
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Other Income'];
const EXPENSE_CATEGORIES = ['Food', 'Transportation', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

const CATEGORY_ICONS = {
  Salary: '💰', Freelance: '💻', Business: '🏢', Investment: '📈', 'Other Income': '💵',
  Food: '🍔', Transportation: '🚗', Shopping: '🛍️', Bills: '📄',
  Entertainment: '🎬', Health: '🏥', Education: '📚', Other: '📦'
};

const CATEGORY_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

const STORAGE_KEYS = {
  transactions: 'financeflow_transactions',
  settings: 'financeflow_settings',
  user: 'financeflow_user',
  theme: 'financeflow_theme'
};

// ---------- State ----------
let transactions = [];
let settings = {
  savingsGoal: 10000000,
  currency: 'IDR'
};
let user = {
  name: 'Fauzan',
  email: 'example@email.com'
};
let currentMonth = new Date(2026, 9, 1); // October 2026
let currentPage = 'dashboard';
let spendingPeriod = 30;
let editId = null;
let deleteId = null;
let charts = {};
let isDemoData = true;

// ---------- Utility ----------
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function formatMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ---------- Storage ----------
function loadTransactions() {
  const raw = localStorage.getItem(STORAGE_KEYS.transactions);
  if (raw) {
    transactions = JSON.parse(raw);
    isDemoData = false;
  } else {
    seedDemoData();
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
  isDemoData = false;
  updateDemoBadge();
}

function loadSettings() {
  const raw = localStorage.getItem(STORAGE_KEYS.settings);
  if (raw) settings = { ...settings, ...JSON.parse(raw) };
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

function loadUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (raw) user = { ...user, ...JSON.parse(raw) };
}

function saveUser() {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

function seedDemoData() {
  transactions = [
    { id: '1', type: 'income', title: 'Monthly Salary', category: 'Salary', amount: 8500000, date: '2026-10-01', note: 'Monthly salary' },
    { id: '2', type: 'expense', title: 'Grocery Shopping', category: 'Food', amount: 450000, date: '2026-10-02', note: 'Weekly groceries' },
    { id: '3', type: 'expense', title: 'Grab to Office', category: 'Transportation', amount: 200000, date: '2026-10-03', note: '' },
    { id: '4', type: 'expense', title: 'New Headphones', category: 'Shopping', amount: 300000, date: '2026-10-05', note: 'Sony WH-1000XM5' },
    { id: '5', type: 'expense', title: 'Electricity Bill', category: 'Bills', amount: 200000, date: '2026-10-07', note: 'October bill' },
    { id: '6', type: 'expense', title: 'Cinema Tickets', category: 'Entertainment', amount: 100000, date: '2026-10-08', note: '' },
    { id: '7', type: 'expense', title: 'Lunch with Team', category: 'Food', amount: 150000, date: '2026-10-09', note: '' },
    { id: '8', type: 'income', title: 'Freelance Project', category: 'Freelance', amount: 1500000, date: '2026-10-10', note: 'Website redesign' },
    { id: '9', type: 'expense', title: 'Pharmacy', category: 'Health', amount: 85000, date: '2026-10-12', note: '' },
    { id: '10', type: 'expense', title: 'Online Course', category: 'Education', amount: 250000, date: '2026-10-14', note: 'JS Advanced' }
  ];
  isDemoData = true;
  localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
}

function updateDemoBadge() {
  const badge = document.getElementById('demoBadge');
  if (isDemoData) {
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ---------- Calculations ----------
function getMonthTransactions(year, month) {
  return transactions.filter(t => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

function calculateTotals(txs) {
  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;
  const savings = balance;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  return { income, expense, balance, savings, savingsRate };
}

function getCategoryExpenses(txs) {
  const map = {};
  txs.filter(t => t.type === 'expense').forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  return map;
}

function getPreviousMonthTotals() {
  const prev = new Date(currentMonth);
  prev.setMonth(prev.getMonth() - 1);
  const txs = getMonthTransactions(prev.getFullYear(), prev.getMonth());
  return calculateTotals(txs);
}

// ---------- Render Dashboard ----------
function renderDashboard() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthTxs = getMonthTransactions(year, month);
  const totals = calculateTotals(monthTxs);
  const prev = getPreviousMonthTotals();

  // Summary cards
  document.getElementById('totalBalance').textContent = formatCurrency(totals.balance);
  document.getElementById('totalIncome').textContent = formatCurrency(totals.income);
  document.getElementById('totalExpense').textContent = formatCurrency(totals.expense);
  document.getElementById('totalSavings').textContent = formatCurrency(totals.savings);

  // Changes
  const balChange = prev.balance !== 0 ? ((totals.balance - prev.balance) / Math.abs(prev.balance) * 100) : 0;
  const incChange = prev.income !== 0 ? ((totals.income - prev.income) / prev.income * 100) : 0;
  const expChange = prev.expense !== 0 ? ((totals.expense - prev.expense) / prev.expense * 100) : 0;

  const balEl = document.getElementById('balanceChange');
  balEl.textContent = `${balChange >= 0 ? '+' : ''}${balChange.toFixed(1)}% vs last month`;
  balEl.className = `card-change ${balChange >= 0 ? 'positive' : 'negative'}`;

  const incEl = document.getElementById('incomeChange');
  incEl.textContent = `${incChange >= 0 ? '+' : ''}${incChange.toFixed(1)}% vs last month`;
  incEl.className = `card-change ${incChange >= 0 ? 'positive' : 'negative'}`;

  const expEl = document.getElementById('expenseChange');
  expEl.textContent = `${expChange >= 0 ? '+' : ''}${expChange.toFixed(1)}% vs last month`;
  expEl.className = `card-change ${expChange >= 0 ? 'negative' : 'positive'}`;

  document.getElementById('savingsRate').textContent = `${totals.savingsRate.toFixed(0)}% saved this month`;

  // Month label
  document.getElementById('currentMonthLabel').textContent = formatMonthYear(currentMonth);

  // Greeting
  document.getElementById('greetingText').textContent = `${getGreeting()}, ${user.name} 👋`;
  document.getElementById('sidebarName').textContent = user.name;
  document.getElementById('sidebarAvatar').textContent = user.name.charAt(0).toUpperCase();
  document.querySelector('.user-avatar-btn .avatar').textContent = user.name.charAt(0).toUpperCase();

  // Savings goal
  renderSavingsGoal(totals.savings);

  // Charts
  renderSpendingChart(monthTxs);
  renderCategoryChart(monthTxs);

  // Recent transactions
  renderRecentTransactions(monthTxs);
}

function renderSavingsGoal(savings) {
  const goal = settings.savingsGoal || 10000000;
  const pct = goal > 0 ? Math.min((savings / goal) * 100, 100) : 0;
  document.getElementById('goalCurrent').textContent = formatCurrency(Math.max(savings, 0));
  document.getElementById('goalTarget').textContent = formatCurrency(goal);
  document.getElementById('goalProgressFill').style.width = `${pct}%`;
  document.getElementById('goalPercent').textContent = `${pct.toFixed(1)}%`;
}

function renderRecentTransactions(txs) {
  const container = document.getElementById('recentTransactions');
  const sorted = [...txs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  if (sorted.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h4>No transactions yet</h4>
        <p>Start tracking your finances by adding your first transaction.</p>
        <button class="btn btn-primary" onclick="openTransactionModal()">+ Add Transaction</button>
      </div>`;
    return;
  }

  container.innerHTML = sorted.map(t => `
    <div class="tx-item">
      <div class="tx-icon ${t.type}">${CATEGORY_ICONS[t.category] || '📦'}</div>
      <div class="tx-details">
        <div class="tx-title">${escapeHtml(t.title)}</div>
        <div class="tx-meta">${t.category} · ${formatDate(t.date)}</div>
      </div>
      <div class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Charts ----------
function renderSpendingChart(monthTxs) {
  const ctx = document.getElementById('spendingChart');
  if (!ctx) return;

  const expenseTxs = monthTxs.filter(t => t.type === 'expense');
  let labels = [];
  let data = [];

  if (spendingPeriod <= 7) {
    // Last 7 days of the month or available
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const start = Math.max(1, now.getDate() - 6);
    for (let d = start; d <= now.getDate(); d++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayDate = new Date(dateStr + 'T00:00:00');
      labels.push(days[dayDate.getDay()]);
      data.push(expenseTxs.filter(t => t.date === dateStr).reduce((s, t) => s + t.amount, 0));
    }
  } else if (spendingPeriod <= 30) {
    // Group by week or by day of month
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d += Math.ceil(daysInMonth / 10)) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      labels.push(`${d}`);
      // Sum from d to next
      const next = Math.min(d + Math.ceil(daysInMonth / 10) - 1, daysInMonth);
      let sum = 0;
      for (let i = d; i <= next; i++) {
        const ds = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        sum += expenseTxs.filter(t => t.date === ds).reduce((s, t) => s + t.amount, 0);
      }
      data.push(sum);
    }
  } else {
    // Monthly for longer periods - show current month daily aggregate simplified
    labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    data = [0, 0, 0, 0];
    expenseTxs.forEach(t => {
      const day = new Date(t.date + 'T00:00:00').getDate();
      const week = Math.min(Math.floor((day - 1) / 7), 3);
      data[week] += t.amount;
    });
  }

  if (charts.spending) charts.spending.destroy();

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  charts.spending = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Expenses',
        data,
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 0,
        borderRadius: 6,
        maxBarThickness: 36
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => formatCurrency(ctx.raw)
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 11 } }
        },
        y: {
          grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
          ticks: {
            color: isDark ? '#94a3b8' : '#64748b',
            font: { size: 11 },
            callback: v => v >= 1000000 ? (v / 1000000) + 'M' : v >= 1000 ? (v / 1000) + 'K' : v
          }
        }
      }
    }
  });
}

function renderCategoryChart(monthTxs) {
  const ctx = document.getElementById('categoryChart');
  if (!ctx) return;

  const catMap = getCategoryExpenses(monthTxs);
  const labels = Object.keys(catMap);
  const data = Object.values(catMap);
  const total = data.reduce((s, v) => s + v, 0);

  // Legend
  const legend = document.getElementById('categoryLegend');
  if (labels.length === 0) {
    legend.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;">No expense data</p>';
  } else {
    legend.innerHTML = labels.map((l, i) => `
      <div class="legend-item">
        <span class="legend-dot" style="background:${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}"></span>
        ${l} ${total > 0 ? Math.round(data[i] / total * 100) : 0}%
      </div>
    `).join('');
  }

  if (charts.category) charts.category.destroy();

  charts.category = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: data.length ? data : [1],
        backgroundColor: data.length ? labels.map((_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length]) : ['#e2e8f0'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              if (!data.length) return 'No data';
              return `${ctx.label}: ${formatCurrency(ctx.raw)}`;
            }
          }
        }
      }
    }
  });
}

// ---------- Analytics Page ----------
function renderAnalytics() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthTxs = getMonthTransactions(year, month);
  const totals = calculateTotals(monthTxs);

  document.getElementById('analyticsIncome').textContent = formatCurrency(totals.income);
  document.getElementById('analyticsExpense').textContent = formatCurrency(totals.expense);
  document.getElementById('analyticsSavings').textContent = formatCurrency(totals.savings);
  document.getElementById('analyticsRate').textContent = `${totals.savingsRate.toFixed(0)}%`;

  // Income vs Expense chart
  const ctxIE = document.getElementById('incomeExpenseChart');
  if (ctxIE) {
    if (charts.incomeExpense) charts.incomeExpense.destroy();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    charts.incomeExpense = new Chart(ctxIE, {
      type: 'bar',
      data: {
        labels: ['Income', 'Expense', 'Savings'],
        datasets: [{
          data: [totals.income, totals.expense, Math.max(totals.savings, 0)],
          backgroundColor: ['#10b981', '#ef4444', '#3b82f6'],
          borderRadius: 8,
          maxBarThickness: 60
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => formatCurrency(c.raw) } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } },
          y: {
            grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
            ticks: {
              color: isDark ? '#94a3b8' : '#64748b',
              callback: v => v >= 1000000 ? (v / 1000000) + 'M' : v >= 1000 ? (v / 1000) + 'K' : v
            }
          }
        }
      }
    });
  }

  // Category chart for analytics
  const ctxCat = document.getElementById('analyticsCategoryChart');
  if (ctxCat) {
    const catMap = getCategoryExpenses(monthTxs);
    const labels = Object.keys(catMap);
    const data = Object.values(catMap);
    if (charts.analyticsCategory) charts.analyticsCategory.destroy();
    charts.analyticsCategory = new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['No data'],
        datasets: [{
          data: data.length ? data : [1],
          backgroundColor: data.length ? labels.map((_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length]) : ['#e2e8f0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
          tooltip: { callbacks: { label: c => data.length ? `${c.label}: ${formatCurrency(c.raw)}` : 'No data' } }
        }
      }
    });
  }

  // Top spending
  const catMap = getCategoryExpenses(monthTxs);
  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalExp = Object.values(catMap).reduce((s, v) => s + v, 0);
  const list = document.getElementById('topSpendingList');

  if (sorted.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div><h4>No spending data</h4><p>Add expense transactions to see insights.</p></div>`;
  } else {
    list.innerHTML = sorted.map(([cat, amount]) => `
      <div class="top-spend-item">
        <div class="top-spend-icon">${CATEGORY_ICONS[cat] || '📦'}</div>
        <div class="top-spend-info">
          <div class="top-spend-name">${cat}</div>
          <div class="top-spend-pct">${totalExp > 0 ? Math.round(amount / totalExp * 100) : 0}% of total expenses</div>
        </div>
        <div class="top-spend-amount">${formatCurrency(amount)}</div>
      </div>
    `).join('');
  }
}

// ---------- Transactions Page ----------
function renderTransactionsPage() {
  const search = document.getElementById('txSearch').value.toLowerCase();
  const filter = document.querySelector('.filter-tab.active')?.dataset.filter || 'all';
  const catFilter = document.getElementById('txCategoryFilter').value;
  const sort = document.getElementById('txSort').value;

  let filtered = [...transactions];

  if (filter !== 'all') filtered = filtered.filter(t => t.type === filter);
  if (catFilter) filtered = filtered.filter(t => t.category === catFilter);
  if (search) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(search) ||
      t.category.toLowerCase().includes(search) ||
      (t.note && t.note.toLowerCase().includes(search))
    );
  }

  switch (sort) {
    case 'newest': filtered.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
    case 'oldest': filtered.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
    case 'amount-high': filtered.sort((a, b) => b.amount - a.amount); break;
    case 'amount-low': filtered.sort((a, b) => a.amount - b.amount); break;
  }

  const tbody = document.getElementById('transactionsBody');
  const empty = document.getElementById('txEmptyState');
  const table = document.getElementById('transactionsTable');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    table.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  table.style.display = 'table';
  empty.style.display = 'none';

  tbody.innerHTML = filtered.map(t => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:1.2rem;">${CATEGORY_ICONS[t.category] || '📦'}</span>
          <div>
            <div style="font-weight:550;">${escapeHtml(t.title)}</div>
            ${t.note ? `<div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(t.note)}</div>` : ''}
          </div>
        </div>
      </td>
      <td>${t.category}</td>
      <td>${formatDate(t.date)}</td>
      <td class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</td>
      <td>
        <div class="tx-actions">
          <button class="action-btn" onclick="openEditModal('${t.id}')" aria-label="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn delete" onclick="openDeleteModal('${t.id}')" aria-label="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function populateCategoryFilters() {
  const allCats = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  const selects = [
    document.getElementById('txCategoryFilter'),
    document.getElementById('txCategory'),
    document.getElementById('qaCategory')
  ];
  selects.forEach(sel => {
    if (!sel) return;
    const isFilter = sel.id === 'txCategoryFilter';
    const current = sel.value;
    sel.innerHTML = isFilter
      ? '<option value="">All Categories</option>'
      : '<option value="">Select Category</option>';
    // For modal/quick add we populate based on type later
    if (isFilter) {
      allCats.forEach(c => {
        sel.innerHTML += `<option value="${c}">${c}</option>`;
      });
    }
    if (current) sel.value = current;
  });
}

function populateCategorySelect(selectEl, type) {
  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  selectEl.innerHTML = '<option value="">Select Category</option>';
  cats.forEach(c => {
    selectEl.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

// ---------- Modal ----------
function openTransactionModal(edit = false) {
  const modal = document.getElementById('transactionModal');
  document.getElementById('modalTitle').textContent = edit ? 'Edit Transaction' : 'Add Transaction';
  document.getElementById('modalSubmit').textContent = edit ? 'Save Changes' : 'Add Transaction';
  if (!edit) {
    document.getElementById('transactionForm').reset();
    document.getElementById('editId').value = '';
    editId = null;
    // Default to expense
    setModalType('expense');
    // Default date to today (within current month view)
    const today = new Date();
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(Math.min(today.getDate(), 28)).padStart(2, '0');
    document.getElementById('txDate').value = `${y}-${m}-${d}`;
  }
  modal.classList.add('open');
  document.getElementById('txTitle').focus();
}

function closeTransactionModal() {
  document.getElementById('transactionModal').classList.remove('open');
  editId = null;
}

function setModalType(type) {
  document.querySelectorAll('#transactionModal .type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
  populateCategorySelect(document.getElementById('txCategory'), type);
}

function openEditModal(id) {
  const t = transactions.find(tx => tx.id === id);
  if (!t) return;
  editId = id;
  document.getElementById('editId').value = id;
  setModalType(t.type);
  document.getElementById('txTitle').value = t.title;
  document.getElementById('txAmount').value = t.amount;
  document.getElementById('txCategory').value = t.category;
  document.getElementById('txDate').value = t.date;
  document.getElementById('txNote').value = t.note || '';
  openTransactionModal(true);
}

function openDeleteModal(id) {
  deleteId = id;
  document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('open');
  deleteId = null;
}

// ---------- CRUD ----------
function addTransaction(data) {
  const tx = {
    id: generateId(),
    type: data.type,
    title: data.title,
    category: data.category,
    amount: Number(data.amount),
    date: data.date,
    note: data.note || ''
  };
  transactions.push(tx);
  saveTransactions();
  refreshAll();
  showToast('✓ Transaction added successfully');
}

function editTransaction(id, data) {
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return;
  transactions[idx] = {
    ...transactions[idx],
    type: data.type,
    title: data.title,
    category: data.category,
    amount: Number(data.amount),
    date: data.date,
    note: data.note || ''
  };
  saveTransactions();
  refreshAll();
  showToast('✓ Transaction updated successfully');
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  refreshAll();
  showToast('✓ Transaction deleted');
}

function refreshAll() {
  if (currentPage === 'dashboard') renderDashboard();
  if (currentPage === 'analytics') renderAnalytics();
  if (currentPage === 'transactions') renderTransactionsPage();
}

// ---------- Navigation ----------
function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');

  document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Update greeting subtitle
  const sub = document.getElementById('greetingSub');
  if (page === 'dashboard') sub.textContent = "Here's your financial overview for this month.";
  else if (page === 'analytics') sub.textContent = 'Understand where your money goes.';
  else if (page === 'transactions') sub.textContent = 'Manage all your financial activities.';
  else if (page === 'settings') sub.textContent = 'Manage your account and preferences.';

  if (page === 'dashboard') renderDashboard();
  if (page === 'analytics') renderAnalytics();
  if (page === 'transactions') renderTransactionsPage();
  if (page === 'settings') loadSettingsUI();

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.querySelector('.sidebar-overlay')?.classList.remove('show');
}

// ---------- Theme ----------
function applyTheme(theme) {
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  // Re-render charts for color update
  if (currentPage === 'dashboard') renderDashboard();
  if (currentPage === 'analytics') renderAnalytics();
}

function loadTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme) || 'light';
  const radio = document.querySelector(`input[name="theme"][value="${saved}"]`);
  if (radio) radio.checked = true;
  applyTheme(saved);
}

// ---------- Settings UI ----------
function loadSettingsUI() {
  document.getElementById('settingName').value = user.name;
  document.getElementById('settingEmail').value = user.email;
  document.getElementById('settingGoal').value = settings.savingsGoal;
  document.getElementById('settingCurrency').value = settings.currency || 'IDR';
}

// ---------- Global Search ----------
function handleGlobalSearch(query) {
  const results = document.getElementById('searchResults');
  if (!query.trim()) {
    results.innerHTML = '';
    return;
  }
  const q = query.toLowerCase();
  const matched = transactions.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    (t.note && t.note.toLowerCase().includes(q))
  ).slice(0, 8);

  if (matched.length === 0) {
    results.innerHTML = '<div class="search-empty">No results found</div>';
    return;
  }

  results.innerHTML = matched.map(t => `
    <div class="search-result-item" onclick="navigateTo('transactions')">
      <div>
        <div class="title">${escapeHtml(t.title)}</div>
        <div class="meta">${t.category} · ${formatDate(t.date)}</div>
      </div>
      <div class="tx-amount ${t.type}" style="font-size:0.85rem;">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</div>
    </div>
  `).join('');
}

// ---------- Event Listeners ----------
function initEventListeners() {
  // Navigation
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      if (el.dataset.page) navigateTo(el.dataset.page);
    });
  });

  // Sidebar toggle (desktop)
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('mainWrapper').classList.toggle('expanded');
  });

  // Mobile menu
  document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        overlay.classList.remove('show');
      });
    }
    overlay.classList.add('show');
  });

  // Month navigation
  document.getElementById('monthPrev')?.addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderDashboard();
  });
  document.getElementById('monthNext')?.addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderDashboard();
  });

  // Add transaction buttons
  document.getElementById('addTransactionBtn')?.addEventListener('click', () => openTransactionModal());
  document.getElementById('addTransactionBtn2')?.addEventListener('click', () => openTransactionModal());
  document.getElementById('emptyAddBtn')?.addEventListener('click', () => openTransactionModal());
  document.getElementById('mobileAddBtn')?.addEventListener('click', e => {
    e.preventDefault();
    openTransactionModal();
  });

  // Modal close
  document.getElementById('modalClose')?.addEventListener('click', closeTransactionModal);
  document.getElementById('modalCancel')?.addEventListener('click', closeTransactionModal);
  document.getElementById('transactionModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeTransactionModal();
  });

  // Type toggle in modal
  document.querySelectorAll('#transactionModal .type-btn').forEach(btn => {
    btn.addEventListener('click', () => setModalType(btn.dataset.type));
  });

  // Type toggle in quick add
  document.querySelectorAll('.quick-add-card .type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quick-add-card .type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      populateCategorySelect(document.getElementById('qaCategory'), btn.dataset.type);
    });
  });

  // Transaction form submit
  document.getElementById('transactionForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const type = document.querySelector('#transactionModal .type-btn.active')?.dataset.type || 'expense';
    const title = document.getElementById('txTitle').value.trim();
    const amount = document.getElementById('txAmount').value;
    const category = document.getElementById('txCategory').value;
    const date = document.getElementById('txDate').value;
    const note = document.getElementById('txNote').value.trim();

    if (!title || !amount || !category || !date || Number(amount) <= 0) {
      showToast('Please fill all required fields correctly');
      return;
    }

    const data = { type, title, amount, category, date, note };
    if (editId) {
      editTransaction(editId, data);
    } else {
      addTransaction(data);
    }
    closeTransactionModal();
  });

  // Quick add form
  document.getElementById('quickAddForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const type = document.querySelector('.quick-add-card .type-btn.active')?.dataset.type || 'expense';
    const title = document.getElementById('qaTitle').value.trim();
    const amount = document.getElementById('qaAmount').value;
    const category = document.getElementById('qaCategory').value;
    if (!title || !amount || !category || Number(amount) <= 0) {
      showToast('Please fill all fields');
      return;
    }
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(new Date().getDate()).padStart(2, '0');
    addTransaction({
      type, title, amount, category,
      date: `${y}-${m}-${d}`,
      note: ''
    });
    e.target.reset();
    populateCategorySelect(document.getElementById('qaCategory'), type);
  });

  // Delete modal
  document.getElementById('deleteModalClose')?.addEventListener('click', closeDeleteModal);
  document.getElementById('deleteCancel')?.addEventListener('click', closeDeleteModal);
  document.getElementById('deleteConfirm')?.addEventListener('click', () => {
    if (deleteId) deleteTransaction(deleteId);
    closeDeleteModal();
  });
  document.getElementById('deleteModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });

  // Goal modal
  document.getElementById('setGoalBtn')?.addEventListener('click', () => {
    document.getElementById('goalInput').value = settings.savingsGoal;
    document.getElementById('goalModal').classList.add('open');
  });
  document.getElementById('goalModalClose')?.addEventListener('click', () => {
    document.getElementById('goalModal').classList.remove('open');
  });
  document.getElementById('goalCancel')?.addEventListener('click', () => {
    document.getElementById('goalModal').classList.remove('open');
  });
  document.getElementById('goalSave')?.addEventListener('click', () => {
    const val = Number(document.getElementById('goalInput').value);
    if (val >= 0) {
      settings.savingsGoal = val;
      saveSettings();
      renderDashboard();
      showToast('✓ Savings goal updated');
    }
    document.getElementById('goalModal').classList.remove('open');
  });

  // Period tabs
  document.querySelectorAll('.period-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      spendingPeriod = Number(tab.dataset.period);
      const monthTxs = getMonthTransactions(currentMonth.getFullYear(), currentMonth.getMonth());
      renderSpendingChart(monthTxs);
    });
  });

  // Transaction filters
  document.getElementById('txSearch')?.addEventListener('input', () => renderTransactionsPage());
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTransactionsPage();
    });
  });
  document.getElementById('txCategoryFilter')?.addEventListener('change', () => renderTransactionsPage());
  document.getElementById('txSort')?.addEventListener('change', () => renderTransactionsPage());

  // Search toggle
  document.getElementById('searchToggle')?.addEventListener('click', () => {
    const dd = document.getElementById('searchDropdown');
    dd.classList.toggle('open');
    if (dd.classList.contains('open')) document.getElementById('globalSearch').focus();
  });
  document.getElementById('globalSearch')?.addEventListener('input', e => {
    handleGlobalSearch(e.target.value);
  });

  // Notifications
  document.getElementById('notifBtn')?.addEventListener('click', () => {
    document.getElementById('notifPanel').classList.toggle('open');
    document.getElementById('userDropdown').classList.remove('open');
  });

  // User menu
  document.getElementById('userMenuBtn')?.addEventListener('click', () => {
    document.getElementById('userDropdown').classList.toggle('open');
    document.getElementById('notifPanel').classList.remove('open');
  });

  // Close dropdowns on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-container')) {
      document.getElementById('searchDropdown')?.classList.remove('open');
    }
    if (!e.target.closest('#notifBtn') && !e.target.closest('#notifPanel')) {
      document.getElementById('notifPanel')?.classList.remove('open');
    }
    if (!e.target.closest('.user-menu')) {
      document.getElementById('userDropdown')?.classList.remove('open');
    }
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeTransactionModal();
      closeDeleteModal();
      document.getElementById('goalModal')?.classList.remove('open');
      document.getElementById('searchDropdown')?.classList.remove('open');
      document.getElementById('notifPanel')?.classList.remove('open');
      document.getElementById('userDropdown')?.classList.remove('open');
    }
  });

  // Settings
  document.getElementById('profileForm')?.addEventListener('submit', e => {
    e.preventDefault();
    user.name = document.getElementById('settingName').value.trim() || 'User';
    user.email = document.getElementById('settingEmail').value.trim();
    saveUser();
    renderDashboard();
    showToast('✓ Profile updated');
  });

  document.getElementById('saveGoalBtn')?.addEventListener('click', () => {
    const val = Number(document.getElementById('settingGoal').value);
    if (val >= 0) {
      settings.savingsGoal = val;
      saveSettings();
      showToast('✓ Savings goal updated');
    }
  });

  document.getElementById('settingCurrency')?.addEventListener('change', e => {
    settings.currency = e.target.value;
    saveSettings();
    showToast('✓ Currency preference saved');
  });

  document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', () => applyTheme(radio.value));
  });

  document.getElementById('resetDataBtn')?.addEventListener('click', () => {
    if (confirm('Reset all data to demo? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEYS.transactions);
      seedDemoData();
      refreshAll();
      updateDemoBadge();
      showToast('✓ Data reset to demo');
    }
  });

  // Init quick add category
  populateCategorySelect(document.getElementById('qaCategory'), 'expense');
}

// ---------- Init ----------
function init() {
  loadTransactions();
  loadSettings();
  loadUser();
  loadTheme();
  populateCategoryFilters();
  initEventListeners();
  updateDemoBadge();
  navigateTo('dashboard');
}

document.addEventListener('DOMContentLoaded', init);

// Expose functions needed by inline onclick
window.openTransactionModal = openTransactionModal;
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.navigateTo = navigateTo;
