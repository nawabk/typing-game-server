import express from "express";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
import http from "http";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { LOREM_TEXT } from "./Constants";
import { GameInfo, Player, ResponseData } from "./types";

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));

const server = http.createServer(app);

const io = new Server(server);

const PLAYER_QUEUE: Player[] = [];

const CHANNEL_INFO: Map<string, GameInfo> = new Map();

let timer: ReturnType<typeof setTimeout> | null = null;

function createChannel(): string {
  return uuidv4();
}

async function fetchParagraph(): Promise<string> {
  try {
    const res = await fetch(
      "https://hipsum.co/api/?type=hipster-centric&sentences=50"
    );
    const data = (await res.json()) as ResponseData;
    return data[0];
  } catch (e) {
    console.log(e);
    return LOREM_TEXT;
  }
}

async function startPlayHandler(socket: Socket, io: Server, userName: string) {
  console.log("start play request");
  if (PLAYER_QUEUE.length === 0) {
    const player = {
      userName,
      socket,
    };
    PLAYER_QUEUE.push(player);
    timer = setTimeout(async () => {
      console.log("still no user");
      PLAYER_QUEUE.pop();
      const channel = createChannel();
      CHANNEL_INFO.set(channel, {
        player1: socket,
        player2: "computer",
      });
      socket.join(channel);
      const paragraph = await fetchParagraph();
      socket.emit("competitor", "computer");
      io.to(channel).emit("challenge_details", {
        channel,
        paragraph,
      });
    }, 5 * 1000);
  } else {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    const { socket: competetorSocket, userName: competetorUserName } =
      PLAYER_QUEUE.shift() as Player;
    const channel = createChannel();
    CHANNEL_INFO.set(channel, {
      player1: competetorSocket,
      player2: socket,
    });
    socket.emit("competitor", competetorUserName);
    competetorSocket.emit("competitor", userName);
    for (const userSocket of [competetorSocket, socket]) {
      userSocket.join(channel);
    }
    const parapgraph = await fetchParagraph();
    io.to(channel).emit("challenge_details", {
      channel,
      parapgraph,
    });
    console.log("gameplay");
  }
}

io.on("connection", (socket: Socket) => {
  console.log("A user has connected");
  socket.on("start-play", (userName) => {
    startPlayHandler(socket, io, userName);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening to ${PORT}`);
});
