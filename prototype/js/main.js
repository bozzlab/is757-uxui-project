/* Shell ของการนำเสนอ: ขั้นตอนเดโม, เลย์เอาต์สองอุปกรณ์, ตัวควบคุมสถานะจำลอง */
const STEPS = [
  { n:1, c:1, t:'Push บนมือถือ', dev:'mobile', cap:'ตรวจพบเรื่องผิดปกติ <b>นอก watchlist</b> → ส่ง push ที่มี <b>หัวข้อ · ระดับ · ตัวเลขสำคัญ 1 ค่า</b> (F-10)', go(){ S.mob.screen = 'lock'; } },
  { n:2, c:1, t:'รายละเอียดแจ้งเตือน', dev:'mobile', cap:'ระดับ → เกิดอะไร → กระทบแค่ไหน → ปุ่มทำต่อ <b>ใน viewport เดียว</b> เพื่ออ่านและตัดสินใจใน ≤ 10 วินาที (F-11)', go(){ S.mob.screen = 'alert'; S.mob.aid = 'a1'; S.mob.tab = 'alerts'; } },
  { n:3, c:1, t:'ยกระดับ', dev:'mobile', cap:'ขั้นตอนเดียว: เลือกผู้รับ (ระบบแนะนำ) → ตรวจสรุป → ยืนยัน → <b>เรียกคืนได้ 60 วินาที</b> · ส่งไปช่องทางที่ใช้อยู่ (F-12)', go(){ A.escOpen({ dataset:{ v:'a1' } }); } },
  { n:4, c:1, t:'Dashboard (deep link)', dev:'web', cap:'จากมือถือ → เว็บ <b>คงตัวกรองเดิม</b> หัวข้อผิดปกติถูกไฮไลต์ พร้อมเหตุผลเทียบฐานปกติและป้าย “ประมาณการ” (F-01, F-02)', go(){ A.openWeb({}); } },
  { n:5, c:2, t:'Mention Feed · คิวตรวจ', dev:'web', cap:'คิวเรียงตาม <b>engagement × ความไม่แน่นอน</b> — โพสต์ที่ AI ไม่มั่นใจมาก่อน (F-05, F-08)', go(){ const f = S.web.feed; S.web.route = 'feed'; f.tab = 'review'; f.sel = null; f.win = false; f.topic = null; f.onlyHigh = false; } },
  { n:6, c:2, t:'รายละเอียด + หลักฐาน AI', dev:'web', cap:'อ่านในบริบท เห็น <b>คำที่จับได้ · ความมั่นใจ · ป้ายอาจเป็นประชด</b> ตัวตนผู้โพสต์ซ่อนตาม PDPA (F-07, F-15)', go(){ S.web.route = 'feed'; S.web.feed.tab = 'review'; S.web.feed.sel = 'm13'; } },
  { n:7, c:2, t:'แก้ผล', dev:'web', cap:'<b>3 ขั้นตอน:</b> กด “แก้ผล” → เลือกเหตุผลสำเร็จรูป → ยืนยัน (F-09 · DD-05)', go(){ S.web.route = 'feed'; S.web.feed.tab = 'review'; S.web.feed.sel = 'm13'; S.web.corr = { id:'m13', reason:null, to:null, phase:'form' }; S.web.modal = 'correct'; } },
  { n:8, c:2, t:'ยืนยัน + ยกเลิกได้', dev:'web', cap:'เห็นผลของการแก้ (ก่อน→หลัง) · <b>ระบบจะนำไปปรับ</b> · ยกเลิกได้ · ตัวเลข Dashboard ปรับตาม', go(){ const m = getM('m13'); S.web.route = 'feed'; S.web.feed.tab = 'all'; S.web.feed.sel = 'm13'; S.web.modal = null; m.fix = { to:'neu', reason:'sarcasm', orig:m.sys, at:'14:30 น.' }; S.corrections.push({ id:'m13', plat:m.plat, from:m.sys, to:'neu' }); } },
];
const CASES = { 1:'กรณี 1 · ตรวจพบ → แจ้งเตือน → ยกระดับ', 2:'กรณี 2 · ตรวจโพสต์ประชด → แก้ผล' };

