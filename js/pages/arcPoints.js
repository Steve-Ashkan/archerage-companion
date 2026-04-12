// ─── ARC POINTS ───────────────────────────────────────────────────────────────
// Engagement & reward system for ArcheRage Companion contributors.
// DEV-ONLY until ready for public release.

import { escapeHtml } from '../utils.js';
import { getAuth, isPro } from '../auth.js';

const IGN_KEY = 'userIgn';
function getIGN() { return localStorage.getItem(IGN_KEY) || ''; }

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const PRO_DISCOUNT = 0.20; // 20% off for active pro subscribers

const EARN_ACTIONS = [
  { action: 'Wiki article or guide approved',      points: 25, icon: '📖' },
  { action: 'Recipe submitted & verified correct', points: 5,  icon: '📜' },
  { action: 'Auction House price submission accepted', points: 1, icon: '💰' },
];

const REWARDS = [
  {
    id: 'pro_week',
    label: '1 Week Pro',
    description: 'Extend or activate Pro for 7 days',
    baseCost: 500,
    icon: '⭐',
    category: 'pro',
    proOnly: false,
  },
  {
    id: 'pro_month',
    label: '1 Month Pro',
    description: 'Extend or activate Pro for 30 days',
    baseCost: 2000,
    icon: '🌟',
    category: 'pro',
    proOnly: false,
  },
  {
    id: 'gold_250',
    label: '250g In-Game Gold',
    description: 'Redeemable in-game — fulfilled manually by Ashkan',
    baseCost: 750,
    icon: '🪙',
    category: 'gold',
    proOnly: false,
  },
  {
    id: 'gold_500',
    label: '500g In-Game Gold',
    description: 'Redeemable in-game — fulfilled manually by Ashkan',
    baseCost: 1250,
    icon: '💎',
    category: 'gold',
    proOnly: false,
  },
  {
    id: 'gold_1000',
    label: '1,000g In-Game Gold',
    description: 'Redeemable in-game — fulfilled manually by Ashkan',
    baseCost: 2000,
    icon: '👑',
    category: 'gold',
    proOnly: false,
  },
  {
    id: 'gift_pro_week',
    label: 'Gift 1 Week Pro',
    description: 'Give another user 7 days of Pro',
    baseCost: 600,
    icon: '🎁',
    category: 'gift',
    proOnly: false,
  },
  {
    id: 'gift_pro_month',
    label: 'Gift 1 Month Pro',
    description: 'Give another user 30 days of Pro',
    baseCost: 2400,
    icon: '🎀',
    category: 'gift',
    proOnly: false,
  },
];

function effectiveCost(baseCost, userIsPro) {
  return userIsPro ? Math.round(baseCost * (1 - PRO_DISCOUNT)) : baseCost;
}

// ─── STATE (async — page re-renders after fetch) ───────────────────────────────

let _points  = 0;
let _history = [];

async function loadPoints() {
  if (!window.electronAPI?.arcGetMyPoints) return;
  const r = await window.electronAPI.arcGetMyPoints();
  if (r?.ok) { _points = r.points; window.renderCurrentPage?.(); }
}

