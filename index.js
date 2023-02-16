// Register a Service Worker.
navigator.serviceWorker.register('service-worker.js')

document.getElementById('start').onclick = () => {
	navigator.serviceWorker.ready
		.then(function (registration) {
			// Use the PushManager to get the user's subscription to the push service.
			return registration.pushManager
				.getSubscription()
				.then(async function (subscription) {
					// If a subscription was found, return it.
					if (subscription) {
						return subscription
					}

					// Get the server's public key
					const response = await fetch('./vapidPublicKey')
					const vapidPublicKey = await response.text()
					// Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
					// urlBase64ToUint8Array() is defined in /tools.js
					const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

					// Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
					// send notifications that don't have a visible effect for the user).
					return registration.pushManager.subscribe({
						userVisibleOnly: true,
						applicationServerKey: convertedVapidKey,
					})
				})
		})
		.then(function (subscription) {
			// Send the subscription details to the server using the Fetch API.
			fetch('./register', {
				method: 'post',
				headers: {
					'Content-type': 'application/json',
				},
				body: JSON.stringify({
					subscription: subscription,
				}),
			})

			console.log(subscription)

			document.getElementById('doIt').onclick = function () {
				const delay = document.getElementById('notification-delay').value
				const ttl = document.getElementById('notification-ttl').value

				// Ask the server to send the client a notification (for testing purposes, in actual
				// applications the push notification is likely going to be generated by some event
				// in the server).
				fetch('./sendNotification', {
					method: 'post',
					headers: {
						'Content-type': 'application/json',
					},
					body: JSON.stringify({
						subscription: subscription,
						delay: delay,
						ttl: ttl,
					}),
				})
			}
		})
}
