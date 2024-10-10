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

document.getElementById("search-button").addEventListener("click", searchBooks);

async function searchBooks() {
  const query = document.getElementById("search-input").value;
  const apiKey = "YOUR_GOOGLE_BOOKS_API_KEY"; // Replace with your API key
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    displayResults(data.items);
  } catch (error) {
    console.error("Error fetching books:", error);
    document.getElementById("results").innerHTML =
      "Error fetching books. Please try again.";
  }
}

function checkResultsAreInWishlist() {
  // Firestore reference to the user's wishlist
  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  const wishlistRef = db
    .collection("users")
    .doc(user.uid)
    .collection("wishlist");

  // Step 1: Fetch the user's wishlist once when the page loads
  const wishlistBookIds = [];
  wishlistRef.get().then((snapshot) => {
    snapshot.forEach((doc) => {
      wishlistBookIds.push(doc.id); // Collect all the book IDs in the wishlist
    });

    // Step 2: Check each Google Books result and update the button accordingly
    const wishlistButtons = document.querySelectorAll(".wishlist-button");
    wishlistButtons.forEach((button) => {
      const bookId = button.getAttribute("data-book-id");
      if (wishlistBookIds.includes(bookId)) {
        button.textContent = "Remove from Wishlist";
        button.classList.add("in-wishlist");
      } else {
        button.textContent = "Add to Wishlist";
        button.classList.remove("in-wishlist");
      }
    });
  });
}

function displayResults(books) {
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = ""; // Clear previous results

  if (!books) {
    resultsContainer.innerHTML = "No results found.";
    return;
  }

  resultsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("wishlist-button")) {
      changeWishlist(event);
    }
  });

  books.forEach((book) => {
    const title = book.volumeInfo.title || "No title available";
    const authors = book.volumeInfo.authors
      ? book.volumeInfo.authors.join(", ")
      : "Unknown author";
    const bookId = book.id; // Google Books ID for adding to wishlist

    const resultItem = document.createElement("div");
    resultItem.classList.add("result-item");
    resultItem.innerHTML = `
      <img loading="lazy" src='https://books.google.com/books/content?id=${bookId}&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api' class='book-cover' alt='${title} book cover'>
      <h3>${title}</h3>
      <p><strong>Authors:</strong> ${authors}</p>
      <a href="https://www.google.co.uk/books/edition/_/${bookId}" target=”_blank”>Google Books ></a>
      <button class="wishlist-button"
        data-book-id="${bookId}"
        data-title="${title}"
        data-authors="${authors}"

        >Add to Wishlist</button>
      `;

    resultsContainer.appendChild(resultItem);
  });
  checkResultsAreInWishlist();
}

function changeWishlist(event) {
  const button = event.target;
  const bookId = button.dataset.bookId;
  const title = button.dataset.title;
  const authors = button.dataset.authors;

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const db = firebase.firestore();

      // Check if the button has the 'in-wishlist' class
      if (button.classList.contains("in-wishlist")) {
        console.log("This book is already in the wishlist");
        // Remove from wishlist or perform other actions
        db.collection("users")
          .doc(user.uid)
          .collection("wishlist")
          .doc(bookId)
          .delete()
          .then(() => {
            console.log("Document successfully deleted!");
          })
          .catch((error) => {
            console.error("Error removing document: ", error);
          });
      } else {
        const bookData = {
          title: title,
          authors: authors,
          dateAdded: new Date().toISOString(),
          // Any other book details you want to store
        };

        // Add the book to the user's wishlist in Firestore
        db.collection("users")
          .doc(user.uid)
          .collection("wishlist")
          .doc(bookId)
          .set(bookData)
          .then(() => {
            console.log("Book added to wishlist!");
          })
          .catch((error) => {
            console.error("Error adding book to wishlist: ", error);
          });
      }
      checkResultsAreInWishlist();
    }
  });
}

document.getElementById("sign-out-btn").addEventListener("click", () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      console.log("Sign-out successful.");
      window.location.reload();
    })
    .catch((error) => {
      console.error("Sign-out error:", error);
    });
});

document.getElementById("delete-account-btn").addEventListener("click", () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // Ask for confirmation
      if (
        confirm(
          "Are you sure you want to delete your account? This action cannot be undone.",
        )
      ) {
        // Call the delete() method on the user object
        user
          .delete()
          .then(() => {
            alert("Account deleted successfully.");
            // Optionally redirect the user or log them out
            firebase.auth().signOut();
            window.location.reload();
          })
          .catch((error) => {
            // Handle any errors (like re-authentication required)
            console.error("Error deleting account:", error);
            if (error.code === "auth/requires-recent-login") {
              alert(
                "You need to have entered your password recently to delete your account. We are logging you out now so you can re-enter your password. Please log in again to delete your account.",
              );
              firebase.auth().signOut();
              // Optionally trigger re-authentication here
            }
          });
      }
    } else {
      console.log("No user is currently signed in.");
    }
  });
});

