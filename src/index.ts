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
import { ConstantManager } from "./hypixel/data/ConstantManager"

const app = new Hono()
const mojangService = new MojangService()
const hypixelClient = new HypixelClient(Bun.env["HYPIXEL_API_KEY"]!)
const hypixelService = new HypixelService(hypixelClient)

const path = Bun.env["SKYJS_DATA_DIR"]!
const neuRepo = new NeuRepoManager(path)
const neuConstantManager = new ConstantManager(`${path}/repo/neu/constants`)

const bestiary = new BestiaryData(neuConstantManager)
const skills = new SkillData(neuConstantManager)
const slayers = new SlayerData(neuConstantManager)
const collections = new CollectionData()

// load data
await collections.update()
await neuConstantManager.loadConstants()

console.log("Loaded collections.")

app.get("/mojang/:id", async (c) => {
	const param = c.req.param("id")
	console.log(`Mojang query for player ${param}`)
	const player = await mojangService.get(param)

	return c.json(player)
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
			collections: collectionData
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
