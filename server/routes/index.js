const router = require("express").Router();

router.use("/user", require("./UserRoutes"));
router.use("/auth", require("./UserRoutes"));
router.use("/maincategory", require("./MaincategoryRoutes"));
router.use("/subcategory", require("./SubcategoryRoutes"));
router.use("/address", require("./AddressRoutes"));

module.exports = router;
