document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName');
    const refValue = document.getElementById('refValue');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const submitBtn = document.getElementById('submitBtn');
    const fileNameText = document.getElementById('fileName');

    // 1. Redirect if not logged in
    if (!userName) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Set Reference Number
    refValue.innerText = userName.toUpperCase() + "-LIVE";

    // 3. Trigger File Input
    dropZone.onclick = () => fileInput.click();

    // 4. Update UI when file selected
    fileInput.onchange = () => {
        if (fileInput.files.length > 0) {
            fileNameText.innerText = fileInput.files[0].name;
            submitBtn.disabled = false;
        }
    };

    // 5. Handle Submission
    window.submitReceipt = async () => {
        const file = fileInput.files[0];
        const statusMsg = document.getElementById('statusMsg');

        const formData = new FormData();
        formData.append('receipt', file);
        formData.append('userName', userName);

        submitBtn.disabled = true;
        submitBtn.innerText = "Processing...";

        try {
            const res = await fetch('/api/upload-receipt', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                showStatus("Success! Receipt submitted for verification.", "success");
                setTimeout(() => window.location.href = "student-portal.html", 3000);
            } else {
                throw new Error();
            }
        } catch (err) {
            showStatus("Upload failed. Please try again.", "error");
            submitBtn.disabled = false;
            submitBtn.innerText = "Submit Verification";
        }
    };

    function showStatus(text, type) {
        statusMsg.innerText = text;
        statusMsg.style.display = "block";
        statusMsg.style.backgroundColor = type === "success" ? "#d1fae5" : "#fee2e2";
        statusMsg.style.color = type === "success" ? "#065f46" : "#991b1b";
    }
});