// @ts-nocheck

import { Room } from "colyseus";

class TrackRoom extends Room {
    onCreate(options) {
        this.maxClients = 8;

        this.roomName = options.roomName;
        this.roomId = options.roomId;
        this.creator = options.creator;
        this.publicRoom = options.publicRoom;
        this.players = 0;
    }

    onJoin(client) {
        this.players++;
    }

    onLeave(client) {
        this.players = Math.max(0, this.players - 1);
    }

    onDispose() {
        console.log("Sala encerrada:", this.roomId);
    }
}

export default TrackRoom;
