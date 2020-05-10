const moment = require('moment');
function formatMessage(username, text){
    return{
        username,       //means username: username
        text,
        time: moment().format('h:mm a')
    }
}

module.exports= formatMessage;