import { Socket } from "socket.io";

export interface GameInfo {
  player1: string;
  player2: string | "Computer";
}

export type ResponseData = string[];

export interface Player {
  socket: Socket;
  userName: string;
}

type PlayerInfo = {
  socketId?: string;
  userName: string;
  isRobot?: boolean;
};

export interface ChallengeDetailsMessage {
  channel: string;
  paragraph: string;
  playerOneInfo: PlayerInfo;
  playerTwoInfo: PlayerInfo;
}
