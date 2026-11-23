/* ข้อมูลจำลอง — ทั้งหมดเป็นข้อมูลสมมติ ไม่อ้างอิงบุคคล/องค์กรจริง (PRD §10) */
const PLAT = {
  fb:   { name: 'Facebook',  short: 'FB',   cov: 98,  avgEng: 11.8, mk: 'circle'   },
  x:    { name: 'X',         short: 'X',    cov: 95,  avgEng: 7.2,  mk: 'square'   },
  tt:   { name: 'TikTok',    short: 'TT',   cov: 71,  avgEng: 20.5, mk: 'triangle', lag: 25 },
  news: { name: 'สำนักข่าว', short: 'ข่าว', cov: 100, avgEng: 3.1,  mk: 'diamond'  },
};

const SENT_RATIO = {
  fb:   { neg: .46, neu: .38, pos: .16 },
  x:    { neg: .52, neu: .34, pos: .14 },
  tt:   { neg: .41, neu: .40, pos: .19 },
  news: { neg: .22, neu: .63, pos: .15 },
};

/* ago = กี่นาทีก่อน 14:30 น. ของวันที่ 16 พ.ย. 2569 */
const MENTIONS = [
  // ---- จัดถูก (12) ----
  { id:'m1', plat:'fb', src:'social', handle:'FB-7a3f', real:'@somsri.p', ago:25, eng:3420, sys:'neg', conf:94, topic:'cyber',
    text:'บัตรเครดิตโดนตัดรัว 7 ครั้งภายใน 10 นาที ธนาคารบอกว่าเป็นช่องโหว่ฝั่งร้านค้าออนไลน์ แล้วเราต้องรอ 14 วันเพื่อรอผลสอบสวนเนี่ยนะ',
    kw:['โดนตัดรัว','รอ 14 วัน'], comments:['โดนเหมือนกันเลยค่ะ ตัดไป 4 รอบ','โทรไปสายไม่ว่างตลอด'], status:'new', assignee:null, tags:[] },
  { id:'m2', plat:'x', src:'social', handle:'X-c91d', real:'@nattapong_th', ago:41, eng:2180, sys:'neg', conf:91, topic:'cyber',
    text:'ตกใจมากเช็คแอปเจอยอดโดนตัดบัตรเครดิตสองหมื่นกว่าบาท ที่ไม่ได้ซื้อเอง ใครโดนเหมือนกันบ้างครับ ระบบความปลอดภัยของประเทศไปไหนหมด',
    kw:['ตกใจมาก','ไม่ได้ซื้อเอง','ไปไหนหมด'], comments:['โดนเมื่อเช้าเหมือนกัน','อย่าเพิ่งกดลิงก์ไหนนะทุกคน'], status:'new', assignee:null, tags:[] },
  { id:'m3', plat:'tt', src:'social', handle:'TT-20be', real:'@mintra.vlog', ago:55, eng:5100, sys:'neg', conf:88, topic:'cyber',
    text:'เตือนภัย ถ้าเคยกดลิงก์ SMS ส่งพัสดุเมื่อสัปดาห์ก่อน รีบเช็คบัตรด่วน ๆ เลย เพื่อนโดนไปแล้วสามใบ',
    kw:['เตือนภัย','โดนไปแล้ว'], comments:['ขอบคุณที่เตือนนะคะ','เพิ่งกดไปเมื่อวานเลย'], status:'watch', assignee:'ภูผา', tags:['ภัยไซเบอร์'] },
  { id:'m4', plat:'fb', src:'social', handle:'FB-b204', real:'@wichai.s', ago:130, eng:1260, sys:'neg', conf:90, topic:'frozen',
    text:'บัญชีโดนอายัดมาสามวันแล้ว โทรไปก็ไม่มีใครรับสาย ต้องใช้เงินจ่ายค่าเทอมลูกพรุ่งนี้ ทำยังไงดี',
    kw:['โดนอายัด','ไม่มีใครรับสาย'], comments:['เจอเหมือนกัน รอมา 5 วัน'], status:'new', assignee:null, tags:[] },
  { id:'m5', plat:'x', src:'social', handle:'X-48aa', real:'@kanya_r', ago:210, eng:980, sys:'neg', conf:86, topic:'frozen',
    text:'ขั้นตอนขอปลดอายัดยุ่งยากมาก ต้องใช้เอกสาร 6 อย่าง แถมต้องไปด้วยตัวเองเท่านั้น',
    kw:['ยุ่งยากมาก','ต้องไปด้วยตัวเอง'], comments:[], status:'new', assignee:null, tags:[] },
  { id:'m6', plat:'fb', src:'social', handle:'FB-91c0', real:'@pimchanok.l', ago:300, eng:1740, sys:'pos', conf:93, topic:'praise',
    text:'ขอบคุณเจ้าหน้าที่ศูนย์ 1111 ที่ตอบกลับไวมาก ช่วยอายัดบัตรเครดิตให้เสร็จภายในวันเดียว ประทับใจจริง ๆ',
    kw:['1111','ขอบคุณ','ไวมาก','ประทับใจ'], comments:['ดีใจด้วยค่ะ'], status:'closed', assignee:null, tags:[] },
  { id:'m7', plat:'x', src:'social', handle:'X-77f1', real:'@arthit.k', ago:480, eng:420, sys:'pos', conf:89, topic:'praise',
    text:'ระบบแจ้งเตือนธุรกรรมใหม่ใช้ง่ายดี เห็นเลยว่าใครมาเกี่ยวข้อง อุ่นใจขึ้นเยอะ',
    kw:['ใช้ง่ายดี','อุ่นใจ'], comments:[], status:'closed', assignee:null, tags:[] },
  { id:'m8', plat:'fb', src:'social', handle:'FB-e5d2', real:'@official.page', ago:620, eng:610, sys:'neu', conf:87, topic:'other',
    text:'ประกาศ: ศูนย์ให้คำปรึกษาทางการเงิน 1111 เปิดให้บริการเสาร์-อาทิตย์ 09.00–16.00 น. ตั้งแต่สัปดาห์หน้า',
    kw:['1111','ประกาศ','เปิดให้บริการ'], comments:['ขอบคุณสำหรับข้อมูลค่ะ'], status:'closed', assignee:null, tags:[] },
  { id:'m9', plat:'tt', src:'social', handle:'TT-3c9a', real:'@khunkru.say', ago:700, eng:230, sys:'neu', conf:82, topic:'fakebill',
    text:'สรุปวิธีเช็คธนบัตรปลอมแบบง่าย ๆ 3 จุดสังเกต ดูคลิปนี้ได้เลย',
    kw:['วิธีเช็ค','จุดสังเกต'], comments:['มีประโยชน์มากค่ะ'], status:'closed', assignee:null, tags:[] },
  { id:'m10', plat:'x', src:'social', handle:'X-d2e8', real:'@lukkaew_88', ago:95, eng:1510, sys:'neg', conf:90, topic:'fakebill',
    text:'ได้เงินทอนเป็นแบงก์พันปลอมจากตลาดนัด รู้ตอนเอาไปจ่ายร้านถัดไป อายมาก ใครเจอแบบนี้บ้าง',
    kw:['แบงก์พันปลอม','อายมาก'], comments:['เจอมาแล้วเมื่อเดือนก่อน'], status:'new', assignee:null, tags:[] },
  { id:'m11', plat:'fb', src:'social', handle:'FB-02bb', real:'@malee.t', ago:160, eng:2890, sys:'neg', conf:85, topic:'fakebill',
    text:'ธนบัตรปลอมแบบนี้ระบาดทั่วตลาดแล้ว หน่วยงานรู้เรื่องหรือยังคะ ทำไมไม่เห็นประกาศอะไรเลย',
    kw:['ระบาด','ไม่เห็นประกาศ'], comments:['อยากให้ออกประกาศด่วน','แม่ค้าแถวบ้านก็โดน'], status:'new', assignee:null, tags:[] },
  { id:'m12', plat:'fb', src:'social', handle:'FB-6f1e', real:'@thawatchai.n', ago:35, eng:340, sys:'neu', conf:80, topic:'cyber',
    text:'ใครมีลิงก์ตรวจสอบสถานะบัตรที่ถูกต้องบ้างครับ ไม่อยากกดมั่ว',
    kw:['ตรวจสอบสถานะ','ไม่อยากกดมั่ว'], comments:['ดูจากแอปธนาคารโดยตรงดีที่สุด'], status:'new', assignee:null, tags:[] },

  // ---- ระบบจัดผิด (7) — จุดเด่นของกรณีที่ 2 ----
  { id:'m13', plat:'x', src:'social', handle:'X-5b72', real:'@bank_nong_', ago:22, eng:4120, sys:'neg', conf:54, topic:'cyber',
    guess:'neu', flags:['sarcasm'],
    text:'ข่าวบอกบัตรโดนตัดรัว แต่บัญชีเรามีเงินไม่ถึงร้อย โจรเปิดมาคงน้ำตาไหล 555 ขอบคุณที่ทำให้เราไม่ต้องห่วงเรื่องนี้เลย 😂',
    kw:['โดนตัดรัว','โจร','น้ำตาไหล'], comments:['ฮาตรงโจรน้ำตาไหลนี่แหละ','เห็นด้วย บัญชีเราก็ว่างเปล่า 555'], status:'new', assignee:null, tags:[] },
  { id:'m14', plat:'fb', src:'social', handle:'FB-1d40', real:'@sunisa.w', ago:48, eng:3100, sys:'pos', conf:52, topic:'frozen',
    guess:'neg', flags:['sarcasm'],
    text:'ขอบคุณมากค่ะที่โทรไปเบอร์ 1111 ไป 15 สาย ได้ฟังเพลงรอสายครบทุกเพลงเลย ไพเราะมาก',
    kw:['1111','ขอบคุณมาก','ไพเราะมาก'], comments:['555 ประชดได้เจ็บมาก','โทรไป 20 สายก็ยังไม่ติด'], status:'new', assignee:null, tags:[] },
  { id:'m15', plat:'x', src:'social', handle:'X-a0c3', real:'@newsdesk_bot', ago:58, eng:2600, sys:'neg', conf:57, topic:'cyber',
    guess:'neu', flags:['news-quote'],
    text:'รายงานข่าว: ผู้เสียหายบัตรเครดิตถูกตัดรัวกว่า 300 ราย หน่วยงานเตรียมแถลงความคืบหน้า',
    kw:['ผู้เสียหาย','ถูกตัดรัว'], comments:['รอดูแถลงการณ์'], status:'new', assignee:null, tags:[] },
  { id:'m16', plat:'tt', src:'social', handle:'TT-88d4', real:'@gen_z_kuy', ago:75, eng:2250, sys:'pos', conf:51, topic:'cyber',
    guess:'neg', flags:['slang'],
    text:'ภัยไซเบอร์รอบนี้ปังมาก ปังจนบัญชีเราเกลี้ยงเลยจ้า',
    kw:['ปังมาก'], comments:['ปังจริงอะไรจริง 555','เกลี้ยงเหมือนกันค่ะ'], status:'new', assignee:null, tags:[] },
  { id:'m17', plat:'fb', src:'social', handle:'FB-c3e9', real:'@jirapa.m', ago:185, eng:1380, sys:'neg', conf:55, topic:'frozen',
    guess:'neu', flags:['mixed'],
    text:'บัญชีโดนอายัดจริง แต่ต้องยอมรับว่าเจ้าหน้าที่ที่โทรกลับสุภาพและแก้ให้เร็วมาก ขอบคุณค่ะ',
    kw:['โดนอายัด','สุภาพ','ขอบคุณ'], comments:['ดีใจที่ได้รับการแก้ไขค่ะ'], status:'new', assignee:null, tags:[] },
  { id:'m18', plat:'x', src:'social', handle:'X-e61b', real:'@pongsakorn_', ago:240, eng:1190, sys:'neu', conf:46, topic:'frozen',
    guess:'neg', flags:['sarcasm'],
    text:'ประกาศอายัดบัญชีรอบนี้ก็เท่าเดิม ไม่ต่างจากรอบก่อน (ตบมือ)',
    kw:['เท่าเดิม','ตบมือ'], comments:[], status:'new', assignee:null, tags:[] },
  { id:'m19', plat:'fb', src:'social', handle:'FB-9a77', real:'@anong.c', ago:110, eng:1820, sys:'neg', conf:50, topic:'cyber',
    guess:'neu', flags:['news-quote'],
    text:'เขาว่าโดนตัดบัตรรัวทั้งประเทศ ที่จริงแค่คนที่กดลิงก์เองนะ อย่าตื่นตระหนกกันเกินเหตุ',
    kw:['โดนตัดบัตรรัว','ตื่นตระหนก'], comments:['เห็นด้วย ใจเย็นก่อน'], status:'new', assignee:null, tags:[] },

  // ---- ข่าวปลอม/เว็บปลอม (3) ----
  { id:'f1', plat:'fb', src:'social', handle:'FB-fa11', real:'@refund.center.th', ago:150, eng:2210, sys:'neg', conf:78, topic:'fakeweb',
    fake:{ type:'เว็บปลอม', step:1 },
    text:'ลงทะเบียนรับเงินคืนผู้เสียหายบัตรเครดิตที่เว็บนี้ได้เลย (ลิงก์ชื่อคล้ายหน่วยงาน) กรอกเลขบัตรประชาชนและรหัส OTP',
    kw:['รับเงินคืน','OTP','กรอกเลขบัตร'], comments:['ระวังมิจฉาชีพ!','เว็บนี้ไม่ใช่ของจริงนะ'], status:'forward', assignee:'บอส', tags:['เว็บปลอม'] },
  { id:'f2', plat:'tt', src:'social', handle:'TT-fa22', real:'@urgent.news.24', ago:300, eng:7400, sys:'neg', conf:81, topic:'fakeweb',
    fake:{ type:'ข่าวบิดเบือน', step:0 },
    text:'ด่วน! หน่วยงานจะอายัดบัญชีทุกคนที่ไม่ได้ยืนยันตัวตนภายใน 24 ชม. รีบแชร์ให้ครอบครัว',
    kw:['ด่วน','อายัดบัญชีทุกคน','รีบแชร์'], comments:['จริงเหรอ ตกใจหมด','ไม่มีประกาศแบบนี้นะ'], status:'watch', assignee:'ภูผา', tags:['ข่าวบิดเบือน'] },
  { id:'f3', plat:'x', src:'social', handle:'X-fa33', real:'@share_before_late', ago:420, eng:3300, sys:'neg', conf:76, topic:'fakebill',
    fake:{ type:'ข่าวบิดเบือน', step:2 },
    text:'แชร์ไว้ ธนบัตรรุ่นใหม่จะประกาศใช้ไม่ได้แล้วต้องรีบเอาไปแลกภายในสิ้นเดือน',
    kw:['แชร์ไว้','ใช้ไม่ได้แล้ว','รีบเอาไปแลก'], comments:['ไม่จริงนะ ดูประกาศทางการ'], status:'forward', assignee:'ภูผา', tags:['ข่าวบิดเบือน'] },

  // ---- ข่าวสำนักข่าว (3) ----
  { id:'n1', plat:'news', src:'news', handle:'ไทยเศรษฐกิจรายวัน', real:'ไทยเศรษฐกิจรายวัน', ago:38, eng:820, sys:'neg', conf:84, topic:'cyber',
    text:'ผู้เสียหายบัตรเครดิตถูกตัดรัวพุ่งเกิน 300 ราย หน่วยงานเตรียมแถลง',
    kw:['ผู้เสียหาย','ตัดรัว'], comments:[], status:'new', assignee:null, tags:[] },
  { id:'n2', plat:'news', src:'news', handle:'สำนักข่าวทันเหตุ', real:'สำนักข่าวทันเหตุ', ago:88, eng:640, sys:'neu', conf:83, topic:'cyber',
    text:'ตำรวจไซเบอร์เตือน SMS พัสดุปลอมระบาดหนัก อย่ากดลิงก์แปลกปลอม',
    kw:['เตือน','SMS พัสดุปลอม'], comments:[], status:'watch', assignee:'ภูผา', tags:[] },
  { id:'n3', plat:'news', src:'news', handle:'ข่าวภาคกลางออนไลน์', real:'ข่าวภาคกลางออนไลน์', ago:260, eng:410, sys:'neg', conf:79, topic:'fakebill',
    text:'ธนบัตรปลอมระบาดตลาดนัดภาคกลาง หน่วยงานเร่งตรวจสอบ',
    kw:['ธนบัตรปลอม','ระบาด'], comments:[], status:'new', assignee:null, tags:[] },
];