function softReset(caseNo){
  if (caseNo === 1){
    const a = getA('a1'); a.state = 'new'; S.cases = S.cases.filter(c => !c.esc);
    S.mob.esc = { recips:[], ch:'chat', text:'', phase:'compose', sentAt:null, left:0, read:0, caseId:null }; S.mob.sheet = null; S.mob.snooze = null; S.mob.seg = 'todo';
    S.web.deeplink = false; S.web.hl = null; S.web.f = { plat:'all', range:'24h', sent:'all', src:'all' }; S.web.route = 'dashboard'; S.web.dashTab = 'overview'; S.web.modal = null;
    clearInterval(_undoT); clearTimeout(_readT);
  } else {
    const m = getM('m13'); delete m.fix; S.corrections = S.corrections.filter(c => c.id !== 'm13'); S.web.modal = null; S.web.deeplink = false;
  }
}
function goStep(n, keepDev){
  const s = STEPS.find(x => x.n === n); if (!s) return;
  S.caseNo = s.c; S.step = n; softReset(s.c);
  s.go();
  S.dev = s.dev; S.layout = keepDev ? S.layout : 'follow';
  applyLayout(); renderWeb({ top:true, openModal:true }); renderMob(); renderBar();
  try { history.replaceState(null, '', '#s' + n); } catch (e) {}
  announce('ขั้นที่ ' + n + ': ' + s.t);
}
function resetAll(){
  const keep = { theme:S.theme, layout:S.layout, demo:S.demo };
  clearInterval(_undoT); clearTimeout(_readT);
  S = DEFAULTS(); Object.assign(S, keep);
  goStep(1);
  toast('รีเซ็ตข้อมูลเดโมแล้ว');
}

