import { all } from "redux-saga/effects";
import maincategorySaga from "./MaincategorySagas";
import productSaga from "./ProductSagas";
import subcategorySaga from "./SubcategorySagas";
import resturentSaga from "./ResturentSagas";
import testimonialSaga from "./TestimonialSagas";
import newsletterSaga from "./NewsletterSagas";
import contactUsSaga from "./ContactUsSagas";
import cartSaga from "./CartSagas";
import checkoutSaga from "./CheckoutSagas";
import wishlistSaga from "./WishlistSagas";
import bookingSaga from "./BookingSagas";
import bannerSagas from "./BannerSagas";
import couponSaga from "./CouponSagas";
import comboSaga from "./ComboSagas";
import thaliSaga from "./ThaliSagas";
import membershipPlanSaga from "./MembershipPlanSagas";
import membershipSaga from "./MembershipSagas";

export default function* RootSaga() {
    yield all([
        maincategorySaga(),
        productSaga(),
        subcategorySaga(),
        resturentSaga(),
        testimonialSaga(),
        newsletterSaga(),
        contactUsSaga(),
        cartSaga(),
        checkoutSaga(),
        wishlistSaga(),
        bookingSaga(),
        bannerSagas(),
        couponSaga(),
        comboSaga(),
        thaliSaga(),
        membershipPlanSaga(),
        membershipSaga()
    ])
}