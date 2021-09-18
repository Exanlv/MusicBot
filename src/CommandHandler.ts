import { Message, VoiceChannel } from "eris";
import { GuildPlayer } from "./GuildPlayer";
import { MusicBot } from "./MusicBot";
import * as ytdl from 'ytdl-core';


export class CommandHandler {
    private musicBot: MusicBot;

    constructor(musicBot: MusicBot) {
        this.musicBot = musicBot;
    }

    public async play(message: Message) {
        let ytInfo: ytdl.videoInfo;

        try {
            let ytUrl = message.content.split(' ')[1];

            ytInfo = await ytdl.getInfo(ytUrl);
        } catch (e) {
            message.channel.createMessage('Incorrect YT link');

            return;
        }

        if (message.member.voiceState.channelID === null) {
            message.channel.createMessage('Youre not in a vc');

            return;
        }

        if (this.musicBot.players[message.guildID] && !this.musicBot.players[message.guildID].deactivated) {
            this.musicBot.players[message.guildID].queueAdd(ytInfo);

            message.channel.createMessage('Added to queue');

            return;
        }

        let channel: VoiceChannel = this.musicBot.bot.guilds.find(
            g => g.id === message.guildID
        ).channels.find(
            c => c.id === message.member.voiceState.channelID
        ) as VoiceChannel;

        if (!channel) {
            message.channel.createMessage('Vc unavailable');

            return;
        }

        this.musicBot.players[message.guildID] = new GuildPlayer(channel);

        this.musicBot.players[message.guildID].on('ready', () => {
            this.musicBot.players[message.guildID].queueAdd(ytInfo);

            message.channel.createMessage('Started playing');
        });
    }

    public stop(message: Message) {
        if (this.musicBot.players[message.guildID]) {
            this.musicBot.players[message.guildID].nuke();

            message.channel.createMessage('Disconnected');

            return;
        }

        message.channel.createMessage('??');
    }

    public skip(message: Message) {
        if (!this.musicBot.players[message.guildID]) {
            message.channel.createMessage('Nothing to skip..');

            return;
        }

        this.musicBot.players[message.guildID].playNextSong();

        message.channel.createMessage('Skipped song');
    }

    public queue(message: Message) {
        if (!this.musicBot.players[message.guildID]) {
            message.channel.createMessage('No queue');

            return;
        }

        let queue = [];

        for (let i in this.musicBot.players[message.guildID].queue) {
            queue.push(this.musicBot.players[message.guildID].queue[i].videoDetails.title);
        }

        if (!queue.length) {
            message.channel.createMessage('No queue');

            return;
        }

        if (queue.length <= 5) {
            message.channel.createMessage(`Queue: \n\n${queue.join('\n')}`);

            return;
        }

        message.channel.createMessage(`Queue: \n\n${queue.slice(0, 5).join('\n')}\n\nAnd ${queue.length - 5} more`);
    }

    public remove(message: Message) {
        if (!this.musicBot.players[message.guildID]) {
            message.channel.createMessage('Donder op');

            return;
        }

        try {
            let numberToSkip = Number(message.content.split(' ')[1]);

            if (numberToSkip == 1) {
                return this.skip(message);
            }

            this.musicBot.players[message.guildID].queue.splice(numberToSkip - 1, 1);
        } catch (e) {
            message.channel.createMessage('Incorrect number');

            return;
        }

        message.channel.createMessage('Song removed');
    }
}