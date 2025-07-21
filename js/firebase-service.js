import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, push, remove, set, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, browserPopupRedirectResolver } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from './config.js';
import { Utils } from './utils.js';

export class FirebaseService {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.database = getDatabase(this.app);
        this.auth = getAuth(this.app);
        this.currentUser = null;
    }

    // Métodos de autenticação
    onAuthStateChange(callback) {
        return onAuthStateChanged(this.auth, (user) => {
            this.currentUser = user;
            callback(user);
        });
    }

    async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider, browserPopupRedirectResolver);
            Utils.showToast(`Bem-vindo, ${result.user.displayName}!`, 'success');
            return result.user;
        } catch (error) {
            console.error("Erro no login com Google:", error);
            throw new Error("Falha ao autenticar com o Google. Tente novamente.");
        }
    }

    async signOut() {
        try {
            await signOut(this.auth);
            Utils.showToast('Logout realizado com sucesso!');
        } catch (error) {
            console.error("Erro no logout:", error);
            throw new Error("Erro ao fazer logout");
        }
    }

    // Métodos de database
    getDbRef(path) {
        if (!this.currentUser) {
            throw new Error("Usuário não autenticado.");
        }
        return ref(this.database, `users/${this.currentUser.uid}/${path}`);
    }

    // Operações de dados
    async salvarTags(tags) {
        try {
            const updates = {};
            tags.forEach(tag => {
                updates[tag] = true;
            });
            if (Object.keys(updates).length > 0) {
                await update(this.getDbRef('categorias'), updates);
            }
        } catch (error) {
            console.error("Erro ao salvar tags:", error);
            throw error;
        }
    }

    async salvarEntrada(entrada) {
        try {
            Utils.showLoading();
            entrada.timestamp = new Date().toISOString();
            const tags = Utils.parseCategorias(entrada.categoria);
            entrada.categoria = tags;
            
            await this.salvarTags(tags);
            const newEntradaRef = push(this.getDbRef('entradas'));
            await set(newEntradaRef, entrada);
            
            Utils.showToast('Entrada salva com sucesso!');
            return newEntradaRef.key;
        } catch (error) {
            console.error("Erro ao salvar entrada:", error);
            Utils.showToast('Erro ao salvar entrada', 'danger');
            throw error;
        } finally {
            Utils.showLoading(false);
        }
    }

    async salvarSaida(saida) {
        try {
            Utils.showLoading();
            saida.timestamp = new Date().toISOString();
            const tags = Utils.parseCategorias(saida.categoria);
            saida.categoria = tags;

            await this.salvarTags(tags);
            const newSaidaRef = push(this.getDbRef('saidas'));
            await set(newSaidaRef, saida);
            
            Utils.showToast('Saída salva com sucesso!');
            return newSaidaRef.key;
        } catch (error) {
            console.error("Erro ao salvar saída:", error);
            Utils.showToast('Erro ao salvar saída', 'danger');
            throw error;
        } finally {
            Utils.showLoading(false);
        }
    }

    async salvarContaRecorrente(conta) {
        try {
            Utils.showLoading();
            const tags = Utils.parseCategorias(conta.categoria);
            conta.categoria = tags;

            await this.salvarTags(tags);
            const newContaRef = push(this.getDbRef('contasRecorrentes'));
            await set(newContaRef, conta);
            
            Utils.showToast('Conta recorrente salva com sucesso!');
            return newContaRef.key;
        } catch (error) {
            console.error("Erro ao salvar conta recorrente:", error);
            Utils.showToast('Erro ao salvar conta', 'danger');
            throw error;
        } finally {
            Utils.showLoading(false);
        }
    }

    async excluirEntrada(id) {
        try {
            await remove(this.getDbRef(`entradas/${id}`));
            Utils.showToast('Entrada excluída com sucesso!');
        } catch (error) {
            console.error("Erro ao excluir entrada:", error);
            Utils.showToast('Erro ao excluir entrada', 'danger');
            throw error;
        }
    }

    async excluirSaida(id) {
        try {
            await remove(this.getDbRef(`saidas/${id}`));
            Utils.showToast('Saída excluída com sucesso!');
        } catch (error) {
            console.error("Erro ao excluir saída:", error);
            Utils.showToast('Erro ao excluir saída', 'danger');
            throw error;
        }
    }

    async excluirContaRecorrente(id) {
        try {
            await remove(this.getDbRef(`contasRecorrentes/${id}`));
            Utils.showToast('Conta recorrente excluída com sucesso!');
        } catch (error) {
            console.error("Erro ao excluir conta recorrente:", error);
            Utils.showToast('Erro ao excluir conta', 'danger');
            throw error;
        }
    }

    async marcarContaComoPaga(contaId, yearMonth) {
        try {
            const updates = {};
            updates[`users/${this.currentUser.uid}/contasRecorrentes/${contaId}/pagamentos/${yearMonth}`] = true;
            await update(ref(this.database), updates);
            Utils.showToast('Pagamento registrado com sucesso!');
        } catch (error) {
            console.error("Erro ao marcar conta como paga:", error);
            Utils.showToast('Erro ao marcar conta como paga', 'danger');
            throw error;
        }
    }

    // Listeners para dados em tempo real
    onEntradasChange(callback) {
        const entradasRef = this.getDbRef('entradas');
        return onValue(entradasRef, (snapshot) => {
            const data = snapshot.val();
            const entradas = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            entradas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            callback(entradas);
        });
    }

    onSaidasChange(callback) {
        const saidasRef = this.getDbRef('saidas');
        return onValue(saidasRef, (snapshot) => {
            const data = snapshot.val();
            const saidas = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            callback(saidas);
        });
    }

    onContasRecorrentesChange(callback) {
        const contasRef = this.getDbRef('contasRecorrentes');
        return onValue(contasRef, (snapshot) => {
            const data = snapshot.val();
            const contas = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            callback(contas);
        });
    }

    onCategoriasChange(callback) {
        const categoriasRef = this.getDbRef('categorias');
        return onValue(categoriasRef, (snapshot) => {
            const data = snapshot.val();
            const categorias = data ? Object.keys(data) : [];
            callback(categorias);
        });
    }
}