/* ---------- presenter bar ---------- */
function fitsOk(){ const ad = $('#ad'); return !!ad && ad.scrollHeight <= ad.clientHeight + 1; }
function renderBar(){
  const st = STEPS.find(x => x.n === S.step), list = STEPS.filter(x => x.c === S.caseNo), D = S.demo;
  const sw = (k, t, d) => `<label class="sw"><input type="checkbox" data-demo="${k}" ${D[k] ? 'checked' : ''}><span><b>${t}</b><br><span style="color:var(--muted);font-size:12.5px">${d}</span></span></label>`;
  const showFit = S.mob.screen === 'alert' && S.dev === 'mobile';
  $('#pbar').innerHTML = `<div class="pbar-row">
    <div class="brand"><span class="brand-mark">${icon('wifi', 17)}</span><div>สัญญาณ<small>Social Monitoring · Prototype</small></div></div>
    <div class="cases" role="group" aria-label="กรณีการใช้งาน">${[1, 2].map(c => `<button class="cs" data-act="pcase" data-v="${c}" aria-pressed="${S.caseNo === c}">${icon(c === 1 ? 'bell' : 'sliders', 15)}<span class="lbl">${CASES[c]}</span><span class="lbl" style="display:none"></span></button>`).join('')}</div>
    <nav class="steps" aria-label="ขั้นตอนของกรณี">${list.map(s => `<button class="step ${s.n < S.step ? 'done' : ''}" data-act="pstep" data-v="${s.n}" ${s.n === S.step ? 'aria-current="step"' : ''}><b>${s.n}</b><span>${s.t}</span></button>`).join('')}</nav>
    <div class="pctl">
      <div class="seg" role="group" aria-label="อุปกรณ์" style="background:#12262e">${[['phone', 'phone', 'มือถือ'], ['web', 'mon', 'เว็บ'], ['both', 'grip', 'สองจอ']].map(([k, ic, lb]) => `<button class="pb-btn" style="border:0;border-radius:8px;min-width:34px;${curLayout() === k ? 'background:#E8F0F2;color:#0A1A22' : ''}" data-act="playout" data-v="${k}" aria-pressed="${curLayout() === k}" aria-label="${lb}" title="${lb}">${icon(ic === 'grip' ? 'dash' : ic, 16)}</button>`).join('')}</div>
      <button class="pb-btn" data-act="ptheme" aria-label="สลับโหมดมืด/สว่าง" title="โหมดมืด/สว่าง">${icon(S.theme === 'dark' ? 'sun' : 'moon', 16)}</button>
      <div class="dd"><button class="pb-btn" data-act="pdd" aria-expanded="${!!S.ddOpen}" aria-haspopup="true">${icon('sliders', 16)}สถานะจำลอง</button>
        ${S.ddOpen ? `<div class="dd-menu" role="dialog" aria-label="สถานะจำลอง"><h4>สถานะจำลอง</h4><p>ใช้โชว์สถานะ error/ไม่มีสิทธิ์/ล้มเหลวตาม §5.4 (เปิดแล้วลองกดใช้งานจริงได้)</p>
          ${sw('error', 'ข้อมูลโหลดไม่สำเร็จ', 'Dashboard แสดง error · Export ล้มเหลว')}${sw('saveFail', 'บันทึกการแก้ผลไม่สำเร็จ', 'เห็นสถานะผิดพลาด + ลองใหม่')}${sw('noEdit', 'ผู้ใช้ไม่มีสิทธิ์แก้ผล/เปิดตัวตน', 'ปุ่มถูกปิดพร้อมเหตุผล')}${sw('sendFail', 'ยกระดับส่งไม่สำเร็จ', 'เก็บเป็นฉบับร่าง + ลองส่งใหม่')}${sw('taken', 'มีผู้อื่นรับเรื่องแล้ว', 'แจ้งเตือนมือถือแสดงสถานะ')}${sw('slow', 'เครือข่ายช้า', 'เห็นสถานะกำลังโหลด/บันทึกนานขึ้น')}
          <button class="btn sm block" style="margin-top:8px" data-act="preset">${icon('undo', 14)}รีเซ็ตข้อมูลเดโมทั้งหมด</button></div>` : ''}</div>
    </div></div>
    <div class="pcap" role="status"><span><b>ขั้น ${S.step}/8 · ${st.t}</b> — ${st.cap}${showFit ? ` · <b style="color:#7FE0A8">${fitsOk() ? '✓ อยู่ใน viewport เดียว ไม่ต้องเลื่อน' : '⚠ ต้องเลื่อน'}</b>` : ''}</span><span class="kbd"><kbd>←</kbd> <kbd>→</kbd> เปลี่ยนขั้น</span></div>`;
}
function curLayout(){ return S.layout === 'follow' ? (isWide() ? 'both' : S.dev === 'web' ? 'web' : 'phone') : S.layout; }
const isWide = () => ($('#stage') ? $('#stage').clientWidth : innerWidth) >= 1560;

/* ---------- เลย์เอาต์สองอุปกรณ์ ---------- */
function applyLayout(){
  const web = $('.dev-web'), ph = $('.dev-phone'), l = curLayout();
  web.classList.toggle('on', l === 'web' || l === 'both'); ph.classList.toggle('on', l === 'phone' || l === 'both');
  fit();
}
function fit(){
  const stage = $('#stage'); if (!stage) return;
  const cs = getComputedStyle(stage), padX = parseFloat(cs.paddingLeft) * 2, padY = parseFloat(cs.paddingTop) * 2, gap = 28;
  const H = stage.clientHeight - padY, W = stage.clientWidth - padX;
  const web = $('.dev-web'), ph = $('.dev-phone'), br = $('.browser'), phone = $('.phone');
  const both = web.classList.contains('on') && ph.classList.contains('on'), tiny = innerWidth <= 640;
  let pw = 0;
  if (ph.classList.contains('on')){
    if (tiny){ phone.style.zoom = ''; ph.style.width = '100%'; ph.style.height = stage.clientHeight + 'px'; pw = W; }
    else { const s = Math.min(1, H / 844, W / 390); phone.style.zoom = s < 1 ? s : ''; ph.style.width = ''; ph.style.height = ''; pw = 390 * s; }
  }
  if (web.classList.contains('on')){
    const avail = Math.max(300, W - (both ? pw + gap : 0)), DW = Math.max(1180, Math.min(avail, 1600)), s = Math.min(1, avail / DW);
    br.style.width = DW + 'px'; br.style.height = (H / s) + 'px'; br.style.zoom = s < 1 ? s : '';
    web.style.width = (DW * s) + 'px';
  }
  if (!ph.classList.contains('on')) ph.style.width = '';
}

