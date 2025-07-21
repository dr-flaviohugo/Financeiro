import { FirebaseService } from './firebase-service.js';
import { ComponentRenderer } from './components.js';
import { ChartManager } from './chart-manager.js';
import { Utils } from './utils.js';
import { APP_CONSTANTS } from './config.js';

class FinanceiroApp {
    constructor() {
        this.firebaseService = new FirebaseService();
        this.componentRenderer = new ComponentRenderer(this.firebaseService);
        this.chartManager = new ChartManager();
        
        this.data = {
            entradas: [],
            saidas: [],
            contasRecorrentes: [],
            categoriasSugeridas: []
        };
        
        this.filters = {
            entradas: Utils.getCurrentYearMonth(),
            saidas: Utils.getCurrentYearMonth()
        };

        this.init();
    }

    init() {
        this.setupAuthenticationHandlers();
        this.setupFormHandlers();
        this.setupFilterHandlers();
        this.setupExportHandler();
    }

    setupAuthenticationHandlers() {
        const loginContainer = document.getElementById('login-container');
        const appContainer = document.getElementById('app-container');
        const authError = document.getElementById('auth-error');
        const userEmail = document.getElementById('userEmail');

        // Monitorar mudanças de autenticação
        this.firebaseService.onAuthStateChange((user) => {
            if (user) {
                loginContainer.classList.add('d-none');
                appContainer.classList.remove('d-none');
                userEmail.textContent = user.email;
                this.initializeApp();
            } else {
                loginContainer.classList.remove('d-none');
                appContainer.classList.add('d-none');
                this.chartManager.destroy();
            }
        });

        // Login com Google
        document.getElementById('googleLoginButton').addEventListener('click', async () => {
            try {
                authError.classList.add('d-none');
                await this.firebaseService.signInWithGoogle();
            } catch (error) {
                authError.textContent = error.message;
                authError.classList.remove('d-none');
            }
        });

        // Logout
        document.getElementById('logoutButton').addEventListener('click', async () => {
            try {
                await this.firebaseService.signOut();
            } catch (error) {
                console.error('Erro no logout:', error);
            }
        });
    }

