import apisRequest from './api.js';

class BoardManager {
    constructor() {
        this.boardsContainer = document.getElementById('boards-container');
        this.themeToggle = document.getElementById('theme-toggle');
        this.logoutBtn = document.getElementById('logout-btn');
        
        this.init();
    }

    async init() {
        // Verificar se usuário está logado
        const userId = localStorage.getItem('userId');
        if (!userId) {
            window.location.href = 'index.html';
            return;
        }

        // Configurar event listeners
        this.setupEventListeners();
        
        // Carregar boards
        await this.loadBoards();
    }

    setupEventListeners() {
        // Configurar logout
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Configurar tema
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    handleLogout() {
        // Limpar dados do localStorage
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        
        // Redirecionar para página de login
        window.location.href = 'index.html';
    }

    toggleTheme() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        
        // Se houver um usuário logado, salvar na API
        const userId = localStorage.getItem('userId');
        if (userId) {
            apisRequest.PersonConfigTheme(userId, isDark ? 'light' : 'dark')
                .catch(error => console.error('Erro ao salvar tema:', error));
        }
    }

    async loadBoards() {
        try {
            const boards = await apisRequest.GetBoards();
            this.boardsContainer.innerHTML = ''; // Limpar container

            boards.forEach(board => {
                const boardElement = this.createBoardElement(board);
                this.boardsContainer.appendChild(boardElement);
            });

        } catch (error) {
            console.error('Erro ao carregar os quadros:', error);
            this.showError('Erro ao carregar os quadros. Tente novamente.');
        }
    }

    // Funções de CRUD das boards
    async createBoard() {
        const name = prompt('Digite o título do quadro:');
        if (!name) return;

        const description = prompt('Digite a descrição do quadro:');
        
        try {
            const newBoard = {
                Name: name,
                Description: description,
                CreatedBy: this.getUserId()
            };

            await apisRequest.AddBoard(newBoard);
            await this.loadBoards();
            this.showSuccess('Quadro criado com sucesso!');
        } catch (error) {
            console.error('Erro ao criar quadro:', error);
            this.showError('Erro ao criar o quadro. Tente novamente.');
        }
    }

    async editBoard(boardId) {
        let updatedBoard = null;
        
        try {
            const board = await apisRequest.GetBoardById(boardId);
            console.log('Board original recebida:', board);

            const newTitle = prompt('Digite o novo título do quadro:', board.Name || board.Title);
            if (!newTitle) return;

            const newDescription = prompt('Digite a nova descrição do quadro:', board.Description);

            updatedBoard = {
                Id: parseInt(boardId),
                Title: newTitle,
                Description: newDescription || board.Description,
                CreatedBy: parseInt(board.CreatedBy),
                UserId: parseInt(board.UserId || board.CreatedBy),
                IsActive: true,
                CreatedOn: board.CreatedOn || new Date().toISOString()
            };

            console.log('Dados sendo enviados para atualização:', updatedBoard);

            await apisRequest.editBoard(updatedBoard);
            await this.loadBoards();
            this.showSuccess('Quadro atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao editar quadro:', error);
            if (updatedBoard) {
                console.error('Dados que causaram erro:', updatedBoard);
            }
            this.showError('Erro ao editar o quadro. Tente novamente.');
        }
    }

    async deleteBoard(boardId) {
        if (!confirm('Tem certeza que deseja excluir este quadro?')) return;

        try {
            await apisRequest.deleteBoard(boardId);
            await this.loadBoards();
            this.showSuccess('Quadro excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir quadro:', error);
            this.showError('Erro ao excluir o quadro. Tente novamente.');
        }
    }

    createBoardElement(board) {
        const boardElement = document.createElement('div');
        boardElement.classList.add('board-item');
        boardElement.innerHTML = `
            <div class="board-card" data-board-id="${board.Id}">
                <div class="board-header">
                    <h3 class="board-title">${board.Name}</h3>
                    <span class="board-date">${new Date(board.CreatedOn).toLocaleDateString('pt-BR')}</span>
                </div>
                <p class="board-description">${board.Description || 'Sem descrição'}</p>
                <div class="board-actions">
                    <button class="btn-action btn-edit" onclick="editBoard(${board.Id})" title="Editar">
                        <i class="fas fa-edit"></i>
                        <span class="btn-text">Editar</span>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteBoard(${board.Id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                        <span class="btn-text">Excluir</span>
                    </button>
                    <button class="btn-action btn-view" onclick="viewBoardDetails(${board.Id})" title="Visualizar">
                        <i class="fas fa-eye"></i>
                        <span class="btn-text">Ver</span>
                    </button>
                </div>
            </div>
        `;
        return boardElement;
    }

    createAddBoardButton() {
        const button = document.createElement('div');
        button.classList.add('board-item', 'add-board');
        button.innerHTML = `
            <div class="board-card new-board" onclick="this.createBoard()">
                <div class="add-board-content">
                    <i class="fas fa-plus-circle"></i>
                    <p>Criar novo quadro</p>
                </div>
                <div class="hover-effect"></div>
            </div>
        `;
        return button;
    }

    async viewBoardDetails(boardId) {
        const boardDetails = document.getElementById('board-details');
        try {
            const board = await apisRequest.GetBoardById(boardId);
            const columns = await apisRequest.ColumnsBoardId(boardId);
            
            boardDetails.innerHTML = `
                <h2>${board.Title}</h2>
                <p>${board.Description || 'Sem descrição'}</p>
                <div class="columns-container">
                    ${columns.map(column => `
                        <div class="column">
                            <h3>${column.Title}</h3>
                            <!-- Aqui você pode adicionar as tasks da coluna -->
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            console.error('Erro ao carregar detalhes do quadro:', error);
            this.showError('Erro ao carregar detalhes do quadro.');
        }
    }

    getUserId() {
        return localStorage.getItem('userId');
    }

    showSuccess(message) {
        alert(message);
    }

    showError(message) {
        alert(message);
    }
}

// Inicializar
const boardManager = new BoardManager();

// Exportar funções para uso global
window.createBoard = () => boardManager.createBoard();
window.editBoard = (boardId) => boardManager.editBoard(boardId);
window.deleteBoard = (boardId) => boardManager.deleteBoard(boardId);
window.viewBoardDetails = (boardId) => boardManager.viewBoardDetails(boardId);
