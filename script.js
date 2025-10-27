// Application State
const state = {
    currentUser: null, // object for logged-in user (voter or conductor)
    userType: null, // 'voter' | 'conductor'
    selectedElection: null, // election id
    selectedCandidate: null, // candidate id within selected election
    timeRemaining: 1800, // 30 minutes in seconds
    timerInterval: null,
    voters: [], // [{id, name, email, phone, dob, address, password, photoDataUrl}]
    conductors: [], // [{email, password, name}]
    elections: [], // [{id, title, description, type, start, end, rules:{...}, candidates:[{id,name,party,description,votes}], createdByEmail, votes:[{voterId,candidateId,timestamp}]}]
    totalEligibleVoters: 1000
};

// DOM Elements
const heroSection = document.getElementById('heroSection');
const featuresSection = document.getElementById('featuresSection');
const loginTypeSection = document.getElementById('loginTypeSection');
const enrollmentSection = document.getElementById('enrollmentSection');
const conductorLoginSection = document.getElementById('conductorLoginSection');
const voterLoginSection = document.getElementById('voterLoginSection');
const voterDashboard = document.getElementById('voterDashboard');
const conductorDashboard = document.getElementById('conductorDashboard');
const createElectionSection = document.getElementById('createElectionSection');
const votingSection = document.getElementById('votingSection');
const resultsSection = document.getElementById('resultsSection');
const liveResultsSection = document.getElementById('liveResultsSection');

// Common elements
const candidatesGrid = document.getElementById('candidatesGrid');
const submitVoteBtn = document.getElementById('submitVoteBtn');
const logoutBtn = document.getElementById('logoutBtn');
const viewResultsBtn = document.getElementById('viewResultsBtn');
const backToHomeBtn = document.getElementById('backToHomeBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');
const timeRemainingEl = document.getElementById('timeRemaining');
const navLoginBtn = document.getElementById('navLoginBtn');
const conductorLoginBtn = document.getElementById('conductorLoginBtn');
const voterLoginBtn = document.getElementById('voterLoginBtn');

// Login type buttons
const showConductorLoginBtn = document.getElementById('showConductorLogin');
const showVoterLoginBtn = document.getElementById('showVoterLogin');
const showEnrollmentBtn = document.getElementById('showEnrollment');
const backToLoginTypeBtn = document.getElementById('backToLoginType');
const backFromConductorBtn = document.getElementById('backFromConductor');
const backFromVoterBtn = document.getElementById('backFromVoter');

// Enrollment form elements
const enrollmentForm = document.getElementById('enrollmentForm');
const enrollPhotoInput = document.getElementById('enrollPhoto');
const photoPreview = document.getElementById('photoPreview');

// Conductor login form
const conductorLoginForm = document.getElementById('conductorLoginForm');

// Voter login form
const voterLoginForm = document.getElementById('voterLoginForm');

// Conductor dashboard controls
const createElectionBtn = document.getElementById('createElectionBtn');
const viewMyElectionsBtn = document.getElementById('viewMyElectionsBtn');
const conductorLogoutBtn = document.getElementById('conductorLogout');
const conductorContent = document.getElementById('conductorContent');

// Create Election controls
const createElectionForm = document.getElementById('createElectionForm');
const addCandidateBtn = document.getElementById('addCandidateBtn');
const candidatesContainer = document.getElementById('candidatesContainer');
const cancelElectionBtn = document.getElementById('cancelElectionBtn');

// Voter dashboard controls
const electionsListContainer = document.getElementById('electionsListContainer');
const voterLogoutBtn = document.getElementById('voterLogout');
const voterPhotoEl = document.getElementById('voterPhoto');
const voterNameDisplay = document.getElementById('voterNameDisplay');
const voterIdDisplay = document.getElementById('voterIdDisplay');
const electionSearch = document.getElementById('electionSearch');
const electionFilter = document.getElementById('electionFilter');
const voterElectionSearch = document.getElementById('voterElectionSearch');
const voterElectionFilter = document.getElementById('voterElectionFilter');
const votersCsvInput = document.getElementById('votersCsvInput');
const importVotersBtn = document.getElementById('importVotersBtn');
const exportVotersBtn = document.getElementById('exportVotersBtn');

let editingElectionId = null;

