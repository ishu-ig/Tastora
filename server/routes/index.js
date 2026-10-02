const router = require("express").Router();

router.use("/user", require("./UserRoutes"));
router.use("/auth", require("./UserRoutes"));
router.use("/maincategory", require("./MaincategoryRoutes"));
router.use("/subcategory", require("./SubcategoryRoutes"));
router.use("/address", require("./AddressRoutes"));
router.use("/product", require("./ProductRoutes"));
router.use("/combo", require("./ComboRoutes"));
router.use("/thali", require("./ThaliRoutes"));
router.use("/coupon", require("./CouponRoutes"));
router.use("/cart", require("./CartRoutes"));
router.use("/wishlist", require("./WishlistRoutes"));
router.use("/checkout", require("./CheckoutRoutes"));
router.use("/deliveryBoy", require("./DeliveryBoyRoutes"));
router.use("/delivery-boy", require("./DeliveryBoyRoutes"));
router.use("/booking", require("./BookingRoutes"));
router.use("/support", require("./SupportTicketRoutes"));
router.use("/membershipplan", require("./MembershipPlanRoutes"));
router.use("/membership", require("./MembershipRoutes"));


module.exports = router;