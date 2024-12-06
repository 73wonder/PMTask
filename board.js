import { ThemeManager } from './theme.js';
import apisRequest from './api.js';

class BoardManager {
    constructor() {
        this.boardsContainer = document.getElementById('boards-container');
        this.themeToggle = document.getElementById('theme-toggle');
        this.logoutBtn = document.getElementById('logout-btn');
        
        ThemeManager.init(); // Inicializa o tema
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
            this.themeToggle.addEventListener('click', () => ThemeManager.toggle());
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
        modal.classList.add('modal');
        modal.style.animation = 'modalSlideUp 0.3s var(--elastic) forwards';

        const form = document.createElement('form');
        form.classList.add('modal-content');
        form.innerHTML = `
            <h2>Novo Quadro</h2>
            
            <div class="form-group">
                <label class="form-label" for="name">Nome do Quadro</label>
                <input 
                    id="name" 
                    type="text" 
                    class="form-input" 
                    placeholder="Digite o nome do quadro" 
                    required
                >
            </div>

            <div class="form-group">
                <label class="form-label" for="color">Cor do Quadro</label>
                <div class="color-input-wrapper">
                    <input 
                        id="color" 
                        type="color" 
                        value="#4A90E2"
                        required
                    >
                    <div class="color-preview" style="background-color: #4A90E2"></div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="description">Descrição</label>
                <textarea 
                    id="description" 
                    class="form-input" 
                    placeholder="Digite uma descrição para o quadro" 
                    rows="3"
                ></textarea>
            </div>

            <div class="modal-actions">
                <button type="submit" class="btn-modal btn-confirm">
                    <i class="fas fa-check"></i>
                    Criar Quadro
                </button>
                <button type="button" class="btn-modal btn-cancel">
                    <i class="fas fa-times"></i>
                    Cancelar
                </button>
            </div>
        `;

        modal.appendChild(form);
        document.body.appendChild(modal);

        // Foca no input de nome automaticamente
        form.querySelector('#name').focus();

        // Preview da cor
        const colorInput = form.querySelector('#color');
        const colorPreview = form.querySelector('.color-preview');
        colorInput.addEventListener('input', (e) => {
            colorPreview.style.backgroundColor = e.target.value;
        });

        // Botão cancelar
        form.querySelector('.btn-cancel').onclick = () => {
            modal.style.animation = 'modalSlideDown 0.3s var(--elastic) forwards';
            setTimeout(() => modal.remove(), 300);
        };

        // Submit do formulário
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
            <div class="board-card" style="background-color: ${board.HexaBackgroundColor || '#ffffff'}">
                <div class="board-badges">
                    ${board.IsActive ? '<span class="badge badge-active">Ativo</span>' : ''}
                </div>
                <h3 class="board-title">${board.Name}</h3>
                <p class="board-description">${board.Description || 'Sem descrição'}</p>
                <div class="board-actions">
                    <button onclick="editBoard(${board.Id})" class="btn-icon">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteBoard(${board.Id})" class="btn-icon">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button onclick="viewBoardDetails(${board.Id})" class="btn-icon">
                        <i class="fas fa-arrow-right"></i>
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

    async loadBoardStats(boardId, boardElement) {
        try {
            // Adiciona classe de loading enquanto carrega
            const statsElements = boardElement.querySelectorAll('.stat-item span');
            statsElements.forEach(el => el.classList.add('loading'));

            // Busca dados em paralelo
            const [columns, tasks] = await Promise.all([
                apisRequest.ColumnsBoardId(boardId),
                apisRequest.TasksByBoardId(boardId)
            ]);

            const columnCount = boardElement.querySelector('.column-count');
            const taskCount = boardElement.querySelector('.task-count');

            // Remove classe de loading
            statsElements.forEach(el => el.classList.remove('loading'));

            // Atualiza contadores apenas se os elementos existirem e os dados forem arrays
            if (columnCount && Array.isArray(columns)) {
                columnCount.textContent = `${columns.length} coluna${columns.length !== 1 ? 's' : ''}`;
            }

            if (taskCount && Array.isArray(tasks)) {
                taskCount.textContent = `${tasks.length} tarefa${tasks.length !== 1 ? 's' : ''}`;
            }

            // Adiciona classes para estilização baseada na quantidade
            if (columns.length > 0) {
                columnCount?.parentElement.classList.add('has-items');
            }
            if (tasks.length > 0) {
                taskCount?.parentElement.classList.add('has-items');
            }

        } catch (error) {
            console.error('Erro ao carregar estatísticas do board:', error);
            // Em caso de erro, mostra um traço
            const stats = boardElement.querySelectorAll('.stat-item span');
            stats.forEach(stat => stat.textContent = '-');
        }
    }
}

// Inicializar
new BoardManager();

