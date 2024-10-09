const zlib = require('zlib');

const Behaviour = require('../../Behaviour');

const ServerInitPacket = require('../../Server/Init');
const ServerChunkPacket = require('../../Server/Chunk');
const ServerFinalPacket = require('../../Server/Final');
const ServerDefineBlockPacket = require('../../Server/Ext/DefineBlock');
const ServerSetMapEnvUrlPacket = require('../../Server/Ext/SetMapEnvUrl');

const world = require('../../../World');
const lists = require('../../../Lists');
const config = require('../../../Config');

class BehaviourIdentificationWorld extends Behaviour {
    constructor(client) {
        super();

        this.client = client;

        this.successful = this.execute();
    }

    execute() {
        // world init packet
        new ServerInitPacket([this.client]);

        // compressed world data
        const compressedWorld = zlib.gzipSync(world.buffer);

        // compressed world data chunk loop
        for (let i = 0; i < compressedWorld.length; i += 1024) {
            let sliceBuffer = Buffer.alloc(1024, 0x00);
            let slicedChunk = compressedWorld.subarray(i, Math.min(i + 1024, compressedWorld.length));

            // this loop can be done better?
            for (let j = 0; j < slicedChunk.length; j++)
                sliceBuffer[j] = slicedChunk[j];

            let progress = i == 0 ? 0 : Math.ceil(i / compressedWorld.length * 100);

            // send compressed world data chunk with progress to client
            new ServerChunkPacket(

                [this.client],
                sliceBuffer,
                progress

            );
        }

        // send all custom blocks
        for (let customBlock of Object.values(lists.customBlocks))
            new ServerDefineBlockPacket(

                [this.client],
                customBlock.id,
                customBlock.name,
                customBlock.solidity,
                customBlock.speed,
                customBlock.top,
                customBlock.side,
                customBlock.bottom,
                customBlock.transmitLight,
                customBlock.sound,
                customBlock.bright,
                customBlock.height,
                customBlock.drawMode,
                customBlock.fogDensity,
                customBlock.fogR,
                customBlock.fogG,
                customBlock.fogB

            );

        // send url for texture pack
        new ServerSetMapEnvUrlPacket([this.client], config.self.server.texturePackURL);

        // tell client the world is final
        new ServerFinalPacket([this.client]);
        
        return true;
    }
}

module.exports = BehaviourIdentificationWorld;