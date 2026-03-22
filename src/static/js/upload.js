document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("file-upload");
    const dropzone = document.querySelector(".upload__dropzone");
    const urlInput = document.querySelector(".upload__input");
    const copyButton = document.querySelector(".upload__copy");
    const messageBox = document.getElementById("upload-message");

    const showMessage = (text, isError = false) => {
        messageBox.textContent = text;
        messageBox.style.color = isError ? "red" : "green";
    };

    const uploadFile = async (file) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            showMessage("Only JPG, PNG and GIF files are allowed.", true);
            return;
        }

        if (file.size > maxSize) {
            showMessage("Maximum file size is 5MB.", true);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            showMessage("Uploading...");
            const response = await fetch("/upload", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (!result.success) {
                showMessage(result.message || "Upload failed.", true);
                return;
            }

            urlInput.value = result.url;
            showMessage(`Upload successful. Image ID: ${result.id}`);
        } catch (error) {
            showMessage("Upload failed due to server error.", true);
            console.error(error);
        }
    };

    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadFile(file);
        }
    });

    dropzone.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    dropzone.addEventListener("drop", (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            uploadFile(file);
        }
    });

    copyButton.addEventListener("click", async () => {
        if (!urlInput.value) return;
        try {
            await navigator.clipboard.writeText(urlInput.value);
            showMessage("URL copied.");
        } catch (error) {
            showMessage("Failed to copy URL.", true);
        }
    });
});