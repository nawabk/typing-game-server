"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Player = /** @class */ (function () {
    function Player(_a) {
        var socketId = _a.socketId, userName = _a.userName, channel = _a.channel, _b = _a.isMobileUser, isMobileUser = _b === void 0 ? false : _b, _c = _a.isRobot, isRobot = _c === void 0 ? false : _c;
        this.isRobot = isRobot;
        this.userName = userName;
        this.socketId = socketId;
        this.channel = channel;
        this.isMobileUser = isMobileUser;
    }
    Object.defineProperty(Player.prototype, "getSocketId", {
        get: function () {
            return this.socketId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getUserName", {
        get: function () {
            return this.userName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "setIsScoreRecieved", {
        set: function (scoreRecieved) {
            this.isScoreRecieved = scoreRecieved;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getIsScoreRecieved", {
        get: function () {
            var _a;
            return (_a = this.isScoreRecieved) !== null && _a !== void 0 ? _a : false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "setScore", {
        set: function (score) {
            this.score = score;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getScore", {
        get: function () {
            var _a;
            return (_a = this.score) !== null && _a !== void 0 ? _a : null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "setIsRobot", {
        set: function (isRobot) {
            this.isRobot = isRobot;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getIsRobot", {
        get: function () {
            var _a;
            return (_a = this.isRobot) !== null && _a !== void 0 ? _a : false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "setIsLeftChannel", {
        set: function (isLeftChannel) {
            this.isLeftChannel = isLeftChannel;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getIsLeftChannel", {
        get: function () {
            var _a;
            return (_a = this.isLeftChannel) !== null && _a !== void 0 ? _a : false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "setIsAskingForRematch", {
        set: function (isAskingForRematch) {
            this.isAskingForRematch = isAskingForRematch;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getIsAskingForRematch", {
        get: function () {
            var _a;
            return (_a = this.isAskingForRematch) !== null && _a !== void 0 ? _a : false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getChannel", {
        get: function () {
            var _a;
            return (_a = this.channel) !== null && _a !== void 0 ? _a : "";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getIsMobileUser", {
        get: function () {
            var _a;
            return (_a = this.isMobileUser) !== null && _a !== void 0 ? _a : false;
        },
        enumerable: false,
        configurable: true
    });
    return Player;
}());
exports.default = Player;
