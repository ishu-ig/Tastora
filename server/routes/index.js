const router = require("express").Router();

router.use("/user", require("./UserRoutes"));
router.use("/auth", require("./UserRoutes"));
router.use("/maincategory", require("./MainCategoryRoutes"))
router.use("/subcategory", require("./SubCategoryRoutes"))
router.use("/address", require("./AddressRoutes"));

module.exports = router;
