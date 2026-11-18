/* เว็บแอป: Dashboard (M1) · Mention Feed (M2) · เคส (M3 บนเว็บ) · ตั้งค่า */
const A = {};   // ตัวรวม action ทั้งเว็บ+มือถือ
const RANGE = { '24h':'24 ชั่วโมงล่าสุด', '7d':'7 วันล่าสุด', '30d':'30 วันล่าสุด' };
const SRC = { all:'ทุกแหล่ง', social:'โซเชียล', news:'สำนักข่าว' };
const ROLE = 'เจ้าหน้าที่ Social Listening';
let _chart = null;

function renderWeb(opts = {}){
  const root = $('#web'); if (!root) return;
  const w = S.web;
  const pg0 = $('.w-page', root), st = pg0 ? pg0.scrollTop : 0, r0 = root.dataset.route;
  const fa = document.activeElement;
  let fkey = null;
  if (fa && root.contains(fa) && fa.dataset && fa.dataset.act) fkey = [fa.dataset.act, fa.dataset.k || '', fa.tagName === 'SELECT' ? '' : (fa.dataset.v || '')];
  const list0 = $('.f-list', root), ls = list0 ? list0.scrollTop : 0, det0 = $('.f-det', root), ds = det0 ? det0.scrollTop : 0;
  root.innerHTML = webShell();
  root.dataset.route = w.route;
  const pg = $('.w-page', root);
  if (pg && r0 === w.route && !opts.top) pg.scrollTop = st;
  const l1 = $('.f-list', root), d1 = $('.f-det', root);
  if (l1 && !opts.top) l1.scrollTop = ls;
  if (d1 && !opts.keepDet) d1.scrollTop = opts.top ? 0 : ds;
  if (fkey){
    const n = $$('[data-act]', root).find(e => e.dataset.act === fkey[0] && (e.dataset.k || '') === fkey[1] && (e.tagName === 'SELECT' || (e.dataset.v || '') === fkey[2]));
    if (n && !w.modal) n.focus({ preventScroll:true });
  }
  if (w.modal && opts.openModal){ const f = $('.modal [data-first]', root) || $('.modal button', root); f && f.focus(); }
  bindChart();
}

function webShell(){
  const w = S.web;
  const nav = [['dashboard','dash','ภาพรวม'], ['feed','feed','Mention Feed'], ['cases','folder','แจ้งเตือนและเคส'], ['settings','sliders','ตั้งค่า']];
  const reviewN = S.mentions.filter(lowConf).length;
  const openA = S.alerts.filter(a => a.state === 'new').length;
  const bd = { feed: reviewN, cases: openA };
  const pages = { dashboard: pgDashboard, feed: pgFeed, cases: pgCases, settings: pgSettings };
  const titles = { dashboard:'ภาพรวม', feed:'Mention Feed', cases:'แจ้งเตือนและเคส', settings:'ตั้งค่า' };
  return `
  <aside class="w-side" aria-label="เมนูหลัก">
    <div class="w-logo"><span class="brand-mark">${icon('wifi', 18)}</span><span>Social Listening</span></div>
    <nav class="w-nav" aria-label="โมดูล">
      ${nav.map(([r, ic, lb]) => `<button data-act="nav" data-v="${r}" ${w.route === r ? 'aria-current="page"' : ''}>${icon(ic, 20)}<span class="lb">${lb}</span>${bd[r] ? `<span class="bdg">${bd[r]}</span><span class="sr"> รายการ</span>` : ''}</button>`).join('')}
    </nav>
    <div class="w-sec">มุมมองที่บันทึก</div>
    <nav class="w-nav" aria-label="มุมมองที่บันทึก">
      ${w.views.map(v => `<button data-act="applyView" data-v="${v.id}" ${w.view === v.id && w.route === 'dashboard' ? 'aria-current="page"' : ''} style="min-height:38px;font-size:13.5px">${icon('eye', 17)}<span class="lb">${esc(v.name)}</span></button>`).join('')}
    </nav>
    <div class="w-team"><span class="avatar" aria-hidden="true">ใ</span><div><b>คุณใบเตย</b><small>${ROLE}</small></div></div>
  </aside>
  <section class="w-main">
    <header class="w-top">
      <div class="crumb"><span>ทีมสื่อสารองค์กร</span>${icon('cr', 14)}<b>${titles[w.route]}</b></div>
      <div class="fresh ${w.updating ? 'stale' : ''}" role="status">
        <span class="live" aria-hidden="true"></span>
        <span>${w.updating ? 'กำลังอัปเดต…' : `อัปเดตล่าสุด <b class="num">${w.refreshedAt} น.</b> · 16 พ.ย. 2569`}</span>
        <button class="btn sm" data-act="refresh" aria-label="รีเฟรชข้อมูล" ${w.updating ? 'disabled' : ''}>${w.updating ? '<span class="spin"></span>' : icon('refresh', 15)}รีเฟรช</button>
      </div>
    </header>
    <main class="w-page ${w.route === 'feed' ? 'nopad' : ''}" id="wpage" tabindex="0">${pages[w.route]()}</main>
  </section>
  ${w.modal ? modalView() : ''}`;
}

