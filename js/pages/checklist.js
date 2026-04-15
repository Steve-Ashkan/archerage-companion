// ─── DAILY CHECKLIST ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'checklist_data';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupt, rebuild */ }
  return {
    tabs: [{ id: uid(), name: 'Main', items: defaultItems() }],
    activeTab: null,
  };
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function defaultItems() {
  return [
    'Guild Quest', 'Daily Contracts', 'Manastorm Shop', 'Castles',
    'Specimen Dailys', 'Akaesh Eggs', 'Akaesh Merchants', 'Nut Dailys',
    'Guild Missions', 'Family Quest', 'Tree+Mamm Dailys', 'CR', 'SGCR',
    'Hiram Rift', 'GR', 'JMG', 'Whalesong', 'Aegis', 'Abyss Attack',
    'Hasta Rift', 'Lusca', 'Halcy', 'Red Dragon', 'House Quest',
    'Garden Quest', 'Stolen Ayanad Anima', 'Wizard\'s Token',
  ].map(text => ({ id: uid(), text, checked: false }));
}

// ─── STATE ────────────────────────────────────────────────────────────────────

let _data    = load();
let _editMode = false;

function getActive() {
  if (!_data.tabs.length) return null;
  const found = _data.tabs.find(t => t.id === _data.activeTab);
  return found || _data.tabs[0];
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

export function renderPage() {
  const tab   = getActive();
  const tabs  = _data.tabs;
  const done  = tab ? tab.items.filter(i => i.checked).length : 0;
  const total = tab ? tab.items.length : 0;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  return `
    <div style="max-width:760px;margin:0 auto;">

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
        <div>
          <h2 style="margin:0 0 4px;color:#eef2f7;">Daily Checklist</h2>
          <div style="font-size:13px;color:#566174;">Track your daily in-game tasks. Reset manually when the day rolls over.</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button onclick="window.checklistResetTab()"
            style="padding:7px 16px;background:#1a1000;border:1px solid #3a2800;color:#fcd34d;
            border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">
            ↺ Reset Tab
          </button>
          <button onclick="window.checklistResetAll()"
            style="padding:7px 16px;background:#1a1000;border:1px solid #3a2800;color:#f87171;
            border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">
            ↺ Reset All
          </button>
        </div>
      </div>

      <!-- Tabs Row -->
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:16px;">
        ${tabs.map(t => {
          const isActive = t.id === (getActive()?.id);
          return `
            <div style="display:flex;align-items:center;gap:4px;">
              <button onclick="window.checklistSetTab('${t.id}')"
                style="padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;
                background:${isActive ? '#1a2535' : '#0f1520'};
                border:1px solid ${isActive ? '#2d5a8a' : '#1e2535'};
                color:${isActive ? '#93c5fd' : '#566174'};">
                ${escHtml(t.name)}
              </button>
              <button onclick="window.checklistRenameTab('${t.id}')"
                title="Rename"
                style="padding:5px 8px;background:#0f1520;border:1px solid #1e2535;
                color:#394252;font-size:11px;cursor:pointer;border-radius:6px;">✎</button>
              ${tabs.length > 1 ? `
              <button onclick="window.checklistRemoveTab('${t.id}')"
                title="Remove tab"
                style="padding:5px 8px;background:#0f1520;border:1px solid #1e2535;
                color:#5a2a2a;font-size:11px;cursor:pointer;border-radius:6px;">✕</button>` : ''}
            </div>
          `;
        }).join('')}
        <button onclick="window.checklistAddTab()"
          style="padding:7px 14px;background:#0f1520;border:1px solid #1e2535;color:#566174;
          border-radius:8px;font-size:13px;cursor:pointer;">
          + Add Tab
        </button>
      </div>

      ${tab ? `
      <!-- Progress Bar -->
      <div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;color:#566174;">${done} of ${total} completed</span>
          <span style="font-size:12px;font-weight:700;color:${pct === 100 ? '#86efac' : '#93c5fd'};">${pct}%</span>
        </div>
        <div style="height:6px;background:#0f1923;border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:${pct === 100 ? '#86efac' : '#2d5a8a'};
            border-radius:3px;transition:width 0.3s ease;"></div>
        </div>
      </div>

      <!-- Checklist Card -->
      <div class="card" style="padding:0;overflow:hidden;">

        <!-- Edit mode toolbar -->
        <div style="display:flex;align-items:center;justify-content:space-between;
          padding:12px 16px;border-bottom:1px solid #1e2535;">
          <span style="font-size:13px;font-weight:600;color:#eef2f7;">${escHtml(tab.name)}</span>
          <div style="display:flex;gap:8px;align-items:center;">
            ${_editMode ? `
              <input id="cl-new-item" type="text" placeholder="New task..."
                onkeydown="if(event.key==='Enter')window.checklistAddItem()"
                style="padding:5px 10px;background:#0f1923;border:1px solid #2d5a8a;
                color:#eef2f7;border-radius:7px;font-size:13px;width:180px;">
              <button onclick="window.checklistAddItem()"
                style="padding:5px 14px;background:#1a2535;border:1px solid #2d5a8a;
                color:#93c5fd;border-radius:7px;font-size:13px;cursor:pointer;">Add</button>
            ` : ''}
            <button onclick="window.checklistToggleEdit()"
              style="padding:5px 14px;background:${_editMode ? '#1a2010' : '#1a2028'};
              border:1px solid ${_editMode ? '#86efac' : '#2a3040'};
              color:${_editMode ? '#86efac' : '#566174'};border-radius:7px;font-size:13px;cursor:pointer;">
              ${_editMode ? '✓ Done' : '✎ Edit List'}
            </button>
          </div>
        </div>

        <!-- Items -->
        <div style="padding:8px 0;">
          ${tab.items.length === 0 ? `
            <div style="padding:24px;text-align:center;color:#394252;font-size:13px;">
              No tasks yet. Click Edit List to add some.
            </div>
          ` : tab.items.map((item, idx) => `
            <div style="display:flex;align-items:center;gap:12px;padding:9px 16px;
              border-bottom:1px solid #0f1520;
              ${item.checked ? 'opacity:0.45;' : ''}
              transition:opacity 0.2s;">
              <input type="checkbox" ${item.checked ? 'checked' : ''}
                onchange="window.checklistToggle('${tab.id}','${item.id}')"
                style="width:17px;height:17px;accent-color:#2d5a8a;cursor:pointer;flex-shrink:0;">
              <span style="flex:1;font-size:14px;color:#cbd5e1;
                ${item.checked ? 'text-decoration:line-through;' : ''}">
                ${escHtml(item.text)}
              </span>
              ${_editMode ? `
                <div style="display:flex;gap:6px;">
                  ${idx > 0 ? `<button onclick="window.checklistMoveItem('${tab.id}','${item.id}',-1)"
                    style="padding:2px 8px;background:#0f1923;border:1px solid #1e2535;color:#566174;
                    border-radius:5px;font-size:11px;cursor:pointer;">▲</button>` : '<div style="width:28px;"></div>'}
                  ${idx < tab.items.length - 1 ? `<button onclick="window.checklistMoveItem('${tab.id}','${item.id}',1)"
                    style="padding:2px 8px;background:#0f1923;border:1px solid #1e2535;color:#566174;
                    border-radius:5px;font-size:11px;cursor:pointer;">▼</button>` : '<div style="width:28px;"></div>'}
                  <button onclick="window.checklistRemoveItem('${tab.id}','${item.id}')"
                    style="padding:2px 8px;background:#1a0a0a;border:1px solid #5a2a2a;color:#f87171;
                    border-radius:5px;font-size:11px;cursor:pointer;">✕</button>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

      </div>
      ` : `
        <div class="card" style="text-align:center;color:#394252;padding:40px;">
          Add a tab to get started.
        </div>
      `}

    </div>
  `;
}

function escHtml(v) {
  return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

// ─── HANDLERS ─────────────────────────────────────────────────────────────────

window.checklistSetTab = function(id) {
  _data.activeTab = id;
  save(_data);
  window.renderCurrentPage?.();
};

window.checklistAddTab = function() {
  const name = prompt('Tab name:');
  if (!name?.trim()) return;
  const tab = { id: uid(), name: name.trim(), items: [] };
  _data.tabs.push(tab);
  _data.activeTab = tab.id;
  save(_data);
  window.renderCurrentPage?.();
};

window.checklistRenameTab = function(id) {
  const tab = _data.tabs.find(t => t.id === id);
  if (!tab) return;
  const name = prompt('Rename tab:', tab.name);
  if (!name?.trim()) return;
  tab.name = name.trim();
  save(_data);
  window.renderCurrentPage?.();
};

window.checklistRemoveTab = function(id) {
  if (_data.tabs.length <= 1) return;
  if (!confirm('Remove this tab and all its tasks?')) return;
  _data.tabs = _data.tabs.filter(t => t.id !== id);
  if (_data.activeTab === id) _data.activeTab = _data.tabs[0]?.id || null;
  save(_data);
  window.renderCurrentPage?.();
};

window.checklistToggle = function(tabId, itemId) {
  const tab = _data.tabs.find(t => t.id === tabId);
  if (!tab) return;
  const item = tab.items.find(i => i.id === itemId);
  if (!item) return;
  item.checked = !item.checked;
  save(_data);
  window.renderCurrentPage?.();
};

window.checklistToggleEdit = function() {
  _editMode = !_editMode;
  window.renderCurrentPage?.();
};

window.checklistAddItem = function() {
  const input = document.getElementById('cl-new-item');
  const text  = input?.value?.trim();
  if (!text) return;
  const tab = getActive();
  if (!tab) return;
  tab.items.push({ id: uid(), text, checked: false });
  input.value = '';
  save(_data);
  window.renderCurrentPage?.();
  // Re-focus input after render
  setTimeout(() => document.getElementById('cl-new-item')?.focus(), 50);
};

window.checklistRemoveItem = function(tabId, itemId) {
  const tab = _data.tabs.find(t => t.id === tabId);
  if (!tab) return;
  tab.items = tab.items.filter(i => i.id !== itemId);
  save(_data);
  window.renderCurrentPage?.();
};

window.checklistMoveItem = function(tabId, itemId, dir) {
  const tab = _data.tabs.find(t => t.id === tabId);
  if (!tab) return;
  const idx = tab.items.findIndex(i => i.id === itemId);
  if (idx < 0) return;
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= tab.items.length) return;
  [tab.items[idx], tab.items[newIdx]] = [tab.items[newIdx], tab.items[idx]];
  save(_data);
  window.renderCurrentPage?.();
};

window.checklistResetTab = function() {
  const tab = getActive();
  if (!tab) return;
  if (!confirm(`Reset all tasks in "${tab.name}"?`)) return;
  tab.items.forEach(i => i.checked = false);
  save(_data);
  window.renderCurrentPage?.();
};

window.checklistResetAll = function() {
  if (!confirm('Reset ALL tabs?')) return;
  _data.tabs.forEach(t => t.items.forEach(i => i.checked = false));
  save(_data);
  window.renderCurrentPage?.();
};
