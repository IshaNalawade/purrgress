// Purrgress, gym but cuter.
// Vanilla JS, no build step. State lives in localStorage on your phone.

const PLAN = [
  {
    id: "legs",
    name: "Legs",
    emoji: "🦵",
    note: "Cool down: Precor stretching machine, hamstrings and hips.",
    exercises: [
      { id: "leg-press", name: "Leg Press", note: "Seat 9", kind: "strength", sets: 3, reps: 12, weight: 40, unit: "lbs" },
      { id: "leg-ext", name: "Leg Extension", note: "Seat 8, outer circle 1", kind: "strength", sets: 3, reps: 12, weight: 30, unit: "lbs" },
      { id: "leg-curl", name: "Leg Curl", note: "Inner circle 1", kind: "strength", sets: 3, reps: 12, weight: 20, unit: "lbs" },
      { id: "db-squat", name: "Dumbbell Squats", note: "10 lbs in each hand", kind: "strength", sets: 3, reps: 12, weight: 10, unit: "lbs each hand" },
      { id: "stairs", name: "Stairs", note: "Finisher", kind: "cardio", minutes: 10, unit: "min" },
    ],
  },
  {
    id: "arms",
    name: "Arms and Back",
    emoji: "💪",
    note: "End with 15 minutes on the treadmill.",
    exercises: [
      { id: "lat-pulldown", name: "Lat Pulldown", note: "Start 25 to 40 lbs", kind: "strength", sets: 3, reps: 12, weight: 30, unit: "lbs" },
      { id: "seated-row", name: "Seated Row", note: "Start 25 to 40 lbs", kind: "strength", sets: 3, reps: 12, weight: 30, unit: "lbs" },
      { id: "db-curl", name: "Dumbbell Bicep Curls", note: "10 lbs in each hand", kind: "strength", sets: 3, reps: 12, weight: 10, unit: "lbs each hand" },
      { id: "pushdown", name: "Cable Tricep Pushdowns", note: "Starting point, adjust freely", kind: "strength", sets: 3, reps: 12, weight: 20, unit: "lbs" },
      { id: "hammer-curl", name: "Hammer Curls", note: "10 lbs in each hand", kind: "strength", sets: 3, reps: 12, weight: 10, unit: "lbs each hand" },
      { id: "oh-tri", name: "Overhead Dumbbell Tricep Extension", note: "One 10 lbs dumbbell", kind: "strength", sets: 3, reps: 12, weight: 10, unit: "lbs" },
      { id: "treadmill", name: "Treadmill", note: "Easy finish", kind: "cardio", minutes: 15, unit: "min" },
    ],
  },
  {
    id: "fullbody",
    name: "Full Body",
    emoji: "🐱",
    note: "A little bit of everything, for days you want the full mix.",
    exercises: [
      { id: "leg-press", name: "Leg Press", note: "Seat 9", kind: "strength", sets: 3, reps: 12, weight: 40, unit: "lbs" },
      { id: "seated-row", name: "Seated Row", note: "Start 25 to 40 lbs", kind: "strength", sets: 3, reps: 12, weight: 30, unit: "lbs" },
      { id: "db-squat", name: "Dumbbell Squats", note: "10 lbs in each hand", kind: "strength", sets: 3, reps: 12, weight: 10, unit: "lbs each hand" },
      { id: "lat-pulldown", name: "Lat Pulldown", note: "Start 25 to 40 lbs", kind: "strength", sets: 3, reps: 12, weight: 30, unit: "lbs" },
      { id: "db-curl", name: "Dumbbell Bicep Curls", note: "10 lbs in each hand", kind: "strength", sets: 3, reps: 12, weight: 10, unit: "lbs each hand" },
      { id: "elliptical", name: "Elliptical", note: "Easy finish", kind: "cardio", minutes: 10, unit: "min" },
    ],
  },
];

const STORE_KEY = "purrgress-v1";

let state = load();
let current = null;
let rest = { remaining: 0, running: false };
let restTimer = null;
let clockTimer = null;

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* fresh start */ }
  return { bodyWeight: [], history: [], lastWeights: {}, restSec: 60 };
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function fmtTime(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m + ":" + String(s).padStart(2, "0");
}