const ALERTS = [
  { id:'a1', sev:'critical', topic:'cyber', title:'ภัยไซเบอร์ลามกระทบความเชื่อมั่น', short:'ตัดบัตรเครดิตรัว', ago:18,
    big:'6.8×', bigLabel:'ของปกติ', mph:1284, hi:3, why:'กระทบคนวงกว้าง · engagement เกินเกณฑ์ 3 โพสต์',
    what:'เรื่องตัดบัตรเครดิตรัวกำลังลามเข้าสู่ความเชื่อมั่นต่อหน่วยงาน — ยังไม่อยู่ใน watchlist',
    mix:{ fb:54, x:28, tt:18 }, off:true, recips:['dir','sdir'], state:'new' },
  { id:'a2', sev:'high', topic:'fakebill', title:'ธนบัตรปลอมระบาดตลาดนัด', short:'ธนบัตรปลอม', ago:96,
    big:'3.1×', bigLabel:'ของปกติ', mph:412, hi:2, why:'มีผู้ตั้งคำถามถึงหน่วยงานโดยตรง',
    what:'ผู้ใช้หลายรายถามว่าหน่วยงานรับทราบหรือยัง และยังไม่มีประกาศชี้แจง',
    mix:{ fb:49, x:35, tt:16 }, off:false, recips:['dir','area'], state:'new' },
  { id:'a3', sev:'medium', topic:'frozen', title:'บัญชีถูกอายัดแต่ติดต่อไม่ได้', short:'อายัดบัญชี', ago:140,
    big:'2.2×', bigLabel:'ของปกติ', mph:236, hi:1, why:'พาดพิงช่องทางติดต่อของหน่วยงาน',
    what:'ผู้ใช้บ่นเรื่องโทรไม่ติดและเอกสารขอปลดอายัดยุ่งยาก',
    mix:{ fb:58, x:30, tt:12 }, off:false, recips:['ddir'], state:'new' },
  { id:'a4', sev:'watch', topic:'fakeweb', title:'เว็บปลอมแอบอ้างหน่วยงาน', short:'เว็บปลอม', ago:150,
    big:'1.6×', bigLabel:'ของปกติ', mph:98, hi:1, why:'เฝ้าดู — ยังไม่ถึงเกณฑ์ยกระดับ',
    what:'พบลิงก์ลงทะเบียนรับเงินคืนที่ชื่อคล้ายหน่วยงาน กำลังตรวจสอบโดเมน',
    mix:{ fb:70, x:12, tt:18 }, off:false, recips:['media','dir'], state:'watch' },
  { id:'a5', sev:'low', topic:'praise', title:'คำชมศูนย์ 1111 เปิดเสาร์-อาทิตย์', short:'คำชมเชย', ago:310,
    big:'1.3×', bigLabel:'ของปกติ', mph:61, hi:0, why:'กระแสบวก ไม่ต้องดำเนินการ',
    what:'ผู้ใช้ขอบคุณการขยายเวลาให้บริการของศูนย์ให้คำปรึกษาทางการเงิน 1111',
    mix:{ fb:62, x:30, tt:8 }, off:false, recips:['media'], state:'closed' },
];

