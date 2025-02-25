import { FuzzySearch } from "../../utils/FuzzySearch";
import { SkyblockMember } from "../structures/SkyblockMember";
import type { NeuLevelingJson } from "../types/NeuLevelingJson";
import { Level, type LevelData } from "../utils/Level";
import type { ConstantManager } from "./ConstantManager";

export class SkillData {
    private skillLevels: Record<string, Level>

    private static searcher = new FuzzySearch<string>(
        { result: "Fishing", names: ["fishing", "feesh"] },
        { result: "Alchemy", names: ["alchemy"] },
        { result: "Runecrafting", names: ["runecrafting"] },
        { result: "Mining", names: ["mining", "mine"] },
        { result: "Farming", names: ["farming"] },
        { result: "Enchanting", names: ["enchanting"] },
        { result: "Taming", names: ["taming", "tame"] },
        { result: "Foraging", names: ["foraging",] },
        { result: "Social", names: ["social"] },
        { result: "Carpentry", names: ["carpentry"] },
        { result: "Combat", names: ["combat"] }
    )
    
    constructor(repo: ConstantManager) {
        this.skillLevels = {}
        repo.onReload(repo => this.update(repo))
    }

    async update(repo: ConstantManager) {
        const data = repo.getConstant<NeuLevelingJson>("leveling")
        this.skillLevels = {
            combat: Level.fromLevel(data.leveling_xp),
            mining: Level.fromLevel(data.leveling_xp),
            farming: Level.fromLevel(data.leveling_xp),
            foraging: Level.fromLevel(data.leveling_xp).withMaxLevel(50),
            fishing: Level.fromLevel(data.leveling_xp).withMaxLevel(50),
            enchanting: Level.fromLevel(data.leveling_xp),
            alchemy: Level.fromLevel(data.leveling_xp).withMaxLevel(50),
            taming: Level.fromLevel(data.leveling_xp), 
            carpentry: Level.fromLevel(data.leveling_xp).withMaxLevel(50), 
            social: Level.fromLevel(data.social),
            runecrafting: Level.fromLevel(data.runecrafting_xp)
        }
    }

    private getSkillResult(member: SkyblockMember, skill: string) {
        skill = skill.toLowerCase()
        let cap = 60
        if (skill == "farming") {
            cap = member.getFarmingLevelCap()
        } else if (skill == "taming") {
            cap = member.getTamingLevelCap()
        }
        const xp = member.getSkillXp(skill)
        const level = this.skillLevels[skill.toLowerCase()]
        const levelData = level.for(xp, cap).getLevelData()
        return {
            name: skill,
            level: levelData,
        }
    }

    getAllSkills(member: SkyblockMember) {
        const skills = Object.keys(this.skillLevels)
        const output: Record<string, SkillResult> = {}
        for (const skill of skills) {
            output[skill] = this.getSkillResult(member, skill)
        }
        return output
    }
    
    searchForSkill(member: SkyblockMember, query: string): SkillResult {
        const skill = SkillData.searcher.search(query)
        if (!skill) {
            throw new Error("No skill found!")
        }
        return this.getSkillResult(member, skill)
    }
}

type SkillResult = {
    name: string,
    level: LevelData,
}


