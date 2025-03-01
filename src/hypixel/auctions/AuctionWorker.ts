const worker = new Worker("./src/hypixel/auctions/AuctionTask.ts")

setInterval(() => {
	worker.postMessage("updateAuctions")
}, 5 * 1000)

worker.addEventListener("message", (event) => {
	if (event.data != "updateComplete") return
	console.log("Completed auctions update.")
})
