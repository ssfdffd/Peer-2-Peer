/**
 * PEER-2-PEER PROJECT - RESOURCES SCRIPT
 * Handling Fetching, Sorting, Search, and Animations
 */

const fileGrid = document.getElementById('fileGrid');
const searchInput = document.getElementById('searchInput');
const sideMenu = document.getElementById('side-menu');
let allFiles = [];

// --- 1. SIDEBAR TOGGLE ---
document.getElementById('openNav').onclick = () => sideMenu.classList.add('active');
document.getElementById('closeNav').onclick = () => sideMenu.classList.remove('active');

// --- 2. LOAD FILES ---
async function loadFiles() {
    try {
        const res = await fetch('/api/files');
        const data = await res.json();
        
        // Latest Upload First: Reverse the array retrieved from server
        allFiles = data.reverse(); 
        renderFiles(allFiles);
    } catch (err) {
        console.error("Error loading resources:", err);
        fileGrid.innerHTML = "<h3>Error loading files. Please ensure the server is running.</h3>";
    }
}

// --- 3. RENDER GRID ---
function renderFiles(files) {
    fileGrid.innerHTML = '';
    
    if (files.length === 0) {
        fileGrid.innerHTML = '<div class="no-docs"><h3>No matching documents found.</h3></div>';
        return;
    }

    files.forEach((file, index) => {
        const card = document.createElement('div');
        card.className = 'file-card';
        // Apply staggered animation delay
        card.style.animationDelay = `${index * 0.05}s`;
        
        card.innerHTML = `
            <div class="file-icon-box">
                <i class="fas fa-file-alt"></i>
            </div>
            <div class="file-info">
                <h3>${file.displayName}</h3>
                <span class="upload-date">Uploaded: ${file.date}</span>
            </div>
            <div class="card-actions">
                <a href="/uploads/${file.originalName}" download class="btn-download" title="Download">
                    <i class="fas fa-download"></i>
                </a>
                <button onclick="deleteFile('${file.id}')" class="btn-delete" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        fileGrid.appendChild(card);
    });
}

// --- 4. SMART SEARCH ---
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    // Filter from our allFiles array
    const filtered = allFiles.filter(file => 
        file.displayName.toLowerCase().includes(term)
    );
    renderFiles(filtered);
});

// --- 5. DELETE FILE ---
async function deleteFile(id) {
    if (!confirm("Are you sure you want to permanently delete this resource?")) return;

    try {
        const res = await fetch(`/api/delete/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadFiles(); // Refresh the list from the server
        }
    } catch (err) {
        alert("Server error: Could not delete file.");
    }
}

// Start the page logic
loadFiles();





async function handleUpload(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('studyMaterial');
    const displayName = document.getElementById('displayName').value;
    const currentUser = localStorage.getItem('userName'); // Get logged-in user

    if (!currentUser) {
        alert("You must be logged in to upload files!");
        return;
    }

    const formData = new FormData();
    formData.append('studyMaterial', fileInput.files[0]);
    formData.append('displayName', displayName);
    formData.append('uploadedBy', currentUser); // Send the owner's name

    try {
        const res = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            alert("File uploaded successfully!");
            location.reload();
        }
    } catch (err) {
        console.error("Upload failed", err);
    }
}

function displayFiles(files) {
    const container = document.getElementById('file-list');
    const currentUser = localStorage.getItem('userName');
    container.innerHTML = '';

    files.forEach(file => {
        // Check if the current user owns this file
        const isOwner = currentUser === file.uploadedBy;

        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            <h3>${file.displayName}</h3>
            <p>Uploaded by: <strong>${file.uploadedBy}</strong></p>
            <div class="actions">
                <a href="/uploads/${file.originalName}" download>Download</a>
                ${isOwner ? `<button onclick="deleteFile('${file.id}')" class="btn-delete">Delete</button>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

app.delete('/api/delete/:id', (req, res) => {
    const fileId = req.params.id;
    // In a real app, you'd send the username in the header/body to verify
    // For now, let's find the file first
    const fileToDelete = db.find(f => f.id === fileId);
    
    // Logic: if(fileToDelete.uploadedBy === requestingUser) ...
    
    db = db.filter(f => f.id !== fileId);
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    res.send("Deleted");
});

function displayFiles(files) {
    const container = document.getElementById('files-container');
    container.innerHTML = files.map(file => {
        const iconClass = getFileIcon(file.originalName); // Uses the function from step 2
        return `
            <div class="file-card">
                <i class="fas ${iconClass} fa-3x"></i>
                <h4>${file.displayName}</h4>
                <p>Type: ${file.originalName.split('.').pop().toUpperCase()}</p>
                <a href="/uploads/${file.originalName}" download class="btn-download">Download</a>
            </div>
        `;
    }).join('');
}

