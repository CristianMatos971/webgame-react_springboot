# Still prototyping project...

Current Development: 

Backend (Spring Boot)
backend/
   src/
      main/java/
         com.conquerquest/backend
            ws/               -> websockets
            game/             -> game's central logic
            game/entities/    -> world entities
            game/systems/     -> physics, itens, pvp
            auth/             -> autentication
            api/              -> endpoints REST
   pom.xml

Frontend (React)
frontend/
  src/
    game/
      engine/         -> render logic
      components/     -> sprites, UI, HUD
      network/        -> websocket client
    pages/
    context/