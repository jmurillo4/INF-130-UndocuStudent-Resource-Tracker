// ─── STATE ────────────────────────────────────────────────────────────────────
const answers = { field: '', location: '', status: '', stage: '', goals: [] };
let currentStep = 1;

// ─── NAV HELPERS ─────────────────────────────────────────────────────────────
function hideNav() { document.querySelector('nav').classList.add('nav-hidden'); }
function showNav() { document.querySelector('nav').classList.remove('nav-hidden'); }

// ─── PAGE ROUTING ─────────────────────────────────────────────────────────────
function showQuiz(e) {
  if (e) e.preventDefault();
  document.getElementById('main-page').classList.add('hidden');
  document.getElementById('quiz-page').classList.add('active');
  document.getElementById('results-page').classList.remove('active');
  hideNav();
  goToStep(1);
  window.scrollTo(0, 0);
}

function showMain() {
  document.getElementById('main-page').classList.remove('hidden');
  document.getElementById('quiz-page').classList.remove('active');
  document.getElementById('results-page').classList.remove('active');
  showNav();
  window.scrollTo(0, 0);
}

function restart() {
  answers.field = '';
  answers.location = '';
  answers.status = '';
  answers.stage = '';
  answers.goals = [];
  document.getElementById('fieldSelect').value = '';
  document.getElementById('locationInput').value = '';
  document.getElementById('statusSelect').value = '';
  document.getElementById('stageSelect').value = '';
  document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  showQuiz(null);
}

