const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Add URL

router.post('/add', (req, res) => {
    const { url, title, category, north, south, east, west } = req.body;

    const sql = 'INSERT INTO urls (url, title, category, north, south, east, west) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [url, title, category, north, south, east, west], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err.message);
            return res.status(500).send('Server error');
        }
        res.status(201).send('URL logged with area bounds!');
    });
});

router.post('/check-location', (req, res) => {
    const { latitude, longitude } = req.body;

    const sql = `
        SELECT * FROM urls
        WHERE ? BETWEEN south AND north
        AND ? BETWEEN west AND east
    `;
    db.query(sql, [latitude, longitude], (err, results) => {
        if (err) {
            console.error('Error checking location:', err.message);
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            res.status(200).json({ valid: true, urls: results });
        } else {
            res.status(404).json({ valid: false, message: 'No URLs available in this area.' });
        }
    });
});


// Get all URLs
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM urls';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});

router.post('/check-url', (req, res) => {
    const { url } = req.body;

    const sql = 'SELECT * FROM urls WHERE url = ?';
    db.query(sql, [url], (err, results) => {
        if (err) {
            console.error('Error checking URL:', err.message);
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            res.status(200).json({ exists: true });
        } else {
            res.status(404).json({ exists: false });
        }
    });
});




module.exports = router;
