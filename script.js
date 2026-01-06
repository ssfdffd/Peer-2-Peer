/**
 * PEER-2-PEER PROJECT - MAIN HOME PAGE SCRIPT
 */

// --- 1. SIDEBAR TOGGLE LOGIC ---
const openBtn = document.getElementById('openNav');
const closeBtn = document.getElementById('closeNav');
const sideMenu = document.getElementById('side-menu');

if (openBtn && sideMenu) {
    openBtn.addEventListener('click', () => sideMenu.classList.add('active'));
}

if (closeBtn && sideMenu) {
    closeBtn.addEventListener('click', () => sideMenu.classList.remove('active'));
}

// --- 2. AUTHENTICATION & UI INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName');
    const userType = localStorage.getItem('userType');
    const navRight = document.querySelector('.nav-right');

    // REDIRECTION: If logged in, send to portals immediately
    if (userName && userType) {
        if (userType === 'tutor') {
            window.location.href = "tutor-portal.html";
            return; 
        } else if (userType === 'student') {
            window.location.href = "student-portal.html";
            return;
        }
    }

    // GUEST UI: If NOT logged in, show the styled Login Button in the upload zone
    checkAuth();

    // NAV UPDATE: If logged in (and for some reason not redirected), update Nav bar
    if (userName && navRight) {
        navRight.innerHTML = `
            <span class="user-welcome" style="color:white; margin-right:10px;">Hi, ${userName}</span>
            <a href="profile.html" class="nav-link" style="color:white; margin-right:10px;"><i class="fas fa-user-circle"></i></a>
            <button onclick="logout()" class="logout-link" style="background:none; border:1px solid white; color:white; cursor:pointer; padding:5px 10px; border-radius:5px;">Logout</button>
            <span id="openNav" class="menu-toggle" style="margin-left:10px; cursor:pointer;">☰</span>
        `;
    }
});

// --- 3. THE CHECK AUTH FUNCTION (Styled Button Logic) ---
function checkAuth() {
    const dropZone = document.getElementById('drop-zone');
    const userName = localStorage.getItem('userName');
    
    if (!userName && dropZone) {
        // Creates the professional styled button you asked for
        dropZone.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center;">
                <i class="fas fa-lock" style="font-size: 50px; color: #cbd5e0; margin-bottom: 15px;"></i>
                <p style="color: #4a5568; font-size: 1.1rem; margin-bottom: 20px;">
                    Please login to share and upload study materials.
                </p>
                <a href="login.html" style="
                    background-color: #4a90e2;
                    color: white;
                    padding: 12px 30px;
                    border-radius: 25px;
                    text-decoration: none;
                    font-weight: bold;
                    transition: transform 0.2s, background-color 0.2s;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    display: inline-block;
                " onmouseover="this.style.backgroundColor='#357abd'; this.style.transform='scale(1.05)'" 
                   onmouseout="this.style.backgroundColor='#4a90e2'; this.style.transform='scale(1)'">
                    Login to Upload
                </a>
            </div>`;
        
        // Prevent clicking the zone from opening the file picker for guests
        dropZone.style.pointerEvents = "auto";
        dropZone.style.cursor = "default";
        dropZone.onclick = (e) => {
            if (e.target.tagName !== 'A') {
                e.preventDefault();
                e.stopPropagation();
            }
        };
    }
}

// --- 4. LOGOUT FUNCTION ---
function logout() {
    localStorage.clear(); 
    window.location.href = 'login.html';
}

// --- 5. UPLOAD LOGIC ---
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('fileInput');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const customFileName = document.getElementById('customFileName');

async function handleUpload(file) {
    const userName = localStorage.getItem('userName');
    
    // Safety check: Don't upload if not logged in
    if (!userName) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const displayName = customFileName ? customFileName.value.trim() : "Untitled Document";
    const formData = new FormData();
    formData.append('studyMaterial', file);
    formData.append('displayName', displayName);
    formData.append('uploadedBy', userName); 

    if (progressContainer) progressContainer.style.display = 'block';

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && progressBar) {
            const percent = Math.round((e.loaded / e.total) * 100);
            progressBar.style.width = percent + '%';
        }
    });

    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (progressBar) progressBar.style.backgroundColor = '#32cd32'; 
                setTimeout(() => { window.location.href = "resources.html"; }, 800);
            } else {
                alert("Upload failed. Ensure you are logged in.");
                if (progressContainer) progressContainer.style.display = 'none';
            }
        }
    };

    xhr.open('POST', '/upload', true);
    xhr.send(formData);
}

// --- 6. EVENT LISTENERS ---
if (dropZone && fileInput) {
    // Only allow clicking to upload if the user IS logged in
    dropZone.addEventListener('click', () => {
        if (localStorage.getItem('userName')) {
            fileInput.click();
        }
    });

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (localStorage.getItem('userName') && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) handleUpload(fileInput.files[0]);
    });
}