// Initialize Application
function init() {
    loadFromLocalStorage();
    setupEventListeners();
    // If a session exists, route accordingly
    if (state.currentUser && state.userType === 'conductor') {
        showSection('conductorDashboard');
        renderConductorDashboard();
    } else if (state.currentUser && state.userType === 'voter') {
        showSection('voterDashboard');
        renderVoterDashboard();
    } else {
        showSection('hero');
    }
}

// Load data from localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('ovp_state');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.voters = parsed.voters || [];
        state.conductors = parsed.conductors || [];
        state.elections = parsed.elections || [];
        state.currentUser = parsed.currentUser || null;
        state.userType = parsed.userType || null;
        state.selectedElection = parsed.selectedElection || null;
    }
}

// Save data to localStorage
function saveToLocalStorage() {
    const toSave = {
        voters: state.voters,
        conductors: state.conductors,
        elections: state.elections,
        currentUser: state.currentUser,
        userType: state.userType,
        selectedElection: state.selectedElection
    };
    localStorage.setItem('ovp_state', JSON.stringify(toSave));
}

// Setup Event Listeners
function setupEventListeners() {
    // Top nav / hero
    if (navLoginBtn) navLoginBtn.addEventListener('click', () => showSection('loginType'));
    if (conductorLoginBtn) conductorLoginBtn.addEventListener('click', () => showSection('conductorLogin'));
    if (voterLoginBtn) voterLoginBtn.addEventListener('click', () => showSection('voterLogin'));

    // Login type selection
    if (showConductorLoginBtn) showConductorLoginBtn.addEventListener('click', () => showSection('conductorLogin'));
    if (showVoterLoginBtn) showVoterLoginBtn.addEventListener('click', () => showSection('voterLogin'));
    if (showEnrollmentBtn) showEnrollmentBtn.addEventListener('click', () => showSection('enrollment'));
    if (backToLoginTypeBtn) backToLoginTypeBtn.addEventListener('click', () => showSection('loginType'));
    if (backFromConductorBtn) backFromConductorBtn.addEventListener('click', () => showSection('loginType'));
    if (backFromVoterBtn) backFromVoterBtn.addEventListener('click', () => showSection('loginType'));

    // Enrollment
    if (enrollmentForm) enrollmentForm.addEventListener('submit', handleEnrollmentSubmit);
    if (enrollPhotoInput) enrollPhotoInput.addEventListener('change', handlePhotoPreview);

    // Conductor login
    if (conductorLoginForm) conductorLoginForm.addEventListener('submit', handleConductorLogin);
    if (conductorLogoutBtn) conductorLogoutBtn.addEventListener('click', handleLogout);
    if (createElectionBtn) createElectionBtn.addEventListener('click', () => showSection('createElection'));
    if (viewMyElectionsBtn) viewMyElectionsBtn.addEventListener('click', renderConductorDashboard);
    if (electionSearch) electionSearch.addEventListener('input', renderConductorDashboard);
    if (electionFilter) electionFilter.addEventListener('change', renderConductorDashboard);

    // Create election
    if (addCandidateBtn) addCandidateBtn.addEventListener('click', addCandidateInputGroup);
    if (createElectionForm) createElectionForm.addEventListener('submit', handleCreateElection);
    if (cancelElectionBtn) cancelElectionBtn.addEventListener('click', () => { showSection('conductorDashboard'); renderConductorDashboard(); });

    // Voter login
    if (voterLoginForm) voterLoginForm.addEventListener('submit', handleVoterLogin);
    if (voterLogoutBtn) voterLogoutBtn.addEventListener('click', handleLogout);
    if (voterElectionSearch) voterElectionSearch.addEventListener('input', renderVoterDashboard);
    if (voterElectionFilter) voterElectionFilter.addEventListener('change', renderVoterDashboard);

    if (importVotersBtn) importVotersBtn.addEventListener('click', handleImportVotersCsv);
    if (exportVotersBtn) exportVotersBtn.addEventListener('click', handleExportVotersCsv);

    // Voting common
    if (submitVoteBtn) submitVoteBtn.addEventListener('click', showConfirmModal);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (viewResultsBtn) viewResultsBtn.addEventListener('click', () => showSection('liveResults'));
    if (backToHomeBtn) backToHomeBtn.addEventListener('click', handleBackToHome);
    if (confirmYes) confirmYes.addEventListener('click', handleConfirmVote);
    if (confirmNo) confirmNo.addEventListener('click', hideConfirmModal);
}

