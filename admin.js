/**
 * PEER-2-PEER PRO - MASTER ADMIN LOGIC
 * Features: Security, Live Broadcast, Payment Verification, Database CRUD, Payroll
 */

// --- 1. SECURITY & AUTHENTICATION GATEKEEPER ---
(function() {
    const userType = localStorage.getItem('userType');
    const userName = localStorage.getItem('userName');
    const adminUsername = "Admin_User"; 

    // Redirect if not the Master Admin
    if (userName !== adminUsername) {
        alert("Access Denied: Administrative Privileges Required.");
        window.location.href = "index.html";
        return; 
    }

    // Display Admin Name
    const nameDisplay = document.getElementById('adminNameDisplay');
    if (nameDisplay) nameDisplay.innerText = userName;
})();

// --- 2. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    fetchPendingPayments();
    loadPayrollData();
    fetchDatabase('users'); // Load users by default on startup
});

// --- 3. DATABASE MANAGEMENT (CRUD) ---
async function fetchDatabase(type) {
    try {
        const res = await fetch(`/api/admin/db-${type}`, {
            headers: { 
                'x-user-role': localStorage.getItem('userType'), 
                'x-user-name': localStorage.getItem('userName') 
            }
        });
        const data = await res.json();
        
        const head = document.getElementById('masterHead');
        const body = document.getElementById('masterBody');
        
        if (!body || !head) return;

        if (type === 'users') {
            head.innerHTML = `<tr><th>Name</th><th>Role</th><th>School Code</th><th>Action</th></tr>`;
            body.innerHTML = data.map(u => `
                <tr>
                    <td><strong>${u.name} ${u.surname || ''}</strong></td>
                    <td><span class="badge-admin">${u.userType}</span></td>
                    <td><code>${u.schoolCode || 'public'}</code></td>
                    <td>
                        <button onclick="deleteRecord('users', '${u.name}')" class="btn-delete" title="Delete User">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } else if (type === 'schools') {
            head.innerHTML = `<tr><th>School Name</th><th>Partner Code</th><th>Status</th><th>Action</th></tr>`;
            body.innerHTML = data.map(s => `
                <tr>
                    <td><strong>${s.schoolName}</strong></td>
                    <td><code>${s.schoolCode}</code></td>
                    <td>${s.isPaid ? '<span style="color:var(--success)">✅ Active</span>' : '<span style="color:var(--danger)">❌ Expired</span>'}</td>
                    <td>
                        <button onclick="deleteRecord('schools', '${s.schoolCode}')" class="btn-delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error("Database fetch error:", err);
    }
}

async function deleteRecord(table, id) {
    if (!confirm(`WARNING: Are you sure you want to delete ${id} from ${table}? This cannot be undone.`)) return;

    const res = await fetch(`/api/admin/delete-record`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-user-role': localStorage.getItem('userType'), 
            'x-user-name': localStorage.getItem('userName') 
        },
        body: JSON.stringify({ table, id })
    });

    if (res.ok) {
        alert("Record deleted successfully.");
        fetchDatabase(table); // Refresh the current view
    } else {
        alert("Error deleting record.");
    }
}

// --- 4. LIVE SESSION CONTROL ---
async function toggleSession(isActive) {
    const link = document.getElementById('meetingLink').value;
    const topic = document.getElementById('meetingTopic').value;

    if (isActive && (!link || !topic)) return alert("Please provide both a Topic and a Link!");

    const res = await fetch('/api/admin/toggle-session', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-user-role': localStorage.getItem('userType'),
            'x-user-name': localStorage.getItem('userName')
        },
        body: JSON.stringify({ active: isActive, link, topic })
    });
    
    if (res.ok) {
        alert(isActive ? "Global broadcast is now LIVE!" : "Broadcast ended.");
    }
}

// --- 5. PAYMENT VERIFICATION ---
async function fetchPendingPayments() {
    const res = await fetch('/api/admin/pending-payments', {
        headers: { 
            'x-user-role': localStorage.getItem('userType'), 
            'x-user-name': localStorage.getItem('userName') 
        }
    });
    const students = await res.json();
    const tbody = document.getElementById('pendingBody');
    
    if (!tbody) return;

    tbody.innerHTML = students.map(s => `
        <tr>
            <td><b>${s.name}</b></td>
            <td><a href="/uploads/${s.receiptPath}" target="_blank" class="btn-csv" style="padding: 4px 8px; font-size: 0.7rem;">View PDF</a></td>
            <td><button onclick="verifyStudent('${s.name}')" class="btn-verify">Approve</button></td>
        </tr>
    `).join('');
}

async function verifyStudent(name) {
    const res = await fetch('/api/admin/verify-student', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-user-role': localStorage.getItem('userType'),
            'x-user-name': localStorage.getItem('userName')
        },
        body: JSON.stringify({ name })
    });
    if (res.ok) { 
        fetchPendingPayments(); 
        alert("Student has been verified and granted access!"); 
    }
}

// --- 6. PAYROLL LOGIC ---
async function loadPayrollData() {
    const res = await fetch('/api/admin/payroll-stats', {
        headers: { 
            'x-user-role': localStorage.getItem('userType'), 
            'x-user-name': localStorage.getItem('userName') 
        }
    });
    const stats = await res.json();
    const tbody = document.getElementById('payrollBody');
    
    if (!tbody) return;

    tbody.innerHTML = stats.map(row => `
        <tr>
            <td><strong>${row.tutorName}</strong></td>
            <td>${row.totalStudents} students</td>
            <td>${row.sessionCount} sessions</td>
            <td style="color: var(--success);"><b>R ${(row.totalStudents * 50).toFixed(2)}</b></td> 
        </tr>
    `).join('');
}

// --- 7. UTILITIES ---
function downloadPayrollCSV() {
    alert("Preparing CSV download...");
    // Future implementation: window.open('/api/admin/download-payroll');
}

function logout() {
    if(confirm("Are you sure you want to logout of the Master Admin?")) {
        localStorage.clear(); 
        window.location.href = "index.html";
    }
}
// --- NEW: CREATE SCHOOL PARTNERSHIP ---
async function createNewSchool() {
    const schoolName = document.getElementById('newSchoolName').value;
    const schoolCode = document.getElementById('newSchoolCode').value;

    if (!schoolName || !schoolCode) {
        return alert("Please fill in both the School Name and the Partnership Code.");
    }

    const res = await fetch('/api/admin/create-school', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-user-role': localStorage.getItem('userType'), 
            'x-user-name': localStorage.getItem('userName') 
        },
        body: JSON.stringify({ schoolName, schoolCode })
    });

    if (res.ok) {
        alert(`Successfully registered ${schoolName}!`);
        // Clear inputs
        document.getElementById('newSchoolName').value = '';
        document.getElementById('newSchoolCode').value = '';
        // Refresh the school list in the database section
        fetchDatabase('schools'); 
    } else {
        const err = await res.json();
        alert("Error: " + err.message);
    }
}