// Function to clear selected files
function clearSelectedFiles() {
  const checkboxes = document.querySelectorAll('.file-entry input[type="checkbox"]');
  for(let checkbox of checkboxes) {
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change'));
  }
}

const addTabButton = document.getElementById("add-tab-button");
const tabNameModal = document.getElementById("tabNameModal");
const submitTabNameButton = document.getElementById("submitTabNameButton");
const tabNameInput = document.getElementById("tabNameInput");
const tabs = document.querySelector(".tab");

addTabButton.addEventListener('click', () => {
    tabNameModal.style.display = "block";
});

submitTabNameButton.addEventListener('click', () => {
    // Get the tab name from the input
    const tabName = tabNameInput.value;
    const newTabButton = document.createElement("button");

    newTabButton.className = "tablinks";
    newTabButton.innerText = tabName;
    newTabButton.onclick = (event) => openTab(event, tabName);

    // Insert new tab next to add tab button
    tabs.insertBefore(newTabButton, addTabButton);

    // Reset the input value
    tabNameInput.value = "";
    tabNameModal.style.display = "none";
    
    // Create a new Div for the new tab
    const newDiv = document.createElement("div");
    newDiv.id = tabName;
    newDiv.className = "tabcontent";
    document.body.appendChild(newDiv); // add new div to the body
}); 

window.addEventListener('click', (event) => {
    if (event.target == tabNameModal) {
        tabNameModal.style.display = "none";
    }
});
