/* มือถือ (M3 Alert & Escalation) — Alert-first, ตัดสินใจใน 10 วินาที */
function renderMob(){
  const root = $('#mob'); if (!root) return;
  const m = S.mob, sc = m.screen;
  let inner;
  if (sc === 'lock') inner = lockView();
  else {
    const body = { alerts: mAlerts, alert: mAlertDetail, escalate: mEscalate, feed: mFeed, post: mPost, summary: mSummary, cases: mCases }[sc]();
    const showTabs = ['alerts', 'feed', 'summary', 'cases'].includes(sc);
    inner = `<div class="m-status" aria-hidden="true"><span class="num">14:30</span><span>${icon('wifi', 16)}<svg width="26" height="13" viewBox="0 0 26 13" aria-hidden="true"><rect x=".5" y=".5" width="22" height="12" rx="3.5" fill="none" stroke="currentColor"/><rect x="2" y="2" width="16" height="9" rx="2" fill="currentColor"/><rect x="23.5" y="4" width="2" height="5" rx="1" fill="currentColor"/></svg></span></div>
    <div class="m-body">${body}${m.sheet ? sheetView() : ''}</div>${showTabs ? tabbar() : ''}`;
  }
  root.innerHTML = inner + '<div class="m-home" aria-hidden="true"></div>';
  const sh = $('.sheet [data-first]', root); if (sh && m._sheetFocus){ sh.focus(); m._sheetFocus = false; }
}
const mt = () => S.mob;
function tabbar(){
  const m = S.mob, n = S.alerts.filter(a => a.state === 'new').length;
  const T = [['alerts', 'bell', 'แจ้งเตือน'], ['feed', 'feed', 'ฟีด'], ['summary', 'chart', 'สรุป'], ['cases', 'folder', 'เคส']];
  return `<nav class="m-tabs" aria-label="เมนูหลักมือถือ">${T.map(([k, ic, lb]) => `<button class="m-tab" data-act="mtab" data-v="${k}" ${m.tab === k ? 'aria-current="page"' : ''}>${icon(ic, 24)}<span>${lb}</span>${k === 'alerts' && n ? `<span class="bdg" aria-label="${n} รายการรอตัดสินใจ">${n}</span>` : ''}</button>`).join('')}</nav>`;
}

/* 1) Push บน lock screen */
function lockView(){
  const a = getA('a1');
  return `<div class="lock"><div class="st" aria-hidden="true"><span></span><span>${icon('wifi', 16)}</span></div>
    <div class="dt">วันจันทร์ที่ 16 พฤศจิกายน</div><div class="tm num" aria-label="เวลา 14:12">14:12</div>
    <div class="notis" role="region" aria-label="การแจ้งเตือน">
      <button class="noti main" data-act="openAlert" data-v="a1" aria-label="แจ้งเตือนวิกฤต ภัยไซเบอร์ ตัดบัตรรัว ${a.big} ของปกติ เปิดรายละเอียด">
        <div class="h"><span class="ai">${icon('wifi', 14)}</span><span>สัญญาณ</span><span>ตอนนี้</span></div>
        <div class="tt"><span class="sv">${icon('oct', 13)}วิกฤต</span>ภัยไซเบอร์: ตัดบัตรรัว</div>
        <div class="bd">พุ่ง <b class="num">${a.big}</b> ของปกติ · ${num(a.mph)} โพสต์/ชม. — ยังไม่อยู่ใน watchlist</div></button>
      <div class="noti dim" aria-hidden="true"><div class="h"><span class="ai" style="background:#6b7a86">${icon('wifi', 14)}</span><span>สัญญาณ</span><span>1 ชม. ที่แล้ว</span></div><div class="tt" style="font-size:14px">ธนบัตรปลอมระบาดตลาดนัด · สูง</div></div>
    </div>
    <div class="hintt">${icon('up', 14)} แตะแจ้งเตือนเพื่อดูรายละเอียด</div><div class="hbar"></div></div>`;
}

