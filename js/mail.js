// ─── USER MAIL SYSTEM ─────────────────────────────────────────────────────────
// Handles the in-app mail envelope, realtime new-mail events, sound, and modal.

import { escapeHtml } from './utils.js';

let _unreadMail = []; // cache of unread mail items

// ─── SOUND ────────────────────────────────────────────────────────────────────

function playMailSound() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 — soft ascending chime

    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const start = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);

      osc.start(start);
      osc.stop(start + 0.6);
    });
  } catch(e) {}
}

// ─── ENVELOPE UI ─────────────────────────────────────────────────────────────

function showEnvelope(count) {
  const el    = document.getElementById('mail-envelope');
  const badge = document.getElementById('mail-badge');
  if (!el) return;
  el.style.display = 'flex';
  if (badge) badge.textContent = count > 9 ? '9+' : count;
}

function hideEnvelope() {
  const el = document.getElementById('mail-envelope');
  if (el) el.style.display = 'none';
}

function refreshEnvelope() {
  const unread = _unreadMail.filter(m => !m.is_read);
  if (unread.length > 0) showEnvelope(unread.length);
  else hideEnvelope();
}

// ─── MAIL MODAL ───────────────────────────────────────────────────────────────

window.openMailModal = async function() {
  document.getElementById('mail-modal')?.remove();

  // Fetch fresh mail
  if (window.electronAPI?.arcGetMyMail) {
    const result = await window.electronAPI.arcGetMyMail();
    if (result?.ok) _unreadMail = result.mail || [];
  }

  const modal = document.createElement('div');
  modal.id = 'mail-modal';
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.6);
    display:flex;align-items:center;justify-content:center;z-index:9999;`;

  const unread = _unreadMail.filter(m => !m.is_read);
  const read   = _unreadMail.filter(m => m.is_read);

  modal.innerHTML = `
    <div style="background:#1a2535;border:1px solid #2a3a52;border-radius:12px;
      padding:24px;width:520px;max-width:95vw;max-height:85vh;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h3 style="margin:0;color:#eef2f7;">✉ Mail</h3>
        <button onclick="document.getElementById('mail-modal')?.remove()"
          style="background:none;border:none;color:#566174;font-size:18px;cursor:pointer;">✕</button>
      </div>

      ${unread.length === 0 && read.length === 0 ? `
        <div style="text-align:center;padding:30px 0;color:#394252;">No mail yet.</div>
      ` : ''}

      ${unread.length > 0 ? `
        <div style="font-size:11px;color:#566174;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">
          Unread (${unread.length})
        </div>
        ${unread.map(m => mailRow(m, true)).join('')}
      ` : ''}

      ${read.length > 0 ? `
        <div style="font-size:11px;color:#394252;text-transform:uppercase;letter-spacing:0.08em;
          margin-top:${unread.length ? '20px' : '0'};margin-bottom:10px;">
          Read
        </div>
        ${read.map(m => mailRow(m, false)).join('')}
      ` : ''}
    </div>
  `;

  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);

  // Mark all unread as read
  for (const m of unread) {
    m.is_read = true;
    window.electronAPI?.arcMarkMailRead(m.id);
  }
  refreshEnvelope();
};

function mailRow(mail, isUnread) {
  const date = mail.created_at
    ? new Date(mail.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';

  return `
    <div style="background:${isUnread ? '#0f1923' : '#0a1018'};
      border:1px solid ${isUnread ? '#2a3a52' : '#1a2535'};
      border-radius:8px;padding:14px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:8px;">
          ${isUnread ? `<span style="width:7px;height:7px;border-radius:50%;background:#93c5fd;display:inline-block;flex-shrink:0;"></span>` : ''}
          <span style="font-weight:${isUnread ? '700' : '400'};color:#eef2f7;font-size:14px;">
            ${escapeHtml(mail.subject)}
          </span>
        </div>
        <span style="font-size:11px;color:#394252;white-space:nowrap;margin-left:12px;">${escapeHtml(date)}</span>
      </div>
      <div style="font-size:12px;color:#566174;margin-bottom:8px;">
        From: <span style="color:#8d99ab;">${escapeHtml(mail.sender_name || 'Ashkan')}</span>
      </div>
      <div style="font-size:13px;color:#cbd5e1;line-height:1.6;white-space:pre-wrap;">
        ${escapeHtml(mail.body)}
      </div>
    </div>
  `;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

export async function initMailSystem() {
  if (!window.electronAPI) return;

  // Load existing unread mail on startup
  const result = await window.electronAPI.arcGetMyMail();
  if (result?.ok) {
    _unreadMail = result.mail || [];
    refreshEnvelope();
  }

  // Realtime — fires the moment Ashkan sends mail
  window.electronAPI.onNewMail((mail) => {
    _unreadMail.unshift(mail);
    playMailSound();
    showEnvelope(_unreadMail.filter(m => !m.is_read).length);
  });
}
