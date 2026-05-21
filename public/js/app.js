// ── State ──────────────────────────────────────────────────
let items = [];
let logs = [];
let editingId = null;
let stockTargetId = null;
let deleteTargetId = null;
let currentPage = 1;
const PER_PAGE = 15;

// ── Boot ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  setupNav();
  setupSearch();
  setupFormPreview();
  setupMenuToggle();
  await loadData();
  renderAll();
  document.getElementById('exportBtn').addEventListener('click', exportCSV);
  document.getElementById('filterCategory').addEventListener('change', renderInventory);
  document.getElementById('filterStatus').addEventListener('change', renderInventory);
  document.getElementById('sortBy').addEventListener('change', renderInventory);
});

async function loadData() {
  if (SUPABASE_CONFIGURED) {
    try {
      [items, logs] = await Promise.all([DB.getItems(), DB.getLogs()]);
      setDbStatus(true);
    } catch (e) {
      console.error(e);
      setDbStatus(false);
      showToast('Could not connect to Supabase — using local data', 'warn');
      loadLocalData();
    }
  } else {
    setDbStatus(false);
    loadLocalData();
  }
}

function loadLocalData() {
  items = JSON.parse(localStorage.getItem('sw_items') || '[]');
  logs  = JSON.parse(localStorage.getItem('sw_logs')  || '[]');
}

function saveLocal() {
  localStorage.setItem('sw_items', JSON.stringify(items));
  localStorage.setItem('sw_logs',  JSON.stringify(logs));
}

function setDbStatus(connected) {
  const el = document.getElementById('dbStatus');
  const dot = el.querySelector('.status-dot');
  el.innerHTML = `<span class="status-dot"></span> ${connected ? 'Supabase' : 'Local'}`;
  el.querySelector('.status-dot').style.background = connected ? 'var(--success)' : 'var(--warn)';
}

