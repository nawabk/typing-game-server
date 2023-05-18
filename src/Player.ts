import { Score } from "./types";

class Player {
  private socketId: string;
  private userName: string;
  private isRobot?: boolean;
  private channel: string;
  private isScoreRecieved?: boolean;
  private score?: Score;
  private isLeftChannel?: boolean;
  private isAskingForRematch?: boolean;

  constructor({
    socketId,
    userName,
    channel,
    isRobot = false,
  }: {
    socketId: string;
    userName: string;
    channel: string;
    isRobot?: boolean;
  }) {
    this.isRobot = isRobot;
    this.userName = userName;
    this.socketId = socketId;
    this.channel = channel;
  }

  get getSocketId(): string {
    return this.socketId;
  }

  get getUserName(): string {
    return this.userName;
  }

  set setIsScoreRecieved(scoreRecieved: boolean) {
    this.isScoreRecieved = scoreRecieved;
  }

  get getIsScoreRecieved(): boolean {
    return this.isScoreRecieved ?? false;
  }

  set setScore(score: Score) {
    this.score = score;
  }

  get getScore(): Score | null {
    return this.score ?? null;
  }

  set setIsRobot(isRobot: boolean) {
    this.isRobot = isRobot;
  }

  get getIsRobot(): boolean {
    return this.isRobot ?? false;
  }

  set setIsLeftChannel(isLeftChannel: boolean) {
    this.isLeftChannel = isLeftChannel;
  }

  get getIsLeftChannel(): boolean {
    return this.isLeftChannel ?? false;
  }

  set setIsAskingForRematch(isAskingForRematch: boolean) {
    this.isAskingForRematch = isAskingForRematch;
  }

  get getIsAskingForRematch(): boolean {
    return this.isAskingForRematch ?? false;
  }

  get getChannel() {
    return this.channel ?? "";
  }
}

export default Player;
