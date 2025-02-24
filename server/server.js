const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Consultation = require('./models/Consultation');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

//mongoDB
mongoose.connect('mongodb://localhost:27017/pews')
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB', err));

//rotas
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
        
        const token = jwt.sign({ userId: user._id }, 'seu_segredo_secreto', { expiresIn: '1h' });
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
        const { crianca, faixaEtaria, sinaisVitais, scores, resultado } = req.body;
        const userId = req.userId; 
        // verifica se já existe uma consulta com os mesmos dados
        const existingConsultation = await Consultation.findOne({
            'crianca.nome': crianca.nome,
            'crianca.leito': crianca.leito,
            'crianca.diagnostico': crianca.diagnostico,
            'crianca.dataAvaliacao': crianca.dataAvaliacao
        });
        if (existingConsultation) {
            return res.status(400).send({ message: 'Consulta já existe' });
        }
        const consultation = new Consultation({
            ...req.body,
            avaliador: userId
        });
        await consultation.save();
        res.status(201).send(consultation);
    } catch (error) {
        console.error('Erro ao salvar consulta:', error);
        res.status(400).send({ message: 'Erro ao salvar consulta' });
    }
});
app.get('/consultations', async (req, res) => {
    try {
        const consultations = await Consultation.find();
        res.status(200).send(consultations);
    } catch (error) {
        console.error('Erro ao buscar consultas:', error);
        res.status(500).send({ message: 'Erro ao buscar consultas' });
    }
});
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).send({ message: 'Erro ao buscar usuários' });
    }
});
app.delete('/delete-consultation/:id', async (req, res) => {
    try {
        const consultationId = req.params.id;
        const consultation = await Consultation.findByIdAndDelete(consultationId);
        if (!consultation) {
            return res.status(404).send({ message: 'Consulta não encontrada' });
        }
        res.status(200).send({ message: 'Consulta excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir consulta:', error);
        res.status(400).send({ message: 'Erro ao excluir consulta' });
    }
});
app.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).send({ message: 'Usuário não encontrado' });
        }
        res.status(200).send({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(400).send({ message: 'Erro ao excluir usuário' });
    }
});
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});