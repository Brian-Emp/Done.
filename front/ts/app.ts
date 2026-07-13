/////////////////////////////////////////// DEFINITION DES VARIABLES ///////////////////////////////////////////
import { Tache } from "./Tache.js";
import { langueActive, dictionnaire } from "./dico.js";

//Elements HTML ecran principal
let btnAjouter = document.getElementById('btnAjouter') as HTMLButtonElement;
let inputTache = document.getElementById('inputTache') as HTMLInputElement;
let listeTaches = document.getElementById('listeTaches') as HTMLDivElement;
let btn_logout = document.getElementById('btn_logout') as HTMLButtonElement;

//Listes et parametres (clic droit) de listes
let menuListes = document.getElementById('menuListes') as HTMLUListElement;
let btnAjouterListe = document.getElementById('btnAjouterListe') as HTMLButtonElement;
let titreListeActive = document.getElementById('titreListeActive') as HTMLHeadingElement;
let menuContextuel = document.getElementById('menuContextuel') as HTMLDivElement;
let btnDeleteListCtx = document.getElementById('btnDeleteListCtx') as HTMLButtonElement;
let btnRenameListCtx = document.getElementById('btnRenameList') as HTMLButtonElement;

//Settings (btn et ecran)
let btn_settings = document.getElementById('btn_settings') as HTMLButtonElement;
let zoneParametres = document.getElementById('zoneParametres') as HTMLDivElement;
let zoneSaisie = document.querySelector('.zone-saisie') as HTMLDivElement;

//Username et changement username dans settings
let infoUsername = document.getElementById('infoUsername') as HTMLElement;
let inputNewUsername = document.getElementById('inputNewUsername') as HTMLInputElement;
let btnUpdateUsername = document.getElementById('btnUpdateUsername') as HTMLButtonElement;
let feedbackUsername = document.getElementById('feedbackUsername') as HTMLSpanElement;
let infoEmail = document.getElementById('infoEmail') as HTMLElement;

//Password et changement password dans settings
let inputOldPassword = document.getElementById('inputOldPassword') as HTMLInputElement;
let inputNewPassword = document.getElementById('inputNewPassword') as HTMLInputElement;
let btnUpdatePassword = document.getElementById('btnUpdatePassword') as HTMLButtonElement;
let feedbackPassword = document.getElementById('feedbackPassword') as HTMLSpanElement;

//Variables autres
let listeCibleId: number = 0;
let listeCibleNom: string = '';
const themeSwitch = document.getElementById('themeSwitch') as HTMLDivElement;
const themeButtons = themeSwitch.querySelectorAll<HTMLButtonElement>('[data-theme-value]');
let userList = 0;

/////////////////////////////////////////// INTERFACES ///////////////////////////////////////////
interface TacheAPI {
    id: number;
    title: string;
    is_completed: number;
}

/////////////////////////////////////////// FONCTIONS ///////////////////////////////////////////
function resetFormulairesParametres() {
    inputNewUsername.value = '';
    inputOldPassword.value = '';
    inputNewPassword.value = '';
    feedbackUsername.textContent = '';
    feedbackUsername.classList.remove('success', 'error');
    feedbackPassword.textContent = '';
    feedbackPassword.classList.remove('success', 'error');
}

function afficherFeedback(el: HTMLElement, cleTraduction: string, type: 'success' | 'error') {
    const msg = dictionnaire[langueActive]?.[cleTraduction] || cleTraduction;
    el.textContent = msg;
    el.classList.remove('success', 'error');
    el.classList.add(type);
    setTimeout(() => {
        el.textContent = '';
        el.classList.remove('success', 'error');
    }, 3000);
}

function appliquerTraduction() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!key) return; 
        const traductions = dictionnaire[langueActive];
        if (traductions && traductions[key]) {
            const texteTraduit = traductions[key];
            if (key === 'input_placeholder' && el instanceof HTMLInputElement) {
                el.placeholder = texteTraduit;
            } else {
                el.textContent = texteTraduit;
            }
        }
    });
}

function appliquerTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
    themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.themeValue === theme);
    });
}

