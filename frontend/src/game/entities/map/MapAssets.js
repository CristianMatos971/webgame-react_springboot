import * as PIXI from 'pixi.js';
import { TILE_TYPES } from './MapConstants';

// Ground variants
import grass01Img from '../../../assets/map/ground/grass_variants/grass_01.png';
import grass02Img from '../../../assets/map/ground/grass_variants/grass_02.png';
import grass03Img from '../../../assets/map/ground/grass_variants/grass_03.png';

// Decals
import tuftSmallImg from '../../../assets/map/decals/tuft_small.png';
import tuftMidImg from '../../../assets/map/decals/tuft_mid.png';
import tuftBigImg from '../../../assets/map/decals/tuft_big.png';
import flowerWhiteImg from '../../../assets/map/decals/flower_white.png';
import flowerRedImg from '../../../assets/map/decals/flower_red.png';
import rockSmallImg from '../../../assets/map/decals/rock_small.png';
import stickSmallImg from '../../../assets/map/decals/stick_small.png';

// Trees
import treeMidImg from '../../../assets/map/trees/tree_mid.png';

// Water
import waterBaseImg from '../../../assets/map/water/water_center.png';
import waterNWImg from '../../../assets/map/water/water_nw.png';
import waterNEImg from '../../../assets/map/water/water_ne.png';
import waterSWImg from '../../../assets/map/water/water_sw.png';
import waterSEImg from '../../../assets/map/water/water_se.png';
import waterWImg from '../../../assets/map/water/water_w.png';
import waterEImg from '../../../assets/map/water/water_e.png';
import waterSImg from '../../../assets/map/water/water_s.png';
import waterNImg from '../../../assets/map/water/water_n.png';

//ores
import rockMidImg from '../../../assets/map/ores/rock_mid.png';

/**
 * Loads a texture with nearest-neighbor scaling for pixel art.
 * @param {string} path - The asset path.
 * @returns {Promise<PIXI.Texture>}
 */
async function loadTexture(path) {
    try {
        const texture = await PIXI.Assets.load(path);
        texture.source.scaleMode = 'nearest';
        return texture;
    } catch (e) {
        console.error(`[MapAssets] Failed to load texture: ${path}`, e);
        return PIXI.Texture.WHITE;
    }
}

/**
 * Preloads all map-related assets and organizes them into structured objects.
 * @returns {Promise<Object>} The organized asset library.
 */
export async function loadMapAssets() {
    // Load everything in parallel
    const [
        grass01, grass02, grass03,
        tuftS, tuftM, tuftB,
        flowerW, flowerR,
        rockS, stickS,
        treeMid,
        waterBase,
        waterNW, waterNE, waterSW, waterSE,
        waterN, waterW, waterE, waterS,
        rockMid
    ] = await Promise.all([
        loadTexture(grass01Img),
        loadTexture(grass02Img),
        loadTexture(grass03Img),
        loadTexture(tuftSmallImg),
        loadTexture(tuftMidImg),
        loadTexture(tuftBigImg),
        loadTexture(flowerWhiteImg),
        loadTexture(flowerRedImg),
        loadTexture(rockSmallImg),
        loadTexture(stickSmallImg),
        loadTexture(treeMidImg),
        loadTexture(waterBaseImg),
        loadTexture(waterNWImg),
        loadTexture(waterNEImg),
        loadTexture(waterSWImg),
        loadTexture(waterSEImg),
        loadTexture(waterNImg),
        loadTexture(waterWImg),
        loadTexture(waterEImg),
        loadTexture(waterSImg),
        loadTexture(rockMidImg)
    ]);

    // Return the organized structure expected by the Map class
    return {
        grassVariants: [grass01, grass02, grass03],
        waterTiles: {
            base: waterBase,
            edge: { N: waterN, S: waterS, E: waterE, W: waterW },
            corner: { NW: waterNW, NE: waterNE, SW: waterSW, SE: waterSE }
        },
        decals: {
            tufts: [tuftS, tuftM, tuftB],
            flowers: [flowerW, flowerR],
            debris: [rockS, stickS]
        },
        ores: {
            rockMid: rockMid
        },
        otherTextures: {
            [TILE_TYPES.WATER]: waterBase,
            [TILE_TYPES.TREE]: treeMid
        }
    };
}