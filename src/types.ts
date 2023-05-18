import Player from "./Player";

export interface Score {
  wpm: number;
  netWpm: number;
  accuracyInPerc: number;
}

export interface PlayerInfo {
  socketId: string;
  userName: string;
  isScoreRecieved?: boolean;
  score?: Score;
  isRobot?: boolean;
  isLeftChannel?: boolean;
  isAskingForRematch?: boolean;
}

export interface GameInfo {
  playerOne: Player;
  playerTwo: Player;
  waitingTimer?: ReturnType<typeof setTimeout> | null;
}

export interface ChallengeResult {
  playerOneResult: Partial<Player>;
  playerTwoResult: Partial<Player>;
  winner: string;
  draw?: boolean;
}

export type ResponseData = string[];

export interface ChallengeDetailsMessage {
  channel: string;
  paragraph: string;
  playerOne: Player;
  playerTwo: Player;
}

export interface ChallengeScoreMessage {
  socketId: string;
  channel: string;
  wpm: number;
  netWpm: number;
  accuracyInPerc: number;
}

export interface LeaveChannelMessage {
  channel: string;
}

export interface RematchRequestMessage {
  channel: string;
}

export interface RematchMessage {
  paragraph: string;
}

export interface RematchErrorMessage {
  errMsg: string;
}
