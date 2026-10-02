import { combineReducers } from "@reduxjs/toolkit";
import MaincategoryReducer from "./MaincategoryReducer";
import SubcategoryReducer from "./SubcategoryReducer";
import ProductReducer from "./ProductReducer";
import ResturentReducer from "./ResturentReducer";
import TestimonialReducer from "./TestimonialReducer";
import NewsletterReducer from "./NewsletterReducer";
import ContactUsReducer from "./ContactUsReducer";
import WishlistReducer from "./WishlistReducer";
import CartReducer from "./CartReducer";
import CheckoutReducer from "./CheckoutReducer";
import BookingReducer from "./BookingReducer";
import BannerReducer from "./BannerReducer";
import CouponReducer from "./CouponReducer";
import ComboReducer from "./ComboReducer";
import ThaliReducer from "./ThaliReducer";
import MembershipPlanReducer from "./MembershipPlanReducer";
import MembershipReducer from "./MembershipReducer";

export default combineReducers({
    MaincategoryStateData: MaincategoryReducer,
    SubcategoryStateData: SubcategoryReducer,
    ProductStateData: ProductReducer,
    ResturentStateData: ResturentReducer,
    TestimonialStateData: TestimonialReducer,
    NewsletterStateData: NewsletterReducer,
    ContactUsStateData: ContactUsReducer,
    WishlistStateData: WishlistReducer,
    CartStateData: CartReducer,
    CheckoutStateData: CheckoutReducer,
    BookingStateData: BookingReducer,
    BannerStateData: BannerReducer,
    CouponStateData: CouponReducer,
    ComboStateData: ComboReducer,
    ThaliStateData: ThaliReducer,
    MembershipPlanStateData: MembershipPlanReducer,
    MembershipStateData: MembershipReducer,
})