const api = "https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/";

const apiRequest = async (endpoint, method, body) => {
    try {
        const opcao = {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            mode: 'cors'
        };

        if (body) {
            opcao.body = JSON.stringify(body);
        }

        const response = await fetch(`${api}${endpoint}`, opcao);

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        }

        return null;
    } catch (error) {
        console.error(`Erro na requisição para ${endpoint}:`, error);
        throw error;
    }
};

const apisRequest = {
    // Pessoa
    People: async () => apiRequest("People", "GET"),
    PersonById: async (personId) => apiRequest(`PersonById?PersonId=${personId}`, "GET"),
    GetPrsonByEmail: async (Email) => apiRequest(`GetPersonByEmail?Email=${Email}`, "GET"),
    PersonConfigId: async (personId) => apiRequest(`PersonConfigById?PersonId=${personId}`, "GET"),

    // Columns
    CreateColumn: async (column) => apiRequest("Column", "POST", column),
    UpdateColumn: async (column) => apiRequest("Column", "PUT", column),
    RemoveColumn: async (columnId) => apiRequest(`Column?ColumnId=${columnId}`, "DELETE"),
    ColumnsBoardId: async (boardId) => {
        try {
            const resp = await apiRequest(`ColumnByBoardId?BoardId=${boardId}`, "GET");
            return Array.isArray(resp) ? resp : [];
        } catch (error) {
            console.error('Falha ao encontrar as colunas:', error);
            return [];
        }
    },

    // Boards
    GetBoards: async () => {
        try {
            const resp = await apiRequest("Boards", "GET");
            if (Array.isArray(resp)) {
                return resp.map(board => ({
                    ...board,
                    UserId: board.UserId || board.CreatedBy
                }));
            }
            return [];
        } catch (error) {
            console.error('Falha ao encontrar as boards:', error);
            return [];
        }
    },
    GetBoardById: async (boardId) => apiRequest(`Board?BoardId=${boardId}`, "GET"),
    deleteBoard: async (boardId) => apiRequest(`Board?BoardId=${boardId}`, "DELETE"),
    AddBoard: async (board) => apiRequest("Board", "POST", board),
    editBoard: async (board) => apiRequest("Board", "PUT", board),

    // Configurações
    Themes: async () => apiRequest("Themes", "GET"),
    PersonConfigTheme: async (personId, theme) => 
        apiRequest(`PersonConfigTheme?PersonId=${personId}&Theme=${theme}`, "PUT"),

    // Tasks
    TasksColumnId: async (columnId) => apiRequest(`TasksByColumnId?ColumnId=${columnId}`, "GET"),
    TasksByBoardId: async (boardId) => apiRequest(`TaskByBoardId?BoardId=${boardId}`, "GET"),
    RemoveTask: async (taskId) => apiRequest(`Task?TaskId=${taskId}`, "DELETE"),
    UpdateTask: async (task) => apiRequest("Task", "PUT", task),
    AddTask: async (task) => apiRequest("Task", "POST", task)
};

export default apisRequest;