/* ---------- ตัวจัดการเหตุการณ์ ---------- */
Object.assign(A, {
  pcase(el){ goStep(el.dataset.v === '1' ? 1 : 5); },
  pstep(el){ goStep(+el.dataset.v); },
  playout(el){ S.layout = el.dataset.v; if (S.layout === 'phone') S.dev = 'mobile'; if (S.layout === 'web') S.dev = 'web'; applyLayout(); renderBar(); },
  ptheme(){ S.theme = S.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = S.theme; renderBar(); try { sessionStorage.setItem('sg-theme', S.theme); } catch (e) {} },
  pdd(){ S.ddOpen = !S.ddOpen; renderBar(); },
  preset(){ S.ddOpen = false; resetAll(); },
  welcomeGo(el){ closeWelcome(); goStep(+el.dataset.v || 1); },
  welcomeFree(){ closeWelcome(); },
});
function syncDemo(){ renderBar(); renderWeb(); renderMob(); }

document.addEventListener('click', e => {
  if (S.ddOpen && !e.target.closest('.dd')){ S.ddOpen = false; renderBar(); }
  const el = e.target.closest('[data-act]'); if (!el || el.tagName === 'SELECT') return;
  const fn = A[el.dataset.act]; if (!fn) return;
  fn(el, e);
  if (el.closest('#mob')) setTimeout(renderBar, 0);
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches('select[data-act]')){ A[t.dataset.act](t, e); return; }
  if (t.matches('[data-demo]')){ S.demo[t.dataset.demo] = t.checked; if (t.dataset.demo === 'error'){ S.web.loading = false; } syncDemo(); toast((t.checked ? 'เปิด' : 'ปิด') + 'สถานะจำลอง'); }
  if (t.matches('[data-live="thr"]')){ S.web.threshold = +t.value; renderWeb(); toast('ปรับเกณฑ์ engagement แล้ว'); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'fq'){ S.web.feed.q = t.value; const l = $('#flist'); if (l) l.innerHTML = feedList(feedItems()); }
  if (t.matches('[data-live="thr"]')){ const v = +t.value; $('#thr-v').textContent = '≥ ' + num(v); $('#thr-n').textContent = S.mentions.filter(m => m.eng >= v).length; }
  if (t.matches('[data-live="esc"]')) S.mob.esc.text = t.value;
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form="addwatch"]'); if (!f) return; e.preventDefault();
  const v = $('#wl', f).value.trim(); if (!v) return toast('พิมพ์คำที่ต้องการเพิ่มก่อน', { kind:'error' });
  S.web.watchlist.push(v); renderWeb(); toast('เพิ่ม “' + v + '” แล้ว');
});
document.addEventListener('keydown', e => {
  const tg = e.target, typing = /INPUT|TEXTAREA|SELECT/.test(tg.tagName);
  if (e.key === 'Escape'){
    if (S.ddOpen){ S.ddOpen = false; renderBar(); return; }
    if (S.web.modal){ A.closeModal(); return; }
    if (S.mob.sheet){ S.mob.sheet = null; renderMob(); return; }
  }
  if ((e.key === 'Enter' || e.key === ' ') && tg.getAttribute && tg.getAttribute('role') === 'button' && tg.dataset.act){ e.preventDefault(); A[tg.dataset.act](tg, e); return; }
  if (!typing && !e.metaKey && !e.ctrlKey && !$('#welcome').firstChild){
    if (e.key === 'ArrowRight') goStep(Math.min(8, S.step + 1));
    if (e.key === 'ArrowLeft') goStep(Math.max(1, S.step - 1));
  }
  if (S.web.modal && e.key === 'Tab'){        // focus trap แบบเบา
    const mod = $('#web .modal'); if (!mod) return;
    const f = $$('button:not([disabled]),[href],input,select,textarea', mod); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    else if (!mod.contains(document.activeElement)){ e.preventDefault(); first.focus(); }
  }
});
addEventListener('resize', () => { applyLayout(); renderBar(); });

