import { Utils } from './utils.js';

export class ChartManager {
    constructor() {
        this.chart = null;
    }

    updateChart(entradas, saidas) {
        const ctx = document.getElementById('financeChart');
        if (!ctx) return;

        if (this.chart) {
            this.chart.destroy();
        }

        const { labels, entradasData, saidasData } = this.prepareChartData(entradas, saidas);

        this.chart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Entradas',
                        data: entradasData,
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Saídas',
                        data: saidasData,
                        borderColor: '#dc2626',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => Utils.formatCurrency(value)
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => `${context.dataset.label}: ${Utils.formatCurrency(context.raw)}`
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                }
            }
        });
    }

    prepareChartData(entradas, saidas) {
        const labels = [];
        const entradasData = [];
        const saidasData = [];

        // Preparar dados dos últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            labels.push(date.toLocaleDateString('pt-BR', { 
                month: 'short', 
                year: 'numeric' 
            }));

            const monthEntradas = entradas
                .filter(e => e.data && e.data.startsWith(monthKey))
                .reduce((sum, e) => sum + parseFloat(e.valorRecebido || 0), 0);
                
            const monthSaidas = saidas
                .filter(s => s.data && s.data.startsWith(monthKey))
                .reduce((sum, s) => sum + parseFloat(s.valorPresente || 0), 0);
            
            entradasData.push(monthEntradas);
            saidasData.push(monthSaidas);
        }

        return { labels, entradasData, saidasData };
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}
