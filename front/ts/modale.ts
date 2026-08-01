import {langueActive, dictionnaire} from "./dico.js";

//recuperation des elements HTML (index section modale)
let modale = document.getElementById('modale') as HTMLDivElement;
let modaleTitre = document.getElementById('modaleTitre') as HTMLHeadingElement;
let modaleMessage = document.getElementById('modaleMessage') as HTMLParagraphElement;
let modaleAnnuler = document.getElementById('modaleAnnuler') as HTMLButtonElement;
let modaleConfirmer = document.getElementById('modaleConfirmer') as HTMLButtonElement;

let modalePromptDiv = document.getElementById('modalePrompt') as HTMLDivElement;
let modalePromptTitre = document.getElementById('modalePromptTitre') as HTMLHeadingElement;
let modalePromptInput = document.getElementById('modalePromptInput') as HTMLInputElement;
let modalePromptAnnuler = document.getElementById('modalePromptAnnuler') as HTMLButtonElement;
let modalePromptConfirmer = document.getElementById('modalePromptConfirmer') as HTMLButtonElement;


// Fonction pour afficher une modale de confirmation avec traduction
export function modaleConfirm(titreKey: string, messageKey: string, remplacements?: Record<string, string>): Promise<boolean> {
    // traduction du titre et du message
    function traduire(cle: string): string {
        return dictionnaire[langueActive]?.[cle] || cle;
    }
    return new Promise((resolve) => {
        // Fermer modale et gestion events
        function fermer(resultat: boolean) {
            modale.style.display = 'none';
            modaleAnnuler.removeEventListener('click', onAnnuler);
            modaleConfirmer.removeEventListener('click', onConfirmer);
            modale.removeEventListener('click', onClickFond);
            resolve(resultat);
        }

        function onAnnuler() {
            fermer(false);
        }

        function onConfirmer() {
            fermer(true);
        }

        function onClickFond(event: MouseEvent) {
            if (event.target === modale) {
                fermer(false);
            }
        }

        // Traduction du titre et du message
        let titre = traduire(titreKey);
        let message = traduire(messageKey);

        // Remplacement des variables dans le message si nécessaire
        if (remplacements) {
            for (const [cle, valeur] of Object.entries(remplacements)) {
                const regex = new RegExp(`\\{${cle}\\}`, 'g');
                message = message.replace(regex, valeur);
            }
        }

        modaleTitre.textContent = titre;
        modaleMessage.textContent = message;

        modale.style.display = 'flex';
        modaleAnnuler.addEventListener('click', onAnnuler);
        modaleConfirmer.addEventListener('click', onConfirmer);
        modale.addEventListener('click', onClickFond);
    });
}

export function modalePrompt(titreKey: string, valeurInitiale: string = ''): Promise<string | null> {    // traduction du titre et du message
    function traduire(cle: string): string {
        return dictionnaire[langueActive]?.[cle] || cle;
    }
    return new Promise((resolve) => {
        // Fermer modale et gestion events
        function fermer(resultat: string | null) {
            modalePromptDiv.style.display = 'none';
            modalePromptAnnuler.removeEventListener('click', onAnnuler);
            modalePromptConfirmer.removeEventListener('click', onConfirmer);
            modalePromptDiv.removeEventListener('click', onClickFond);
            modalePromptInput.removeEventListener('keydown', onEnter);
            resolve(resultat);
        }

        function onAnnuler() {
            fermer(null);
        }

        function onConfirmer() {
            fermer(modalePromptInput.value.trim());
        }

        function onClickFond(event: MouseEvent) {
            if (event.target === modalePromptDiv) {
                fermer(null);
            }
        }

        function onEnter(event: KeyboardEvent) {
            if (event.key === 'Enter') onConfirmer();
        }

        modalePromptTitre.textContent = traduire(titreKey);

        modalePromptInput.value = valeurInitiale;

        modalePromptDiv.style.display = 'flex';
        modalePromptInput.focus();
        modalePromptAnnuler.addEventListener('click', onAnnuler);
        modalePromptConfirmer.addEventListener('click', onConfirmer);
        modalePromptDiv.addEventListener('click', onClickFond);
        modalePromptInput.addEventListener('keydown', onEnter);
    });

}