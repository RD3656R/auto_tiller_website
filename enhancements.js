'use strict';

const progressBar = document.querySelector('#reading-progress');
let progressQueued = false;
function updateReadingProgress() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  const fraction = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
  progressBar.style.transform = `scaleX(${fraction})`;
  progressQueued = false;
}
function queueReadingProgress() {
  if (!progressQueued) { progressQueued = true; requestAnimationFrame(updateReadingProgress); }
}
window.addEventListener('scroll', queueReadingProgress, { passive: true });
window.addEventListener('resize', queueReadingProgress);
document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', queueReadingProgress));
updateReadingProgress();

const signalSteps = [...document.querySelectorAll('.signal-step')];
const signalPages = [
  {
    label: 'SELECTED HEADING', metric: '045', unit: '°',
    note: 'An example course chosen in the app.',
    title: 'It starts with your decision.',
    description: 'The sailor selects a heading in the phone app. A Bluetooth connection carries that request to the ESP32. The phone is the interface; the controller handles the steering loop.',
    next: 'Next: compare the heading'
  },
  {
    label: 'ILLUSTRATIVE HEADING ERROR', metric: '−20', unit: '°',
    note: 'Target 045° − measured heading 065°.',
    title: 'Where are we, relative to the course?',
    description: 'The controller compares estimated heading with the requested heading. In this example, the boat is 20° clockwise from the target. The signed error tells the control logic which way to correct.',
    next: 'Next: turn the command into motion'
  },
  {
    label: 'CONTROL LOOP', metric: '↺', unit: '',
    note: 'Measure again. Update the correction.',
    title: 'Correct, then check again.',
    description: 'The PID loop calculates a correction. The motor driver operates the actuator, which is intended to push or pull the tiller. Actual extension direction depends on the installation. New sensor readings close the loop.',
    next: 'Back to the sailor’s choice'
  }
];
let signalIndex = 0;
function selectSignal(index) {
  signalIndex = index;
  const entry = signalPages[index];
  signalSteps.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
  });
  document.querySelector('#signal-panel').setAttribute('aria-labelledby', signalSteps[index].id);
  document.querySelector('#signal-metric-label').textContent = entry.label;
  const unit = document.createElement('span');
  unit.textContent = entry.unit;
  document.querySelector('#signal-metric').replaceChildren(document.createTextNode(entry.metric), unit);
  document.querySelector('#signal-metric-note').textContent = entry.note;
  document.querySelector('#signal-heading').textContent = entry.title;
  document.querySelector('#signal-description').textContent = entry.description;
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = index === 2 ? '↺' : '→';
  document.querySelector('#signal-next').replaceChildren(document.createTextNode(entry.next + ' '), arrow);
}
signalSteps.forEach((step, index) => {
  step.addEventListener('click', () => selectSignal(index));
  step.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % 3;
    if (event.key === 'ArrowLeft') next = (index + 2) % 3;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = 2;
    if (next !== undefined) { event.preventDefault(); selectSignal(next); signalSteps[next].focus(); }
  });
});
document.querySelector('#signal-next').addEventListener('click', () => selectSignal((signalIndex + 1) % 3));

const copyEmail = document.querySelector('#copy-email');
const copyFeedback = document.querySelector('#copy-feedback');
copyEmail.addEventListener('click', async () => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard is unavailable');
    await navigator.clipboard.writeText('ryandeng24@gmail.com');
    copyFeedback.textContent = 'Email address copied. Thanks for getting in touch.';
    copyFeedback.classList.add('success');
    copyEmail.firstChild.textContent = 'Copied ';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('#contact-email'));
    selection.removeAllRanges(); selection.addRange(range);
    copyFeedback.textContent = 'Address selected — copy it with Command+C or Control+C.';
    copyFeedback.classList.remove('success');
  }
});