/* ================= Dashboard ================= */
function pgDashboard(){
  const w = S.web, d = dashData();
  const seg = (k, opts, cur) => `<div class="seg" role="group" aria-label="${k}">${opts.map(([v, lb]) => `<button data-act="setf" data-k="${k}" data-v="${v}" aria-pressed="${cur === v}">${lb}</button>`).join('')}</div>`;
  const hi = S.mentions.filter(m => m.eng >= w.threshold).length;
  const tabs = `<div class="seg" role="tablist" aria-label="หน้าย่อย"><button role="tab" data-act="dtab" data-v="overview" aria-selected="${w.dashTab === 'overview'}">ภาพรวม / แนวโน้ม</button><button role="tab" data-act="dtab" data-v="digest" aria-selected="${w.dashTab === 'digest'}">สรุปเช้า–เย็น</button></div>`;
  const exp = { idle:`${icon('dl', 16)}Export CSV`, busy:'<span class="spin"></span>กำลัง export…', done:`${icon('checkc', 16)}Export สำเร็จ · ดาวน์โหลดอีกครั้ง`, error:`${icon('tri', 16)}Export ไม่สำเร็จ · ลองใหม่` }[w.export];
  let h = `<div class="ph"><div><h1>ภาพรวมสถานการณ์</h1><div class="sub">ทีมสื่อสารองค์กร · ${RANGE[w.f.range]} · ${SRC[w.f.src]}</div></div><div class="r">${tabs}<button class="btn" data-act="export" ${w.export === 'busy' ? 'aria-disabled="true"' : ''} aria-live="polite">${exp}</button></div></div>`;
  if (w.deeplink) h += `<div class="banner info" role="status">${icon('link', 18)}<span><b>เปิดจากการแจ้งเตือนบนมือถือ</b> · คงตัวกรองเดิมไว้ให้แล้ว (24 ชม. · ทุกแพลตฟอร์ม) และไฮไลต์หัวข้อที่ทำให้เกิดการแจ้งเตือน</span><button class="btn sm ghost x" data-act="closeDeep" aria-label="ปิดข้อความนี้">${icon('x', 16)}</button></div>`;
  if (w.dashTab === 'digest') return h + digestView();
  h += `<div class="filters" role="region" aria-label="ตัวกรอง">
    <div class="fg"><span class="lbl">แพลตฟอร์ม</span>${seg('plat', [['all','ทั้งหมด'],['fb','Facebook'],['x','X'],['tt','TikTok']], w.f.plat)}</div>
    <div class="fg"><span class="lbl">ช่วงเวลา</span>${seg('range', [['24h','24 ชม.'],['7d','7 วัน'],['30d','30 วัน']], w.f.range)}</div>
    <div class="fg"><span class="lbl">แหล่งข่าว</span>${seg('src', [['all','ทั้งหมด'],['social','โซเชียล'],['news','สำนักข่าว']], w.f.src)}</div>
    <div class="fg"><label class="lbl" for="f-sent">ความรู้สึก</label><select id="f-sent" class="sel" data-act="setf" data-k="sent"><option value="all" ${w.f.sent === 'all' ? 'selected' : ''}>ทั้งหมด</option><option value="neg" ${w.f.sent === 'neg' ? 'selected' : ''}>เชิงลบ</option><option value="neu" ${w.f.sent === 'neu' ? 'selected' : ''}>กลาง</option><option value="pos" ${w.f.sent === 'pos' ? 'selected' : ''}>เชิงบวก</option></select></div>
    <div class="fg"><label class="lbl" for="f-thr">เกณฑ์ engagement</label><select id="f-thr" class="sel" data-act="setThr">${[500, 1000, 2000, 5000].map(v => `<option value="${v}" ${w.threshold === v ? 'selected' : ''}>≥ ${num(v)}</option>`).join('')}</select></div>
    <div class="fg" style="margin-left:auto"><button class="btn sm" data-act="saveView">${icon('plus', 15)}บันทึกเป็นมุมมอง</button><button class="btn sm ghost" data-act="resetF">ล้างตัวกรอง</button></div>
  </div>
  <div class="cov" aria-label="ความครอบคลุมของข้อมูลต่อแพลตฟอร์ม"><b style="font-weight:700">ความครอบคลุมข้อมูล</b>
    ${Object.keys(PLAT).map(k => `<span class="${PLAT[k].lag ? 'lag' : ''}">${platBadge(k)}<span class="bar" aria-hidden="true"><i style="width:${PLAT[k].cov}%"></i></span><b class="num">${PLAT[k].cov}%</b>${PLAT[k].lag ? `<span style="color:var(--med)">${icon('clock', 14)} ล่าช้า ~${PLAT[k].lag} นาที</span>` : ''}</span>`).join('')}
  </div>`;
  if (w.demoErr || S.demo.error) return h + `<div class="card"><div class="errbox" role="alert"><div class="ill">${icon('tri', 26)}</div><b>โหลดข้อมูลแดชบอร์ดไม่สำเร็จ</b><span>การเชื่อมต่อแหล่งข้อมูลขัดข้อง ข้อมูลที่เห็นก่อนหน้านี้ยังไม่ถูกลบ</span><button class="btn primary" data-act="retry">${icon('refresh', 16)}ลองใหม่</button></div></div>`;
  if (w.loading) return h + `<div class="kpis">${'<div class="card kpi"><div class="skel" style="height:14px;width:60%"></div><div class="skel" style="height:34px;width:45%;margin-top:10px"></div><div class="skel" style="height:12px;width:70%;margin-top:10px"></div></div>'.repeat(4)}</div><div class="grid2"><div class="card" style="padding:18px"><div class="skel" style="height:280px"></div></div><div class="card" style="padding:18px"><div class="skel" style="height:280px"></div></div></div>`;
  if (d.empty) return h + `<div class="card"><div class="empty"><div class="ill">${icon('search', 26)}</div><b>ไม่พบข้อมูลตามตัวกรองนี้</b><span>ลองเปลี่ยนแพลตฟอร์มหรือแหล่งข่าว (เช่น "TikTok" ไม่มีในกลุ่ม "สำนักข่าว")</span><button class="btn primary" data-act="resetF">ล้างตัวกรอง</button></div></div>`;

  const prev = d.sum / (w.f.range === '24h' ? 2.4 : w.f.range === '7d' ? 1.35 : 1.1), pct = Math.round((d.sum / prev - 1) * 100);
  const tot = d.sent.neg + d.sent.neu + d.sent.pos, negp = Math.round(d.sent.neg / tot * 100);
  h += `<div class="kpis">
    <div class="card kpi"><div class="k">${icon('msg', 16)}การกล่าวถึงทั้งหมด</div><div class="v">${num(d.sum)}</div><div class="d up">${icon('trend', 15)}<b>+${pct}%</b> เทียบช่วงก่อนหน้า</div></div>
    <div class="card kpi"><div class="k">${icon('zap', 16)}Engagement รวม</div><div class="v">${num(d.eng)}</div><div class="d">ไลก์ + คอมเมนต์ + แชร์</div></div>
    <div class="card kpi"><div class="k">${icon('chart', 16)}ความรู้สึกสุทธิ</div><div class="v">${d.net > 0 ? '+' : d.net < 0 ? '−' : ''}${Math.abs(d.net)}</div><div class="d ${d.net < 0 ? 'up' : 'good'}">${sentBadge(d.net < 0 ? 'neg' : 'pos')} เชิงลบ ${negp}% ของทั้งหมด</div></div>
    <div class="card kpi"><div class="k">${icon('flag', 16)}โพสต์เกินเกณฑ์</div><div class="v">${hi}<span style="font-size:15px;font-weight:500;color:var(--muted)"> โพสต์</span></div><div class="d">engagement ≥ ${num(w.threshold)} · <button class="btn sm ghost" style="min-height:28px;padding:0 6px;color:var(--brand-strong)" data-act="openHigh">ดูในฟีด</button></div></div>
  </div>
  <div class="grid2">
    <div class="card"><div class="card-h"><h2>แนวโน้มการกล่าวถึง</h2><div class="r"><div class="seg"><button data-act="tbl" data-v="0" aria-pressed="${!w.table}">${icon('chart', 15)}กราฟ</button><button data-act="tbl" data-v="1" aria-pressed="${w.table}">${icon('table', 15)}ตาราง</button></div></div></div>
      <div class="card-b">${w.table ? tableView(d) : chartView(d)}</div></div>
    <div class="card"><div class="card-h"><h2>หัวข้อผิดปกติ <span class="hint" style="font-weight:400">· นอก watchlist</span></h2></div><div class="card-b">${anomalyView()}</div></div>
  </div>
  <div class="grid3">
    <div class="card"><div class="card-h"><h2>ความรู้สึกแยกแพลตฟอร์ม</h2></div><div class="card-b">${sentView(d)}</div></div>
    <div class="card"><div class="card-h"><h2>คิวโพสต์ที่ควรดูก่อน</h2><div class="r"><button class="btn sm" data-act="nav" data-v="feed">ดูทั้งหมด ${icon('cr', 14)}</button></div></div><div class="card-b">${priorityView()}</div></div>
  </div>`;
  return h;
}