// ── Navigation ─────────────────────────────────────────────
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      showPage(el.dataset.page);
    });
  });
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${name}`).classList.add('active');
  document.querySelector(`[data-page="${name}"]`).classList.add('active');

  if (name === 'dashboard') renderDashboard();
  if (name === 'inventory') renderInventory();
  if (name === 'reports')   renderReports();
  if (name === 'logs')      renderLogs();

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

function setupMenuToggle() {
  document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}

// ── Render all ─────────────────────────────────────────────
function renderAll() {
  renderDashboard();
  renderInventory();
  renderReports();
  renderLogs();
  populateCategoryFilters();
}

// ── Dashboard ──────────────────────────────────────────────
function renderDashboard() {
  const low    = items.filter(i => i.quantity > 0 && i.quantity <= (i.low_threshold || 5));
  const out    = items.filter(i => i.quantity <= 0);
  const total  = items.reduce((s, i) => s + (i.quantity || 0), 0);
  const value  = items.reduce((s, i) => s + ((i.quantity || 0) * (i.sell_price || 0)), 0);
  const cats   = new Set(items.map(i => i.category).filter(Boolean)).size;

  setText('stat-total', items.length);
  setText('stat-stock', total.toLocaleString());
  setText('stat-low',   low.length);
  setText('stat-out',   out.length);
  setText('stat-value', '₱' + value.toLocaleString('en-PH', {minimumFractionDigits: 0, maximumFractionDigits: 0}));
  setText('stat-cats',  cats);

  // Alerts
  const combined = [...out, ...low].slice(0, 8);
  const alertBadge = document.getElementById('alertBadge');
  const alertList  = document.getElementById('alertList');
  alertBadge.textContent = combined.length;
  alertBadge.className = 'badge' + (combined.length > 0 ? ' warn' : '');

  const notifCount = document.getElementById('notifCount');
  if (combined.length > 0) {
    notifCount.textContent = combined.length;
    notifCount.style.display = 'flex';
  } else {
    notifCount.style.display = 'none';
  }

  if (combined.length === 0) {
    alertList.innerHTML = '<p class="empty-state">No alerts right now 🎉</p>';
  } else {
    alertList.innerHTML = combined.map(i => {
      const isOut = i.quantity <= 0;
      return `<div class="alert-item ${isOut ? 'danger' : ''}">
        <span class="alert-name">${esc(i.name)}</span>
        <span class="alert-qty">${isOut ? 'Out of stock' : i.quantity + ' left'}</span>
      </div>`;
    }).join('');
  }

  // Recent activity
  const ra = document.getElementById('recentActivity');
  const recent = logs.slice(0, 6);
  if (!recent.length) {
    ra.innerHTML = '<p class="empty-state">No recent activity</p>';
  } else {
    ra.innerHTML = recent.map(l => {
      const t = l.action?.toLowerCase().includes('add') ? 'add'
              : l.action?.toLowerCase().includes('delete') ? 'delete'
              : l.action?.toLowerCase().includes('restock') ? 'restock'
              : 'update';
      return `<div class="activity-item">
        <span class="activity-dot ${t}"></span>
        <span class="activity-text">${esc(l.detail || l.action)}</span>
        <span class="activity-time">${timeAgo(l.created_at)}</span>
      </div>`;
    }).join('');
  }

  // Category bars
  const byCategory = groupBy(items, 'category');
  const maxQty = Math.max(...Object.values(byCategory).map(arr => arr.reduce((s,i) => s + (i.quantity||0), 0)), 1);
  const bars = document.getElementById('categoryChart');
  const catEntries = Object.entries(byCategory).sort((a,b) => {
    const qa = a[1].reduce((s,i)=>s+(i.quantity||0),0);
    const qb = b[1].reduce((s,i)=>s+(i.quantity||0),0);
    return qb - qa;
  }).slice(0, 8);

  if (!catEntries.length) {
    bars.innerHTML = '<p class="empty-state">No data yet</p>';
  } else {
    bars.innerHTML = catEntries.map(([cat, arr]) => {
      const qty = arr.reduce((s,i)=>s+(i.quantity||0),0);
      const pct = Math.round((qty / maxQty) * 100);
      return `<div class="cat-bar-row">
        <span class="cat-bar-label">${esc(cat || 'Uncategorized')}</span>
        <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${pct}%"></div></div>
        <span class="cat-bar-val">${qty} units</span>
      </div>`;
    }).join('');
  }
}

// ── Inventory table ─────────────────────────────────────────
function renderInventory() {
  const search   = document.getElementById('globalSearch').value.toLowerCase();
  const cat      = document.getElementById('filterCategory').value;
  const status   = document.getElementById('filterStatus').value;
  const sortKey  = document.getElementById('sortBy').value;

  let filtered = items.filter(i => {
    const matchSearch = !search ||
      i.name?.toLowerCase().includes(search) ||
      i.sku?.toLowerCase().includes(search) ||
      i.category?.toLowerCase().includes(search) ||
      i.supplier?.toLowerCase().includes(search);
    const matchCat = !cat || i.category === cat;
    const st = getStatus(i);
    const matchStatus = !status || st === status;
    return matchSearch && matchCat && matchStatus;
  });

  filtered.sort((a, b) => {
    if (sortKey === 'name')     return (a.name||'').localeCompare(b.name||'');
    if (sortKey === 'quantity') return (b.quantity||0) - (a.quantity||0);
    if (sortKey === 'price')    return (b.sell_price||0) - (a.sell_price||0);
    if (sortKey === 'date')     return new Date(b.created_at||0) - new Date(a.created_at||0);
    return 0;
  });

  const total = filtered.length;
  document.getElementById('itemCount').textContent = `${total} item${total !== 1 ? 's' : ''}`;

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const page  = filtered.slice(start, start + PER_PAGE);

  const tbody = document.getElementById('inventoryBody');
  if (!page.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">No items found</td></tr>`;
  } else {
    tbody.innerHTML = page.map(i => {
      const st = getStatus(i);
      const label = st === 'in-stock' ? 'In Stock' : st === 'low-stock' ? 'Low Stock' : 'Out of Stock';
      const updated = i.updated_at ? new Date(i.updated_at).toLocaleDateString('en-PH') : '—';
      return `<tr>
        <td><strong>${esc(i.name)}</strong>${i.description ? `<br><small style="color:var(--text3)">${esc(i.description.slice(0,40))}…</small>` : ''}</td>
        <td class="sku-cell">${esc(i.sku || '—')}</td>
        <td><span class="badge">${esc(i.category || '—')}</span></td>
        <td>${(i.quantity||0).toLocaleString()} ${esc(i.unit||'pcs')}</td>
        <td>₱${(i.sell_price||0).toLocaleString('en-PH', {minimumFractionDigits:2})}</td>
        <td><span class="status-pill ${st}">${label}</span></td>
        <td style="color:var(--text3);font-size:12px">${updated}</td>
        <td>
          <div class="row-actions">
            <button class="stock-btn" onclick="openStockModal('${i.id}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Stock
            </button>
            <button class="edit-btn" onclick="editItem('${i.id}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <button class="del-btn" onclick="openDeleteModal('${i.id}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  // Pagination
  const pg = document.getElementById('pagination');
  if (totalPages <= 1) { pg.innerHTML = ''; return; }
  let btns = '';
  for (let p = 1; p <= totalPages; p++) {
    btns += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="goPage(${p})">${p}</button>`;
  }
  pg.innerHTML = btns;
}

function goPage(n) { currentPage = n; renderInventory(); }

// ── Item form ───────────────────────────────────────────────
function editItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  editingId = id;
  document.getElementById('formTitle').textContent = 'Edit Item';
  document.getElementById('submitBtn').textContent = 'Save Changes';
  document.getElementById('editId').value = id;
  document.getElementById('itemName').value        = item.name || '';
  document.getElementById('itemSKU').value         = item.sku || '';
  document.getElementById('itemCategory').value    = item.category || '';
  document.getElementById('itemSupplier').value    = item.supplier || '';
  document.getElementById('itemDescription').value = item.description || '';
  document.getElementById('itemQuantity').value    = item.quantity ?? 0;
  document.getElementById('itemLowThreshold').value= item.low_threshold ?? 5;
  document.getElementById('itemUnit').value        = item.unit || '';
  document.getElementById('itemCostPrice').value   = item.cost_price ?? '';
  document.getElementById('itemSellPrice').value   = item.sell_price ?? '';
  document.getElementById('itemLocation').value    = item.location || '';
  document.getElementById('itemExpiry').value      = item.expiry_date ? item.expiry_date.slice(0,10) : '';
  showPage('add-item');
  updatePreview();
}

