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

    onJoin() {
        this.players++;
    }

    onLeave() {
        this.players = Math.max(0, this.players - 1);
    }
}

export default TrackRoom;
