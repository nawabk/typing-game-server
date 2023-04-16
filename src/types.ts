import { Socket } from "socket.io";

export interface GameInfo {
  player1: Socket;
  player2: Socket | "computer";
}

export type ResponseData = string[];

export interface Player {
  socket: Socket;
  userName: string;
}
