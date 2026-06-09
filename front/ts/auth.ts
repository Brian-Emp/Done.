let email = document.getElementById('email') as HTMLInputElement;
let password = document.getElementById('password') as HTMLInputElement;
let btn_login = document.getElementById('btn_login') as HTMLButtonElement;
let form_login = document.getElementById('form_login') as HTMLFormElement;

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
                window.location.href = '../index.html';
            } else {
                /// Login failed, display an error message
                alert('Login failed: ' + data.message);
            }
        })
        .catch(err => console.error(err));
});