function resetForm() {
  editingId = null;
  document.getElementById('itemForm').reset();
  document.getElementById('formTitle').textContent = 'Add New Item';
  document.getElementById('submitBtn').textContent = 'Save Item';
  document.getElementById('editId').value = '';
  document.getElementById('itemPreview').innerHTML = '<p class="empty-state">Fill in the form to see a preview</p>';
  showPage('inventory');
}

async function saveItem() {
  const name  = document.getElementById('itemName').value.trim();
  const price = parseFloat(document.getElementById('itemSellPrice').value);
  const qty   = parseInt(document.getElementById('itemQuantity').value);
  const cat   = document.getElementById('itemCategory').value.trim();

  if (!name) { showToast('Item name is required', 'error'); return; }
  if (isNaN(price)) { showToast('Selling price is required', 'error'); return; }
  if (isNaN(qty))   { showToast('Quantity is required', 'error'); return; }
  if (!cat) { showToast('Category is required', 'error'); return; }

  const payload = {
    name,
    sku:           document.getElementById('itemSKU').value.trim() || genSKU(name),
    category:      cat,
    supplier:      document.getElementById('itemSupplier').value.trim(),
    description:   document.getElementById('itemDescription').value.trim(),
    quantity:      qty,
    low_threshold: parseInt(document.getElementById('itemLowThreshold').value) || 5,
    unit:          document.getElementById('itemUnit').value.trim() || 'pcs',
    cost_price:    parseFloat(document.getElementById('itemCostPrice').value) || 0,
    sell_price:    price,
    location:      document.getElementById('itemLocation').value.trim(),
    expiry_date:   document.getElementById('itemExpiry').value || null,
    updated_at:    new Date().toISOString()
  };

  const isEdit = !!editingId;

  if (SUPABASE_CONFIGURED) {
    try {
      if (isEdit) {
        const [updated] = await DB.updateItem(editingId, payload);
        items = items.map(i => i.id === editingId ? updated : i);
        await DB.addLog({ action: 'UPDATE', item_name: name, detail: `Updated item: ${name}`, created_at: new Date().toISOString() });
      } else {
        payload.created_at = new Date().toISOString();
        const [created] = await DB.addItem(payload);
        items.unshift(created);
        await DB.addLog({ action: 'ADD', item_name: name, detail: `Added new item: ${name}`, created_at: new Date().toISOString() });
      }
      logs = await DB.getLogs();
    } catch(e) {
      showToast('Supabase error: ' + e.message, 'error'); return;
    }
  } else {
    if (isEdit) {
      items = items.map(i => i.id === editingId ? { ...i, ...payload } : i);
      addLocalLog('UPDATE', name, `Updated item: ${name}`);
    } else {
      payload.id = 'local-' + Date.now();
      payload.created_at = new Date().toISOString();
      items.unshift(payload);
      addLocalLog('ADD', name, `Added new item: ${name}`);
    }
    saveLocal();
  }

  showToast(isEdit ? 'Item updated!' : 'Item added!', 'success');
  renderAll();
  populateCategoryFilters();
  resetForm();
}

