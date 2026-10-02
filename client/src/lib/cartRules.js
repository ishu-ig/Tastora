// Money rules for the cart page. All amounts are in rupees (₹).
// The cart lines and subtotal now come from the database (CartStateData), so the
// delivery / tax / coupon / coins maths is done here from that subtotal.

export const CART_RULES = {
  freeDeliveryThreshold: 250, // delivery is free from this subtotal
  deliveryFee: 40,            // delivery mode, below the threshold
  takeawayPackagingFee: 0,    // takeaway mode: zero delivery fee
  dineInServiceCharge: 0,     // dine-in mode: zero delivery fee
  taxRate: 0.085,             // matches the "Taxes & GST (8.5%)" label on the page
  // Credit Coins system:
  //   Earn rate  : 10% of subtotal → coins  (e.g. ₹500 order  = 50 coins earned)
  //   Redeem rate: 50 coins = ₹1            (e.g. 150 coins   = ₹3 discount)
  coinEarnRate: 0.10,         // fraction of subtotal awarded as coins
  coinsPerRupee: 50,          // coins required per ₹1 of discount
};

const num = (v) => Number(v) || 0;

// appliedCoupon: { discountPercent?, discountAmount?, minOrder?, maxDiscount? }
// creditCoinsBalance: user's actual Credit Coins balance (number)
// useCreditCoins: boolean toggle from cart UI
// isMember: boolean, whether the user holds an active VIP membership
// memberDiscountPercent: percentage discount for members (default 10)
export function computeCartTotals({
  subtotal = 0,
  orderMode = "delivery",
  appliedCoupon = null,
  deliveryTip = 0,
  useCreditCoins = false,
  creditCoinsBalance = 0,
  isMember = false,
  memberDiscountPercent = 10,
  rules = CART_RULES,
}) {
  const sub = num(subtotal);

  // VIP members always get free delivery on any order
  const isFreeDelivery = isMember || sub >= rules.freeDeliveryThreshold;
  const freeDeliveryShortfall = isMember ? 0 : Math.max(0, rules.freeDeliveryThreshold - sub);

  // VIP Member Discount (10% or plan's discount percent)
  let memberDiscountAmount = 0;
  if (isMember && sub > 0) {
    const pct = num(memberDiscountPercent) || 10;
    memberDiscountAmount = Math.round((sub * pct) / 100);
  }

  let discountAmount = 0;
  if (appliedCoupon && sub >= num(appliedCoupon.minOrder)) {
    discountAmount = appliedCoupon.discountPercent
      ? (sub * num(appliedCoupon.discountPercent)) / 100
      : num(appliedCoupon.discountAmount);
    if (appliedCoupon.maxDiscount) discountAmount = Math.min(discountAmount, num(appliedCoupon.maxDiscount));
    discountAmount = Math.min(Math.round(discountAmount), sub);
  }

  // Total discounts before coins
  const totalBaseDiscount = Math.min(sub, discountAmount + memberDiscountAmount);

  // Credit Coins redemption: 50 coins = ₹1
  // discount (₹) = balance ÷ 50, capped so it never exceeds remaining payable
  const effectiveUseCoins = Boolean(useCreditCoins);
  const effectiveCoinBalance = num(creditCoinsBalance);

  const maxCoinDiscount = Math.max(0, sub - totalBaseDiscount);
  const creditCoinsDiscount = effectiveUseCoins && effectiveCoinBalance > 0
    ? Math.min(effectiveCoinBalance / rules.coinsPerRupee, maxCoinDiscount)
    : 0;

  // Whole coins that will be consumed (discount × 50, floored)
  const coinsConsumed = creditCoinsDiscount > 0
    ? Math.floor(creditCoinsDiscount * rules.coinsPerRupee)
    : 0;

  let deliveryFee = 0;
  if (sub > 0) {
    if (orderMode === "delivery") deliveryFee = isFreeDelivery ? 0 : rules.deliveryFee;
    else if (orderMode === "takeaway") deliveryFee = rules.takeawayPackagingFee;
    else deliveryFee = rules.dineInServiceCharge;
  }

  const taxable = Math.max(0, sub - totalBaseDiscount - creditCoinsDiscount);
  const taxAmount = taxable * rules.taxRate;
  const tip = orderMode === "delivery" ? num(deliveryTip) : 0;

  const grandTotal = sub > 0 ? taxable + deliveryFee + taxAmount + tip : 0;

  // Coins the user will EARN from this order (10% of subtotal, floored; 2x for VIP members!)
  const earnMultiplier = isMember ? 2 : 1;
  const creditCoinsToEarn = Math.floor(sub * rules.coinEarnRate * earnMultiplier);

  return {
    freeDeliveryThreshold: rules.freeDeliveryThreshold,
    isFreeDelivery,
    freeDeliveryShortfall,
    deliveryFee,
    discountAmount,
    memberDiscountAmount,                    // VIP Member discount in rupees
    isMember: Boolean(isMember),             // VIP membership flag
    creditCoinsDiscount,
    coinsConsumed,                           // whole coins to deduct from balance on checkout
    taxAmount,
    grandTotal,
    creditCoinsToEarn,                       // coins awarded after successful payment
  };
}