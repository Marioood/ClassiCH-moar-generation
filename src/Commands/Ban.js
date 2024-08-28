const Command = require('../Command');

const ServerMessagePacket = require('../Packets/Server/Message');
const ServerDisconnectPacket = require('../Packets/Server/Disconnect');

const lists = require('../Lists');
const utils = require('../Utils');
const config = require('../Config');

class CommandBan extends Command {
    constructor(client, args) {
        super(client, args);

        this.name = "ban";
        this.description = "Bans a specified player.";

        this.op = true;
        this.hidden = false;
    }

    execute() {
        if (this.args.length <= 0) {
            new ServerMessagePacket([this.client], 0xFF, "You must provide a name!");
            return;
        }

        if (!config.self.commands.selfActions && this.args[0] === lists.players[this.client.id].name) {
            new ServerMessagePacket([this.client], 0xFF, "You can't ban yourself!");
            return;
        }

        let name = this.args.shift()
        let player = utils.findPlayerByName(name);
        let reason = this.args.join(' ');

        if (lists.addBan(name, reason)) {
            if (player != undefined)
                if (reason.trim() !== "")
                    new ServerDisconnectPacket([player.client], `Banned: ${reason}`);
                else
                    new ServerDisconnectPacket([player.client], "You were banned!");

            new ServerMessagePacket([this.client], 0xFF, `${name} is now banned.`);
        } else
            new ServerMessagePacket([this.client], 0xFF, `${name} is already banned!`);

    }
}

module.exports = CommandBan;