// ─── STEP NAVIGATION ──────────────────────────────────────────────────────────
function goToStep(n) {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('step' + n);
  if (target) {
    target.classList.add('active');
    target.style.opacity = '0';
    target.style.transform = 'translateY(16px)';
    requestAnimationFrame(() => {
      target.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      target.style.opacity = '1';
      target.style.transform = 'translateY(0)';
    });
  }
  const pct = Math.round((n / 5) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  currentStep = n;
}

function goNext(nextStepNum, key, value) {
  if (key === 'field' && !value) { flashError('Please select a field of interest.'); return; }
  if (key === 'location' && !value) { flashError('Please enter your city and state.'); return; }
  if (key === 'status' && !value) { flashError('Please select your immigration status.'); return; }
  if (key === 'stage' && !value) { flashError('Please select your current stage.'); return; }
  goToStep(nextStepNum);
}

function goPrev(prevStepNum) { goToStep(prevStepNum); }

function flashError(msg) {
  let el = document.querySelector('.quiz-step.active .quiz-error');
  if (!el) {
    el = document.createElement('p');
    el.className = 'quiz-error';
    document.querySelector('.quiz-step.active .quiz-nav').before(el);
  }
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// ─── OPTION SELECTION ─────────────────────────────────────────────────────────
function selectOpt(btn, key, val) {
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

// ─── LOCATION TYPEAHEAD ───────────────────────────────────────────────────────
// (City list content remains exactly the same as provided in previous upload)
const US_CITIES = [
  "Anniston, AL","Auburn, AL","Birmingham, AL","Decatur, AL","Dothan, AL","Florence, AL",
  "Gadsden, AL","Hoover, AL","Huntsville, AL","Mobile, AL","Montgomery, AL","Tuscaloosa, AL",
  "Anchorage, AK","Fairbanks, AK","Juneau, AK","Sitka, AK",
  "Avondale, AZ","Buckeye, AZ","Chandler, AZ","Gilbert, AZ","Glendale, AZ","Goodyear, AZ",
  "Mesa, AZ","Peoria, AZ","Phoenix, AZ","Scottsdale, AZ","Surprise, AZ","Tempe, AZ",
  "Tucson, AZ","Yuma, AZ","Conway, AR","Fayetteville, AR","Fort Smith, AR","Jonesboro, AR","Little Rock, AR",
  "North Little Rock, AR","Pine Bluff, AR","Springdale, AR","Anaheim, CA","Antioch, CA","Bakersfield, CA","Berkeley, CA","Burbank, CA","Chula Vista, CA",
  "Clovis, CA","Compton, CA","Concord, CA","Corona, CA","Costa Mesa, CA","Daly City, CA",
  "Downey, CA","El Monte, CA","Elk Grove, CA","Escondido, CA","Fontana, CA","Fremont, CA",
  "Fresno, CA","Fullerton, CA","Garden Grove, CA","Glendale, CA","Hayward, CA",
  "Huntington Beach, CA","Inglewood, CA","Irvine, CA","Lancaster, CA","Long Beach, CA",
  "Los Angeles, CA","Modesto, CA","Moreno Valley, CA","Murrieta, CA","Norwalk, CA",
  "Oakland, CA","Oceanside, CA","Ontario, CA","Orange, CA","Oxnard, CA","Palmdale, CA",
  "Pasadena, CA","Pomona, CA","Rancho Cucamonga, CA","Richmond, CA","Riverside, CA",
  "Roseville, CA","Sacramento, CA","Salinas, CA","San Bernardino, CA","San Diego, CA",
  "San Francisco, CA","San Jose, CA","Santa Ana, CA","Santa Clarita, CA","Santa Rosa, CA",
  "Simi Valley, CA","Stockton, CA","Sunnyvale, CA","Thousand Oaks, CA",
  "Torrance, CA","Vallejo, CA","Victorville, CA","Visalia, CA","Aurora, CO","Boulder, CO","Colorado Springs, CO","Denver, CO","Fort Collins, CO",
  "Lakewood, CO","Pueblo, CO","Thornton, CO","Westminster, CO","Bridgeport, CT","Hartford, CT","New Haven, CT","New London, CT","Stamford, CT",
  "Waterbury, CT","West Haven, CT","Dover, DE","Newark, DE","Wilmington, DE","Boca Raton, FL","Boynton Beach, FL","Cape Coral, FL","Clearwater, FL","Coral Springs, FL",
  "Davie, FL","Fort Lauderdale, FL","Gainesville, FL","Hialeah, FL","Hollywood, FL",
  "Homestead, FL","Jacksonville, FL","Lakeland, FL","Miramar, FL","Miami, FL","Miami Gardens, FL",
  "Orlando, FL","Palm Bay, FL","Pembroke Pines, FL","Pompano Beach, FL","Port St. Lucie, FL",
  "St. Petersburg, FL","Tallahassee, FL","Tampa, FL","West Palm Beach, FL","Albany, GA","Athens, GA","Atlanta, GA","Augusta, GA","Columbus, GA","Macon, GA",
  "Roswell, GA","Sandy Springs, GA","Savannah, GA","South Fulton, GA","Valdosta, GA","Warner Robins, GA",
  "Hilo, HI","Honolulu, HI","Kailua, HI","Kaneohe, HI","Pearl City, HI","Boise, ID","Caldwell, ID","Idaho Falls, ID","Meridian, ID","Nampa, ID","Pocatello, ID",
  "Aurora, IL","Chicago, IL","Cicero, IL","Elgin, IL","Joliet, IL","Naperville, IL",
  "Peoria, IL","Rockford, IL","Springfield, IL","Waukegan, IL","Anderson, IN","Bloomington, IN","Carmel, IN","Columbus, IN","Evansville, IN",
  "Fishers, IN","Fort Wayne, IN","Gary, IN","Hammond, IN","Indianapolis, IN",
  "Jeffersonville, IN","Kokomo, IN","Lafayette, IN","Muncie, IN","South Bend, IN","Terre Haute, IN",
  "Ames, IA","Cedar Rapids, IA","Council Bluffs, IA","Davenport, IA","Des Moines, IA",
  "Dubuque, IA","Iowa City, IA","Sioux City, IA","Waterloo, IA","Kansas City, KS","Lawrence, KS","Olathe, KS","Overland Park, KS","Topeka, KS","Wichita, KS",
  "Bowling Green, KY","Covington, KY","Lexington, KY","Louisville, KY","Owensboro, KY","Baton Rouge, LA","Kenner, LA","Lafayette, LA","Lake Charles, LA","Monroe, LA",
  "New Orleans, LA","Shreveport, LA","Auburn, ME","Bangor, ME","Lewiston, ME","Portland, ME","Annapolis, MD","Baltimore, MD","Bowie, MD","Frederick, MD","Gaithersburg, MD",
  "Germantown, MD","Rockville, MD","Silver Spring, MD","Boston, MA","Brockton, MA","Cambridge, MA","Fall River, MA","Lowell, MA",
  "New Bedford, MA","Newton, MA","Quincy, MA","Springfield, MA","Worcester, MA","Ann Arbor, MI","Dearborn, MI","Detroit, MI","Flint, MI","Grand Rapids, MI",
  "Kalamazoo, MI","Lansing, MI","Livonia, MI","Sterling Heights, MI","Warren, MI","Bloomington, MN","Brooklyn Park, MN","Duluth, MN","Minneapolis, MN","Plymouth, MN",
  "Rochester, MN","Saint Paul, MN","Biloxi, MS","Gulfport, MS","Hattiesburg, MS","Jackson, MS","Meridian, MS","Southaven, MS","Columbia, MO","Independence, MO","Kansas City, MO","Lee's Summit, MO","O'Fallon, MO",
  "Springfield, MO","St. Joseph, MO","St. Louis, MO","Billings, MT","Great Falls, MT","Missoula, MT","Bellevue, NE","Lincoln, NE","Omaha, NE","Henderson, NV","Las Vegas, NV","North Las Vegas, NV","Reno, NV","Sparks, NV",
  "Concord, NH","Manchester, NH","Nashua, NH","Camden, NJ","Elizabeth, NJ","Jersey City, NJ","Newark, NJ","Paterson, NJ",
  "Trenton, NJ","Woodbridge, NJ","Albuquerque, NM","Clovis, NM","Las Cruces, NM","Rio Rancho, NM","Roswell, NM","Santa Fe, NM","Albany, NY","Bronx, NY","Brooklyn, NY","Buffalo, NY","Manhattan, NY","Mount Vernon, NY",
  "New Rochelle, NY","New York, NY","Queens, NY","Rochester, NY","Schenectady, NY",
  "Staten Island, NY","Syracuse, NY","Utica, NY","White Plains, NY","Yonkers, NY","Asheville, NC","Cary, NC","Chapel Hill, NC","Charlotte, NC","Concord, NC","Durham, NC",
  "Fayetteville, NC","Gastonia, NC","Greensboro, NC","High Point, NC","Raleigh, NC",
  "Wilmington, NC","Winston-Salem, NC","Bismarck, ND","Fargo, ND","Grand Forks, ND","Akron, OH","Canton, OH","Cincinnati, OH","Cleveland, OH","Columbus, OH","Dayton, OH",
  "Lorain, OH","Parma, OH","Toledo, OH","Youngstown, OH","Broken Arrow, OK","Edmond, OK","Lawton, OK","Norman, OK","Oklahoma City, OK","Tulsa, OK","Beaverton, OR","Bend, OR","Corvallis, OR","Eugene, OR","Gresham, OR","Hillsboro, OR",
  "Medford, OR","Portland, OR","Salem, OR","Springfield, OR","Allentown, PA","Altoona, PA","Erie, PA","Philadelphia, PA","Pittsburgh, PA",
  "Reading, PA","Scranton, PA","York, PA","Cranston, RI","Pawtucket, RI","Providence, RI","Warwick, RI","Woonsocket, RI","Charleston, SC","Columbia, SC","Greenville, SC","Mount Pleasant, SC","Rock Hill, SC","Spartanburg, SC","Rapid City, SD","Sioux Falls, SD",
  "Chattanooga, TN","Clarksville, TN","Jackson, TN","Johnson City, TN","Kingsport, TN",
  "Knoxville, TN","Memphis, TN","Murfreesboro, TN","Nashville, TN","Abilene, TX","Allen, TX","Amarillo, TX","Arlington, TX","Austin, TX","Beaumont, TX",
  "Brownsville, TX","Carrollton, TX","Cedar Park, TX","Corpus Christi, TX","Dallas, TX",
  "Denton, TX","El Paso, TX","Fort Worth, TX","Frisco, TX","Garland, TX","Grand Prairie, TX",
  "Irving, TX","Killeen, TX","Laredo, TX","League City, TX","Lewisville, TX","Lubbock, TX",
  "McAllen, TX","McKinney, TX","Mesquite, TX","Midland, TX","Missouri City, TX","Odessa, TX",
  "Pasadena, TX","Pearland, TX","Plano, TX","Richardson, TX","Round Rock, TX",
  "San Antonio, TX","Sugar Land, TX","Tyler, TX","Waco, TX","Wichita Falls, TX","Ogden, UT","Orem, UT","Provo, UT","Salt Lake City, UT","Sandy, UT","St. George, UT",
  "Taylorsville, UT","West Jordan, UT","West Valley City, UT","Burlington, VT","Montpelier, VT","Alexandria, VA","Arlington, VA","Chesapeake, VA","Hampton, VA","Lynchburg, VA",
  "Newport News, VA","Norfolk, VA","Portsmouth, VA","Richmond, VA","Roanoke, VA",
  "Suffolk, VA","Virginia Beach, VA","Bellevue, WA","Bellingham, WA","Federal Way, WA","Kennewick, WA","Kent, WA",
  "Kirkland, WA","Redmond, WA","Renton, WA","Seattle, WA","Spokane, WA",
  "Spokane Valley, WA","Tacoma, WA","Vancouver, WA","Yakima, WA","Charleston, WV","Huntington, WV","Morgantown, WV","Parkersburg, WV","Eau Claire, WI","Green Bay, WI","Kenosha, WI","Madison, WI","Milwaukee, WI",
  "Oshkosh, WI","Racine, WI","Waukesha, WI","Casper, WY","Cheyenne, WY","Laramie, WY","Washington, DC"
];

let typeaheadHighlight = -1;

function handleLocationInput(val) {
  answers.location = val;
  const list = document.getElementById('typeaheadList');
  if (!val || val.length < 1) { list.innerHTML = ''; list.classList.remove('open'); return; }

  const q = val.toLowerCase();
  const matches = US_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 8);

  if (matches.length === 0) { list.innerHTML = ''; list.classList.remove('open'); return; }

  list.innerHTML = matches.map((c, i) =>
    `<li class="typeahead-item" data-idx="${i}" onmousedown="selectCity('${c.replace(/'/g, "\\'")}')">${highlightMatch(c, val)}</li>`
  ).join('');
  list.classList.add('open');
  typeaheadHighlight = -1;
}

function highlightMatch(city, query) {
  const idx = city.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return city;
  return city.slice(0, idx) +
    '<mark>' + city.slice(idx, idx + query.length) + '</mark>' +
    city.slice(idx + query.length);
}

function selectCity(city) {
  document.getElementById('locationInput').value = city;
  answers.location = city;
  const list = document.getElementById('typeaheadList');
  list.innerHTML = '';
  list.classList.remove('open');
}

function handleLocationKey(e) {
  const list = document.getElementById('typeaheadList');
  const items = list.querySelectorAll('.typeahead-item');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    typeaheadHighlight = Math.min(typeaheadHighlight + 1, items.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    typeaheadHighlight = Math.max(typeaheadHighlight - 1, 0);
  } else if (e.key === 'Enter' && typeaheadHighlight >= 0) {
    e.preventDefault();
    selectCity(items[typeaheadHighlight].textContent);
    return;
  } else if (e.key === 'Escape') {
    list.innerHTML = ''; list.classList.remove('open'); return;
  }

  items.forEach((item, i) => item.classList.toggle('active', i === typeaheadHighlight));
  if (typeaheadHighlight >= 0) items[typeaheadHighlight].scrollIntoView({ block: 'nearest' });
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.typeahead-wrapper')) {
    const list = document.getElementById('typeaheadList');
    if (list) { list.innerHTML = ''; list.classList.remove('open'); }
  }
});