function displayTask(tache: Tache){
    let balise = document.createElement('div');
    balise.innerText = tache.title;
    balise.style.cursor = 'pointer';

    let btnSupprimer = document.createElement('button');
    btnSupprimer.innerText = 'Delete';
    balise.appendChild(btnSupprimer);

    btnSupprimer.addEventListener('click', (event) => {
        /// Evite que le clic declenche l'event listener du parent (balise)
        event.stopPropagation();
        let donneesAEnvoyer = { id: tache.id };
        fetch('../api/delete_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donneesAEnvoyer)})
            .then(reponse => reponse.json())
            .then(data => { console.log(data);
                if (data.success === true) {
                    balise.remove();
                }
            })
            .catch(err => console.error(err))
});
    /// Si la tache est terminee, on la barre et on la met en gris
    if (tache.estTermine){
        balise.style.textDecoration = 'line-through';
        balise.style.color = 'var(--texte-doux)';
        balise.style.order = '1';
    } else {
        balise.style.order = '0';
    }
    /// Chagement de l'etat de la tache en bdd après clic
    balise.addEventListener('click', () => {
        let donneesAEnvoyer = { id: tache.id };
        fetch('../api/update_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donneesAEnvoyer)})
            .then(reponse => reponse.json())
            .then(data => { console.log(data);
                if (data.success === true){
                    tache.ChangeState();
                    if (tache.estTermine){
                        balise.style.textDecoration = 'line-through';
                        balise.style.color = 'gray';
                        balise.style.order = '1';
                    } else {
                        balise.style.textDecoration = 'none';
                        balise.style.color = 'var(--texte)';
                        balise.style.order = '0';
                    }
                }
            })
            .catch(err => console.error(err))
    });
    listeTaches.appendChild(balise);
}

function loadTasks(){
    fetch('../api/get_tasks.php?list_id=' + userList)
    .then(reponse => reponse.json())
    .then(tasks => { 
        if (tasks.success === false){
            window.location.href = 'login.html';
            return;
        } else {
            listeTaches.innerHTML = '';
            tasks.forEach((task: TacheAPI) => {
            let t = new Tache(task.title);
            t.id = task.id;
            if (task.is_completed === 1){
                t.ChangeState();
            }
            displayTask(t);
            });
        }
    })
}

function loadLists() {
    fetch('../api/get_lists.php')
    .then(reponse => {
        if (reponse.status === 401) {
            window.location.href = 'login.html';
            throw new Error("Non connecté, redirection...");
        }
        return reponse.json();
    })
    .then(lists => { 
        if (lists.success === true && Array.isArray(lists.lists)) {
            lists.lists.forEach((list: {id: number, name: string}, index: number) => {
                let li = document.createElement('li');
                if (index === 0) {
                    document.querySelectorAll('#menuListes li').forEach(el => el.classList.remove('liste-active'));
                    li.classList.add('liste-active');
                    titreListeActive.innerText = list.name;
                    userList = list.id;
                    loadTasks();
                }
                li.innerText = list.name;
                li.style.cursor = 'pointer';
                if (index !== 0) {
                    li.addEventListener('contextmenu', (event) => {
                    event.preventDefault(); 
                    listeCibleId = list.id;
                    listeCibleNom = list.name;
                    menuContextuel.style.display = 'flex';
                    menuContextuel.style.left = event.pageX + 'px';
                    menuContextuel.style.top = event.pageY + 'px';
                    });
                }
                li.addEventListener('click', () => {
                    document.querySelectorAll('#menuListes li').forEach(el => el.classList.remove('liste-active'));
                    li.classList.add('liste-active');
                    titreListeActive.innerText = list.name;
                    userList = list.id;
                    listeTaches.innerHTML = '';
                    zoneParametres.style.display = 'none';
                    resetFormulairesParametres();
                    zoneSaisie.style.display = 'flex';
                    listeTaches.style.display = 'flex';
                    document.querySelectorAll('#menuListes li').forEach(el => (el as HTMLLIElement).style.cursor = 'pointer');
                    loadTasks();
                });
                // If general display is disabled, hide it
                if (index === 0 && !afficherGeneral) {
                    li.style.display = 'none';
                }
                menuListes.appendChild(li);
            });
        } else {
            console.error("Impossible de charger les listes :", lists);
        }
    })
    .catch(err => console.error("Erreur réseau :", err));
}

function loadUserInfo() {
    fetch('../api/get_user.php')
    .then(reponse => {
        if (reponse.status === 401) {
            window.location.href = 'login.html';
            throw new Error("Non connecté, redirection...");
        }
        return reponse.json();
    })
    .then(data => {
        if (data.success === true && data.user) {
            infoUsername.textContent = data.user['username'];
            infoEmail.innerText = data.user['email'];
            document.body.style.opacity = '1';
            document.body.style.pointerEvents = 'auto';
        } else {
            console.error("Impossible de charger les informations de l'utilisateur :", data);
        }
    })
    .catch(err => console.error("Erreur réseau :", err));
}

/////////////////////////////////////////// EVENTS LISTENERS ///////////////////////////////////////////
// INPUT TACHE (Entrer) //
inputTache.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        btnAjouter.click(); 
    }
});

