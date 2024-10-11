const firebaseConfig = {
  apiKey: "AIzaSyBM8PxkvNcxYBHUH0_lKF9IEG36onXMjGg",
  authDomain: "reread-3f841.firebaseapp.com",
  projectId: "reread-3f841",
  storageBucket: "reread-3f841.appspot.com",
  messagingSenderId: "325079292085",
  appId: "1:325079292085:web:613d5e2212773c11eac6fc",
  measurementId: "G-8M5XRPB36E",
};
const app = firebase.initializeApp(firebaseConfig);

const searchButton = document.getElementById("searchButton");
searchButton.addEventListener("click", searchButtonClickedFunction);

searchInput = document.getElementById("search-input");
const urlParams = new URL(window.location.href).searchParams;
const query = urlParams.get("query");
searchInput.value = query;
booksJson = requestFromD1(query);

function searchButtonClickedFunction(event) {
  event.preventDefault();

  const searchInput = document.getElementById(event.target.dataset.inputId);
  const searchTerm = searchInput.value.trim();
  const formattedSearchTerm = searchTerm.split(" ").join("+"); // Replace spaces with +
  const searchURL = `/search?query=${formattedSearchTerm}`;
  window.history.pushState({ path: searchURL }, "", searchURL);
  requestFromD1(searchTerm);
}

function requestFromD1(query = "") {
  const formattedSearchTerm = query.split(" ").join("+"); // Replace spaces with +
  const searchAPIURL = `/search-api?query=${formattedSearchTerm}`;

  firebase.auth().onAuthStateChanged(async (user) => {
    let booksJsonResponse;
    if (user) {
      try {
        const idToken = await user.getIdToken();

        requestOptionsObject = {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        };

        booksJsonResponse = await fetch(searchAPIURL, requestOptionsObject);
      } catch (error) {
        console.error(error);
      }
    } else {
      // not user?
      try {
        booksJsonResponse = await fetch(searchAPIURL);
      } catch (error) {
        console.error(error);
      }
    }
    try {
      const booksJson = await booksJsonResponse.json();
      booksJsonToHtml(booksJson);
    } catch (error) {
      console.error(error);
    }
  });
}

function timeAgo(dateString) {
  const now = new Date();
  const pastDate = new Date(dateString);
  const diffInMs = now - pastDate; // Difference in milliseconds
  const diffInSeconds = Math.floor(diffInMs / 1000); // Difference in seconds
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return "a moment ago";
  } else if (diffInMinutes < 60) {
    return (
      diffInMinutes + " minute" + (diffInMinutes === 1 ? "" : "s") + " ago"
    );
  } else if (diffInHours < 24) {
    return diffInHours + " hour" + (diffInHours === 1 ? "" : "s") + " ago";
  } else {
    return diffInDays + " day" + (diffInDays === 1 ? "" : "s") + " ago";
  }
}

function booksJsonToHtml(books) {
  // Get the parent node
  var parentNode = document.querySelector("body");

  // Reset books shown
  const booksDivs = document.querySelectorAll(".book");
  booksDivs.forEach((bookDiv) => {
    bookDiv.remove();
  });

  if (books === undefined || books.length == 0) {
    // array does not exist or is empty
    const bookDiv = document.createElement("h3");
    bookDiv.setAttribute("class", "book");
    const urlParams = new URL(window.location.href).searchParams;
    const query = urlParams.get("query");
    bookDiv.innerHTML =
      `<p>No results found for "${query}" - check back again soon or <a href="/account">add a book to your wishlist</a> to get notified when it's found!</p>`;
    parentNode.appendChild(bookDiv);
    return;
  }

  books.forEach((book) => {
    const bookDiv = document.createElement("div");
    bookDiv.setAttribute("id", "bookId=" + book["BookId"]);
    bookDiv.setAttribute("class", "book");

    const bookInfo = document.createElement("div");

    const bookTitle = document.createElement("h2");
    bookTitle.textContent = book["Title"];
    bookInfo.appendChild(bookTitle);

    const bookAuthor = document.createElement("h3");
    bookAuthor.textContent = book["Author"];
    bookInfo.appendChild(bookAuthor);

    const scannedText = document.createElement("h4");
    if (!book["Title"] && !book["Author"]) {
      scannedText.textContent = book["ScannedText"];
    }
    bookInfo.appendChild(scannedText);

    // Highlight matching text
    if (query) {
      const regex = new RegExp(`(${query})`, "gi"); // Create a regex for case-insensitive matching
      const highlightedTitleText = bookTitle.innerHTML.replace(
        regex,
        '<span class="highlight">$1</span>',
      );
      bookTitle.innerHTML = highlightedTitleText; // Update the text with highlights
      const highlightedAuthorText = bookAuthor.innerHTML.replace(
        regex,
        '<span class="highlight">$1</span>',
      );
      bookAuthor.innerHTML = highlightedAuthorText; // Update the text with highlights
      const highlightedScannedText = scannedText.innerHTML.replace(
        regex,
        '<span class="highlight">$1</span>',
      );
      scannedText.innerHTML = highlightedScannedText; // Update the text with highlights
    }

    if (book["Author"]) {
      bookAuthor.innerHTML = "By " + bookAuthor.innerHTML;
    }

    if (!book["Title"] && !book["Author"]) {
      scannedText.innerHTML =
        "SCANNED TEXT: " + scannedText.innerHTML + "<br><br>";
    }

    const bookLocation = document.createElement("a");
    if (!("Location" in book)) {
      bookLocation.setAttribute("href", "/account");
      bookLocation.textContent =
        "Sign in to see which charity shop this book is in!";
    } else {
      bookLocation.setAttribute(
        "href",
        "https://maps.app.goo.gl/" + book["Location"],
      );
      bookLocation.setAttribute("target", "_blank");
      bookLocation.textContent = "From " + book["ShopName"];
    }
    bookInfo.appendChild(bookLocation);

    const bookScanInfo = document.createElement("h4");
    bookScanInfo.textContent = "Scanned " + timeAgo(book["DateTimeScanned"]);
    bookInfo.appendChild(bookScanInfo);

    const googleBooksLink = document.createElement("a");
    googleBooksLink.setAttribute(
      "href",
      "https://www.google.co.uk/books/edition/_/" + book["GBooksId"],
    );
    googleBooksLink.setAttribute("target", "_blank");
    googleBooksLink.textContent = "Google Books >";
    bookInfo.appendChild(googleBooksLink);

    imageUrl =
      "https://re-read.co.uk/image?bookId=" +
      book["BookId"];
    const imgElement = document.createElement("img");
    imgElement.src = imageUrl;
    imgElement.alt = book["ScannedText"];

    bookDiv.appendChild(imgElement);
    bookDiv.appendChild(bookInfo);

    parentNode.appendChild(bookDiv);
  });
}
