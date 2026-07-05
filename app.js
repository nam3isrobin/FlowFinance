const MODES = {
  sip: {
    title: 'Build your SIP', kicker: 'Investment planner', result: 'Projected wealth',
    amountLabel: 'Monthly investment', amountHint: 'per month', rateLabel: 'Expected annual return', rateHint: 'estimated',
    defaults: [25000, 12, 15], limits: [[500, 500000, 500], [1, 30, .1], [1, 40, 1]],
    presets: { starter: [5000, 10, 10], steady: [25000, 12, 15], ambitious: [75000, 14, 20] }
  },
  emi: {
    title: 'Estimate your EMI', kicker: 'Monthly payment planner', result: 'Monthly EMI',
    amountLabel: 'Loan amount', amountHint: 'principal', rateLabel: 'Annual interest rate', rateHint: 'lending rate',
    defaults: [2500000, 8.5, 20], limits: [[100000, 20000000, 50000], [1, 24, .1], [1, 30, 1]],
    presets: { starter: [500000, 9, 5], steady: [2500000, 8.5, 20], ambitious: [7500000, 8, 25] }
  },
  loan: {
    title: 'Understand your loan', kicker: 'Total cost planner', result: 'Total repayment',
    amountLabel: 'Borrowed amount', amountHint: 'principal', rateLabel: 'Annual interest rate', rateHint: 'lending rate',
    defaults: [1000000, 10, 7], limits: [[50000, 20000000, 50000], [1, 24, .1], [1, 30, 1]],
    presets: { starter: [300000, 11, 3], steady: [1000000, 10, 7], ambitious: [5000000, 8.5, 15] }
  }
};

let mode = 'sip';
let lastSeries = [];
let chartPoints = [];
const $ = (id) => document.getElementById(id);
const amountInput = $('amount-input');
const rateInput = $('rate-input');
const yearsInput = $('years-input');
const inputs = [amountInput, rateInput, yearsInput];
const ranges = [$('amount-range'), $('rate-range'), $('years-range')];

function inr(value, precise = false) {
  if (!Number.isFinite(value)) return '₹0';
  if (!precise && value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (!precise && value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function values() { return inputs.map((el) => Math.max(Number(el.min), Math.min(Number(el.max), Number(el.value) || 0))); }

function calculate() {
  const [amount, annualRate, years] = values();
  const months = years * 12;
  const monthlyRate = annualRate / 1200;
  const series = [];
  let primary, principal, secondary, monthly;

  if (mode === 'sip') {
    primary = monthlyRate === 0 ? amount * months : amount * (((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate);
    principal = amount * months;
    secondary = primary - principal;
    for (let y = 0; y <= years; y++) {
      const n = y * 12;
      const total = n === 0 ? 0 : amount * (((1 + monthlyRate) ** n - 1) / monthlyRate) * (1 + monthlyRate);
      series.push({ year: y, principal: amount * n, total });
    }
  } else {
    monthly = monthlyRate === 0 ? amount / months : amount * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1);
    const totalPaid = monthly * months;
    primary = mode === 'emi' ? monthly : totalPaid;
    principal = amount;
    secondary = totalPaid - amount;
    let balance = amount;
    for (let y = 0; y <= years; y++) {
      const paidMonths = y * 12;
      let paidPrincipal = 0;
      if (paidMonths > 0) {
        const remaining = monthlyRate === 0 ? amount - monthly * paidMonths : amount * (1 + monthlyRate) ** paidMonths - monthly * (((1 + monthlyRate) ** paidMonths - 1) / monthlyRate);
        paidPrincipal = amount - Math.max(0, remaining);
        balance = Math.max(0, remaining);
      }
      series.push({ year: y, principal: paidPrincipal, total: monthly * paidMonths, balance });
    }
  }
  return { amount, annualRate, years, primary, principal, secondary, monthly, series };
}

function updateRange(range) {
  const pct = ((Number(range.value) - Number(range.min)) / (Number(range.max) - Number(range.min))) * 100;
  range.style.setProperty('--value', `${pct}%`);
}

function render() {
  const result = calculate();
  lastSeries = result.series;
  $('primary-result').textContent = inr(result.primary);
  $('result-caption').textContent = mode === 'emi' ? `for ${result.years} years` : mode === 'loan' ? `${inr(result.monthly)} per month` : `after ${result.years} years`;
  $('principal-label').textContent = mode === 'sip' ? 'Invested' : 'Principal';
  $('returns-label').textContent = mode === 'sip' ? 'Estimated returns' : 'Total interest';
  $('principal-value').textContent = inr(result.principal);
  $('returns-value').textContent = inr(result.secondary);
  const growth = result.principal ? (result.secondary / result.principal) * 100 : 0;
  $('growth-badge').innerHTML = `<i data-lucide="${mode === 'sip' ? 'arrow-up-right' : 'percent'}"></i><span>${mode === 'sip' ? '+' : ''}${growth.toFixed(0)}%</span>`;

  if (mode === 'sip') {
    $('insight-title').textContent = 'Time is your strongest multiplier.';
    $('insight-copy').textContent = `Your estimated gains are ${inr(result.secondary)}—${growth.toFixed(0)}% of everything you put in.`;
  } else {
    $('insight-title').textContent = mode === 'emi' ? 'Balance comfort with tenure.' : 'See the full cost, not just the rate.';
    $('insight-copy').textContent = `Over ${result.years} years, interest adds ${inr(result.secondary)} to the amount borrowed.`;
  }
  ranges.forEach(updateRange);
  lucide.createIcons();
  drawChart();
}

function configureMode(nextMode) {
  mode = nextMode;
  const config = MODES[mode];
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.mode === mode));
  $('mode-title').textContent = config.title;
  $('mode-kicker').textContent = config.kicker;
  $('result-kicker').textContent = config.result;
  $('amount-label').textContent = config.amountLabel;
  $('amount-hint').textContent = config.amountHint;
  document.querySelector('label[for="rate-input"]').textContent = config.rateLabel;
  $('rate-hint').textContent = config.rateHint;
  inputs.forEach((input, index) => {
    const [min, max, step] = config.limits[index];
    Object.assign(input, { min, max, step, value: config.defaults[index] });
    Object.assign(ranges[index], { min, max, step, value: config.defaults[index] });
  });
  const amountMax = config.limits[0][1];
  document.querySelector('[data-field="amount"] .range-limits').innerHTML = `<span>${inr(config.limits[0][0])}</span><span>${inr(amountMax)}</span>`;
  document.querySelector('.field:nth-child(2) .range-limits').innerHTML = `<span>${config.limits[1][0]}%</span><span>${config.limits[1][1]}%</span>`;
  document.querySelector('.field:nth-child(3) .range-limits').innerHTML = `<span>1 year</span><span>${config.limits[2][1]} years</span>`;
  render();
}

inputs.forEach((input, index) => input.addEventListener('input', () => {
  ranges[index].value = input.value;
  render();
}));
ranges.forEach((range, index) => range.addEventListener('input', () => {
  inputs[index].value = range.value;
  render();
}));
document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => configureMode(tab.dataset.mode)));
$('reset-button').addEventListener('click', () => configureMode(mode));
$('quick-presets').addEventListener('click', (event) => {
  const preset = event.target.dataset.preset;
  if (!preset) return;
  MODES[mode].presets[preset].forEach((value, index) => { inputs[index].value = value; ranges[index].value = value; });
  render();
});

