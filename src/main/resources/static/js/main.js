'use strict';

const usernamePage=document.querySelector('#username-page');
const chatPage=document.querySelector('#chat-page');
const usernameForm=document.querySelector('#usernameForm');
const messageForm=document.querySelector('#messageForm');
const messageInput=document.querySelector('#message');
const chatArea=document.querySelector('#chat-messages');
const logout=document.querySelector('#logout');

let stompClient=null;
let username=null;
let fullname=null;
let selectedUser=null;



//Event Listeners
usernameForm.addEventListener('submit',connect,true);
messageForm.addEventListener('submit',sendMessage,true);
logout.addEventListener('click',onLogout,true);
window.onbeforeunload = () => onLogout();
//Message Form Functions
function sendMessage(event){
    const messageContent=messageInput.value.trim();

    if (messageContent && stompClient){
        const chatMessage= {
            senderId: username,
            recipientId: selectedUser,
            content: messageContent,
            timestamp: new Date()
        }
        stompClient.send('/app/chat',{},JSON.stringify(chatMessage));
        displayMessage(username,messageContent);
    }
    chatArea.scrollTop=chatArea.scrollHeight;

    event.preventDefault();
}

function displayMessage(senderId,content){
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    if (senderId === username) {
        messageContainer.classList.add('sender');
    } else {
        messageContainer.classList.add('receiver');
    }
    const message = document.createElement('p');
    message.textContent = content;
    messageContainer.appendChild(message);
    chatArea.appendChild(messageContainer);
}

//UserName Form Functions
function connect(event){
    username=document.querySelector('#username').value.trim();
    fullname=document.querySelector('#fullname').value.trim();
    //Check input
    if(username && fullname){
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        const socket=new SockJS('/ws');
        stompClient=Stomp.over(socket);

        stompClient.connect({},onConnected,onError);
    }
    event.preventDefault();
}//Connecting user Logic
function onConnected(options) {
    //User has to subscribe to his own Queue
    stompClient.subscribe(`/user/${username}/queue/messages`, OnMessageReceived);
    stompClient.subscribe(`/user/public`, OnMessageReceived);

    stompClient.send('/app/user.addUser',
        {},
        JSON.stringify({username: username, fullname: fullname,status: 'ONLINE'})
    );
    //Find and Display Connected Users
    document.querySelector('#connected-user-fullname').textContent=fullname;
    findAndDisplayConnectedUsers().then();
}
function onError() { }

async function OnMessageReceived(payload){
    await findAndDisplayConnectedUsers();
    const message=JSON.parse(payload.body);
    if(selectedUser && selectedUser===message.senderId){
        displayMessage(message.senderId,message.content);
        chatArea.scrollTop=chatArea.scrollHeight;
    }

    if(selectedUser){
        document.querySelector(`#${selectedUser}`).classList.add('active');
    }else
        messageForm.classList.add('hidden');
    const notifiedUser= document.querySelector(`#${message.senderId}`);
    if(notifiedUser && !notifiedUser.classList.contains('active')){
        const nbr=notifiedUser.querySelector('.nbr-msg');
        nbr.classList.remove('hidden');
        nbr.textContent='';
    }
}
async function findAndDisplayConnectedUsers(){
    const connectedUsersResponse= await fetch('/users');
    let connectedUsers= await connectedUsersResponse.json();
    console.log(connectedUsers);
    connectedUsers= connectedUsers.filter(user => user.username !== username);
    const connectedUsersList = document.getElementById('connectedUsers');
    connectedUsersList.innerHTML = '';

    connectedUsers.forEach(user => {
        appendUserElement(user, connectedUsersList);
        if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
            const separator = document.createElement('li');
            separator.classList.add('separator');
            connectedUsersList.appendChild(separator);
        }
    });
}
function appendUserElement(user, connectedUsersList){
    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.username;

    const userImage = document.createElement('img');
    userImage.src = '../img/user_icon.png';
    userImage.alt = user.fullname;

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = user.fullname;

    const receivedMsgs = document.createElement('span');
    receivedMsgs.textContent = '0';
    receivedMsgs.classList.add('nbr-msg', 'hidden');

    listItem.appendChild(userImage);
    listItem.appendChild(usernameSpan);
    listItem.appendChild(receivedMsgs);

    listItem.addEventListener('click', userItemClick);

    connectedUsersList.appendChild(listItem);
}
function userItemClick(event) {
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    messageForm.classList.remove('hidden');

    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active');

    selectedUser = clickedUser.getAttribute('id');
    fetchAndDisplayUserChat().then();

    const nbrMsg = clickedUser.querySelector('.nbr-msg');
    nbrMsg.classList.add('hidden');
    nbrMsg.textContent = '0';
}

async function fetchAndDisplayUserChat(){
    const userChatResponse= await fetch(`/messages/${username}/${selectedUser}`);
    const userChat= await userChatResponse.json();
    chatArea.innerHTML='';
    console.log(userChat);
    userChat.forEach(chat => {
        displayMessage(chat.senderId,chat.content);
    });
    chatArea.scrollTop=chatArea.scrollHeight;
}


// Logout Functions

function onLogout(){
    stompClient.send('/app/user.disconnectUser',
        {},
        JSON.stringify({username: username, fullname: fullname,status: 'OFFLINE'}));
    window.location.reload();
}