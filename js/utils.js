// Funções utilitárias
export class Utils {
    static formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        }).format(value);
    }

    static formatDate(date) {
        // Adiciona um dia para corrigir o problema de fuso horário
        const adjustedDate = new Date(date);
        adjustedDate.setUTCDate(adjustedDate.getUTCDate() + 1);
        return adjustedDate.toLocaleDateString('pt-BR');
    }

    static showLoading(show = true) {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.toggle('show', show);
        }
    }

    static showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
        toast.style.zIndex = '9999';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    static getTodayString() {
        return new Date().toISOString().split('T')[0];
    }

    static getCurrentYearMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    static parseCategorias(categoriaString) {
        if (Array.isArray(categoriaString)) {
            return categoriaString;
        }
        if (typeof categoriaString === 'string') {
            return categoriaString.split(',').map(t => t.trim()).filter(t => t);
        }
        return [];
    }

    static createBadge(text, className = 'bg-primary') {
        const badge = document.createElement('span');
        badge.className = `badge ${className} me-1`;
        badge.textContent = text;
        return badge;
    }

    static createButton(text, className, iconClass = null, onClick = null) {
        const button = document.createElement('button');
        button.className = `btn ${className}`;
        
        if (iconClass) {
            button.innerHTML = `<i class="${iconClass}"></i> ${text}`;
        } else {
            button.textContent = text;
        }
        
        if (onClick) {
            button.onclick = onClick;
        }
        
        return button;
    }

    static validateForm(formData, requiredFields) {
        const errors = [];
        
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].toString().trim() === '') {
                errors.push(`O campo ${field} é obrigatório`);
            }
        });

        return errors;
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}