// ── Stock adjust ────────────────────────────────────────────
function openStockModal(id) {
  stockTargetId = id;
  const item = items.find(i => i.id === id);
  if (!item) return;
  document.getElementById('stockModalItem').textContent = item.name;
  document.getElementById('stockAmount').value = 1;
  document.getElementById('stockNote').value = '';
  document.getElementById('stockModal').classList.add('open');
}

async function confirmStockAdjust() {
  const item   = items.find(i => i.id === stockTargetId);
  if (!item) return;
  const action = document.getElementById('stockAction').value;
  const amount = parseInt(document.getElementById('stockAmount').value) || 0;
  const note   = document.getElementById('stockNote').value.trim();

  let newQty = item.quantity || 0;
  if (action === 'add')    newQty = newQty + amount;
  if (action === 'remove') newQty = Math.max(0, newQty - amount);
  if (action === 'set')    newQty = Math.max(0, amount);

  const logDetail = `${action === 'add' ? 'Restocked' : action === 'remove' ? 'Removed stock from' : 'Set stock for'} ${item.name}: ${item.quantity} → ${newQty}${note ? ' (' + note + ')' : ''}`;

  if (SUPABASE_CONFIGURED) {
    try {
      await DB.updateItem(stockTargetId, { quantity: newQty, updated_at: new Date().toISOString() });
      await DB.addLog({ action: 'RESTOCK', item_name: item.name, detail: logDetail, created_at: new Date().toISOString() });
      logs = await DB.getLogs();
    } catch(e) { showToast('Error: ' + e.message, 'error'); return; }
  } else {
    items = items.map(i => i.id === stockTargetId ? { ...i, quantity: newQty, updated_at: new Date().toISOString() } : i);
    addLocalLog('RESTOCK', item.name, logDetail);
    saveLocal();
  }

  showToast(`Stock updated: ${newQty} ${item.unit || 'pcs'}`, 'success');
  closeModal('stockModal');
  renderAll();
}

// ── Delete ──────────────────────────────────────────────────
function openDeleteModal(id) {
  deleteTargetId = id;
  const item = items.find(i => i.id === id);
  document.getElementById('deleteItemName').textContent = item?.name || 'this item';
  document.getElementById('deleteModal').classList.add('open');
}

async function confirmDelete() {
  const item = items.find(i => i.id === deleteTargetId);
  if (!item) return;

  if (SUPABASE_CONFIGURED) {
    try {
      await DB.deleteItem(deleteTargetId);
      await DB.addLog({ action: 'DELETE', item_name: item.name, detail: `Deleted item: ${item.name}`, created_at: new Date().toISOString() });
      logs = await DB.getLogs();
    } catch(e) { showToast('Error: ' + e.message, 'error'); return; }
  } else {
    items = items.filter(i => i.id !== deleteTargetId);
    addLocalLog('DELETE', item.name, `Deleted item: ${item.name}`);
    saveLocal();
  }

  showToast(`${item.name} deleted`, 'warn');
  closeModal('deleteModal');
  renderAll();
  populateCategoryFilters();
}

