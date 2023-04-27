//@ts-check

// Use the web-push library to hide the implementation details of the communication
// between the application server and the push service.
// For details, see https://tools.ietf.org/html/draft-ietf-webpush-protocol and
// https://tools.ietf.org/html/draft-ietf-webpush-encryption.
const webPush = require("web-push")
const express = require("express")
const path = require("path")
const cors = require("cors")

require("dotenv").config()

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.log(
    "You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY " +
      "environment variables. You can use the following ones:",
  )
  console.log(webPush.generateVAPIDKeys())
  process.exit()
}

// Set the keys used for encrypting the push messages.
webPush.setVapidDetails(
  "https://example.com/",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
)

const app = express()

app.use(express.json())

app.use(cors())

app.get("/vapidPublicKey", function (req, res) {
  res.send(process.env.VAPID_PUBLIC_KEY)
})

app.post("/sendNotification", function (req, res) {
  console.log("body", req.body)
  const subscription = req.body.subscription
  const payload = "" + req.body.id
  const options = {
    TTL: req.body.ttl,
  }

  setTimeout(function () {
    webPush
      .sendNotification(subscription, payload, options)
      .then(function () {})
      .catch(function (error) {
        console.log(error)
      })
  }, req.body.delay)

  res.sendStatus(200)
})

app.use(express.static(path.join(__dirname, "public")))

app.listen(process.env.PORT || "8080")