    setupFormHandlers() {
        // Form de entrada
        document.getElementById('entradaForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const entrada = {
                numero: document.getElementById('entradaNumero').value,
                data: document.getElementById('entradaData').value,
                descricao: document.getElementById('entradaDescricao').value,
                valorTotal: parseFloat(document.getElementById('entradaValorTotal').value),
                formaPagamento: document.getElementById('entradaFormaPagamento').value,
                valorRecebido: parseFloat(document.getElementById('entradaValorRecebido').value),
                categoria: document.getElementById('entradaCategoria').value
            };

            const errors = Utils.validateForm(entrada, ['numero', 'data', 'descricao', 'valorTotal', 'formaPagamento', 'valorRecebido', 'categoria']);
            
            if (errors.length > 0) {
                Utils.showToast(errors.join('\n'), 'danger');
                return;
            }

            try {
                await this.firebaseService.salvarEntrada(entrada);
                this.resetForm('entradaForm');
            } catch (error) {
                console.error('Erro ao salvar entrada:', error);
            }
        });

        // Form de saída
        document.getElementById('saidaForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const saida = {
                data: document.getElementById('saidaData').value,
                descricao: document.getElementById('saidaDescricao').value,
                valorTotal: parseFloat(document.getElementById('saidaValorTotal').value),
                valorPresente: parseFloat(document.getElementById('saidaValorPresente').value),
                categoria: document.getElementById('saidaCategoria').value
            };

            const errors = Utils.validateForm(saida, ['data', 'descricao', 'valorTotal', 'valorPresente', 'categoria']);
            
            if (errors.length > 0) {
                Utils.showToast(errors.join('\n'), 'danger');
                return;
            }

            try {
                await this.firebaseService.salvarSaida(saida);
                this.resetForm('saidaForm');
            } catch (error) {
                console.error('Erro ao salvar saída:', error);
            }
        });

        // Form de conta recorrente
        document.getElementById('contaRecorrenteForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const conta = {
                descricao: document.getElementById('contaDescricao').value,
                valor: parseFloat(document.getElementById('contaValor').value),
                diaVencimento: parseInt(document.getElementById('contaDiaVencimento').value),
                categoria: document.getElementById('contaCategoria').value,
                pagamentos: {}
            };

            const errors = Utils.validateForm(conta, ['descricao', 'valor', 'diaVencimento', 'categoria']);
            
            if (errors.length > 0) {
                Utils.showToast(errors.join('\n'), 'danger');
                return;
            }

            try {
                await this.firebaseService.salvarContaRecorrente(conta);
                this.resetForm('contaRecorrenteForm');
            } catch (error) {
                console.error('Erro ao salvar conta recorrente:', error);
            }
        });
    }

    setupFilterHandlers() {
        // Filtros de entrada
        const filtroMesEntradas = document.getElementById('filtroMesEntradas');
        if (filtroMesEntradas) {
            filtroMesEntradas.value = this.filters.entradas;
            filtroMesEntradas.addEventListener('change', () => {
                this.filters.entradas = filtroMesEntradas.value;
                this.componentRenderer.renderEntradas(this.data.entradas, this.filters.entradas);
            });
        }

        // Filtros de saída
        const filtroMesSaidas = document.getElementById('filtroMesSaidas');
        if (filtroMesSaidas) {
            filtroMesSaidas.value = this.filters.saidas;
            filtroMesSaidas.addEventListener('change', () => {
                this.filters.saidas = filtroMesSaidas.value;
                this.componentRenderer.renderSaidas(this.data.saidas, this.filters.saidas);
            });
        }

        // Botões de filtro
        window.filtrarEntradas = () => {
            this.filters.entradas = document.getElementById('filtroMesEntradas').value;
            this.componentRenderer.renderEntradas(this.data.entradas, this.filters.entradas);
        };

        window.filtrarSaidas = () => {
            this.filters.saidas = document.getElementById('filtroMesSaidas').value;
            this.componentRenderer.renderSaidas(this.data.saidas, this.filters.saidas);
        };
    }

    setupExportHandler() {
        window.exportData = () => {
            const data = {
                entradas: this.data.entradas,
                saidas: this.data.saidas,
                contasRecorrentes: this.data.contasRecorrentes,
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `financeiro-backup-${Utils.getTodayString()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            Utils.showToast('Dados exportados com sucesso!');
        };
    }

    initializeApp() {
        Utils.showLoading();
        this.setDefaultDates();
        this.setupDataListeners();
        Utils.showToast('Aplicação conectada ao Firebase!');
    }

    setupDataListeners() {
        // Listener para entradas
        this.firebaseService.onEntradasChange((entradas) => {
            this.data.entradas = entradas;
            this.componentRenderer.renderEntradas(entradas, this.filters.entradas);
            this.updateDashboard();
            Utils.showLoading(false);
        });

        // Listener para saídas
        this.firebaseService.onSaidasChange((saidas) => {
            this.data.saidas = saidas;
            this.componentRenderer.renderSaidas(saidas, this.filters.saidas);
            this.updateDashboard();
            Utils.showLoading(false);
        });

        // Listener para contas recorrentes
        this.firebaseService.onContasRecorrentesChange((contas) => {
            this.data.contasRecorrentes = contas;
            this.componentRenderer.renderContasRecorrentes(contas);
            this.updateDashboard();
        });

        // Listener para categorias
        this.firebaseService.onCategoriasChange((categorias) => {
            this.data.categoriasSugeridas = categorias;
            this.componentRenderer.updateCategoriasSugeridas(categorias);
        });
    }

    updateDashboard() {
        this.componentRenderer.updateDashboardStats(this.data.entradas, this.data.saidas);
        this.chartManager.updateChart(this.data.entradas, this.data.saidas);
        this.componentRenderer.renderRecentTransactions(this.data.entradas, this.data.saidas);
        this.componentRenderer.renderPaymentReminders(this.data.contasRecorrentes);
    }

    setDefaultDates() {
        const today = Utils.getTodayString();
        const elements = ['entradaData', 'saidaData'];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = today;
            }
        });

        // Configurar filtros de mês
        const filtroMesEntradas = document.getElementById('filtroMesEntradas');
        const filtroMesSaidas = document.getElementById('filtroMesSaidas');
        
        if (filtroMesEntradas) filtroMesEntradas.value = this.filters.entradas;
        if (filtroMesSaidas) filtroMesSaidas.value = this.filters.saidas;
    }

    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            this.setDefaultDates();
        }
    }

    populatePaymentMethods() {
        const select = document.getElementById('entradaFormaPagamento');
        if (!select) return;

        APP_CONSTANTS.PAYMENT_METHODS.forEach(method => {
            const option = document.createElement('option');
            option.value = method;
            option.textContent = method;
            select.appendChild(option);
        });
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new FinanceiroApp();
});

// Expor funções globais necessárias para compatibilidade
window.excluirEntrada = async (id) => {
    const app = window.financeiroApp;
    if (app) {
        await app.firebaseService.excluirEntrada(id);
    }
};

window.excluirSaida = async (id) => {
    const app = window.financeiroApp;
    if (app) {
        await app.firebaseService.excluirSaida(id);
    }
};

window.excluirContaRecorrente = async (id) => {
    const app = window.financeiroApp;
    if (app) {
        await app.firebaseService.excluirContaRecorrente(id);
    }
};

window.registrarPagamentoConta = async (id) => {
    const app = window.financeiroApp;
    if (app) {
        const conta = app.data.contasRecorrentes.find(c => c.id === id);
        if (conta) {
            await app.componentRenderer.registrarPagamentoConta(conta);
        }
    }
};