function mondayOf(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function doneThisWeek() {
  const start = mondayOf(new Date());
  const done = new Set();
  for (const h of state.history) {
    if (new Date(h.date) >= start) done.add(h.sessionId);
  }
  return done;
}

function showView(name) {
  for (const v of ["today", "plan", "session", "history", "me"]) {
    document.getElementById("view-" + v).classList.toggle("hidden", v !== name);
  }
  document.querySelectorAll(".bottomnav button").forEach((b) => {
    b.classList.toggle("active", b.dataset.nav === name);
  });
  if (name === "today") renderToday();
  if (name === "plan") renderPlan();
  if (name === "history") renderHistory();
  if (name === "me") renderMe();
}

document.querySelectorAll(".bottomnav button").forEach((b) => {
  b.addEventListener("click", () => {
    if (b.dataset.nav === "session") return;
    showView(b.dataset.nav);
  });
});

function renderToday() {
  const done = doneThisWeek();
  const next = PLAN.find((s) => !done.has(s.id)) || PLAN[0];
  const allDone = PLAN.every((s) => done.has(s.id));
  const el = document.getElementById("view-today");
  el.innerHTML = `
    <h2>Today</h2>
    <div class="card">
      <span class="badge">${done.size} of ${PLAN.length} sessions this week</span>
      <div class="dots">
        ${PLAN.map((s) => `<div class="dot ${done.has(s.id) ? "done" : ""}" title="${s.name}">${done.has(s.id) ? "✓" : s.emoji}</div>`).join("")}
      </div>
      <p class="small">Missed a day? No stress. The plan just waits for you.</p>
    </div>
    <div class="card">
      <span class="badge ${allDone ? "good" : ""}">${allDone ? "Week complete, nice work" : "Next up"}</span>
      <h3>${next.emoji} ${next.name}</h3>
      <p class="small">${next.exercises.map((e) => e.name).join(", ")}.</p>
      <p class="small">${next.note}</p>
      <button class="btn" onclick="startSession('${next.id}')">Start ${next.name}</button>
    </div>
    <div class="card">
      <h3>Quick start</h3>
      <p class="small">Start any session, any day. The week view just tracks what you did.</p>
      ${PLAN.map((s) => `<button class="btn ghost" onclick="startSession('${s.id}')">${s.emoji} ${s.name}</button>`).join("")}
    </div>`;
}

function renderPlan() {
  const el = document.getElementById("view-plan");
  el.innerHTML = `<h2>Weekly plan</h2>` + PLAN.map((s) => `
    <div class="card">
      <span class="badge">${s.id === "legs" ? "Day 1" : s.id === "arms" ? "Day 2" : "Day 3"}</span>
      <h3>${s.emoji} ${s.name}</h3>
      <p class="small">${s.note}</p>
      ${s.exercises.map((e) => `
        <div class="setrow">
          <div><strong>${e.name}</strong><div class="small">${e.note}</div></div>
          <div class="small">${e.kind === "cardio" ? e.minutes + " min" : e.sets + " x " + e.reps + ", " + (state.lastWeights[e.id] ?? e.weight) + " " + e.unit}</div>
        </div>`).join("")}
      <button class="btn" onclick="startSession('${s.id}')">Start ${s.name}</button>
    </div>`).join("");
}

function clearTimers() {
  if (restTimer) clearInterval(restTimer);
  if (clockTimer) clearInterval(clockTimer);
  restTimer = null;
  clockTimer = null;
  rest = { remaining: 0, running: false };
}

function startSession(sessionId) {
  const session = PLAN.find((s) => s.id === sessionId);
  clearTimers();
  current = {
    sessionId,
    startedAt: Date.now(),
    exercises: session.exercises.map((e) => {
      if (e.kind === "cardio") {
        return { ...e, sets: [{ minutes: e.minutes, done: false }] };
      }
      const weight = state.lastWeights[e.id] ?? e.weight;
      return {
        ...e,
        sets: Array.from({ length: e.sets }, () => ({ weight, reps: e.reps, done: false })),
      };
    }),
  };
  clockTimer = setInterval(() => {
    const clock = document.getElementById("session-clock");
    if (clock && current) clock.textContent = fmtTime(Math.round((Date.now() - current.startedAt) / 1000));
  }, 1000);
  renderSession();
  showView("session");
}

function restControlsHtml() {
  if (rest.running) {
    return `<span class="time" id="rest-time">${fmtTime(rest.remaining)}</span>
      <button style="background:#fff;color:#2b2118;padding:8px 14px;border-radius:10px;font-weight:700;" onclick="skipRest()">Skip</button>`;
  }
  return `<span style="font-size:13px;">Rest timer</span>
    <span>
      <button style="background:#fff;color:#2b2118;padding:8px 12px;border-radius:10px;font-weight:700;" onclick="startRest(state.restSec)">${state.restSec}s</button>
      <button style="background:transparent;color:#fff;padding:8px 6px;font-weight:700;" onclick="startRest(30)">30</button>
      <button style="background:transparent;color:#fff;padding:8px 6px;font-weight:700;" onclick="startRest(90)">90</button>
    </span>`;
}

function startRest(seconds) {
  if (restTimer) clearInterval(restTimer);
  rest = { remaining: seconds, running: true };
  renderSession();
  restTimer = setInterval(() => {
    rest.remaining -= 1;
    const label = document.getElementById("rest-time");
    if (label) label.textContent = fmtTime(Math.max(0, rest.remaining));
    if (rest.remaining <= 0) {
      clearInterval(restTimer);
      restTimer = null;
      rest.running = false;
      if (navigator.vibrate) navigator.vibrate(200);
      const bar = document.getElementById("rest-controls");
      if (bar) bar.innerHTML = `<span style="font-size:14px;font-weight:700;">Rest over, go!</span>
        <button style="background:#fff;color:#2b2118;padding:8px 14px;border-radius:10px;font-weight:700;" onclick="renderSession()">Okay</button>`;
    }
  }, 1000);
}

function skipRest() {
  if (restTimer) clearInterval(restTimer);
  restTimer = null;
  rest = { remaining: 0, running: false };
  renderSession();
}

function renderSession() {
  const session = PLAN.find((s) => s.id === current.sessionId);
  const el = document.getElementById("view-session");
  el.innerHTML = `
    <h2>${session.emoji} ${session.name}</h2>
    <div class="timerbar">
      <div>⏱ <span class="time" id="session-clock">${fmtTime(Math.round((Date.now() - current.startedAt) / 1000))}</span></div>
      <div id="rest-controls" style="display:flex;gap:8px;align-items:center;">${restControlsHtml()}</div>
    </div>
    <p class="small">${session.note}</p>
    ${current.exercises.map((e, ei) => `
      <div class="card">
        <h3>${e.name}</h3>
        <p class="small">${e.note}</p>
        ${e.sets.map((set, si) => `
          <div class="setrow ${set.done ? "done" : ""}">
            <div><strong>Set ${si + 1}</strong></div>
            ${e.kind === "cardio" ? `
              <div class="stepper">
                <button onclick="bump(${ei}, ${si}, 'minutes', -1)">−</button>
                <span>${set.minutes} min</span>
                <button onclick="bump(${ei}, ${si}, 'minutes', 1)">+</button>
              </div>` : `
              <div class="stepper">
                <button onclick="bump(${ei}, ${si}, 'weight', -5)">−</button>
                <span>${set.weight} ${e.unit}</span>
                <button onclick="bump(${ei}, ${si}, 'weight', 5)">+</button>
              </div>
              <div class="stepper">
                <button onclick="bump(${ei}, ${si}, 'reps', -1)">−</button>
                <span>${set.reps} reps</span>
                <button onclick="bump(${ei}, ${si}, 'reps', 1)">+</button>
              </div>`}
            <button class="check ${set.done ? "on" : ""}" onclick="toggleSet(${ei}, ${si})">${set.done ? "✓" : ""}</button>
          </div>`).join("")}
      </div>`).join("")}
    <button class="btn" onclick="finishSession()">Finish workout</button>
    <button class="btn ghost" onclick="cancelSession()">Cancel, do not save</button>`;
}

function bump(ei, si, field, delta) {
  const set = current.exercises[ei].sets[si];
  if (field === "weight") set.weight = Math.max(0, set.weight + delta);
  if (field === "reps") set.reps = Math.max(0, set.reps + delta);
  if (field === "minutes") set.minutes = Math.max(0, set.minutes + delta);
  renderSession();
}

function toggleSet(ei, si) {
  const set = current.exercises[ei].sets[si];
  set.done = !set.done;
  renderSession();
}

function finishSession() {
  const durationSec = Math.round((Date.now() - current.startedAt) / 1000);
  for (const e of current.exercises) {
    if (e.kind === "strength" && e.sets.length) {
      state.lastWeights[e.id] = e.sets[e.sets.length - 1].weight;
    }
  }
  state.history.unshift({
    date: new Date().toISOString(),
    sessionId: current.sessionId,
    durationSec,
    exercises: current.exercises,
  });
  save();
  current = null;
  clearTimers();
  showView("today");
}

function cancelSession() {
  current = null;
  clearTimers();
  showView("today");
}

function renderHistory() {
  const el = document.getElementById("view-history");
  if (!state.history.length) {
    el.innerHTML = `<h2>History</h2><div class="card"><p>No workouts logged yet. Your first one shows up here.</p></div>`;
    return;
  }
  el.innerHTML = `<h2>History</h2>` + state.history.map((h) => {
    const session = PLAN.find((s) => s.id === h.sessionId);
    const mins = Math.round(h.durationSec / 60);
    return `<div class="card">
      <span class="badge">${new Date(h.date).toLocaleDateString()}</span>
      <h3>${session ? session.emoji + " " + session.name : h.sessionId}</h3>
      <p class="small">${mins} minutes, ${h.exercises.length} exercises.</p>
      <p class="small">${h.exercises.map((e) => e.name).join(", ")}.</p>
    </div>`;
  }).join("");
}

function renderMe() {
  const latest = state.bodyWeight[state.bodyWeight.length - 1];
  const first = state.bodyWeight[0];
  const trend = latest && first && state.bodyWeight.length > 1
    ? `Change since you started: ${(latest.weight - first.weight).toFixed(1)} lbs.`
    : "";
  const el = document.getElementById("view-me");
  el.innerHTML = `
    <h2>Me</h2>
    <div class="card">
      <h3>Body weight</h3>
      <p class="small">Log it and the app tracks the trend. Your lifting suggestions learn from your logged sessions.</p>
      <label>Today's weight (lbs)</label>
      <input id="bw-input" type="number" step="0.1" placeholder="${latest ? latest.weight : "e.g. 140"}">
      <button class="btn" onclick="addBodyWeight()">Log weight</button>
      <p class="small">${latest ? "Latest: " + latest.weight + " lbs on " + new Date(latest.date).toLocaleDateString() + ". " : ""}${trend}</p>
      ${state.bodyWeight.slice().reverse().slice(0, 8).map((b) => `<div class="setrow"><div>${new Date(b.date).toLocaleDateString()}</div><div><strong>${b.weight} lbs</strong></div></div>`).join("")}
    </div>
    <div class="card">
      <h3>Totals</h3>
      <p class="small">${state.history.length} workouts logged. ${doneThisWeek().size} sessions this week.</p>
      <label>Default rest between sets (seconds)</label>
      <select id="rest-select" onchange="setRest(this.value)">
        <option value="30" ${state.restSec === 30 ? "selected" : ""}>30</option>
        <option value="60" ${state.restSec === 60 ? "selected" : ""}>60</option>
        <option value="90" ${state.restSec === 90 ? "selected" : ""}>90</option>
        <option value="120" ${state.restSec === 120 ? "selected" : ""}>120</option>
      </select>
    </div>`;
}

function addBodyWeight() {
  const input = document.getElementById("bw-input");
  const weight = parseFloat(input.value);
  if (!weight) return;
  state.bodyWeight.push({ date: new Date().toISOString(), weight });
  save();
  renderMe();
}

function setRest(value) {
  state.restSec = parseInt(value, 10);
  save();
}

showView("today");
