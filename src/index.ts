import { Hono, type Context } from "hono"
import { MojangService } from "./mojang/MojangService"
import { HypixelService } from "./hypixel/HypixelService"
import { HypixelClient } from "./hypixel/HypixelClient"
import { NeuRepoManager } from "./hypixel/data/NeuRepoManager"
import { BestiaryData } from "./hypixel/data/BestiaryData"
import { SkillData } from "./hypixel/data/SkillData"
import { SlayerData } from "./hypixel/data/SlayerData"
import { HttpError, PlayerHttpError } from "./errors/HttpError"
import { HTTPException } from "hono/http-exception"
import { CollectionData } from "./hypixel/data/CollectionData"
import { ItemService } from "./hypixel/data/ItemService"
import { BazaarService } from "./hypixel/bazaar/BazaarService"
import { TrophyFishData } from "./hypixel/data/TrophyFishData"
import { CachedHypixelClient } from "./hypixel/CachedHypixelClient"
import { DungeonsData } from "./hypixel/data/DungeonsData"
import { NeuAuctionService } from "./hypixel/neuauctions/NeuAuctionService"
import { logger as honoLogger } from "hono/logger"
import { logger } from "./logging/Logger"

logger.log("Starting.")
const dataDirectory = Bun.env["SKYJS_DATA_DIR"]!
const app = new Hono()

app.use(honoLogger())

const mojangService = new MojangService()
const hypixelClient = new CachedHypixelClient(new HypixelClient(Bun.env["HYPIXEL_API_KEY"]!))
const hypixelService = new HypixelService(hypixelClient)

const neuRepo = new NeuRepoManager("NotEnoughUpdates", "NotEnoughUpdates-REPO", "master", dataDirectory)
const itemService = new ItemService(neuRepo)

const bestiary = new BestiaryData(neuRepo)
const skills = new SkillData(neuRepo)
const slayers = new SlayerData(neuRepo)
const collections = new CollectionData(hypixelClient)
const trophyFish = new TrophyFishData()
const dungeons = new DungeonsData(neuRepo)

const bazaarService = new BazaarService(itemService, hypixelClient)
const auctionService = new NeuAuctionService(itemService, dataDirectory)

setInterval(() => {
	logger.log("Updating bazaar and auction data.")
	bazaarService.update()
	auctionService.update()
}, 1000 * 60)

setInterval(
	() => {
		logger.log("Checking for NEU repo updates.")
		neuRepo.load()
	},
	1000 * 60 * 60
)

await neuRepo.load()
await collections.update()
await bazaarService.update()
await auctionService.update()


app.get("/mojang/:id", async (c) => {
	const param = c.req.param("id")
	const player = await mojangService.get(param)

	return c.json(player)
})

app.get("/skyblock/items", async (c) => {
	return c.json(itemService.getItems())
})

app.get("/skyblock/bazaar", async (c) => {
	const query = c.req.query("query")
	if (!query) {
		return c.json(bazaarService.getProducts())
	} else {
		return c.json(bazaarService.searchProduct(query))
	}
})

app.get("/skyblock/lowestbin/:query", async (c) => {
	const query = c.req.param("query")
	return c.json(auctionService.searchForAuction(query))
})

app.get("/skyblock/profile/:player", async (c) => {
	console.log(`Skyblock query for player ${c.req.param("player")}`)
	const { player, profile } = await resolvePlayerProfile(c.req.param("player"), c.req.query("profile"))
	const member = profile.getQueriedMember()
	const level = member.getSkyblockLevel()
	const skillData = skills.getAllSkills(member)
	const slayerData = slayers.getAllSlayers(member)
	const bestiaryData = bestiary.getAllBestiaries(member)
	const collectionData = collections.getAllCollections(member)
	const trophyData = trophyFish.getAllTrophyFish(member)
	const dungeonsData = dungeons.getAllDungeons(member)

	return c.json({
		player,
		profile: {
			info: {
				name: profile.getName(),
				gamemode: profile.getGamemode(),
				id: profile.getProfileId()
			},
			level: level,
			skills: skillData,
			slayers: slayerData,
			bestiary: bestiaryData,
			collections: collectionData,
			trophyFish: trophyData,
			dungeons: dungeonsData
		}
	})
})

async function resolvePlayerProfile(playerQuery: string, profileQuery: string | undefined) {
	const player = await mojangService.get(playerQuery)
	if (!player) {
		throw new HttpError(`Player not found for query \"${playerQuery}\"`, 404)
	}
	const skyblockProfiles = await hypixelService.getSkyblockProfiles(player.uuid)
	if (!skyblockProfiles) {
		throw new PlayerHttpError(`No Skyblock players found for ${player.name}`, player, 404)
	}
	const profile = skyblockProfiles.getByQuery(profileQuery ?? "selected")
	return { player, profile }
}

function errorHandler(err: Error | HTTPException, c: Context) {
	console.error(err)
	if (err instanceof HTTPException) {
		return c.json({ error: err.name, message: err.message })
	}
	if (err instanceof HttpError) {
		return err.toResponse(c)
	}
	return c.text("Something went wrong", 500)
}

app.onError(errorHandler)

export default app
