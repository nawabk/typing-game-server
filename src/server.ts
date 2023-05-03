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
  LeaveChannelMessage,
  Player,
  PlayerResultInfo,
  RematchMessage,
  RematchRequestMessage,
  ResponseData,
  Score,
} from "./types";

const app = express();

app.use(cors({ origin: "http://192.168.0.132:3000" }));

const server = http.createServer(app);

const io: Server = new Server(server, {
  cors: {
    origin: "http://192.168.0.132:3000",
  },
});

const PLAYER_QUEUE: Player[] = [];

const CHANNEL_INFO: Map<string, GameInfo> = new Map();

let timer: ReturnType<typeof setTimeout> | null = null;
let waitingResultTimer: ReturnType<typeof setTimeout> | null = null;

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

function sendChallengeResult(
  io: Server,
  channel: string,
  challengeResult: Partial<ChallengeResult>
) {
  io.to(channel).emit("challenge_result", challengeResult);
}

function onChallengeScoreHandler(io: Server, message: ChallengeScoreMessage) {
  try {
    const { channel } = message;
    const channelInfo = CHANNEL_INFO.get(channel);
    let challengeResult: Partial<ChallengeResult> = {};
    if (channelInfo) {
      let sendResult: boolean = true;
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
        let isPlayerOne = false;
        if (socketId === playerOneResult.socketId) {
          isPlayerOne = true;
          playerResult = playerOneResult;
          otherPlayerResult = playerTwoResult;
        } else if (socketId === playerTwoResult.socketId) {
          playerResult = playerTwoResult;
          otherPlayerResult = playerOneResult;
        } else {
          throw new Error(
            "Socket does not exist in the channel---Challenge Score Handler"
          );
        }
        playerResult.score = {
          wpm,
          netWpm,
          accuracyInPerc,
        };
        challengeResult = {
          ...challengeResult,
          ...(isPlayerOne && { playerOneResult: playerResult }),
          ...(!isPlayerOne && { playerTwoResult: playerResult }),
        };
        if (!otherPlayerResult.isScoreRecieved) {
          playerResult.isScoreRecieved = true;
          sendResult = false;
          waitingResultTimer = setTimeout(() => {
            // Did not recieved other player result
            challengeResult.winner = socketId;
            sendChallengeResult(io, channel, challengeResult);
          }, 5000);
        } else {
          if (waitingResultTimer) {
            clearTimeout(waitingResultTimer);
          }
          challengeResult = {
            ...challengeResult,
            ...(isPlayerOne && { playerTwoResult: otherPlayerResult }),
            ...(!isPlayerOne && { playerOneResult: otherPlayerResult }),
          };
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
      if (sendResult) {
        sendChallengeResult(io, channel, challengeResult);
      }
    }
  } catch (e) {
    console.log(e);
  }
}

// check to delete Channel Info

function checkIfChannelCanBeDeleted(channel: string) {
  const channelInfo = CHANNEL_INFO.get(channel);
  if (channelInfo) {
    const { playerOneResult, playerTwoResult } = channelInfo;
    if (playerTwoResult.isRobot) {
      CHANNEL_INFO.delete(channel);
      console.log("Channel Deleted");
    } else if (playerOneResult.isLeftChannel && playerTwoResult.isLeftChannel) {
      CHANNEL_INFO.delete(channel);
      console.log("Channel Deleted");
    }
  }
}

function checkIfPlayerOne(channel: string, socketId: string): boolean {
  const channelInfo = CHANNEL_INFO.get(channel);
  if (channelInfo) {
    const { playerOneResult, playerTwoResult } = channelInfo;
    const { socketId: playerOneSocketId } = playerOneResult;
    const { socketId: playerTwoSocketId } = playerTwoResult;
    if (socketId === playerOneSocketId) {
      return true;
    } else if (socketId === playerTwoSocketId) {
      return false;
    } else {
      throw new Error("Socket Id not matched");
    }
  } else {
    throw new Error(
      "No Channel Information --- Checking Player No. based on socketId"
    );
  }
}

// leave channel handler
function onLeaveChannel(socket: Socket, message: LeaveChannelMessage) {
  try {
    const { channel } = message;
    const channelInfo = CHANNEL_INFO.get(channel);
    socket.leave(channel);
    if (channelInfo) {
      const { playerOneResult, playerTwoResult } = channelInfo;
      const isPlayerOne = checkIfPlayerOne(channel, socket.id);
      if (isPlayerOne) {
        playerOneResult.isLeftChannel = true;
      } else {
        playerTwoResult.isLeftChannel = true;
      }
      checkIfChannelCanBeDeleted(channel);
    }
  } catch (e) {
    console.log(e);
  }
}

// Rematch request handler
async function onRematchRequest(
  socket: Socket,
  io: Server,
  message: RematchRequestMessage
) {
  try {
    const { channel } = message;
    const channelInfo = CHANNEL_INFO.get(channel);
    if (channelInfo) {
      let askingPlayer, competitorPlayer;
      const { playerOneResult, playerTwoResult } = channelInfo;
      const isPlayerOne = checkIfPlayerOne(channel, socket.id);
      if (isPlayerOne) {
        askingPlayer = playerOneResult;
        competitorPlayer = playerTwoResult;
      } else {
        askingPlayer = playerTwoResult;
        competitorPlayer = playerOneResult;
      }
      if (competitorPlayer.isAskingForRematch) {
        competitorPlayer.isAskingForRematch = false;
        const paragraph = await fetchParagraph();
        const message: RematchMessage = {
          paragraph,
        };
        io.to(channel).emit("rematch", message);
      } else {
        askingPlayer.isAskingForRematch = true;
        socket.to(channel).emit("rematch_request");
      }
    }
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
  socket.on("leave_channel", (message) => {
    onLeaveChannel(socket, message);
  });
  socket.on("rematch_request", (message) => {
    onRematchRequest(socket, io, message);
  });
  socket.on("disconnect", () => {
    console.log("disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening to ${PORT}`);
});