// Enrollment
function handleEnrollmentSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('enrollName').value.trim();
    const email = document.getElementById('enrollEmail').value.trim();
    const phone = document.getElementById('enrollPhone').value.trim();
    const dob = document.getElementById('enrollDOB').value;
    const address = document.getElementById('enrollAddress').value.trim();
    const password = document.getElementById('enrollPassword').value;
    const photo = enrollPhotoInput.dataset.preview || '';

    if (!name || !email || !phone || !dob || !address || !password || !photo) {
        alert('Please fill all required fields and upload a photo.');
        return;
    }

    // Generate unique voterId
    const nextNumber = (state.voters.length + 1).toString().padStart(4, '0');
    const voterId = `VOT-${nextNumber}`;

    state.voters.push({ id: voterId, name, email, phone, dob, address, password, photoDataUrl: photo });
    saveToLocalStorage();
    alert(`Enrollment successful! Your Voter ID is ${voterId}`);
    showSection('voterLogin');
}

function handlePhotoPreview(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        enrollPhotoInput.dataset.preview = reader.result;
        photoPreview.innerHTML = `<img src="${reader.result}" alt="Preview" />`;
    };
    reader.readAsDataURL(file);
}

// Conductor login (simple demo auth: create if not exists)
function handleConductorLogin(e) {
    e.preventDefault();
    const email = document.getElementById('conductorEmail').value.trim();
    const password = document.getElementById('conductorPassword').value;
    if (!email || !password) { alert('Enter email and password'); return; }
    let user = state.conductors.find(c => c.email === email);
    if (!user) {
        user = { email, password, name: email.split('@')[0] };
        state.conductors.push(user);
    } else if (user.password !== password) {
        alert('Invalid credentials');
        return;
    }
    state.currentUser = { email };
    state.userType = 'conductor';
    saveToLocalStorage();
    showSection('conductorDashboard');
    renderConductorDashboard();
}

// Voter login
function handleVoterLogin(e) {
    e.preventDefault();
    const voterId = document.getElementById('voterIdLogin').value.trim();
    const password = document.getElementById('voterPassword').value;
    const voter = state.voters.find(v => v.id === voterId);
    if (!voter || voter.password !== password) {
        alert('Invalid Voter ID or Password');
        return;
    }
    state.currentUser = { voterId };
    state.userType = 'voter';
    saveToLocalStorage();
    showSection('voterDashboard');
    renderVoterDashboard();
}

// Handle Logout
function handleLogout() {
    stopTimer();
    state.currentUser = null;
    state.userType = null;
    state.selectedElection = null;
    state.selectedCandidate = null;
    saveToLocalStorage();
    showSection('hero');
}

// Handle Back to Home
function handleBackToHome() {
    if (state.userType === 'conductor') {
        showSection('conductorDashboard');
        renderConductorDashboard();
    } else if (state.userType === 'voter') {
        showSection('voterDashboard');
        renderVoterDashboard();
    } else {
        showSection('hero');
    }
}

// Show Section
function showSection(section) {
    // hide all
    [heroSection, featuresSection, loginTypeSection, enrollmentSection, conductorLoginSection, voterLoginSection,
     voterDashboard, conductorDashboard, createElectionSection, votingSection, resultsSection, liveResultsSection]
     .forEach(el => { if (el) el.classList.add('hidden'); });

    switch(section) {
        case 'hero':
            if (heroSection) heroSection.classList.remove('hidden');
            if (featuresSection) featuresSection.classList.remove('hidden');
            break;
        case 'loginType':
            if (loginTypeSection) loginTypeSection.classList.remove('hidden');
            break;
        case 'enrollment':
            if (enrollmentSection) enrollmentSection.classList.remove('hidden');
            break;
        case 'conductorLogin':
            if (conductorLoginSection) conductorLoginSection.classList.remove('hidden');
            break;
        case 'voterLogin':
            if (voterLoginSection) voterLoginSection.classList.remove('hidden');
            break;
        case 'conductorDashboard':
            if (conductorDashboard) conductorDashboard.classList.remove('hidden');
            break;
        case 'createElection':
            if (createElectionSection) createElectionSection.classList.remove('hidden');
            break;
        case 'voterDashboard':
            if (voterDashboard) voterDashboard.classList.remove('hidden');
            break;
        case 'voting':
            if (votingSection) votingSection.classList.remove('hidden');
            break;
        case 'results':
            if (resultsSection) resultsSection.classList.remove('hidden');
            break;
        case 'liveResults':
            if (liveResultsSection) liveResultsSection.classList.remove('hidden');
            renderLiveResults();
            break;
    }
}

