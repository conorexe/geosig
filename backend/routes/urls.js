const express = require('express');
const db = require('../config/db');

const router = express.Router();


router.post('/add', (req, res) => {
    const { url, title, category, bounds } = req.body;
    try {
        const [sw, ne] = JSON.parse(bounds);
        const [west, south] = sw; 
        const [east, north] = ne;  

        const sql = `INSERT INTO urls
            (url, title, category, south, west, north, east)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.query(sql,
            [url, title, category, south, west, north, east],
            (err, result) => {
                if (err) {
                    console.error('Insert error:', err.message);
                    return res.status(500).send('Server error');
                }
                res.status(201).send('URL logged with area bounds!');
            }
        );
    } catch (error) {
        console.error('parsing error:', error);
        res.status(400).send('Invalid format');
    }
});





router.get('/', (req, res) => {
    const sql = 'SELECT * FROM urls';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Fetch error:', err.message);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});

router.get('/check-url', (req, res) => {
    const { url, latitude, longitude } = req.query;

    if (!url || !latitude || !longitude) {
        return res.status(400).json({
            error: 'Missing required parameters'
        });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
            error: 'Invalid coordinates'
        });
    }

    const sql = 'SELECT * FROM urls WHERE url = ?';
    db.query(sql, [url], (err, results) => {
        if (err) {
            console.error('DB query error:', err.message);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(404).json({
                exists: false,
                message: 'URL not found'
            });
        }

        let withinBounds = false;
        for (const entry of results) {
            const { south, west, north, east } = entry;

            if ([south, west, north, east].some(coord => isNaN(coord))) {
                console.error('Invalid bounds in entry:', entry.id);
                continue;
            }

            const withinLat = lat >= south && lat <= north;
            const withinLng = lng >= west && lng <= east;

            console.log(`Checking bounds:
                Lat ${lat} between ${south}-${north}: ${withinLat}
                Lng ${lng} between ${west}-${east}: ${withinLng}
            `);

            if (withinLat && withinLng) {
                withinBounds = true;
                break;
            }
        }

        res.status(200).json({
            exists: true,
            withinBounds: withinBounds,
            message: withinBounds ? "url within  bounds" : "URL  outside bounds"
        });
    });
});



router.get('/check-location', (req, res) => {
    const { lat, lng } = req.query; 

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Missing latitude/longitude' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: 'Invalid latitude/longitude' });
    }

    const sql = `SELECT * FROM urls WHERE ? BETWEEN south AND north AND ? BETWEEN west AND east`;

    db.query(sql, [latitude, longitude], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'error' });
        }

        res.status(200).json({
            valid: results.length > 0,
            urls: results
        });
    });
});


router.get('/get-areas', (req, res) => {
    const sql = `SELECT title, south, west, north, east FROM urls`;

    db.query(sql, (err, results) => {
        if (err) {

            return res.status(500).json({ error: 'error' });
        }

        res.status(200).json({
            success: true,
            areas: results
        });
    });
});


module.exports = router;


