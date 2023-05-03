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
var app = express_1.default();
app.use(cors_1.default({ origin: "http://192.168.0.132:3000" }));
var server = http_1.default.createServer(app);
var io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://192.168.0.132:3000",
    },
});
var PLAYER_QUEUE = [];
var CHANNEL_INFO = new Map();
var timer = null;
var waitingResultTimer = null;
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
        var player, _a, competitorSocket, competitorUserName, channel, _i, _b, userSocket, paragraph, message;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(PLAYER_QUEUE.length === 0)) return [3 /*break*/, 1];
                    player = {
                        userName: userName,
                        socket: socket,
                    };
                    PLAYER_QUEUE.push(player);
                    timer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        var channel, paragraph, message;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("still no user");
                                    PLAYER_QUEUE.pop();
                                    channel = createChannel();
                                    CHANNEL_INFO.set(channel, {
                                        playerOneResult: {
                                            socketId: socket.id,
                                            userName: userName,
                                        },
                                        playerTwoResult: {
                                            isRobot: true,
                                            userName: Constants_1.ROBOT,
                                        },
                                    });
                                    socket.join(channel);
                                    return [4 /*yield*/, fetchParagraph()];
                                case 1:
                                    paragraph = _a.sent();
                                    message = {
                                        channel: channel,
                                        paragraph: paragraph,
                                        playerOneInfo: {
                                            userName: userName,
                                        },
                                        playerTwoInfo: {
                                            userName: Constants_1.ROBOT,
                                            isRobot: true,
                                        },
                                    };
                                    io.to(channel).emit("challenge_details", message);
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
                    _a = PLAYER_QUEUE.shift(), competitorSocket = _a.socket, competitorUserName = _a.userName;
                    channel = createChannel();
                    CHANNEL_INFO.set(channel, {
                        playerOneResult: {
                            socketId: competitorSocket.id,
                            userName: competitorUserName,
                        },
                        playerTwoResult: {
                            socketId: socket.id,
                            userName: userName,
                        },
                    });
                    // socket.emit("competitor", competitorUserName);
                    // competitorSocket.emit("competitor", userName);
                    for (_i = 0, _b = [competitorSocket, socket]; _i < _b.length; _i++) {
                        userSocket = _b[_i];
                        userSocket.join(channel);
                    }
                    return [4 /*yield*/, fetchParagraph()];
                case 2:
                    paragraph = _c.sent();
                    message = {
                        channel: channel,
                        paragraph: paragraph,
                        playerOneInfo: {
                            userName: competitorUserName,
                            socketId: competitorSocket.id,
                        },
                        playerTwoInfo: {
                            userName: userName,
                            socketId: socket.id,
                        },
                    };
                    io.to(channel).emit("challenge_details", message);
                    console.log("gameplay");
                    _c.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// onChallengeScore handler
