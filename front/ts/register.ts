let emaill = document.getElementById('email') as HTMLInputElement;
let passwordd = document.getElementById('password') as HTMLInputElement;
let username = document.getElementById('username') as HTMLInputElement;
let btn_register = document.getElementById('btn_register') as HTMLButtonElement;
let form_register = document.getElementById('form_register') as HTMLFormElement;

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
                alert('Registration failed: ' + data.message);
            }
        })
        .catch(err => console.error(err));
});