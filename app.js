import { Tache } from "./Tache.js";
let btnAjouter = document.getElementById('btnAjouter');
let inputTache = document.getElementById('inputTache');
let listeTaches = document.getElementById('listeTaches');
function displayTask(tache) {
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
        fetch('delete_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donneesAEnvoyer)
        })
            .then(reponse => reponse.json())
            .then(data => {
            console.log(data);
            if (data.success === true) {
                /// Deletion successful, remove the task from the UI
                balise.remove();
            }
        })
            .catch(err => console.error(err));
    });
    /// If the task completed at creation, line-through style
    if (tache.estTermine) {
        balise.style.textDecoration = 'line-through';
        balise.style.color = 'gray';
    }
    /// Event listener change the state of the task when clicked
    balise.addEventListener('click', () => {
        let donneesAEnvoyer = { id: tache.id };
        fetch('update_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donneesAEnvoyer)
        })
            .then(reponse => reponse.json())
            .then(data => {
            console.log(data);
            if (data.success === true) {
                tache.ChangeState();
                if (tache.estTermine) {
                    balise.style.textDecoration = 'line-through';
                    balise.style.color = 'gray';
                }
                else {
                    balise.style.textDecoration = 'none';
                    balise.style.color = 'black';
                }
            }
        })
            .catch(err => console.error(err));
    });
    listeTaches.appendChild(balise);
}
function loadTasks() {
    fetch('get_tasks.php')
        .then(reponse => reponse.json())
        .then(tasks => {
        tasks.forEach((task) => {
            let t = new Tache(task.title);
            t.id = task.id;
            if (task.is_completed === 1) {
                t.ChangeState();
            }
            displayTask(t);
        });
    });
}
btnAjouter.addEventListener('click', () => {
    let texteSaisi = inputTache.value;
    if (texteSaisi == '') {
        alert("Tache vide, veuillez la compléter.");
        return;
    }
    let donneesAEnvoyer = { title: texteSaisi };
    fetch('add_task.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donneesAEnvoyer)
    })
        .then(reponse => reponse.json())
        .then(data => {
        console.log(data);
        if (data.success === true) {
            let nouvTache = new Tache(texteSaisi);
            nouvTache.id = data.id;
            inputTache.value = '';
            displayTask(nouvTache);
        }
    })
        .catch(err => console.error(err));
});
loadTasks();