function summaryText() {
  const r = calculate();
  return `${mode.toUpperCase()} calculation: ${MODES[mode].result} ${inr(r.primary, true)}; principal ${inr(r.principal, true)}; ${mode === 'sip' ? 'estimated returns' : 'total interest'} ${inr(r.secondary, true)} over ${r.years} years at ${r.annualRate}% p.a.`;
}
$('copy-button').addEventListener('click', async () => {
  await navigator.clipboard.writeText(summaryText());
  const label = $('copy-button').querySelector('span');
  label.textContent = 'Copied';
  setTimeout(() => { label.textContent = 'Copy summary'; }, 1400);
});
$('download-button').addEventListener('click', () => {
  const rows = [['Year', mode === 'sip' ? 'Contributed' : 'Principal paid', mode === 'sip' ? 'Projected value' : 'Total paid']];
  lastSeries.forEach((point) => rows.push([point.year, Math.round(point.principal), Math.round(point.total)]));
  const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob); link.download = `${mode}-projection.csv`; link.click();
  URL.revokeObjectURL(link.href);
});

const chart = $('projection-chart');
const chartCtx = chart.getContext('2d');
function drawChart() {
  const rect = chart.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  chart.width = Math.max(1, rect.width * dpr); chart.height = Math.max(1, rect.height * dpr);
  chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = rect.width, h = rect.height, pad = { l: 8, r: 8, t: 14, b: 22 };
  const max = Math.max(...lastSeries.map((p) => p.total), 1);
  const x = (i) => pad.l + (i / Math.max(lastSeries.length - 1, 1)) * (w - pad.l - pad.r);
  const y = (value) => h - pad.b - (value / max) * (h - pad.t - pad.b);
  chartCtx.clearRect(0, 0, w, h);
  chartCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border');
  chartCtx.lineWidth = 1;
  for (let i = 0; i < 4; i++) { const gy = pad.t + i * (h - pad.t - pad.b) / 3; chartCtx.beginPath(); chartCtx.moveTo(pad.l, gy); chartCtx.lineTo(w - pad.r, gy); chartCtx.stroke(); }
  const gradient = chartCtx.createLinearGradient(0, pad.t, 0, h - pad.b);
  gradient.addColorStop(0, 'rgba(124,246,200,.34)'); gradient.addColorStop(1, 'rgba(124,246,200,0)');
  chartCtx.beginPath(); lastSeries.forEach((p, i) => i ? chartCtx.lineTo(x(i), y(p.total)) : chartCtx.moveTo(x(i), y(p.total)));
  chartCtx.lineTo(x(lastSeries.length - 1), h - pad.b); chartCtx.lineTo(pad.l, h - pad.b); chartCtx.closePath(); chartCtx.fillStyle = gradient; chartCtx.fill();
  chartCtx.beginPath(); lastSeries.forEach((p, i) => i ? chartCtx.lineTo(x(i), y(p.total)) : chartCtx.moveTo(x(i), y(p.total)));
  chartCtx.strokeStyle = '#7cf6c8'; chartCtx.lineWidth = 2.5; chartCtx.lineJoin = 'round'; chartCtx.stroke();
  chartCtx.beginPath(); lastSeries.forEach((p, i) => i ? chartCtx.lineTo(x(i), y(p.principal)) : chartCtx.moveTo(x(i), y(p.principal)));
  chartCtx.strokeStyle = '#63dbe6'; chartCtx.lineWidth = 1.5; chartCtx.setLineDash([5, 5]); chartCtx.stroke(); chartCtx.setLineDash([]);
  chartCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted'); chartCtx.font = '10px DM Sans';
  chartCtx.fillText('Now', pad.l, h - 5); chartCtx.textAlign = 'right'; chartCtx.fillText(`${lastSeries.length - 1}y`, w - pad.r, h - 5); chartCtx.textAlign = 'left';
  chartPoints = lastSeries.map((p, i) => ({ x: x(i), y: y(p.total), point: p }));
}
chart.addEventListener('pointermove', (event) => {
  if (!chartPoints.length) return;
  const rect = chart.getBoundingClientRect(); const mx = event.clientX - rect.left;
  const nearest = chartPoints.reduce((a, b) => Math.abs(b.x - mx) < Math.abs(a.x - mx) ? b : a);
  const tooltip = $('chart-tooltip'); tooltip.hidden = false; tooltip.style.left = `${nearest.x}px`; tooltip.style.top = `${nearest.y}px`;
  tooltip.textContent = `Year ${nearest.point.year}: ${inr(nearest.point.total)}`;
});
chart.addEventListener('pointerleave', () => { $('chart-tooltip').hidden = true; });
window.addEventListener('resize', drawChart);

