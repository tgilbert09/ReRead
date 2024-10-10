const searchButton0 = document.getElementById("searchButton0");
const searchButton1 = document.getElementById("searchButton1");

searchButton0.addEventListener("click", searchFunction);
searchButton1.addEventListener("click", searchFunction);

function searchFunction(event) {
  event.preventDefault(); // Prevent form submission

  const searchInput = document.getElementById(event.target.dataset.inputId);
  const searchTerm = searchInput.value.trim();

  if (searchTerm) {
    const formattedSearchTerm = searchTerm.split(" ").join("+");
    const searchURL = `/search?query=${formattedSearchTerm}`;
    window.history.pushState({ path: searchURL }, "", searchURL);
    window.location.href = searchURL;
  }
}
