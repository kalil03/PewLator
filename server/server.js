const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/User');
const Consultation = require('./models/Consultation');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

// Conexão com MongoDB
mongoose.connect('mongodb://mongo:27017/pews', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB', err));

// Rotas
app.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send({ message: 'Erro no cadastro' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (!user) return res.status(401).send({ message: 'Credenciais inválidas' });
        
        const token = jwt.sign({ userId: user._id }, 'seu_segredo_secreto');
        res.send({
            token,
            user: {
                nome: user.nome,
                matricula: user.matricula,
                funcao: user.funcao
            }
        });
    } catch (error) {
        res.status(500).send({ message: 'Erro no servidor' });
    }
});

app.post('/save-consultation', async (req, res) => {
    try {
        const consultation = new Consultation(req.body);
        await consultation.save();
        res.status(201).send(consultation);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao salvar consulta' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});