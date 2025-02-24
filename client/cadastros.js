document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('http://localhost:5000/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            alert('Erro ao carregar usuários: ' + errorData.message);
            return;
        }
        const users = await response.json();
        const usersContainer = document.getElementById('users');
        function renderUsers(filteredUsers) {
            usersContainer.innerHTML = '';
            filteredUsers.forEach(user => {
                const userElement = document.createElement('div');
                userElement.className = 'bg-white shadow-lg border border-gray-200 p-6 rounded-lg mb-6';
                userElement.innerHTML = `
                    <h2 class="text-xl font-semibold text-blue-500 mb-4">${user.nome}</h2>
                    <p><strong>Matrícula:</strong> ${user.matricula}</p>
                    <p><strong>Função:</strong> ${user.funcao}</p>
                    <p><strong>Nome de Usuário:</strong> ${user.username}</p>
                    <button class="delete-user bg-red-500 text-white p-2 rounded mt-4" data-id="${user._id}">Excluir</button>
                `;
                usersContainer.appendChild(userElement);
            });
            document.querySelectorAll('.delete-user').forEach(button => {
                button.addEventListener('click', async function() {
                    const userId = this.getAttribute('data-id');
                    if (confirm('Tem certeza que deseja excluir este usuário?')) {
                        try {
                            const response = await fetch(`http://localhost:5000/users/${userId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            });
                            if (!response.ok) {
                                const errorData = await response.json();
                                alert('Erro ao excluir usuário: ' + errorData.message);
                                return;
                            }
                            alert('Usuário excluído com sucesso');
                            renderUsers(users.filter(user => user._id !== userId));
                        } catch (error) {
                            console.error('Erro ao excluir usuário:', error);
                            alert('Erro ao excluir usuário');
                        }
                    }
                });
            });
        }
        renderUsers(users);
        document.getElementById('searchUsers').addEventListener('input', function(event) {
            const searchTerm = event.target.value.toLowerCase();
            const filteredUsers = users.filter(user => 
                user.nome.toLowerCase().includes(searchTerm) ||
                user.matricula.toLowerCase().includes(searchTerm) ||
                user.funcao.toLowerCase().includes(searchTerm) ||
                user.username.toLowerCase().includes(searchTerm)
            );
            renderUsers(filteredUsers);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        alert('Erro ao carregar usuários');
    }
});