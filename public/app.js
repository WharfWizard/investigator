/* ═══════════════════════════════════════════════
   Investigator™  —  app.js
   Academy of Life Planning / Get SAFE channel
   ═══════════════════════════════════════════════ */

const state = {
  cur: 0,
  total: 7,
  answers: {},
  multiAnswers: {},
  checksDone: {},
  analysisFindings: [],
  refNumber: generateRef()
};

function generateRef() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `INV-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
}

/* ─── Boot ─── */
document.addEventListener('DOMContentLoaded', () => {
  buildDots();
  updateNav();
  bindUpload();
});

/* ─── Progress dots ─── */
function buildDots() {
  const track = document.getElementById('progress-track');
  const label = document.getElementById('progress-label');
  track.innerHTML = '';
  for (let i = 0; i < state.total; i++) {
    const seg = document.createElement('div');
    seg.className = 'progress-seg' +
      (i < state.cur ? ' done' : i === state.cur ? ' active' : '');
    track.appendChild(seg);
  }
  label.textContent = `Stage ${state.cur + 1} of ${state.total}`;
}

/* ─── Navigation ─── */
function goNext() {
  if (state.cur === 3) buildAutoChecks();
  if (state.cur < state.total - 1) {
    document.getElementById('s' + state.cur).classList.remove('active');
    state.cur++;
    document.getElementById('s' + state.cur).classList.add('active');
    if (state.cur === state.total - 1) buildSummary();
  } else {
    // restart
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    state.cur = 0;
    state.answers = {};
    state.multiAnswers = {};
    state.checksDone = {};
    state.analysisFindings = [];
    state.refNumber = generateRef();
    document.getElementById('s0').classList.add('active');
    document.getElementById('firm-name').value = '';
    document.getElementById('analysis-output').style.display = 'none';
    document.getElementById('file-preview').style.display = 'none';
    document.getElementById('drop-zone').style.display = 'block';
    document.querySelectorAll('.q-btn').forEach(b => {
      b.classList.remove('sel-green', 'sel-red', 'sel-amber');
    });
  }
  updateNav();
  buildDots();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
  if (state.cur > 0) {
    document.getElementById('s' + state.cur).classList.remove('active');
    state.cur--;
    document.getElementById('s' + state.cur).classList.add('active');
    updateNav();
    buildDots();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function updateNav() {
  const back = document.getElementById('nav-back');
  const next = document.getElementById('nav-next');
  const stage = document.getElementById('nav-stage');
  back.style.visibility = state.cur === 0 ? 'hidden' : 'visible';
  next.textContent = state.cur === state.total - 1 ? 'Start again →' : 'Continue →';
  stage.textContent = `Stage ${state.cur + 1} of ${state.total}`;
}

/* ─── Answer selection ─── */
function pick(btn, key, val) {
  state.answers[key] = val;
  // Show FCA threshold band notice dynamically
  if (key === 'criteria') {
    const notice = document.getElementById('threshold-band-notice');
    if (notice) notice.style.display = val === 'yes-band' ? 'flex' : 'none';
  }
  const group = btn.closest('.q-options');
  group.querySelectorAll('.q-btn').forEach(b => {
    b.classList.remove('sel-green', 'sel-red', 'sel-amber');
  });
  const RED  = ['cold','social','major','borrowed','strong','yes','nominal','none','thin',
                 'unknown','remote','4-5','severe','unread','no-freedom','risk'];
  const GREEN = ['own','clear','0-1','manageable','uk','fscs','yes-responsible','uk-courts'];
  btn.classList.add(
    RED.includes(val)   ? 'sel-red'   :
    GREEN.includes(val) ? 'sel-green' : 'sel-amber'
  );
}

function pickMulti(btn, key, val) {
  if (!state.multiAnswers[key]) state.multiAnswers[key] = new Set();
  const ma = state.multiAnswers[key];
  if (val === 'none' || val === 'unsure') {
    ma.clear();
    ma.add(val);
    btn.closest('.q-options').querySelectorAll('.q-btn').forEach(b => {
      b.classList.remove('sel-green', 'sel-red', 'sel-amber');
    });
    btn.classList.add(val === 'none' ? 'sel-green' : 'sel-amber');
  } else {
    ma.delete('none');
    ma.delete('unsure');
    if (ma.has(val)) {
      ma.delete(val);
      btn.classList.remove('sel-green', 'sel-red', 'sel-amber');
    } else {
      ma.add(val);
      btn.classList.add('sel-red');
    }
  }
  state.answers[key] = Array.from(ma);
}

/* ─── Upload & file handling ─── */
function bindUpload() {
  const zone = document.getElementById('drop-zone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag');
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  });
}

function triggerUpload() { document.getElementById('file-input').click(); }
function triggerCamera() { document.getElementById('camera-input').click(); }

function handleFileInput(input) {
  const f = input.files[0];
  if (f) handleFile(f);
}

function removeFile() {
  document.getElementById('file-preview').style.display = 'none';
  document.getElementById('drop-zone').style.display = 'block';
  document.getElementById('analysis-output').style.display = 'none';
  state.analysisFindings = [];
}

function handleFile(file) {
  const sz = file.size < 1024 * 1024
    ? (file.size / 1024).toFixed(0) + ' KB'
    : (file.size / 1024 / 1024).toFixed(1) + ' MB';

  const preview = document.getElementById('file-preview');
  preview.style.display = 'flex';
  preview.innerHTML = `
    <span class="file-preview-icon">📄</span>
    <div class="file-preview-info">
      <div class="file-preview-name">${escHtml(file.name)}</div>
      <div class="file-preview-size">${sz}</div>
    </div>
    <button class="file-preview-remove" onclick="removeFile()" aria-label="Remove file">✕</button>`;
  document.getElementById('drop-zone').style.display = 'none';
  analyseDocument(file);
}

async function analyseDocument(file) {
  const out = document.getElementById('analysis-output');
  out.style.display = 'block';
  out.innerHTML = `<div class="analysis-box">
    <div class="analysis-title"><span class="spinner"></span> Investigator is reading your document…</div>
    <div style="font-size:12px;color:#3d5280;line-height:1.5">Extracting key terms, checking for risk indicators, and pre-filling relevant stages.</div>
  </div>`;

  try {
    const base64 = await toBase64(file);
    const isPDF = file.type === 'application/pdf';
    const msgContent = isPDF
      ? [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
         { type: 'text', text: ANALYSIS_PROMPT }]
      : [{ type: 'image', source: { type: 'base64', media_type: file.type, data: base64 } },
         { type: 'text', text: ANALYSIS_PROMPT }];

    const resp = await fetch('/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: msgContent }]
      })
    });

    const data = await resp.json();
    const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

    state.analysisFindings = parsed.findings || [];
    applyPrefills(parsed);
    renderAnalysis(parsed, out);
  } catch (e) {
    out.innerHTML = `<div class="analysis-box">
      <div class="analysis-title">⚠ Document could not be fully analysed</div>
      <div style="font-size:12px;color:#3d5280">Continue through the stages manually. Your answers will still generate a full summary.</div>
    </div>`;
  }
}

const ANALYSIS_PROMPT = `You are a financial due diligence assistant. Analyse this investment document carefully and return ONLY a valid JSON object — no preamble, no markdown fences. Use this exact structure:
{
  "firm_name": "string or null",
  "jurisdiction": "uk|eea|offshore|unclear",
  "domicile": "uk|eea|established|cayman|thin|unknown",
  "promised_return": "string or null",
  "lock_up": "string or null",
  "fscs_covered": true|false|null,
  "classif_required": ["sophisticated"|"hnw"|"restricted"|"professional"],
  "regulator_named": "string or null",
  "legal_jurisdiction": "uk|accessible|remote|unknown",
  "findings": [
    {"type":"risk|caution|ok","text":"plain English, maximum 18 words"}
  ]
}
Flag: unusually high returns (above 7% fixed), lock-up periods, FSCS exclusions, offshore registration, client self-certification requirements, missing or buried risk warnings, one-sided exit or penalty clauses, opaque fee structures, vague strategy descriptions, missing audited accounts. Maximum 8 findings. Be factual and specific.`;

function applyPrefills(p) {
  if (p.firm_name) {
    const fi = document.getElementById('firm-name');
    if (fi && !fi.value) {
      fi.value = p.firm_name;
      state.answers.firm = p.firm_name;
    }
  }
  if (p.jurisdiction)      state.answers._pj  = p.jurisdiction;
  if (p.domicile)          state.answers._pd  = p.domicile;
  if (p.legal_jurisdiction) state.answers._plj = p.legal_jurisdiction;

  if (p.classif_required && p.classif_required.length) {
    const labels = {
      sophisticated: '"Sophisticated investor" certification',
      hnw: '"High net worth" declaration',
      restricted: '"Restricted investor" certification',
      professional: '"Professional client" classification'
    };
    const el = document.getElementById('classif-prefill');
    if (el) {
      el.innerHTML = `<div class="notice amber">
        <span class="notice-icon">✦</span>
        <span>Document requires: <strong>${p.classif_required.map(c => labels[c] || c).join(', ')}</strong></span>
      </div>`;
    }
    document.getElementById('classif-tag').style.display = 'inline-flex';
  }

  if (p.domicile && ['cayman', 'thin'].includes(p.domicile)) {
    const el = document.getElementById('offshore-prefill');
    if (el) {
      el.innerHTML = `<div class="notice warn">
        <span class="notice-icon">⚠</span>
        <span>Document indicates offshore domicile — this stage is particularly important.</span>
      </div>`;
    }
    document.getElementById('offshore-tag').style.display = 'inline-flex';
  }
}

function renderAnalysis(p, out) {
  const ICONS = { risk: '⛔', caution: '⚠', ok: '✓' };
  const findings = (p.findings || []).map(f => `
    <div class="finding ${f.type}">
      <span class="finding-icon">${ICONS[f.type] || '•'}</span>
      <span>${escHtml(f.text)}</span>
    </div>`).join('');

  const meta = [];
  if (p.promised_return) meta.push(`<span><strong>Return:</strong> ${escHtml(p.promised_return)}</span>`);
  if (p.lock_up)         meta.push(`<span><strong>Lock-up:</strong> ${escHtml(p.lock_up)}</span>`);
  if (p.regulator_named) meta.push(`<span><strong>Regulator:</strong> ${escHtml(p.regulator_named)}</span>`);
  if (p.fscs_covered === false) meta.push(`<span style="color:#b91c1c"><strong>FSCS:</strong> Not covered</span>`);

  out.innerHTML = `<div class="analysis-box">
    <div class="analysis-title">🔍 Document analysis complete</div>
    ${meta.length ? `<div class="analysis-meta">${meta.join('')}</div>` : ''}
    ${findings ? `<div class="analysis-findings">${findings}</div>`
               : '<div style="font-size:12px;color:#3d5280">No specific risk indicators extracted — continue through the stages.</div>'}
  </div>`;
}

/* ─── Auto checks ─── */
function buildAutoChecks() {
  const firm = state.answers.firm || 'the firm';
  const enc = encodeURIComponent(firm);
  const checks = [
    { id: 'fca-reg',   icon: '🏛',  title: 'FCA Register',            body: `Is ${firm} authorised by the FCA?`,                                           url: `https://register.fca.org.uk/s/search#q=${enc}&t=Companies&sort=score`,                                      label: 'Search FCA Register' },
    { id: 'fca-warn',  icon: '🛡',  title: 'FCA Warning List',         body: 'Firms operating without authorisation or suspected of fraud.',                  url: 'https://www.fca.org.uk/consumers/warning-list-unauthorised-firms',                                           label: 'Check warning list' },
    { id: 'scamsmart', icon: '🔎',  title: 'FCA ScamSmart',            body: "The FCA's investment scam check and report tool.",                              url: 'https://www.fca.org.uk/scamsmart/check-if-firm-regulated',                                                   label: 'Use ScamSmart' },
    { id: 'ch',        icon: '🏢',  title: 'Companies House',          body: `Registration date, filing history, accounts and directors for ${firm}.`,        url: `https://find-and-update.company-information.service.gov.uk/search?q=${enc}`,                                 label: 'Search Companies House' },
    { id: 'disq',      icon: '👤',  title: 'Disqualified directors',   body: 'Check whether any director has been disqualified by the Insolvency Service.',   url: 'https://www.insolvencydirect.bis.gov.uk/IESdatabase/viewdirectorsummary-new.asp',                            label: 'Search register' },
    { id: 'google',    icon: '🔍',  title: 'Independent web search',   body: `Search for warnings, reviews and complaints about ${firm}.`,                    url: `https://www.google.com/search?q=${enc}+scam+OR+warning+OR+complaint+OR+fraud`,                               label: 'Run search' },
    { id: 'mse',       icon: '💬',  title: 'MoneySavingExpert forum',  body: `Community reports and discussions about ${firm}.`,                               url: `https://forums.moneysavingexpert.com/search?q=${enc}`,                                                       label: 'Search MSE' },
    { id: 'whois',     icon: '🌐',  title: 'Domain age',               body: 'A recently registered domain for a firm claiming years of experience is a warning sign.', url: `https://www.whois.com/whois/${enc.toLowerCase().replace(/\s+/g,'')}.com`,                          label: 'Check domain' },
    { id: 'fos',       icon: '⚖',  title: 'Financial Ombudsman',      body: 'Can you complain to the FOS about this firm or product?',                       url: 'https://www.financial-ombudsman.org.uk/consumers/complaints-can-help/check-eligible',                        label: 'Check eligibility' },
    { id: 'af',        icon: '🚩',  title: 'Action Fraud',             body: 'The UK national fraud reporting centre — check for reports and report suspected scams.', url: 'https://www.actionfraud.police.uk/reporting-fraud-and-cyber-crime',                               label: 'Check Action Fraud' },
  ];

  const container = document.getElementById('auto-checks');
  container.innerHTML = '';
  checks.forEach(c => {
    const div = document.createElement('div');
    div.className = 'check-card';
    div.id = 'card-' + c.id;
    div.innerHTML = `
      <div class="check-header">
        <span class="check-icon">${c.icon}</span>
        <span class="check-title">${escHtml(c.title)}</span>
        <span class="check-status" id="st-${c.id}">Not reviewed</span>
      </div>
      <div class="check-body">${escHtml(c.body)}</div>
      <a class="check-link" href="${c.url}" target="_blank" rel="noopener" onclick="markChecked('${c.id}')">
        ↗ ${escHtml(c.label)}
      </a>
      <div class="check-result-btns">
        <button class="q-btn" onclick="setCheckResult('${c.id}','clear')">Nothing concerning</button>
        <button class="q-btn" onclick="setCheckResult('${c.id}','mixed')">Mixed / unclear</button>
        <button class="q-btn" onclick="setCheckResult('${c.id}','warning')">Warning found</button>
      </div>`;
    container.appendChild(div);
  });
}