// Render Candidates for selected election
function renderCandidates() {
    if (!state.selectedElection) return;
    const election = state.elections.find(e => e.id === state.selectedElection);
    if (!election) return;
    candidatesGrid.innerHTML = '';
    election.candidates.forEach(candidate => {
        const card = document.createElement('div');
        card.className = 'candidate-card';
        card.dataset.candidateId = candidate.id;
        const initials = candidate.name.split(' ').map(n => n[0]).join('');
        card.innerHTML = `
            <div class="candidate-avatar">${initials}</div>
            <h3 class="candidate-name">${candidate.name}</h3>
            <p class="candidate-party">${candidate.party || ''}</p>
            <p class="candidate-description">${candidate.description || ''}</p>
        `;
        card.addEventListener('click', () => selectCandidate(candidate.id));
        candidatesGrid.appendChild(card);
    });
}

// Select Candidate
function selectCandidate(candidateId) {
    state.selectedCandidate = candidateId;
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.classList.remove('selected');
        if (parseInt(card.dataset.candidateId) === candidateId) card.classList.add('selected');
    });
    if (submitVoteBtn) submitVoteBtn.disabled = false;
}

// Show Confirm Modal
function showConfirmModal() {
    if (!state.selectedCandidate || !state.selectedElection) { alert('Please select a candidate'); return; }
    const election = state.elections.find(e => e.id === state.selectedElection);
    const candidate = election?.candidates.find(c => c.id === state.selectedCandidate);
    const confirmDetails = document.getElementById('confirmCandidate');
    if (candidate && confirmDetails) {
        confirmDetails.innerHTML = `<h4>${candidate.name}</h4><p>${candidate.party || ''}</p>`;
    }
    if (confirmModal) confirmModal.classList.remove('hidden');
}

// Hide Confirm Modal
function hideConfirmModal() {
    confirmModal.classList.add('hidden');
}

// Handle Confirm Vote
function handleConfirmVote() {
    if (!state.selectedCandidate || !state.currentUser || state.userType !== 'voter' || !state.selectedElection) return;
    const election = state.elections.find(e => e.id === state.selectedElection);
    if (!election) return;
    // Prevent duplicate vote by same voter in same election
    const voterId = state.currentUser.voterId;
    if (election.votes?.some(v => v.voterId === voterId)) {
        alert('You have already voted in this election.');
        hideConfirmModal();
        return;
    }
    const candidate = election.candidates.find(c => c.id === state.selectedCandidate);
    candidate.votes = (candidate.votes || 0) + 1;
    election.votes = election.votes || [];
    election.votes.push({ voterId, candidateId: state.selectedCandidate, timestamp: new Date().toISOString() });
    saveToLocalStorage();
    hideConfirmModal();
    stopTimer();
    showSection('results');
    displayVoteConfirmation();
}

// Display Vote Confirmation
function displayVoteConfirmation() {
    const voteDetails = document.getElementById('voteDetails');
    const election = state.elections.find(e => e.id === state.selectedElection);
    const candidate = election?.candidates.find(c => c.id === state.selectedCandidate);
    const voter = state.voters.find(v => v.id === state.currentUser.voterId);
    if (candidate && voter && voteDetails) {
        voteDetails.innerHTML = `
            <p><strong>Voter:</strong> ${voter.name}</p>
            <p><strong>Voter ID:</strong> ${voter.id}</p>
            <p><strong>Election:</strong> ${election.title}</p>
            <p><strong>Voted For:</strong> ${candidate.name}</p>
            <p><strong>Party:</strong> ${candidate.party || ''}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        `;
    }
}

// Timer Functions
function startTimer() {
    state.timeRemaining = 1800; // Reset to 30 minutes
    updateTimerDisplay();
    state.timerInterval = setInterval(() => {
        state.timeRemaining--;
        updateTimerDisplay();
        if (state.timeRemaining <= 0) {
            stopTimer();
            alert('Time expired! Please submit your vote.');
        }
    }, 1000);
}

