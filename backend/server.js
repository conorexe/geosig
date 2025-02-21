const express = require('express');
const path = require('path');
const db = require('./config/db');

const app = express();
app.use(express.json());


app.use(express.static(path.join(__dirname, '../frontend')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/about.html'));
});


app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/contact.html'));
});

const urlRoutes = require('./routes/urls');
app.use('/api/urls', urlRoutes);


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


db.query('SELECT 1', (err, result) => {
    if (err) {
        console.error('failed:', err.message);
    } else {
        console.log('successful.');
    }
});