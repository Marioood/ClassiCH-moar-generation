const ClientPacket = require('../ClientPacket');

const ServerMovementPacket = require('../Server/Movement');

const lists = require('../../Lists');
const utils = require('../../Utils');

class MovementPacket extends ClientPacket {
    constructor(client, buffer) {
        super(client, buffer, lists.clientPackets.movement);

        this.x;
        this.y;
        this.z;
        this.yaw;
        this.pitch;

        this.constructPacket();
        this.handle();
    }

    constructPacket() {
        this.x = utils.readUInt16(this.buffer, 2);
        this.y = utils.readUInt16(this.buffer, 4);
        this.z = utils.readUInt16(this.buffer, 6);
        this.yaw = this.buffer[8];
        this.pitch = this.buffer[9];
    }

    handle() {
        let player = lists.players[this.client.id];

        // don't do anything if position/rotation is the same
        if (
            utils.compareUInt16(this.x, player.x)
            && utils.compareUInt16(this.y, player.y)
            && utils.compareUInt16(this.z, player.z)
            && this.yaw === player.yaw
            && this.pitch === player.pitch
        )
            return;

        // if player's pitch is invalid
        if (this.pitch > 64 && this.pitch < 192) {
            console.log(this.pitch);
            return;
        }

        // set player's position/rotation
        player.x = this.x;
        player.y = this.y;
        player.z = this.z;
        player.yaw = this.yaw;
        player.pitch = this.pitch;

        player.lastActivity = Math.round(performance.now());

        // send player's position/rotation to other clients
        new ServerMovementPacket(

            utils.getOtherPlayerClients(this.client),
            false,
            this.client.id,
            this.x,
            this.y,
            this.z,
            this.yaw,
            this.pitch

        );
    }
}

module.exports = MovementPacket;