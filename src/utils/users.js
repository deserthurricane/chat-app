const users = [];

// add user, remove user, get user, get users in room

function addUser({ id, username, room }) {
    // normalize data
    const normUsername = username.trim().toLowerCase();
    const normRoom = room.trim().toLowerCase();

    // validate data
    if (!normUsername || !normRoom) {
        return {
            error: 'Username and room are required'
        }
    }

    // check for existing
    const existingUser = users.find(user => {
        return user.room === normRoom && user.username === normUsername;
    });

    // validate username
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // store user
    const newUser = { id, username: normUsername, room: normRoom };
    users.push(newUser);

    return { user: newUser };
}

function removeUser(id) {
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex !== -1) {
        return users.splice(userIndex, 1)[0];
    }
}

function getUser(id) {
    return users.find(user => user.id === id);
}

function getUsersInRoom(room) {
    return users.filter(user => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}