function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    timeRemainingEl.textContent = `Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Render Live Results (for selected election)
function renderLiveResults() {
    const election = state.elections.find(e => e.id === state.selectedElection) || state.elections[0];
    if (!election) return;
    const totalVotes = election.votes ? election.votes.length : 0;
    const turnoutRate = ((totalVotes / state.totalEligibleVoters) * 100).toFixed(1);
    document.getElementById('totalVotes').textContent = totalVotes;
    document.getElementById('turnoutRate').textContent = `${turnoutRate}%`;
    document.getElementById('candidateCount').textContent = election.candidates.length;
    const sorted = [...election.candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    const resultsGrid = document.getElementById('resultsGrid');
    resultsGrid.innerHTML = '';
    sorted.forEach((candidate, index) => {
        const votes = candidate.votes || 0;
        const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
        const progressWidth = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
        const isWinner = index === 0 && votes > 0;
        const initials = candidate.name.split(' ').map(n => n[0]).join('');
        const div = document.createElement('div');
        div.className = `result-item ${isWinner ? 'winner' : ''}`;
        div.innerHTML = `
            <div class="result-header">
                <div class="result-candidate">
                    <div class="result-avatar">${initials}</div>
                    <div class="result-info">
                        <h4>${candidate.name}</h4>
                        <p>${candidate.party || ''}</p>
                    </div>
                </div>
                <div class="result-votes">
                    <div class="votes">${votes}</div>
                    <div class="percentage">${percentage}%</div>
                </div>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${progressWidth}%"></div></div>
        `;
        resultsGrid.appendChild(div);
    });
}

// Conductor Dashboard
function renderConductorDashboard() {
    if (!conductorContent) return;
    const myEmail = state.currentUser?.email;
    let myElections = state.elections.filter(e => e.createdByEmail === myEmail);
    const q = (electionSearch?.value || '').toLowerCase();
    const f = electionFilter?.value || 'all';
    if (q) {
        myElections = myElections.filter(e => (e.title + ' ' + e.description).toLowerCase().includes(q));
    }
    if (f !== 'all') {
        myElections = myElections.filter(e => getElectionStatus(e) === f);
    }
    conductorContent.innerHTML = myElections.length === 0
        ? '<p class="subtitle">No elections found.</p>'
        : myElections.map(renderElectionCard).join('');
    wireConductorActions();
}

function renderElectionCard(election) {
    const status = getElectionStatus(election);
    const statusClass = status === 'ongoing' ? 'status-ongoing' : status === 'completed' ? 'status-completed' : status === 'upcoming' ? 'status-upcoming' : 'status-upcoming';
    return `
        <div class="election-card">
            <span class="election-status ${statusClass}">${status.toUpperCase()}</span>
            <h3>${election.title}</h3>
            <p>${election.description}</p>
            <div class="election-meta">
                <span>Type: ${election.type}</span>
                <span>Start: ${new Date(election.start).toLocaleString()}</span>
                <span>End: ${new Date(election.end).toLocaleString()}</span>
                <span>Candidates: ${election.candidates.length}</span>
                <span>Total Votes: ${election.votes?.length || 0}</span>
            </div>
            <div class="actions">
                <button class="btn btn-secondary" data-action="edit" data-id="${election.id}">Edit</button>
                <button class="btn" data-action="delete" data-id="${election.id}">Delete</button>
                ${status === 'paused' ? `<button class="btn btn-success" data-action="resume" data-id="${election.id}">Resume</button>` : `<button class="btn btn-secondary" data-action="pause" data-id="${election.id}">Pause</button>`}
                ${status !== 'completed' ? `<button class="btn btn-primary" data-action="close" data-id="${election.id}">Close Now</button>` : ''}
            </div>
        </div>
    `;
}

function wireConductorActions() {
    conductorContent.querySelectorAll('[data-action]').forEach(btn => {
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        btn.addEventListener('click', () => handleElectionAction(action, id));
    });
}

function getElectionStatus(election) {
    if (election.paused) return 'paused';
    const now = new Date();
    const start = new Date(election.start);
    const end = new Date(election.end);
    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'ongoing';
}

function handleElectionAction(action, id) {
    const idx = state.elections.findIndex(e => e.id === id);
    if (idx === -1) return;
    const election = state.elections[idx];
    if (action === 'delete') {
        if (!confirm('Delete this election?')) return;
        state.elections.splice(idx, 1);
        saveToLocalStorage();
        renderConductorDashboard();
    } else if (action === 'pause') {
        election.paused = true;
        saveToLocalStorage();
        renderConductorDashboard();
    } else if (action === 'resume') {
        delete election.paused;
        saveToLocalStorage();
        renderConductorDashboard();
    } else if (action === 'close') {
        election.end = new Date().toISOString();
        saveToLocalStorage();
        renderConductorDashboard();
    } else if (action === 'edit') {
        editingElectionId = id;
        loadElectionIntoForm(election);
        showSection('createElection');
    }
}

function addCandidateInputGroup() {
    const wrapper = document.createElement('div');
    wrapper.className = 'candidate-input-group';
    wrapper.innerHTML = `
        <input type="text" class="candidate-name" placeholder="Candidate/Party Name" required>
        <input type="text" class="candidate-party" placeholder="Party/Affiliation">
        <textarea class="candidate-description" placeholder="Description" rows="2"></textarea>
        <button type="button" class="btn" data-remove-candidate>Remove</button>
    `;
    candidatesContainer.appendChild(wrapper);
}

if (candidatesContainer) {
    candidatesContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('[data-remove-candidate]')) {
            const group = target.closest('.candidate-input-group');
            if (group && candidatesContainer.children.length > 1) {
                group.remove();
            }
        }
    });
}

function handleCreateElection(e) {
    e.preventDefault();
    const title = document.getElementById('electionTitle').value.trim();
    const description = document.getElementById('electionDescription').value.trim();
    const start = document.getElementById('electionStartDate').value;
    const end = document.getElementById('electionEndDate').value;
    const type = document.getElementById('electionType').value;
    const rules = {
        allowMultipleVotes: document.getElementById('allowMultipleVotes').checked,
        requirePhoto: document.getElementById('requirePhoto').checked,
        secretBallot: document.getElementById('secretBallot').checked,
        showLiveResults: document.getElementById('showLiveResults').checked,
    };
    const candidateEls = candidatesContainer.querySelectorAll('.candidate-input-group');
    const candidates = Array.from(candidateEls).map((el, i) => ({
        id: i + 1,
        name: el.querySelector('.candidate-name').value.trim(),
        party: el.querySelector('.candidate-party').value.trim(),
        description: el.querySelector('.candidate-description').value.trim(),
        votes: 0,
    })).filter(c => c.name);
    if (!title || !description || !start || !end || !type || candidates.length === 0) {
        alert('Please fill all required fields and add at least one candidate.');
        return;
    }
    if (editingElectionId) {
        const idx = state.elections.findIndex(e => e.id === editingElectionId);
        if (idx !== -1) {
            state.elections[idx] = { ...state.elections[idx], title, description, type, start, end, rules, candidates };
        }
    } else {
        const id = `EL-${Date.now()}`;
        state.elections.push({ id, title, description, type, start, end, rules, candidates, createdByEmail: state.currentUser.email, votes: [] });
    }
    saveToLocalStorage();
    alert('Election created successfully');
    showSection('conductorDashboard');
    renderConductorDashboard();
    createElectionForm.reset();
    candidatesContainer.innerHTML = '';
    addCandidateInputGroup();
    editingElectionId = null;
}

function loadElectionIntoForm(election) {
    document.getElementById('electionTitle').value = election.title;
    document.getElementById('electionDescription').value = election.description;
    document.getElementById('electionStartDate').value = election.start.slice(0,16);
    document.getElementById('electionEndDate').value = election.end.slice(0,16);
    document.getElementById('electionType').value = election.type;
    document.getElementById('allowMultipleVotes').checked = !!election.rules?.allowMultipleVotes;
    document.getElementById('requirePhoto').checked = !!election.rules?.requirePhoto;
    document.getElementById('secretBallot').checked = election.rules?.secretBallot !== false;
    document.getElementById('showLiveResults').checked = !!election.rules?.showLiveResults;
    candidatesContainer.innerHTML = '';
    election.candidates.forEach(c => {
        const wrapper = document.createElement('div');
        wrapper.className = 'candidate-input-group';
        wrapper.innerHTML = `
            <input type="text" class="candidate-name" placeholder="Candidate/Party Name" value="${c.name}" required>
            <input type="text" class="candidate-party" placeholder="Party/Affiliation" value="${c.party || ''}">
            <textarea class="candidate-description" placeholder="Description" rows="2">${c.description || ''}</textarea>
            <button type="button" class="btn" data-remove-candidate>Remove</button>
        `;
        candidatesContainer.appendChild(wrapper);
    });
}

// Voter Dashboard
function renderVoterDashboard() {
    // Fill voter info
    const voter = state.voters.find(v => v.id === state.currentUser.voterId);
    if (voterPhotoEl && voter?.photoDataUrl) voterPhotoEl.src = voter.photoDataUrl;
    if (voterNameDisplay) voterNameDisplay.textContent = voter?.name || '';
    if (voterIdDisplay) voterIdDisplay.textContent = voter?.id || '';

    // List elections with status and participate button
    electionsListContainer.innerHTML = '';
    const now = new Date();
    const sorted = [...state.elections].sort((a,b) => new Date(a.start) - new Date(b.start));
    const q = (voterElectionSearch?.value || '').toLowerCase();
    const f = voterElectionFilter?.value || 'all';
    sorted.forEach(election => {
        if (q && !(election.title + ' ' + election.description).toLowerCase().includes(q)) return;
        const start = new Date(election.start);
        const end = new Date(election.end);
        let status = 'upcoming';
        if (election.paused) status = 'upcoming';
        if (now >= start && now <= end) status = 'ongoing';
        else if (now > end) status = 'completed';
        if (f !== 'all' && status !== f) return;
        const statusClass = status === 'ongoing' ? 'status-ongoing' : status === 'completed' ? 'status-completed' : 'status-upcoming';
        const card = document.createElement('div');
        card.className = 'election-card';
        card.innerHTML = `
            <span class="election-status ${statusClass}">${status.toUpperCase()}</span>
            <h3>${election.title}</h3>
            <p>${election.description}</p>
            <div class="election-meta">
                <span>Type: ${election.type}</span>
                <span>Start: ${new Date(election.start).toLocaleString()}</span>
                <span>End: ${new Date(election.end).toLocaleString()}</span>
            </div>
            <div>
                ${status === 'ongoing' ? '<button class="btn btn-primary">Participate</button>' : '<button class="btn btn-secondary">View</button>'}
            </div>
        `;
        const btn = card.querySelector('button');
        btn.addEventListener('click', () => {
            state.selectedElection = election.id;
            saveToLocalStorage();
            if (status === 'ongoing') {
                // go to voting
                showSection('voting');
                renderCandidates();
                submitVoteBtn.disabled = true;
                startTimer();
            } else {
                // show results
                showSection('liveResults');
                renderLiveResults();
            }
        });
        electionsListContainer.appendChild(card);
    });
}

function handleImportVotersCsv() {
    const file = votersCsvInput?.files?.[0];
    if (!file) { alert('Choose a CSV file'); return; }
    const reader = new FileReader();
    reader.onload = () => {
        const text = reader.result;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) { alert('CSV seems empty'); return; }
        const headers = lines[0].split(',').map(h => h.trim());
        const idx = (name) => headers.indexOf(name);
        let imported = 0;
        for (let i=1;i<lines.length;i++) {
            const cols = lines[i].split(',');
            const id = cols[idx('id')]?.trim();
            const name = cols[idx('name')]?.trim();
            const email = cols[idx('email')]?.trim();
            const phone = cols[idx('phone')]?.trim();
            const dob = cols[idx('dob')]?.trim();
            const address = cols[idx('address')]?.trim();
            const password = cols[idx('password')]?.trim() || 'password';
            const photoDataUrl = cols[idx('photoDataUrl')]?.trim() || '';
            if (!name || !email) continue;
            let voterId = id;
            if (!voterId) {
                const nextNumber = (state.voters.length + 1).toString().padStart(4, '0');
                voterId = `VOT-${nextNumber}`;
            }
            if (state.voters.find(v => v.id === voterId)) continue;
            state.voters.push({ id: voterId, name, email, phone, dob, address, password, photoDataUrl });
            imported++;
        }
        saveToLocalStorage();
        alert(`Imported ${imported} voters`);
    };
    reader.readAsText(file);
}

function handleExportVotersCsv() {
    const headers = ['id','name','email','phone','dob','address','password','photoDataUrl'];
    const rows = [headers.join(',')].concat(state.voters.map(v => headers.map(h => (v[h]||'').toString().replace(/,/g,' ')).join(',')));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voters.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
