var io = require('socket.io').listen(1337);
var md5 = require('md5');

var users = {};
var messages = [];
var history = 2;

io.sockets.on('connection', function (socket) {
    var me = false;
    console.log('Nouveau utilisateur');

    /**
     * Récupération des éléments présents
     **/
    // Utilisateurs connectés
    for (var k in users) {
        socket.emit('newusr', users[k]); // A l'utilisateur seulement
    }
    // Messages envoyés
    for (var k in messages) {
        socket.emit('newmsg', messages[k]);
    }

    /**
     * On a reçu un message
     **/
    socket.on('newmsg', function (message) {
        message.user = me;
        date = new Date();
        message.h = date.getHours();
        message.m = date.getMinutes();
        messages.push(message); // Ajoute le message à l'historique
        if (messages.length > history) {
            messages.shift(); // Supprime le premier message (plus vieux)
        }
        io.sockets.emit('newmsg', message); // A tout le monde
    });

    /**
     * Je me connecte
     **/
    socket.on('login', function (user) {
        me = user;
        me.id = user.mail.replace('@', '-').replace('.', '-');
        me.avatar = 'https://gravatar.com/avatar/' + md5.digest_s(user.mail) + '?s=50';
        socket.emit('logged');
        users[me.id] = me;
        io.sockets.emit('newusr', me);
    });
    
    /**
     * Je me déconnecte
     **/
    socket.on('disconnect', function(){
        if(!me){
            return false;
        }
        delete users[me.id];
        io.sockets.emit('signout', me);
    });
});