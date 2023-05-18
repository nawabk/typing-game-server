"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var socket_io_1 = require("socket.io");
var http_1 = __importDefault(require("http"));
var cors_1 = __importDefault(require("cors"));
var uuid_1 = require("uuid");
var Constants_1 = require("./Constants");
var Player_1 = __importDefault(require("./Player"));
var app = express_1.default();
app.use(cors_1.default({ origin: "http://192.168.0.132:3000" }));
// Check life
app.get("/", function (_, res) {
    res.send("Hello Typist");
});
var server = http_1.default.createServer(app);
var io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://192.168.0.132:3000",
    },
});
var PLAYER_QUEUE = [];
var PlayerInfoBySocketId = new Map();
var ChannelInfoByChannel = new Map();
var timer = null;
function createChannel() {
    return uuid_1.v4();
}
function fetchParagraph() {
    return __awaiter(this, void 0, void 0, function () {
        var res, data, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("https://hipsum.co/api/?type=hipster-centric&sentences=50")];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = (_a.sent());
                    return [2 /*return*/, data[0]];
                case 3:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [2 /*return*/, Constants_1.LOREM_TEXT];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function startPlayHandler(socket, io, userName) {
    return __awaiter(this, void 0, void 0, function () {
        var channel_1, playerOne_1, playerOne, channel, playerTwo, paragraph, message;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(PLAYER_QUEUE.length === 0)) return [3 /*break*/, 1];
                    channel_1 = createChannel();
                    playerOne_1 = new Player_1.default({ socketId: socket.id, userName: userName, channel: channel_1 });
                    socket.join(channel_1);
                    PlayerInfoBySocketId.set(socket.id, playerOne_1);
                    PLAYER_QUEUE.push(playerOne_1);
                    timer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        var playerTwo, paragraph, message;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("still no user");
                                    PLAYER_QUEUE.pop();
                                    playerTwo = new Player_1.default({
                                        socketId: "",
                                        userName: Constants_1.ROBOT,
                                        isRobot: true,
                                        channel: channel_1,
                                    });
                                    ChannelInfoByChannel.set(channel_1, {
                                        playerOne: playerOne_1,
                                        playerTwo: playerTwo,
                                    });
                                    return [4 /*yield*/, fetchParagraph()];
                                case 1:
                                    paragraph = _a.sent();
                                    message = {
                                        channel: channel_1,
                                        paragraph: paragraph,
                                        playerOne: playerOne_1,
                                        playerTwo: playerTwo,
                                    };
                                    io.to(channel_1).emit("challenge_details", message);
                                    return [2 /*return*/];
                            }
                        });
                    }); }, 5 * 1000);
                    return [3 /*break*/, 3];
                case 1:
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                    }
                    playerOne = PLAYER_QUEUE.shift();
                    channel = playerOne.getChannel;
                    playerTwo = new Player_1.default({ socketId: socket.id, userName: userName, channel: channel });
                    socket.join(channel);
                    PlayerInfoBySocketId.set(socket.id, playerTwo);
                    ChannelInfoByChannel.set(channel, {
                        playerOne: playerOne,
                        playerTwo: playerTwo,
                    });
                    return [4 /*yield*/, fetchParagraph()];
                case 2:
                    paragraph = _a.sent();
                    message = {
                        channel: channel,
                        paragraph: paragraph,
                        playerOne: playerOne,
                        playerTwo: playerTwo,
                    };
                    io.to(channel).emit("challenge_details", message);
                    console.log("gameplay");
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// onChallengeScore handler
function getRobotScore() {
    return Constants_1.ROBOT_SCORE[0];
}
function checkIfPlayerOne(channel, socketId) {
    var channelInfo = ChannelInfoByChannel.get(channel);
    if (channelInfo) {
        var playerOne = channelInfo.playerOne, playerTwo = channelInfo.playerTwo;
        var playerOneSocketId = playerOne.getSocketId;
        var playerTwoSocketId = playerTwo.getSocketId;
        if (socketId === playerOneSocketId) {
            return true;
        }
        else if (socketId === playerTwoSocketId) {
            return false;
        }
        else {
            throw new Error("Socket Id not matched");
        }
    }
    else {
        throw new Error("No Channel Information --- Checking Player No. based on socketId");
    }
}
function sendChallengeResult(io, channel, challengeResult) {
    io.to(channel).emit("challenge_result", challengeResult);
}
function onChallengeScoreHandler(io, message) {
    try {
        var channel_2 = message.channel;
        var channelInfo = ChannelInfoByChannel.get(channel_2);
        var challengeResult_1 = {};
        if (channelInfo) {
            var sendResult = true;
            var playerOne = channelInfo.playerOne, playerTwo = channelInfo.playerTwo;
            var socketId_1 = message.socketId, wpm = message.wpm, netWpm = message.netWpm, accuracyInPerc = message.accuracyInPerc;
            var isPlayerTwoRobot = playerTwo.getIsRobot;
            if (isPlayerTwoRobot) {
                var playerOneSocketId = playerOne.getSocketId;
                var robotScore = getRobotScore();
                var robotNetWpm = robotScore.netWpm, robotAccuracyInPerc = robotScore.accuracyInPerc;
                playerOne.setScore = {
                    wpm: wpm,
                    netWpm: netWpm,
                    accuracyInPerc: accuracyInPerc,
                };
                playerTwo.setScore = robotScore;
                challengeResult_1 = {
                    playerOneResult: __assign({}, (playerOne && playerOne)),
                    playerTwoResult: __assign({}, (playerTwo && playerTwo)),
                };
                if (netWpm === robotNetWpm) {
                    if (robotAccuracyInPerc === accuracyInPerc) {
                        challengeResult_1.draw = true;
                    }
                    else if (robotAccuracyInPerc > accuracyInPerc) {
                        challengeResult_1.winner = Constants_1.ROBOT;
                    }
                    else {
                        challengeResult_1.winner = playerOneSocketId;
                    }
                }
                else if (robotNetWpm > netWpm) {
                    challengeResult_1.winner = Constants_1.ROBOT;
                }
                else {
                    challengeResult_1.winner = playerOneSocketId;
                }
            }
            else {
                var playerResult = void 0;
                var otherPlayerResult_1;
                var isPlayerOne_1 = checkIfPlayerOne(channel_2, socketId_1);
                if (isPlayerOne_1) {
                    playerResult = playerOne;
                    otherPlayerResult_1 = playerTwo;
                }
                else {
                    playerResult = playerTwo;
                    otherPlayerResult_1 = playerOne;
                }
                playerResult.setScore = {
                    wpm: wpm,
                    netWpm: netWpm,
                    accuracyInPerc: accuracyInPerc,
                };
                challengeResult_1 = __assign(__assign(__assign({}, challengeResult_1), (isPlayerOne_1 && { playerOneResult: playerResult })), (!isPlayerOne_1 && { playerTwoResult: playerResult }));
                var isOtherPlayerRecieved = otherPlayerResult_1.getIsScoreRecieved;
                if (!isOtherPlayerRecieved) {
                    playerResult.setIsScoreRecieved = true;
                    sendResult = false;
                    channelInfo.waitingTimer = setTimeout(function () {
                        // Did not recieved other player result
                        challengeResult_1.winner = socketId_1;
                        otherPlayerResult_1.setScore = {
                            wpm: 0,
                            netWpm: 0,
                            accuracyInPerc: 0,
                        };
                        challengeResult_1 = __assign(__assign(__assign({}, challengeResult_1), (isPlayerOne_1 && { playerTwoResult: otherPlayerResult_1 })), (!isPlayerOne_1 && { playerOneResult: otherPlayerResult_1 }));
                        sendChallengeResult(io, channel_2, challengeResult_1);
                    }, 5000);
                }
                else {
                    if (channelInfo.waitingTimer) {
                        clearTimeout(channelInfo.waitingTimer);
                        channelInfo.waitingTimer = null;
                    }
                    challengeResult_1 = __assign(__assign(__assign({}, challengeResult_1), (isPlayerOne_1 && { playerTwoResult: otherPlayerResult_1 })), (!isPlayerOne_1 && { playerOneResult: otherPlayerResult_1 }));
                    var playerResultSocketId = playerResult.getSocketId;
                    var otherPlayerResultSocketId = otherPlayerResult_1.getSocketId;
                    var otherPlayerScore = otherPlayerResult_1.getScore;
                    if (otherPlayerScore && (otherPlayerScore === null || otherPlayerScore === void 0 ? void 0 : otherPlayerScore.netWpm) === netWpm) {
                        if ((otherPlayerScore === null || otherPlayerScore === void 0 ? void 0 : otherPlayerScore.accuracyInPerc) === accuracyInPerc) {
                            challengeResult_1.draw = true;
                        }
                        else if ((otherPlayerScore === null || otherPlayerScore === void 0 ? void 0 : otherPlayerScore.accuracyInPerc) > accuracyInPerc) {
                            challengeResult_1.winner = otherPlayerResultSocketId;
                        }
                        else {
                            challengeResult_1.winner = playerResultSocketId;
                        }
                    }
                    else if (otherPlayerScore && (otherPlayerScore === null || otherPlayerScore === void 0 ? void 0 : otherPlayerScore.netWpm) > netWpm) {
                        challengeResult_1.winner = otherPlayerResultSocketId;
                    }
                    else {
                        challengeResult_1.winner = playerResultSocketId;
                    }
                }
            }
            if (sendResult) {
                sendChallengeResult(io, channel_2, challengeResult_1);
            }
        }
    }
    catch (e) {
        console.log(e);
    }
}
// check to delete Channel Info
function checkIfChannelCanBeDeleted(channel) {
    var channelInfo = ChannelInfoByChannel.get(channel);
    if (channelInfo) {
        var playerOne = channelInfo.playerOne, playerTwo = channelInfo.playerTwo;
        var isPlayerTwoRobot = playerTwo.getIsRobot;
        var isPlayerOneLeftChannel = playerOne.getIsLeftChannel;
        var isPlayerTwoLeftChannel = playerTwo.getIsLeftChannel;
        if (isPlayerTwoRobot) {
            ChannelInfoByChannel.delete(channel);
            console.log("Channel Deleted");
        }
        else if (isPlayerOneLeftChannel && isPlayerTwoLeftChannel) {
            ChannelInfoByChannel.delete(channel);
            console.log("Channel Deleted");
        }
    }
}
// leave channel handler
function onLeaveChannel(socket) {
    try {
        var socketId = socket.id;
        var player = PlayerInfoBySocketId.get(socketId);
        if (player) {
            // remove player info
            PlayerInfoBySocketId.delete(socketId);
            player.setIsLeftChannel = true;
            var channel = player.getChannel;
            checkIfChannelCanBeDeleted(channel);
        }
    }
    catch (e) {
        console.log(e);
    }
}
function sendErrorMessage(socket, competitorUserName) {
    var message = {
        errMsg: (competitorUserName ? competitorUserName : "Competitor") + " is not available for rematch",
    };
    socket.emit("rematch_error", message);
}
// Rematch request handler
function onRematchRequest(socket, io, message) {
    return __awaiter(this, void 0, void 0, function () {
        var channel, channelInfo, askingPlayer, competitorPlayer, playerOne, playerTwo, isPlayerOne, isCompetitorLeftChannel, competitorUserName, isCompetitorAskingForRematch, paragraph, message_1, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    channel = message.channel;
                    channelInfo = ChannelInfoByChannel.get(channel);
                    if (!channelInfo) return [3 /*break*/, 4];
                    askingPlayer = void 0, competitorPlayer = void 0;
                    playerOne = channelInfo.playerOne, playerTwo = channelInfo.playerTwo;
                    isPlayerOne = checkIfPlayerOne(channel, socket.id);
                    if (isPlayerOne) {
                        askingPlayer = playerOne;
                        competitorPlayer = playerTwo;
                    }
                    else {
                        askingPlayer = playerTwo;
                        competitorPlayer = playerOne;
                    }
                    isCompetitorLeftChannel = competitorPlayer.getIsLeftChannel;
                    competitorUserName = competitorPlayer.getUserName;
                    isCompetitorAskingForRematch = competitorPlayer.getIsAskingForRematch;
                    if (!isCompetitorLeftChannel) return [3 /*break*/, 1];
                    // send error message
                    sendErrorMessage(socket, competitorUserName);
                    return [3 /*break*/, 4];
                case 1:
                    if (!isCompetitorAskingForRematch) return [3 /*break*/, 3];
                    competitorPlayer.setIsAskingForRematch = false;
                    return [4 /*yield*/, fetchParagraph()];
                case 2:
                    paragraph = _a.sent();
                    message_1 = {
                        paragraph: paragraph,
                    };
                    io.to(channel).emit("rematch", message_1);
                    return [3 /*break*/, 4];
                case 3:
                    askingPlayer.setIsAskingForRematch = true;
                    socket.to(channel).emit("rematch_request");
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    e_2 = _a.sent();
                    console.log(e_2);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function onDisconnect(socket) {
    var socketId = socket.id;
    var player = PlayerInfoBySocketId.get(socketId);
    if (player) {
        // remove player info
        PlayerInfoBySocketId.delete(socketId);
        player.setIsLeftChannel = true;
        var channel = player.getChannel;
        checkIfChannelCanBeDeleted(channel);
    }
}
io.on("connection", function (socket) {
    console.log("A user has connected", socket.id);
    socket.on("start_play", function (userName) {
        startPlayHandler(socket, io, userName);
    });
    socket.on("challenge_score", function (message) {
        onChallengeScoreHandler(io, message);
    });
    socket.on("leave_channel", function () {
        onLeaveChannel(socket);
    });
    socket.on("rematch_request", function (message) {
        onRematchRequest(socket, io, message);
    });
    socket.on("disconnect", function () {
        onDisconnect(socket);
    });
});
var PORT = process.env.PORT || 5000;
server.listen(PORT, function () {
    console.log("Server listening to " + PORT);
});