/* แท็บ แจ้งเตือน */
function mAlerts(){
  const m = S.mob, A_ = S.alerts;
  const todo = A_.filter(a => a.state === 'new'), watch = A_.filter(a => a.state === 'watch' || a.state === 'ack'), done = A_.filter(a => a.state === 'closed' || a.state === 'escalated');
  const lists = { todo, watch, done }, L = lists[m.seg].slice().sort((a, b) => SEV[b.sev].rank - SEV[a.sev].rank);
  return `<div class="m-hd"><h1>แจ้งเตือน</h1><div class="sub">${icon('clock', 14)}อัปเดตล่าสุด 14:28 น. · TikTok ล่าช้า ~25 นาที</div></div>
  <div class="m-seg" role="tablist" aria-label="สถานะ">${[['todo', 'ต้องตัดสินใจ', todo.length], ['watch', 'เฝ้าดู', watch.length], ['done', 'ดำเนินการแล้ว', done.length]].map(([k, l, n]) => `<button class="chip" role="tab" data-act="mseg" data-v="${k}" aria-selected="${m.seg === k}" aria-pressed="${m.seg === k}">${l} <span class="num">${n}</span></button>`).join('')}</div>
  <div class="m-scroll">${L.length ? L.map(a => `<button class="ac-card ${a.state === 'closed' || a.state === 'escalated' ? 'done' : ''}" data-s="${a.sev}" data-act="openAlert" data-v="${a.id}">
    <div class="r1">${sevBadge(a.sev)}<span class="num">${clock(a.ago)}</span></div><div class="tt">${a.title}</div><div class="why">${a.why}</div>
    <div class="nm"><b class="num">${a.big}</b> ${a.bigLabel} · <span class="num">${num(a.mph)}</span> โพสต์/ชม. ${a.state === 'watch' && S.mob.snooze && a.id === S.mob.snooze.id ? `<span class="tagoff" style="margin-left:auto">เตือนอีก ${S.mob.snooze.at}</span>` : ''}${a.state === 'escalated' ? '<span class="tagoff" style="margin-left:auto;background:var(--pos-bg);color:var(--pos)">ยกระดับแล้ว</span>' : ''}</div></button>`).join('')
    : `<div class="empty"><div class="ill">${icon('checkc', 26)}</div><b>ไม่มีรายการในหมวดนี้</b><span>เมื่อมีเรื่องผิดปกติ ระบบจะ push ให้ทันที</span></div>`}</div>`;
}

