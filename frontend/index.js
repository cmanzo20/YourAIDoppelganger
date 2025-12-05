// Tab switching function
function showTab(tabId) {
  document.getElementById('train').style.display = 'none';
  document.getElementById('generate').style.display = 'none';
  document.getElementById('manage').style.display = 'none';
  document.getElementById('save').style.display = 'none';
  document.getElementById(tabId).style.display = 'block';
}

// Writing samples functionality
let writingSamples = [];  //variable for storing uploaded files

// Handle file uploads
function handleFileUpload() {
  const fileInput = document.getElementById('fileInput');
  const files = Array.from(fileInput.files);  //convert uploaded files to JS array

  for (let file of files) { //loop through uploaded files
    writingSamples.push(file); //add files to writing samples list
    displayFileList();  //update file list display
  }
}

// Display files on the page with Remove buttons
function displayFileList() {
  const fileList = document.getElementById('fileList');
  fileList.innerHTML = "";

  if (writingSamples.length === 0) {
    fileList.innerHTML = "<p>No writing samples uploaded yet.</p>";
    return;
  }

  // Create unordered file list
  const ul = document.createElement('ul');
  ul.className = "file-list";

  //loop through writing samples and create list items for each
  writingSamples.forEach((file, index) => { //index each file
    const li = document.createElement('li');  //create list item for each
    li.className = "file-item";
    const nameSpan = document.createElement('span');  //create span for file name for each
    nameSpan.textContent = file.name;

    const removeBtn = document.createElement('button'); //create remove button for each
    removeBtn.textContent = "Remove";
    removeBtn.className = "remove-btn";
    removeBtn.onclick = () => removeFile(index);  //each item's delete button calls removefile with its index

    ul.appendChild(li); //append list item to list
    li.appendChild(nameSpan); //append file name
    li.appendChild(removeBtn);  //append corresponding remove button
  });

  fileList.appendChild(ul); //append current upload list to file list div
}

// Remove file from list function
function removeFile(index) {
  writingSamples.splice(index, 1);
  displayFileList();  //update file display after removal
}

async function submitSamples() {
  console.log("Submitting writing samples:", writingSamples);
  if (writingSamples.length === 0) {
    alert("Please upload at least one writing sample.");
    return;
  }
  const trainMessageDiv = document.getElementById('trainMessage');
  trainMessageDiv.innerHTML = "Training your AI Doppelgänger... ⏳";

  try { //try-catch block for uploading writing samples
    for (const file of writingSamples) {  //separate post method for each file
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:5000/upload", {  //API call
        method: "POST", //post method
        body: formData  //data for post method
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${file.name}`);
      }

      //log if uploaded successfully
      const data = await response.json();
      console.log("Uploaded:", data);
    }

    // Clear local list after successful upload
    writingSamples = [];
    displayFileList();

    trainMessageDiv.innerHTML = "<strong>Your AI Doppelgänger is ready for use!</strong>";

  } catch (error) {
    console.error(error);
    alert("Error uploading files. Check console for details.");
  }
}

async function generateText() {
  const prompt = document.getElementById("promptInput").value.trim();
  const outputDiv = document.getElementById("aiOutput");

  outputDiv.textContent = "Generating response...";

  if (!prompt) {
    outputDiv.textContent = "Please enter a prompt.";
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:5000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      outputDiv.textContent =
        err.error || `Server error: ${res.status}`;
      return;
    }

    const data = await res.json();
    outputDiv.textContent = data.output || "(No response text returned)";
  } catch (error) {
    console.error("Error calling /generate:", error);
    outputDiv.textContent = "Failed to contact backend.";
  }
}

function copyOutput() { // Copy to clipboard function
  const outputDiv = document.getElementById("aiOutput");
  const text = outputDiv.innerText;
  const copyMessageDiv = document.getElementById("copyMessage");

  if (!text.trim()) {
      copyMessageDiv.textContent = "No text to copy.";
      copyMessageDiv.style.color = "red";
      setTimeout(() => {copyMessageDiv.textContent = "";}, 2000);
      return;
  }

  try {
    navigator.clipboard.writeText(text) //copy text to clipboard
    .then(() => {
      copyMessageDiv.textContent = "Text copied to clipboard!";
      copyMessageDiv.style.color = "green";
      setTimeout(() => {copyMessageDiv.textContent = "";}, 2000);
    })
  } catch (err) {
    console.error("Copy failed:", err);
    alert("Failed to copy.");
  }
}
