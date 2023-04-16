"use strict";
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
app.use(cors_1.default({ origin: "http://localhost:3000" }));
var server = http_1.default.createServer(app);
var io = new socket_io_1.Server(server);
var PLAYER_STACK = [];
var CHANNEL_INFO = new Map();
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
        var player, _a, competetorSocket, competetorUserName, channel, _i, _b, userSocket, parapgraph;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("start play request");
                    if (!(PLAYER_STACK.length === 0)) return [3 /*break*/, 1];
                    player = {
                        userName: userName,
                        socket: socket,
                    };
                    PLAYER_STACK.push(player);
                    timer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        var channel, paragraph;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("still no user");
                                    PLAYER_STACK.pop();
                                    channel = createChannel();
                                    CHANNEL_INFO.set(channel, {
                                        player1: socket,
                                        player2: "computer",
                                    });
                                    socket.join(channel);
                                    return [4 /*yield*/, fetchParagraph()];
                                case 1:
                                    paragraph = _a.sent();
                                    socket.emit("competitor", "computer");
                                    io.to(channel).emit("challenge_details", {
                                        channel: channel,
                                        paragraph: paragraph,
                                    });
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
                    _a = PLAYER_STACK.shift(), competetorSocket = _a.socket, competetorUserName = _a.userName;
                    channel = createChannel();
                    CHANNEL_INFO.set(channel, {
                        player1: competetorSocket,
                        player2: socket,
                    });
                    socket.emit("competitor", competetorUserName);
                    competetorSocket.emit("competitor", userName);
                    for (_i = 0, _b = [competetorSocket, socket]; _i < _b.length; _i++) {
                        userSocket = _b[_i];
                        userSocket.join(channel);
                    }
                    return [4 /*yield*/, fetchParagraph()];
                case 2:
                    parapgraph = _c.sent();
                    io.to(channel).emit("challenge_details", {
                        channel: channel,
                        parapgraph: parapgraph,
                    });
                    console.log("gameplay");
                    _c.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
io.on("connection", function (socket) {
    console.log("A user has connected");
    socket.on("start-play", function (userName) {
        startPlayHandler(socket, io, userName);
    });
});
var PORT = process.env.PORT || 5000;
server.listen(PORT, function () {
    console.log("Server listening to " + PORT);
});
