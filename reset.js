// --- 1. SIDEBAR TOGGLE LOGIC ---
const openBtn = document.getElementById('openNav');
const closeBtn = document.getElementById('closeNav');
const sideMenu = document.getElementById('side-menu');

// Ensures the sidebar functions correctly with your CSS classes
if (openBtn && sideMenu) {
    openBtn.onclick = () => sideMenu.classList.add('active');
}

if (closeBtn && sideMenu) {
    closeBtn.onclick = () => sideMenu.classList.remove('active');
}
document.getElementById('resetForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const resetData = {
        email: document.getElementById('resetEmail').value,
        phone: document.getElementById('resetPhone').value,
        newPassword: document.getElementById('resetNewPass').value
    };

    try {
        const res = await fetch('/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resetData)
        });

        const data = await res.json();
        alert(data.message);
        if (res.ok) window.location.href = "login.html";
    } catch (err) {
        alert("Connection error.");
    }
};