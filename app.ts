import { Tache } from "./Tache.js";

let btnAjouter = document.getElementById('btnAjouter') as HTMLButtonElement;
let inputTache = document.getElementById('inputTache') as HTMLInputElement;
let listeTaches = document.getElementById('listeTaches') as HTMLDivElement;

interface TacheAPI {
    id: number;
    title: string;
}

function displayTask(tache: Tache){
    let balise = document.createElement('div');
    balise.innerText = tache.title;
    listeTaches.appendChild(balise);
}

function loadTasks(){
    fetch('get_tasks.php')
    .then(reponse => reponse.json())
    .then(tasks => { tasks.forEach((task: TacheAPI) => {
        let t = new Tache(task.title);
        t.id = task.id;
        displayTask(t);
    });})
}

btnAjouter.addEventListener('click', () => {
    let texteSaisi = inputTache.value;
    if (texteSaisi == ''){
        alert("Tache vide, veuillez la compléter.");
        return;
    }
    let donneesAEnvoyer = { title: texteSaisi};
    fetch('add_task.php', {
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

loadTasks();