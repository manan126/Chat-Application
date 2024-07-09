const API_URL = 'http://localhost:5001/api';
const socket = io('http://localhost:5001');

let currentUser = null;
let currentReceiver = null;

// Register form submission
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = { email };
            showChat();
        } else {
            alert(data.msg || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Registration failed');
    }
});

// Login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = { email };
            showChat();
        } else {
            alert(data.msg || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Login failed');
    }
});

async function fetchUsers() {
    const response = await fetch(`${API_URL}/chat/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const users = await response.json();
    const userList = document.getElementById('user-list');
    userList.innerHTML = users.map(user => `<div class="user" data-id="${user._id}">${user.username}</div>`).join('');
    
    userList.addEventListener('click', (e) => {
        if (e.target.classList.contains('user')) {
            currentReceiver = e.target.dataset.id;
            loadMessages(currentReceiver);
        }
    });
}

async function loadMessages(receiverId) {
    const response = await fetch(`${API_URL}/chat/messages/${receiverId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const messages = await response.json();
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = messages.map(msg => `<div>${msg.sender === currentUser._id ? 'You' : 'Other'}: ${msg.content}</div>`).join('');
}

document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    if (content && currentReceiver) {
        const response = await fetch(`${API_URL}/chat/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ receiverId: currentReceiver, content })
        });
        if (response.ok) {
            input.value = '';
            loadMessages(currentReceiver);
            socket.emit('chat message', { senderId: currentUser._id, receiverId: currentReceiver, content });
        }
    }
});

socket.on('new message', (msg) => {
    if (msg.sender === currentReceiver || msg.receiver === currentUser._id) {
        loadMessages(currentReceiver);
    }
});

function showChat() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('chat-container').style.display = 'flex';
    fetchUsers();
    socket.emit('join', currentUser._id);
}