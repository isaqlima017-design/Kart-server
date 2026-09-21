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

app.post("/create", (req, res) => {

	const { roomName, creator, publicRoom, color } = req.body;

	if (!roomName || roomName.trim() === "") {
		return res.status(400).json({ error: "Nome inválido." });
	}

	const roomId = generateRoomId();

	const room = {
		roomId,
		roomName,
		owner: creator,
		publicRoom: Boolean(publicRoom),
		maxPlayers: 8,
		raceStarted: false,
		players: [
			{
				name: creator,
				color: color ?? 0,
				slot: 1
			}
		]
	};

	rooms.set(roomId, room);

	res.json({
		roomId: room.roomId,
		roomName: room.roomName,
		owner: room.owner,
		publicRoom: room.publicRoom,
		players: room.players.length,
		maxPlayers: room.maxPlayers
	});
});

app.post("/join", (req, res) => {

	const { roomId, playerName, color } = req.body;

	const room = rooms.get(roomId);

	if (!room)
		return res.status(404).json({ error: "Sala não encontrada." });

	if (room.players.length >= room.maxPlayers)
		return res.status(403).json({ error: "Sala cheia." });

	if (room.raceStarted)
		return res.status(403).json({ error: "Corrida já iniciou." });

	const slot = room.players.length + 1;

	room.players.push({
		name: playerName,
		color: color ?? 0,
		slot
	});

	res.json({
		roomId: room.roomId,
		roomName: room.roomName,
		owner: room.owner,
		publicRoom: room.publicRoom,
		players: room.players.length,
		maxPlayers: room.maxPlayers,
		slot
	});
});

app.get("/publicrooms", (_req, res) => {

	const list = [...rooms.values()]
		.filter(r => r.publicRoom)
		.map(r => ({
			roomId: r.roomId,
			roomName: r.roomName,
			creator: r.owner,
			publicRoom: r.publicRoom,
			players: r.players.length,
			maxPlayers: r.maxPlayers
		}));

	res.json(list);
});

app.get("/random", (_req, res) => {

	const list = [...rooms.values()].filter(
		r => r.publicRoom && r.players.length < r.maxPlayers && !r.raceStarted
	);

	if (list.length === 0)
		return res.status(404).json({ error: "Nenhuma sala pública." });

	const room = list[Math.floor(Math.random() * list.length)];

	res.json({
		roomId: room.roomId,
		roomName: room.roomName,
		creator: room.owner,
		publicRoom: room.publicRoom,
		players: room.players.length,
		maxPlayers: room.maxPlayers
	});
});

app.post("/leave", (req, res) => {

	const { roomId, playerName } = req.body;

	const room = rooms.get(roomId);

	if (!room)
		return res.status(404).json({ error: "Sala não encontrada." });

	room.players = room.players.filter(p => p.name !== playerName);

	if (room.players.length === 0) {
		rooms.delete(roomId);
		return res.json({ deleted: true });
	}

	if (room.owner === playerName) {
		room.owner = room.players[0].name;
	}

	room.players.forEach((p, i) => p.slot = i + 1);

	res.json({
		deleted: false,
		players: room.players.length
	});
});

app.post("/start", (req, res) => {

	const { roomId, playerName } = req.body;

	const room = rooms.get(roomId);

	if (!room)
		return res.status(404).json({ error: "Sala não encontrada." });

	if (room.owner !== playerName)
		return res.status(403).json({ error: "Apenas o dono inicia." });

	if (room.players.length < 3)
		return res.status(403).json({ error: "São necessários 3 jogadores." });

	room.raceStarted = true;

	res.json({
		started: true
	});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log("Servidor iniciado na porta " + PORT);
});