function markChecked(id) {
  setTimeout(() => {
    const st = document.getElementById('st-' + id);
    if (st && st.textContent === 'Not reviewed') {
      st.textContent = 'Opened';
      st.className = 'check-status done';
    }
  }, 700);
}

function setCheckResult(id, val) {
  state.checksDone[id] = val;
  const card = document.getElementById('card-' + id);
  const st   = document.getElementById('st-' + id);
  card.querySelectorAll('.check-result-btns .q-btn').forEach(b => {
    b.classList.remove('sel-green', 'sel-red', 'sel-amber');
  });
  const btns = card.querySelectorAll('.check-result-btns .q-btn');
  const idx = val === 'clear' ? 0 : val === 'mixed' ? 1 : 2;
  if (btns[idx]) btns[idx].classList.add(
    val === 'clear' ? 'sel-green' : val === 'mixed' ? 'sel-amber' : 'sel-red'
  );
  if (st) {
    st.textContent = val === 'clear' ? 'Clear' : val === 'mixed' ? 'Mixed' : 'Warning';
    st.className   = 'check-status ' + (val === 'clear' ? 'done' : val === 'warning' ? 'warn' : '');
  }
}

/* ─── Risk scoring ─── */
function riskScore() {
  let f = 0;
  const a = state.answers;
  const cd = state.checksDone;

  if (['cold','social'].includes(a.contact))               f++;
  if (['major','borrowed'].includes(a.amount))             f++;

  const cl = a.classif || [];
  if (cl.some(c => ['sophisticated','hnw','professional'].includes(c))) f++;
  if (a.criteria === 'no')                                 f += 2;
  if (a.criteria === 'yes-band')                           f++;   // FCA threshold band — over-certification risk
  // introducer commission
  if (a.introducer === 'yes-nodisclosure')                 f += 2;
  if (a.introducer === 'yes-unknown')                      f++;
  // borrowed credibility
  if (a['borrowed-credibility'] === 'yes-reassurance')     f += 2;
  if (a['borrowed-credibility'] === 'yes-minor')           f++;
  if (a['waiver-explained'] === 'no')                      f++;
  if (a['classif-time'] === 'rushed')                      f++;

  if (['soft','strong'].includes(a.urgency))               f++;
  if (['soft','yes'].includes(a['advice-blocked']))        f++;
  if (['partly','no'].includes(a.freedom))                 f++;
  if (a.secrecy === 'yes')                                 f += 2;
  if (a['early-returns'] === 'yes')                        f += 2;

  if (['cayman','thin'].includes(a.domicile))              f += 2;
  if (a.domicile === 'unknown')                            f++;
  if (['nominal','none'].includes(a['overseas-reg']))      f += 2;
  if (['overseas-thin','none'].includes(a.comp))           f += 2;
  if (['remote','unknown'].includes(a['legal-juris']))     f++;
  if (['yes-marketing','no','unknown'].includes(a['uk-entity'])) f++;

  if (a.asym === '4-5')                                   f += 2;
  if (a.asym === '2-3')                                   f++;
  if (['serious','severe'].includes(a['loss-impact']))     f++;
  if (['none','unread'].includes(a.exit))                  f++;
  if (a.insolvency === 'no')                               f++;

  Object.values(cd).forEach(v => {
    if (v === 'warning') f += 2;
    else if (v === 'mixed') f++;
  });

  f += state.analysisFindings.filter(x => x.type === 'risk').length;
  return f;
}