/* ---------- Welcome ---------- */
function showWelcome(){
  $('#welcome').innerHTML = `<div class="welcome" role="dialog" aria-modal="true" aria-labelledby="wt"><div class="wcard">
    <div style="display:flex;gap:12px;align-items:center"><span class="brand-mark" style="width:46px;height:46px;border-radius:14px">${icon('wifi', 24)}</span><div><h1 id="wt">สัญญาณ · ต้นแบบเชิงโต้ตอบ</h1><div class="hint">Social Monitoring Platform สำหรับฝ่ายสื่อสารหน่วยงานภาครัฐ · IS757</div></div></div>
    <p style="margin-top:14px">ต้นแบบนี้ประกอบด้วย <b>Dashboard</b> และ <b>Mention Feed</b> บนเว็บ กับ <b>Alert & Escalation</b> บนมือถือ ใช้ข้อมูลสมมติทั้งหมด กดได้จริงทุกปุ่มสำคัญ</p>
    <div class="wgrid"><button class="wc" data-act="welcomeGo" data-v="1"><span class="tag">กรณีที่ 1 · มือถือ → เว็บ</span><b>ตรวจพบพุ่งผิดปกติ → ยกระดับ</b><span class="d">Push → ตัดสินใจใน 10 วินาที → ยกระดับขั้นตอนเดียว → Dashboard</span><em>4 หน้าจอ</em></button>
      <button class="wc" data-act="welcomeGo" data-v="5"><span class="tag">กรณีที่ 2 · เว็บ</span><b>โพสต์ประชด → แก้ผลความรู้สึก</b><span class="d">คิวตรวจ → หลักฐานของ AI → แก้ผลใน 3 ขั้นตอน → ยกเลิกได้</span><em>4 หน้าจอ</em></button></div>
    <div class="wfoot"><button class="btn" data-act="welcomeFree">ลองใช้อิสระ</button><span class="hint">เคล็ดลับ: ใช้ปุ่ม <kbd style="background:var(--surface-3);color:var(--ink);border-color:var(--line)">←</kbd> <kbd style="background:var(--surface-3);color:var(--ink);border-color:var(--line)">→</kbd> เปลี่ยนขั้น · เมนู “สถานะจำลอง” โชว์ error / ไม่มีสิทธิ์ / ล้มเหลว</span></div>
  </div></div>`;
  const b = $('#welcome .wc'); b && b.focus();
}
function closeWelcome(){ $('#welcome').innerHTML = ''; try { sessionStorage.setItem('sg-seen', '1'); } catch (e) {} }

/* ---------- เริ่มต้น ---------- */
(function init(){
  try { const t = sessionStorage.getItem('sg-theme'); if (t){ S.theme = t; document.documentElement.dataset.theme = t; } } catch (e) {}
  const m = /^#s(\d)$/.exec(location.hash), n = m ? Math.min(8, Math.max(1, +m[1])) : 1;
  S.step = n; renderWeb(); renderMob();
  goStep(n);
  let seen = false; try { seen = sessionStorage.getItem('sg-seen') === '1'; } catch (e) {}
  if (!seen && !m) showWelcome();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fit(); renderBar(); });
})();
