const io = require('./index').io;

const { VERIFY_USER, USER_CONNECTED, USER_DISCONNECTED, 
    LOGOUT, COMMUNITY_CHAT, MESSAGE_RECEIVED, 
    MESSAGE_SENT, TYPING  } = require('../Events');
const { createUser, createMessage, createChat } = require('../Factories');

let connectedUsers = {};
let communityChat = createChat();

module.exports = function (socket) {
    console.log(`Socket ID: ${socket.id}.`);

    let sendMessageToChatFromUser;

    // Verify username.
    socket.on(VERIFY_USER, (nickname, callback) => {
        if (isUser(connectedUsers, nickname)) {
            callback({ isUser: true, user: null });
        } else {
            callback({ isUser: false, user: createUser({ name: nickname }) });
        }
    });

    // User connects with username.
    socket.on(USER_CONNECTED, (user) => {
        connectedUsers = addUser(connectedUsers, user);
        socket.user = user;

        sendMessageToChatFromUser = sendMessageToChat(user.name);

        io.emit(USER_CONNECTED, connectedUsers);
        console.log("Connect", connectedUsers);
    });

    // User disconnects.
    socket.on('disconnect', () => {
        if ("user" in socket) {
            connectedUsers = removeUser(connectedUsers, socket.user.name);
            io.emit(USER_DISCONNECTED, connectedUsers);
            console.log("Disconnect", connectedUsers);
        }
    });

    // User logout.
    socket.on(LOGOUT, () => {
        connectedUsers = removeUser(connectedUsers, socket.user.name);
        io.emit(USER_DISCONNECTED, connectedUsers);
        console.log("Disconnect", connectedUsers);
    });

    // Get community chat.
    socket.on(COMMUNITY_CHAT, (callback) => {
        callback(communityChat);
    });

    socket.on(MESSAGE_SENT, ({ chatId, message }) => {
        sendMessageToChatFromUser(chatId, message);
    });
};

function sendMessageToChat (sender) {
    return (chatId, message) => {
        io.emit(`${MESSAGE_RECEIVED}-${chatId}`, createMessage({ message, sender }));
    };
}

function addUser (userList, user) {
    let newList = Object.assign({}, userList);
    newList[user.name] = user;
    return newList;
}

function removeUser (userList, username) {
    let newList = Object.assign({}, userList);
    delete newList[username];
    return newList;
}

function isUser (userList, username) {
    return username in userList;
}