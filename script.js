const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.2 });

// Observe any static .card elements (home page)
document.querySelectorAll(".card").forEach(card => observer.observe(card));

let books = [];

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


const bookList = document.getElementById("book-list");
const monthPicker = document.getElementById("month-picker");
const filterSelect = document.getElementById("time-filter");
const sortSelect = document.getElementById("sort-order");
sortSelect.addEventListener("change", filterBooks);

filterSelect.addEventListener("change", () => {
  if (filterSelect.value === "specific-month") {
    monthPicker.style.display = "inline-block";
  } else {
    monthPicker.style.display = "none";
    filterBooks(); // re-filter immediately
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
  let filtered = books;

  if (filter === "this-month") {
    filtered = books.filter(book => {
      const date = parseDate(book.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  } else if (filter === "last-3-months") {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    filtered = books.filter(book => parseDate(book.date) >= threeMonthsAgo);
  } else if (filter === "this-year") {
    filtered = books.filter(book => parseDate(book.date).getFullYear() === now.getFullYear());
  } else if (filter === "specific-month") {
    if (monthPicker.value) {
      // const selected = new Date(monthPicker.value + "-01"); // YYYY-MM → first of month
      const [year, month] = monthPicker.value.split("-").map(Number);
      const selected = new Date(year, month - 1, 1); // month-1 because JS months are 0-indexed
      filtered = books.filter(book => {
        const date = parseDate(book.date);
        return date.getMonth() === selected.getMonth() && date.getFullYear() === selected.getFullYear();
      });
    } else {
      filtered = []; // no month selected yet
    }
  }

  // Sort by date
  filtered.sort((a, b) => {
    if (sortOrder.startsWith("date")) {
      const diff = parseDate(a.date) - parseDate(b.date);
      return sortOrder === "date-asc" ? diff : -diff;
    } else if (sortOrder.startsWith("rating")) {
      const diff = (a.rating || 0) - (b.rating || 0); // default 0 if no rating
      return sortOrder === "rating-asc" ? diff : -diff;
    }
  });

  renderBooks(filtered);
}


// Initialize
filterSelect.addEventListener("change", filterBooks);
loadBooks(); // default display