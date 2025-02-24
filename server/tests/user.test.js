const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Consultation = require('../models/Consultation');
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

app.put('/edit-user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;

        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
        if (!user) {
            return res.status(404).send({ message: 'Usuário não encontrado' });
        }

        res.status(200).send(user);
    } catch (error) {
        console.error('Erro ao editar usuário:', error);
        res.status(400).send({ message: 'Erro ao editar usuário' });
    }
});

app.put('/edit-consultation/:id', async (req, res) => {
    try {
        const consultationId = req.params.id;
        const updatedData = req.body;

        const consultation = await Consultation.findByIdAndUpdate(consultationId, updatedData, { new: true });
        if (!consultation) {
            return res.status(404).send({ message: 'Consulta não encontrada' });
        }

        res.status(200).send(consultation);
    } catch (error) {
        console.error('Erro ao editar consulta:', error);
        res.status(400).send({ message: 'Erro ao editar consulta' });
    }
});

describe('User API', () => {
    beforeAll(async () => {
        await mongoose.connect('mongodb://localhost:27017/pews');
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Consultation.deleteMany({});
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
        const user = new User({ username: 'testuser', password: 'password' });
        await user.save();

        const res = await request(app)
            .post('/login')
            .send({
                username: 'testuser',
                password: 'password'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id');
    });

    it('deve editar um usuário', async () => {
        const user = new User({ username: 'testuser', password: 'password' });
        await user.save();

        const res = await request(app)
            .put(`/edit-user/${user._id}`)
            .send({ username: 'updateduser' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.username).toEqual('updateduser');
    });

    it('deve editar uma consulta', async () => {
        const user = new User({ username: 'testuser', password: 'password' });
        await user.save();

        const consultation = new Consultation({
            crianca: {
                nome: 'Criança Teste',
                leito: 'Leito 1',
                diagnostico: 'Diagnóstico Teste',
                dataAvaliacao: new Date()
            },
            faixaEtaria: '2-5 anos',
            sinaisVitais: {
                estadoPaciente: 'Estável',
                frequenciaCardiaca: '80 bpm'
            },
            scores: {
                comportamento: 1,
                cardiovascular: 1,
                respiratorio: 1,
                nebulizadores: 1,
                vomito: 1
            },
            resultado: {
                total: 5,
                intervencao: 'Nenhuma',
                tempoControle: '30 min'
            },
            avaliador: user._id
        });
        await consultation.save();

        const res = await request(app)
            .put(`/edit-consultation/${consultation._id}`)
            .send({ 'crianca.diagnostico': 'Diagnóstico Atualizado' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.crianca.diagnostico).toEqual('Diagnóstico Atualizado');
    });
});