/* 2) รายละเอียดแจ้งเตือน — อ่านและตัดสินใจใน viewport เดียว */
function mAlertDetail(){
  const m = S.mob, a = getA(m.aid), st = a.state, top = S.mentions.filter(x => x.topic === a.topic && x.src !== 'news').sort((x, y) => y.eng - x.eng)[0];
  const spark = sparkline();
  let status = '';
  if (S.demo.taken && st === 'new') status = `<div class="mstate warn" role="status">${icon('user', 17)}<span>คุณธนา รับเรื่องนี้แล้ว 14:20 น. — ยกระดับต่อหรือรับทราบได้</span></div>`;
  else if (st === 'ack') status = `<div class="mstate ok" role="status">${icon('checkc', 17)}<span>รับทราบแล้ว 14:30 น. · ทีมเห็นสถานะนี้</span></div>`;
  else if (st === 'watch' && m.snooze) status = `<div class="mstate watch" role="status">${icon('eye', 17)}<span>เฝ้าดู — จะเตือนอีกครั้ง ${m.snooze.at}</span></div>`;
  else if (st === 'escalated') status = `<div class="mstate ok" role="status">${icon('send', 17)}<span>ยกระดับแล้ว · ${m.esc.caseId || ''}</span></div>`;
  const escDone = st === 'escalated';
  return `<div class="m-nav"><button class="m-icon" data-act="mback" aria-label="กลับ">${icon('cl', 24)}</button><div class="t">แจ้งเตือน</div><span class="m-icon" aria-hidden="true"></span></div>
  <div class="ad" id="ad">
    <div class="ad-sev sev-${a.sev}"><span>${icon(SEV[a.sev].icon, 26)}</span><div><div class="s">${SEV[a.sev].label}</div><div class="w">${icon('info', 13)} ${a.why}</div></div></div>
    <h2>${a.title}</h2><div class="tm">${icon('clock', 13)}<span class="num">ตรวจพบ ${clock(a.ago)} · ${rel(a.ago)}</span>${a.off ? '<span class="tagoff" style="margin-left:6px">นอก watchlist</span>' : ''}</div>
    <p class="what">${a.what}</p>
    <div class="stats"><div class="stat big"><b class="num">${a.big}</b><span>${a.bigLabel} (ประมาณการ)</span></div><div class="stat"><b class="num">${num(a.mph)}</b><span>โพสต์ / ชม.</span></div><div class="stat"><b class="num">${a.hi}</b><span>โพสต์เกินเกณฑ์</span></div></div>
    <div class="spk m-hide-s">${spark}<span>FB ${a.mix.fb}% · X ${a.mix.x}% · TT ${a.mix.tt}%</span></div>
    <div class="cov-note m-hide-s">${icon('clock', 13)}TikTok ข้อมูลล่าช้า ~25 นาที ตัวเลขอาจต่ำกว่าจริง</div>
    ${top ? `<div class="toppost m-hide-s">${icon('zap', 15)}<span>${esc(top.text)}</span><b class="num">${num(top.eng)}</b></div>` : ''}
    ${status}
    <div class="ad-act">
      ${escDone ? `<button class="mbtn" data-act="openWeb" data-v="${a.id}">${icon('mon', 19)}เปิดบนเว็บ</button>` :
      `<button class="mbtn primary" data-act="escOpen" data-v="${a.id}">${icon('send', 20)}ยกระดับ</button>
      <div class="row"><button class="mbtn" data-act="ack" data-v="${a.id}" ${st === 'ack' ? 'disabled aria-disabled="true"' : ''}>${icon('check', 20)}รับทราบ</button><button class="mbtn" data-act="watchOpen" data-v="${a.id}">${icon('eye', 20)}เฝ้าดู</button></div>
      <button class="mlink" data-act="openWeb" data-v="${a.id}">${icon('mon', 17)}เปิดบนเว็บ (คงตัวกรองเดิม) ${icon('up', 14)}</button>`}
    </div></div>`;
}
function sparkline(){
  const v = buildSeries('24h'), t = v.labels.map((_, i) => v.s.fb[i] + v.s.x[i] + v.s.tt[i] + v.s.news[i]), mx = Math.max(...t);
  const pts = t.map((x, i) => `${(i / (t.length - 1) * 100).toFixed(1)},${(30 - x / mx * 28).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 100 32" preserveAspectRatio="none" role="img" aria-label="แนวโน้ม 24 ชั่วโมง พุ่งขึ้นช่วงท้าย"><polyline points="${pts}" fill="none" stroke="var(--crit)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/><circle cx="100" cy="${30 - t[t.length - 1] / mx * 28}" r="2.5" fill="var(--crit)"/></svg>`;
}

/* 3) ยกระดับ — ขั้นตอนเดียว: ผู้รับ → สรุป → ยืนยัน → ส่งแล้ว */
function escText(a){
  return `[ยกระดับ · ${SEV[a.sev].label}] ${a.title}\n• ตรวจพบ ${clock(a.ago)} — ${num(a.mph)} โพสต์/ชม. (${a.big} ของปกติ)${a.off ? ' · นอก watchlist' : ''}\n• โพสต์เกินเกณฑ์ engagement ${a.hi} โพสต์ · FB ${a.mix.fb}% · X ${a.mix.x}% · TikTok ${a.mix.tt}%\n• ข้อควรระวัง: TikTok ล่าช้า ~25 นาที / ค่านี้เป็นประมาณการของระบบ\n• รายละเอียด: signal.example/a/${a.id.toUpperCase()}-1042\nส่งโดย คุณใบเตย · ฝ่ายสื่อสาร`;
}
function mEscalate(){
  const m = S.mob, e = m.esc, a = getA(m.aid), ph = e.phase;
  if (ph === 'sent') return mSent();
  const chans = [['chat', 'แชทสายงาน', 'msg'], ['mail', 'อีเมล FYI', 'mail'], ['copy', 'คัดลอก', 'copy']];
  const recipients = Object.keys(PEOPLE);
  const busy = ph === 'sending';
  return `<div class="m-nav"><button class="m-icon" data-act="escBack" aria-label="กลับ" ${busy ? 'disabled' : ''}>${icon('cl', 24)}</button><div class="t">ยกระดับเรื่องนี้</div><span class="m-icon" aria-hidden="true"></span></div>
  <div class="m-scroll" style="padding-bottom:10px">
    <div class="ad-sev sev-${a.sev}" style="padding:8px 12px"><span>${icon(SEV[a.sev].icon, 22)}</span><div><div class="s" style="font-size:15px">${SEV[a.sev].label} · ${a.short}</div></div></div>
    ${ph === 'failed' ? `<div class="mstate err" role="alert" style="margin-top:10px">${icon('tri', 18)}<span><b>ส่งไม่สำเร็จ</b> — เก็บเป็นฉบับร่างให้แล้ว ลองส่งใหม่ได้</span></div>` : ''}
    <div class="es-sec">① ผู้รับ <span class="sug">แนะนำตามประเภทเรื่อง</span></div>
    ${recipients.map(k => `<button class="rc" role="checkbox" aria-checked="${e.recips.includes(k)}" data-act="togRc" data-v="${k}" ${busy ? 'disabled' : ''}><span class="ck">${icon('check', 16)}</span><div style="flex:1"><b>${PEOPLE[k].name}</b><small>${PEOPLE[k].who} · ${PEOPLE[k].ch}</small></div>${a.recips.includes(k) ? '<span class="sug" style="margin-left:0">แนะนำ</span>' : ''}</button>`).join('')}
    <div class="es-sec">② ช่องทาง</div>
    <div class="seg" role="group" aria-label="ช่องทาง" style="display:flex;width:100%">${chans.map(([k, l, ic]) => `<button data-act="setCh" data-v="${k}" aria-pressed="${e.ch === k}" style="flex:1;justify-content:center;min-height:44px" ${busy ? 'disabled' : ''}>${icon(ic, 16)}${l}</button>`).join('')}</div>
    <div class="es-sec">③ ตรวจสรุปก่อนส่ง <span class="hint" style="font-weight:400">· แก้ไขได้</span></div>
    <label class="sr" for="sum">สรุปที่จะส่ง</label><textarea id="sum" class="sumbox" data-live="esc" ${busy ? 'disabled' : ''}>${esc(e.text)}</textarea>
  </div>
  <div style="padding:10px 16px 28px;border-top:1px solid var(--line);flex:none"><button class="mbtn brand block" style="width:100%" data-act="escReview" ${e.recips.length ? '' : 'aria-disabled="true"'}>${ph === 'failed' ? icon('refresh', 20) + 'ลองส่งใหม่' : icon('send', 20) + 'ส่งถึง ' + e.recips.length + ' ผู้รับ'}</button>${e.recips.length ? '' : '<p class="hint" style="text-align:center;margin:6px 0 0">เลือกผู้รับอย่างน้อย 1 รายการ</p>'}</div>`;
}
function mSent(){
  const e = S.mob.esc, a = getA(S.mob.aid), left = e.left;
  return `<div class="m-nav"><span class="m-icon" aria-hidden="true"></span><div class="t">ส่งแล้ว</div><button class="m-icon" data-act="escDone" aria-label="เสร็จสิ้น">${icon('x', 22)}</button></div>
  <div class="m-scroll"><div class="sent-ok" role="status"><div class="big">${icon('checkc', 40)}</div><h2 style="margin:0;font-size:22px">ยกระดับแล้ว</h2><div class="hint">${e.sentAt} · ${e.caseId} · บันทึกในเคสแล้ว</div></div>
    <div class="mc" style="margin-top:10px"><h4>สถานะการส่ง</h4>${e.recips.map((k, i) => `<div class="dl"><span class="avatar" style="width:34px;height:34px;font-size:13px">${PEOPLE[k].who.slice(3, 4)}</span><div><b>${PEOPLE[k].name}</b><div class="hint">${PEOPLE[k].who}</div></div><span class="st2 ${i < e.read ? 'read' : ''}">${i < e.read ? icon('checkc', 14) + ' อ่านแล้ว' : icon('send', 14) + ' ส่งแล้ว'}</span></div>`).join('')}</div>
    <div class="mc"><h4>เรียกคืน / แก้ไข</h4><p class="hint" style="margin:0 0 10px" id="undo-p">${left > 0 ? `ยังเรียกคืนได้อีก <span class="cd" id="cd">${left}</span> วินาที — หลังจากนั้นผู้รับอาจอ่านแล้ว` : 'พ้นเวลาเรียกคืนแล้ว — ส่งข้อความติดตามผลในแชทได้'}</p>
      <button class="mbtn block" style="width:100%;min-height:48px" data-act="escUndo" ${left > 0 ? '' : 'disabled aria-disabled="true"'}>${icon('undo', 18)}เรียกคืนและแก้ไข</button></div>
    <button class="mlink block" style="width:100%" data-act="openWeb" data-v="${a.id}">${icon('mon', 17)}เปิดบนเว็บเพื่อดูเคส ${icon('up', 14)}</button></div>`;
}

/* ฟีด / สรุป / เคส */
function mFeed(){
  const L = S.mentions.filter(lowConf).sort((a, b) => reviewScore(b) - reviewScore(a)).concat(S.mentions.filter(m => !lowConf(m)).sort((a, b) => a.ago - b.ago)).slice(0, 10);
  return `<div class="m-hd"><h1>ฟีด</h1><div class="sub">โพสต์ที่ควรดูก่อนอยู่บนสุด · แก้ผลได้บนเว็บ</div></div>
  <div class="m-scroll">${L.map(x => `<button class="msq" data-act="openPost" data-v="${x.id}"><div style="flex:1;min-width:0"><div style="display:flex;gap:8px;align-items:center;font-size:12px;color:var(--muted)">${platBadge(x.plat)}<span style="margin-left:auto" class="num">${clock(x.ago)}</span></div><div class="tx">${esc(x.text)}</div><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">${sentBadge(effSent(x))}${lowConf(x) ? `<span class="warnchip">${icon('tri', 12)}มั่นใจต่ำ ${x.conf}%</span>` : ''}<span class="stat-chip num">${icon('zap', 12)}${num(x.eng)}</span></div></div></button>`).join('')}</div>`;
}
function mPost(){
  const x = getM(S.mob.mid);
  return `<div class="m-nav"><button class="m-icon" data-act="mback" aria-label="กลับ">${icon('cl', 24)}</button><div class="t">โพสต์</div><span class="m-icon"></span></div>
  <div class="mdet"><div style="display:flex;gap:8px;align-items:center">${platBadge(x.plat)}<span class="hint num">${clock(x.ago)}</span></div>
  <p style="font-size:17px;line-height:1.7;margin:12px 0">${hlText(x)}</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">${sentBadge(effSent(x))}<span class="stat-chip num">${icon('zap', 13)}${num(x.eng)} engagement</span></div>
  <div class="mc"><h4>${icon('spark', 15)} หลักฐานของ AI</h4><div class="meter ${x.conf < 60 ? 'low' : ''}" role="meter" aria-valuenow="${x.conf}" aria-valuemin="0" aria-valuemax="100"><i style="width:${x.conf}%"></i></div><div class="hint" style="margin-top:6px">ความมั่นใจ <b class="num">${x.conf}%</b> · คำที่จับได้: ${x.kw.map(esc).join(', ')}</div>${lowConf(x) ? `<div class="mstate warn" style="margin-top:8px">${icon('tri', 16)}<span>อาจเป็นประชด/มุก — ควรอ่านเอง</span></div>` : ''}</div>
  <div class="mc" style="display:flex;gap:10px;align-items:center">${icon('lock', 18)}<span class="hint">ตัวตนผู้โพสต์ถูกซ่อน (PDPA) · แก้ผลและเปิดดูตัวตนทำบนเว็บ</span></div>
  <button class="mlink" style="width:100%" data-act="openWebFeed" data-v="${x.id}">${icon('mon', 17)}เปิดบนเว็บเพื่อแก้ผล ${icon('up', 14)}</button></div>`;
}
function mSummary(){
  const d = dashData();
  return `<div class="m-hd"><h1>สรุป</h1><div class="sub">${icon('clock', 14)}อัปเดตล่าสุด 14:28 น. · 24 ชั่วโมง</div></div>
  <div class="m-scroll"><div class="m-kpi"><div class="stat"><span>การกล่าวถึง</span><b class="num">${num(d.sum)}</b></div><div class="stat"><span>ความรู้สึกสุทธิ</span><b class="num">${d.net}</b></div></div>
  <div class="mc"><h4>แนวโน้ม 24 ชม.</h4>${sparkline().replace('<svg ', '<svg style="width:100%;height:70px" ')}<div class="hint">พุ่งช่วง 14:00 น. (6.8× ของปกติ)</div></div>
  <div class="mc"><h4>ความครอบคลุมข้อมูล</h4>${['fb', 'x', 'tt', 'news'].map(k => `<div style="display:flex;gap:10px;align-items:center;margin:7px 0;font-size:13px">${platBadge(k)}<div class="meter ${PLAT[k].lag ? 'low' : ''}" style="flex:1"><i style="width:${PLAT[k].cov}%"></i></div><b class="num">${PLAT[k].cov}%</b></div>`).join('')}<div class="cov-note">${icon('clock', 13)}TikTok ล่าช้า ~25 นาที</div></div>
  <button class="mlink" style="width:100%" data-act="openWeb" data-v="a1">${icon('mon', 17)}เปิดแดชบอร์ดเต็มบนเว็บ ${icon('up', 14)}</button></div>`;
}
function mCases(){
  return `<div class="m-hd"><h1>เคส / ติดตาม</h1><div class="sub">เคสที่ทีมกำลังติดตาม</div></div><div class="m-scroll">
  ${S.cases.map(c => `<div class="mc"><div style="display:flex;gap:8px;align-items:center;font-size:12.5px;color:var(--muted)"><b class="num">${c.id}</b><span style="margin-left:auto" class="fl">${c.esc ? 'ยกระดับ' : c.type}</span></div><div style="font-weight:700;margin:5px 0 8px;line-height:1.4">${esc(c.title)}</div>${c.esc ? `<div class="hint">ส่งแล้ว → ${c.read ? 'อ่านแล้ว' : 'รอการอ่าน'} · ถึง ${esc(c.to)}</div>` : `<div class="mini4">${CASE_STEPS.map((_, i) => `<i class="${i <= c.step ? 'on' : ''}" style="flex:1"></i>`).join('')}</div><div class="hint" style="margin-top:5px">${CASE_STEPS[c.step]} · ${c.owner} · ${c.age}</div>`}</div>`).join('')}</div>`;
}

function sheetView(){
  const sh = S.mob.sheet, a = getA(S.mob.aid);
  if (sh === 'watch') return `<div class="sheet-scrim" data-act="sheetClose"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t"><h3 id="sh-t">เฝ้าดู — เตือนอีกครั้งเมื่อไร?</h3><p>ยังไม่ต้องดำเนินการ ระบบจะเตือนซ้ำเมื่อครบเวลา หรือเมื่อระดับเพิ่มขึ้น</p>
    ${[['15 นาที', '14:45 น.'], ['1 ชั่วโมง', '15:30 น.'], ['3 ชั่วโมง', '17:30 น.']].map(([l, t], i) => `<button class="opt" data-act="doWatch" data-v="${t}" ${i === 0 ? 'data-first' : ''}><span class="rd" style="display:none"></span><span style="flex:1"><b>${l}</b></span><span class="hint num">${t}</span></button>`).join('')}
    <button class="mbtn block" style="width:100%;margin-top:4px" data-act="sheetClose">ยกเลิก</button></div></div>`;
  if (sh === 'confirm'){
    const e = S.mob.esc, who = e.recips.map(k => PEOPLE[k].name).join(', ');
    return `<div class="sheet-scrim" data-act="sheetClose"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t"><h3 id="sh-t">ยืนยันการยกระดับ</h3>
    <p>ส่งสรุป <b>${a.short}</b> ถึง <b>${who}</b> ผ่าน${{ chat: 'แชทสายงาน', mail: 'อีเมล FYI', copy: 'การคัดลอกข้อความ' }[e.ch]} — ทุกคนที่ได้รับจะเห็นทันที</p>
    <div class="mstate warn" style="margin:0 0 12px">${icon('undo', 16)}<span>หลังส่งแล้ว เรียกคืน/แก้ไขได้ภายใน 60 วินาที</span></div>
    <button class="mbtn primary block" style="width:100%" data-act="escSend" data-first ${e.phase === 'sending' ? 'disabled' : ''}>${e.phase === 'sending' ? '<span class="spin"></span>กำลังส่ง…' : icon('send', 20) + 'ยืนยันและส่ง'}</button>
    <button class="mbtn block" style="width:100%;margin-top:8px;min-height:48px" data-act="sheetClose" ${e.phase === 'sending' ? 'disabled' : ''}>กลับไปแก้ไข</button></div></div>`;
  }
  return '';
}

/* ================= Actions (มือถือ) ================= */
let _undoT = null, _readT = null;
function mUpdate(extra){ renderMob(); if (extra) extra(); }
Object.assign(A, {
  mtab(el){ const m = S.mob; m.tab = el.dataset.v; m.screen = el.dataset.v; m.sheet = null; renderMob(); },
  mseg(el){ S.mob.seg = el.dataset.v; renderMob(); },
  mback(){ const m = S.mob; m.sheet = null; m.screen = m.screen === 'post' ? 'feed' : 'alerts'; m.tab = m.screen; renderMob(); },
  openAlert(el){ const m = S.mob; m.aid = el.dataset.v; m.screen = 'alert'; m.tab = 'alerts'; renderMob(); announce('เปิดรายละเอียดแจ้งเตือน'); },
  openPost(el){ S.mob.mid = el.dataset.v; S.mob.screen = 'post'; renderMob(); },
  ack(el){ const a = getA(el.dataset.v); a.state = 'ack'; renderMob(); toast('รับทราบแล้ว — ทีมเห็นสถานะนี้'); announce('รับทราบแล้ว'); },
  watchOpen(){ S.mob.sheet = 'watch'; S.mob._sheetFocus = true; renderMob(); },
  doWatch(el){ const a = getA(S.mob.aid); a.state = 'watch'; S.mob.snooze = { id:a.id, at:el.dataset.v }; S.mob.sheet = null; renderMob(); toast('เฝ้าดู — จะเตือนอีกครั้ง ' + el.dataset.v); },
  sheetClose(el, e){ if (e && e.target !== el && el.classList.contains('sheet-scrim')) return; if (S.mob.esc.phase === 'sending') return; S.mob.sheet = null; renderMob(); },
  /* ยกระดับ */
  escOpen(el){
    const m = S.mob, a = getA(el.dataset.v), e = m.esc;
    if (e.aid !== a.id || e.phase === 'sent') Object.assign(e, { aid:a.id, recips:[...a.recips], ch:'chat', text:escText(a), phase:'compose', left:0, read:0, caseId:null });
    m.screen = 'escalate'; renderMob();
  },
  escBack(){ S.mob.screen = 'alert'; renderMob(); },
  togRc(el){ const e = S.mob.esc, k = el.dataset.v; e.recips = e.recips.includes(k) ? e.recips.filter(x => x !== k) : [...e.recips, k]; renderMob(); },
  setCh(el){ S.mob.esc.ch = el.dataset.v; renderMob(); },
  escReview(){ const e = S.mob.esc; if (!e.recips.length) return toast('เลือกผู้รับอย่างน้อย 1 รายการ', { kind:'error' }); S.mob.sheet = 'confirm'; S.mob._sheetFocus = true; renderMob(); },
  escSend(){
    const m = S.mob, e = m.esc; if (e.phase === 'sending') return;
    e.phase = 'sending'; renderMob();
    setTimeout(() => {
      if (S.demo.sendFail){ e.phase = 'failed'; m.sheet = null; renderMob(); announce('ส่งไม่สำเร็จ เก็บเป็นฉบับร่างแล้ว'); return; }
      const a = getA(m.aid); a.state = 'escalated';
      e.phase = 'sent'; e.sentAt = '14:31 น.'; e.left = 60; e.read = 0; e.caseId = 'C-2569-0' + (15 + S.cases.filter(c => c.esc).length);
      S.cases.unshift({ id:e.caseId, title:a.title, type:'ยกระดับ', owner:'ใบเตย', esc:true, read:false, to:e.recips.map(k => PEOPLE[k].name).join(', '), age:'เมื่อสักครู่' });
      m.sheet = null; renderMob(); announce('ส่งแล้ว');
      clearInterval(_undoT); _undoT = setInterval(() => {
        if (S.mob.esc.phase !== 'sent'){ clearInterval(_undoT); return; }
        e.left = Math.max(0, e.left - 1);
        const cd = $('#cd'); if (cd) cd.textContent = e.left; if (e.left === 0){ clearInterval(_undoT); if (S.mob.screen === 'escalate') renderMob(); }
      }, 1000);
      clearTimeout(_readT); _readT = setTimeout(() => { if (S.mob.esc.phase === 'sent'){ e.read = 1; const c = S.cases.find(x => x.id === e.caseId); if (c) c.read = true; if (S.mob.screen === 'escalate') renderMob(); if (S.web.route === 'cases') renderWeb(); } }, 3200);
    }, S.demo.slow ? 2200 : 1000);
  },
  escUndo(){
    const m = S.mob, e = m.esc; if (e.left <= 0) return;
    clearInterval(_undoT); clearTimeout(_readT);
    S.cases = S.cases.filter(c => c.id !== e.caseId); getA(m.aid).state = 'new'; e.phase = 'compose'; e.left = 0;
    renderMob(); toast('เรียกคืนแล้ว — แก้ไขข้อความแล้วส่งใหม่ได้', { ms:5000 }); announce('เรียกคืนการยกระดับแล้ว');
  },
  escDone(){ const m = S.mob; m.screen = 'alerts'; m.tab = 'alerts'; m.seg = 'done'; renderMob(); },
  /* ข้ามอุปกรณ์ */
  openWeb(el){
    const w = S.web; w.route = 'dashboard'; w.dashTab = 'overview'; w.f = { plat:'all', range:'24h', sent:'all', src:'all' }; w.deeplink = true; w.hl = 'cyber'; w.loading = false; w.table = false;
    S.dev = 'web'; applyLayout(); renderWeb({ top:true }); toast('เปิดบนเว็บ — คงตัวกรองเดิมและไฮไลต์หัวข้อที่เกี่ยวข้อง');
  },
  openWebFeed(el){ const f = S.web.feed; S.web.route = 'feed'; f.tab = 'review'; f.sel = el.dataset.v; S.dev = 'web'; applyLayout(); renderWeb({ top:true }); },
});
