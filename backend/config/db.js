const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'geosig-geo-url.cvuqoww6smw2.eu-north-1.rds.amazonaws.com',
    user: 'admin',            // RDS username
    password: 'Pass12*$', // RDS password
    database: 'LinkLogger'    // Database name
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        process.exit(1);
    }
    console.log('Connected to AWS RDS database');
});

module.exports = db;
