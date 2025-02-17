const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'host',
    user: 'user',
    password: 'pass',
    database: 'url_logger'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        process.exit(1);
    }
    console.log('Connected to database');
});

module.exports = db;