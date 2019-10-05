// server.js
const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000

const estimateRouter = require("./src/routes/pulseEstimates")
const estimateFunctions = require("./src/models/estimateFunctions")

const redisClient = require("./src/redis/redis-client")
const http = require("http").createServer(app)
const io = require("socket.io")(http)

const CronJob = require("cron").CronJob
new CronJob(
  "*/15 * 6-24,0-1 * * *",
  estimateFunctions.fetchEstimates(redisClient),
  null,
  true,
  "America/New_York"
)

io.on("connection", (client: any) => {
  client.on("subscribeToRoute", (route: number, interval: number) => {
    console.log("client is subscribing to timer with interval ", interval)
    setInterval(async () => {
      client.emit("estimates", await redisClient.getAsync(route))
    }, interval)
  })
})

const port = 8000
io.listen(port)
console.log("Socket.io listening on port", port)

app.use("/estimates", estimateRouter)

// test
app.get("/", (req: any, res: any) => {
  return res.send("Hello world")
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})