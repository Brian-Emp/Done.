import { langueActive, dictionnaire } from "./dico.js";

export function notif(cleOuMessage: string, type: 'success' | 'error' | 'info' = 'info') {
    const container = document.getElementById('notifs') as HTMLDivElement | null;
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'notif ' + type;
    // Verrif de la trad dans dico, sinon affiche txt brut
    el.textContent = dictionnaire[langueActive]?.[cleOuMessage] || cleOuMessage;
    container.appendChild(el);
    // Disparition notif apres 3s
    setTimeout(() => {
        el.classList.add('sortie');
        el.addEventListener('animationend', () => el.remove(), { once: true });
    }, 3000);
}
