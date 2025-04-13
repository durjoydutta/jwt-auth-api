const API_BASE_URL = 'http://localhost:3000/api/v1';

const authBtn = document.getElementById('authBtn');
const toggleBtn = document.getElementById('toggleBtn');
const registerForm = document.getElementById('reg-login');
let isRegister = false;

async function handleSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isRegister) {
        if (!username || !email || !password) {
            alert('Please fill in all fields: username, email, and password.');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            console.log("Sign up successful");
            localStorage.setItem('token', data.token);
            alert('Sign up successful');
            // Optional redirect:
            window.location.href = '/dashboard';

        } catch (error) {
            alert('Sign up failed. Please try again.');
            console.error(error.message);
        }
    } else {
        if (!username || !password) {
            alert('Please fill in all fields: username and password.');
            return;
        }
        const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        const data = await response.json();
        if (!response.ok) {
            alert('Sign in failed. Please try again.');
            throw new Error(data.message);
        }

        console.log('Sign in successful');
        localStorage.setItem('token', data.token);
        alert('Sign up successful');
        // Optional redirect:
        window.location.href = '/dashboard';
    }
}

const toggleRegister = (e) => {
    e.preventDefault();
    isRegister = !isRegister;
    authBtn.textContent = isRegister ? 'SignUp' : 'SignIn';
    toggleBtn.textContent = isRegister ? 'SignIn' : 'SignUp';
    document.getElementById('email-label').style.display = isRegister ? 'block' : 'none';
}


authBtn.addEventListener('click', handleSubmit);
toggleBtn.addEventListener('click', toggleRegister);