// ── Reports ─────────────────────────────────────────────────
function renderReports() {
  const totalValue   = items.reduce((s,i) => s + ((i.quantity||0)*(i.sell_price||0)), 0);
  const totalCost    = items.reduce((s,i) => s + ((i.quantity||0)*(i.cost_price||0)), 0);
  const margin       = totalValue - totalCost;
  const avgPrice     = items.length ? totalValue / items.length : 0;
  const turnover     = items.length ? (items.filter(i => (i.quantity||0) > 0).length / items.length * 100) : 0;

  document.getElementById('reportKpis').innerHTML = [
    { label: 'Total Inventory Value', val: '₱' + totalValue.toLocaleString('en-PH', {minimumFractionDigits:0}), sub: 'Retail value' },
    { label: 'Total Cost Value',      val: '₱' + totalCost.toLocaleString('en-PH', {minimumFractionDigits:0}), sub: 'At cost price' },
    { label: 'Gross Margin',          val: '₱' + margin.toLocaleString('en-PH', {minimumFractionDigits:0}), sub: `${totalValue ? Math.round(margin/totalValue*100) : 0}% of retail` },
    { label: 'Avg Item Value',        val: '₱' + Math.round(avgPrice).toLocaleString('en-PH'), sub: 'Per item line' },
    { label: 'Stock Availability',    val: Math.round(turnover) + '%', sub: 'Items with stock' },
    { label: 'Total SKUs',            val: items.length, sub: 'Unique items' }
  ].map(k => `
    <div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.val}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>`).join('');

  // Top by value
  const sorted = [...items].sort((a,b) => ((b.quantity||0)*(b.sell_price||0)) - ((a.quantity||0)*(a.sell_price||0))).slice(0,6);
  document.getElementById('topValueList').innerHTML = sorted.length
    ? sorted.map((i,n) => `
      <div class="rank-item">
        <span class="rank-num">${n+1}</span>
        <span class="rank-name">${esc(i.name)}</span>
        <span class="rank-val">₱${((i.quantity||0)*(i.sell_price||0)).toLocaleString('en-PH', {minimumFractionDigits:0})}</span>
      </div>`).join('')
    : '<p class="empty-state">No data</p>';

  // Status pie
  const inStock  = items.filter(i => i.quantity > (i.low_threshold||5)).length;
  const lowStock = items.filter(i => i.quantity > 0 && i.quantity <= (i.low_threshold||5)).length;
  const outStock = items.filter(i => i.quantity <= 0).length;
  const pieTotal = items.length || 1;
  const pieData = [
    { label: 'In Stock',    count: inStock,  color: 'var(--success)', pct: Math.round(inStock/pieTotal*100) },
    { label: 'Low Stock',   count: lowStock, color: 'var(--warn)',    pct: Math.round(lowStock/pieTotal*100) },
    { label: 'Out of Stock',count: outStock, color: 'var(--danger)',  pct: Math.round(outStock/pieTotal*100) }
  ];
  document.getElementById('stockPie').innerHTML = pieData.map(d => `
    <div class="pie-row">
      <span class="pie-dot" style="background:${d.color}"></span>
      <span class="pie-label">${d.label} (${d.count})</span>
      <div class="pie-bar-track"><div class="pie-bar-fill" style="width:${d.pct}%;background:${d.color}"></div></div>
      <span class="pie-pct">${d.pct}%</span>
    </div>`).join('');

  // Category table
  const byCategory = groupBy(items, 'category');
  const catRows = Object.entries(byCategory).map(([cat, arr]) => {
    const qty   = arr.reduce((s,i) => s+(i.quantity||0), 0);
    const val   = arr.reduce((s,i) => s+((i.quantity||0)*(i.sell_price||0)), 0);
    return { cat: cat || 'Uncategorized', count: arr.length, qty, val };
  }).sort((a,b) => b.val - a.val);

  document.getElementById('categoryTable').innerHTML = catRows.length
    ? `<table><thead><tr><th>Category</th><th>Items</th><th>Total Qty</th><th>Total Value</th></tr></thead><tbody>
      ${catRows.map(r => `<tr>
        <td><strong>${esc(r.cat)}</strong></td>
        <td>${r.count}</td>
        <td>${r.qty.toLocaleString()}</td>
        <td>₱${r.val.toLocaleString('en-PH', {minimumFractionDigits:0})}</td>
      </tr>`).join('')}
    </tbody></table>`
    : '<p class="empty-state">No data</p>';
}

// ── Logs ────────────────────────────────────────────────────
function renderLogs() {
  const filter = document.getElementById('logFilter').value;
  const filtered = filter ? logs.filter(l => l.action === filter) : logs;

  const logList = document.getElementById('logList');
  if (!filtered.length) {
    logList.innerHTML = '<p class="empty-state">No log entries</p>';
    return;
  }

  const icons = { ADD: '＋', UPDATE: '✎', DELETE: '✕', RESTOCK: '↑' };
  logList.innerHTML = filtered.map(l => {
    const t = (l.action||'').toLowerCase();
    const cls = t.includes('add') ? 'add' : t.includes('del') ? 'delete' : t.includes('restock') ? 'restock' : 'update';
    return `<div class="log-item">
      <div class="log-icon ${cls}">${icons[l.action] || '·'}</div>
      <div class="log-body">
        <div class="log-action">${esc(l.action || 'Action')}</div>
        <div class="log-detail">${esc(l.detail || l.item_name || '')}</div>
      </div>
      <div class="log-time">${timeAgo(l.created_at)}</div>
    </div>`;
  }).join('');
}

