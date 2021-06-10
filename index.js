const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const ytdl = require("ytdl-core");

const client = new Discord.Client();

const fs = require('fs')

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
                        server.messageChannel.send(`About to play ***${server.songs[0].title}*** ***${server.songs[0].url}***`)
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



client.commands = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'))
console.log(commandFiles)
for(const file of commandFiles) {
  const command = require(`./commands/${file}`)

  client.commands.set(command.name, command)
}


client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});


client.on("message", message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase()
  // serverQueue.set(message.guild.id, {songs: []})
  // serverQueue.get(message.guild.id).songs.push(args[1])

  if(command === 'play') {
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
            
            voiceChannel.join()
              .then(connection => {
                serverConstructor.connection = connection
              })
            serverQueue.set(message.guild.id, serverConstructor)

            viedeoFinder(args.join(' '))
            .then(song => {
              serverConstructor.songs.push(song)
              play(message.guild, song)
              message.reply(`:thumbsup: Now Playing ***${song.title}*** ***${song.url}***`)
            })

      
            // console.log(song)
            
           
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
            viedeoFinder(args.join(' '))
            .then(song => {
              serverQueue.get(message.guild.id).songs.push(song)
              return message.channel.send(`${song.title} has been added to the queue!`);
            })
            
        }
        
        // console.log(serverQueue.get(message.guild.id))

     
    } else if(command === "pause") {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) return message.channel.send('You need to be in a voice channel')
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if(!permissions.has('CONNECT')) return message.channel.send("You don't have the correct permissions")
        if(!permissions.has('SPEAK')) return message.channel.send("You don't have the correct permissions")
        serverQueue.get(message.guild.id).connection.dispatcher.pause();
        message.reply(`Successfully paused ***${serverQueue.get(message.guild.id).songs[0].title}***`)

    } else if(command === "resume") {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) return message.channel.send('You need to be in a voice channel')
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if(!permissions.has('CONNECT')) return message.channel.send("You don't have the correct permissions")
        if(!permissions.has('SPEAK')) return message.channel.send("You don't have the correct permissions")
        serverQueue.get(message.guild.id).connection.dispatcher.resume()
        message.reply(`Successfully resume ***${serverQueue.get(message.guild.id).songs[0].title}***`)
    } else if(command === "check") {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) return message.channel.send('You need to be in a voice channel')
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if(!permissions.has('CONNECT')) return message.channel.send("You don't have the correct permissions")
        if(!permissions.has('SPEAK')) return message.channel.send("You don't have the correct permissions")
        let songs = [];
        for(song of serverQueue.get(message.guild.id).songs) {
          songs.push(song.title)
        }
  
        message.reply(`Songs queue: ***${JSON.stringify(songs)}`)

    } else if(command === 'skip') {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) return message.channel.send('You need to be in a voice channel')
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if(!permissions.has('CONNECT')) return message.channel.send("You don't have the correct permissions")
        if(!permissions.has('SPEAK')) return message.channel.send("You don't have the correct permissions")
        const server = serverQueue.get(message.guild.id)
        if(!server.songs.length > 1) {
          return message.reply(`There's no song to skip right now`)
        }
        server.songs.shift()
        play(message.guild, server.songs[0]);
        return message.reply(`Now skipped, and playing ***${server.songs[0].title}***`)
    } else if(command === 'leave') {
      const voiceChannel = message.member.voice.channel
      if(!voiceChannel) return message.channel.send('You need to be in a voice channel')
      const permissions = voiceChannel.permissionsFor(message.client.user)
      if(!permissions.has('CONNECT')) return message.channel.send("You don't have the correct permissions")
      if(!permissions.has('SPEAK')) return message.channel.send("You don't have the correct permissions")
      voiceChannel.leave()
      return message.reply("GoodBye, looking forward to seeing you next time!")
    }
})
  

  // if(command === 'ping') {
  //   client.commands.get('ping').execute(message,args)
  // } else if(command == 'youtube') {
  //   client.commands.get('youtube').execute(message, args)
  // } else if(command == 'play') {
  //   client.commands.get('play').execute(message, args)
  // } else if(command =='leave') {
  //   client.commands.get('leave').execute(message, args)
  // } else if(command =='stop') {
  //   client.commands.get('stop').execute(message, args)
  // } else if(command =='resume') {
  //   client.commands.get('resume').execute(message, args)
  // }




client.login(token);

  // const serverQueue = queue.get(message.guild.id);


//   if (message.content.startsWith(`${prefix}play`)) {
//     message.channel.send('play')
//     return;
//   } else if (message.content.startsWith(`${prefix}skip`)) {
//     skip(message, serverQueue);
//     return;
//   } else if (message.content.startsWith(`${prefix}stop`)) {
//     stop(message, serverQueue);
//     return;
//   } else {
//     message.channel.send("You need to enter a valid command!");
//   }
// });

// async function execute(message, serverQueue) {
//   const args = message.content.split(" ");

//   const voiceChannel = message.member.voice.channel;
//   if (!voiceChannel)
//     return message.channel.send(
//       "You need to be in a voice channel to play music!"
//     );
//   const permissions = voiceChannel.permissionsFor(message.client.user);
//   if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
//     return message.channel.send(
//       "I need the permissions to join and speak in your voice channel!"
//     );
//   }

//   const songInfo = await ytdl.getInfo(args[1]);
//   const song = {
//         title: songInfo.videoDetails.title,
//         url: songInfo.videoDetails.video_url,
//    };

//   if (!serverQueue) {
//     const queueContruct = {
//       textChannel: message.channel,
//       voiceChannel: voiceChannel,
//       connection: null,
//       songs: [],
//       volume: 5,
//       playing: true
//     };

//     queue.set(message.guild.id, queueContruct);

//     queueContruct.songs.push(song);

//     try {
//       var connection = await voiceChannel.join();
//       queueContruct.connection = connection;
//       play(message.guild, queueContruct.songs[0]);
//     } catch (err) {
//       console.log(err);
//       queue.delete(message.guild.id);
//       return message.channel.send(err);
//     }
//   } else {
//     serverQueue.songs.push(song);
//     return message.channel.send(`${song.title} has been added to the queue!`);
//   }
// }

// function skip(message, serverQueue) {
//   if (!message.member.voice.channel)
//     return message.channel.send(
//       "You have to be in a voice channel to stop the music!"
//     );
//   if (!serverQueue)
//     return message.channel.send("There is no song that I could skip!");
//   serverQueue.connection.dispatcher.end();
// }

// function stop(message, serverQueue) {
//   if (!message.member.voice.channel)
//     return message.channel.send(
//       "You have to be in a voice channel to stop the music!"
//     );
    
//   if (!serverQueue)
//     return message.channel.send("There is no song that I could stop!");
    
//   serverQueue.songs = [];
//   serverQueue.connection.dispatcher.end();
// }

// function play(guild, song) {
//   const serverQueue = queue.get(guild.id);
//   if (!song) {
//     serverQueue.voiceChannel.leave();
//     queue.delete(guild.id);
//     return;
//   }

//   const dispatcher = serverQueue.connection
//     .play(ytdl(song.url))
//     .on("finish", () => {
//       serverQueue.songs.shift();
//       play(guild, serverQueue.songs[0]);
//     })
//     .on("error", error => console.error(error));
//   dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
//   serverQueue.textChannel.send(`Start playing: **${song.title}**`);
// }

