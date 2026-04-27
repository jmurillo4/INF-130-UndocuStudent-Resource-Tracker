// STATE
const answers = { field: '', location: '', status: '', stage: '', goals: [] };
let currentStep = 1;

// PAGE ROUTING
function showQuiz(e) {
  if (e) e.preventDefault();
  document.getElementById('main-page').classList.add('hidden');
  document.getElementById('quiz-page').classList.add('active');
  window.scrollTo(0,0);
}

function showMain() {
  document.getElementById('main-page').classList.remove('hidden');
  document.getElementById('quiz-page').classList.remove('active');
}

function restart() {
  location.reload(); // Simple way to reset state
}

// QUIZ LOGIC
function select(btn, key, val) {
  btn.closest('.option-grid').querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  answers[key] = val;
}

function toggleMulti(btn, key, val) {
  btn.classList.toggle('selected');
  if (btn.classList.contains('selected')) {
    if (!answers[key].includes(val)) answers[key].push(val);
  } else {
    answers[key] = answers[key].filter(v => v !== val);
  }
}

function nextStep(n) {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step' + n).classList.add('active');
  document.getElementById('progressFill').style.width = (n * 20) + '%';
  currentStep = n;
}

function prevStep(n) {
  nextStep(n);
}

// DATA MOCKUP
const SCHOLARSHIPS = {
  'Technology': [
    { name: 'Golden Door Scholars', desc: 'Full-ride for undocumented STEM students.', amount: 'Up to $40k/yr' },
    { name: 'TheDream.US', desc: 'National scholarship for DACA/TPS.', amount: 'Up to $33k' }
  ],
  'default': [
    { name: 'Hispanic Scholarship Fund', desc: 'Merit-based for all majors.', amount: 'Up to $15k' }
  ]
};

// SHOW RESULTS
function showResults() {
  document.getElementById('quiz-page').classList.remove('active');
  document.getElementById('results-page').classList.add('active');
  buildResults();
  window.scrollTo(0,0);
}

function buildResults() {
  const { field, location, stage } = answers;
  
  // Update Header
  document.getElementById('results-heading').textContent = `Resources for your journey in ${field || 'your field'}`;
  
  // Build Cards
  const data = SCHOLARSHIPS[field] || SCHOLARSHIPS['default'];
  const container = document.getElementById('scholarships-cards');
  container.innerHTML = data.map(s => `
    <div class="result-card">
      <h4>${s.name}</h4>
      <p>${s.desc}</p>
      <div style="margin-top:1rem; font-weight:700; color:#C9724F">${s.amount}</div>
    </div>
  `).join('');
}

// INTERSECTION OBSERVER FOR ANIMATIONS
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
