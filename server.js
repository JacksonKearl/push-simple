// Use the web-push library to hide the implementation details of the communication
// between the application server and the push service.
// For details, see https://tools.ietf.org/html/draft-ietf-webpush-protocol and
// https://tools.ietf.org/html/draft-ietf-webpush-encryption.
const webPush = require('web-push')
const express = require('express')
require('dotenv').config()

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
	console.log(
		'You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY ' +
			'environment variables. You can use the following ones:',
	)
	console.log(webPush.generateVAPIDKeys())
	return
}
// Set the keys used for encrypting the push messages.
webPush.setVapidDetails(
	'https://example.com/',
	process.env.VAPID_PUBLIC_KEY,
	process.env.VAPID_PRIVATE_KEY,
)

const app = express()

app.get('/vapidPublicKey', function (req, res) {
	res.send(process.env.VAPID_PUBLIC_KEY)
})

app.post('/register', function (req, res) {
	// A real world application would store the subscription info.
	res.sendStatus(201)
})

app.post('/sendNotification', function (req, res) {
	const subscription = req.body.subscription
	const payload = null
	const options = {
		TTL: req.body.ttl,
	}

	setTimeout(function () {
		webPush
			.sendNotification(subscription, payload, options)
			.then(function () {
				res.sendStatus(201)
			})
			.catch(function (error) {
				res.sendStatus(500)
				console.log(error)
			})
	}, req.body.delay * 1000)
})

app.use(express.static(__dirname))

app.listen(process.env.PORT || 4567)
