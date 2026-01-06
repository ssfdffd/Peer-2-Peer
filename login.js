// --- 1. SIDEBAR TOGGLE LOGIC ---
const openBtn = document.getElementById('openNav');
const closeBtn = document.getElementById('closeNav');
const sideMenu = document.getElementById('side-menu');

if (openBtn && sideMenu) {
    openBtn.onclick = () => sideMenu.classList.add('active');
}
if (closeBtn && sideMenu) {
    closeBtn.onclick = () => sideMenu.classList.remove('active');
}

// --- 2. LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const loginData = {
            name: document.getElementById('loginUser').value, 
            password: document.getElementById('loginPass').value
        };

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const data = await res.json();

            if (res.ok) {
                // Save complete session data
                localStorage.setItem('userName', data.name);
                localStorage.setItem('userType', data.userType); 
                localStorage.setItem('school_id', data.school_id || 'public');

                alert("Welcome, " + data.name);

                // --- REDIRECTION LOGIC (FIXED FILENAMES) ---
                
                // 1. Check for Super Admin
                if (data.name === "Admin_User") {
                    // FIXED: Changed from admin.html to admin-portal.html
                    window.location.href = "admin-portal.html"; 
                } 
                // 2. Check for Tutors/Teachers
                else if (data.userType === 'tutor') {
                    // Make sure this file is also named correctly in your folder
                    window.location.href = "tutor-portal.html"; 
                } 
                // 3. Regular Students
                else if (data.userType === 'student') {
                    window.location.href = "student-portal.html";
                } 
                else {
                    window.location.href = "index.html"; 
                }
            } else {
                alert("Login Failed: " + data.message);
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Connection error. Check if the server is running.");
        }
    };
}

// --- 3. SIGNUP LOGIC ---
const signupForm = document.getElementById('signupForm');
const signupBtn = document.getElementById('signupBtn'); 

if (signupForm) {
    signupForm.onsubmit = async (e) => {
        e.preventDefault();

        if (signupBtn) {
            signupBtn.classList.add('loading');
            signupBtn.disabled = true;
        }

        const userData = {
            name: document.getElementById('regName').value,
            surname: document.getElementById('regSurname').value,
            age: document.getElementById('regAge').value,
            phone: document.getElementById('regPhone').value,
            school: document.getElementById('regSchool').value,
            schoolCode: document.getElementById('regSchoolCode')?.value || "public",
            email: document.getElementById('regEmail').value,
            userType: document.getElementById('regUserType').value,
            password: document.getElementById('regPass').value
        };

        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await res.json();

            if (res.ok) {
                alert("✅ Registration successful! You can now login.");
                window.location.href = "login.html"; 
            } else {
                alert("⚠️ Signup Failed: " + data.message);
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("❌ Connection Error.");
        } finally {
            if (signupBtn) {
                signupBtn.classList.remove('loading');
                signupBtn.disabled = false;
            }
        }
    };
}

// --- 4. GLOBAL LOGOUT UTILITY ---
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}