var ui = new firebaseui.auth.AuthUI(firebase.auth());

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/v8/firebase.User
    var uid = user.uid;
    // User is signed in

    // document.getElementById('signIn').innerHTML = `A<span>ccoun</span>t`;

    // Get all elements with the class "display-when-signed-in"
    const signedInElements = document.querySelectorAll(".display-if-signed-in");

    // Loop through each element and change the display type
    signedInElements.forEach((element) => {
      element.style.display = "block"; // Change 'block' to the desired display type
    });

    const signedOutElements = document.querySelectorAll(
      ".display-if-signed-out",
    );
    signedOutElements.forEach((element) => {
      element.style.display = "none";
    });

    document.getElementById("loader").style.display = "none";
    const welcomeMessage = document.getElementById("welcome-message");
    welcomeMessage.innerHTML = `<p>Hi ${user.displayName || user.uid}! 😊</p>`; // Display user email or UID

    const userStatus = document.getElementById("user-status");
    userStatus.innerHTML = `<p><br>Welcome to your account! Here you can control your subscription, wishlist and account.<br></p>`;

    const userSubscriptionStatus = document.getElementById(
      "user-subscription-status",
    );
    userSubscriptionStatus.innerHTML = `<p>You are currently unsubscribed. Subscribe for £0.79 a month to get: </p><ol><li>Instant notifications when a book in your Wishlist is found.</li><li>Unlimited access to book locations.</li></ol><p>Check out what you're missing!</p>`; // Display user email or UID

    const db = firebase.firestore();
    const wishlistContainer = document.getElementById("wishlist-container");

    wishlistContainer.addEventListener("click", function (event) {
      if (event.target.classList.contains("wishlist-button")) {
        const bookId = event.target.dataset.bookId;
        // Call your function to remove from wishlist
        changeWishlist(event);
      }
    });

    function renderWishlist(bookList) {
      if (bookList.length === 0) {
        document.getElementById("add-to-wishlist-link").style.display = "none";
      } else {
        document.getElementById("add-to-wishlist-link").style.display = "block"; // If you want it visible when the list isn't empty
      }
      wishlistContainer.innerHTML = ""; // Clear the container
      bookList.forEach((doc) => {
        const book = doc.data();
        const bookItem = document.createElement("div");
        bookItem.id = `wished-${doc.id}`;
        bookItem.classList.add(`wished-book`);
        bookItem.innerHTML = `
          <img loading="lazy" src='https://books.google.com/books/content?id=${doc.id}&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api' class='book-cover' alt='${book.title}book cover'>
          <div class="book-details">
          <h3>${book.title}</h3>
          <p>by ${book.authors}</p>
          <a href="https://www.google.co.uk/books/edition/_/${doc.id}" target=”_blank”>Google Books ></a>
          <button class="wishlist-button in-wishlist" data-book-id="${doc.id}">Remove from Wishlist</button>
          </div>
        `;

        wishlistContainer.appendChild(bookItem);
      });
    }

    // Set up a real-time listener for the user's wishlist
    db.collection("users")
      .doc(user.uid)
      .collection("wishlist")
      .onSnapshot((snapshot) => {
        const books = snapshot.docs;
        renderWishlist(books); // Update the UI with the latest wishlist data
      });
  } else {
    // User is signed out
    // ...
    console.log("user not signed in");
    document.getElementById("firebaseui-auth-container").style.display =
      "block"; // Show FirebaseUI
    var uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
          // User successfully signed in.
          // Return type determines whether we continue the redirect automatically
          // or whether we leave that to developer to handle.
          console.log("signed in!");
          return true;
        },
        uiShown: function () {
          // The widget is rendered.
          // Hide the loader.
          document.getElementById("loader").style.display = "none";
        },
      },
      // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
      signInFlow: "popup",
      signInSuccessUrl: "account",
      signInOptions: [
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        },
      ],
      // Terms of service url.
      tosUrl: "/blogs/TermsAndConditions",
      // Privacy policy url.
      privacyPolicyUrl: "/blogs/PrivacyPolicy",
    };

    if (!ui.isPendingRedirect()) {
      ui.start("#firebaseui-auth-container", uiConfig);
    }
  }
});

document
  .getElementById("add-to-wishlist-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default anchor behavior
    document
      .getElementById("add-to-wishlist-container")
      .scrollIntoView({ behavior: "smooth" });

    // After scrolling, focus on the input field
    setTimeout(function () {
      document.getElementById("search-input").focus();
    }, 500); // Delay to allow smooth scrolling to complete
  });