// Scroll event listener for fixed glassmorphic header
window.addEventListener('scroll', () => {
  const header = document.querySelector('.topbar');
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 15);
  }
});

function initScene() {
  if (!window.THREE) return;
  const canvas = $('liquid-scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7)); renderer.setSize(innerWidth, innerHeight); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x061318); scene.fog = new THREE.FogExp2(0x061318, .055);
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 100); camera.position.set(0, 0, 10);
  const geometry = new THREE.IcosahedronGeometry(2.25, 5); const original = geometry.attributes.position.array.slice();
  const material = new THREE.MeshPhysicalMaterial({ color: 0x4bd6bd, roughness: .12, metalness: .05, transmission: .22, thickness: 1.8, transparent: true, opacity: .55, clearcoat: 1, clearcoatRoughness: .1, emissive: 0x062c29, emissiveIntensity: .7 });
  const blob = new THREE.Mesh(geometry, material); blob.position.set(4.7, .2, -1.5); scene.add(blob);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.35, .025, 12, 160), new THREE.MeshBasicMaterial({ color: 0x7cf6c8, transparent: true, opacity: .2 })); ring.position.set(-4.6, -2.4, -3); ring.rotation.set(1.1, .3, .2); scene.add(ring);
  const particlesGeometry = new THREE.BufferGeometry(); const positions = new Float32Array(180 * 3);
  for (let i = 0; i < positions.length; i += 3) { positions[i] = (Math.random() - .5) * 22; positions[i + 1] = (Math.random() - .5) * 14; positions[i + 2] = -Math.random() * 9; }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({ color: 0x9cfde0, size: .025, transparent: true, opacity: .42 })); scene.add(particles);
  scene.add(new THREE.HemisphereLight(0xbaffed, 0x021013, 2.4)); const point = new THREE.PointLight(0xff8d79, 35, 14); point.position.set(-4, 3, 4); scene.add(point);
  const paused = matchMedia('(prefers-reduced-motion: reduce)').matches; let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    if (!paused) time += .008;
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const ox = original[i], oy = original[i + 1], oz = original[i + 2];
      const wave = 1 + .055 * Math.sin(oy * 2.1 + time * 2) + .035 * Math.sin(ox * 3.2 - time * 1.4);
      pos[i] = ox * wave; pos[i + 1] = oy * wave; pos[i + 2] = oz * wave;
    }
    geometry.attributes.position.needsUpdate = true; geometry.computeVertexNormals();
    blob.rotation.y = time * .2; blob.rotation.x = Math.sin(time * .3) * .15; ring.rotation.z = time * .08; particles.rotation.y = time * .015;
    renderer.render(scene, camera);
  }
  animate();
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
}

lucide.createIcons();
configureMode('sip');
initScene();
