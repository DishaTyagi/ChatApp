const http = require('http'); //used by express to create server for socket.io
const express = require("express");
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser,userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);  
const io = socketio(server);    //io represents socketio server

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

const botName = "ChatApp Bot";

//run when client(i.e. user) connects
io.on('connection', (socket) => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room); 
        socket.join(user.room);

        //welcome current user
        socket.emit('message',formatMessage(botName,"Welcome to chatApp!"));

        //broadcast when a user connects(except the user himself)
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${username} joined the chat!`));

        //send users and rooms info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //listen for chatMessage
    socket.on('chatMessage', (msg) => {

        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));        
    });

    //runs when the client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat.`));

            //send users and rooms info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
    
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`);    
});