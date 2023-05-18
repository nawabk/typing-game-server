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
  RematchErrorMessage,
  RematchMessage,
  RematchRequestMessage,
  ResponseData,
  Score,
} from "./types";
import Player from "./Player";

const app = express();

app.use(cors({ origin: "https://www.typing-fight.com" }));
// app.use(cors({ origin: "http://192.168.0.132:3000" }));

// Check life
app.get("/", (_, res) => {
  res.send("Hello Typist");
});

const server = http.createServer(app);

const io: Server = new Server(server, {
  cors: {
    // origin: "http://192.168.0.132:3000",
    origin: "https://www.typing-fight.com",
  },
});

const PLAYER_QUEUE: Player[] = [];

const PlayerInfoBySocketId = new Map<string, Player>();

const ChannelInfoByChannel: Map<string, GameInfo> = new Map();

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
  if (PLAYER_QUEUE.length === 0) {
    const channel = createChannel();
    const playerOne = new Player({ socketId: socket.id, userName, channel });
    socket.join(channel);
    PlayerInfoBySocketId.set(socket.id, playerOne);
    PLAYER_QUEUE.push(playerOne);
    timer = setTimeout(async () => {
      PLAYER_QUEUE.pop();
      const playerTwo = new Player({
        socketId: "",
        userName: ROBOT,
        isRobot: true,
        channel,
      });
      ChannelInfoByChannel.set(channel, {
        playerOne,
        playerTwo,
      });
      const paragraph = await fetchParagraph();
      const message: ChallengeDetailsMessage = {
        channel,
        paragraph,
        playerOne,
        playerTwo,
      };
      console.log(`${playerOne.getUserName} vs ${playerTwo.getUserName}`);
      io.to(channel).emit("challenge_details", message);
    }, 5 * 1000);
  } else {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    const playerOne = PLAYER_QUEUE.shift() as Player;
    const channel = playerOne.getChannel;
    const playerTwo = new Player({ socketId: socket.id, userName, channel });
    socket.join(channel);
    PlayerInfoBySocketId.set(socket.id, playerTwo);
    ChannelInfoByChannel.set(channel, {
      playerOne,
      playerTwo,
    });
    const paragraph = await fetchParagraph();
    const message: ChallengeDetailsMessage = {
      channel,
      paragraph,
      playerOne,
      playerTwo,
    };
    console.log(`${playerOne.getUserName} vs ${playerTwo.getUserName}`);
    io.to(channel).emit("challenge_details", message);
  }
}

// onChallengeScore handler

function getRobotScore(): Score {
  return ROBOT_SCORE[0];
}

