const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    crianca: {
        nome: { type: String, required: true },
        leito: { type: String, required: true },
        diagnostico: { type: String, required: true },
        dataAvaliacao: { type: Date, required: true }
    },
    faixaEtaria: { type: String, required: true },
    sinaisVitais: {
        estadoPaciente: { type: String, required: true },
        frequenciaCardiaca: { type: String, required: true }
    },
    scores: {
        comportamento: { type: Number, required: true },
        cardiovascular: { type: Number, required: true },
        respiratorio: { type: Number, required: true },
        nebulizadores: { type: Number, required: true },
        vomito: { type: Number, required: true }
    },
    resultado: {
        total: { type: Number, required: true },
        intervencao: { type: String, required: true },
        tempoControle: { type: String, required: true }
    }
});

module.exports = mongoose.model('Consultation', consultationSchema);