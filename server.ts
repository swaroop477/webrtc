import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors"; // Import CORS

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  // Allows requests from ANY origin (change this for production)
    methods: ["GET", "POST"]
  }
});

app.use(cors()); // Enable CORS for Express

app.use(express.static("public")); // Serve static files (index.html, app.js)

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("offer", (data) => {
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.broadcast.emit("answer", data);
  });

  socket.on("candidate", (data) => {
    socket.broadcast.emit("candidate", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://<YOUR_LOCAL_IP>:3000");
});
