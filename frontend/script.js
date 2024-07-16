const socket = io('http://localhost:5001');
let currentUser = null;
let selectedUser = null;

socket.on('private message', ({ from, message }) => {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML += `<p>${from === currentUser._id ? 'You' : selectedUser.username}: ${message}</p>`;
});

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('http://localhost:5001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            showChatInterface();
        } else {
            alert('Login failed: ' + data.error);
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

async function signup() {
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('http://localhost:5001/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password })
        });
        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            showChatInterface();
        } else {
            alert('Signup failed: ' + data.error);
        }
    } catch (error) {
        console.error('Signup error:', error);
    }
}

function showChatInterface() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('chat-container').style.display = 'block';
    document.getElementById('user-welcome').textContent = currentUser.username;
    socket.emit('login', currentUser._id);
    fetchUsers();
}

async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:5001/api/users', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Fetch users error:', error);
    }
}

async function searchUsers() {
    const searchTerm = document.getElementById('search-input').value;
    try {
        const response = await fetch(`http://localhost:5001/api/users/search?term=${searchTerm}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Search users error:', error);
    }
}

function displayUsers(users) {
    const usersList = document.getElementById('users');
    usersList.innerHTML = '';
    users.forEach(user => {
        if (user._id !== currentUser._id) {
            const li = document.createElement('li');
            li.textContent = user.username;
            li.onclick = () => startChat(user);
            usersList.appendChild(li);
        }
    });
}

function startChat(user) {
    selectedUser = user;
    document.getElementById('chat-box').style.display = 'block';
    document.getElementById('chat-with').textContent = user.username;
    document.getElementById('messages').innerHTML = '';
}

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;
    if (selectedUser && message) {
        socket.emit('private message', { to: selectedUser._id, message });
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML += `<p>You: ${message}</p>`;
        messageInput.value = '';
    }
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        fetch('http://localhost:5001/api/verify-token', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                currentUser = data.user;
                showChatInterface();
            }
        })
        .catch(error => {
            console.error('Token verification error:', error);
            localStorage.removeItem('token');
        });
    }
}

window.addEventListener('load', checkAuthStatus);