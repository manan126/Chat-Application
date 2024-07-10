const API_URL = 'http://localhost:5001/api';
const socket = io('http://localhost:5001');

let currentUser = null;
let currentReceiver = null;

// Tab switching
document.getElementById('login-tab').addEventListener('click', () => showForm('login'));
document.getElementById('register-tab').addEventListener('click', () => showForm('register'));

function showForm(formType) {
    document.getElementById('login-form').style.display = formType === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = formType === 'register' ? 'block' : 'none';
    document.getElementById('login-tab').classList.toggle('active', formType === 'login');
    document.getElementById('register-tab').classList.toggle('active', formType === 'register');
}