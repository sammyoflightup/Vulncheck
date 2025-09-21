// SIGNUP
const signupBtn = document.getElementById('signupBtn');
if(signupBtn){
    signupBtn.addEventListener('click', async ()=>{
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const res = await fetch('http://127.0.0.1:5000/auth/signup', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({email,password})
        });
        const data = await res.json();
        if(res.ok){ localStorage.setItem('token', data.token); window.location.href='dashboard.html'; }
        else alert(data.message);
    });
}

// LOGIN
const loginBtn = document.getElementById('loginBtn');
if(loginBtn){
    loginBtn.addEventListener('click', async ()=>{
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const res = await fetch('http://127.0.0.1:5000/auth/login', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({email,password})
        });
        const data = await res.json();
        if(res.ok){ localStorage.setItem('token', data.token); window.location.href='dashboard.html'; }
        else alert(data.message);
    });
}
