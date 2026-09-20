// @ts-nocheck

import express from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

const rooms = new Map();

function generateRoomId() {
    let id;
    do {
        id = crypto.randomInt(100000000, 1000000000).toString();
    } while (rooms.has(id));
    return id;
}

app.get("/ping", (_req, res) => {
    res.send("pong");
});

// Criar sala
app.post("/create", (req, res) => {
    const { roomName, creator, publicRoom } = req.body;

    if (!roomName || roomName.trim() === "") {
        return res.status(400).json({ error: "Nome inválido." });
    }

    const roomId = generateRoomId();

    const room = {
        roomId,
        roomName,
        creator,
        publicRoom: Boolean(publicRoom),
        players: 1,
        maxPlayers: 8,
        createdAt: Date.now()
    };

    rooms.set(roomId, room);

    res.json(room);
});

// Entrar por ID
app.post("/join", (req, res) => {
    const { roomId } = req.body;

    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ error: "Sala não encontrada." });
    }

    if (room.players >= room.maxPlayers) {
        return res.status(403).json({ error: "Sala cheia." });
    }

    room.players++;

    res.json(room);
});

// Lista pública
app.get("/publicrooms", (_req, res) => {
    res.json(
        [...rooms.values()].filter(room => room.publicRoom)
    );
});

// Sala aleatória
app.get("/random", (_req, res) => {

    const list = [...rooms.values()].filter(room => room.publicRoom);

    if (list.length === 0) {
        return res.status(404).json({ error: "Nenhuma sala pública." });
    }

    const room = list[Math.floor(Math.random() * list.length)];

    if (room.players < room.maxPlayers) {
        room.players++;
    }

    res.json(room);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
