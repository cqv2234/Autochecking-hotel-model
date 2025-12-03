const express = require("express");

const roomsControllers = require("../controllers/rooms-controllers");

const router = express.Router();

router.get("/search", roomsControllers.searchRooms);

router.get("/:roomId", roomsControllers.getRoomById);

module.exports = router;