async function loadHistory() {
  if (!window.electronAPI?.arcGetPointHistory) return;
  const r = await window.electronAPI.arcGetPointHistory();
  if (r?.ok) { _history = r.history || []; window.renderCurrentPage?.(); }
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

export function renderPage() {
  const auth    = getAuth();
  const userPro = isPro();
  const points  = _points;
  const history = _history;

  // Kick off async fetches — will re-render when done
  loadPoints();
  loadHistory();

  return `
    <!-- Dev Banner -->
    <div style="background:#1a1a2e;border:1px solid #4a3a8a;border-radius:10px;
      padding:10px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px;">
      <span style="color:#a78bfa;font-size:13px;">🔬 Dev Preview — this page is only visible to you</span>
    </div>

    <!-- Header + Balance -->
    <div class="card" style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
        <div>
          <h2 style="margin:0 0 4px;">ARC Points</h2>
          <p style="margin:0;color:#566174;font-size:13px;">
            Earn points by contributing to the app. Redeem for Pro time, in-game gold, or gifts.
          </p>
        </div>
        <div style="text-align:right;">
          <div style="font-size:2.2em;font-weight:800;color:#ffd166;line-height:1;">
            ${points.toLocaleString()}
          </div>
          <div style="font-size:12px;color:#566174;margin-top:2px;">ARC Points</div>
          ${userPro ? `<div style="font-size:11px;color:#a78bfa;margin-top:4px;">⭐ Pro — 20% discount applied</div>` : ''}
        </div>
      </div>
    </div>

    <!-- How to Earn -->
    <div class="card" style="margin-bottom:16px;">
      <h3 style="margin:0 0 14px;">How to Earn</h3>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${EARN_ACTIONS.map(a => `
          <div style="display:flex;justify-content:space-between;align-items:center;
            padding:10px 14px;background:#0f1923;border:1px solid #1e2d3d;border-radius:8px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:1.2em;">${a.icon}</span>
              <span style="color:#cbd5e1;font-size:14px;">${escapeHtml(a.action)}</span>
            </div>
            <span style="font-weight:700;color:#ffd166;font-size:14px;">+${a.points} pt${a.points !== 1 ? 's' : ''}</span>
          </div>
        `).join('')}
        <div style="font-size:12px;color:#394252;margin-top:4px;padding:0 4px;">
          More ways to earn will be added as the system grows.
        </div>
      </div>
    </div>

    <!-- Rewards -->
    <div class="card" style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <h3 style="margin:0;">Rewards</h3>
        ${userPro
          ? `<span style="font-size:12px;color:#a78bfa;padding:3px 10px;border-radius:20px;
              background:#2d1f5e;border:1px solid #4a3a8a;">⭐ Pro prices shown</span>`
          : `<span style="font-size:12px;color:#566174;">Subscribe to Pro for 20% off all rewards</span>`
        }
      </div>

      ${renderRewardSection('Pro Time', 'pro', points, userPro)}
      ${renderRewardSection('In-Game Gold', 'gold', points, userPro)}
      ${renderRewardSection('Gifts', 'gift', points, userPro)}
    </div>

    <!-- Point History -->
    <div class="card">
      <h3 style="margin:0 0 14px;">Point History</h3>
      ${history.length === 0
        ? `<div style="color:#394252;font-size:13px;text-align:center;padding:20px 0;">
            No points earned yet. Start contributing to the app!
           </div>`
        : `<div style="display:flex;flex-direction:column;gap:6px;">
            ${history.map(h => {
              const label = { ah_price_accepted: 'AH Price Accepted', recipe_verified: 'Recipe Verified', wiki_approved: 'Wiki Article Approved' }[h.action_type] || h.action_type;
              const date  = h.created_at ? new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;
                  padding:8px 12px;background:#0f1923;border:1px solid #1e2d3d;border-radius:8px;">
                  <span style="color:#cbd5e1;font-size:13px;">${escapeHtml(label)}</span>
                  <div style="display:flex;align-items:center;gap:12px;">
                    <span style="font-size:11px;color:#394252;">${escapeHtml(date)}</span>
                    <span style="color:#ffd166;font-weight:700;font-size:13px;">+${h.points}</span>
                  </div>
                </div>
              `;
            }).join('')}
           </div>`
      }
    </div>
  `;
}

