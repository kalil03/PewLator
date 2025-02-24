document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('http://localhost:5000/consultations', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            alert('Erro ao carregar consultas: ' + errorData.message);
            return;
        }
        const consultations = await response.json();
        const consultationsContainer = document.getElementById('consultations');
        function renderConsultations(filteredConsultations) {
            consultationsContainer.innerHTML = '';
            filteredConsultations.forEach(consultation => {
                const consultationElement = document.createElement('div');
                consultationElement.className = 'bg-white shadow-lg border border-gray-200 p-6 rounded-lg mb-6';
                consultationElement.innerHTML = `
                    <h2 class="text-xl font-semibold text-blue-500 mb-4">Consulta de ${consultation.crianca.nome}</h2>
                    <p><strong>Leito:</strong> ${consultation.crianca.leito}</p>
                    <p><strong>Diagnóstico:</strong> ${consultation.crianca.diagnostico}</p>
                    <p><strong>Data da Avaliação:</strong> ${new Date(consultation.crianca.dataAvaliacao).toLocaleDateString()}</p>
                    <p><strong>Faixa Etária:</strong> ${consultation.faixaEtaria}</p>
                    <p><strong>Estado do Paciente:</strong> ${consultation.sinaisVitais.estadoPaciente}</p>
                    <p><strong>Frequência Cardíaca:</strong> ${consultation.sinaisVitais.frequenciaCardiaca}</p>
                    <p><strong>Pontuação PEWS:</strong> ${consultation.resultado.total}</p>
                    <p><strong>Intervenção:</strong> ${consultation.resultado.intervencao}</p>
                    <p><strong>Tempo de Controle:</strong> ${consultation.resultado.tempoControle}</p>
                    <button class="delete-consultation bg-red-500 text-white p-2 rounded mt-4" data-id="${consultation._id}">Excluir</button>
                `;
                consultationsContainer.appendChild(consultationElement);
            });
            document.querySelectorAll('.delete-consultation').forEach(button => {
                button.addEventListener('click', async function() {
                    const consultationId = this.getAttribute('data-id');
                    if (confirm('Tem certeza que deseja excluir esta consulta?')) {
                        try {
                            const response = await fetch(`http://localhost:5000/delete-consultation/${consultationId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            });
                            if (!response.ok) {
                                const errorData = await response.json();
                                alert('Erro ao excluir consulta: ' + errorData.message);
                                return;
                            }
                            alert('Consulta excluída com sucesso');
                            loadConsultations();
                        } catch (error) {
                            console.error('Erro ao excluir consulta:', error);
                            alert('Erro ao excluir consulta');
                        }
                    }
                });
            });
        }
        renderConsultations(consultations);
        document.getElementById('searchConsultations').addEventListener('input', function(event) {
            const searchTerm = event.target.value.toLowerCase();
            const filteredConsultations = consultations.filter(consultation => 
                consultation.crianca.nome.toLowerCase().includes(searchTerm) ||
                consultation.crianca.leito.toLowerCase().includes(searchTerm) ||
                consultation.crianca.diagnostico.toLowerCase().includes(searchTerm) ||
                consultation.faixaEtaria.toLowerCase().includes(searchTerm) ||
                consultation.sinaisVitais.estadoPaciente.toLowerCase().includes(searchTerm) ||
                consultation.sinaisVitais.frequenciaCardiaca.toLowerCase().includes(searchTerm) ||
                consultation.resultado.total.toString().includes(searchTerm) ||
                consultation.resultado.intervencao.toLowerCase().includes(searchTerm) ||
                consultation.resultado.tempoControle.toLowerCase().includes(searchTerm)
            );
            renderConsultations(filteredConsultations);
        });
    } catch (error) {
        console.error('Erro ao carregar consultas:', error);
        alert('Erro ao carregar consultas');
    }
});