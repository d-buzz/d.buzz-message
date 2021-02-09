const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const api = require("./api");
const config = require("./api/config/appConfig")

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send({
    status: "Dbuzz messaging service is online",
  });
});

app.use("/api/v1", api);
app.listen(config.PORT, () => {
  console.log(`App listening at ${config.HOST}:${config.PORT}`);
});