function renderRewardSection(title, category, userPoints, userIsPro) {
  const rewards = REWARDS.filter(r => r.category === category);
  return `
    <div style="margin-bottom:18px;">
      <div style="font-size:11px;color:#566174;text-transform:uppercase;letter-spacing:0.08em;
        margin-bottom:10px;">${escapeHtml(title)}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">
        ${rewards.map(r => {
          const cost       = effectiveCost(r.baseCost, userIsPro);
          const affordable = userPoints >= cost;
          const discounted = userIsPro && cost !== r.baseCost;
          return `
            <div style="background:#0f1923;border:1px solid ${affordable ? '#2a3a52' : '#1e2535'};
              border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px;
              opacity:${affordable ? '1' : '0.6'};">
              <div style="font-size:1.5em;">${r.icon}</div>
              <div>
                <div style="font-weight:700;color:#eef2f7;font-size:14px;">${escapeHtml(r.label)}</div>
                <div style="font-size:12px;color:#566174;margin-top:2px;">${escapeHtml(r.description)}</div>
              </div>
              <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <span style="font-weight:700;color:#ffd166;font-size:15px;">${cost.toLocaleString()} pts</span>
                  ${discounted ? `<span style="font-size:11px;color:#566174;text-decoration:line-through;margin-left:6px;">${r.baseCost.toLocaleString()}</span>` : ''}
                </div>
                <button
                  onclick="window.arcRedeem('${r.id}')"
                  ${!affordable ? 'disabled' : ''}
                  style="padding:5px 12px;font-size:12px;border-radius:6px;cursor:${affordable ? 'pointer' : 'not-allowed'};
                    background:${affordable ? '#1a2a3a' : '#0f1520'};
                    border:1px solid ${affordable ? '#2d5a8a' : '#1e2535'};
                    color:${affordable ? '#93c5fd' : '#2a3a52'};">
                  Redeem
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderRedemptionHistory(pending, history) {
  const statusColor = { pending: '#fcd34d', fulfilled: '#86efac', cancelled: '#f87171' };
  const all = [
    ...pending.map(r => ({ ...r, status: 'pending' })),
    ...history,
  ];
  return `
    <div style="display:flex;flex-direction:column;gap:6px;">
      ${all.map(r => `
        <div style="display:flex;justify-content:space-between;align-items:center;
          padding:10px 14px;background:#0f1923;border:1px solid #1e2d3d;border-radius:8px;">
          <div>
            <div style="color:#eef2f7;font-size:13px;">${escapeHtml(r.label || r.reward_type)}</div>
            <div style="font-size:11px;color:#566174;margin-top:2px;">${escapeHtml(r.created_at || '')}</div>
          </div>
          <span style="font-size:12px;padding:2px 10px;border-radius:20px;
            background:${statusColor[r.status] || '#566174'}22;
            color:${statusColor[r.status] || '#566174'};
            border:1px solid ${statusColor[r.status] || '#566174'}44;">
            ${escapeHtml(r.status)}
          </span>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── HANDLERS ─────────────────────────────────────────────────────────────────

window.arcRedeem = function(rewardId) {
  const reward  = REWARDS.find(r => r.id === rewardId);
  if (!reward) return;
  const userPro = isPro();
  const cost    = effectiveCost(reward.baseCost, userPro);
  const ign     = getIGN();
  const auth    = getAuth();

  // Gold rewards require IGN
  if (reward.category === 'gold' && !ign) {
    alert('You need to set your In-Game Name before redeeming gold. Go to your profile on the Home page.');
    return;
  }

  document.getElementById('arc-redeem-modal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'arc-redeem-modal';
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.6);
    display:flex;align-items:center;justify-content:center;z-index:9999;`;

  modal.innerHTML = `
    <div style="background:#1a2535;border:1px solid #2a3a52;border-radius:12px;
      padding:24px;width:400px;max-width:95vw;">
      <h3 style="margin:0 0 16px;color:#eef2f7;">Confirm Redemption</h3>
      <div style="background:#0f1923;border:1px solid #1e2d3d;border-radius:8px;padding:14px;margin-bottom:16px;">
        <div style="font-size:1.6em;margin-bottom:8px;">${reward.icon}</div>
        <div style="font-weight:700;color:#eef2f7;margin-bottom:4px;">${escapeHtml(reward.label)}</div>
        <div style="font-size:13px;color:#566174;">${escapeHtml(reward.description)}</div>
        ${reward.category === 'gold' ? `
          <div style="margin-top:10px;font-size:12px;color:#8d99ab;">
            Sending to IGN: <strong style="color:#eef2f7;">${escapeHtml(ign)}</strong>
          </div>` : ''}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;
        margin-bottom:20px;padding:10px 14px;background:#1e2a1e;border:1px solid #2a5a2a;border-radius:8px;">
        <span style="color:#94a3b8;">Points spent</span>
        <span style="font-weight:700;color:#ffd166;font-size:16px;">−${cost.toLocaleString()} pts</span>
      </div>
      ${reward.category === 'gift' ? `
        <div style="margin-bottom:16px;">
          <label style="font-size:11px;color:#566174;display:block;margin-bottom:4px;text-transform:uppercase;">
            Recipient Discord Name
          </label>
          <input id="arc-gift-recipient" type="text" placeholder="Their Discord username..."
            oninput="window.arcLookupRecipient(this.value)"
            style="width:100%;box-sizing:border-box;padding:8px 12px;background:#0f1923;
            border:1px solid #2a3a52;color:#eef2f7;border-radius:8px;font-size:13px;">
          <div id="arc-gift-lookup" style="font-size:12px;margin-top:6px;min-height:18px;"></div>
        </div>
      ` : ''}
      <div style="display:flex;gap:10px;">
        <button id="arc-confirm-btn" onclick="window.arcConfirmRedeem('${rewardId}', ${cost})"
          ${reward.category === 'gift' ? 'disabled' : ''}
          style="flex:1;padding:9px;background:#1a2a3a;border:1px solid #2d5a8a;
          color:#93c5fd;border-radius:8px;font-weight:600;cursor:pointer;
          ${reward.category === 'gift' ? 'opacity:0.4;cursor:not-allowed;' : ''}">
          Confirm
        </button>
        <button onclick="document.getElementById('arc-redeem-modal')?.remove()"
          style="flex:1;padding:9px;background:#1e2535;border:1px solid #2a3a52;
          color:#566174;border-radius:8px;cursor:pointer;">Cancel</button>
      </div>
    </div>
  `;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
};

let _lookupTimeout = null;
let _resolvedRecipientId = null;

window.arcLookupRecipient = function(val) {
  const statusEl = document.getElementById('arc-gift-lookup');
  const confirmBtn = document.getElementById('arc-confirm-btn');
  _resolvedRecipientId = null;
  if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.style.opacity = '0.4'; confirmBtn.style.cursor = 'not-allowed'; }

  clearTimeout(_lookupTimeout);
  if (!val.trim()) { if (statusEl) statusEl.textContent = ''; return; }
  if (statusEl) statusEl.innerHTML = `<span style="color:#566174;">Searching...</span>`;

  _lookupTimeout = setTimeout(async () => {
    if (!window.electronAPI?.arcLookupUser) return;
    const result = await window.electronAPI.arcLookupUser(val.trim());
    if (!statusEl) return;
    if (result?.ok && result.user) {
      const u = result.user;
      const ignNote = u.ign ? ` · IGN: ${u.ign}` : '';
      statusEl.innerHTML = `<span style="color:#86efac;">✓ Found: ${escapeHtml(u.discord_name)}${escapeHtml(ignNote)}</span>`;
      _resolvedRecipientId = u.id;
      if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.style.opacity = '1'; confirmBtn.style.cursor = 'pointer'; }
    } else {
      statusEl.innerHTML = `<span style="color:#f87171;">✗ No account found with that Discord name</span>`;
    }
  }, 500);
};

window.arcConfirmRedeem = async function(rewardId, cost) {
  const reward = REWARDS.find(r => r.id === rewardId);
  if (!reward || !window.electronAPI?.arcSubmitRedemption) return;

  const auth = getAuth();
  const ign  = getIGN();
  const btn  = document.querySelector('#arc-redeem-modal button');

  const result = await window.electronAPI.arcSubmitRedemption({
    rewardId:      reward.id,
    rewardLabel:   reward.label,
    pointsSpent:   cost,
    ignSnapshot:   ign || null,
    discordName:   auth.user?.name || null,
    recipientId:   reward.category === 'gift' ? (_resolvedRecipientId || null) : null,
  });

  document.getElementById('arc-redeem-modal')?.remove();

  if (result?.ok) {
    // Re-fetch points
    const r = await window.electronAPI.arcGetMyPoints();
    if (r?.ok) { _points = r.points; window.renderCurrentPage?.(); }
  } else {
    alert('Redemption failed: ' + (result?.error || 'Unknown error'));
  }
};
