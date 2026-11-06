// CampusSpace - Room Availability System

const searchForm = document.getElementById("searchForm");
const roomResults = document.getElementById("roomResults");

// Sample classroom database
// CampusSpace Room Database

// Actual Campus Room Database
// Unspecified capacities are DEMO TEST VALUES.

const rooms = [

    // IET - First Floor
    {id:"IET-22", building:"IET", name:"IET22", floor:"First Floor", capacity:75},
    {id:"IET-16", building:"IET", name:"IET16", floor:"First Floor", capacity:75},
    {id:"IET-14", building:"IET", name:"IET14", floor:"First Floor", capacity:75},
    {id:"IET-15", building:"IET", name:"IET15", floor:"First Floor", capacity:75},
    {id:"IET-20", building:"IET", name:"IET20", floor:"First Floor", capacity:75},
    {id:"IET-19", building:"IET", name:"IET19", floor:"First Floor", capacity:75},
    {id:"IET-18", building:"IET", name:"IET18", floor:"First Floor", capacity:75},
    {id:"IET-17", building:"IET", name:"IET17", floor:"First Floor", capacity:75},

    // IET - Second Floor
    {id:"IET-32", building:"IET", name:"Seminar Hall IET32", floor:"Second Floor", capacity:200},
    {id:"IET-24", building:"IET", name:"IET24", floor:"Second Floor", capacity:75},
    {id:"IET-25", building:"IET", name:"IET25", floor:"Second Floor", capacity:75},
    {id:"IET-30", building:"IET", name:"IET30", floor:"Second Floor", capacity:75},
    {id:"IET-29", building:"IET", name:"IET29", floor:"Second Floor", capacity:75},
    {id:"IET-28", building:"IET", name:"IET28", floor:"Second Floor", capacity:75},
    {id:"IET-23", building:"IET", name:"IET23", floor:"Second Floor", capacity:75},

    // IET - Ground Floor
    {id:"IET-LIB", building:"IET", name:"Library", floor:"Ground Floor", capacity:165},

    // IET Laboratories (Demo values)
    {id:"IET-CSE", building:"IET", name:"CSE Lab", floor:"First Floor", capacity:40},
    {id:"IET-ME", building:"IET", name:"ME Lab", floor:"First Floor", capacity:40},
    {id:"IET-ECE", building:"IET", name:"ECE Lab", floor:"First Floor", capacity:40},
    {id:"IET-IT", building:"IET", name:"IT Lab", floor:"First Floor", capacity:40},

    // Deeksha Bhawan - Ground and First Floors
    ...Array.from({length:14}, (_, i) => ({
        id: `DB-LH${String(i+1).padStart(2,"0")}`,
        building: "Deeksha Bhawan",
        name: `LH${String(i+1).padStart(2,"0")}`,
        floor: i < 7 ? "Ground Floor" : "First Floor",
        capacity: 60
    }))

];

// Store bookings in browser
let bookings = JSON.parse(localStorage.getItem("campusBookings")) || [];

searchForm.addEventListener("submit", function(event) {

event.preventDefault();

const currentUser = JSON.parse(localStorage.getItem("campusUser"));

if (!currentUser) {
    alert("Please login before searching for rooms!");
    openLogin();
    return;
}

const role = currentUser.role;

const building = document.getElementById("building").value;
const date = document.getElementById("date").value;
const startTime = document.getElementById("startTime").value;
const duration = Number(document.getElementById("duration").value);
const capacity = Number(document.getElementById("capacity").value);

if (!date || !startTime || duration <= 0 || capacity <= 0) {
    roomResults.innerHTML = "<p>Please enter valid search details.</p>";
    return;
}

const start = startTime.split(":").reduce(
    (h, m) => Number(h) * 60 + Number(m)
);

const end = start + duration * 60;

// Find matching rooms
const availableRooms = rooms.filter(room => {

    const buildingMatch =
        building.toLowerCase().includes(room.building.toLowerCase()) ||
        room.building.toLowerCase().includes(building.toLowerCase());

    const capacityMatch = room.capacity >= capacity;

    const conflict = bookings.some(booking => {

        if (booking.roomId !== room.id || booking.date !== date) {
            return false;
        }

        const bookingStart = booking.start;
        const bookingEnd = booking.end;

        return start < bookingEnd && end > bookingStart;
    });

    return buildingMatch && capacityMatch && !conflict;
});

// Display results
if (availableRooms.length === 0) {

    roomResults.innerHTML = `
        <div class="card">
            <h3>No Available Rooms</h3>
            <p>Sorry! No matching rooms are available.</p>
            <p>Try changing the date, time or capacity.</p>
        </div>
    `;

    return;
}

roomResults.innerHTML = `
    <h2>Available Rooms</h2>
    ${availableRooms.map(room => `
        <div class="card">
            <h3>${room.name}</h3>
            <p>Building: ${room.building}</p>
            <p>Room ID: ${room.id}</p>
            <p>Capacity: ${room.capacity} students</p>
            <p>Date: ${date}</p>
            <p>Time: ${startTime}</p>
            <button onclick="bookRoom('${room.id}', '${date}', ${start}, ${end})">
                Book Room
            </button>
        </div>
    `).join("")}
`;

});

