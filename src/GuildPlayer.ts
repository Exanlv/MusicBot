import { VoiceChannel, VoiceConnection } from "eris";
import * as EventEmitter from 'events';
import { sleep } from "./index";
import { videoInfo } from "ytdl-core";
import { MusicBot } from "./MusicBot";

export class GuildPlayer extends EventEmitter {
    private voiceConnection: VoiceConnection;
    public queue: videoInfo[] = [];

    private lastSongEnd: number;

    private static timeout: number = 300;

    private guildId: string;

    public deactivated: boolean = false;

    constructor(voiceChannel: VoiceChannel) {
        super();

        this.guildId = voiceChannel.guild.id;

        this.init(voiceChannel);
    }

    public async init(voiceChannel: VoiceChannel) {
        this.voiceConnection = await voiceChannel.join({});

        this.emit('ready');

        this.voiceConnection.on('end', () => {
            this.lastSongEnd = (new Date()).getTime() / 1000;

            this.playNextSong();
        });

        this.voiceConnection.on('disconnect', () => {
            this.deactivated = true;
        });
    }

    public queueAdd(ytInfo: videoInfo) {
        if (this.deactivated) {
            return;
        }

        this.queue.push(ytInfo);

        if (this.voiceConnection && !this.voiceConnection.speaking) {
            this.startPlaying();
        }
    }

    public async playNextSong() {
        if (this.deactivated) {
            return;
        }

        if (this.voiceConnection.speaking) {
            this.voiceConnection.stopPlaying();
            await sleep(2000);
        }

        this.queue.shift();

        if (this.queue.length > 0) {
            this.startPlaying();

            return;
        }
    }

    private startPlaying() {
        if (this.deactivated) {
            return;
        }

        this.voiceConnection.play(this.queue[0].formats[0].url);
    }

    public nuke() {
        if (this.deactivated) {
            return;
        }

        this.deactivated = true;

        if (this.voiceConnection) {
            this.voiceConnection.stopPlaying();

            this.voiceConnection.disconnect();
        }

        delete MusicBot.Instance.players[this.guildId];
    }

    public onLoop() {
        if (!this.voiceConnection) {
            console.log(this);

            return;
        }

        if (this.voiceConnection.speaking) {
            return;
        }
        
        if (this.queue.length > 0) {
            this.startPlaying();
        }

        let currentTime = (new Date()).getTime() / 1000;

        if (currentTime - GuildPlayer.timeout > this.lastSongEnd) {
            this.nuke();
        }
    }
}