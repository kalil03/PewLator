const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    crianca: {
        nome: String,
        leito: String,
        diagnostico: String,
        dataAvaliacao: Date
    },
    faixaEtaria: String,
    sinaisVitais: {
        estadoPaciente: String,
        frequenciaCardiaca: String
    },
    scores: {
        comportamento: Number,
        cardiovascular: Number,
        respiratorio: Number,
        nebulizadores: Number,
        vomito: Number
    },
    resultado: {
        total: Number,
        intervencao: String,
        tempoControle: String
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Consultation', consultationSchema);