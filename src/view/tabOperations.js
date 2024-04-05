export function openTab(evt) {
  let tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  let tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(evt.target.dataset.tabName).style.display = "block";
  evt.target.className += " active";
}

// Initialize
let tablinks = document.getElementsByClassName("tablinks");
for (let i = 0; i < tablinks.length; i++) {
  tablinks[i].addEventListener("click", openTab);
}
document.getElementsByClassName("firstOpen")[0].click();
