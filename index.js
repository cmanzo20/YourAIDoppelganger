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
    const div = document.createElement('div');  //instantiate new div for each doc
    div.textContent = file.name;  //display the name of the file in text content
    fileList.appendChild(div);  //append div to file list display
  }

  displayFileList();
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

function submitSamples() {
  console.log("Submitting writing samples:", writingSamples);
  if (writingSamples.length === 0) {
    alert("Please upload at least one writing sample.");
    return;
  }
  document.getElementById('fileList').innerHTML = "Training your AI Doppelgänger... ⏳";
  // ADD LOGIC TO TRAIN AI HERE
  document.getElementById('fileList').innerHTML = "<strong>Your AI Doppelgänger is ready for use!</strong>";
}


