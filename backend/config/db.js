const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: '' //credentials upon request!
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        process.exit(1);
    }
    console.log('Connected to database');
});

module.exports = db;