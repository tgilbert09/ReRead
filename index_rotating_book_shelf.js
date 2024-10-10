const categories = [
  {
    title: "Literary Classic",
    charity: "The British Heart Foundation",
    image:
      "https://books.google.co.uk/books/publisher/content?id=md7ODgAAQBAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE720tRptcMgEi4cD7wVGPk3DHknpJHlgB85m5gDx7El3ADGtjKIJNfT1EQmtUzcyBRG0PKOIi7kmDSjeETFaoH3CWeNQ5Fex_YImPvH8HhHin-kyB_rAjkmCAdccT3FIjV3h2Esl",
  },
  {
    title: "Sci-Fi Fantasy",
    charity: "St Peter's Hospice",
    image:
      "https://books.google.co.uk/books/content?id=D7REPwAACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE71mCPtEHo0Jh3L1r2b8jgT_FS7wMYcdaW-HjFDSJKU7JqMzplCC74Q-3KjPKDAsJDrSeqc6NTeHYQ0EhhSANU3nCCKYeQfgf7uC0a0SaryLbuIw_LkCyFLin66S-_pyxXi9oXIc",
  },
  {
    title: "Murder Mystery",
    charity: "Mind",
    image:
      "https://books.google.co.uk/books/content?id=C8vhxQEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE72yGqIFaxrJMfI4LlKoRUiY70Z0f9jSMgfRi-Pqy0V2DXLuoxs3sMO2zfDiMWDoc-zY4frjdtVKspJom1q27mOFu8nQHxlMKtjndcj8nBnJRK8LGshZdactU1q_KGsfBP3B_o3Q",
  },
  {
    title: "Life Story",
    charity: "Cancer Research UK",
    image:
      "https://books.google.co.uk/books/content?id=6e4cDvhrKhgC&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70cXAEIFpzIeAIVNJpfVDSWoaAJO7lXYgX0spvQuGVj6UyPjNJpfnLMAydUXet-D2ZuoaWnPlldwSvqi38szYbB9b-SyvIxRYnKhQcmGY4qXaKOcwiTyyycDHZwZjs8ijxn598-",
  },
  {
    title: "Intellectual Awakening",
    charity: "Save the Children",
    image:
      "https://books.google.co.uk/books/publisher/content?id=FmyBAwAAQBAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE71m0_zN2q0l_GA_sqzGezBjtVm8g3aNCtxhUyIz12mrJ12o2gU6zWza0SYrFZosqnvIXsBFBhxGpKTE35gHin_ZFQru8tuyc1ru_byCqQ-oKS4bnZ8PgIbn0h5YXWBXnMvSwy99",
  },
  {
    title: "Epic Adventure",
    charity: "Barnardo's",
    image:
      "https://books.google.co.uk/books/content?id=pD6arNyKyi8C&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE734grsrdS_NH-EFr0jsPdmITHSgy6IyUSx1zxnvZ4a_EfRuLn1AjAmG73ILu6WDLdK1aEr59HYzp4AKAZiGyWoyiJZ1hzpt6Ghvx4UfcHYVi1R7oE8sKf4KKbRAys4mzGio6Ubq",
  },
  {
    title: "Bedtime Wonder",
    charity: "Oxfam",
    image:
      "https://books.google.co.uk/books/content?id=nYKYzgEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE71GXa3HiazBOg-_8uoAhoeKnAfGRNaCIxz6lN4bS3ik76xfRZebfM8p4ndMeYe9M7T-VAMIfYCTRoAvSSu641JaetDGaWM7vM9bL5JC9YrlBSIHnKf_PJ4F_wQo7oxJQ7x-wF9J",
  },
];

let currentIndex = 0;
let intervalId;
let isPaused = false;

function updateCategory() {
  const categorySearchInput = document.getElementById("category-search-input");
  const categoryImage = document.getElementById("category-image");
  const categoryTitle = document.getElementById("category-title");
  const categoryCharity = document.getElementById("category-charity");

  // Fade out
  categoryTitle.style.opacity = 0;
  categoryImage.style.opacity = 0;
  categoryCharity.style.opacity = 0;

  // After the fade-out is complete (1 second), update the content and fade back in
  setTimeout(() => {
    categorySearchInput.placeholder = `Search for your next.. ${categories[currentIndex].title}`;
    categoryImage.src = categories[currentIndex].image;
    categoryTitle.textContent = categories[currentIndex].title;
    categoryCharity.textContent = `From ${categories[currentIndex].charity}`;

    // Fade back in
    categoryTitle.style.opacity = 1;
    categoryImage.style.opacity = 1;
    categoryCharity.style.opacity = 1;

    // Move to the next category, loop back to the beginning if at the end
    currentIndex = (currentIndex + 1) % categories.length;
  }, 450); // Match this with the duration of the fade-out
}

// Start the interval for category updates
function startInterval() {
  if (!isPaused) {
    intervalId = setInterval(updateCategory, 6000);
  }
}

// Pause or resume the animation
function togglePause() {
  const pauseButton = document.getElementById("pause-button");
  isPaused = !isPaused;

  if (isPaused) {
    clearInterval(intervalId); // Stop the interval
    pauseButton.innerHTML = 'Resume <i class="fa fa-play-circle-o"></i>'; // Change button text
  } else {
    startInterval(); // Restart the interval
    pauseButton.innerHTML = 'Pause <i class="fa fa-pause-circle-o"></i>'; // Change button text
  }
}

// Initialize
startInterval();
document.getElementById("pause-button").addEventListener("click", togglePause);
