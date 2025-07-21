# Gerenciador Financeiro IOSA

Sistema de gerenciamento financeiro pessoal desenvolvido em JavaScript vanilla com Firebase como backend.

## 📁 Estrutura do Projeto

```
Financeiro/
├── index.html              # Página principal da aplicação
├── css/
│   └── styles.css          # Estilos customizados da aplicação
├── js/
│   ├── config.js           # Configurações do Firebase e constantes
│   ├── utils.js            # Funções utilitárias reutilizáveis
│   ├── firebase-service.js # Serviços de integração com Firebase
│   ├── components.js       # Renderização de componentes UI
│   ├── chart-manager.js    # Gerenciamento de gráficos (Chart.js)
│   └── app.js              # Controlador principal da aplicação
└── README.md               # Documentação do projeto
```

## 🏗️ Arquitetura

### Separação de Responsabilidades

**1. Configuração (`config.js`)**
- Configurações do Firebase
- Constantes da aplicação (métodos de pagamento, meses, etc.)

**2. Utilitários (`utils.js`)**
- Formatação de moeda e datas
- Validação de formulários
- Funções de loading e notificações
- Helpers para manipulação de DOM

**3. Serviços Firebase (`firebase-service.js`)**
- Autenticação com Google
- Operações CRUD no Realtime Database
- Listeners para dados em tempo real
- Gerenciamento de estado de usuário

**4. Componentes UI (`components.js`)**
- Renderização de listas (entradas, saídas, contas)
- Renderização de dashboard e estatísticas
- Componentes reutilizáveis (badges, botões)
- Handlers de ações de usuário

**5. Gráficos (`chart-manager.js`)**
- Configuração e atualização de gráficos
- Preparação de dados para visualização
- Gerenciamento do ciclo de vida dos gráficos

**6. Aplicação Principal (`app.js`)**
- Orquestração de todos os módulos
- Configuração de event listeners
- Inicialização da aplicação
- Coordenação entre serviços

## 🚀 Funcionalidades

### Autenticação
- Login/logout com Google Authentication
- Persistência de sessão
- Dados isolados por usuário

### Gestão Financeira
- **Entradas**: Registro de receitas com categorização
- **Saídas**: Controle de gastos e despesas
- **Contas Recorrentes**: Gestão de contas mensais fixas

### Dashboard
- Estatísticas financeiras em tempo real
- Gráfico de evolução mensal
- Transações recentes
- Lembretes de pagamento

### Recursos Adicionais
- Filtros por mês
- Categorização com tags
- Export de dados em JSON
- Interface responsiva

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **UI Framework**: Bootstrap 5
- **Gráficos**: Chart.js
- **Backend**: Firebase (Authentication + Realtime Database)
- **Arquitetura**: ES6 Modules

## 📋 Boas Práticas Implementadas

### Código
- **Modularização**: Cada arquivo tem responsabilidade específica
- **ES6 Modules**: Import/export para organização
- **Classes**: Encapsulamento de funcionalidades relacionadas
- **Async/Await**: Operações assíncronas legíveis
- **Error Handling**: Tratamento adequado de erros

### Segurança
- **Validação**: Validação de dados no frontend
- **Sanitização**: Prevenção de XSS na renderização
- **Autenticação**: Dados isolados por usuário autenticado

### Performance
- **Lazy Loading**: Carregamento sob demanda
- **Debounce**: Otimização de eventos frequentes
- **DOM Minimal**: Manipulação eficiente do DOM

### UX/UI
- **Responsivo**: Interface adaptável a diferentes telas
- **Loading States**: Feedback visual durante operações
- **Toast Notifications**: Feedback imediato ao usuário
- **Validação em Tempo Real**: Validação de formulários

## 🔧 Como Executar

1. Clone o repositório
2. Abra o arquivo `index.html` em um servidor web local
3. Configure as credenciais do Firebase no `config.js`
4. Acesse a aplicação no navegador

> **Nota**: Por usar ES6 modules, é necessário servir os arquivos através de um servidor HTTP (não funciona abrindo diretamente o arquivo HTML).

## 📊 Estrutura de Dados

### Usuário
```json
{
  "users": {
    "userId": {
      "entradas": { /* registros de entrada */ },
      "saidas": { /* registros de saída */ },
      "contasRecorrentes": { /* contas fixas */ },
      "categorias": { /* tags utilizadas */ }
    }
  }
}
```

### Entrada
```json
{
  "numero": "string",
  "data": "YYYY-MM-DD",
  "descricao": "string",
  "valorTotal": "number",
  "formaPagamento": "string",
  "valorRecebido": "number",
  "categoria": ["array", "de", "strings"],
  "timestamp": "ISO string"
}
```

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
