/* ==========================================================================
   Majestic Hotel — interface behaviour
   Header state, mobile navigation, booking enquiry and scroll reveals.
   ========================================================================== */

const header = document.getElementById("siteHeader");
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");

/* ---------- Header background on scroll ---------- */
const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

/* ---------- Mobile navigation ---------- */
const setNav = (open) => {
  primaryNav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("nav-open", open);
};

navToggle.addEventListener("click", () => {
  setNav(navToggle.getAttribute("aria-expanded") !== "true");
});

primaryNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setNav(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
    setNav(false);
    navToggle.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 880) setNav(false);
});

/* ---------- Quick booking ---------- */
const bookingForm = document.getElementById("bookingForm");
const checkinInput = document.getElementById("checkin");
const checkoutInput = document.getElementById("checkout");
const guestsSelect = document.getElementById("guests");
const roomsInput = document.getElementById("roomCount");
const statusOutput = document.getElementById("bookingStatus");
const stepButtons = document.querySelectorAll("[data-step]");

const toISO = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const today = new Date();
const arrival = addDays(today, 7);
const departure = addDays(today, 9);

checkinInput.min = toISO(today);
checkoutInput.min = toISO(today);
checkinInput.value = toISO(arrival);
checkoutInput.value = toISO(departure);

const showStatus = (message, isError = false) => {
  statusOutput.textContent = message;
  statusOutput.classList.toggle("is-error", isError);
};

const syncStepper = () => {
  const value = Number(roomsInput.value);
  stepButtons.forEach((button) => {
    const step = Number(button.dataset.step);
    const next = value + step;
    button.disabled = next < Number(roomsInput.min) || next > Number(roomsInput.max);
  });
};

stepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const next = Number(roomsInput.value) + Number(button.dataset.step);
    const min = Number(roomsInput.min);
    const max = Number(roomsInput.max);
    roomsInput.value = String(Math.min(max, Math.max(min, next)));
    syncStepper();
  });
});

syncStepper();

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const arrivalValue = checkinInput.value;
  const departureValue = checkoutInput.value;

  if (!arrivalValue || !departureValue) {
    showStatus("Please choose your check-in and check-out dates.", true);
    return;
  }

  if (departureValue <= arrivalValue) {
    showStatus("Your check-out date must be after your check-in date.", true);
    checkoutInput.focus();
    return;
  }

  const nights = Math.round(
    (new Date(departureValue) - new Date(arrivalValue)) / 86400000
  );
  const rooms = Number(roomsInput.value);
  const guestLabel = guestsSelect.options[guestsSelect.selectedIndex].textContent;

  showStatus(
    `Enquiry received — ${rooms} ${rooms === 1 ? "room" : "rooms"}, ${guestLabel}, ` +
      `${formatDate(arrivalValue)} to ${formatDate(departureValue)} ` +
      `(${nights} ${nights === 1 ? "night" : "nights"}). Our reservations team will confirm availability by email shortly.`
  );
});

/* ---------- Scroll reveals ---------- */
const revealItems = document.querySelectorAll("[data-reveal]");
const staggerGroups = document.querySelectorAll(".room-grid, .feature-grid, .gallery-grid");

staggerGroups.forEach((group) => {
  [...group.children].forEach((child, index) => {
    child.style.setProperty("--reveal-delay", `${(index % 3) * 110}ms`);
  });
});

if (
  "IntersectionObserver" in window &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = String(new Date().getFullYear());
