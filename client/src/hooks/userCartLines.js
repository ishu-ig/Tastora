"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCart, updateCart, deleteCart } from "@/Redux/ActionCreators/CartActionCreators";
import { UPDATE_CART_RED, DELETE_CART_RED } from "@/Redux/Constant";
import { useAuth } from "@/context/AuthContext";

const idOf = (v) => String(v?._id || v || "");
const getUserId = () => {
    const storedId = localStorage.getItem("userid");
    if (storedId) return storedId;
    const match = document.cookie.match(/(?:^|;\s*)userid=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
};

// Redux-backed cart for the /cart page. Everything is read from CartStateData
// (the same store the menu writes to), so quantity changes stay in sync everywhere.
// cartItems is keyed by the CART LINE _id (one line per product + variant):
//   { "<lineId>": qty }
export default function useCartLines() {
    const dispatch = useDispatch();
    const { user: authUser, loading: authLoading } = useAuth() || {};
    const authUserId = authUser?._id || null;
    const CartStateData = useSelector((s) => s.CartStateData);
    const cart = Array.isArray(CartStateData) ? CartStateData : [];

    const [userId, setUserId] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const firstState = useRef(CartStateData);

    useEffect(() => {
        if (authLoading) return;
        const currentUserId = authUserId || getUserId();
        setUserId(currentUserId);
        dispatch(getCart(currentUserId));
        // If the request fails nothing arrives, so stop showing "loading" after a while.
        const t = setTimeout(() => setLoaded(true), 4000);
        return () => clearTimeout(t);
    }, [dispatch, authLoading, authUserId]);

    // GET_CART_RED always replaces the array, so a new reference = the cart has loaded.
    useEffect(() => {
        if (CartStateData !== firstState.current) setLoaded(true);
    }, [CartStateData]);

    const lines = useMemo(
        () =>
            cart
                .filter((x) => userId && idOf(x.user) === String(userId))
                .map((x) => {
                    const p = x.product && typeof x.product === "object" ? x.product : {};
                    const variants = Array.isArray(p.variants) ? p.variants : [];
                    const v = variants.find((q) => q.name === x.variant);
                    const qty = Number(x.qty) || 0;
                    const total = Number(x.total) || 0;
                    const unit = v ? (v.finalPrice ?? v.price) : qty ? total / qty : 0;
                    const oldPrice = v && v.finalPrice < v.price ? v.price : null;
                    const pic = Array.isArray(p.pic) ? p.pic[0] : (p.pic || p.image);
                    const catName = typeof p.maincategory === "object" ? p.maincategory?.name : p.maincategory;
                    const productName = p.name || x.productName || x.name || x.title || "";

                    return {
                        lineId: x._id,
                        qty,
                        total,
                        unit,
                        dish: {
                            id: x._id,
                            productId: idOf(p) || idOf(x.product),
                            title: productName ? (x.variant && x.variant !== "Full" ? `${productName} (${x.variant})` : productName) : "Item name unavailable",
                            price: unit,
                            oldPrice,
                            image: pic || "/img/category/paneer-tikka.jpg",
                            subCategory: catName || "Pure Veg",
                            shortDesc: `${x.variant || "Full"} portion`,
                            isChefSpecial: Boolean(p.discount > 0),
                        },
                    };
                }),
        [cart, userId]
    );

    const cartItems = useMemo(() => Object.fromEntries(lines.map((l) => [l.lineId, l.qty])), [lines]);
    const dishById = useMemo(() => Object.fromEntries(lines.map((l) => [l.lineId, l.dish])), [lines]);
    const totalCartCount = lines.reduce((s, l) => s + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.total, 0);

    const removeFromCart = useCallback(
        (lineId) => {
            dispatch({ type: DELETE_CART_RED, payload: { _id: lineId } }); // instant UI
            dispatch(deleteCart({ _id: lineId })); // then the database
        },
        [dispatch]
    );

    const clearCart = useCallback(() => lines.forEach((l) => removeFromCart(l.lineId)), [lines, removeFromCart]);

    // (lineId, delta) — a 3rd `dish` argument (the page and MenuCard pass one) is ignored.
    const updateQuantity = useCallback(
        (lineId, delta) => {
            const line = lines.find((l) => l.lineId === lineId);
            if (!line) return;
            const next = line.qty + delta;
            if (next < 1) return removeFromCart(lineId);
            const total = line.unit * next;
            dispatch({ type: UPDATE_CART_RED, payload: { _id: lineId, qty: next, total } }); // instant UI
            dispatch(updateCart({ _id: lineId, qty: next, total })); // saves; server copy replaces it
        },
        [dispatch, lines, removeFromCart]
    );

    return { cartItems, dishById, lines, loaded, totalCartCount, subtotal, updateQuantity, removeFromCart, clearCart };
}