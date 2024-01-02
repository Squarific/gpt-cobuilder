window.addEventListener('DOMContentLoaded', async () => {
  // Close the modal when the close button (x) is clicked
  const modal = document.getElementById('requestDetailsModal');
  const closeButton = modal.querySelector('.close');
  closeButton.onclick = function() {
    modal.style.display = "none";
  }

  // Close the modal when the user clicks anywhere outside of the modal content
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
});
