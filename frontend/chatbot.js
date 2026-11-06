(() => {
  const launcher = document.getElementById("csChatLauncher");
  const panel = document.getElementById("csChatPanel");
  const closeBtn = document.getElementById("csChatClose");
  const form = document.getElementById("csChatForm");
  const input = document.getElementById("csChatInput");
  const messages = document.getElementById("csChatMessages");

  // Stop safely if the chatbot HTML has not been added yet.
  if (!launcher || !panel || !closeBtn || !form || !input || !messages) {
    console.warn("CampusSpace chatbot: Required HTML elements are missing.");
    return;
  }

  function openChat() {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    input.focus();
  }

  function closeChat() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
  }

  launcher.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);

  function addMessage(text, sender = "bot") {
    const message = document.createElement("div");
    message.className = `cs-chat-message ${sender}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function getBookings() {
    try {
      return JSON.parse(localStorage.getItem("campusBookings")) || [];
    } catch {
      return [];
    }
  }

  function getUser() {
    const possibleKeys = ["campusUser", "currentUser", "loggedInUser"];

    for (const key of possibleKeys) {
      try {
        const value = JSON.parse(localStorage.getItem(key));
        if (value) return value;
      } catch {
        // Ignore invalid stored data.
      }
    }

    return null;
  }

  function getAnswer(question) {
    const q = question.toLowerCase();

    if (/(hello|hi|hey|good morning|good evening)/.test(q)) {
      return "Hello! 👋 Welcome to CampusSpace. I can help you find rooms, make bookings, understand booking conflicts, and use your dashboard.";
    }

    if (/(who are you|what are you|your name)/.test(q)) {
      return "I'm the CampusSpace Assistant, a demo help chatbot designed to guide students and faculty through the room-booking system.";
    }

    if (/(how.*(book|reserve)|book.*room|reservation)/.test(q)) {
      return "To book a room:\n1. Select your role and log in.\n2. Choose a building.\n3. Select the date, start time, duration, and required capacity.\n4. Click Search Rooms.\n5. Choose an available room and click Book Room.\nCheck the booking details before confirming.";
    }

    if (/(available|availability|search room|find room|vacant)/.test(q)) {
      return "To find an available room, select your building, date, start time, duration, and capacity. Then click Search Rooms. The system should show rooms matching your requirements and availability.";
    }

    if (/(cancel|delete booking)/.test(q)) {
      return "Open your My Bookings or booking history section. Find the reservation you want to cancel and use the Cancel Booking option, if available.";
    }

    if (/(history|previous booking|my booking|booking details)/.test(q)) {
      const bookings = getBookings();
      const user = getUser();

      if (bookings.length === 0) {
        return "I couldn't find any saved bookings in this browser. Please check whether you are logged in and whether your booking was saved.";
      }

      return `I can see ${bookings.length} booking record(s) stored in this browser. Open your My Bookings or dashboard section to view the available booking details.`;
    }

    if (/(conflict|overlap|double booking|already booked)/.test(q)) {
      return "CampusSpace is designed to prevent overlapping reservations. If a room is already booked for the selected time, choose another available room or adjust your time slot.";
    }

    if (/(capacity|seats|students|people|strength)/.test(q)) {
      return "Enter the required number of seats or students in the capacity field before searching. Choose a room that can accommodate everyone.";
    }

    if (/(building|iet|deeksha)/.test(q)) {
      return "CampusSpace currently includes building options such as IET and Deeksha Bhawan. Select the building you need before searching for rooms.";
    }

    if (/(student|faculty|teacher|admin|administrator|role)/.test(q)) {
      return "CampusSpace provides role-based views for Students, Faculty, and Administrators. Select the appropriate role to access the relevant dashboard features. Note: this demo role selector is not a substitute for secure institutional authentication.";
    }

    if (/(alternative|suggestion|recommend|another room)/.test(q)) {
      return "If your preferred room is unavailable, search again using the same date and time. Try another building, a different time slot, or a smaller capacity requirement to find alternatives.";
    }

    if (/(login|log in|sign in|account)/.test(q)) {
      return "Use the login section on the CampusSpace page and select the appropriate user role. If your session does not remain active after refreshing, check the browser's local storage and login implementation.";
    }

    if (/(help|support|features|what can you do)/.test(q)) {
      return "I can guide you with:\n• Finding available rooms\n• Booking a room\n• Checking booking conflicts\n• Room capacity\n• Cancelling reservations\n• Booking history\n• Student, Faculty, and Admin dashboards\n\nAsk me any question about these features!";
    }

    if (/(thank|thanks)/.test(q)) {
      return "You're welcome! 😊 Happy booking with CampusSpace.";
    }

    return "I'm not sure I understood that question. Try asking about room booking, availability, cancellations, booking history, capacity, or user dashboards.";
  }

  function sendQuestion(question) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) return;

    addMessage(cleanQuestion, "user");

    const answer = getAnswer(cleanQuestion);

    setTimeout(() => {
      addMessage(answer, "bot");
    }, 250);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const question = input.value;
    input.value = "";

    sendQuestion(question);
  });

  messages.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chat-question]");

    if (button) {
      sendQuestion(button.dataset.chatQuestion);
    }
  });

  console.log("CampusSpace Assistant loaded successfully.");
})();