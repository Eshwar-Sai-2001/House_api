const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Eshwar@394',
    database: 'house_database',
    charset: 'utf8mb4'
});

db.connect((err) => {
    if (err) {
        console.error('Unable to connect to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Swagger setup
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'House API',
            version: '1.0.0',
            description: 'API documentation for managing houses',
        },
    },
    apis: ['app.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 1. Upload house Details
/**
 * @swagger
 * /houses:
 *   post:
 *     summary: Upload house details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               owner_name:
 *                 type: string
 *               owner_phone_number:
 *                 type: string
 *               area:
 *                 type: string
 *               sale_price:
 *                 type: integer
 *               negotiable:
 *                 type: boolean
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 */
app.post('/houses', async (req, res) => {
    try {
        const { owner_name, owner_phone_number, area, sale_price, negotiable } = req.body;
        const query = 'INSERT INTO houses (owner_name, owner_phone_number, area, sale_price, negotiable) VALUES (?, ?, ?, ?, ?)';
        const [results] = await db.promise().execute(query, [owner_name,owner_phone_number, area, sale_price, negotiable]);
        res.status(201).json({ id: results.insertId });
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Get house Details
/**
 * @swagger
 * /houses/{id}:
 *   get:
 *     summary: Get house details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.get('/houses/:id', async (req, res) => {
    try {
        const houseId = req.params.id;
        const query = 'SELECT * FROM houses WHERE id = ?';
        const [results] = await db.promise().execute(query, [houseId]);
        if (results.length === 0) {
            res.status(404).json({ error: 'House not found' });
        } else {
            res.status(200).json(results[0]);
        }
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. List All houses
/**
 * @swagger
 * /houses:
 *   get:
 *     summary: List all houses
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
app.get('/houses', async (req, res) => {
    try {
        const query = 'SELECT * FROM houses';
        const [results] = await db.promise().execute(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 4. Update house details
/**
 * @swagger
 * /houses/{id}:
 *   put:
 *     summary: Update house details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.put('/houses/:id', async (req, res) => {
    try {
        const houseId = req.params.id;
        const { status, sale_price, owner_phone_number } = req.body;

        // Build the dynamic update query based on the provided fields
        const updateFields = [];
        const updateValues = [];

        if (status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }

        if (sale_price !== undefined) {
            updateFields.push('sale_price = ?');
            updateValues.push(sale_price);
        }

        if (owner_phone_number !== undefined) {
            updateFields.push('owner_phone_number = ?');
            updateValues.push(owner_phone_number);
        }

        if (updateFields.length === 0) {
            // If no fields to update were provided in the request payload
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const query = `UPDATE houses SET ${updateFields.join(', ')} WHERE id = ?`;

        const updateParams = [...updateValues, houseId];
        console.log(updateFields, updateValues, query, updateParams)

        await db.promise().execute(query, updateParams);

        res.status(200).json({ message: 'House details updated successfully' });
    } catch (err) {
        console.error('Error updating data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = {app, db};