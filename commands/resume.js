const {serverQueue} =  require('./play')


module.exports = {
    name: 'resume',
    description: "This is a resume command",
    async execute(message, args) {
        const server = serverQueue.get(message.guild.id)

        const voiceChannel = server.voiceChannel
        const connection = server.connection
        if(!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to stop the music!");
        const dispatcher = server.dispatcher
        
        await connection.play(server.songs[0].url, {seek: 0, volume: 1, quality: 'highestaudio'})
        console.log(dispatcher.paused)
        console.log(dispatcher)
        
        server.messageChannel.send(`Resume playing ${server.songs[0].title}`)
    }
}