function getRobotScore() {
    return Constants_1.ROBOT_SCORE[0];
}
function sendChallengeResult(io, channel, challengeResult) {
    io.to(channel).emit("challenge_result", challengeResult);
}
function onChallengeScoreHandler(io, message) {
    try {
        var channel_1 = message.channel;
        var channelInfo = CHANNEL_INFO.get(channel_1);
        var challengeResult_1 = {};
        if (channelInfo) {
            var sendResult = true;
            var playerOneResult = channelInfo.playerOneResult, playerTwoResult = channelInfo.playerTwoResult;
            var socketId_1 = message.socketId, wpm = message.wpm, netWpm = message.netWpm, accuracyInPerc = message.accuracyInPerc;
            if (playerTwoResult.isRobot) {
                var robotScore = getRobotScore();
                var robotNetWpm = robotScore.netWpm, robotAccuracyInPerc = robotScore.accuracyInPerc;
                challengeResult_1 = {
                    playerOneResult: __assign(__assign({}, (playerOneResult && playerOneResult)), { score: {
                            wpm: wpm,
                            netWpm: netWpm,
                            accuracyInPerc: accuracyInPerc,
                        } }),
                    playerTwoResult: __assign(__assign({}, (playerTwoResult && playerTwoResult)), { score: robotScore }),
                };
                if (netWpm === robotNetWpm) {
                    if (robotAccuracyInPerc === accuracyInPerc) {
                        challengeResult_1.draw = true;
                    }
                    else if (robotAccuracyInPerc > accuracyInPerc) {
                        challengeResult_1.winner = Constants_1.ROBOT;
                    }
                    else {
                        challengeResult_1.winner = playerOneResult === null || playerOneResult === void 0 ? void 0 : playerOneResult.socketId;
                    }
                }
                else if (robotNetWpm > netWpm) {
                    challengeResult_1.winner = Constants_1.ROBOT;
                }
                else {
                    challengeResult_1.winner = playerOneResult === null || playerOneResult === void 0 ? void 0 : playerOneResult.socketId;
                }
            }
            else {
                var playerResult = void 0;
                var otherPlayerResult = void 0;
                var isPlayerOne = false;
                if (socketId_1 === playerOneResult.socketId) {
                    isPlayerOne = true;
                    playerResult = playerOneResult;
                    otherPlayerResult = playerTwoResult;
                }
                else if (socketId_1 === playerTwoResult.socketId) {
                    playerResult = playerTwoResult;
                    otherPlayerResult = playerOneResult;
                }
                else {
                    throw new Error("Socket does not exist in the channel---Challenge Score Handler");
                }
                playerResult.score = {
                    wpm: wpm,
                    netWpm: netWpm,
                    accuracyInPerc: accuracyInPerc,
                };
                challengeResult_1 = __assign(__assign(__assign({}, challengeResult_1), (isPlayerOne && { playerOneResult: playerResult })), (!isPlayerOne && { playerTwoResult: playerResult }));
                if (!otherPlayerResult.isScoreRecieved) {
                    playerResult.isScoreRecieved = true;
                    sendResult = false;
                    waitingResultTimer = setTimeout(function () {
                        // Did not recieved other player result
                        challengeResult_1.winner = socketId_1;
                        sendChallengeResult(io, channel_1, challengeResult_1);
                    }, 5000);
                }
                else {
                    if (waitingResultTimer) {
                        clearTimeout(waitingResultTimer);
                    }
                    challengeResult_1 = __assign(__assign(__assign({}, challengeResult_1), (isPlayerOne && { playerTwoResult: otherPlayerResult })), (!isPlayerOne && { playerOneResult: otherPlayerResult }));
                    var score = otherPlayerResult.score;
                    if (score && (score === null || score === void 0 ? void 0 : score.netWpm) === netWpm) {
                        if ((score === null || score === void 0 ? void 0 : score.accuracyInPerc) === accuracyInPerc) {
                            challengeResult_1.draw = true;
                        }
                        else if ((score === null || score === void 0 ? void 0 : score.accuracyInPerc) > accuracyInPerc) {
                            challengeResult_1.winner = otherPlayerResult.socketId;
                        }
                        else {
                            challengeResult_1.winner = playerResult.socketId;
                        }
                    }
                    else if (score && (score === null || score === void 0 ? void 0 : score.netWpm) > netWpm) {
                        challengeResult_1.winner = otherPlayerResult.socketId;
                    }
                    else {
                        challengeResult_1.winner = playerResult.socketId;
                    }
                }
            }
            if (sendResult) {
                sendChallengeResult(io, channel_1, challengeResult_1);
            }
        }
    }
    catch (e) {
        console.log(e);
    }
}
// check to delete Channel Info
function checkIfChannelCanBeDeleted(channel) {
    var channelInfo = CHANNEL_INFO.get(channel);
    if (channelInfo) {
        var playerOneResult = channelInfo.playerOneResult, playerTwoResult = channelInfo.playerTwoResult;
        if (playerTwoResult.isRobot) {
            CHANNEL_INFO.delete(channel);
            console.log("Channel Deleted");
        }
        else if (playerOneResult.isLeftChannel && playerTwoResult.isLeftChannel) {
            CHANNEL_INFO.delete(channel);
            console.log("Channel Deleted");
        }
    }
}
function checkIfPlayerOne(channel, socketId) {
    var channelInfo = CHANNEL_INFO.get(channel);
    if (channelInfo) {
        var playerOneResult = channelInfo.playerOneResult, playerTwoResult = channelInfo.playerTwoResult;
        var playerOneSocketId = playerOneResult.socketId;
        var playerTwoSocketId = playerTwoResult.socketId;
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
// leave channel handler
function onLeaveChannel(socket, message) {
    try {
        var channel = message.channel;
        var channelInfo = CHANNEL_INFO.get(channel);
        socket.leave(channel);
        if (channelInfo) {
            var playerOneResult = channelInfo.playerOneResult, playerTwoResult = channelInfo.playerTwoResult;
            var isPlayerOne = checkIfPlayerOne(channel, socket.id);
            if (isPlayerOne) {
                playerOneResult.isLeftChannel = true;
            }
            else {
                playerTwoResult.isLeftChannel = true;
            }
            checkIfChannelCanBeDeleted(channel);
        }
    }
    catch (e) {
        console.log(e);
    }
}
// Rematch request handler
function onRematchRequest(socket, io, message) {
    return __awaiter(this, void 0, void 0, function () {
        var channel, channelInfo, askingPlayer, competitorPlayer, playerOneResult, playerTwoResult, isPlayerOne, paragraph, message_1, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    channel = message.channel;
                    channelInfo = CHANNEL_INFO.get(channel);
                    if (!channelInfo) return [3 /*break*/, 3];
                    askingPlayer = void 0, competitorPlayer = void 0;
                    playerOneResult = channelInfo.playerOneResult, playerTwoResult = channelInfo.playerTwoResult;
                    isPlayerOne = checkIfPlayerOne(channel, socket.id);
                    if (isPlayerOne) {
                        askingPlayer = playerOneResult;
                        competitorPlayer = playerTwoResult;
                    }
                    else {
                        askingPlayer = playerTwoResult;
                        competitorPlayer = playerOneResult;
                    }
                    if (!competitorPlayer.isAskingForRematch) return [3 /*break*/, 2];
                    competitorPlayer.isAskingForRematch = false;
                    return [4 /*yield*/, fetchParagraph()];
                case 1:
                    paragraph = _a.sent();
                    message_1 = {
                        paragraph: paragraph,
                    };
                    io.to(channel).emit("rematch", message_1);
                    return [3 /*break*/, 3];
                case 2:
                    askingPlayer.isAskingForRematch = true;
                    socket.to(channel).emit("rematch_request");
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    e_2 = _a.sent();
                    console.log(e_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
io.on("connection", function (socket) {
    console.log("A user has connected", socket.id);
    socket.on("start_play", function (userName) {
        startPlayHandler(socket, io, userName);
    });
    socket.on("challenge_score", function (message) {
        onChallengeScoreHandler(io, message);
    });
    socket.on("leave_channel", function (message) {
        onLeaveChannel(socket, message);
    });
    socket.on("rematch_request", function (message) {
        onRematchRequest(socket, io, message);
    });
    socket.on("disconnect", function () {
        console.log("disconnected");
    });
});
var PORT = process.env.PORT || 5000;
server.listen(PORT, function () {
    console.log("Server listening to " + PORT);
});
