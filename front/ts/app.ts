import { Tache } from "./Tache.js";
import { langueActive, dictionnaire } from "./dico.js";

//ELEMENTS DEFINITION//
let btnAjouter = document.getElementById('btnAjouter') as HTMLButtonElement;
let inputTache = document.getElementById('inputTache') as HTMLInputElement;
let listeTaches = document.getElementById('listeTaches') as HTMLDivElement;
let btn_logout = document.getElementById('btn_logout') as HTMLButtonElement;
let menuListes = document.getElementById('menuListes') as HTMLUListElement;
let btnAjouterListe = document.getElementById('btnAjouterListe') as HTMLButtonElement;
let titreListeActive = document.getElementById('titreListeActive') as HTMLHeadingElement;
let menuContextuel = document.getElementById('menuContextuel') as HTMLDivElement;
let btnDeleteListCtx = document.getElementById('btnDeleteListCtx') as HTMLButtonElement;
let btnRenameListCtx = document.getElementById('btnRenameList') as HTMLButtonElement;
let btn_settings = document.getElementById('btn_settings') as HTMLButtonElement;
let zoneParametres = document.getElementById('zoneParametres') as HTMLDivElement;
let zoneSaisie = document.querySelector('.zone-saisie') as HTMLDivElement;
let infoUsername = document.getElementById('infoUsername') as HTMLElement;
let inputNewUsername = document.getElementById('inputNewUsername') as HTMLInputElement;
let btnUpdateUsername = document.getElementById('btnUpdateUsername') as HTMLButtonElement;
let feedbackUsername = document.getElementById('feedbackUsername') as HTMLSpanElement;
let infoEmail = document.getElementById('infoEmail') as HTMLElement;

let listeCibleId: number = 0;
let listeCibleNom: string = '';
const themeSwitch = document.getElementById('themeSwitch') as HTMLDivElement;
const themeButtons = themeSwitch.querySelectorAll<HTMLButtonElement>('[data-theme-value]');
let userList = 0;

//INTERFACES//
interface TacheAPI {
    id: number;
    title: string;
    is_completed: number;
}

//FUNCTIONS//
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
        /// Prevent the click event from propagating to the parent div
        event.stopPropagation();
        let donneesAEnvoyer = { id: tache.id };
        /// Send a request to delete the task from the database
        fetch('../api/delete_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donneesAEnvoyer)})
            .then(reponse => reponse.json())
            .then(data => { console.log(data);
                if (data.success === true) {
                    /// Deletion successful, remove the task from the UI
                    balise.remove();
                }
            })
            .catch(err => console.error(err))
});
    /// If the task completed at creation, line-through style
    if (tache.estTermine){
        balise.style.textDecoration = 'line-through';
        balise.style.color = 'gray';
        balise.style.order = '1';
    } else {
        balise.style.order = '0';
    }
    /// Event listener change the state of the task when clicked
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
                        balise.style.color = 'black';
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
            document.body.style.opacity = '1';
            document.body.style.pointerEvents = 'auto';
        } else {
            console.error("Impossible de charger les informations de l'utilisateur :", data);
        }
    })
    .catch(err => console.error("Erreur réseau :", err));
}

//EVENTS LISTENERS//
inputTache.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        btnAjouter.click(); 
    }
});

document.addEventListener('click', () => {
    menuContextuel.style.display = 'none';
});

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

// LANGUAGE SELECTION //
let selectLangue = document.getElementById('selectLangue') as HTMLSelectElement;
selectLangue.value = langueActive;

selectLangue.addEventListener('change', () => {
    // Save the selected language in localStorage
    localStorage.setItem('langue', selectLangue.value);
    // Reload the page to apply the new language
    window.location.reload();
});

// GENERAL DISPLAY //
let checkGeneral = document.getElementById('checkGeneral') as HTMLInputElement;
let afficherGeneral: boolean = localStorage.getItem('afficherGeneral') !== 'false';
// Set it on the checkbox
checkGeneral.checked = afficherGeneral;

checkGeneral.addEventListener('change', () => {
    // Save localStorage
    localStorage.setItem('afficherGeneral', checkGeneral.checked.toString());
    afficherGeneral = checkGeneral.checked;
    // Empty and reload
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
    
    // Garde 1 : champ vide
    // → afficherFeedback avec 'feedback_username_empty' + 'error' + return
    if (nouveau === '') {
        afficherFeedback(feedbackUsername, 'feedback_username_empty', 'error');
        return;
    }
    
    // Garde 2 : identique à l'actuel (compare avec infoUsername.textContent)
    // → afficherFeedback avec 'feedback_username_same' + 'error' + return
    
    // Appel API
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
        if (data.success === true) {
            // MAJ visuelle : infoUsername.textContent = data.username
            // Vider inputNewUsername
            // afficherFeedback succès avec 'feedback_username_success' + 'success'
        } else {
            // Erreur backend : afficher data.message
            // → afficherFeedback(feedbackUsername, data.message, 'error')
        }
    })
    .catch(err => console.error(err));
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

//INITIALIZATION//
loadLists();
loadUserInfo();
appliquerTraduction();
appliquerTheme(localStorage.getItem('theme')|| (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
