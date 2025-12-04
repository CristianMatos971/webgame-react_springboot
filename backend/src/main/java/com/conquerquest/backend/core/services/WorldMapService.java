package com.conquerquest.backend.core.services;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
@Slf4j
public class WorldMapService {

    // --- Constants TILE_TYPES) ---
    public static final int TILE_GRASS = 0;
    public static final int TILE_WATER = 1;
    public static final int TILE_TREE = 2;
    public static final int TILE_ROCK = 3;

    // Map Configuration
    private static final int TILE_SIZE = 64;
    private static final int WIDTH_TILES = 50;
    private static final int HEIGHT_TILES = 50;

    // The Map Data (Row-major order: map[x][y])
    private final int[][] mapData = new int[WIDTH_TILES][HEIGHT_TILES];

    private final Random random = new Random();

    private record StructureConfig(int width, int height, int count) {
    }

    @PostConstruct
    public void init() {
        log.info("Generating World Map...");
        generateMapData();
        log.info("World Map generated successfully.");
    }

    /**
     * Returns the raw map matrix to be sent to the frontend via API.
     */
    public int[][] getMapData() {
        return mapData;
    }

    private void generateMapData() {
        // Initialize with GRASS
        for (int[] row : mapData) {
            Arrays.fill(row, TILE_GRASS);
        }

        // Define Structures
        placeStructures(TILE_WATER, List.of(
                new StructureConfig(2, 2, 15),
                new StructureConfig(4, 2, 10),
                new StructureConfig(4, 3, 5)));

        placeStructures(TILE_ROCK, List.of(
                new StructureConfig(1, 1, 40),
                new StructureConfig(2, 2, 15)));

        placeStructures(TILE_TREE, List.of(
                new StructureConfig(1, 1, 70),
                new StructureConfig(2, 2, 20)));
    }

    private void placeStructures(int type, List<StructureConfig> configs) {
        for (StructureConfig conf : configs) {
            int placed = 0;
            int attempts = 0;

            while (placed < conf.count && attempts < 1000) {
                if (tryPlaceStructure(type, conf.width, conf.height)) {
                    placed++;
                }
                attempts++;
            }
        }
    }

    private boolean tryPlaceStructure(int type, int width, int height) {
        int x = random.nextInt(WIDTH_TILES - width);
        int y = random.nextInt(HEIGHT_TILES - height);

        // Check if area is clear - only replace GRASS
        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                if (mapData[x + i][y + j] != TILE_GRASS) {
                    return false; // Overlap detected
                }
            }
        }

        // Stamp the structure
        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                mapData[x + i][y + j] = type;
            }
        }
        return true;
    }

    // --- GAMEPLAY LOGIC - Used by MovementSystem ---

    public float getTerrainSpeedMultiplier(float worldX, float worldY) {
        int col = (int) Math.floor(worldX / TILE_SIZE);
        int row = (int) Math.floor(worldY / TILE_SIZE);

        if (isOutOfBounds(col, row))
            return 1.0f;

        int type = mapData[col][row];

        if (type == TILE_WATER) // water slows movement
            return 0.5f;

        return 1.0f;
    }

    public boolean checkCollision(float x, float y, float width, float height) {
        // Padding allows smoother movement through gaps
        float padding = 5.0f;

        float left = x + padding;
        float right = x + width - padding;
        float top = y + padding;
        float bottom = y + height - padding;

        if (isPointSolid(left, top))
            return true;
        if (isPointSolid(right, top))
            return true;
        if (isPointSolid(left, bottom))
            return true;
        if (isPointSolid(right, bottom))
            return true;

        return false;
    }

    private boolean isPointSolid(float px, float py) {
        int col = (int) Math.floor(px / TILE_SIZE);
        int row = (int) Math.floor(py / TILE_SIZE);

        if (isOutOfBounds(col, row))
            return true; // World border is solid

        return isSolid(mapData[col][row]);
    }

    public boolean isSolid(int type) {
        return type == TILE_TREE || type == TILE_ROCK;
    }

    private boolean isOutOfBounds(int col, int row) {
        return col < 0 || col >= WIDTH_TILES || row < 0 || row >= HEIGHT_TILES;
    }
}