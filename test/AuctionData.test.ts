import { AuctionData } from "../src/hypixel/data/AuctionData";
import { ItemService } from "../src/hypixel/data/ItemService";

const dataDir = Bun.env["SKYJS_DATA_DIR"]!!
const manager = new ItemService(`${dataDir}/repo/neu/items`)
await manager.loadItems()

const auctions = new AuctionData(manager)


const item = "H4sIAAAAAAAA/01SwW7TQBAdpwGaAAJBJeCCFomCRJXIadLG7s1y0zZKaasktAeE0NqeOivW3mq9IeTID3BD4gDnHDjwBVzyJ+QzOCDGSdVGsle7b+e9NzM7ZYASWKIMAFYBCiKy1iy44athaqwyrBgeW3D7TRpo5B94INFagdKBiHBP8jgj0r8y3IpEdiH5uATFQ6VxldA1eDCdNHd5wmPcYdNJuFFzbXhIWM9oTGMzWKCODY8I9LUwbDm6bq/DY7popwalFDGm4fyGb2zaNjylnfOW/tmPz7S+uzp+/5Ifyf9V7o5cLihb9jptmtHcgBnFWmmEOsGUwCq8pJW+LoYoPmLOcOfhErOMXXLOtUrgCYFLTDYaYMoGKKMqVBYa+1ykRK1T/rNvv5ivkoAbdiaySCU5g8cUkBm4s6RUpXRfTCfbXiCkMOMd1lNDGeoxIyGcTmS3vX/QZ/5h2++Ae+2R98ie/fzN9lCrkIh5ypf6V/Wxc6XzghrZPHlqTi5+LtWIcstM3tF6DdYIf81Tfo3lTaYHdHylZKRG6c6lCABbyPQHImPCYMJCnrIAmUayijF6Bvenky1Ku3XS9lnv7Li7uwrFI57g/OJU6Qt6lQ435AdluNf6ZDT3jNEiGBrMVvMJhLunx90T7/B9x+t7Rx7xh0NCn9fdmtvctKNKY9upVRpu5FYcdJxK2HSdeg237UbgFKFkRIKZ4ckFTfTXZvz3D0ABbi6miyqA/4BP5hnyAgAA"
const startTime = performance.now();
const resolved = await auctions.resolveInternalName(item)
const endTime = performance.now();
console.log(`Time taken to resolve internal name: ${endTime - startTime} milliseconds`);

console.log(resolved)