// ─── RESULTS DATA (Expanded) ──────────────────────────────────────────────────
const SCHOLARSHIPS = {
  'Technology': [
    { name: 'Golden Door Scholars', desc: 'Full-ride for undocumented STEM students.', amount: 'Up to $40k/yr', tag: 'Scholarship' },
    { name: 'TheDream.US', desc: 'National scholarship for DACA/TPS recipients.', amount: 'Up to $33k', tag: 'Scholarship' },
    { name: 'Code2040 Fellowship', desc: 'Summer tech internship for underrepresented students.', amount: 'Paid Fellowship', tag: 'Internship' },
    { name: 'Techqueria Community', desc: 'Largest community for Latinx in Tech providing networking.', amount: 'Networking', tag: 'Community' }
  ],
  'Healthcare': [
    { name: 'Hispanic Health Professional Student Scholarship', desc: 'For Latinx students in medicine, nursing, or dental.', amount: 'Up to $10k', tag: 'Scholarship' },
    { name: 'TheDream.US', desc: 'National scholarship for DACA/TPS recipients.', amount: 'Up to $33k', tag: 'Scholarship' },
    { name: 'Pre-Health Dreamers (PHD)', desc: 'Community and resources for students pursuing medicine.', amount: 'Advocacy', tag: 'Community' }
  ],
  'Law & Policy': [
    { name: 'MALDEF Law School Scholarship', desc: 'For undocumented or DACA law students.', amount: 'Up to $7k', tag: 'Scholarship' },
    { name: 'NILC Policy Fellowship', desc: 'Paid policy internship in immigration law.', amount: 'Paid', tag: 'Internship' },
    { name: 'Immigration Law Help', desc: 'Search tool for free or low-cost legal providers.', amount: 'Free Search', tag: 'Legal Aid' }
  ],
  'Business & Finance': [
    { name: 'Immigrants Rising Entrepreneurship Fund', desc: 'Grants for undocumented business owners.', amount: 'Up to $5k', tag: 'Grant' },
    { name: 'ALPFA Membership', desc: 'Networking and professional development for Latinos.', amount: 'Professional Org', tag: 'Mentorship' },
    { name: 'E-Seedling Curriculum', desc: 'Entrepreneurship training for non-status youth.', amount: 'Training', tag: 'Financial Aid' }
  ],
  'default': [
    { name: 'Hispanic Scholarship Fund', desc: 'Merit-based scholarship for all majors.', amount: 'Up to $15k', tag: 'Scholarship' },
    { name: 'United We Dream Network', desc: 'Community & legal support resources nationwide.', amount: 'Free Resource', tag: 'Legal Aid' },
    { name: 'Informed Immigrant', desc: 'Digital resource hub for the undocumented community.', amount: 'Digital Hub', tag: 'Community' }
  ]
};

