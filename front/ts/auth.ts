import { langueActive, dictionnaire } from "./dico.js";

let email = document.getElementById('email') as HTMLInputElement;
let password = document.getElementById('password') as HTMLInputElement;
let btn_login = document.getElementById('btn_login') as HTMLButtonElement;
let form_login = document.getElementById('form_login') as HTMLFormElement;

function traduireCode(code: unknown, fallback: string): string {
    if (typeof code !== 'string') return fallback;
    const cle = 'feedback_' + code;
    return dictionnaire[langueActive]?.[cle] || fallback;
}

form_login.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        btn_login.click();
    }
});

btn_login.addEventListener('click', (event) => {
    event.preventDefault();
    let donneesAEnvoyer = { email: email.value, password: password.value };
    fetch('../api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donneesAEnvoyer)})
        .then(reponse => reponse.json())
        .then(data => { console.log(data);
            if (data.success === true) {
                /// Login successful, redirect to the main page
                window.location.href = 'index.html';
            } else {
                /// Login failed, display an error message
                alert(traduireCode(data?.code, data?.message ?? ''));
            }
        })
        .catch(err => console.error(err));
});