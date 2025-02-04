const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const app = express();

app.use(express.json());

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).send(user);
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.status(200).send(user);
    } else {
        res.status(401).send({ message: 'Credenciais inválidas' });
    }
});

describe('User API', () => {
    beforeAll(async () => {
        await mongoose.connect('mongodb://localhost:27017/pews', { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('deve registrar um novo usuário', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                username: 'testuser',
                password: 'password'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
    });

    it('deve fazer login de um usuário', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                username: 'testuser',
                password: 'password'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id');
    });
});