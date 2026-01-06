const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');

dropZone.onclick = () => fileInput.click();

fileInput.onchange = () => {
    if (fileInput.files.length > 0) {
        document.getElementById('drop-text').innerHTML = 
            `<i class="fas fa-file-alt"></i> Selected: <b>${fileInput.files[0].name}</b>`;
    }
};

uploadBtn.onclick = async () => {
    const file = fileInput.files[0];
    const name = document.getElementById('studentFileName').value;
    const subject = document.getElementById('materialSubject').value;

    if (!file || !name) {
        alert("Please provide a title and select a file.");
        return;
    }

    // Hide button, show progress
    uploadBtn.style.display = 'none';
    document.getElementById('active-upload-status').style.display = 'block';

    const formData = new FormData();
    formData.append('studyMaterial', file);
    formData.append('displayName', name);
    formData.append('subject', subject);
    formData.append('uploadedBy', localStorage.getItem('userName'));

    // XHR used to track progress percentage
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;
            setUploadProgress(percent);
        }
    };

    xhr.onload = () => {
        if (xhr.status === 200) {
            alert("Upload Successful!");
            window.location.href = "student-portal.html";
        } else {
            alert("Upload failed.");
            uploadBtn.style.display = 'block';
        }
    };

    xhr.send(formData);
};

function setUploadProgress(percent) {
    const circle = document.getElementById('uploadProgressCircle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    const offset = circumference - (percent / 100 * circumference);
    circle.style.strokeDashoffset = offset;
    document.getElementById('progressPercent').innerText = `${Math.round(percent)}%`;
}

// Inside your student.js render function
feed.innerHTML = files.map(file => `
    <div class="file-card">
        <div class="card-accent"></div> <div class="file-icon">
            <i class="fas ${getFileIcon(file.originalName)}"></i>
        </div>
        <h4>${file.displayName}</h4>
        <div class="file-info">
            <span><i class="fas fa-tag"></i> ${file.subject}</span>
            <span><i class="fas fa-user-edit"></i> ${file.uploadedBy}</span>
        </div>
        <a href="/uploads/${file.originalName}" target="_blank" class="btn-download">
            <i class="fas fa-external-link-alt"></i> View Material
        </a>
    </div>
`).join('');

uploadBtn.onclick = async () => {
    const formData = new FormData();
    formData.append('studyMaterial', fileInput.files[0]);
    formData.append('displayName', document.getElementById('studentFileName').value);
    formData.append('subject', document.getElementById('materialSubject').value);
    formData.append('uploadedBy', localStorage.getItem('userName'));
    
    // Attach the school ID so the server knows where to 'file' it
    formData.append('school_id', localStorage.getItem('school_id') || 'public');

    const res = await fetch('/upload', { method: 'POST', body: formData });
    // ... rest of your logic
};