import { readFileSync } from 'fs';
import { CommandHandler } from './CommandHandler';
import * as Eris from 'eris';
import { GuildPlayer } from './GuildPlayer';

export class MusicBot {
    private static instance: MusicBot = null;

    public bot: Eris.Client;

    public static prefix: string = '>';

    private commandHandler: CommandHandler;

    public players: {[guildId: string]: GuildPlayer} = {};

    private constructor() {
        this.bot = Eris(`Bot ${readFileSync('.token').toString().trim()}`, {
            allowedMentions: {
                everyone: false,
                users: false,
                roles: false
            }
        });

        this.bot.on('messageCreate', (message: Eris.Message) => {
            this.handleMessage(message);
        });

        this.commandHandler = new CommandHandler(this);

        this.bot.connect();
    }

    public static get Instance(): MusicBot {
        return this.instance === null ? this.instance = new MusicBot() : this.instance;
    }

    public async handleMessage(message: Eris.Message) {
        if (!message.guildID || !message.content.startsWith(MusicBot.prefix)) {
            return;
        }

        let commandUsed: string = message.content.split(' ')[0].substr(MusicBot.prefix.length).toLowerCase();

        switch (commandUsed) {
            case 'p':
            case 'play':
                this.commandHandler.play(message);
                break;
            case 's':
            case 'skip':
                this.commandHandler.skip(message);
                break;
            case 'stop':
                this.commandHandler.stop(message);
                break;
            case 'q':
            case 'queue':
                this.commandHandler.queue(message);
                break;
            case 'r':
            case 'remove':
                this.commandHandler.remove(message);
                break;
            default:
                message.channel.createMessage(`Unknown command \`${commandUsed}\``);
                break;
        }
    }
}