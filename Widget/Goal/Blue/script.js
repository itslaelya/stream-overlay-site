/* ════════════════════════════════
   CONFIGURATION
════════════════════════════════ */
const CONFIG = {
  label: "Follow Goal",
  goal: 500,
  current: 0,
  currency: "",
  milestones: [25, 50, 75, 100],
  recentName: "—"
};

const state = { ...CONFIG };

const $widget = document.getElementById('widget');
const $fill = document.getElementById('fill');
const $pct = document.getElementById('pct');
const $current = document.getElementById('currentAmt');
const $goal = document.getElementById('goalAmt');
const $label = document.getElementById('goalLabel');
const $recent = document.getElementById('recentName');
const $miles = document.getElementById('milestones');

/* ════════════════════════════════
   FORMAT
════════════════════════════════ */
function fmt(n) {
  return n.toLocaleString();
}

/* ════════════════════════════════
   BUILD MILESTONES
════════════════════════════════ */
function buildMilestones() {

  $miles.innerHTML = '';

  state.milestones.forEach(m => {

    const el = document.createElement('div');

    el.className = 'milestone';

    el.dataset.pct = m;

    el.innerHTML = `
      <div class="milestone-dot"></div>
      <div class="milestone-val">${m}%</div>
    `;

    $miles.appendChild(el);
  });
}

/* ════════════════════════════════
   RENDER
════════════════════════════════ */
function render(animate = true) {

  const raw = Math.min(state.current / state.goal, 1);

  const pct = Math.round(raw * 100);

  $label.textContent = state.label;

  $current.textContent = fmt(state.current);

  $goal.textContent = fmt(state.goal);

  $recent.textContent = state.recentName;

  // progress bar
  if (animate) {

    setTimeout(() => {
      $fill.style.width = pct + '%';
    }, 80);

  } else {

    $fill.style.width = pct + '%';

  }

  $pct.textContent = pct + '%';

  // milestones
  document.querySelectorAll('.milestone').forEach(el => {

    el.classList.toggle(
      'reached',
      pct >= Number(el.dataset.pct)
    );

  });

  // complete state
  if (raw >= 1) {

    $pct.classList.add('complete');

    setTimeout(() => {
      $widget.classList.add('complete');
    }, 800);

  } else {

    $pct.classList.remove('complete');

    $widget.classList.remove('complete');

  }
}

/* ════════════════════════════════
   PUBLIC API
════════════════════════════════ */
window.SE_API = {

  // Add followers
  addFollow(name = "Anonymous") {

    state.current = Math.min(
      state.current + 1,
      state.goal
    );

    state.recentName = name;

    // pulse animation
    $widget.classList.remove('pulse');

    void $widget.offsetWidth;

    $widget.classList.add('pulse');

    render();
  },

  // reset
  reset(newGoal = state.goal) {

    state.current = 0;

    state.goal = newGoal;

    state.recentName = "—";

    render(false);
  },

  // set exact amount
  setAmount(amount, name) {

    state.current = Math.min(
      amount,
      state.goal
    );

    if (name)
      state.recentName = name;

    render();
  }
};

/* ════════════════════════════════
   STREAM ELEMENTS LOAD
════════════════════════════════ */
window.addEventListener('onWidgetLoad', function(obj) {

  const fields = obj.detail.fieldData;

  if (fields.goalAmount)
    state.goal = Number(fields.goalAmount);

  if (fields.currentAmount)
    state.current = Number(fields.currentAmount);

  if (fields.goalLabel)
    state.label = fields.goalLabel;

  buildMilestones();

  render(false);
});

/* ════════════════════════════════
   STREAM ELEMENTS EVENTS
════════════════════════════════ */
window.addEventListener('onEventReceived', function(obj) {

  const data = obj.detail.event;

  console.log(data);

  if (!data) return;

  // FOLLOW ONLY
  if (data.type === 'follow') {

    window.SE_API.addFollow(data.name);

  }

});

/* ════════════════════════════════
   INIT
════════════════════════════════ */
buildMilestones();

render(false);