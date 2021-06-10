module.exports = {
    name: 'youtube',
    description: 'Play youtube',
    execute(message, args) {

        // let role = message.guild.roles.cache.find(r => r.name === 'Mod')
        // if(message.member.permissions.has('BAN_MEMBERS')) {
        //     message.channel.send('You have the permission to kick members')
        // }
        if(message.member.roles.cache.has('847659918554431499')){
            message.channel.send('http://youtube.com')
        }  else {
            console.log(message.member.roles.cache)
            message.channel.send("You can't send this command because you don't have access")
        }
    }
}