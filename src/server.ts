import express from "express";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
import http from "http";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { LOREM_TEXT, ROBOT, ROBOT_SCORE } from "./Constants";
import {
  ChallengeDetailsMessage,
  ChallengeResult,
  ChallengeScoreMessage,
  GameInfo,
  Player,
  PlayerResultInfo,
  ResponseData,
  Score,
} from "./types";

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));

const server = http.createServer(app);

const io: Server = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

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
        playerOneResult: {
          socketId: socket.id,
          userName,
        },
        playerTwoResult: {
          isRobot: true,
          userName: ROBOT,
        },
      });
      socket.join(channel);
      const paragraph = await fetchParagraph();
      //   socket.emit("competitor", "computer");
      const message: ChallengeDetailsMessage = {
        channel,
        paragraph,
        playerOneInfo: {
          userName,
        },
        playerTwoInfo: {
          userName: ROBOT,
          isRobot: true,
        },
      };
      io.to(channel).emit("challenge_details", message);
    }, 5 * 1000);
  } else {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    const { socket: competitorSocket, userName: competitorUserName } =
      PLAYER_QUEUE.shift() as Player;
    const channel = createChannel();
    CHANNEL_INFO.set(channel, {
      playerOneResult: {
        socketId: competitorSocket.id,
        userName: competitorUserName,
      },
      playerTwoResult: {
        socketId: socket.id,
        userName,
      },
    });
    // socket.emit("competitor", competitorUserName);
    // competitorSocket.emit("competitor", userName);
    for (const userSocket of [competitorSocket, socket]) {
      userSocket.join(channel);
    }
    const paragraph = await fetchParagraph();
    const message: ChallengeDetailsMessage = {
      channel,
      paragraph,
      playerOneInfo: {
        userName: competitorUserName,
        socketId: competitorSocket.id,
      },
      playerTwoInfo: {
        userName,
        socketId: socket.id,
      },
    };
    io.to(channel).emit("challenge_details", message);
    console.log("gameplay");
  }
}

// onChallengeScore handler

function getRobotScore(): Score {
  return ROBOT_SCORE[0];
}

function onChallengeScoreHandler(io: Server, message: ChallengeScoreMessage) {
  try {
    const { channel } = message;
    const channelInfo = CHANNEL_INFO.get(channel);
    let challengeResult: Partial<ChallengeResult> = {};
    if (channelInfo) {
      const { playerOneResult, playerTwoResult } = channelInfo;
      const { socketId, wpm, netWpm, accuracyInPerc } = message;

      if (playerTwoResult.isRobot) {
        const robotScore = getRobotScore();
        const { netWpm: robotNetWpm, accuracyInPerc: robotAccuracyInPerc } =
          robotScore;
        challengeResult = {
          playerOneResult: {
            ...(playerOneResult && playerOneResult),
            score: {
              wpm,
              netWpm,
              accuracyInPerc,
            },
          },
          playerTwoResult: {
            ...(playerTwoResult && playerTwoResult),
            score: robotScore,
          },
        };
        if (netWpm === robotNetWpm) {
          if (robotAccuracyInPerc === accuracyInPerc) {
            challengeResult.draw = true;
          } else if (robotAccuracyInPerc > accuracyInPerc) {
            challengeResult.winner = ROBOT;
          } else {
            challengeResult.winner = playerOneResult?.socketId;
          }
        } else if (robotNetWpm > netWpm) {
          challengeResult.winner = ROBOT;
        } else {
          challengeResult.winner = playerOneResult?.socketId;
        }
      } else {
        let playerResult;
        let otherPlayerResult;
        if (socketId === playerOneResult.socketId) {
          playerResult = playerOneResult;
          challengeResult = {
            ...challengeResult,
            playerOneResult,
          };
          otherPlayerResult = playerTwoResult;
        } else if (socketId === playerTwoResult.socketId) {
          playerResult = playerTwoResult;
          challengeResult = {
            ...challengeResult,
            playerTwoResult,
          };
          otherPlayerResult = playerOneResult;
        } else {
          throw new Error("Socket does not exist in the channel");
        }
        if (otherPlayerResult.isScoreRecieved) {
          playerResult.isScoreRecieved = true;
          playerResult.score = {
            wpm,
            netWpm,
            accuracyInPerc,
          };
        } else {
          const { score } = otherPlayerResult;
          if (score && score?.netWpm === netWpm) {
            if (score?.accuracyInPerc === accuracyInPerc) {
              challengeResult.draw = true;
            } else if (score?.accuracyInPerc > accuracyInPerc) {
              challengeResult.winner = otherPlayerResult.socketId;
            } else {
              challengeResult.winner = playerResult.socketId;
            }
          } else if (score && score?.netWpm > netWpm) {
            challengeResult.winner = otherPlayerResult.socketId;
          } else {
            challengeResult.winner = playerResult.socketId;
          }
        }
      }
    }
    console.log({ challengeResult, channel });
    io.to(channel).emit("challenge_result", challengeResult);
  } catch (e) {
    console.log(e);
  }
}

io.on("connection", (socket: Socket) => {
  console.log("A user has connected", socket.id);
  socket.on("start_play", (userName) => {
    startPlayHandler(socket, io, userName);
  });
  socket.on("challenge_score", (message) => {
    onChallengeScoreHandler(io, message);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening to ${PORT}`);
});
