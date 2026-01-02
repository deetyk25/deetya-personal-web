const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.2 });

// Observe any static .card elements (home page)
document.querySelectorAll(".card").forEach(card => observer.observe(card));

// books
let books = [];

const bookList = document.getElementById("book-list");
const monthPicker = document.getElementById("month-picker");
const filterSelect = document.getElementById("time-filter");
const sortSelect = document.getElementById("sort-order");

async function loadBooks() {
  const res = await fetch("books2025.json");
  books = await res.json();

  setupBookOfMonth();
  filterBooks();
}

function setupBookOfMonth() {
  if (!books.length) return;

  const mostRecent = [...books].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )[0];

  document.getElementById("featured-book").innerHTML = `
    <strong>${mostRecent.title}</strong> by ${mostRecent.author}
  `;
}


sortSelect.addEventListener("change", filterBooks);

filterSelect.addEventListener("change", () => {
  if (filterSelect.value === "specific-time") {
    monthPicker.style.display = "inline-block";
  } else {
    monthPicker.style.display = "none";
    filterBooks();
  }
});


monthPicker.addEventListener("change", filterBooks);


function parseDate(dateStr) {
  return new Date(dateStr.replaceAll("/", "-"));
}

function renderBooks(filteredBooks) {
  bookList.innerHTML = "";

  filteredBooks.forEach(book => {
    const card = document.createElement("div");
    card.className = "book-card";

    card.innerHTML = `
      <h4>${book.title}</h4>
      <p>${book.author}</p>
      <p><em>${parseDate(book.date).toLocaleDateString()}</em></p>
      ${book.rating ? `<p>⭐ ${book.rating}</p>` : ""}
    `;

    bookList.appendChild(card);
    observer.observe(card);
  });
}

function filterBooks() {
  const filter = filterSelect.value;
  const sortOrder = sortSelect.value;
  const now = new Date();
  let filtered = [...books];

  if (filter === "this-month") {
    filtered = filtered.filter(book => {
      const d = parseDate(book.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });
  }

  else if (filter === "this-year") {
    filtered = filtered.filter(book =>
      parseDate(book.date).getFullYear() === now.getFullYear()
    );
  }

  else if (filter === "specific-time") {
    if (!monthPicker.value) {
      filtered = [];
    } else {
      const [year, month] = monthPicker.value.split("-").map(Number);
      filtered = filtered.filter(book => {
        const d = parseDate(book.date);
        return (
          d.getFullYear() === year &&
          d.getMonth() === month - 1
        );
      });
    }
  }

  // Sorting
  filtered.sort((a, b) => {
    if (sortOrder === "date-asc") {
      return parseDate(a.date) - parseDate(b.date);
    }
    if (sortOrder === "date-desc") {
      return parseDate(b.date) - parseDate(a.date);
    }
    if (sortOrder === "rating-asc") {
      return (a.rating || 0) - (b.rating || 0);
    }
    if (sortOrder === "rating-desc") {
      return (b.rating || 0) - (a.rating || 0);
    }
  });

  renderBooks(filtered);
}



// Initialize
loadBooks(); // default display

