import apisRequest from './api.js';

class BoardManager {
    constructor() {
        this.boardsContainer = document.getElementById('boards-container');
        this.themeToggle = document.getElementById('theme-toggle');
        this.logoutBtn = document.getElementById('logout-btn');
        
        this.init();
    }

    async init() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            window.location.href = 'index.html';
            return;
        }

        this.setupEventListeners();
        await this.loadBoards();
    }

    setupEventListeners() {
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Configurar funções globais
        window.editBoard = (boardId) => this.editBoard(boardId);
        window.deleteBoard = (boardId) => this.deleteBoard(boardId);
        window.viewBoardDetails = (boardId) => this.viewBoardDetails(boardId);
    }

    handleLogout() {
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        window.location.href = 'index.html';
    }

    async editBoard(boardId) {
        try {
            const board = await apisRequest.GetBoardById(boardId);
            
            const modal = document.createElement('div');
            modal.classList.add('modal', 'flex-centralize');
            modal.style.animation = 'modalSlideUp 0.3s var(--elastic) forwards';

            const form = document.createElement('form');
            form.classList.add('modal-content', 'card', 'card-primary');
            form.innerHTML = `
                <h2 class="fnt-lg">Editar Quadro</h2>
                <input id="name" type="text" class="input-primary w-full p-sm border-md" placeholder="Nome do quadro" value="${board.Name}" required>
                <input id="color" type="color" class="input-primary w-full p-sm border-md" value="${board.HexaBackgroundColor || '#ffffff'}" required>
                <textarea id="description" class="input-primary w-full p-sm border-md" placeholder="Descrição do quadro" rows="3">${board.Description || ''}</textarea>
                <div class="flex-row gap-sm w-full">
                    <button type="submit" class="btn btn-primary w-full p-sm border-md">Salvar</button>
                    <button type="button" class="btn btn-secondary w-full p-sm border-md">Cancelar</button>
                </div>
            `;

            modal.appendChild(form);
            document.body.appendChild(modal);

            form.querySelector('input').focus();

            form.querySelector('.btn-secondary').onclick = () => {
                modal.style.animation = 'modalSlideDown 0.3s var(--elastic) forwards';
                setTimeout(() => modal.remove(), 300);
            };

            form.onsubmit = async (e) => {
                e.preventDefault();
                const userId = localStorage.getItem('userId');
                const updatedBoard = {
                    Id: boardId,
                    Name: form.querySelector('#name').value,
                    Description: form.querySelector('#description').value,
                    HexaBackgroundColor: form.querySelector('#color').value,
                    IsActive: true,
                    CreatedBy: board.CreatedBy,
                    UpdatedBy: parseInt(userId)
                };

                try {
                    await apisRequest.editBoard(updatedBoard);
                    this.showSuccess('Board atualizada com sucesso!');
                    modal.style.animation = 'modalSlideDown 0.3s var(--elastic) forwards';
                    setTimeout(() => {
                        modal.remove();
                        this.loadBoards();
                    }, 300);
                } catch (error) {
                    console.error('Erro ao atualizar board:', error);
                    this.showError('Erro ao atualizar board. Tente novamente.');
                }
            };
        } catch (error) {
            console.error('Erro ao carregar board para edição:', error);
            this.showError('Erro ao carregar board para edição. Tente novamente.');
        }
    }

    async deleteBoard(boardId) {
        if (!confirm('Tem certeza que deseja excluir este quadro?')) return;

        try {
            await apisRequest.deleteBoard(boardId);
            this.showSuccess('Board excluída com sucesso!');
            await this.loadBoards();
        } catch (error) {
            console.error('Erro ao excluir board:', error);
            this.showError('Erro ao excluir board. Tente novamente.');
        }
    }

    async viewBoardDetails(boardId) {
        try {
            const board = await apisRequest.GetBoardById(boardId);
            const columns = await apisRequest.ColumnsBoardId(boardId);
            
            const boardDetails = document.getElementById('board-details');
            boardDetails.innerHTML = `
                <h2>${board.Name}</h2>
                <p>${board.Description || 'Sem descrição'}</p>
                <div class="columns-container">
                    ${columns.map(column => `
                        <div class="column">
                            <h3>${column.Name}</h3>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            console.error('Erro ao carregar detalhes da board:', error);
            this.showError('Erro ao carregar detalhes da board.');
        }
    }

    toggleTheme() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        
        const userId = localStorage.getItem('userId');
        if (userId) {
            apisRequest.PersonConfigTheme(userId, isDark ? 'light' : 'dark')
                .catch(error => console.error('Erro ao salvar tema:', error));
        }
    }

    createAddBoardButton() {
        const button = document.createElement('div');
        button.classList.add('board-item', 'add-board');
        button.innerHTML = `
            <div class="board-card new-board">
                <div class="add-board-content">
                    <i class="fas fa-plus-circle"></i>
                    <p>Criar novo quadro</p>
                </div>
                <div class="hover-effect"></div>
            </div>
        `;
        button.addEventListener('click', () => this.showAddBoardModal());
        return button;
    }

    showAddBoardModal() {
        const modal = document.createElement('div');
        modal.classList.add('modal', 'flex-centralize');
        modal.style.animation = 'modalSlideUp 0.3s var(--elastic) forwards';

        const form = document.createElement('form');
        form.classList.add('modal-content', 'card', 'card-primary');
        form.innerHTML = `
            <h2 class="fnt-lg">Novo Quadro</h2>
            <input id="name" type="text" class="input-primary w-full p-sm border-md" placeholder="Nome do quadro" required>
            <input id="color" type="color" class="input-primary w-full p-sm border-md" placeholder="Cor de fundo" required>
            <textarea id="description" class="input-primary w-full p-sm border-md" placeholder="Descrição do quadro" rows="3"></textarea>
            <div class="flex-row gap-sm w-full">
                <button type="submit" class="btn btn-primary w-full p-sm border-md">Criar</button>
                <button type="button" class="btn btn-secondary w-full p-sm border-md">Cancelar</button>
            </div>
        `;

        modal.appendChild(form);
        document.body.appendChild(modal);

        form.querySelector('input').focus();

        form.querySelector('.btn-secondary').onclick = () => {
            modal.style.animation = 'modalSlideDown 0.3s var(--elastic) forwards';
            setTimeout(() => modal.remove(), 300);
        };

        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.addNewBoard(
                form.querySelector('#name').value,
                form.querySelector('#color').value,
                form.querySelector('#description').value
            );
            modal.style.animation = 'modalSlideDown 0.3s var(--elastic) forwards';
            setTimeout(() => {
                modal.remove();
                this.loadBoards();
            }, 300);
        };
    }

    async addNewBoard(name, color, description) {
        try {
            const userId = localStorage.getItem('userId');
            const newBoard = {
                Name: name,
                Description: description,
                HexaBackgroundColor: color,
                IsActive: true,
                CreatedBy: parseInt(userId),
                UpdatedBy: parseInt(userId)
            };
            
            console.log('Nova board sendo criada:', newBoard);
            await apisRequest.AddBoard(newBoard);
            this.showSuccess('Board criada com sucesso!');
        } catch (error) {
            console.error('Erro ao criar board:', error);
            this.showError('Erro ao criar board. Tente novamente.');
        }
    }

    showSuccess(message) {
        alert(message); // Você pode implementar um toast mais elegante aqui
    }

    showError(message) {
        alert(message); // Você pode implementar um toast mais elegante aqui
    }

    async loadBoards() {
        try {
            const boards = await apisRequest.GetBoards();
            this.boardsContainer.innerHTML = ''; // Limpar container

            // Adicionar botão de nova board
            const addBoardButton = this.createAddBoardButton();
            this.boardsContainer.appendChild(addBoardButton);

            // Adicionar boards existentes
            boards.forEach(board => {
                const boardElement = this.createBoardElement(board);
                this.boardsContainer.appendChild(boardElement);
            });

        } catch (error) {
            console.error('Erro ao carregar os quadros:', error);
            this.showError('Erro ao carregar os quadros. Tente novamente.');
        }
    }

    createBoardElement(board) {
        const boardElement = document.createElement('div');
        boardElement.classList.add('board-item');
        boardElement.innerHTML = `
            <div class="board-card" data-board-id="${board.Id}" style="background-color: ${board.HexaBackgroundColor || '#ffffff'}">
                <div class="board-header">
                    <h3 class="board-title">${board.Name}</h3>
                    <span class="board-date">${new Date(board.CreatedOn).toLocaleDateString('pt-BR')}</span>
                </div>
                <p class="board-description">${board.Description || 'Sem descrição'}</p>
                <div class="board-actions">
                    <button class="btn-action btn-edit" onclick="event.stopPropagation(); editBoard(${board.Id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="event.stopPropagation(); deleteBoard(${board.Id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        // Adicionar evento de clique para navegar para a board
        const boardCard = boardElement.querySelector('.board-card');
        boardCard.addEventListener('click', () => {
            window.location.href = `board-details.html?id=${board.Id}`;
        });

        return boardElement;
    }
}

// Inicializar
new BoardManager();

