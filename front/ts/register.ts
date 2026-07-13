import { langueActive, dictionnaire } from "./dico.js";

let emaill = document.getElementById('email') as HTMLInputElement;
let passwordd = document.getElementById('password') as HTMLInputElement;
let username = document.getElementById('username') as HTMLInputElement;
let btn_register = document.getElementById('btn_register') as HTMLButtonElement;
let form_register = document.getElementById('form_register') as HTMLFormElement;

function traduireCode(code: unknown, fallback: string): string {
    if (typeof code !== 'string') return fallback;
    const cle = 'feedback_' + code;
    return dictionnaire[langueActive]?.[cle] || fallback;
}

form_register.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        btn_register.click();
    }
});

btn_register.addEventListener('click', (event) => {
    event.preventDefault();
    let donneesAEnvoyer = { email: emaill.value, password: passwordd.value, username: username.value };
    fetch('../api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donneesAEnvoyer)})
        .then(reponse => reponse.json())
        .then(data => { console.log(data);
            if (data.success === true) {
                window.location.href = 'login.html';
            } else {
                alert(traduireCode(data?.code, data?.message ?? ''));
            }
        })
        .catch(err => console.error(err));
});