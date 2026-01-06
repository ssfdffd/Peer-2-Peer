document.addEventListener('DOMContentLoaded', async () => {
    const userName = localStorage.getItem('userName');
    const content = document.getElementById('profileContent');

    if (!userName) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: userName })
        });

        const user = await res.json();

        if (res.ok) {
            content.innerHTML = `
                <div class="input-group"><label>Full Name</label><p>${user.name} ${user.surname}</p></div>
                <div class="input-group"><label>Email</label><p>${user.email}</p></div>
                <div class="input-group"><label>School</label><p>${user.school}</p></div>
                <div class="input-group"><label>Age</label><p>${user.age}</p></div>
                <div class="input-group"><label>Phone</label><p>${user.phone}</p></div>
                <div class="input-group"><label>Account Type</label><p><strong>${user.userType.toUpperCase()}</strong></p></div>
            `;
        } else {
            content.innerHTML = `<p>Error: ${user.message}</p>`;
        }
    } catch (err) {
        content.innerHTML = `<p>Connection error. Is the server running?</p>`;
    }
});

function logout() {
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

let isEditing = false;

function toggleEdit() {
    const content = document.getElementById('profileContent');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');

    if (!isEditing) {
        // Switch to Input fields
        const labels = content.querySelectorAll('label');
        const values = content.querySelectorAll('p');
        
        let editHtml = '';
        labels.forEach((label, i) => {
            // We don't want to edit the Account Type or Email for now
            if (label.innerText !== 'Email' && label.innerText !== 'Account Type') {
                editHtml += `
                    <div class="input-group">
                        <label>${label.innerText}</label>
                        <input type="text" value="${values[i].innerText}" id="edit_${label.innerText.replace(' ', '')}">
                    </div>`;
            } else {
                editHtml += `<div class="input-group"><label>${label.innerText}</label><p>${values[i].innerText}</p></div>`;
            }
        });
        
        content.innerHTML = editHtml;
        editBtn.style.display = 'none';
        saveBtn.style.display = 'block';
        isEditing = true;
    }
}

async function saveProfile() {
    const currentName = localStorage.getItem('userName');
    const updatedData = {
        currentName: currentName,
        name: document.getElementById('edit_FullName').value.split(' ')[0],
        surname: document.getElementById('edit_FullName').value.split(' ')[1] || '',
        age: document.getElementById('edit_Age').value,
        phone: document.getElementById('edit_Phone').value,
        school: document.getElementById('edit_School').value
    };

    try {
        const res = await fetch('/api/update-profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            localStorage.setItem('userName', data.newName); // Update storage if name changed
            location.reload();
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        alert("Connection error.");
    }
}

if (!localStorage.getItem('userName')) {
    alert("Please log in to access this page.");
    window.location.href = "login.html";
}