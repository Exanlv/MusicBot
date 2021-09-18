import { MusicBot } from "./MusicBot";

export function sleep(ms: number) {
    new Promise( res => setTimeout(res, ms));
}

MusicBot.Instance;

setInterval(() => {
    let musicBot = MusicBot.Instance;

    for (let i in musicBot.players) {
        if (musicBot.players[i].deactivated) {
            delete musicBot.players[i];
            continue;
        }

        musicBot.players[i].onLoop();
    }
}, 10000);