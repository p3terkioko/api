const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');

const app = express();
const port = 3000;

// Database connection configuration
const dbConfig = {
    host: 'bookapi.mysql.database.azure.com',
    user: 'peter',
    password: 'ecovanguard1%',
    database: 'HotelBooking',
    ssl: {
        rejectUnauthorized: false // Ignore SSL certificate validation (not recommended for production)
    },
    connectTimeout: 20000 // Increase the connection timeout to 20 seconds
};

// Create a connection to the database
const connection = mysql.createConnection(dbConfig);

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

app.use(express.json());

// Create Room
app.post('/room', (req, res) => {
    const { room_number, status } = req.body;
    connection.query('INSERT INTO Room (room_number, status) VALUES (?, ?)', [room_number, status], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).send({ roomid: result.insertId });
    });
});

// Create Client
app.post('/client', (req, res) => {
    const { name, email } = req.body;
    connection.query('INSERT INTO Client (name, email) VALUES (?, ?)', [name, email], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).send({ clientid: result.insertId });
    });
});

// Create Booking
app.post('/booking', (req, res) => {
    const { clientid, roomid, checkin_date, checkout_date, amount, currency } = req.body;
    connection.query('INSERT INTO Booking (clientid, roomid, checkin_date, checkout_date, amount, currency) VALUES (?, ?, ?, ?, ?, ?)',
        [clientid, roomid, checkin_date, checkout_date, amount, currency], (err, result) => {
            if (err) return res.status(500).send(err);
            res.status(201).send({ bookingid: result.insertId });
        });
});

// Get available rooms
app.get('/rooms', (req, res) => {
    const { status } = req.query;
    connection.query('SELECT * FROM Room WHERE status = 0', [status], (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).json(results);
    });
});

// Retrieve all rooms, clients, and bookings
app.get('/all/l', (req, res) => {
    const results = {};
    connection.query('SELECT * FROM Room', (err, rooms) => {
        if (err) return res.status(500).send(err);
        results.rooms = rooms;

        connection.query('SELECT * FROM Client', (err, clients) => {
            if (err) return res.status(500).send(err);
            results.clients = clients;

            connection.query('SELECT * FROM Booking', (err, bookings) => {
                if (err) return res.status(500).send(err);
                results.bookings = bookings;

                res.status(200).json(results);
            });
        });
    });
});

// Retrieve booking confirmation
app.get('/booking/confirmation', (req, res) => {
    const { clientid } = req.query;
    connection.query('SELECT COUNT(*) AS roomsBooked, SUM(amount) AS totalAmount FROM Booking WHERE clientid = ?', [clientid], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status
        .status(200)
        .json(result[0]);
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

