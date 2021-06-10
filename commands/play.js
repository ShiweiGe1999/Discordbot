const ytdl = require('ytdl-core')
const ytSearch = require('yt-search')

const serverQueue = new Map()



async function play(guild, song) {
            const server = serverQueue.get(guild.id)
            console.log(song.url)
            if(!song) {
                server.voiceChannel.leave();
                serverQueue.delete(guild.id);
                return
            }
            server.dispatcher = await server.connection.play(ytdl(song.url, {filter: 'audioonly'} ), {seek: 0, volume: 1, quality: 'highestaudio'})
                .on('finish', () => {
                    server.songs.shift()
                    if(server.songs[0]){
                        play(guild, server.songs[0])
                        server.messageChannel.send(`About to play ${server.songs[0].title}`)
                    }
                })
            
            // const dispatcher = server.connection
            //     .play(ytdl(song.url))
            //     .on('finish', () => {
            //         server.songs.shift()
            //         play(guild, server.songs[0])
            //     })
            //     .on('error', err => {
            //         console.log(err)
            //     })
            // dispatcher.setVolumeLogarithmic(server.volume / 5);
            
}

const viedeoFinder = async (query) => {
                const videoResult = await ytSearch(query)
                return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
}


module.exports = {
    name: 'play',
    description: "This is a play command",
    serverQueue,
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) return message.channel.send('You need to be in a voice channel')
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if(!permissions.has('CONNECT')) return message.channel.send("You don't have the correct permissions")
        if(!permissions.has('SPEAK')) return message.channel.send("You don't have the correct permissions")
        if(!args.length) return message.channel.send("You need to send the second argument")
        

        
        if(!serverQueue.get(message.guild.id)) {
            const serverConstructor = {
                messageChannel: message.channel,
                voiceChannel: message.member.voice.channel,
                connection: null,
                songs: [],
                dispatcher: null
            }
            
            serverConstructor.connection = await voiceChannel.join()
            serverQueue.set(message.guild.id, serverConstructor)

            const song = await viedeoFinder(args.join(' '));

            serverQueue.get(message.guild.id).songs.push(song)
            // console.log(song)
            play(message.guild, song)
            await message.reply(`:thumbsup: Now Playing ***${song.title}*** ***${song.url}***`)
            // if(serverQueue.get(message.guild.id).songs[0]) {
            //     const stream = ytdl(serverQueue.get(message.guild.id).songs[0].url, {filter: 'audioonly'} )
            //     serverQueue.get(message.guild.id).connection.play(stream, {seek: 0, volume: 1, quality: 'highestaudio'})
            //     .on('finish' , () => {
            //         serverQueue.get(message.guild.id).songs.shift()
            //         if(serverQueue.get(message.guild.id).songs[0]){
            //             serverQueue.get(message.guild.id).connection.play(ytdl(serverQueue.get(message.guild.id).songs[0].url, {filter: 'audioonly'} ), {seek: 0, volume: 1, quality: 'highestaudio'})
            //         }
            //         voiceChannel.leave()
            //     })

            //     await message.reply(`:thumbsup: Now Playing ***${video.title}***`)
            // } else {
            //     message.channel.send('No video results found')
            // }

        } else {
            const song = await viedeoFinder(args.join(' '));
            serverQueue.get(message.guild.id).songs.push(song)
            return message.channel.send(`${song.title} has been added to the queue!`);
        }
        
        // console.log(serverQueue.get(message.guild.id))

     
    }
}

// module.exports = {
//     name: 'play',
//     description: 'Joins and plays a video from youtube',
//     async execute(message, args) {
//         const voiceChannel = message.member.voice.channel;
 
//         if (!voiceChannel) return message.channel.send('You need to be in a channel to execute this command!');
//         const permissions = voiceChannel.permissionsFor(message.client.user);
//         if (!permissions.has('CONNECT')) return message.channel.send('You dont have the correct permissins');
//         if (!permissions.has('SPEAK')) return message.channel.send('You dont have the correct permissins');
//         if (!args.length) return message.channel.send('You need to send the second argument!');
 
//         const validURL = (str) =>{
//             var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
//             if(!regex.test(str)){
//                 return false;
//             } else {
//                 return true;
//             }
//         }
 
//         if(validURL(args[0])){
 
//             const  connection = await voiceChannel.join();
//             const stream  = ytdl(args[0], {filter: 'audioonly'});
 
//             connection.play(stream, {seek: 0, volume: 1})
//             .on('finish', () =>{
//                 voiceChannel.leave();
//                 message.channel.send('leaving channel');
//             });
 
//             await message.reply(`:thumbsup: Now Playing ***Your Link!***`)
 
//             return
//         }
 
        
//         const  connection = await voiceChannel.join();
 
//         const videoFinder = async (query) => {
//             const videoResult = await ytSearch(query);
 
//             return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
 
//         }
 
//         const video = await videoFinder(args.join(' '));
 
//         if(video){
//             const stream  = ytdl(video.url, {filter: 'audioonly'});
//             connection.play(stream, {seek: 0, volume: 1})
//             .on('finish', () =>{
//                 voiceChannel.leave();
//             });
 
//             await message.reply(`:thumbsup: Now Playing ***${video.title}***`)
//         } else {
//             message.channel.send('No video results found');
//         }
//     }
// }
