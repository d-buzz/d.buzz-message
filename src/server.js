const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const api = require("./api");
const { socketEvents } = require("./api/services")

class Server {
  constructor() {
    dotenv.config();
    this.app = express();
    this.http = http.Server(this.app);
    this.socket = socketio(this.http);
    this.env = process.env;
  }

  appConfig() {
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
  }

  includeRoutes() {
    this.app.get("/", (req, res) => {
      res.send({
        status: "Dbuzz messaging service is online",
      });
    });
    this.app.use("/api/v1", api);
    if(this.env.SOCKET_ENABLE=='true'){
      new socketEvents(this.socket).socketConfig()
    }
  }

  appExecute() {
    this.appConfig();
    this.includeRoutes();
    const port = this.env.port || 3020;
    const host = this.env.host || `localhost`;      
    this.http.listen(port, host, () => {
        console.log(`Listening on http://${host}:${port}`);
    });
  }
}

const app = new Server();
app.appExecute();
