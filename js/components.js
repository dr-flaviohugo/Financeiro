import { Utils } from './utils.js';
import { APP_CONSTANTS } from './config.js';

export class ComponentRenderer {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }

    renderEntradas(entradas, filtroMes) {
        const tbody = document.getElementById('listaEntradas');
        if (!tbody) return;

        tbody.innerHTML = '';
        const entradasFiltradas = entradas.filter(e => 
            e.data && e.data.startsWith(filtroMes)
        );

        entradasFiltradas.forEach(entrada => {
            const row = tbody.insertRow();
            row.insertCell().textContent = entrada.numero || '';
            row.insertCell().textContent = Utils.formatDate(entrada.data);
            row.insertCell().textContent = entrada.descricao || '';
            row.insertCell().textContent = Utils.formatCurrency(entrada.valorTotal || 0);
            row.insertCell().textContent = Utils.formatCurrency(entrada.valorRecebido || 0);
            
            const categoriaCell = row.insertCell();
            this.renderCategorias(categoriaCell, entrada.categoria, 'bg-success');

            const acoesCell = row.insertCell();
            const deleteButton = Utils.createButton(
                '', 
                'btn-sm btn-outline-danger', 
                'bi bi-trash',
                () => this.confirmarExclusao('entrada', entrada.id)
            );
            acoesCell.appendChild(deleteButton);
        });
    }

    renderSaidas(saidas, filtroMes) {
        const tbody = document.getElementById('listaSaidas');
        if (!tbody) return;

        tbody.innerHTML = '';
        const saidasFiltradas = saidas.filter(s => 
            s.data && s.data.startsWith(filtroMes)
        );

        saidasFiltradas.forEach(saida => {
            const row = tbody.insertRow();
            row.insertCell().textContent = Utils.formatDate(saida.data);
            row.insertCell().textContent = saida.descricao || '';
            row.insertCell().textContent = Utils.formatCurrency(saida.valorTotal || 0);
            row.insertCell().textContent = Utils.formatCurrency(saida.valorPresente || 0);

            const categoriaCell = row.insertCell();
            this.renderCategorias(categoriaCell, saida.categoria, 'bg-warning');

            const acoesCell = row.insertCell();
            const deleteButton = Utils.createButton(
                '', 
                'btn-sm btn-outline-danger', 
                'bi bi-trash',
                () => this.confirmarExclusao('saida', saida.id)
            );
            acoesCell.appendChild(deleteButton);
        });
    }

    renderContasRecorrentes(contasRecorrentes) {
        const tbody = document.getElementById('listaContasRecorrentes');
        if (!tbody) return;

        tbody.innerHTML = '';
        const yearMonth = Utils.getCurrentYearMonth();

        contasRecorrentes.forEach(conta => {
            const row = tbody.insertRow();
            const isPaid = conta.pagamentos && conta.pagamentos[yearMonth];

            row.insertCell().textContent = conta.descricao || '';
            row.insertCell().textContent = Utils.formatCurrency(conta.valor || 0);
            row.insertCell().textContent = `Dia ${conta.diaVencimento}`;
            
            const categoriaCell = row.insertCell();
            this.renderCategorias(categoriaCell, conta.categoria, 'bg-info');

            const acoesCell = row.insertCell();
            
            const payButton = Utils.createButton(
                isPaid ? 'Pago' : 'Pagar',
                `btn-sm ${isPaid ? 'btn-success' : 'btn-outline-success'}`,
                'bi bi-check-circle',
                () => this.registrarPagamentoConta(conta)
            );
            payButton.disabled = isPaid;
            
            const deleteButton = Utils.createButton(
                '',
                'btn-sm btn-outline-danger ms-2',
                'bi bi-trash',
                () => this.confirmarExclusao('contaRecorrente', conta.id)
            );

            acoesCell.append(payButton, deleteButton);
        });
    }

    renderCategorias(container, categorias, badgeClass) {
        container.innerHTML = '';
        const categoriasArray = Utils.parseCategorias(categorias);
        
        categoriasArray.forEach(cat => {
            const badge = Utils.createBadge(cat, badgeClass);
            container.appendChild(badge);
        });
    }

    renderRecentTransactions(entradas, saidas) {
        const container = document.getElementById('recentTransactions');
        if (!container) return;

        container.innerHTML = '';
        const allTransactions = [
            ...entradas.map(e => ({ ...e, type: 'entrada' })),
            ...saidas.map(s => ({ ...s, type: 'saida' }))
        ].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
         .slice(0, 5);

        if (allTransactions.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhuma transação recente</p>';
            return;
        }

        allTransactions.forEach(transaction => {
            const div = document.createElement('div');
            div.className = 'd-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded';
            
            const infoDiv = document.createElement('div');
            const descStrong = document.createElement('strong');
            descStrong.textContent = transaction.descricao || 'Sem descrição';
            const dateSmall = document.createElement('small');
            dateSmall.className = 'text-muted';
            dateSmall.textContent = Utils.formatDate(transaction.data);
            infoDiv.append(descStrong, document.createElement('br'), dateSmall);

            const valueDiv = document.createElement('div');
            valueDiv.className = 'text-end';
            const valueSpan = document.createElement('span');
            valueSpan.className = `fw-bold ${transaction.type === 'entrada' ? 'text-success' : 'text-danger'}`;
            const value = transaction.type === 'entrada' ? transaction.valorRecebido : transaction.valorPresente;
            valueSpan.textContent = `${transaction.type === 'entrada' ? '+' : '-'}${Utils.formatCurrency(value || 0)}`;
            valueDiv.appendChild(valueSpan);

            div.append(infoDiv, valueDiv);
            container.appendChild(div);
        });
    }

    renderPaymentReminders(contasRecorrentes) {
        const container = document.getElementById('paymentReminders');
        if (!container) return;

        container.innerHTML = '';
        const today = new Date();
        const currentDay = today.getDate();
        const yearMonth = Utils.getCurrentYearMonth();

        const unpaidBills = contasRecorrentes.filter(conta => {
            const isPaid = conta.pagamentos && conta.pagamentos[yearMonth];
            return !isPaid;
        }).sort((a, b) => a.diaVencimento - b.diaVencimento);

        if (unpaidBills.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhuma conta pendente para este mês.</p>';
            return;
        }

        unpaidBills.forEach(conta => {
            const daysRemaining = conta.diaVencimento - currentDay;
            let alertClass = 'alert-info';
            let message = `Vence em ${daysRemaining} dias`;

            if (daysRemaining < 0) {
                alertClass = 'alert-danger';
                message = `Venceu há ${Math.abs(daysRemaining)} dias`;
            } else if (daysRemaining <= 5) {
                alertClass = 'alert-warning';
            }

            const div = document.createElement('div');
            div.className = `alert ${alertClass} d-flex justify-content-between align-items-center`;
            div.innerHTML = `
                <div>
                    <strong>${conta.descricao}</strong> - ${Utils.formatCurrency(conta.valor || 0)}
                    <br>
                    <small>Vencimento: Dia ${conta.diaVencimento} (${message})</small>
                </div>
            `;
            
            const payButton = Utils.createButton(
                'Pagar',
                'btn btn-sm btn-primary',
                null,
                () => this.registrarPagamentoConta(conta)
            );
            
            div.appendChild(payButton);
            container.appendChild(div);
        });
    }

    updateDashboardStats(entradas, saidas) {
        const totalEntradas = entradas.reduce((sum, e) => sum + parseFloat(e.valorRecebido || 0), 0);
        const totalSaidas = saidas.reduce((sum, s) => sum + parseFloat(s.valorPresente || 0), 0);
        const saldo = totalEntradas - totalSaidas;

        const totalEntradasEl = document.getElementById('totalEntradas');
        const totalSaidasEl = document.getElementById('totalSaidas');
        const saldoEl = document.getElementById('saldo');
        const mesAtualEl = document.getElementById('mesAtual');

        if (totalEntradasEl) totalEntradasEl.textContent = Utils.formatCurrency(totalEntradas);
        if (totalSaidasEl) totalSaidasEl.textContent = Utils.formatCurrency(totalSaidas);
        if (saldoEl) saldoEl.textContent = Utils.formatCurrency(saldo);
        
        if (mesAtualEl) {
            const now = new Date();
            mesAtualEl.textContent = `${APP_CONSTANTS.MONTHS[now.getMonth()]} ${now.getFullYear()}`;
        }
    }

    updateCategoriasSugeridas(categorias) {
        const datalist = document.getElementById('categoriasSugeridas');
        if (!datalist) return;

        datalist.innerHTML = '';
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            datalist.appendChild(option);
        });
    }

    // Métodos de ação
    async confirmarExclusao(tipo, id) {
        const messages = {
            entrada: 'Tem certeza que deseja excluir esta entrada?',
            saida: 'Tem certeza que deseja excluir esta saída?',
            contaRecorrente: 'Tem certeza que deseja excluir esta conta recorrente?'
        };

        if (confirm(messages[tipo])) {
            try {
                switch (tipo) {
                    case 'entrada':
                        await this.firebaseService.excluirEntrada(id);
                        break;
                    case 'saida':
                        await this.firebaseService.excluirSaida(id);
                        break;
                    case 'contaRecorrente':
                        await this.firebaseService.excluirContaRecorrente(id);
                        break;
                }
            } catch (error) {
                console.error(`Erro ao excluir ${tipo}:`, error);
            }
        }
    }

    async registrarPagamentoConta(conta) {
        const yearMonth = Utils.getCurrentYearMonth();
        
        if (conta.pagamentos && conta.pagamentos[yearMonth]) {
            Utils.showToast('Esta conta já foi paga este mês.', 'warning');
            return;
        }

        try {
            // Criar saída correspondente ao pagamento
            const saida = {
                data: Utils.getTodayString(),
                descricao: `Pagamento: ${conta.descricao}`,
                valorTotal: conta.valor,
                valorPresente: conta.valor,
                categoria: conta.categoria,
                recorrenteId: conta.id
            };

            await this.firebaseService.salvarSaida(saida);
            await this.firebaseService.marcarContaComoPaga(conta.id, yearMonth);
        } catch (error) {
            console.error("Erro ao registrar pagamento:", error);
        }
    }
}
