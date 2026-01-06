/**
 * PEER-2-PEER PRO - MASTER STUDENT SCRIPT
 * Consolidates: Security, Library, Live Classes, Ratings, and Forum.
 */

let allFiles = []; 
let allLiveLessons = [];

// --- 1. INITIALIZATION & SECURITY ---
document.addEventListener('DOMContentLoaded', async () => {
    const userType = localStorage.getItem('userType');
    const userName = localStorage.getItem('userName');
    const schoolId = localStorage.getItem('school_id') || 'public';

    // Kick out if not a student
    if (!userName || userType !== 'student') {
        alert("Access Denied: Students only.");
        window.location.href = "login.html";
        return;
    }

    // Update UI with student's name
    const display = document.getElementById('studentNameDisplay');
    if (display) display.innerText = userName;

    // Load all data from server
    await fetchMaterials();
    await fetchLiveSessions(schoolId);
});

// --- 2. FORUM FUNCTION (The "Ask a Question" feature) ---
async function submitToForum() {
    const questionText = document.getElementById('forumQuestion').value;
    const userName = localStorage.getItem('userName');
    const schoolId = localStorage.getItem('school_id');

    let allFiles = []; 
let allLiveLessons = [];

// --- 1. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    const userName = localStorage.getItem('userName');
    const schoolId = localStorage.getItem('school_id') || 'public';

    if (!userName) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById('studentNameDisplay').innerText = userName;

    // Load Data
    await fetchMaterials(schoolId);
    await fetchLiveSessions(schoolId);
});

// --- 2. RESOURCE LIBRARY LOGIC ---
async function fetchMaterials(schoolId) {
    try {
        // We pass school_id to the server to get relevant files
        const res = await fetch(`/api/files?school_id=${schoolId}`);
        allFiles = await res.json();
        
        console.log("Files received from server:", allFiles); // Debugging
        renderFiles(allFiles);
    } catch (err) {
        console.error("Failed to load materials:", err);
        document.getElementById('fileFeed').innerHTML = "<p>Error loading library.</p>";
    }
}

