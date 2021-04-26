/**
 * Создает сообщение с timestamp
 * @param {string} text 
 */
function generateMessage(username, text) {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

/**
 * Создает ссылку на карту с timestamp
 * @param {string} url 
 */
function generateLocationMessage(username, url) {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = { generateMessage, generateLocationMessage };