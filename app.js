'use strict';

// All heading behavior below is an illustration, never a hardware connection.
const $ = (selector) => document.querySelector(selector);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const menu = $('.menu-toggle');
const mobileNav = $('#mobile-nav');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileNav.hidden = !open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
}));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !mobileNav.hidden) { menu.click(); menu.focus(); }
});

if ('IntersectionObserver' in window && !reducedMotion) {
  document.documentElement.classList.add('js-reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

const namespace = 'http://www.w3.org/2000/svg';
for (let i = 0; i < 72; i++) {
  const tick = document.createElementNS(namespace, 'line');
  tick.setAttribute('x1', '0');
  tick.setAttribute('y1', '-208');
  tick.setAttribute('x2', '0');
  tick.setAttribute('y2', i % 6 === 0 ? '-194' : '-201');
  tick.setAttribute('stroke', i % 6 === 0 ? '#dce6da80' : '#dce6da30');
  tick.setAttribute('stroke-width', '1');
  tick.setAttribute('transform', `rotate(${i * 5})`);
  $('#compass-ticks').append(tick);
}

const slider = $('#heading-slider');
const boat = $('#boat-group');
const targetVector = $('#target-vector');
const assistanceToggle = $('#assistance-toggle');
const formatHeading = value => String(((Math.round(value) % 360) + 360) % 360).padStart(3, '0');
let target = 45;
let heading = 45;
let speed = 0;
let assistance = true;
let lastTime = 0;
let labVisible = false;
let gustTimer;
let lastLabel = '';
let tuning = 'balanced';
let telemetryElapsed = 0;
const errorHistory = Array(120).fill(0);
let lastCurrentText = '';
let lastTargetText = '';
function signedHeadingError() {
  return (((target - heading) % 360) + 540) % 360 - 180;
}
function clearTelemetry() {
  errorHistory.fill(0);
  telemetryElapsed = 0;
  $('#response-trace').setAttribute('d', 'M20 75H740');
}
function recordTelemetry(dt) {
  telemetryElapsed += dt;
  if (telemetryElapsed < 1 / 6) return;
  telemetryElapsed %= 1 / 6;
  const error = signedHeadingError();
  errorHistory.push(error);
  errorHistory.shift();
  const scale = Math.max(30, Math.ceil(Math.max(...errorHistory.map(Math.abs)) / 10) * 10);
  const path = errorHistory.map((sample, i) => {
    const x = 20 + i * 720 / (errorHistory.length - 1);
    const y = 75 - sample / scale * 48;
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  $('#response-trace').setAttribute('d', path);
  $('#chart-scale').textContent = `SCALE ±${scale}°`;
  $('#sim-error').textContent = `${Math.abs(error).toFixed(1)}°`;
}
function render() {
  boat.setAttribute('transform', `rotate(${heading})`);
  targetVector.setAttribute('transform', `rotate(${target})`);
  const targetText = formatHeading(target);
  const currentText = formatHeading(heading);
  if (targetText !== lastTargetText) { $('#target-heading').textContent = targetText; lastTargetText = targetText; }
  if (currentText !== lastCurrentText) { $('#current-heading').innerHTML = `${currentText}<span>°</span>`; lastCurrentText = currentText; }
  const error = Math.abs(signedHeadingError());
  const label = !assistance ? 'Manual / assistance off' : error < 1.2 ? 'Holding heading' : 'Returning to course';
  if (label !== lastLabel) { $('#response-state').textContent = label; lastLabel = label; }
}
function setTarget(value) {
  target = (Number(value) + 360) % 360;
  slider.value = target;
  slider.setAttribute('aria-valuetext', `${formatHeading(target)} degrees`);
  render();
}
slider.addEventListener('input', e => setTarget(e.target.value));
$('#heading-left').addEventListener('click', () => setTarget(target - 10));
$('#heading-right').addEventListener('click', () => setTarget(target + 10));
function updateAssistance() {
  assistanceToggle.setAttribute('aria-checked', String(assistance));
  $('#assistance-description').textContent = assistance ? 'Working toward your heading' : 'The boat is free to drift';
  $('#lab-explainer').textContent = assistance
    ? 'Watch the boat ease back toward the dotted course line. Try switching assistance off to compare.'
    : 'Add a disturbance: the boat stays off course. Turn assistance back on to see it return toward your selected heading.';
  render();
}
assistanceToggle.addEventListener('click', () => { assistance = !assistance; updateAssistance(); });
$('#add-gust').addEventListener('click', () => {
  heading += 32;
  speed = 3;
  render();
  $('#gust-flash').classList.add('active');
  clearTimeout(gustTimer);
  gustTimer = setTimeout(() => $('#gust-flash').classList.remove('active'), 1400);
});
$('#reset-sim').addEventListener('click', () => {
  heading = 45; speed = 0; assistance = true;
  setTarget(45); updateAssistance();
  setTuning('balanced', false);
  clearTelemetry();
  $('#sim-error').textContent = '0.0°';
  clearTimeout(gustTimer);
  $('#gust-flash').classList.remove('active');
});
function animate(time) {
  const dt = Math.min((time - lastTime) / 1000 || 0, 0.05);
  lastTime = time;
  if (labVisible && !document.hidden) {
    if (assistance) {
      const error = signedHeadingError();
      const response = tuning === 'reactive' ? 6 : 1.8;
      const damping = tuning === 'reactive' ? 0.55 : 2.7;
      speed += (error * response - speed * damping) * dt;
      speed = Math.max(-48, Math.min(48, speed));
    } else speed *= Math.exp(-2.5 * dt);
    heading += speed * dt;
    render();
    recordTelemetry(dt);
  }
  requestAnimationFrame(animate);
}
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => { labVisible = entries[0].isIntersecting; }, { rootMargin: '100px' }).observe($('#experience'));
} else labVisible = true;
render();
requestAnimationFrame(animate);

function setTuning(mode, addDisturbance = true) {
  tuning = mode;
  document.querySelectorAll('.tuning-option').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.tuning === mode));
  });
  $('#tuning-explanation').textContent = mode === 'reactive'
    ? 'This setting pushes harder and damps less. Notice the repeated overshoot after a disturbance. It illustrates a tuning problem, not a result from the boat.'
    : 'Balanced tuning eases the model toward the target. Compare the same disturbance with a more reactive setting.';
  if (addDisturbance) {
    assistance = true;
    heading = target + 32;
    speed = 0;
    updateAssistance();
    clearTelemetry();
    recordTelemetry(1 / 6);
  }
}
document.querySelectorAll('.tuning-option').forEach(button => {
  button.addEventListener('click', () => setTuning(button.dataset.tuning));
});
$('#try-north').addEventListener('click', () => {
  setTuning('balanced', false);
  assistance = true; heading = 350; speed = 0;
  setTarget(10); updateAssistance(); clearTelemetry(); recordTelemetry(1 / 6);
  $('#tuning-explanation').textContent = 'Across north: 350° and 010° are only 20° apart. Watch the model take the short turn through 000°, rather than turning 340° the other way.';
});

