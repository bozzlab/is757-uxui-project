/* แกนกลาง: state, ยูทิลิตี, ไอคอน, toast */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const num = n => Number(n).toLocaleString('th-TH');
const clone = o => JSON.parse(JSON.stringify(o));

const ICONS = {
  frame:'<path d="M8 3v18M16 3v18M3 8h18M3 16h18"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  dash:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  feed:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  folder:'<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  tri:'<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  oct:'<path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z"/><path d="M12 8v4M12 16h.01"/>',
  circ:'<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  checkc:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/>',
  up:'<path d="M7 17 17 7M7 7h10v10"/>',
  send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  undo:'<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  dl:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  cr:'<path d="m9 18 6-6-6-6"/>', cl:'<path d="m15 18-6-6 6-6"/>', cd:'<path d="m6 9 6 6 6-6"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  trend:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  spark:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  refresh:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 16h5v5"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  mon:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  call:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  phone:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  table:'<path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18"/>',
  chart:'<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  filter:'<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  tag:'<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  hist:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
  arr:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
  grip:'<path d="M12 5v14M7 10l5-5 5 5M7 14l5 5 5-5"/>',
  sneg:'<path d="M12 19 3.5 6h17z" fill="currentColor" stroke="none"/>',
  sneu:'<rect x="4" y="10" width="16" height="4" rx="2" fill="currentColor" stroke="none"/>',
  spos:'<path d="M12 5 3.5 18h17z" fill="currentColor" stroke="none"/>',
  dot:'<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>',
  wifi:'<path d="M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M12 20h.01M2 9.5a15 15 0 0 1 20 0"/>',
};
const icon = (n, s = 18, cls = '') => `<svg class="i ${cls}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

const SEV = {
  critical: { label:'วิกฤต',     icon:'oct',  rank:5 },
  high:     { label:'สูง',       icon:'tri',  rank:4 },
  medium:   { label:'ปานกลาง',   icon:'circ', rank:3 },
  low:      { label:'ต่ำ',       icon:'info', rank:2 },
  watch:    { label:'เฝ้าดู',    icon:'eye',  rank:1 },
};
const SENT = {
  neg: { label:'เชิงลบ', icon:'sneg' },
  neu: { label:'กลาง',   icon:'sneu' },
  pos: { label:'เชิงบวก', icon:'spos' },
};
const STATUS = { new:'ใหม่', watch:'เฝ้าดู', forward:'ส่งต่อ', closed:'ปิด' };
const REASONS = [
  { id:'sarcasm', label:'ประชด / มุก', to:'neu', hint:'ผู้โพสต์ล้อเล่นหรือประชด ไม่ได้ต่อว่าหน่วยงานจริง' },
  { id:'news',    label:'อ้างข่าว / รายงานข้อเท็จจริง', to:'neu', hint:'เป็นการอ้างถึงข่าว ไม่ใช่ความรู้สึกของผู้โพสต์' },
  { id:'slang',   label:'ภาษาพูด / สแลง', to:'neg', hint:'คำที่ระบบอ่านเป็นบวก แต่บริบทเป็นลบ' },
  { id:'mixed',   label:'ข้อความผสมบวกลบ', to:'neu', hint:'มีทั้งคำต่อว่าและคำชม' },
  { id:'other',   label:'อื่น ๆ', to:'neu', hint:'ระบุเหตุผลอื่นภายหลังได้' },
];

/* ---------- เวลาแบบไทย ---------- */
const NOW_MIN = 14 * 60 + 30;
function clock(ago){
  let m = NOW_MIN - ago, prefix = '';
  if (m < 0){ m += 1440; prefix = '15 พ.ย. '; }
  const h = Math.floor(m / 60), mm = m % 60;
  return prefix + String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + ' น.';
}
function rel(ago){
  if (ago < 1) return 'เมื่อสักครู่';
  if (ago < 60) return ago + ' นาทีที่แล้ว';
  if (ago < 1440) return Math.floor(ago / 60) + ' ชม.ที่แล้ว';
  return Math.floor(ago / 1440) + ' วันที่แล้ว';
}
const THAI_NOW = '16 พ.ย. 2569 14:30 น.';

/* ---------- State กลาง ---------- */
const DEFAULTS = () => ({
  theme: 'light',
  layout: 'auto',           // auto | both
  dev: 'mobile',            // อุปกรณ์ที่โฟกัส (เมื่อไม่แสดงสองจอ)
  caseNo: 1, step: 1,
  demo: { error:false, noEdit:false, sendFail:false, taken:false, saveFail:false, slow:false },
  mentions: clone(MENTIONS),
  alerts: clone(ALERTS),
  cases: clone(CASES_SEED),
  audit: [],
  corrections: [],
  web: {
    route: 'dashboard', dashTab: 'overview',
    f: { plat:'all', range:'24h', sent:'all', src:'all' },
    threshold: 1000, views: [{ id:'default', name:'มุมมองเริ่มต้นของทีม', f:{ plat:'all', range:'24h', sent:'all', src:'all' } }], view:'default',
    loading:false, table:false, refreshedAt:'14:28', updating:false,
    deeplink:false, hl:null,
    feed: { tab:'review', q:'', plat:'all', sent:'all', onlyHigh:false, topic:null, win:false, sel:null },
    modal: null,             // {type:'correct'|'reveal'}
    corr: { id:null, reason:null, to:null, phase:'form', undoTo:null },
    reveal: { id:null, reason:'', done:{} },
    export: 'idle',
    settingsTab: 'watch',
    watchlist: ['บัตร','อายัด','บัตรเครดิต','ภัยไซเบอร์','1111','ธนบัตร','ธนบัตรปลอม','แบงก์','แบงค์','ธุรกรรม'],
    notif: { minSev:'medium', quiet:true, summaryMail:true },
    order: ['ddir','dir','sdir','media','area'],
    perms: { listener:{ comments:true, reveal:true, export:true, edit:true }, media:{ comments:false, reveal:false, export:true, edit:true }, exec:{ comments:false, reveal:false, export:false, edit:false } },
    digestSent: null,
  },
  mob: {
    screen: 'lock', tab: 'alerts', aid: 'a1', seg: 'todo', sheet: null, mid: null,
    esc: { recips: [], text:'', phase:'compose', sentAt:null, caseId:null },
    snooze: null,
  },
});
let S = DEFAULTS();

/* ---------- Toast ---------- */
function toast(msg, opt = {}){
  const box = $('#toasts'); if (!box) return;
  const t = document.createElement('div');
  t.className = 'toast ' + (opt.kind || '');
  t.innerHTML = `<span class="toast-ic">${icon(opt.kind === 'error' ? 'tri' : 'checkc', 18)}</span><span class="toast-t">${esc(msg)}</span>${opt.act ? `<button class="toast-a" data-toast-act>${esc(opt.label || 'ยกเลิก')}</button>` : ''}`;
  box.appendChild(t);
  if (opt.act) $('[data-toast-act]', t).addEventListener('click', () => { opt.act(); t.remove(); });
  setTimeout(() => t.classList.add('out'), opt.ms || 5200);
  setTimeout(() => t.remove(), (opt.ms || 5200) + 400);
}
function announce(msg){ const l = $('#live'); if (l){ l.textContent = ''; setTimeout(() => l.textContent = msg, 30); } }

/* ---------- ตัวช่วยข้อมูล ---------- */
const effSent = m => (m.fix ? m.fix.to : m.sys);
const getM = id => S.mentions.find(m => m.id === id);
const getA = id => S.alerts.find(a => a.id === id);
const lowConf = m => !m.fix && (m.conf < 60 || (m.flags && m.flags.length)) && m.src !== 'news' && !m.fake;
const reviewScore = m => m.eng * (100 - m.conf);
const hlText = m => {
  let t = esc(m.text);
  [...m.kw].sort((a, b) => b.length - a.length).forEach(k => {
    const ek = esc(k);
    t = t.replace(ek, `<mark class="kw" data-d="${effSentClass(m)}">${ek}</mark>`);
  });
  return t;
};
const effSentClass = m => m.sys;
const platBadge = k => `<span class="pb pb-${k}" title="${PLAT[k].name}"><i class="pb-m">${PLAT[k].short}</i><span>${PLAT[k].name}</span></span>`;
const sevBadge = (s, cls = '') => `<span class="sev sev-${s} ${cls}">${icon(SEV[s].icon, 16)}<b>${SEV[s].label}</b></span>`;
const sentBadge = (s, cls = '') => `<span class="sent sent-${s} ${cls}">${icon(SENT[s].icon, 14)}<b>${SENT[s].label}</b></span>`;

/* สรุปจาก series ตามตัวกรอง */
function dashData(){
  const f = S.web.f, { labels, s } = buildSeries(f.range);
  let keys = ['fb', 'x', 'tt', 'news'];
  if (f.src === 'social') keys = keys.filter(k => k !== 'news');
  if (f.src === 'news') keys = ['news'];
  if (f.plat !== 'all') keys = keys.filter(k => k === f.plat);
  const out = {};
  keys.forEach(k => { out[k] = s[k].map(v => f.sent === 'all' ? v : Math.round(v * SENT_RATIO[k][f.sent])); });
  const n = labels.length;
  const total = labels.map((_, i) => keys.reduce((a, k) => a + out[k][i], 0));
  const sum = total.reduce((a, b) => a + b, 0);
  const eng = Math.round(keys.reduce((a, k) => a + out[k].reduce((x, y) => x + y, 0) * PLAT[k].avgEng, 0));
  const sent = { neg:0, neu:0, pos:0 }, perPlat = {};
  keys.forEach(k => {
    const t = s[k].reduce((a, b) => a + b, 0);
    perPlat[k] = { neg: Math.round(t * SENT_RATIO[k].neg), neu: Math.round(t * SENT_RATIO[k].neu), pos: Math.round(t * SENT_RATIO[k].pos) };
  });
  // ผลการแก้ไขของทีมสะท้อนในตัวเลข
  S.corrections.forEach(c => { if (perPlat[c.plat]){ const p = perPlat[c.plat]; p[c.from]--; p[c.to]++; } });
  keys.forEach(k => { sent.neg += perPlat[k].neg; sent.neu += perPlat[k].neu; sent.pos += perPlat[k].pos; });
  const tot = sent.neg + sent.neu + sent.pos;
  const net = tot ? Math.round(((sent.pos - sent.neg) / tot) * 100) : 0;
  const peak = total.indexOf(Math.max(...total, 0));
  return { labels, series: out, keys, total, sum, eng, sent, perPlat, net, peak, n, empty: keys.length === 0 || sum === 0 };
}