function exportLogs() {
  const rows = [['Action','Item','Detail','Time']];
  logs.forEach(l => rows.push([l.action, l.item_name, l.detail, l.created_at]));
  downloadCSV(rows, 'activity-log.csv');
  showToast('Log exported', 'success');
}

// ── Search ──────────────────────────────────────────────────
function setupSearch() {
  document.getElementById('globalSearch').addEventListener('input', () => {
    showPage('inventory');
    renderInventory();
  });
}

// ── Form preview ────────────────────────────────────────────
function setupFormPreview() {
  ['itemName','itemCategory','itemQuantity','itemSellPrice','itemUnit','itemSKU'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updatePreview);
  });
}

function updatePreview() {
  const name  = document.getElementById('itemName').value;
  const cat   = document.getElementById('itemCategory').value;
  const qty   = document.getElementById('itemQuantity').value;
  const price = document.getElementById('itemSellPrice').value;
  const unit  = document.getElementById('itemUnit').value || 'pcs';
  const sku   = document.getElementById('itemSKU').value || (name ? genSKU(name) : '—');

  if (!name) {
    document.getElementById('itemPreview').innerHTML = '<p class="empty-state">Fill in the form to see a preview</p>';
    return;
  }

  document.getElementById('itemPreview').innerHTML = `
    <div class="preview-row"><span class="preview-label">Name</span><span class="preview-val">${esc(name)}</span></div>
    <div class="preview-row"><span class="preview-label">SKU</span><span class="preview-val" style="font-size:11.5px;color:var(--text3)">${esc(sku)}</span></div>
    <div class="preview-row"><span class="preview-label">Category</span><span class="preview-val">${esc(cat||'—')}</span></div>
    <div class="preview-row"><span class="preview-label">Quantity</span><span class="preview-val">${qty||0} ${esc(unit)}</span></div>
    <div class="preview-row"><span class="preview-label">Price</span><span class="preview-val" style="color:var(--accent)">₱${parseFloat(price||0).toLocaleString('en-PH', {minimumFractionDigits:2})}</span></div>
  `;

  // Update category datalist
  const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
  document.getElementById('categoryList').innerHTML = cats.map(c => `<option value="${esc(c)}">`).join('');
}

// ── Category filters ─────────────────────────────────────
function populateCategoryFilters() {
  const cats = [...new Set(items.map(i => i.category).filter(Boolean))].sort();
  const select = document.getElementById('filterCategory');
  const current = select.value;
  select.innerHTML = '<option value="">All Categories</option>' +
    cats.map(c => `<option value="${esc(c)}" ${c === current ? 'selected' : ''}>${esc(c)}</option>`).join('');
  const list = document.getElementById('categoryList');
  if (list) list.innerHTML = cats.map(c => `<option value="${esc(c)}">`).join('');
}

// ── CSV export ────────────────────────────────────────────
function exportCSV() {
  const rows = [['Name','SKU','Category','Quantity','Unit','Sell Price','Cost Price','Status','Supplier','Location','Last Updated']];
  items.forEach(i => rows.push([
    i.name, i.sku, i.category, i.quantity, i.unit,
    i.sell_price, i.cost_price, getStatus(i), i.supplier, i.location,
    i.updated_at ? new Date(i.updated_at).toLocaleDateString('en-PH') : ''
  ]));
  downloadCSV(rows, 'inventory.csv');
  showToast('CSV exported!', 'success');
}

function downloadCSV(rows, filename) {
  const csv = rows.map(r => r.map(v => `"${(v||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename;
  a.click();
}

// ── Modals ─────────────────────────────────────────────────
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// ── Toast ──────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Helpers ────────────────────────────────────────────────
function getStatus(item) {
  if ((item.quantity||0) <= 0) return 'out-of-stock';
  if ((item.quantity||0) <= (item.low_threshold||5)) return 'low-stock';
  return 'in-stock';
}

function genSKU(name) {
  return (name.replace(/[^a-zA-Z0-9]/g,'').substring(0,4).toUpperCase() || 'ITEM') + '-' + Math.floor(Math.random()*9000+1000);
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || '';
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000)    return 'just now';
  if (diff < 3600000)  return Math.floor(diff/60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago';
  return Math.floor(diff/86400000) + 'd ago';
}

function addLocalLog(action, itemName, detail) {
  logs.unshift({ id: 'log-' + Date.now(), action, item_name: itemName, detail, created_at: new Date().toISOString() });
  if (logs.length > 200) logs.pop();
}

// Close modals on backdrop click
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
});
