declare let self: Worker

export const a = "a"
self.addEventListener("message", (event) => {
	if (event.data != "updateAuctions") return
	setTimeout(() => {
		postMessage("updateComplete")
	}, 1000)
})
