const express = require('express');
const path = require('path');
const http = require('http');
const port = process.env.PORT || 3000; // heroku port
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server); // сервер передается аргументом

// Static directory
const pubDirPath = path.join(__dirname, '../public');
app.use(express.static(pubDirPath));

// let count = 0;

io.on('connection', (socket) => {
    socket.on('join', ({ username, room }, callback) => {
        const { user, error } = addUser({
            id: socket.id,
            username,
            room
        });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', `Welcome, ${user.username}`));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`)); // отправить всем, кроме текущего сокета
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has disconnected`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }

        const user = getUser(socket.id);

        io.to(user.room).emit('message', generateMessage(user.username, message)); // отображаем у всех в комнате
        callback('Delivered!');
    });

    socket.on('sendLocation', ({ longitude, latitude }, callback) => {
        callback('Location shared!');
        
        const googleMapLink = `https://google.com/maps?q=${latitude},${longitude}`
        // socket.broadcast.emit('message', googleMapLink);
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, googleMapLink));
    });
    // socket.emit('countUpdated', count);
    // socket.on('increment', () => {
    //     count++;
    //     // socket.emit('countUpdated', count); - only for 1 connection
    //     io.emit('countUpdated', count); // every connection
    // })
})


server.listen(port, () => {
    console.log(`Chat app on port ${port}`);
})