const SLOW_MS = 7000;   // เวลารอ (มิลลิวินาที) ในสถานะ "เครือข่ายช้า"

const PEOPLE = {
  ddir: { name:'รองผู้อำนวยการ ฝ่ายสื่อสาร',   who:'คุณธนา',    ch:'อีเมล', tel:'02-000-0101' },
  dir:  { name:'ผู้อำนวยการฝ่ายสื่อสาร',         who:'คุณนภา',    ch:'อีเมล', tel:'02-000-0102' },
  sdir: { name:'ผู้อำนวยการอาวุโส ฝ่ายสื่อสาร',  who:'คุณวีระ',   ch:'อีเมล', tel:'02-000-0103' },
  media:{ name:'ทีมสื่อ',                         who:'คุณปรีชา',  ch:'อีเมล', tel:'02-000-0104' },
  area: { name:'สำนักงานภาค',                     who:'คุณสุเมธ',  ch:'อีเมล', tel:'02-000-0105' },
};

const DUTY = { name:'ศูนย์ประสานงานฝ่ายสื่อสาร (เวร)', tel:'02-000-0100' };

const TOPICS = [
  { id:'cyber',    name:'ภัยไซเบอร์ / ตัดบัตรรัว', mult:6.8, base:190, now:1284, off:true,  conf:'ปานกลาง' },
  { id:'fakebill', name:'ธนบัตรปลอม',               mult:3.1, base:133, now:412,  off:true,  conf:'สูง' },
  { id:'sms',      name:'SMS พัสดุปลอม',             mult:2.4, base:44,  now:106,  off:true,  conf:'ปานกลาง' },
];

