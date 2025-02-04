const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nome: { type: String, required: true },
    matricula: { type: String, required: true },
    funcao: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);