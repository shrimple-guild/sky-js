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

const app = new Hono()
const mojangService = new MojangService()
const hypixelClient = new HypixelClient(Bun.env["HYPIXEL_API_KEY"]!!)
const hypixelService = new HypixelService(hypixelClient)

const path = Bun.env["NEU_REPO_PATH"]!!
const neuRepo = new NeuRepoManager(path);
const bestiary = new BestiaryData(neuRepo)
const skills = new SkillData(neuRepo)
const slayers = new SlayerData(neuRepo)


await neuRepo.loadConstants()


app.get("/mojang/:id", async (c) => {
	const param = c.req.param("id")
	const player = await mojangService.get(param)

	return c.json(player)
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

app.get("/skyblock/:player", async (c) => {
	const { player, profile } = await resolvePlayerProfile(c.req.param("player"), c.req.query("profile"))
	const member = profile.getQueriedMember()
	const level = member.getSkyblockLevel()
	const skillData = skills.getAllSkills(member)
	const slayerData = slayers.getAllSlayers(member)
	const bestiaryData = bestiary.getAllBestiaries(member)

	return c.json({
		player,
		profile: {
			info: {
				name: profile.getName(),
				gamemode: profile.getGamemode(),
				id: profile.getProfileId(),
			},
			level: level,
			skills: skillData,
			slayers: slayerData,
			bestiary: bestiaryData,
		},
	})
})


function errorHandler(err: Error | HTTPException, c: Context) {
	if (err instanceof HTTPException) {
	  return c.json({ error: err.name, message: err.message });
	}
	if (err instanceof HttpError) {
	  return err.toResponse(c)
	}
	console.error(err);
	return c.text("Something went wrong", 500);
  };
  

app.onError(errorHandler)

export default app