// ─── SHOW RESULTS & PROFILE SUMMARY ───────────────────────────────────────────
function showResults() {
  if (answers.goals.length === 0) {
    flashError('Please select at least one option.'); return;
  }
  document.getElementById('quiz-page').classList.remove('active');
  const rp = document.getElementById('results-page');
  rp.classList.add('active');
  hideNav();
  buildProfileSummary(); // Added this
  buildResults();
  window.scrollTo(0, 0);
}

function buildProfileSummary() {
  const summary = document.getElementById('user-profile-summary');
  summary.innerHTML = `
    <h3><span style="font-size: 1.2rem;">👤</span> Your Profile Snapshot</h3>
    <div class="profile-grid">
      <div class="profile-item"><strong>Field of Interest</strong> ${answers.field || 'Not Selected'}</div>
      <div class="profile-item"><strong>Current Location</strong> ${answers.location || 'Not Provided'}</div>
      <div class="profile-item"><strong>Immigration Status</strong> ${answers.status || 'Not Provided'}</div>
      <div class="profile-item"><strong>Current Stage</strong> ${answers.stage || 'Not Provided'}</div>
    </div>
  `;
}

function buildResults() {
  const { field, location } = answers;
  document.getElementById('results-heading').textContent =
    `Resources for ${field || 'your field'}${location ? ' · ' + location : ''}`;

  const data = SCHOLARSHIPS[field] || SCHOLARSHIPS['default'];
  const container = document.getElementById('scholarships-cards');
  container.innerHTML = data.map(s => `
    <div class="result-card">
      <div class="result-tag">${s.tag}</div>
      <h4>${s.name}</h4>
      <p>${s.desc}</p>
      <div class="result-amount">${s.amount}</div>
    </div>
  `).join('');
}

// ─── INTERSECTION OBSERVER ────────────────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));