function renderFiles(files) {
    const feed = document.getElementById('fileFeed');
    const countDisplay = document.getElementById('fileCount');
    
    if (!feed) return;
    feed.innerHTML = '';
    
    if (countDisplay) countDisplay.innerText = `${files.length} Materials Found`;

    if (files.length === 0) {
        feed.innerHTML = '<div class="text-dim">No documents found in this category.</div>';
        return;
    }

    files.forEach(file => {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            <div class="file-icon-box"><i class="fas ${getFileIcon(file.originalName)}"></i></div>
            <div class="file-info">
                <h4 class="file-title">${file.displayName}</h4>
                <p class="file-meta">By: ${file.uploadedBy || 'Peer'}</p>
                <div class="rating-box">
                    <span class="stars">
                        <i class="fas fa-star"></i> ${file.avgRating || '0.0'}
                    </span>
                </div>
            </div>
            <a href="/uploads/${file.originalName}" download class="btn-download-luxury">
                <i class="fas fa-download"></i> Download
            </a>
        `;
        feed.appendChild(card);
    });
}

// --- 3. LIVE LESSONS WITH PAYMENT CHECK ---
async function fetchLiveSessions(schoolId) {
    try {
        const res = await fetch(`/api/active-session?school_id=${schoolId}`);
        const data = await res.json();
        
        // Convert single object to array for the grid
        allLiveLessons = data.active === 1 ? [data] : [];
        renderLiveGrid(allLiveLessons);
    } catch (err) {
        console.error("Live fetch error:", err);
    }
}

function renderLiveGrid(lessons) {
    const grid = document.getElementById('liveGrid');
    if (!grid) return;

    if (lessons.length === 0) {
        grid.innerHTML = '<p class="text-dim">No live broadcasts at the moment.</p>';
        return;
    }

    grid.innerHTML = lessons.map(l => `
        <div class="live-card-mini">
            <div class="live-tag"><span class="pulse"></span> LIVE NOW</div>
            <h4>${l.topic}</h4>
            <p class="text-dim">Mentor: ${l.tutorName || 'Tutor'}</p>
            <button onclick="attemptJoinLive('${l.link}')" class="btn-ask" style="margin-top:10px">
                <i class="fas fa-video"></i> Join Studio
            </button>
        </div>
    `).join('');
}

async function attemptJoinLive(link) {
    const name = localStorage.getItem('userName');
    const res = await fetch(`/api/user-status?name=${name}`);
    const user = await res.json();

    if (user.paymentStatus === 'paid') {
        window.open(link, '_blank');
    } else {
        alert("🔒 Access Denied: Please complete your subscription to join live lessons.");
    }
}

// --- 4. FILTERS & SEARCH ---
function filterAll() {
    const query = document.getElementById('globalSearch').value.toLowerCase();
    const filtered = allFiles.filter(f => 
        f.displayName.toLowerCase().includes(query) || 
        (f.subject && f.subject.toLowerCase().includes(query))
    );
    renderFiles(filtered);
}

function filterByCategory(category) {
    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === category || (category === 'All' && btn.innerText === 'All Resources'));
    });

    const filtered = (category === 'All') 
        ? allFiles 
        : allFiles.filter(f => f.subject === category);
    
    renderFiles(filtered);
}

// --- 5. UTILS ---
function getFileIcon(filename) {
    if (!filename) return 'fa-file';
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'fa-file-pdf';
    if (ext === 'doc' || ext === 'docx') return 'fa-file-word';
    return 'fa-file-alt';
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

    if (!questionText.trim()) {
        alert("Please enter a question.");
        return;
    }

    try {
        const res = await fetch('/api/forum/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: userName,
                content: questionText,
                school_id: schoolId,
                date: new Date().toLocaleString()
            })
        });

        if (res.ok) {
            alert("Success! Your question is now on the community forum.");
            document.getElementById('forumQuestion').value = ''; 
        }
    } catch (err) {
        console.error("Forum post failed:", err);
    }
}

// --- 3. RESOURCE LIBRARY & RATING LOGIC ---
async function fetchMaterials() {
    try {
        const res = await fetch('/api/files');
        allFiles = await res.json();
        renderFiles(allFiles);
    } catch (err) {
        console.error("Files load error:", err);
    }
}
/**
 * PEER-2-PEER PRO - MASTER STUDENT SCRIPT
 * Final Cleaned Version: Security, Library, Live Classes, and Community Forum.
 */

//let allFiles = []; 
//let allLiveLessons = [];

// --- 1. INITIALIZATION & AUTHENTICATION ---
document.addEventListener('DOMContentLoaded', async () => {
    const userType = localStorage.getItem('userType');
    const userName = localStorage.getItem('userName');
    const schoolId = localStorage.getItem('school_id') || 'public';

    // Security Gate
    if (!userName || userType !== 'student') {
        alert("Access Denied: Please log in as a student.");
        window.location.href = "login.html";
        return;
    }

    // Update Profile UI
    const nameDisplay = document.getElementById('studentNameDisplay');
    if (nameDisplay) nameDisplay.innerText = userName;

    // Initial Data Load
    await fetchMaterials(schoolId);
    await refreshLiveDashboard(schoolId);

    // FEATURE: Auto-refresh Live Sessions every 30 seconds
    setInterval(() => refreshLiveDashboard(schoolId), 30000);
});

// --- 2. LIVE STUDIO LOGIC (With Payment Wall) ---
async function refreshLiveDashboard(schoolId) {
    try {
        const res = await fetch(`/api/active-sessions?school_id=${schoolId}`);
        allLiveLessons = await res.json();
        renderLiveGrid(allLiveLessons);
    } catch (err) {
        console.error("Live fetch error:", err);
    }
}

function renderLiveGrid(lessons) {
    const grid = document.getElementById('liveGrid');
    if (!grid) return;

    if (lessons.length === 0) {
        grid.innerHTML = '<div class="loading-state">No active studios right now.</div>';
        return;
    }

    grid.innerHTML = lessons.map(l => `
        <div class="live-card-mini">
            <div class="live-tag"><span class="pulse"></span> LIVE NOW</div>
            <h4>${l.topic}</h4>
            <p class="text-dim">Mentor: ${l.tutorName}</p>
            <p class="text-dim">Subject: ${l.subject}</p>
            <button onclick="attemptJoinLive('${l.link}')" class="btn-ask" style="margin-top:10px">
                <i class="fas fa-video"></i> Join Studio
            </button>
        </div>
    `).join('');
}

async function attemptJoinLive(meetingLink) {
    const userName = localStorage.getItem('userName');
    try {
        const res = await fetch(`/api/user-status?name=${userName}`);
        const user = await res.json();

        if (user.paymentStatus === 'paid') {
            window.open(meetingLink, '_blank');
        } else if (user.paymentStatus === 'pending') {
            alert("🔒 Access Pending: Your payment is being verified.");
        } else {
            alert("🔒 Premium Feature: Please subscribe to join live studios.");
            window.location.href = "payment.html";
        }
    } catch (err) {
        alert("Error verifying subscription status.");
    }
}

// --- 3. RESOURCE LIBRARY & RATINGS ---
async function fetchMaterials(schoolId) {
    try {
        const res = await fetch(`/api/files?school_id=${schoolId}`);
        allFiles = await res.json();
        renderFiles(allFiles);
    } catch (err) {
        console.error("Library load error:", err);
    }
}

function renderFiles(files) {
    const feed = document.getElementById('fileFeed');
    const countDisplay = document.getElementById('fileCount');
    if (!feed) return;

    feed.innerHTML = '';
    if (countDisplay) countDisplay.innerText = `${files.length} Resources`;

    files.forEach(file => {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            <div class="file-icon-box"><i class="fas ${getFileIcon(file.originalName)}"></i></div>
            <div class="file-info">
                <h4 class="file-title">${file.displayName}</h4>
                <p class="file-meta">By: ${file.uploadedBy}</p>
                <div class="rating-box">
                    <span class="stars" onclick="submitRating(${file.id}, 5)">
                        <i class="fas fa-star"></i> ${file.avgRating || '5.0'}
                    </span>
                </div>
            </div>
            <a href="/uploads/${file.originalName}" download class="btn-download-luxury">
                <i class="fas fa-download"></i> Download
            </a>
        `;
        feed.appendChild(card);
    });
}

