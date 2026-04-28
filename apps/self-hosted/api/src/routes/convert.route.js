const Router = require("express");
const router = Router();
const convertController = require("../controllers/convert.controller");

router.get("/convert", convertController.convertImage);

module.exports = router;