// Book a room
function bookRoom(roomId, date, start, end) {

const conflict = bookings.some(booking =>
    booking.roomId === roomId &&
    booking.date === date &&
    start < booking.end &&
    end > booking.start
);

if (conflict) {
    alert("Sorry! This room has already been booked.");
    return;
}

const currentUser = JSON.parse(
    localStorage.getItem("campusUser") || "null"
);

bookings.push({
    roomId,
    date,
    start,
    end,
    email: currentUser ? currentUser.email : ""
});

localStorage.setItem("campusBookings", JSON.stringify(bookings));

displayMyBookings();

alert("Room booked successfully!");

roomResults.innerHTML = `
    <div class="card">
        <h2>Booking Successful!</h2>
        <p>Room: ${roomId}</p>
        <p>Date: ${date}</p>
        <p>Your demo booking has been saved.</p>
        
    </div>
`;
setTimeout(() => {
    roomResults.innerHTML = "";
}, 3000);

}

const userRole = document.getElementById("userRole");

userRole.addEventListener("change", function () {
    const role = userRole.value;

    if (role === "student") {
        alert("Welcome Student! You can search for available rooms.");
    }
    else if (role === "faculty") {
        alert("Welcome Faculty! You can reserve rooms for academic purposes.");
    }
    else if (role === "admin") {
        alert("Welcome Administrator! You can manage room records.");
    }
});

// Display My Bookings
function displayMyBookings() {
    const section = document.getElementById("bookings");

    if (!section) return;

    const currentUser = JSON.parse(
        localStorage.getItem("campusUser") || "null"
    );

    const allBookings = JSON.parse(
        localStorage.getItem("campusBookings") || "[]"
    );

    if (!currentUser) {
        section.innerHTML = "<p>Please login to view your bookings.</p>";
        return;
    }

    const userBookings = allBookings
        .map((booking, index) => ({ ...booking, originalIndex: index }))
        .filter(booking => booking.email === currentUser.email);

    section.innerHTML = `
        <h2>My Bookings</h2>
        ${
            userBookings.length === 0
            ? "<p>No bookings found.</p>"
            : userBookings.map(booking => `
                <div class="room-card">
                    <h3>${booking.roomId || booking.id || "Booked Room"}</h3>
                    <p>Date: ${booking.date || "N/A"}</p>
                    <p>Start: ${booking.startTime || booking.start || "N/A"}</p>
                    <button onclick="cancelBooking(${booking.originalIndex})">
                        Cancel Booking
                    </button>
                </div>
            `).join("")
        }
    `;
}

// Cancel Booking
function cancelBooking(index) {
    let bookings = JSON.parse(localStorage.getItem("campusBookings")) || [];

    bookings.splice(index, 1);

    localStorage.setItem("campusBookings", JSON.stringify(bookings));

    alert("Booking cancelled successfully!");

    displayMyBookings();
}

displayMyBookings();


// Cancel Booking
function cancelBooking(index) {
    let bookings = JSON.parse(localStorage.getItem("campusBookings")) || [];

    bookings.splice(index, 1);

    localStorage.setItem("campusBookings", JSON.stringify(bookings));

    displayMyBookings();
}

displayMyBookings();

// Open Login Popup
function openLogin() {
    document.getElementById("loginModal").style.display = "block";
}

// Close Login Popup
function closeLogin() {
    document.getElementById("loginModal").style.display = "none";
}

// Login User
function loginUser() {

    const role = document.getElementById("loginRole").value;
    const email = document.getElementById("loginEmail").value.trim();

    if (!role || !email) {
        alert("Please select your role and enter your email!");
        return;
    }

    const user = {
        role: role,
        email: email
    };

    // Save login information
    localStorage.setItem("campusUser", JSON.stringify(user));

    // Hide all dashboards
    document.getElementById("studentDashboard").style.display = "none";
    document.getElementById("facultyDashboard").style.display = "none";
    document.getElementById("adminDashboard").style.display = "none";

    // Display correct dashboard
    document.getElementById(role + "Dashboard").style.display = "block";

    // Display user information
    document.getElementById(role + "UserInfo").innerText =
        "Logged in as: " + email;

    closeLogin();

    alert("Welcome to CampusSpace!");

}

// Logout function
function logoutUser() {
    localStorage.removeItem("campusUser");

    document.getElementById("studentDashboard").style.display = "none";
    document.getElementById("facultyDashboard").style.display = "none";
    document.getElementById("adminDashboard").style.display = "none";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    alert("You have been logged out successfully!");

    openLogin();
}
function showRooms() {
    document.getElementById("rooms").scrollIntoView({
        behavior: "smooth"
    });
}

function showBookings() {
    document.getElementById("myBookings").scrollIntoView({
        behavior: "smooth"
    });
}

// Restore Login Session After Refresh
function restoreLoginSession() {
    const currentUser = JSON.parse(
        localStorage.getItem("campusUser") || "null"
    );

    if (!currentUser) return;

    document.getElementById("studentDashboard").style.display = "none";
    document.getElementById("facultyDashboard").style.display = "none";
    document.getElementById("adminDashboard").style.display = "none";

    const dashboard = document.getElementById(
        currentUser.role + "Dashboard"
    );

    const userInfo = document.getElementById(
        currentUser.role + "UserInfo"
    );

    if (dashboard) dashboard.style.display = "block";

    if (userInfo) {
        userInfo.innerText = "Logged in as: " + currentUser.email;
    }

    displayMyBookings();
}

window.addEventListener("DOMContentLoaded", restoreLoginSession);