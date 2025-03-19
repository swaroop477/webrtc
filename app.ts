
const socket = io("http://localhost:3000");

let peerConnection: RTCPeerConnection;
let dataChannel: RTCDataChannel | null = null;

const startButton = document.getElementById("start") as HTMLButtonElement;
const sendButton = document.getElementById("send") as HTMLButtonElement;
const messageInput = document.getElementById("message") as HTMLInputElement;
const logElement = document.getElementById("log") as HTMLPreElement;

const log = (msg: string) => {
  console.log(msg);
  logElement.textContent += msg + "\n";
};

const config: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }, // STUN server
    { urls: "stun:stun1.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",  // TURN server (free)
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


startButton.addEventListener("click", async () => {
  log("Start Connection clicked");

  peerConnection = new RTCPeerConnection(config);
  log("PeerConnection created");

  dataChannel = peerConnection.createDataChannel("chat");
  log("Data channel created");

  // Log data channel state changes
  dataChannel.onopen = () => {
    log("✅ Data channel opened - Enabling send button.");
    sendButton.disabled = false;
  };

  dataChannel.onclose = () => {
    log("❌ Data channel closed.");
    sendButton.disabled = true;
  };

  dataChannel.onerror = (error) => {
    log(`⚠️ Data channel error: ${error}`);
  };

  dataChannel.onmessage = (event) => log("📩 Received: " + event.data);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      log("Sending ICE candidate");
      socket.emit("candidate", event.candidate);
    }
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  log("Offer created and set as local description");

  socket.emit("offer", offer);
});

socket.on("offer", async (offer) => {
  log("Received offer");
  peerConnection = new RTCPeerConnection(config);

  peerConnection.ondatachannel = (event) => {
    log("✅ Data channel received from remote peer.");
    dataChannel = event.channel;

    dataChannel.onopen = () => {
      log("✅ Remote data channel opened - Enabling send button.");
      sendButton.disabled = false;
    };

    dataChannel.onclose = () => {
      log("❌ Remote data channel closed.");
      sendButton.disabled = true;
    };

    dataChannel.onerror = (error) => {
      log(`⚠️ Remote data channel error: ${error}`);
    };

    dataChannel.onmessage = (event) => log("📩 Received: " + event.data);
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      log("Sending ICE candidate");
      socket.emit("candidate", event.candidate);
    }
  };

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  log("Offer set as remote description");

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  log("Answer created and set as local description");

  socket.emit("answer", answer);
});

socket.on("answer", async (answer) => {
  log("Received answer");
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on("candidate", async (candidate) => {
  log("Received ICE candidate");
  if (peerConnection) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
});

sendButton.addEventListener("click", () => {
  if (dataChannel && dataChannel.readyState === "open") {
    const message = messageInput.value;
    dataChannel.send(message);
    log("📤 Sent: " + message);
  } else {
    log("⚠️ Cannot send message, data channel is not open.");
  }
});