async function submitRating(fileId, score) {
    try {
        await fetch('/api/rate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileId, rating: score })
        });
        alert("Thanks for the rating!");
        fetchMaterials(localStorage.getItem('school_id'));
    } catch (err) { console.error("Rating failed"); }
}

// --- 4. COMMUNITY FORUM LOGIC ---
async function submitToForum() {
    const questionText = document.getElementById('forumQuestion').value;
    const userName = localStorage.getItem('userName');
    const schoolId = localStorage.getItem('school_id') || 'public';

    if (!questionText.trim()) {
        alert("Please enter a question.");
        return;
    }

    try {
        const res = await fetch('/api/forum/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: userName,
                text: questionText,
                school_id: schoolId,
                date: new Date().toLocaleString()
            })
        });

        if (res.ok) {
            alert("Success! Your question is live.");
            document.getElementById('forumQuestion').value = ''; 
            window.location.href = "forum.html";
        }
    } catch (err) {
        console.error("Forum error:", err);
    }
}

// --- 5. SEARCH & UTILS ---
function filterAll() {
    const query = document.getElementById('globalSearch').value.toLowerCase();
    const filtered = allFiles.filter(f => 
        f.displayName.toLowerCase().includes(query) || 
        f.subject?.toLowerCase().includes(query)
    );
    renderFiles(filtered);
}

function filterByCategory(cat) {
    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === cat);
    });
    const filtered = (cat === 'All') ? allFiles : allFiles.filter(f => f.subject === cat);
    renderFiles(filtered);
}

