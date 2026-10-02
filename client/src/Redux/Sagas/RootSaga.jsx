import { all } from "redux-saga/effects";
import maincategorySaga from "./MaincategorySagas";
import productSaga from "./ProductSagas";
import subcategorySaga from "./SubcategorySagas";
import testimonialSaga from "./TestimonialSagas";
import newsletterSaga from "./NewsletterSagas";
import contactUsSaga from "./ContactUsSagas";
import cartSaga from "./CartSagas";
import checkoutSaga from "./CheckoutSagas";
import wishlistSaga from "./WishlistSagas";
import bookingSaga from "./BookingSagas";
import bannerSagas from "./BannerSagas";
import comboSaga from "./ComboSagas";
import couponSaga from "./CouponSagas";
import thaliSagas from "./ThaliSagas";

export default function* RootSaga() {
    yield all([
        maincategorySaga(),
        productSaga(),
        subcategorySaga(),
        testimonialSaga(),
        newsletterSaga(),
        contactUsSaga(),
        cartSaga(),
        checkoutSaga(),
        wishlistSaga(),
        bookingSaga(),
        bannerSagas(),
        comboSaga(),
        couponSaga(),
        thaliSagas()
    ])
}