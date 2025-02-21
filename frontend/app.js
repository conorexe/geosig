mapboxgl.accessToken = 'pk.eyJ1IjoiY29ub3JmYXJyIiwiYSI6ImNtNXpscGM1YTAzYmMyaXNieGw3b2hsMWEifQ.G3l0UcUEm8vO99yqQvf94Q';


document.addEventListener('DOMContentLoaded', () => {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-6.2603, 53.3498],
        zoom: 10,
    });

    map.addControl(new mapboxgl.NavigationControl());
    let drawMode = false;
    let isDrawing = false;
    let startLngLat = null;
    const coordDisplay = document.getElementById('coordinate-display');
    const drawToggle = document.getElementById('draw-toggle');

    
    drawToggle.addEventListener('click', () => {
        drawMode = !drawMode;
        drawToggle.textContent = drawMode ? 'Disable Drawing' : 'Enable Drawing';


        map[drawMode ? 'dragPan.disable' : 'dragPan.enable']();
        map[drawMode ? 'touchZoomRotate.disable' : 'touchZoomRotate.enable']();
        map.getCanvas().style.cursor = drawMode ? 'crosshair' : 'grab';

        if (!drawMode) {
            resetSelection();
            map.getCanvas().style.cursor = 'grab';
        }
    });


    map.on('mousedown', (e) => {
        if (!drawMode) return;
        e.preventDefault();

        isDrawing = true;
        startLngLat = e.lngLat;
        coordDisplay.textContent = `Start: ${e.lngLat.lng.toFixed(10)}, ${e.lngLat.lat.toFixed(10)}`;


        if (map.getSource('rect')) {
            map.removeLayer('rect');
            map.removeSource('rect');
        }


        map.addSource('rect', {
            type: 'geojson',
            data: createGeoJSON(startLngLat, startLngLat)
        });

        map.addLayer({
            id: 'rect',
            type: 'fill',
            source: 'rect',
            paint: {
                'fill-color': '#088',
                'fill-opacity': 0.4,
                'fill-outline-color': '#000'
            }
        }, 'poi-label');
    });

    map.on('mousemove', (e) => {
        if (!drawMode || !isDrawing) return;
        e.preventDefault();


        const current = e.lngLat;
        coordDisplay.textContent =
            `Start: ${startLngLat.lng.toFixed(10)}, ${startLngLat.lat.toFixed(10)}\n` +
            `Current: ${current.lng.toFixed(10)}, ${current.lat.toFixed(10)}`;


        if (map.getSource('rect')) {
            map.getSource('rect').setData(createGeoJSON(startLngLat, current));
        }
    });

    map.on('mouseup', (e) => {
        if (!drawMode || !isDrawing) return;
        e.preventDefault();

        isDrawing = false;
        const endLngLat = e.lngLat;


        const sw = [
            Math.min(startLngLat.lng, endLngLat.lng),
            Math.min(startLngLat.lat, endLngLat.lat)
        ];
        const ne = [
            Math.max(startLngLat.lng, endLngLat.lng),
            Math.max(startLngLat.lat, endLngLat.lat)
        ];


        document.getElementById('bounds').value = JSON.stringify([sw, ne]);
        coordDisplay.textContent = `Selected area: SW ${sw[0].toFixed(10)}, ${sw[1].toFixed(10)} | NE ${ne[0].toFixed(10)}, ${ne[1].toFixed(10)}`;
    });


    document.getElementById('url-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!document.getElementById('bounds').value) {
            alert('Please select an area first!');
            return;
        }

        try {
            const response = await fetch('https://geosig.xyz/api/urls/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: document.getElementById('url').value,
                    title: document.getElementById('title').value,
                    category: document.getElementById('category').value,
                    bounds: document.getElementById('bounds').value
                }),
            });

            if (response.ok) {
                alert('URL and area saved!');
                resetSelection();
                fetchUrls();
            } else {
                alert('Error saving URL: ' + (await response.text()));
            }
        } catch (error) {
            alert('Network error: ' + error.message);
        }
    });


    function resetSelection() {
        if (map.getSource('rect')) {
            map.removeLayer('rect');
            map.removeSource('rect');
        }
        document.getElementById('bounds').value = '';
        coordDisplay.textContent = 'Drag to select area';
        isDrawing = false;
        startLngLat = null;
    }


    const resetBtn = document.createElement('button');
    resetBtn.className = 'map-control';
    resetBtn.textContent = 'Reset Selection';
    resetBtn.style.right = '10px';
    resetBtn.addEventListener('click', resetSelection);
    document.body.appendChild(resetBtn);
});


function createGeoJSON(start, end) {
    return {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [start.lng, start.lat],
                    [end.lng, start.lat],
                    [end.lng, end.lat],
                    [start.lng, end.lat],
                    [start.lng, start.lat]
                ]]
            }
        }]
    };
}


async function fetchUrls() {
    try {
        const response = await fetch('https://geosig.xyz/api/urls');
        const urls = await response.json();

        const urlList = document.getElementById('url-list');
        urlList.innerHTML = urls.map(url => `
            <div class="url-item">
                <h3>${url.title || url.url}</h3>
                <p><a href="${url.url}" target="_blank">${url.url}</a></p>
                <p>Category: ${url.category}</p>
                <p>Area: ${JSON.parse(url.bounds).map(b => `(${b[0].toFixed(10)}, ${b[1].toFixed(10)})`).join(' - ')}</p>
                <small>Created: ${new Date(url.created_at).toLocaleString()}</small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching URLs:', error);
    }
}


fetchUrls();