const CASES_SEED = [
  { id:'C-2569-014', title:'เว็บปลอมแอบอ้างหน่วยงาน (ลิงก์รับเงินคืน)', type:'เว็บปลอม', owner:'บอส', step:1, age:'2 ชม. 30 น.', mention:'f1' },
  { id:'C-2569-013', title:'ข่าวบิดเบือน: ธนบัตรรุ่นใหม่ใช้ไม่ได้', type:'ข่าวบิดเบือน', owner:'ภูผา', step:2, age:'7 ชม.', mention:'f3' },
  { id:'C-2569-012', title:'ข่าวบิดเบือน: อายัดบัญชีทุกคนใน 24 ชม.', type:'ข่าวบิดเบือน', owner:'ภูผา', step:0, age:'5 ชม.', mention:'f2' },
];
const CASE_STEPS = ['ตรวจสอบ','ส่งต่อ','ขอ take down','ปิดเคส'];

/* ซีรีส์เวลา — สร้างแบบกำหนดผลลัพธ์ได้ (seeded) */
function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
function buildSeries(range){
  const R = rng(range === '24h' ? 11 : range === '7d' ? 23 : 37);
  const n = range === '24h' ? 24 : range === '7d' ? 7 : 30;
  const base = { fb: 85, x: 55, tt: 38, news: 12 };
  const labels = [], s = { fb: [], x: [], tt: [], news: [] };
  for (let i = 0; i < n; i++){
    let lab, k;
    if (range === '24h'){ const h = (15 + i) % 24; lab = String(h).padStart(2,'0') + ':00'; k = .55 + .5 * Math.sin(((h - 6) / 24) * Math.PI * 2 - 1.2) + .35; }
    else { const d = 16 - (n - 1 - i); const dd = d <= 0 ? 31 + d : d; const mo = d <= 0 ? 9 : 10; lab = dd + ' ' + MONTHS[mo]; k = .8 + R() * .4; }
    labels.push(lab);
    const spike = i === n - 1 ? (range === '24h' ? 5.3 : 3.2) : (range === '24h' && i === n - 2 ? 2.2 : 1);
    for (const key in s){
      const jitter = .88 + R() * .24;
      const scale = range === '24h' ? 1 : 24;
      let v = base[key] * k * jitter * spike * scale;
      if (key === 'news') v = base[key] * k * jitter * (spike > 1 ? 1 + (spike - 1) * .25 : 1) * scale;
      s[key].push(Math.round(v));
    }
  }
  return { labels, s };
}
