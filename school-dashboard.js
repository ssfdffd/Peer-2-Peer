document.addEventListener('DOMContentLoaded', async () => {
    const schoolCode = localStorage.getItem('schoolCode'); // Saved during school admin login
    
    if (!schoolCode) {
        alert("Access Denied: No School Code found.");
        window.location.href = "login.html";
        return;
    }

    loadSchoolStats(schoolCode);
    loadSchoolStaff(schoolCode);
});

async function loadSchoolStats(code) {
    try {
        const res = await fetch(`/api/school/stats/${code}`);
        const data = await res.json();
        
        document.getElementById('studentCount').innerText = data.students || 0;
        document.getElementById('teacherCount').innerText = data.teachers || 0;
        document.getElementById('schoolNameDisplay').innerText = data.schoolName || "School Dashboard";
        
        // Calculate commission (Example: R10 per student)
        const commission = (data.students * 10).toFixed(2);
        document.getElementById('schoolEarnings').innerText = `R ${commission}`;
    } catch (err) {
        console.error("Error loading stats:", err);
    }
}

async function loadSchoolStaff(code) {
    try {
        const res = await fetch(`/api/school/staff/${code}`);
        const staff = await res.json();
        const tbody = document.getElementById('schoolStaffBody');
        
        tbody.innerHTML = staff.map(member => `
            <tr>
                <td>${member.name} ${member.surname}</td>
                <td>${member.totalLessons || 0}</td>
                <td>${member.totalFiles || 0}</td>
                <td><span class="status-badge online">Active</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Error loading staff:", err);
    }
}