import { Socket } from "socket.io";

export interface Score {
  wpm: number;
  netWpm: number;
  accuracyInPerc: number;
}

export interface PlayerResultInfo {
  socketId: string;
  userName: string;
  isScoreRecieved?: boolean;
  score: Score;
  isRobot: boolean;
}

export interface GameInfo {
  playerOneResult: Partial<PlayerResultInfo>;
  playerTwoResult: Partial<PlayerResultInfo>;
}

export interface ChallengeResult {
  playerOneResult: Partial<PlayerResultInfo>;
  playerTwoResult: Partial<PlayerResultInfo>;
  winner: string;
  draw?: boolean;
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

export interface ChallengeScoreMessage {
  socketId: string;
  channel: string;
  wpm: number;
  netWpm: number;
  accuracyInPerc: number;
}
