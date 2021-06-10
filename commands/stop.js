const {serverQueue} =  require('./play')


module.exports = {
    name: 'stop',
    description: 'stop the song',
    async execute(message, args) {
        const server = serverQueue.get(message.guild.id)

        const voiceChannel = server.voiceChannel
        const connection = server.connection
 
        if(!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to stop the music!");
        const dispatcher = server.dispatcher
        
        await dispatcher.end();
        console.log(dispatcher.paused)
    }
}