document.getElementById('url-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = document.getElementById('url').value;
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;

    const response = await fetch('http://localhost:3000/api/urls/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title, category })
    });    

    if (response.ok) {
        alert('URL logged!');
        fetchUrls();
    } else {
        alert('Error logging URL');
    }
});

async function fetchUrls() {
    const response = await fetch('http://localhost:3000/api/urls');
    const urls = await response.json();

    const urlList = document.getElementById('url-list');
    urlList.innerHTML = urls.map(url => `
        <div>
            <p><strong>${url.title || url.url}</strong></p>
            <p>${url.url}</p>
            <p>Category: ${url.category}</p>
            <p>Logged at: ${url.created_at}</p>
        </div>
    `).join('');
}

fetchUrls();

let map, drawingManager, selectedArea;

// Initialize Google Map and Drawing Tools
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.7749, lng: -122.4194 }, // Default center (San Francisco)
        zoom: 13,
    });

    // Initialize the Drawing Manager
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.RECTANGLE],
        },
        rectangleOptions: {
            editable: true,
            draggable: true,
        },
    });

    drawingManager.setMap(map);

    // Capture the rectangle coordinates when it's drawn
    google.maps.event.addListener(drawingManager, "overlaycomplete", (event) => {
        if (selectedArea) {
            selectedArea.setMap(null); // Remove the previous rectangle
        }
        selectedArea = event.overlay;

        // Get the rectangle's bounds
        const bounds = selectedArea.getBounds();
        document.getElementById("north").value = bounds.getNorthEast().lat();
        document.getElementById("south").value = bounds.getSouthWest().lat();
        document.getElementById("east").value = bounds.getNorthEast().lng();
        document.getElementById("west").value = bounds.getSouthWest().lng();
    });
}

// Save the URL and area to the backend
document.getElementById("url-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const url = document.getElementById("url").value;
    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const north = document.getElementById("north").value;
    const south = document.getElementById("south").value;
    const east = document.getElementById("east").value;
    const west = document.getElementById("west").value;

    const response = await fetch("http://localhost:3000/api/urls/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title, category, north, south, east, west }),
    });

    if (response.ok) {
        alert("URL and area saved!");
    } else {
        alert("Error saving URL");
    }
});

// Check if the user's current location is within any valid area
document.getElementById("check-location").addEventListener("click", async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const response = await fetch("http://localhost:3000/api/urls/check-location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ latitude, longitude }),
            });

            const data = await response.json();

            if (data.valid) {
                alert("You are in a valid area. Accessible URLs: " + data.urls.map((u) => u.url).join(", "));
            } else {
                alert(data.message);
            }
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

// Initialize the map when the page loads
initMap();