function getFileIcon(filename) {
    const ext = filename?.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'fa-file-pdf';
    if (ext === 'docx' || ext === 'doc') return 'fa-file-word';
    return 'fa-file-alt';
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}
function renderFiles(files) {
    const feed = document.getElementById('fileFeed');
    const countDisplay = document.getElementById('fileCount');
    
    if (!feed) return;
    feed.innerHTML = '';
    
    if (countDisplay) countDisplay.innerText = `${files.length} Materials Found`;

    files.forEach(file => {
        const avg = file.avgRating || "0.0";
        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            <div class="file-icon"><i class="fas ${getFileIcon(file.originalName)}"></i></div>
            <div class="file-info">
                <h4>${file.displayName}</h4>
                <p>By: <strong>${file.uploadedBy}</strong></p>
                <div class="rating-box">
                    <span class="stars" onclick="handleStarClick(event, ${file.id})">
                        <i class="far fa-star" data-value="1"></i>
                        <i class="far fa-star" data-value="2"></i>
                        <i class="far fa-star" data-value="3"></i>
                        <i class="far fa-star" data-value="4"></i>
                        <i class="far fa-star" data-value="5"></i>
                    </span>
                    <small>(${avg})</small>
                </div>
            </div>
            <a href="/uploads/${file.originalName}" download class="btn-download-luxury">
                <i class="fas fa-download"></i> Download
            </a>
        `;
        feed.appendChild(card);
    });
}

async function handleStarClick(event, fileId) {
    const star = event.target;
    if (!star.dataset.value) return;

    try {
        const res = await fetch('/api/rate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileId: fileId, rating: star.dataset.value })
        });
        if (res.ok) {
            alert("Thanks for rating!");
            fetchMaterials(); // Refresh to show new average
        }
    } catch (err) { console.error("Rating error:", err); }
}

// --- 4. LIVE LESSON LOGIC ---
async function fetchLiveSessions(schoolId) {
    try {
        const res = await fetch(`/api/active-sessions?school_id=${schoolId}`);
        allLiveLessons = await res.json();
        renderLiveGrid(allLiveLessons);
    } catch (err) { console.error("Live fetch error:", err); }
}

function renderLiveGrid(lessons) {
    const grid = document.getElementById('liveGrid');
    if (!grid) return;

    if (lessons.length === 0) {
        grid.innerHTML = '<p class="text-dim">No live broadcasts at the moment.</p>';
        return;
    }

    grid.innerHTML = lessons.map(l => `
        <div class="live-card-mini">
            <div class="live-tag"><span class="pulse"></span> LIVE NOW</div>
            <h4>${l.topic}</h4>
            <p>Mentor: ${l.tutorName}</p>
            <a href="${l.link}" target="_blank" class="btn-download-luxury" style="padding:8px">Join Studio</a>
        </div>
    `).join('');
}

// --- 5. SEARCH & FILTERS ---
function filterAll() {
    const query = document.getElementById('globalSearch').value.toLowerCase();
    const filtered = allFiles.filter(f => 
        f.displayName.toLowerCase().includes(query) || 
        f.uploadedBy.toLowerCase().includes(query)
    );
    renderFiles(filtered);
}

function filterByCategory(cat) {
    // UI Update
    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === cat);
    });

    const filtered = (cat === 'All') ? allFiles : allFiles.filter(f => f.subject === cat);
    renderFiles(filtered);
}

// --- 6. UTILITIES ---
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'fa-file-pdf';
    if (ext === 'docx' || ext === 'doc') return 'fa-file-word';
    return 'fa-file-alt';
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}
// Global store for live lessons to allow searching
//let allLiveLessons = [];

// --- FETCH LIVE LESSONS ---
async function fetchLiveSessions(schoolId) {
    try {
        const res = await fetch(`/api/active-sessions?school_id=${schoolId}`);
        allLiveLessons = await res.json();
        renderLiveGrid(allLiveLessons);
    } catch (err) { console.error("Live fetch error:", err); }
}

// --- SEARCH LIVE LESSONS ---
function filterLive() {
    const query = document.getElementById('liveSearch').value.toLowerCase();
    const filtered = allLiveLessons.filter(l => 
        l.topic.toLowerCase().includes(query) || 
        l.tutorName.toLowerCase().includes(query)
    );
    renderLiveGrid(filtered);
}

// --- RENDER LIVE GRID ---
function renderLiveGrid(lessons) {
    const grid = document.getElementById('liveGrid');
    if (!grid) return;

    if (lessons.length === 0) {
        grid.innerHTML = '<p class="text-dim">No matching live lessons found.</p>';
        return;
    }

    grid.innerHTML = lessons.map(l => `
        <div class="live-card-mini">
            <div class="live-tag"><span class="pulse"></span> LIVE NOW</div>
            <h4>${l.topic}</h4>
            <p class="text-dim">Mentor: ${l.tutorName}</p>
            <p class="text-dim">Subject: ${l.subject}</p>
            <button onclick="attemptJoinLive('${l.link}')" class="btn-ask" style="margin-top:10px">
                <i class="fas fa-door-open"></i> Join Lesson
            </button>
        </div>
    `).join('');
}

// --- SECURITY: CHECK PAYMENT BEFORE JOINING ---
async function attemptJoinLive(meetingLink) {
    const userName = localStorage.getItem('userName');

    try {
        // Fetch the latest user data from the server
        const res = await fetch(`/api/user-status?name=${userName}`);
        const user = await res.json();

        // Check the database field paymentStatus
        if (user.paymentStatus === 'paid') {
            window.open(meetingLink, '_blank');
        } else if (user.paymentStatus === 'pending') {
            alert("🔒 Access Pending: Your payment is still being verified.");
        } else {
            alert("🔒 Access Denied: This live lesson requires a paid subscription.");
            window.location.href = "payment.html"; // Redirect to payment page
        }
    } catch (err) {
        console.error("Payment check failed:", err);
        alert("Error verifying access status.");
    }
}