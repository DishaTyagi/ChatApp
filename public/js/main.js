const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById("room-name");
const userList = document.getElementById('users');

//get username and room from URL
const{ username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});
console.log(username);
console.log(room);

const socket = io();

//join chatroom
socket.emit('joinRoom', {username, room});

//get room and users
socket.on('roomUsers',({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
})

//message from server
socket.on("message", (message) => {
    console.log(message);  
    outputMessage(message);

    //to scroll down automatically to see new messages
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//add eventListener to the Send button in chat.html
chatForm.addEventListener('submit', (event) => {
    event.preventDefault();

    //get message text
    const msg = event.target.elements.msg.value ;

    //emit message to server
    socket.emit('chatMessage', msg);

    //clear input
    event.target.elements.msg.value = '';
    event.target.elements.msg.focus();  //focuses on the message again so that we dont have to click on the textbox to write text away.
});

//output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">
           ${message.text}
        </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

//add users to DOM
function outputUsers(users){
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}