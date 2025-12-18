const DAILY_GOAL_MINUTES = 120; // 2 hours
const STORAGE_KEY = "focusflow_state_v1";

const focusTimeDisplay = document.getElementById("focusTimeDisplay");
const todayTotalDisplay = document.getElementById("todayTotalDisplay");
const dailyGoalDisplay = document.getElementById("dailyGoalDisplay");
const focusStatus = document.getElementById("focusStatus");
const motivationMessage = document.getElementById("motivationMessage");
const resetButton = document.getElementById("resetButton");
const progressCircle = document.querySelector(".progress-ring__circle");

const CIRCLE_RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

let focusMs = 0;
let lastTimestamp = Date.now();
let isActive = !document.hidden;

dailyGoalDisplay.textContent = `${DAILY_GOAL_MINUTES} min`;
if (progressCircle) {
  progressCircle.style.strokeDasharray = `${CIRCUMFERENCE}`;
  progressCircle.style.strokeDashoffset = `${CIRCUMFERENCE}`;
}

function getTodayKey() {
  const now = new Date();
  return now.toISOString().slice(0, 10); // YYYY-MM-DD
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed.date === getTodayKey() && typeof parsed.totalMs === "number") {
      focusMs = parsed.totalMs;
    }
  } catch {
    // ignore malformed storage
  }
}

function saveState() {
  const payload = {
    date: getTodayKey(),
    totalMs: focusMs,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage may be unavailable; fail silently
  }
}

function formatHMS(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function updateMotivation(progress) {
  if (progress >= 1) {
    motivationMessage.textContent = "Amazing work! You've hit your goal 🎉";
  } else if (progress >= 0.75) {
    motivationMessage.textContent = "So close, stay in the zone 🔥";
  } else if (progress >= 0.5) {
    motivationMessage.textContent = "Halfway there, keep going 💪";
  } else if (progress > 0) {
    motivationMessage.textContent = "Nice start, protect this focus ✨";
  } else {
    motivationMessage.textContent = "Ready when you are. Keep Going 💪";
  }
}

function updateUI() {
  focusTimeDisplay.textContent = formatHMS(focusMs);

  const totalMinutes = Math.floor(focusMs / 60000);
  todayTotalDisplay.textContent = `${totalMinutes} min`;

  const progress = Math.min(focusMs / (DAILY_GOAL_MINUTES * 60000), 1);
  const offset = CIRCUMFERENCE * (1 - progress);
  if (progressCircle) {
    progressCircle.style.strokeDashoffset = `${offset}`;
  }

  updateMotivation(progress);
}

function handleVisibilityChange() {
  isActive = !document.hidden;
  lastTimestamp = Date.now();

  if (isActive) {
    focusStatus.textContent = "Tracking – tab is active";
  } else {
    focusStatus.textContent = "Paused – tab is hidden";
  }
}

function resetToday() {
  focusMs = 0;
  lastTimestamp = Date.now();
  saveState();
  updateUI();
}

function tick() {
  const now = Date.now();
  const delta = now - lastTimestamp;
  lastTimestamp = now;

  if (isActive && delta > 0 && delta < 10000) {
    focusMs += delta;
    saveState();
    updateUI();
  }
}

document.addEventListener("visibilitychange", handleVisibilityChange);
resetButton?.addEventListener("click", resetToday);

// Initialize
loadState();
updateUI();
handleVisibilityChange();
setInterval(tick, 1000);