function niceMax(v){ const p = Math.pow(10, Math.floor(Math.log10(v))); const f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }
const DASH = { total:'', fb:'', x:'7 4', tt:'2 4', news:'9 3 2 3' };
function chartView(d){
  const W = 680, H = 270, m = { l:50, r:92, t:18, b:30 }, iw = W - m.l - m.r, ih = H - m.t - m.b, n = d.n;
  const ymax = niceMax(Math.max(...d.total)), X = i => m.l + i * iw / (n - 1), Y = v => m.t + ih - v / ymax * ih;
  const single = d.keys.length === 1;
  const path = arr => arr.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join('');
  let svg = '';
  for (let g = 0; g <= 4; g++){ const v = ymax / 4 * g, y = Y(v); svg += `<line class="gl" x1="${m.l}" x2="${W - m.r}" y1="${y}" y2="${y}"/><text class="ax" x="${m.l - 8}" y="${y + 4}" text-anchor="end">${num(Math.round(v))}</text>`; }
  const step = Math.ceil(n / 8);
  d.labels.forEach((lb, i) => { if (i % step === 0 || i === n - 1) svg += `<text class="ax" x="${X(i)}" y="${H - 8}" text-anchor="middle">${lb}</text>`; });
  const lines = single ? [[d.keys[0], d.series[d.keys[0]]]] : [['total', d.total], ...d.keys.map(k => [k, d.series[k]])];
  if (!single) svg += `<path d="${path(d.total)}L${X(n - 1)} ${Y(0)}L${X(0)} ${Y(0)}Z" fill="var(--brand-soft)" opacity=".75"/>`;
  const labs = [];
  lines.forEach(([k, arr]) => {
    const col = k === 'total' ? 'var(--ink)' : `var(--p-${k})`, sw = k === 'total' ? 3 : 2;
    const partial = k === 'tt' && S.web.f.range === '24h';
    if (partial){ svg += `<path d="${path(arr.slice(0, n - 2))}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-dasharray="${DASH[k]}" stroke-linecap="round"/><path d="M${X(n - 3)} ${Y(arr[n - 3])}${arr.slice(n - 2).map((v, j) => 'L' + X(n - 2 + j) + ' ' + Y(v)).join('')}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-dasharray="2 5" opacity=".55"/>`; }
    else svg += `<path d="${path(arr)}" fill="none" stroke="${col}" stroke-width="${sw}" ${DASH[k] ? `stroke-dasharray="${DASH[k]}"` : ''} stroke-linecap="round" stroke-linejoin="round"/>`;
    const ex = X(n - 1), ey = Y(arr[n - 1]), mk = k === 'total' ? 'circle' : PLAT[k].mk;
    svg += marker(mk, ex, ey, col);
    labs.push({ y: ey, t: k === 'total' ? 'รวม' : PLAT[k].name, v: arr[n - 1], col });
  });
  labs.sort((a, b) => a.y - b.y); for (let i = 1; i < labs.length; i++) if (labs[i].y - labs[i - 1].y < 14) labs[i].y = labs[i - 1].y + 14;
  labs.forEach(l => svg += `<text x="${W - m.r + 10}" y="${l.y + 4}" font-size="11.5" font-weight="700" fill="${l.col}">${l.t} ${num(l.v)}</text>`);
  const pk = d.peak, px = X(pk), py = Y(d.total[pk]);
  svg += `<g role="button" tabindex="0" data-act="peakFeed" aria-label="จุดสูงสุด ${d.labels[pk]} จำนวน ${num(d.total[pk])} โพสต์ เปิดรายการโพสต์ช่วงนั้น" style="cursor:pointer"><circle cx="${px}" cy="${py}" r="15" fill="var(--crit)" opacity=".16"/><circle cx="${px}" cy="${py}" r="8" fill="var(--surface)" stroke="var(--crit)" stroke-width="3"/></g>`;
  svg += `<line id="xh" y1="${m.t}" y2="${m.t + ih}" stroke="var(--muted)" stroke-dasharray="3 3" style="display:none"/><rect id="ov" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent"/>`;
  _chart = { d, m, W, iw, n, X };
  const keysLegend = (single ? d.keys : ['total', ...d.keys]).map(k => `<span>${legendSw(k)}${k === 'total' ? 'รวม' : PLAT[k].name}</span>`).join('');
  const partialNote = d.keys.includes('tt') && S.web.f.range === '24h' ? `<div class="banner warn" style="margin:10px 0 0"><span>${icon('clock', 17)}</span><span><b>ข้อมูลไม่ครบ:</b> TikTok ล่าช้า ~25 นาที เส้นประจางท้ายกราฟคือช่วงที่ข้อมูลอาจต่ำกว่าจริง</span></div>` : '';
  const topic = S.web.hl ? 'ภัยไซเบอร์/ตัดบัตรรัว' : 'หัวข้อนอก watchlist';
  return `<div class="legend">${keysLegend}</div>
  <div class="chart-wrap"><svg viewBox="0 0 ${W} ${H}" role="group" aria-label="กราฟเส้นแสดงจำนวนการกล่าวถึง ${RANGE[S.web.f.range]} ${num(d.sum)} โพสต์ จุดสูงสุด ${d.labels[pk]}">${svg}</svg><div class="tip" id="tip"></div></div>
  <div class="chart-sum">${icon('info', 17)}<span><b>สรุปเป็นข้อความ:</b> ${RANGE[S.web.f.range]} มี ${num(d.sum)} โพสต์ สูงสุดที่ <b>${d.labels[pk]}</b> (${num(d.total[pk])} โพสต์) ซึ่งสูงกว่าปกติมาก สาเหตุหลักจาก${topic} · <button class="peakbtn" data-act="peakFeed">${icon('zap', 14)}ดูโพสต์ช่วงสูงสุด</button></span></div>${partialNote}`;
}
function marker(k, x, y, c){
  if (k === 'square') return `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" fill="${c}"/>`;
  if (k === 'triangle') return `<path d="M${x} ${y - 6}L${x + 6} ${y + 5}H${x - 6}Z" fill="${c}"/>`;
  if (k === 'diamond') return `<path d="M${x} ${y - 6}L${x + 6} ${y}L${x} ${y + 6}L${x - 6} ${y}Z" fill="${c}"/>`;
  return `<circle cx="${x}" cy="${y}" r="5" fill="${c}"/>`;
}
function legendSw(k){
  const c = k === 'total' ? 'var(--ink)' : `var(--p-${k})`;
  return `<svg width="34" height="12" viewBox="0 0 34 12" aria-hidden="true"><line x1="0" x2="26" y1="6" y2="6" stroke="${c}" stroke-width="${k === 'total' ? 3 : 2}" ${DASH[k] ? `stroke-dasharray="${DASH[k]}"` : ''}/>${marker(k === 'total' ? 'circle' : PLAT[k].mk, 29, 6, c).replace(/r="5"/, 'r="3.5"')}</svg>`;
}
function bindChart(){
  const ov = $('#ov'); if (!ov || !_chart) return;
  const svg = ov.ownerSVGElement, tip = $('#tip'), xh = $('#xh'), { d, m, W, iw, n, X } = _chart;
  const move = e => {
    const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W;
    const i = Math.max(0, Math.min(n - 1, Math.round((x - m.l) / (iw / (n - 1)))));
    xh.setAttribute('x1', X(i)); xh.setAttribute('x2', X(i)); xh.style.display = '';
    tip.innerHTML = `<b>${d.labels[i]}</b>` + d.keys.map(k => `<div class="row"><span>${PLAT[k].name}</span><span class="num">${num(d.series[k][i])}</span></div>`).join('') + (d.keys.length > 1 ? `<div class="row" style="border-top:1px solid #345;margin-top:3px;padding-top:3px"><b>รวม</b><b class="num">${num(d.total[i])}</b></div>` : '');
    tip.style.display = 'block';
    const wr = svg.parentElement.getBoundingClientRect(), tx = (X(i) / W) * r.width + 14;
    tip.style.left = Math.min(tx, wr.width - 160) + 'px'; tip.style.top = '24px';
  };
  ov.addEventListener('mousemove', move); ov.addEventListener('mouseleave', () => { tip.style.display = 'none'; xh.style.display = 'none'; });
}
function tableView(d){
  return `<div class="scrolly" tabindex="0" role="region" aria-label="ตารางข้อมูลการกล่าวถึง"><table class="dt"><caption class="sr">จำนวนการกล่าวถึงตามช่วงเวลาและแพลตฟอร์ม</caption><thead><tr><th scope="col">ช่วงเวลา</th>${d.keys.map(k => `<th scope="col">${PLAT[k].name}</th>`).join('')}<th scope="col">รวม</th></tr></thead><tbody>${d.labels.map((lb, i) => `<tr><th scope="row" style="text-align:left;font-weight:500">${lb}</th>${d.keys.map(k => `<td>${num(d.series[k][i])}</td>`).join('')}<td><b>${num(d.total[i])}</b></td></tr>`).join('')}</tbody></table></div><p class="hint" style="margin:8px 0 0">ข้อมูลชุดเดียวกับกราฟ · สลับกลับเป็นกราฟได้จากปุ่มด้านบน</p>`;
}
function anomalyView(){
  const hl = S.web.hl;
  return `<div class="an">${TOPICS.map((t, i) => `<div class="an-i ${hl && i === 0 ? 'hl' : ''}">
    <div class="an-t">${icon('zap', 17)}<span>${t.name}</span>${t.off ? '<span class="tagoff" style="margin-left:auto">นอก watchlist</span>' : ''}</div>
    <div class="an-x">เทียบฐานปกติ 7 วัน: ~${num(t.base)} → <b class="num">${num(t.now)}</b> โพสต์/ชม.</div>
    <div class="an-b"><span class="an-m num">${t.mult}×</span><span class="hint">ของปกติ · ความมั่นใจ ${t.conf}</span></div>
    <div class="an-b" style="margin-top:8px"><button class="btn sm" data-act="topicFeed" data-v="${t.id}">ดูโพสต์ ${icon('cr', 14)}</button><button class="btn sm ghost" data-act="addWatch" data-v="${t.id}">${icon('plus', 14)}เพิ่มเข้า watchlist</button></div></div>`).join('')}
    <div class="warnbox" style="margin:0">${icon('info', 17)}<span>ผลนี้เป็น<b>การประมาณของระบบ</b> อาจคลาดเคลื่อน โปรดเปิดอ่านโพสต์ต้นทางก่อนตัดสินใจยกระดับ</span></div></div>`;
}
function sentView(d){
  return `<div class="sb">${d.keys.map(k => { const p = d.perPlat[k], t = p.neg + p.neu + p.pos; return `<div class="sb-r"><span>${platBadge(k)}</span><div class="sb-bar" role="img" aria-label="${PLAT[k].name}: เชิงลบ ${Math.round(p.neg / t * 100)}% กลาง ${Math.round(p.neu / t * 100)}% เชิงบวก ${Math.round(p.pos / t * 100)}%"><i class="neg" style="width:${p.neg / t * 100}%"></i><i class="neu" style="width:${p.neu / t * 100}%"></i><i class="pos" style="width:${p.pos / t * 100}%"></i></div><span class="num" style="text-align:right"><b>${Math.round(p.neg / t * 100)}%</b> ลบ</span></div>`; }).join('')}
  <div class="sb-key"><span>${sentBadge('neg')}</span><span>${sentBadge('neu')}</span><span>${sentBadge('pos')}</span></div>
  ${S.corrections.length ? `<div class="banner ok" style="margin:0">${icon('checkc', 16)}<span>ตัวเลขนี้รวมการแก้ผลของทีม <b>${S.corrections.length} รายการ</b> แล้ว</span></div>` : `<p class="hint" style="margin:0">ผลวิเคราะห์ความรู้สึกเป็นการประมาณของ AI — ตรวจและแก้ได้ที่ Mention Feed</p>`}</div>`;
}
function priorityView(){
  const q = S.mentions.filter(lowConf).sort((a, b) => reviewScore(b) - reviewScore(a)).slice(0, 3);
  if (!q.length) return `<div class="empty" style="padding:18px"><div class="ill">${icon('checkc', 24)}</div><b>ไม่มีโพสต์ค้างตรวจ</b><span>ทีมตรวจครบแล้ว</span></div>`;
  return `<div class="prio">${q.map((m, i) => `<button class="prio-i" data-act="openMention" data-v="${m.id}"><span class="prio-n">${i + 1}</span><div style="min-width:0"><div class="t">${esc(m.text)}</div><div style="display:flex;gap:8px;align-items:center;margin-top:5px;flex-wrap:wrap">${platBadge(m.plat)}${sentBadge(m.sys)}<span class="warnchip">${icon('tri', 13)}ความมั่นใจ ${m.conf}%</span><span class="stat-chip num">${icon('zap', 13)}${num(m.eng)}</span></div></div></button>`).join('')}</div>`;
}
function digestView(){
  const w = S.web, d = dashData();
  const body = (t, when) => `<div class="card"><div class="card-b" style="padding-top:18px"><div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">${icon('spark', 18)}<span class="hint">${when}</span></div><h3>${t}</h3>
    <ul><li>ภัยไซเบอร์ (ตัดบัตรรัว) พุ่ง <b>6.8×</b> เป็น 1,284 โพสต์/ชม. — <b>นอก watchlist</b></li><li>ธนบัตรปลอม <b>3.1×</b> · SMS พัสดุปลอม <b>2.4×</b></li><li>พบเว็บปลอมแอบอ้างหน่วยงาน 1 รายการ อยู่ระหว่างขอ take down</li><li>ความรู้สึกสุทธิ <b>${d.net}</b> · เชิงลบมากกว่าบวก</li></ul>
    <div class="warnbox" style="margin-top:0">${icon('info', 16)}<span>สรุปโดย AI จากข้อมูลที่ครอบคลุม FB 98% · X 95% · TikTok 71% (ล่าช้า) — ตรวจสอบก่อนส่งต่อผู้บริหาร</span></div></div></div>`;
  return `<div class="digest">${body('สรุปเช้า', 'ส่งอัตโนมัติ 07:00 น. · 16 พ.ย. 2569')}${body('สรุปเย็น (ตัวอย่าง)', 'จะส่ง 17:00 น. · แสดงตัวอย่างล่วงหน้า')}</div>
  <div class="card" style="margin-top:12px"><div class="card-b" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
    <div style="flex:1;min-width:220px"><b>ส่งสรุปเข้าอีเมลของคุณ</b><div class="hint">ไม่ต้องตั้งสคริปต์ดึงข้อมูลเอง — ระบบส่งให้ทุกเช้า–เย็น</div></div>
    <button class="tgl" role="switch" aria-checked="${w.notif.summaryMail}" aria-label="ส่งสรุปเช้าเย็นเข้าอีเมล" data-act="tglMail"></button>
    <button class="btn" data-act="sendDigest" ${w.digestSent === 'busy' ? 'aria-disabled="true"' : ''}>${w.digestSent === 'busy' ? '<span class="spin"></span>กำลังส่ง…' : w.digestSent === 'ok' ? icon('checkc', 16) + 'ส่งแล้ว 14:30 น.' : icon('mail', 16) + 'ส่งตอนนี้'}</button></div></div>`;
}