const parts = {
  sense: {
    title: 'A sense of heading.', subtitle: 'Start by understanding direction.', glyph: '⊕',
    description: 'A 9-axis inertial measurement unit (IMU) provides data used to estimate heading. GPS supplies position information. The ESP32 brings these inputs into the control system.',
    image: 'assets/electronics.jpg', alt: 'Actual ESP32 controller, IMU, and GPS modules connected in the Auto Tiller prototype.',
    caption: 'ACTUAL PROTOTYPE / SENSOR + CONTROLLER', tags: ['9-axis IMU', 'GPS', 'ESP32']
  },
  decide: {
    title: 'Small errors. Measured corrections.', subtitle: 'Compare. Calculate. Adjust.', glyph: '≈',
    description: 'The ESP32 compares estimated heading with the selected heading. A PID control loop calculates a steering correction. Careful tuning aims to avoid constant left-right adjustments around the target.',
    image: 'assets/electronics.jpg', alt: 'Controller and sensor wiring in the Auto Tiller development prototype.',
    caption: 'ACTUAL PROTOTYPE / CLOSED-LOOP CONTROL', tags: ['Heading error', 'PID control', 'Bluetooth']
  },
  move: {
    title: 'Code becomes movement.', subtitle: 'A physical push in the right direction.', glyph: '↔',
    description: 'The motor driver sends power to a 12 V linear actuator. Its extension and retraction are intended to move the tiller. Current demonstrations are on the bench; real steering performance still needs on-water testing.',
    image: 'assets/motor-driver.jpg', alt: 'Actual motor driver board wired to the controller and actuator power system.',
    caption: 'ACTUAL PROTOTYPE / MOTOR DRIVER', tags: ['12 V power', 'Motor driver', 'Linear actuator']
  }
};
const tabs = [...document.querySelectorAll('.hardware-tab')];
function selectPart(tab) {
  const part = parts[tab.dataset.part];
  tabs.forEach(other => {
    other.setAttribute('aria-selected', String(other === tab));
    other.tabIndex = other === tab ? 0 : -1;
  });
  $('#hardware-panel').setAttribute('aria-labelledby', tab.id);
  $('#hardware-name').textContent = part.title;
  $('#hardware-subtitle').textContent = part.subtitle;
  $('#hardware-glyph').textContent = part.glyph;
  $('#hardware-description').textContent = part.description;
  $('#hardware-image').src = part.image;
  $('#hardware-image').alt = part.alt;
  $('#hardware-photo-label').textContent = part.caption;
  $('#hardware-tags').replaceChildren(...part.tags.map(tag => {
    const el = document.createElement('span'); el.textContent = tag; return el;
  }));
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectPart(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectPart(tabs[next]); tabs[next].focus(); }
  });
});

const video = $('#project-video');
const playFilm = $('#play-film');
playFilm.addEventListener('click', async () => {
  playFilm.hidden = true;
  try { await video.play(); } catch { playFilm.hidden = false; }
});
video.addEventListener('play', () => { playFilm.hidden = true; });
video.addEventListener('ended', () => { playFilm.hidden = false; });
