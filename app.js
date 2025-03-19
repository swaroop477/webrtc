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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var _this = this;
var socket = io("http://localhost:3000");
var peerConnection;
var dataChannel = null;
var startButton = document.getElementById("start");
var sendButton = document.getElementById("send");
var messageInput = document.getElementById("message");
var logElement = document.getElementById("log");
var log = function (msg) {
    console.log(msg);
    logElement.textContent += msg + "\n";
};
var config = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, // STUN server
        { urls: "stun:stun1.l.google.com:19302" },
        {
            urls: "turn:openrelay.metered.ca:80", // TURN server (free)
            username: "openrelay",
            credential: "openrelay"
        },
        {
            urls: "turn:numb.viagenie.ca",
            username: "webrtc@live.com",
            credential: "muazkh"
        }
    ]
};
startButton.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
    var offer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                log("Start Connection clicked");
                peerConnection = new RTCPeerConnection(config);
                log("PeerConnection created");
                dataChannel = peerConnection.createDataChannel("chat");
                log("Data channel created");
                // Log data channel state changes
                dataChannel.onopen = function () {
                    log("✅ Data channel opened - Enabling send button.");
                    sendButton.disabled = false;
                };
                dataChannel.onclose = function () {
                    log("❌ Data channel closed.");
                    sendButton.disabled = true;
                };
                dataChannel.onerror = function (error) {
                    log("\u26A0\uFE0F Data channel error: ".concat(error));
                };
                dataChannel.onmessage = function (event) { return log("📩 Received: " + event.data); };
                peerConnection.onicecandidate = function (event) {
                    if (event.candidate) {
                        log("Sending ICE candidate");
                        socket.emit("candidate", event.candidate);
                    }
                };
                return [4 /*yield*/, peerConnection.createOffer()];
            case 1:
                offer = _a.sent();
                return [4 /*yield*/, peerConnection.setLocalDescription(offer)];
            case 2:
                _a.sent();
                log("Offer created and set as local description");
                socket.emit("offer", offer);
                return [2 /*return*/];
        }
    });
}); });
socket.on("offer", function (offer) { return __awaiter(_this, void 0, void 0, function () {
    var answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                log("Received offer");
                peerConnection = new RTCPeerConnection(config);
                peerConnection.ondatachannel = function (event) {
                    log("✅ Data channel received from remote peer.");
                    dataChannel = event.channel;
                    dataChannel.onopen = function () {
                        log("✅ Remote data channel opened - Enabling send button.");
                        sendButton.disabled = false;
                    };
                    dataChannel.onclose = function () {
                        log("❌ Remote data channel closed.");
                        sendButton.disabled = true;
                    };
                    dataChannel.onerror = function (error) {
                        log("\u26A0\uFE0F Remote data channel error: ".concat(error));
                    };
                    dataChannel.onmessage = function (event) { return log("📩 Received: " + event.data); };
                };
                peerConnection.onicecandidate = function (event) {
                    if (event.candidate) {
                        log("Sending ICE candidate");
                        socket.emit("candidate", event.candidate);
                    }
                };
                return [4 /*yield*/, peerConnection.setRemoteDescription(new RTCSessionDescription(offer))];
            case 1:
                _a.sent();
                log("Offer set as remote description");
                return [4 /*yield*/, peerConnection.createAnswer()];
            case 2:
                answer = _a.sent();
                return [4 /*yield*/, peerConnection.setLocalDescription(answer)];
            case 3:
                _a.sent();
                log("Answer created and set as local description");
                socket.emit("answer", answer);
                return [2 /*return*/];
        }
    });
}); });
socket.on("answer", function (answer) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                log("Received answer");
                return [4 /*yield*/, peerConnection.setRemoteDescription(new RTCSessionDescription(answer))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
socket.on("candidate", function (candidate) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                log("Received ICE candidate");
                if (!peerConnection) return [3 /*break*/, 2];
                return [4 /*yield*/, peerConnection.addIceCandidate(new RTCIceCandidate(candidate))];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); });
sendButton.addEventListener("click", function () {
    if (dataChannel && dataChannel.readyState === "open") {
        var message = messageInput.value;
        dataChannel.send(message);
        log("📤 Sent: " + message);
    }
    else {
        log("⚠️ Cannot send message, data channel is not open.");
    }
});