// DISPARITION DU MENU CONTEXTUEL (clic gauche) //
document.addEventListener('click', () => {
    menuContextuel.style.display = 'none';
});

// BOUTON RENOMMER LISTE (clique droit) //
btnRenameListCtx.addEventListener('click', () => {
    let nouveauNom = prompt("Entrez le nouveau nom de la liste :", listeCibleNom);
    if (nouveauNom && nouveauNom.trim() !== '') {
        let donneesAEnvoyer = { id: listeCibleId, name: nouveauNom.trim() };
        fetch('../api/update_list.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donneesAEnvoyer)
        })
        .then(reponse => reponse.json())
        .then(data => {
            if (data.success === true) {
                menuListes.innerHTML = '';
                loadLists();
            }
        })
        .catch(err => console.error(err));
    } else {
        alert("Le nom de la liste ne peut pas être vide.");
    }
});

// BOUTON SUPPRIMER LISTE (clique droit) //
btnDeleteListCtx.addEventListener('click', () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la liste "${listeCibleNom}" ?`)) {
        return;
    }
    
    let donneesAEnvoyer = { id: listeCibleId };
    fetch('../api/delete_list.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donneesAEnvoyer)
    })
    .then(reponse => reponse.json())
    .then(data => {
        if (data.success === true) {
            menuListes.innerHTML = '';
            loadLists();
        }
    })
    .catch(err => console.error(err));
});

// BOUTON AJOUTER TACHE (add) //
btnAjouter.addEventListener('click', () => {
    let texteSaisi = inputTache.value;
    if (texteSaisi == ''){
        alert("Tache vide, veuillez la compléter.");
        return;
    }
    let donneesAEnvoyer = { title: texteSaisi};
    fetch('../api/add_task.php?list_id=' + userList, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donneesAEnvoyer)})
        .then(reponse => reponse.json())
        .then(data => { console.log(data);
            if (data.success === true){
                let nouvTache = new Tache(texteSaisi);
                nouvTache.id = data.id;
                inputTache.value = '';
                displayTask(nouvTache);
            }
        })
        .catch(err => console.error(err))   
})

// BOUTON AJOUTER LISTE (+) //
btnAjouterListe.addEventListener('click', () => {
    let nomListe = prompt("Entrez le nom de la nouvelle liste :");
    if (nomListe && nomListe.trim() !== '') {
        let donneesAEnvoyer = { name: nomListe.trim() };
        fetch('../api/add_list.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donneesAEnvoyer)})
            .then(reponse => reponse.json())
            .then(data => { console.log(data);
                if (data.success === true){
                    menuListes.innerHTML = '';
                    loadLists();
                }
            })
            .catch(err => console.error(err))
    } else {
        alert("Le nom de la liste ne peut pas être vide.");
    }
});

// BOUTON PARAMETRES //
btn_settings.addEventListener('click', () => {
    if (zoneParametres.style.display === 'flex') {
        let premierDossier = document.querySelector('#menuListes li') as HTMLLIElement;
        if (premierDossier) premierDossier.click();
        titreListeActive.innerText = document.querySelector('#menuListes li.liste-active')?.textContent || '';
    } else {
        zoneSaisie.style.display = 'none';
        listeTaches.style.display = 'none';
        titreListeActive.innerText = dictionnaire[langueActive]?.['settings_title'] || 'Settings';
        document.querySelectorAll('#menuListes li').forEach(el => el.classList.remove('liste-active'));
        document.querySelectorAll('#menuListes li').forEach(el => (el as HTMLLIElement).style.cursor = 'not-allowed');
        zoneParametres.style.display = 'flex';
    }
});

// LANGUAGE //
const langueSwitch = document.getElementById('langueSwitch') as HTMLDivElement;
const langueButtons = langueSwitch.querySelectorAll<HTMLButtonElement>('[data-langue-value]');
langueButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langueValue === langueActive);
});
langueButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const nouvelle = btn.dataset.langueValue;
        if (!nouvelle) return;
        localStorage.setItem('langue', nouvelle);
        window.location.reload();
    });
});

// AFFICHAGE DE LA LISTE GENERAL //
let checkGeneral = document.getElementById('checkGeneral') as HTMLInputElement;
let afficherGeneral: boolean = localStorage.getItem('afficherGeneral') !== 'false';
checkGeneral.checked = afficherGeneral;
// Dès que la case est cochée ou décochée, on sauvegarde le choix dans le localStorage et on recharge les listes
checkGeneral.addEventListener('change', () => {
    // Sauvegarde choix d'affichage de General dans localstorage
    localStorage.setItem('afficherGeneral', checkGeneral.checked.toString());
    afficherGeneral = checkGeneral.checked;
    menuListes.innerHTML = '';
    loadLists();
});

// THEME SWITCH //
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const nouveau = btn.dataset.themeValue;
        if (!nouveau) return;
        localStorage.setItem('theme', nouveau);
        appliquerTheme(nouveau);
    });
});

// UPDATE USERNAME //
btnUpdateUsername.addEventListener('click', () => {
    const nouveau = inputNewUsername.value.trim();
    if (nouveau === '') {
        afficherFeedback(feedbackUsername, 'feedback_username_empty', 'error');
        return;
    }
    if (nouveau === infoUsername.textContent) {
        afficherFeedback(feedbackUsername, 'feedback_username_same', 'error');
        return;
    }
    fetch('../api/update_username.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: nouveau })
    })
    .then(reponse => {
        if (reponse.status === 401) {
            window.location.href = 'login.html';
            throw new Error("Non connecté");
        }
        return reponse.json();
    })
    .then(data => {
        const cle = typeof data?.code === 'string' ? 'feedback_' + data.code : (data?.message ?? '');
        if (data.success === true) {
            infoUsername.textContent = data.username;
            inputNewUsername.value = '';
            afficherFeedback(feedbackUsername, cle, 'success');
        } else {
            afficherFeedback(feedbackUsername, cle, 'error');
        }
    })
    .catch(err => console.error(err));
});

inputNewUsername.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') btnUpdateUsername.click();
});

// UPDATE PASSWORD //
btnUpdatePassword.addEventListener('click', () => {
    const ancien = inputOldPassword.value;
    const nouveau = inputNewPassword.value;    
    if (ancien === '' || nouveau === '') {
        afficherFeedback(feedbackPassword, 'feedback_password_empty', 'error')
        return
    }    

    fetch('../api/update_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: ancien, newPassword: nouveau })
    })
    .then(reponse => {
        if (reponse.status === 401) {
            window.location.href = 'login.html';
            throw new Error("Non connecté");
        }
        return reponse.json();
    })
    .then(data => {
        const cle = typeof data?.code === 'string' ? 'feedback_' + data.code : (data?.message ?? '');
        if (data.success === true) {
            inputOldPassword.value = '';
            inputNewPassword.value = '';
            afficherFeedback(feedbackPassword, cle, 'success');
        } else {
            afficherFeedback(feedbackPassword, cle, 'error');
        }
    })
    .catch(err => console.error(err));
});

inputNewPassword.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') btnUpdatePassword.click();
});

// LOGOUT //
btn_logout.addEventListener('click', () => {
    fetch('../api/logout.php')
    .then(reponse => reponse.json())
    .then(data => { console.log(data);
        if (data.success === true){
            window.location.href = 'login.html';
        }
    })
    .catch(err => console.error(err))
});

/////////////////////////////////////////// APPELS DE FONCTIONS ///////////////////////////////////////////
loadLists();
loadUserInfo();
appliquerTraduction();
appliquerTheme(localStorage.getItem('theme')|| (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
