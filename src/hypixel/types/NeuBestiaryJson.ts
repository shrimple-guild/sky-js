export type NeuBestiaryJson = {
    brackets: { [key: string]: number[] } 
} & Record<string, NeuCategoryData>

export type NeuCategoryData = NeuSubcategoryData & { hasSubcategories?: false }
    | ({
        hasSubcategories: true,
        name: string,
        icon: any,
    } & Record<string, NeuSubcategoryData>)


export type NeuSubcategoryData = {
    name: string
    mobs: NeuFamilyData[]
}

export type NeuFamilyData = {
    name: string
    cap: number
    mobs: string[]
    bracket: number
    kills: number
    deaths: number
    kdr: number | undefined
}