/* ─── Summary builder ─── */
function buildSummary() {
  const score = riskScore();
  const a = state.answers;

  // Verdict
  let vClass, vTitle, vBody;
  if (score <= 4) {
    vClass = 'safe';
    vTitle = 'Fewer obvious red flags at this stage';
    vBody  = 'Your responses suggest fewer of the most common warning signs. That does not confirm this investment is safe — continue your independent checks and seek regulated advice before committing any funds.';
  } else if (score <= 10) {
    vClass = 'caution';
    vTitle = 'Several concerns warrant closer scrutiny';
    vBody  = 'Multiple indicators suggest this investment deserves careful independent review before you decide. Do not allow time pressure to shortcut that process. Seek a paid, independent, regulated opinion.';
  } else {
    vClass = 'risk';
    vTitle = 'Significant concerns identified — please pause';
    vBody  = 'Your responses and document analysis flag multiple serious risk indicators. Do not invest further until each concern is resolved through independent, verifiable evidence — not reassurances from the seller. If you have already invested, contact Action Fraud and the FCA immediately.';
  }

  // Consequence cards
  const cons = [];
  const cl = a.classif || [];

  if (a.criteria === 'no' && cl.some(c => ['sophisticated','hnw','professional'].includes(c))) {
    cons.push({ icon: '🛡', title: 'Protection waiver without eligibility',
      body: 'You may be signing away FCA retail protections you are entitled to, without genuinely meeting the criteria. This removes your right to complain to the Financial Ombudsman and may eliminate FSCS cover entirely.', cls: 'risk' });
  }
  if (a.criteria === 'yes-band' && cl.some(c => ['sophisticated','hnw'].includes(c))) {
    cons.push({ icon: '⚠', title: 'FCA over-certification concern — threshold band',
      body: 'Your income or asset level places you in the band the FCA has specifically identified as high-risk for over-certification. You meet the current legal threshold, but the FCA has proposed raising it precisely because people in this range are routinely guided into self-certification by the firms selling investments. This is the mechanism identified in the Woodville Consultants case and others like it. Proceed with particular care.', cls: 'caution' });
  }
  if (a.introducer === 'yes-nodisclosure') {
    cons.push({ icon: '💸', title: 'Undisclosed introducer commission',
      body: 'You were introduced to this investment by a third party who has not disclosed whether they are being paid a commission. Undisclosed commissions are a significant conflict of interest — and a known feature of investment failures where introducers were paid substantial fees for every investor they brought in.', cls: 'risk' });
  }
  if (a['borrowed-credibility'] === 'yes-reassurance') {
    cons.push({ icon: '🏛', title: 'Borrowed credibility — professional names used as reassurance',
      body: 'The involvement of lawyers, accountants, insurers, or other professionals does not make an investment regulated or safe. Professional names are sometimes used deliberately to create a false impression of legitimacy. Ask specifically what each professional is responsible for — and whether any of them are regulated in relation to this investment itself.', cls: 'caution' });
  }
  if (a.secrecy === 'yes') {
    cons.push({ icon: '🔒', title: 'Confidentiality request',
      body: 'Being asked to keep an investment secret from advisers, family, or friends is one of the most reliable indicators of fraud. Legitimate investments do not require secrecy.', cls: 'risk' });
  }
  if (a['early-returns'] === 'yes') {
    cons.push({ icon: '💰', title: 'Early returns as a recruitment mechanism',
      body: 'Early payments may be funded by new investors rather than genuine profits. This is the mechanism of a Ponzi scheme — once recruitment slows, payments stop and losses mount.', cls: 'risk' });
  }
  if (['cayman','thin'].includes(a.domicile) || ['nominal','none'].includes(a['overseas-reg'])) {
    cons.push({ icon: '🌐', title: 'Offshore registration with thin regulatory cover',
      body: 'An offshore-domiciled investment in a low-oversight jurisdiction may offer no meaningful regulatory protection, no accessible compensation scheme, and no realistic route to legal redress — even if you are clearly in the right.', cls: 'risk' });
  }
  if (['remote','unknown'].includes(a['legal-juris'])) {
    cons.push({ icon: '⚖', title: 'Legal jurisdiction may be inaccessible',
      body: 'If disputes must be heard in a remote offshore jurisdiction, enforcing a judgment — even a favourable one — may be prohibitively expensive or practically impossible for a UK investor.', cls: 'caution' });
  }
  if (['major','borrowed'].includes(a.amount)) {
    cons.push({ icon: '⚠', title: 'Scale of potential loss',
      body: 'Investing a large or borrowed sum means a loss here would extend well beyond money. Consider the impact on housing security, retirement, and future financial independence before committing.', cls: 'caution' });
  }
  const warnChecks = Object.entries(state.checksDone).filter(([,v]) => v === 'warning').length;
  if (warnChecks > 0) {
    cons.push({ icon: '🚩', title: `Warning signals in ${warnChecks} public check${warnChecks > 1 ? 's' : ''}`,
      body: 'One or more public data checks returned warning signals. These must be investigated fully — with independent professional help — before any decision is made.', cls: 'risk' });
  }
  const docRisks = state.analysisFindings.filter(x => x.type === 'risk');
  if (docRisks.length > 0) {
    cons.push({ icon: '📄', title: `${docRisks.length} risk indicator${docRisks.length > 1 ? 's' : ''} found in your document`,
      body: docRisks.map(f => f.text).join(' · '), cls: 'risk' });
  }

  // Actions
  const acts = [];
  if (!state.checksDone['fca-reg'] || state.checksDone['fca-reg'] !== 'clear')
    acts.push({ icon: '🏛', text: 'Check the FCA Register: register.fca.org.uk' });
  if (state.checksDone['fca-warn'] === 'warning' || !state.checksDone['fca-warn'])
    acts.push({ icon: '🛡', text: 'Check the FCA Warning List: fca.org.uk/scamsmart' });
  if (!state.checksDone['ch'] || state.checksDone['ch'] !== 'clear')
    acts.push({ icon: '🏢', text: 'Check Companies House: company-information.service.gov.uk' });
  acts.push({ icon: '👤', text: 'Seek an independent regulated financial adviser — paid, not referred by the investment' });
  if (score > 10)
    acts.push({ icon: '🚩', text: 'If already invested: report to Action Fraud (actionfraud.police.uk) and the FCA ScamSmart team' });
  acts.push({ icon: '💙', text: 'If you have experienced financial harm, Get SAFE provides free, trauma-informed support' });

  // Render
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const firmName = a.firm || 'Investment not named';

  const barColour = score <= 4 ? '#1a7a4a' : score <= 10 ? '#b45309' : '#b91c1c';

  const consHtml = cons.map(c => `
    <div class="consequence-card">
      <div class="consequence-header">
        <span class="consequence-icon">${c.icon}</span>
        <span class="consequence-title">${escHtml(c.title)}</span>
      </div>
      <div class="consequence-body ${c.cls}">${escHtml(c.body)}</div>
    </div>`).join('');

  const actsHtml = acts.map(a => `
    <li>
      <span class="action-icon">${a.icon}</span>
      <span>${escHtml(a.text)}</span>
    </li>`).join('');

  document.getElementById('summary').innerHTML = `
    <div class="print-header" style="display:none">
      <img src="assets/icon.png" alt="Investigator logo">
      <div class="print-header-text">
        <div class="print-title">Investigator™ — Investigation Summary</div>
        <div class="print-ref">${escHtml(firmName)} &nbsp;·&nbsp; Ref: ${state.refNumber} &nbsp;·&nbsp; ${dateStr} at ${timeStr}</div>
      </div>
    </div>

    <button class="export-btn no-print" onclick="printSummary()">
      🖨 Print or save as PDF
    </button>

    <div class="score-bar-wrap">
      <div class="score-bar-meta">
        <span>Risk signals identified</span>
        <span>${score}</span>
      </div>
      <div class="score-bar-track">
        <div class="score-bar-fill" style="width:${Math.min(100, score * 4)}%;background:${barColour}"></div>
      </div>
    </div>

    <div class="verdict-box ${vClass}">
      <div class="verdict-title">${escHtml(vTitle)}</div>
      <div class="verdict-body">${escHtml(vBody)}</div>
    </div>

    ${cons.length ? `
      <div class="sub-label">Consequences to understand before deciding</div>
      ${consHtml}
    ` : ''}

    ${acts.length ? `
      <div class="divider"></div>
      <div class="sub-label">What to do next</div>
      <ul class="action-list">${actsHtml}</ul>
    ` : ''}

    <div class="get-safe-footer">
      <img src="assets/icon.png" alt="Get SAFE">
      <div class="get-safe-footer-text">
        <div class="get-safe-footer-title">Get SAFE — Support After Financial Exploitation</div>
        <div class="get-safe-footer-body">
          If you or someone you know has been affected by financial exploitation or investment fraud,
          Get SAFE provides free, trauma-informed stabilisation and support.
          Visit <strong>getsafe.org.uk</strong> or contact the Academy of Life Planning.
        </div>
      </div>
    </div>

    <div class="summary-foot">
      Investigator™ is a public-interest tool from the Academy of Life Planning.
      It supports independent thinking — it does not replace regulated financial advice.
      Reference: ${state.refNumber} &nbsp;·&nbsp; ${dateStr} at ${timeStr}.
    </div>`;
}

/* ─── Print ─── */
function printSummary() {
  // Show print header, hide screen header for print
  document.querySelector('.print-header').style.display = 'flex';
  document.querySelector('.app-header').classList.add('no-print');
  document.querySelector('.progress-wrap').classList.add('no-print');
  window.print();
  // Restore after print dialog closes
  setTimeout(() => {
    document.querySelector('.print-header').style.display = 'none';
    document.querySelector('.app-header').classList.remove('no-print');
    document.querySelector('.progress-wrap').classList.remove('no-print');
  }, 1000);
}

/* ─── Utility ─── */
function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(',')[1]);
    r.onerror = () => rej(new Error('File read failed'));
    r.readAsDataURL(file);
  });
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}
