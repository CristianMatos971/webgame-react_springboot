package com.conquerquest.backend.infra.api;

import com.conquerquest.backend.core.services.WorldMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorldMapController {

    private final WorldMapService worldMapService;

    @GetMapping
    public ResponseEntity<int[][]> getMap() {
        return ResponseEntity.ok(worldMapService.getMapData());
    }
}