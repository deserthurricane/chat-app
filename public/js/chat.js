const socket = io();

// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated', count);
// });

// const button = document.querySelector('#increment');
// button.onclick = () => {
//     socket.emit('increment');
// }

/**
 * MESSAGE
 */
const messagesList = document.querySelector('#messages');
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

socket.on('message', ({ username, text, createdAt }) => {
    const html = Mustache.render(messageTemplate, {
        username,
        message: text,
        createdAt: moment(createdAt).format('hh:mm a')
    });
    messagesList.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

const input = document.querySelector('#message');
const sendButton = document.querySelector('#submit');

sendButton.onclick = () => {
    // disable
    sendButton.setAttribute('disabled', 'disabled');
    const message = input.value;

    setTimeout(() => socket.emit('sendMessage', message, (status) => {
        // enable
        sendButton.removeAttribute('disabled');
        input.value = '';
        input.focus();
        console.log(status);
    }), 1000);
}

/**
 * LOCATION
 */
const sendLocationButton = document.querySelector('#send-location');
sendLocationButton.onclick = () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is noy supported by your browser');
    }

    // disable
    sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const { coords } = position;
        const { longitude, latitude } = coords;

        socket.emit('sendLocation', { longitude, latitude }, (status) => {
            // enable
            sendLocationButton.removeAttribute('disabled');
            console.log(status);
        });
    })
}

socket.on('locationMessage', ({ username, url, createdAt }) => {
    const html = Mustache.render(locationTemplate, {
        username,
        location: url,
        createdAt: moment(createdAt).format('hh:mm a')
    });
    messagesList.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

/*** Room Data */
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
const sidebar = document.querySelector('.chat__sidebar');
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    sidebar.innerHTML = html;
});

// Options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        window.location.href = '/';
    }
});

function autoScroll() {
    const newMessage = messagesList.lastElementChild;
    const newMessageMarginBottom = getComputedStyle(newMessage).marginBottom;
    const newMessageHeight = newMessage.offsetHeight + parseInt(newMessageMarginBottom);

    const visibleHeight = messagesList.offsetHeight;
    const containerHeight = messagesList.scrollHeight;
    // how far i scrolled
    const scrollOffset = messagesList.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messagesList.scrollTop = messagesList.scrollHeight;
    }
}