function checkIfPlayerOne(channel: string, socketId: string): boolean {
  const channelInfo = ChannelInfoByChannel.get(channel);
  if (channelInfo) {
    const { playerOne, playerTwo } = channelInfo;
    const playerOneSocketId = playerOne.getSocketId;
    const playerTwoSocketId = playerTwo.getSocketId;
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
    const channelInfo = ChannelInfoByChannel.get(channel);
    let challengeResult: Partial<ChallengeResult> = {};
    if (channelInfo) {
      let sendResult: boolean = true;
      const { playerOne, playerTwo } = channelInfo;
      const { socketId, wpm, netWpm, accuracyInPerc } = message;

      const isPlayerTwoRobot = playerTwo.getIsRobot;
      if (isPlayerTwoRobot) {
        const playerOneSocketId = playerOne.getSocketId;
        const robotScore = getRobotScore();
        const { netWpm: robotNetWpm, accuracyInPerc: robotAccuracyInPerc } =
          robotScore;
        playerOne.setScore = {
          wpm,
          netWpm,
          accuracyInPerc,
        };
        playerTwo.setScore = robotScore;
        challengeResult = {
          playerOneResult: {
            ...(playerOne && playerOne),
          },
          playerTwoResult: {
            ...(playerTwo && playerTwo),
          },
        };
        if (netWpm === robotNetWpm) {
          if (robotAccuracyInPerc === accuracyInPerc) {
            challengeResult.draw = true;
          } else if (robotAccuracyInPerc > accuracyInPerc) {
            challengeResult.winner = ROBOT;
          } else {
            challengeResult.winner = playerOneSocketId;
          }
        } else if (robotNetWpm > netWpm) {
          challengeResult.winner = ROBOT;
        } else {
          challengeResult.winner = playerOneSocketId;
        }
      } else {
        let playerResult: Player;
        let otherPlayerResult: Player;
        let isPlayerOne = checkIfPlayerOne(channel, socketId);
        if (isPlayerOne) {
          playerResult = playerOne;
          otherPlayerResult = playerTwo;
        } else {
          playerResult = playerTwo;
          otherPlayerResult = playerOne;
        }

        playerResult.setScore = {
          wpm,
          netWpm,
          accuracyInPerc,
        };

        challengeResult = {
          ...challengeResult,
          ...(isPlayerOne && { playerOneResult: playerResult }),
          ...(!isPlayerOne && { playerTwoResult: playerResult }),
        };
        const isOtherPlayerRecieved = otherPlayerResult.getIsScoreRecieved;
        if (!isOtherPlayerRecieved) {
          playerResult.setIsScoreRecieved = true;
          sendResult = false;
          channelInfo.waitingTimer = setTimeout(() => {
            // Did not recieved other player result
            challengeResult.winner = socketId;
            otherPlayerResult.setScore = {
              wpm: 0,
              netWpm: 0,
              accuracyInPerc: 0,
            };
            challengeResult = {
              ...challengeResult,
              ...(isPlayerOne && { playerTwoResult: otherPlayerResult }),
              ...(!isPlayerOne && { playerOneResult: otherPlayerResult }),
            };
            sendChallengeResult(io, channel, challengeResult);
          }, 5000);
        } else {
          if (channelInfo.waitingTimer) {
            clearTimeout(channelInfo.waitingTimer);
            channelInfo.waitingTimer = null;
          }
          challengeResult = {
            ...challengeResult,
            ...(isPlayerOne && { playerTwoResult: otherPlayerResult }),
            ...(!isPlayerOne && { playerOneResult: otherPlayerResult }),
          };
          const playerResultSocketId = playerResult.getSocketId;
          const otherPlayerResultSocketId = otherPlayerResult.getSocketId;
          const otherPlayerScore = otherPlayerResult.getScore;

          if (otherPlayerScore && otherPlayerScore?.netWpm === netWpm) {
            if (otherPlayerScore?.accuracyInPerc === accuracyInPerc) {
              challengeResult.draw = true;
            } else if (otherPlayerScore?.accuracyInPerc > accuracyInPerc) {
              challengeResult.winner = otherPlayerResultSocketId;
            } else {
              challengeResult.winner = playerResultSocketId;
            }
          } else if (otherPlayerScore && otherPlayerScore?.netWpm > netWpm) {
            challengeResult.winner = otherPlayerResultSocketId;
          } else {
            challengeResult.winner = playerResultSocketId;
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
  const channelInfo = ChannelInfoByChannel.get(channel);
  if (channelInfo) {
    const { playerOne, playerTwo } = channelInfo;
    const isPlayerTwoRobot = playerTwo.getIsRobot;
    const isPlayerOneLeftChannel = playerOne.getIsLeftChannel;
    const isPlayerTwoLeftChannel = playerTwo.getIsLeftChannel;
    if (isPlayerTwoRobot) {
      ChannelInfoByChannel.delete(channel);
    } else if (isPlayerOneLeftChannel && isPlayerTwoLeftChannel) {
      ChannelInfoByChannel.delete(channel);
    }
  }
}

// leave channel handler
function onLeaveChannel(socket: Socket) {
  try {
    const socketId = socket.id;
    const player = PlayerInfoBySocketId.get(socketId);
    if (player) {
      // remove player info
      PlayerInfoBySocketId.delete(socketId);
      player.setIsLeftChannel = true;
      const channel = player.getChannel;
      checkIfChannelCanBeDeleted(channel);
    }
  } catch (e) {
    console.log(e);
  }
}

function sendErrorMessage<T extends string | undefined>(
  socket: Socket,
  competitorUserName: T
) {
  const message: RematchErrorMessage = {
    errMsg: `${
      competitorUserName ? competitorUserName : "Competitor"
    } is not available for rematch`,
  };
  socket.emit("rematch_error", message);
}

// Rematch request handler
async function onRematchRequest(
  socket: Socket,
  io: Server,
  message: RematchRequestMessage
) {
  try {
    const { channel } = message;
    const channelInfo = ChannelInfoByChannel.get(channel);
    if (channelInfo) {
      let askingPlayer: Player, competitorPlayer: Player;
      const { playerOne, playerTwo } = channelInfo;
      const isPlayerOne = checkIfPlayerOne(channel, socket.id);
      if (isPlayerOne) {
        askingPlayer = playerOne;
        competitorPlayer = playerTwo;
      } else {
        askingPlayer = playerTwo;
        competitorPlayer = playerOne;
      }
      const isCompetitorLeftChannel = competitorPlayer.getIsLeftChannel;
      const competitorUserName = competitorPlayer.getUserName;
      const isCompetitorAskingForRematch =
        competitorPlayer.getIsAskingForRematch;
      if (isCompetitorLeftChannel) {
        // send error message
        sendErrorMessage(socket, competitorUserName);
      } else {
        if (isCompetitorAskingForRematch) {
          competitorPlayer.setIsAskingForRematch = false;
          const paragraph = await fetchParagraph();
          const message: RematchMessage = {
            paragraph,
          };
          io.to(channel).emit("rematch", message);
        } else {
          askingPlayer.setIsAskingForRematch = true;
          socket.to(channel).emit("rematch_request");
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
}

function onDisconnect(socket: Socket) {
  const socketId = socket.id;
  const player = PlayerInfoBySocketId.get(socketId);
  if (player) {
    // remove player info
    PlayerInfoBySocketId.delete(socketId);
    player.setIsLeftChannel = true;
    const channel = player.getChannel;
    checkIfChannelCanBeDeleted(channel);
  }
}

io.on("connection", (socket: Socket) => {
  socket.on("start_play", (userName) => {
    startPlayHandler(socket, io, userName);
  });
  socket.on("challenge_score", (message) => {
    onChallengeScoreHandler(io, message);
  });
  socket.on("leave_channel", () => {
    onLeaveChannel(socket);
  });
  socket.on("rematch_request", (message) => {
    onRematchRequest(socket, io, message);
  });
  socket.on("disconnect", () => {
    onDisconnect(socket);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening to ${PORT}`);
});