/* ================= Mention Feed ================= */
function feedItems(){
  const f = S.web.feed, thr = S.web.threshold;
  let L = S.mentions.slice();
  if (f.tab === 'review') L = L.filter(lowConf).sort((a, b) => reviewScore(b) - reviewScore(a));
  else if (f.tab === 'fake') L = L.filter(m => m.fake).sort((a, b) => a.ago - b.ago);
  else if (f.tab === 'news') L = L.filter(m => m.src === 'news').sort((a, b) => a.ago - b.ago);
  else L.sort((a, b) => a.ago - b.ago);
  if (f.q) L = L.filter(m => m.text.includes(f.q));
  if (f.plat !== 'all') L = L.filter(m => m.plat === f.plat);
  if (f.sent !== 'all') L = L.filter(m => effSent(m) === f.sent);
  if (f.onlyHigh) L = L.filter(m => m.eng >= thr);
  if (f.topic) L = L.filter(m => m.topic === f.topic);
  if (f.win) L = L.filter(m => m.ago <= 90);
  return L;
}
function countTab(t){ const L = S.mentions; return t === 'review' ? L.filter(lowConf).length : t === 'fake' ? L.filter(m => m.fake).length : t === 'news' ? L.filter(m => m.src === 'news').length : L.length; }
function pgFeed(){
  const f = S.web.feed, w = S.web;
  const tabs = [['review','คิวตรวจ'], ['all','ทั้งหมด'], ['fake','ข่าวปลอม / เว็บปลอม'], ['news','ข่าวสื่อ']];
  const items = feedItems();
  const sel = f.sel && getM(f.sel) ? getM(f.sel) : null;
  return `<div class="f-head"><div class="ph" style="margin-bottom:0"><div><h1>Mention Feed</h1><div class="sub">อ่านโพสต์ในบริบท · ตรวจและแก้ผลความรู้สึก · มอบหมายงาน</div></div>
    <div class="r"><button class="btn" data-act="export" ${w.export === 'busy' ? 'aria-disabled="true"' : ''}>${w.export === 'busy' ? '<span class="spin"></span>กำลัง export…' : icon('dl', 16) + 'Export CSV'}</button></div></div>
    <div class="f-tabs" role="tablist" aria-label="คิว">${tabs.map(([v, lb]) => `<button role="tab" data-act="ftab" data-v="${v}" aria-selected="${f.tab === v}">${lb}<span class="cnt num">${countTab(v)}</span></button>`).join('')}</div></div>
  <div class="f-bar">
    <label class="sr" for="fq">ค้นหาในโพสต์</label><div style="position:relative;width:230px"><input id="fq" class="in" placeholder="ค้นหาข้อความ…" value="${esc(f.q)}" style="padding-left:34px"><span style="position:absolute;left:10px;top:9px;color:var(--muted)">${icon('search', 17)}</span></div>
    <select class="sel" data-act="fsel" data-k="plat" aria-label="แพลตฟอร์ม"><option value="all">ทุกแพลตฟอร์ม</option>${['fb','x','tt','news'].map(k => `<option value="${k}" ${f.plat === k ? 'selected' : ''}>${PLAT[k].name}</option>`).join('')}</select>
    <select class="sel" data-act="fsel" data-k="sent" aria-label="ความรู้สึก"><option value="all">ทุกความรู้สึก</option>${['neg','neu','pos'].map(k => `<option value="${k}" ${f.sent === k ? 'selected' : ''}>${SENT[k].label}</option>`).join('')}</select>
    <button class="chip" data-act="fhigh" aria-pressed="${f.onlyHigh}">${icon('zap', 14)}engagement ≥ ${num(w.threshold)}</button>
    ${f.topic ? `<button class="chip on" data-act="clrTopic" aria-label="ล้างตัวกรองหัวข้อ">หัวข้อ: ${TOPICS.find(t => t.id === f.topic)?.name || f.topic} ${icon('x', 13)}</button>` : ''}
    ${f.win ? `<button class="chip on" data-act="clrWin" aria-label="ล้างตัวกรองช่วงเวลา">ช่วง 13:00–14:30 น. ${icon('x', 13)}</button>` : ''}
    <span class="hint" style="margin-left:auto" role="status">${f.tab === 'review' ? 'เรียงตาม engagement × ความไม่แน่นอนของ AI' : 'เรียงตามเวลาล่าสุด'}</span></div>
  <div class="f-split"><div class="f-list" id="flist" role="list" aria-label="รายการโพสต์">${feedList(items)}</div><div class="f-det" aria-live="polite">${sel ? detail(sel) : `<div class="empty" style="height:100%;justify-content:center"><div class="ill">${icon('feed', 26)}</div><b>เลือกโพสต์เพื่อดูบริบทและหลักฐาน</b><span>เริ่มจากโพสต์อันดับ 1 ในคิวตรวจ</span></div>`}</div></div>`;
}
function feedList(items){
  if (S.web.loading) return '<div class="skel" style="height:96px"></div>'.repeat(5);
  if (!items.length) return `<div class="empty"><div class="ill">${icon('search', 26)}</div><b>ไม่พบโพสต์ตามตัวกรอง</b><span>${S.web.feed.tab === 'review' ? 'คิวตรวจว่างแล้ว หรือลองปรับตัวกรอง' : 'ลองล้างตัวกรองเพื่อดูทั้งหมด'}</span><button class="btn" data-act="clrFeed">ล้างตัวกรอง</button></div>`;
  return items.map((m, i) => miView(m, i)).join('');
}
function miView(m, i){
  const f = S.web.feed, s = effSent(m);
  return `<button class="mi" role="listitem" data-act="selM" data-v="${m.id}" aria-current="${f.sel === m.id}">
    <div class="l1">${f.tab === 'review' ? `<span class="rank">#${i + 1}</span>` : ''}${platBadge(m.plat)}<span>·</span><span>${m.src === 'news' ? esc(m.handle) : 'ผู้ใช้ ' + esc(m.handle) + ' <span title="ซ่อนตัวตนตาม PDPA">' + icon('lock', 12) + '</span>'}</span><span style="margin-left:auto" class="num">${clock(m.ago)}</span></div>
    <div class="tx">${esc(m.text)}</div>
    <div class="l3">${sentBadge(s)}${m.fix ? `<span class="fixchip">${icon('check', 13)}แก้แล้ว</span>` : lowConf(m) ? `<span class="warnchip">${icon('tri', 13)}ความมั่นใจต่ำ ${m.conf}%</span>` : `<span class="hint num">มั่นใจ ${m.conf}%</span>`}<span class="stat-chip num">${icon('zap', 13)}${num(m.eng)}</span>${m.fake ? `<span class="fl">${m.fake.type}</span>` : ''}<span class="st st-${m.status}" style="margin-left:auto">${STATUS[m.status]}</span></div></button>`;
}
function detail(m){
  const w = S.web, ro = S.demo.noEdit, s = effSent(m), likes = Math.round(m.eng * .68), cms = Math.round(m.eng * .14), shr = m.eng - likes - cms;
  const revealed = w.reveal.done[m.id];
  const conf = m.conf, confLabel = conf >= 80 ? 'สูง' : conf >= 60 ? 'ปานกลาง' : 'ต่ำ';
  const FL = { sarcasm:'อาจเป็นประชด / มุก', slang:'อาจเป็นภาษาพูด / สแลง', 'news-quote':'อาจเป็นการอ้างข่าว', mixed:'ข้อความผสมบวกลบ' };
  return `<div class="d-in">
  <div class="d-h">${platBadge(m.plat)}<span>·</span><span class="num">${clock(m.ago)} · ${rel(m.ago)}</span><span style="margin-left:auto"></span><a class="btn sm" href="#" data-act="noop" aria-label="เปิดโพสต์ต้นฉบับในแท็บใหม่ (ต้นแบบ)">${icon('link', 14)}ต้นฉบับ ${icon('up', 13)}</a></div>
  <div class="d-text">${hlText(m)}</div>
  <div class="d-eng"><span><b>${num(m.eng)}</b> engagement</span><span><b>${num(likes)}</b> ไลก์</span><span><b>${num(cms)}</b> คอมเมนต์</span><span><b>${num(shr)}</b> แชร์</span></div>
  ${m.src === 'news' ? '' : `<div class="pri"><span class="lk">${icon('lock', 17)}</span><div style="flex:1">${revealed ? `<b>ผู้โพสต์: ${esc(m.real)}</b><br><span class="hint">เปิดดูเมื่อ 14:30 น. · บันทึกใน audit log แล้ว</span>` : `<b>ผู้โพสต์: ซ่อนไว้ตามค่าเริ่มต้น (PDPA)</b><br><span class="hint">ระบบวิเคราะห์ระดับประเด็น ไม่ได้เฝ้าติดตามรายบุคคล</span>`}</div>
    ${revealed ? '' : `<button class="btn sm" data-act="revealOpen" data-v="${m.id}" ${ro ? 'aria-disabled="true" title="ทีมของคุณไม่ได้รับสิทธิ์เปิดดูตัวตน"' : ''}>${icon('eye', 14)}เปิดดูตัวตน</button>`}</div>`}
  ${m.fix ? `<div class="corrected" role="status"><div class="ba"><b>${icon('checkc', 18)} แก้ผลแล้ว</b>${sentBadge(m.fix.orig)}${icon('cr', 14)}${sentBadge(m.fix.to)}<span class="hint">เหตุผล: ${REASONS.find(r => r.id === m.fix.reason).label} · โดย คุณใบเตย ${m.fix.at}</span></div>
    <div class="nx">${icon('spark', 16)}<span><b>ระบบจะนำไปปรับ:</b> บันทึกเป็นตัวอย่างสอนโมเดล รอบอัปเดตคืนนี้ 02:00 น. และจะจัดโพสต์ลักษณะเดียวกันอีก ~3 รายการใหม่ ผลใน Dashboard ปรับแล้วทันที</span></div>
    <div class="ac"><button class="btn sm" data-act="undoFix" data-v="${m.id}">${icon('undo', 14)}ยกเลิกการแก้</button></div></div>` : ''}
  <section class="ev" aria-label="หลักฐานเบื้องหลังผลวิเคราะห์"><div class="ev-h">${icon('spark', 17)}หลักฐานเบื้องหลังผลวิเคราะห์ความรู้สึก<span class="hint" style="margin-left:auto;font-weight:400">โดย AI · ประมาณการ</span></div>
    <div class="ev-b">
      <div class="ev-r"><span>ผลที่ระบบจัด</span><span>${sentBadge(m.sys)}${m.fix ? ' <span class="hint">(ถูกแก้เป็น ' + SENT[m.fix.to].label + ')</span>' : ''}</span></div>
      <div class="ev-r"><span>ความมั่นใจ</span><div><div style="display:flex;gap:10px;align-items:center"><div class="meter ${conf < 60 ? 'low' : ''}" style="flex:1" role="meter" aria-valuenow="${conf}" aria-valuemin="0" aria-valuemax="100" aria-label="ความมั่นใจ ${conf} เปอร์เซ็นต์"><i style="width:${conf}%"></i></div><b class="num">${conf}%</b><span class="hint">(${confLabel})</span></div></div></div>
      <div class="ev-r"><span>คำที่ใช้ตัดสิน</span><div class="words">${m.kw.map(k => `<span class="w-chip">${icon(m.sys === 'pos' ? 'spos' : m.sys === 'neg' ? 'sneg' : 'sneu', 12)}${esc(k)}</span>`).join('')}</div></div>
      ${lowConf(m) ? `<div class="ev-warn">${icon('tri', 20)}<div><b>ความมั่นใจต่ำ — ${(m.flags || []).map(x => FL[x]).join(' · ') || 'ควรอ่านเอง'}</b>ระบบจับประชด/มุกและภาษาพูดไทยได้ไม่ดีนัก คำที่ไฮไลต์ในข้อความอาจไม่ได้สื่อความหมายตามตัวอักษร</div></div>` : ''}
      ${m.fix ? '' : `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn primary" data-act="correctOpen" data-v="${m.id}" data-first ${ro ? 'aria-disabled="true"' : ''}>${icon('sliders', 16)}ผลนี้ไม่ถูกต้อง · แก้ผล</button>${ro ? `<span class="hint" style="color:var(--med)">${icon('lock', 13)} ทีมของคุณไม่ได้รับสิทธิ์แก้ผล — ติดต่อผู้ดูแลทีม</span>` : '<span class="hint">ใช้ 3 ขั้นตอน และยกเลิกได้</span>'}</div>`}
    </div></section>
  ${m.comments.length ? `<div class="sect">คอมเมนต์เด่น</div>${m.comments.map(c => `<div class="cm"><i>ผู้ใช้ ••••</i><span>${esc(c)}</span></div>`).join('')}` : ''}
  ${m.fake ? `<div class="sect">ติดตามเคส · ${m.fake.type}</div><div class="step4" aria-label="ขั้นตอนเคส">${CASE_STEPS.map((t, i) => `<div class="${i <= m.fake.step ? 'on' : ''} ${i === m.fake.step ? 'cur' : ''}">${t}</div>`).join('')}</div><div style="margin-top:6px"><button class="btn sm" data-act="fakeNext" data-v="${m.id}" ${m.fake.step >= 3 ? 'disabled' : ''}>${m.fake.step >= 3 ? 'ปิดเคสแล้ว' : 'ไปขั้น “' + CASE_STEPS[m.fake.step + 1] + '”'} ${m.fake.step < 3 ? icon('cr', 14) : ''}</button></div>` : ''}
  <div class="sect">งานในทีม</div>
  <div class="work"><div><label>สถานะ</label><div class="seg" role="group" aria-label="สถานะ">${Object.keys(STATUS).map(k => `<button data-act="setStatus" data-v="${k}" data-id="${m.id}" aria-pressed="${m.status === k}" ${ro ? 'aria-disabled="true"' : ''}>${STATUS[k]}</button>`).join('')}</div></div>
    <div><label for="asg">ผู้รับผิดชอบ</label><select id="asg" class="sel" style="width:100%" data-act="assign" data-id="${m.id}"><option value="">ยังไม่มอบหมาย</option>${['ใบเตย', 'ภูผา'].map(p => `<option ${m.assignee === p ? 'selected' : ''}>${p}</option>`).join('')}</select></div></div>
  <label style="font-size:12px;color:var(--muted);font-weight:600;display:block;margin-bottom:5px">แท็ก</label>
  <div class="tagrow">${['ภัยไซเบอร์', 'ต้องชี้แจง', 'เฝ้าดูต่อ', 'ข่าวปลอม'].map(t => `<button class="chip" data-act="tag" data-v="${t}" data-id="${m.id}" aria-pressed="${m.tags.includes(t)}">${icon('tag', 13)}${t}</button>`).join('')}</div>
  </div>`;
}

function modalView(){
  const w = S.web, md = w.modal;
  if (md === 'correct'){
    const m = getM(w.corr.id), c = w.corr, ph = c.phase;
    return `<div class="scrim" data-act="scrim"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">
      <div class="modal-h"><h3 id="mt">แก้ผลความรู้สึก</h3><button class="x" data-act="closeModal" aria-label="ปิด">${icon('x', 18)}</button></div>
      <div class="modal-b"><div class="cmp"><span>ระบบจัดเป็น</span>${sentBadge(m.sys)}<span class="hint num">มั่นใจ ${m.conf}%</span>${icon('cr', 14)}<span>แก้เป็น</span>${c.to ? sentBadge(c.to) : '<span class="hint">เลือกเหตุผลก่อน</span>'}</div>
      <div class="es-sec" style="margin:4px 0 8px;font-size:12.5px;font-weight:700;color:var(--muted)">ขั้นที่ 1 · เหตุผลที่ผลวิเคราะห์ไม่ถูกต้อง</div>
      <div role="radiogroup" aria-label="เหตุผล">${REASONS.map((r, i) => `<button class="opt" role="radio" aria-checked="${c.reason === r.id}" data-act="pickReason" data-v="${r.id}" ${i === 0 ? 'data-first' : ''} ${ph === 'saving' ? 'disabled' : ''}><span class="rd"></span><span><b>${r.label}</b><small>${r.hint}</small></span></button>`).join('')}</div>
      ${c.reason ? `<div style="margin:2px 0 8px"><span class="hint">แก้เป็นอย่างอื่น:</span> <span class="tagrow" style="display:inline-flex;margin-left:6px">${['neg', 'neu', 'pos'].map(k => `<button class="chip" data-act="pickTo" data-v="${k}" aria-pressed="${c.to === k}">${SENT[k].label}</button>`).join('')}</span></div>` : ''}
      ${ph === 'error' ? `<div class="banner err" role="alert" style="margin:8px 0 0">${icon('tri', 18)}<span><b>บันทึกไม่สำเร็จ</b> การเชื่อมต่อขัดข้อง ข้อมูลที่เลือกยังอยู่ครบ — ลองใหม่ได้</span></div>` : ''}
      </div>
      <div class="modal-f"><span class="hint" style="margin-right:auto">ขั้นที่ 2 · ยืนยัน · ยกเลิกภายหลังได้</span><button class="btn" data-act="closeModal" ${ph === 'saving' ? 'disabled' : ''}>ยกเลิก</button>
        <button class="btn primary" data-act="saveFix" ${!c.reason ? 'aria-disabled="true"' : ''} ${ph === 'saving' ? 'aria-disabled="true"' : ''}>${ph === 'saving' ? '<span class="spin"></span>กำลังบันทึก…' : ph === 'error' ? icon('refresh', 16) + 'ลองใหม่' : icon('check', 16) + 'ยืนยันการแก้'}</button></div></div></div>`;
  }
  if (md === 'reveal'){
    const m = getM(w.reveal.id), r = w.reveal;
    return `<div class="scrim" data-act="scrim"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">
      <div class="modal-h"><h3 id="mt">${icon('lock', 18)} เปิดดูตัวตนผู้โพสต์</h3><button class="x" data-act="closeModal" aria-label="ปิด">${icon('x', 18)}</button></div>
      <div class="modal-b"><div class="warnbox" style="margin-top:0">${icon('shield', 18)}<span>ตัวตนถูกซ่อนตาม <b>PDPA</b> การเปิดดูต้องมีเหตุผลที่จำเป็นต่อการสืบหาความจริง และ<b>ถูกบันทึกใน audit log</b></span></div>
      <div role="radiogroup" aria-label="เหตุผลในการเปิดดู">${['สืบหาแหล่งที่มาของข่าวปลอม', 'ตรวจสอบเว็บ/บัญชีแอบอ้างหน่วยงาน', 'ประสานตามคำร้องขอจากหน่วยงานที่เกี่ยวข้อง'].map((t, i) => `<button class="opt" role="radio" aria-checked="${r.reason === t}" data-act="pickRev" data-v="${t}" ${i === 0 ? 'data-first' : ''}><span class="rd"></span><span><b>${t}</b></span></button>`).join('')}</div></div>
      <div class="modal-f"><button class="btn" data-act="closeModal">ยกเลิก</button><button class="btn primary" data-act="doReveal" ${!r.reason ? 'aria-disabled="true"' : ''}>${icon('eye', 16)}เปิดดูและบันทึกเหตุผล</button></div></div></div>`;
  }
  return '';
}

/* ================= เคส / แจ้งเตือน ================= */
function pgCases(){
  const al = S.alerts.slice().sort((a, b) => SEV[b.sev].rank - SEV[a.sev].rank || a.ago - b.ago);
  const stLab = { new:'รอตัดสินใจ', ack:'รับทราบแล้ว', watch:'เฝ้าดู', escalated:'ยกระดับแล้ว', closed:'ปิดแล้ว' };
  return `<div class="ph"><div><h1>แจ้งเตือนและเคส</h1><div class="sub">การแจ้งเตือนจากระบบ และเคสที่ทีมกำลังติดตาม · ใช้ระดับความรุนแรง/สถานะชุดเดียวกับบนมือถือ</div></div></div>
  <div class="card"><div class="card-h"><h2>รายการแจ้งเตือน</h2></div><div class="card-b" style="padding-top:6px"><table class="tbl"><caption class="sr">รายการแจ้งเตือน</caption><thead><tr><th>ระดับ</th><th>หัวข้อ</th><th>ตรวจพบ</th><th>เหตุผลของระดับ</th><th>สถานะ</th></tr></thead><tbody>
  ${al.map(a => `<tr><td>${sevBadge(a.sev)}</td><td><b>${a.title}</b></td><td class="num">${clock(a.ago)}</td><td style="color:var(--ink-2)">${a.why}</td><td><span class="st st-${a.state === 'new' ? 'new' : a.state === 'watch' ? 'watch' : a.state === 'escalated' ? 'forward' : 'closed'}">${stLab[a.state] || a.state}</span></td></tr>`).join('')}</tbody></table></div></div>
  <div class="card" style="margin-top:12px"><div class="card-h"><h2>เคสที่ติดตาม</h2><div class="r"><span class="fl">ข่าวปลอม / เว็บปลอม / ยกระดับ</span></div></div><div class="card-b" style="padding-top:6px"><table class="tbl"><caption class="sr">เคสที่ติดตาม</caption><thead><tr><th>เลขเคส</th><th>เรื่อง</th><th>ประเภท</th><th>ผู้รับผิดชอบ</th><th>ความคืบหน้า</th><th>อายุเคส</th></tr></thead><tbody>
  ${S.cases.map(c => c.esc ? `<tr><td class="num"><b>${c.id}</b></td><td>${esc(c.title)}</td><td><span class="fl" style="background:var(--crit-bg);color:var(--crit)">ยกระดับ</span></td><td>${c.owner}</td><td><div>ส่งอีเมลแล้ว</div><small class="hint">ถึง ${esc(c.to)}</small></td><td class="num">${c.age}</td></tr>`
    : `<tr><td class="num"><b>${c.id}</b></td><td>${esc(c.title)}</td><td>${c.type}</td><td>${c.owner}</td><td><div class="mini4" role="img" aria-label="ขั้น ${CASE_STEPS[c.step]}">${CASE_STEPS.map((_, i) => `<i class="${i <= c.step ? 'on' : ''}"></i>`).join('')}</div><small class="hint">${CASE_STEPS[c.step]}</small></td><td class="num">${c.age}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="lowfi" style="margin-top:12px"><div style="display:flex;gap:10px;align-items:center;margin-bottom:8px"><span class="lf-tag">LOW-FI</span><b>ติดตามสถานะคำชี้แจง</b></div>
    <div class="step4" style="margin:0 0 6px" aria-label="สถานะคำชี้แจง"><div class="on">ร่าง</div><div class="on cur">รออนุมัติ</div><div>ออกแล้ว</div></div>
    <div class="hint">อยู่ที่ขั้น “รออนุมัติ” มาแล้ว <b class="num">3 ชม. 20 น.</b> · ไม่ตั้ง SLA ตายตัว เพราะลำดับขั้นอนุมัติแต่ละหน่วยงานต่างกัน (ต้องยืนยันกับผู้ใช้)</div></div>`;
}

/* ================= ตั้งค่า ================= */
function pgSettings(){
  const w = S.web, t = w.settingsTab;
  const tabs = [['watch', 'tag', 'Watchlist'], ['thr', 'zap', 'เกณฑ์ engagement'], ['notif', 'bell', 'การแจ้งเตือน'], ['order', 'send', 'ลำดับยกระดับ'], ['perm', 'shield', 'ความเป็นส่วนตัวและสิทธิ์']];
  let body = '';
  if (t === 'watch') body = `<div class="card"><div class="card-h"><h2>Watchlist (คำที่ติดตามเป็นประจำ)</h2></div><div class="card-b"><p class="hint" style="margin-top:0">ระบบจะแจ้งเตือนเรื่องผิดปกติ <b>นอกเหนือ</b>รายการนี้ด้วย เพื่อไม่ให้พลาดเรื่องใหม่ เช่น รูปแบบการหลอกลวงที่ยังไม่มีคำเรียกชัดเจน</p><div class="tagrow" style="margin-bottom:12px">${w.watchlist.map((k, i) => `<span class="chip on" style="padding-right:4px">${esc(k)}<button data-act="delWatch" data-v="${i}" aria-label="ลบ ${esc(k)}" style="width:24px;height:24px;border-radius:50%;display:grid;place-items:center">${icon('x', 13)}</button></span>`).join('')}</div><form data-form="addwatch" style="display:flex;gap:8px;max-width:420px"><label class="sr" for="wl">เพิ่มคำใหม่</label><input id="wl" class="in" placeholder="เพิ่มคำ เช่น ชื่อนโยบาย"><button class="btn primary" type="submit">เพิ่ม</button></form></div></div>`;
  if (t === 'thr'){ const n = S.mentions.filter(m => m.eng >= w.threshold).length; body = `<div class="card"><div class="card-h"><h2>เกณฑ์ engagement ของทีม</h2></div><div class="card-b"><p class="hint" style="margin-top:0">ค่าเริ่มต้น 1,000 — แต่ละทีมกำหนดได้เอง (ทีมติดตามข่าวอาจใช้เกณฑ์ต่างกัน) · ผลเห็นทันทีบน Dashboard และ Feed</p><label for="thr" style="font-weight:600">เกณฑ์: <b class="num" id="thr-v">≥ ${num(w.threshold)}</b></label><input id="thr" type="range" min="200" max="5000" step="100" value="${w.threshold}" data-live="thr"><div class="banner info" style="margin:12px 0 0">${icon('flag', 17)}<span>ข้อมูลตัวอย่าง 25 รายการ — เข้าเกณฑ์ <b class="num" id="thr-n">${n}</b> รายการ</span></div></div></div>`; }
  if (t === 'notif') body = `<div class="card"><div class="card-h"><h2>การแจ้งเตือนบนมือถือ</h2></div><div class="card-b"><div class="rowi"><div class="g"><label for="msev"><b>ส่ง push ตั้งแต่ระดับ</b></label><small>ระดับต่ำกว่านี้จะไม่ push แต่ยังเห็นในแท็บแจ้งเตือน</small></div><select id="msev" class="sel" data-act="setMinSev">${Object.keys(SEV).filter(k => k !== 'watch').map(k => `<option value="${k}" ${w.notif.minSev === k ? 'selected' : ''}>${SEV[k].label}</option>`).join('')}</select></div>
    <div class="rowi"><div class="g"><b>ส่ง push นอกเวลางาน</b><small>เรื่องวิกฤตส่งทันที — ข้อสันนิษฐานจากพฤติกรรมผู้ใช้ ต้องยืนยัน</small></div><button class="tgl" role="switch" aria-checked="${w.notif.quiet}" aria-label="ส่ง push นอกเวลางาน" data-act="tglQuiet"></button></div>
    <div class="rowi"><div class="g"><b>ตารางเวร / ผู้รับนอกเวลา</b><small>ฟีเจอร์นี้ยังไม่ทำในต้นแบบ — รอยืนยันกับผู้ใช้ว่ามีเวรจริงหรือไม่</small></div><span class="fl">ยังไม่ทำ</span></div></div></div>`;
  if (t === 'order') body = `<div class="card"><div class="card-h"><h2>ลำดับผู้รับการยกระดับ</h2></div><div class="card-b"><p class="hint" style="margin-top:0">ระบบเสนอผู้รับตามประเภทเรื่อง — ปรับลำดับ/รายชื่อได้ต่อทีม</p>${w.order.map((k, i) => `<div class="rowi"><span class="prio-n">${i + 1}</span><div class="g"><b>${PEOPLE[k].name}</b><small>${PEOPLE[k].who} · ${PEOPLE[k].ch}</small></div><button class="btn sm" data-act="moveRc" data-v="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="เลื่อนขึ้น">${icon('cd', 15).replace('<svg', '<svg style="transform:rotate(180deg)"')}</button><button class="btn sm" data-act="moveRc" data-v="${i}" data-d="1" ${i === w.order.length - 1 ? 'disabled' : ''} aria-label="เลื่อนลง">${icon('cd', 15)}</button></div>`).join('')}</div></div>`;
  if (t === 'perm') body = `<div class="card"><div class="card-h"><h2>สิทธิ์ต่อทีม</h2><div class="r"><span class="fl">LOW-FI</span></div></div><div class="card-b"><table class="tbl"><caption class="sr">สิทธิ์ตามบทบาท</caption><thead><tr><th>ทีม / บทบาท</th><th>ดูคอมเมนต์</th><th>เปิดดูตัวตน</th><th>Export</th><th>แก้ sentiment</th></tr></thead><tbody>${[['listener', 'ทีมติดตามโซเชียล'], ['media', 'ติดตามข่าวสื่อ'], ['exec', 'ผู้บริหาร (ผู้รับ)']].map(([k, n]) => `<tr><td><b>${n}</b></td>${['comments', 'reveal', 'export', 'edit'].map(p => `<td><button class="tgl" role="switch" aria-checked="${w.perms[k][p]}" aria-label="${n}: ${p}" data-act="tglPerm" data-k="${k}" data-v="${p}"></button></td>`).join('')}</tr>`).join('')}</tbody></table></div></div>
    <div class="card" style="margin-top:12px"><div class="card-h"><h2>Audit log การเปิดดูตัวตน</h2></div><div class="card-b">${S.audit.length ? S.audit.map(a => `<div class="rowi"><span class="lk" style="display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--surface-3)">${icon('eye', 16)}</span><div class="g"><b>${a.who} เปิดดูตัวตน (${a.post})</b><small>เหตุผล: ${a.why}</small></div><span class="num hint">${a.at}</span></div>`).join('') : '<p class="hint" style="margin:0">ยังไม่มีการเปิดดูตัวตนในรอบนี้ — ทุกครั้งที่เปิดดูจะถูกบันทึกที่นี่</p>'}</div></div>`;
  return `<div class="ph"><div><h1>ตั้งค่า</h1><div class="sub">ปรับเกณฑ์ การแจ้งเตือน และสิทธิ์ให้เหมาะกับทีม <span class="fl" style="margin-left:6px">MID-FI</span></div></div></div>
  <div class="set"><nav class="set-nav" aria-label="หมวดตั้งค่า">${tabs.map(([k, ic, lb]) => `<button data-act="stab" data-v="${k}" aria-current="${t === k}">${icon(ic, 17)}${lb}</button>`).join('')}</nav><div>${body}</div></div>`;
}

/* ================= Actions (เว็บ) ================= */
function webLoad(ms = 520){
  const w = S.web; w.loading = true; renderWeb();
  clearTimeout(webLoad.t); webLoad.t = setTimeout(() => { w.loading = false; renderWeb(); announce('โหลดข้อมูลเสร็จแล้ว'); }, S.demo.slow ? 2200 : ms);
}
Object.assign(A, {
  noop(el, e){ e.preventDefault(); toast('ต้นแบบ: ลิงก์ต้นฉบับไม่เปิดจริง'); },
  nav(el){ S.web.route = el.dataset.v; S.web.modal = null; if (el.dataset.v !== 'dashboard'){ S.web.deeplink = false; } renderWeb({ top:true }); },
  dtab(el){ S.web.dashTab = el.dataset.v; renderWeb({ top:true }); },
  setf(el){ const k = el.dataset.k, v = el.tagName === 'SELECT' ? el.value : el.dataset.v; S.web.f[k] = v; S.web.view = 'custom'; S.web.deeplink = S.web.deeplink && false; webLoad(); },
  setThr(el){ S.web.threshold = +el.value; renderWeb(); toast('ปรับเกณฑ์ engagement เป็น ≥ ' + num(S.web.threshold) + ' แล้ว'); },
  resetF(){ S.web.f = { plat:'all', range:'24h', sent:'all', src:'all' }; webLoad(); },
  saveView(){ const n = S.web.views.length; S.web.views.push({ id:'v' + n, name:'มุมมองของฉัน ' + n, f:{ ...S.web.f } }); S.web.view = 'v' + n; renderWeb(); toast('บันทึกมุมมองแล้ว — เรียกใช้ได้จากแถบซ้าย'); },
  applyView(el){ const v = S.web.views.find(x => x.id === el.dataset.v); S.web.route = 'dashboard'; S.web.f = { ...v.f }; S.web.view = v.id; webLoad(); },
  closeDeep(){ S.web.deeplink = false; S.web.hl = null; renderWeb(); },
  tbl(el){ S.web.table = el.dataset.v === '1'; renderWeb(); },
  retry(){ S.demo.error = false; syncDemo(); webLoad(900); },
  refresh(){ const w = S.web; w.updating = true; renderWeb(); setTimeout(() => { w.updating = false; w.refreshedAt = '14:30'; renderWeb(); announce('อัปเดตข้อมูลล่าสุด 14:30 น.'); }, 900); },
  peakFeed(){ const f = S.web.feed; S.web.route = 'feed'; f.tab = 'all'; f.win = true; f.topic = null; f.sel = null; renderWeb({ top:true }); toast('แสดงโพสต์ช่วง 13:00–14:30 น.'); },
  openHigh(){ const f = S.web.feed; S.web.route = 'feed'; f.tab = 'all'; f.onlyHigh = true; f.win = false; f.topic = null; renderWeb({ top:true }); },
  topicFeed(el){ const f = S.web.feed; S.web.route = 'feed'; f.tab = 'all'; f.topic = el.dataset.v; f.win = false; f.sel = null; renderWeb({ top:true }); },
  addWatch(el){ const t = TOPICS.find(x => x.id === el.dataset.v); if (!S.web.watchlist.includes(t.name)) S.web.watchlist.push(t.name); toast('เพิ่ม “' + t.name + '” เข้า watchlist แล้ว'); },
  export(){
    const w = S.web; if (w.export === 'busy') return;
    w.export = 'busy'; renderWeb();
    setTimeout(() => {
      if (S.demo.error){ w.export = 'error'; renderWeb(); announce('export ไม่สำเร็จ'); return; }
      const rows = [['เวลา', 'แพลตฟอร์ม', 'ข้อความ', 'engagement', 'ความรู้สึก', 'ลิงก์ต้นทาง']].concat(S.mentions.map(m => [clock(m.ago), PLAT[m.plat].name, m.text, m.eng, SENT[effSent(m)].label, 'https://example.org/post/' + m.id]));
      const csv = '﻿' + rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
      try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' })); a.download = 'signal-export-2569-11-16.csv'; document.body.appendChild(a); a.click(); a.remove(); } catch (e) {}
      w.export = 'done'; renderWeb(); toast('Export สำเร็จ · 25 รายการ พร้อมเวลาและลิงก์ต้นทาง'); announce('export สำเร็จ');
    }, 1300);
  },
  tglMail(){ S.web.notif.summaryMail = !S.web.notif.summaryMail; renderWeb(); },
  sendDigest(){ const w = S.web; if (w.digestSent === 'busy') return; w.digestSent = 'busy'; renderWeb(); setTimeout(() => { w.digestSent = 'ok'; renderWeb(); toast('ส่งสรุปเข้าอีเมลแล้ว'); }, 1100); },
  /* feed */
  ftab(el){ const f = S.web.feed; f.tab = el.dataset.v; f.sel = null; webLoad(380); },
  fsel(el){ S.web.feed[el.dataset.k] = el.value; renderWeb(); },
  fhigh(){ const f = S.web.feed; f.onlyHigh = !f.onlyHigh; renderWeb(); },
  clrTopic(){ S.web.feed.topic = null; renderWeb(); }, clrWin(){ S.web.feed.win = false; renderWeb(); },
  clrFeed(){ Object.assign(S.web.feed, { q:'', plat:'all', sent:'all', onlyHigh:false, topic:null, win:false }); renderWeb(); },
  selM(el){ S.web.feed.sel = el.dataset.v; renderWeb({ top:true }); announce('เปิดรายละเอียดโพสต์'); },
  openMention(el){ const f = S.web.feed; S.web.route = 'feed'; f.tab = 'review'; f.sel = el.dataset.v; renderWeb({ top:true }); },
  setStatus(el){ if (S.demo.noEdit) return toast('ไม่มีสิทธิ์เปลี่ยนสถานะ', { kind:'error' }); getM(el.dataset.id).status = el.dataset.v; renderWeb({ keepDet:true }); announce('เปลี่ยนสถานะเป็น ' + STATUS[el.dataset.v]); },
  assign(el){ getM(el.dataset.id).assignee = el.value || null; toast(el.value ? 'มอบหมายให้ ' + el.value + ' แล้ว' : 'ยกเลิกการมอบหมาย'); renderWeb({ keepDet:true }); },
  tag(el){ const m = getM(el.dataset.id), t = el.dataset.v; m.tags = m.tags.includes(t) ? m.tags.filter(x => x !== t) : [...m.tags, t]; renderWeb({ keepDet:true }); },
  fakeNext(el){ const m = getM(el.dataset.v); if (m.fake.step < 3){ m.fake.step++; toast('เคสไปขั้น “' + CASE_STEPS[m.fake.step] + '”'); const c = S.cases.find(x => x.mention === m.id); if (c) c.step = m.fake.step; renderWeb({ keepDet:true }); } },
  /* แก้ sentiment */
  correctOpen(el){ if (S.demo.noEdit) return toast('ทีมของคุณไม่ได้รับสิทธิ์แก้ผล', { kind:'error' }); S.web.corr = { id:el.dataset.v, reason:null, to:null, phase:'form' }; S.web.modal = 'correct'; S.web._op = 'correctOpen'; renderWeb({ openModal:true, keepDet:true }); },
  pickReason(el){ const m = getM(S.web.corr.id), r = REASONS.find(x => x.id === el.dataset.v); S.web.corr.reason = r.id; S.web.corr.to = m.guess || (m.sys === 'pos' ? 'neg' : r.to); S.web.corr.phase = 'form'; renderWeb({ keepDet:true }); },
  pickTo(el){ S.web.corr.to = el.dataset.v; renderWeb({ keepDet:true }); },
  saveFix(){
    const c = S.web.corr; if (!c.reason || c.phase === 'saving') return;
    c.phase = 'saving'; renderWeb({ keepDet:true });
    setTimeout(() => {
      if (S.demo.saveFail){ c.phase = 'error'; renderWeb({ keepDet:true }); announce('บันทึกไม่สำเร็จ ลองใหม่ได้'); return; }
      const m = getM(c.id); m.fix = { to:c.to, reason:c.reason, orig:m.sys, at:'14:30 น.' };
      S.corrections.push({ id:m.id, plat:m.plat, from:m.sys, to:c.to });
      S.web.modal = null; renderWeb({ keepDet:true });
      toast('แก้ผลแล้ว: ' + SENT[m.sys].label + ' → ' + SENT[c.to].label, { act:() => A.undoFix({ dataset:{ v:m.id } }), label:'ยกเลิก', ms:8000 });
      announce('แก้ผลความรู้สึกสำเร็จ ระบบจะนำไปปรับ');
    }, S.demo.slow ? 2000 : 900);
  },
  undoFix(el){ const m = getM(el.dataset.v); if (!m.fix) return; S.corrections = S.corrections.filter(c => c.id !== m.id); delete m.fix; renderWeb({ keepDet:true }); toast('ยกเลิกการแก้แล้ว — กลับเป็นผลเดิมของระบบ'); },
  /* PDPA */
  revealOpen(el){ if (S.demo.noEdit) return toast('ทีมของคุณไม่ได้รับสิทธิ์เปิดดูตัวตน', { kind:'error' }); S.web.reveal = { id:el.dataset.v, reason:'', done:S.web.reveal.done }; S.web.modal = 'reveal'; renderWeb({ openModal:true, keepDet:true }); },
  pickRev(el){ S.web.reveal.reason = el.dataset.v; renderWeb({ keepDet:true }); },
  doReveal(){ const r = S.web.reveal; if (!r.reason) return; r.done[r.id] = true; S.audit.unshift({ who:'คุณใบเตย', post:'โพสต์ ' + r.id.toUpperCase(), why:r.reason, at:'14:30 น.' }); S.web.modal = null; renderWeb({ keepDet:true }); toast('เปิดดูตัวตนแล้ว · บันทึกใน audit log'); },
  closeModal(){ S.web.modal = null; renderWeb({ keepDet:true }); },
  scrim(el, e){ if (e.target === el) A.closeModal(); },
  /* ตั้งค่า */
  stab(el){ S.web.settingsTab = el.dataset.v; renderWeb({ top:true }); },
  delWatch(el){ S.web.watchlist.splice(+el.dataset.v, 1); renderWeb(); },
  setMinSev(el){ S.web.notif.minSev = el.value; toast('ปรับระดับ push ขั้นต่ำแล้ว'); },
  tglQuiet(){ S.web.notif.quiet = !S.web.notif.quiet; renderWeb(); },
  moveRc(el){ const i = +el.dataset.v, d = +el.dataset.d, o = S.web.order; [o[i], o[i + d]] = [o[i + d], o[i]]; renderWeb(); },
  tglPerm(el){ const p = S.web.perms[el.dataset.k]; p[el.dataset.v] = !p[el.dataset.v]; renderWeb(); },
});
