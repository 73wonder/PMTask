export const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(savedTheme);
    },

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
    },

    updateThemeIcon(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        
        if (theme === 'dark') {
            icon?.classList.remove('fa-moon');
            icon?.classList.add('fa-sun');
            if (text) text.textContent = 'Modo Claro';
        } else {
            icon?.classList.remove('fa-sun');
            icon?.classList.add('fa-moon');
            if (text) text.textContent = 'Modo Escuro';
        }
    },

    toggle() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        localStorage.setItem('theme', newTheme);
        this.applyTheme(newTheme);

        // Atualiza a preferência no backend se houver usuário logado
        const userId = localStorage.getItem('userId');
        if (userId) {
            import('./api.js').then(({ default: apisRequest }) => {
                apisRequest.PersonConfigTheme(parseInt(userId), newTheme)
                    .catch(error => {
                        console.error('Erro ao salvar tema:', error);
                        // Não impede o usuário de usar o tema escolhido mesmo se falhar no backend
                    });
            });
        }
    }
}; 