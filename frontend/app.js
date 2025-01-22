document.getElementById('url-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = document.getElementById('url').value;
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const bounds = document.getElementById('bounds').value;

    const response = await fetch('http://localhost:3000/api/urls/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title, category, bounds }),
    });    

    if (response.ok) {
        alert('URL and area saved!');
        fetchUrls();
    } else {
        alert('Error saving URL');
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

mapboxgl.accessToken = 'pk.eyJ1IjoiY29ub3JmYXJyIiwiYSI6ImNtNXpscGM1YTAzYmMyaXNieGw3b2hsMWEifQ.G3l0UcUEm8vO99yqQvf94Q';
const map = new mapboxgl.Map({
    container: 'map', 
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-122.4194, 37.7749], // San Francisco
    zoom: 13,
});

let pins = [];

// Add map click interaction for placing pins
map.on('click', (e) => {
    if (pins.length >= 4) {
        alert('You can only place 4 pins.');
        return;
    }

    const marker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat([e.lngLat.lng, e.lngLat.lat])
        .addTo(map);

    pins.push([e.lngLat.lng, e.lngLat.lat]);

    if (pins.length === 4) {
        document.getElementById('bounds').value = JSON.stringify(pins);
        alert('4 pins placed. Bounds captured.');
    }
});

// Reset pins if needed
function resetPins() {
    pins.forEach((pin) => pin.remove());
    pins = [];
    document.getElementById('bounds').value = '';
    alert('Pins reset. You can place new pins now.');
}

// Attach reset button (optional)
const resetButton = document.createElement('button');
resetButton.textContent = 'Reset Pins';
resetButton.style.position = 'absolute';
resetButton.style.top = '10px';
resetButton.style.right = '10px';
resetButton.addEventListener('click', resetPins);
document.body.appendChild(resetButton);

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
