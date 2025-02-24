document.addEventListener('DOMContentLoaded', function() {
    const scores = {
        comportamento: 0,
        cardiovascular: 0,
        respiratorio: 0,
        nebulizadores: 0,
        vomito: 0,
    };
    document.querySelectorAll('.score-button').forEach(button => {
        button.addEventListener('click', function () {
            const categoryElement = this.closest('[data-category]');
            if (!categoryElement) {
                console.error("Erro: categoria não encontrada para", this);
                return;
            }
            const category = categoryElement.dataset.category;
            const score = parseInt(this.dataset.score);
            // Resetar botões da mesma categoria
            categoryElement.querySelectorAll('.score-button').forEach(btn => {
                btn.classList.remove('bg-blue-500', 'text-white');
                btn.classList.add('bg-blue-100', 'text-blue-600');
            });
            // Destacar botão selecionado
            this.classList.remove('bg-blue-100', 'text-blue-600');
            this.classList.add('bg-blue-500', 'text-white');
            // Atualizar pontuação
            scores[category] = score;
            updateScore();
        });
    });
    // logica pews
    function updateScore() {
        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
        document.getElementById('pews-score').innerText = totalScore;
        const intervention = document.getElementById('pews-intervention');
        const time = document.getElementById('pews-time');
        if (totalScore === 0) {
            intervention.innerText = "Manter rotina de avaliação. PEWS a cada 24 horas.";
            time.innerText = "Sinais Vitais de 6/6 horas";
        } else if (totalScore >= 1 && totalScore <= 2) {
            intervention.innerText = "Avaliação do enfermeiro. Repetir PEWS em 60 min.";
            time.innerText = "Sinais Vitais de 4/4 horas";
        } else if (totalScore === 3) {
            intervention.innerText = "Avaliação imediata do enfermeiro. Repetir PEWS em 30 min.";
            time.innerText = "Sinais Vitais de 2/2 horas";
        } else if (totalScore >= 4) {
            intervention.innerText = "Avaliação imediata. Repetir PEWS em 15 min.";
            time.innerText = "Sinais Vitais de 1/1 hora";
        }
    }
    // autenticacao
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            try {
                const response = await fetch('http://localhost:5000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Erro de login');

                localStorage.setItem('token', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                window.location.href = 'index.html';
            } catch (error) {
                alert(error.message);
            }
        });
    }
    // cadastro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const userData = {
                nome: document.getElementById('nome').value,
                matricula: document.getElementById('matricula').value,
                funcao: document.getElementById('funcao').value,
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };
            try {
                const response = await fetch('http://localhost:5000/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                if (!response.ok) throw new Error('Erro no cadastro');
                alert('Cadastro realizado!');
                window.location.href = 'login.html';
            } catch (error) {
                alert(error.message);
            }
        });
    }
    // dados do avaliador
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log("Usuário atual:", currentUser); // Isso ajuda a verificar se o usuário está carregando corretamente
    
    if (currentUser && typeof currentUser === "object") { 
        const nomeInput = document.getElementById('avaliador-nome');
        const matriculaInput = document.getElementById('avaliador-matricula');
        const funcaoInput = document.getElementById('avaliador-funcao');
    
        if (nomeInput) nomeInput.value = currentUser.nome || "";
        if (matriculaInput) matriculaInput.value = currentUser.matricula || "";
        if (funcaoInput) funcaoInput.value = currentUser.funcao || "";
    } else {
        console.warn("Nenhum usuário encontrado no localStorage.");
    }
    // salvar consulta
    document.getElementById('save-button')?.addEventListener('click', async function() {
        const requiredFields = [
            document.getElementById('crianca-nome').value,
            document.getElementById('crianca-leito').value,
            document.getElementById('crianca-diagnostico').value,
            document.getElementById('crianca-data').value
        ];
        if (requiredFields.some(field => !field)) {
            alert('Preencha todos os campos obrigatórios da criança');
            return;
        }
        const consultationData = {
            crianca: {
                nome: document.getElementById('crianca-nome').value,
                leito: document.getElementById('crianca-leito').value,
                diagnostico: document.getElementById('crianca-diagnostico').value,
                dataAvaliacao: document.getElementById('crianca-data').value
            },
            faixaEtaria: document.getElementById('faixa-etaria').value,
            sinaisVitais: {
                estadoPaciente: document.querySelector('select[id="faixa-etaria"]').value,
                frequenciaCardiaca: document.getElementById('frequencia').value
            },
            scores: { ...scores },
            resultado: {
                total: parseInt(document.getElementById('pews-score').innerText),
                intervencao: document.getElementById('pews-intervention').innerText,
                tempoControle: document.getElementById('pews-time').innerText
            }
        };
        try {
            const response = await fetch('http://localhost:5000/save-consultation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(consultationData)
            });
            if (!response.ok) throw new Error('Erro ao salvar');
            alert('Consulta salva com sucesso!');
            window.location.reload();
        } catch (error) {
            alert(error.message);
        }
    });
});