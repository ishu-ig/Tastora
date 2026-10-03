"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { getCart, createCart, updateCart, deleteCart } from "@/Redux/ActionCreators/CartActionCreators";
import { getWishlist, createWishlist, deleteWishlist } from "@/Redux/ActionCreators/WishlistActionCreators";
import { UPDATE_CART_RED, DELETE_CART_RED } from "@/Redux/Constant";
import { useAuth } from "@/context/AuthContext";

const idOf = (v) => String(v?._id || v || "");
const dishIdOf = (d) => String(d?.id || d?._id || d?.product?._id || "");
const variantOf = (d) => d?.variantName || "Full";
const keyOf = (productId, variant) => `${productId}|${variant}`;
const getUid = () => {
    if (typeof window === "undefined") return null;
    const storedId = localStorage.getItem("userid");
    if (storedId) return storedId;
    const match = document.cookie.match(/(?:^|;\s*)userid=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
};
const looksLikeMongoId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || ""));

export default function useCartWishlist() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { user: authUser, loading: authLoading, openAuthModal } = useAuth() || {};
    const authUserId = authUser?._id || null;

    const CartStateData = useSelector((s) => s.CartStateData);
    const WishlistStateData = useSelector((s) => s.WishlistStateData);
    const cart = Array.isArray(CartStateData) ? CartStateData : [];
    const wishlist = Array.isArray(WishlistStateData) ? WishlistStateData : [];

    const [userId, setUserId] = useState(null);
    const [wishlistLoaded, setWishlistLoaded] = useState(false);
    const initialWishlistState = useRef(WishlistStateData);
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    // Items added but not yet confirmed by the server. They make the cart bar and the
    // card stepper react instantly, and are dropped as soon as the real cart line shows
    // up (or after 6s if the request failed) so counts can never drift.
    const [pending, setPending] = useState([]);

    // Drives the "added to cart" popup.
    const [addedPopup, setAddedPopup] = useState(null);

    useEffect(() => {
        if (authLoading) return;
        const currentUserId = authUserId || getUid();
        setUserId(currentUserId);
        dispatch(getCart(currentUserId));
        dispatch(getWishlist(currentUserId));
    }, [dispatch, authLoading, authUserId]);

    useEffect(() => () => clearTimeout(toastTimer.current), []);

    useEffect(() => {
        if (WishlistStateData !== initialWishlistState.current) setWishlistLoaded(true);
    }, [WishlistStateData]);

    const showToast = useCallback((msg) => {
        setToast(msg);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 2500);
    }, []);

    const currentUid = userId || authUserId || getUid();

    // Only this user's cart lines
    const mine = useMemo(
        () => (currentUid ? cart.filter((x) => idOf(x.user) === String(currentUid)) : []),
        [cart, currentUid]
    );

    const wishlistItems = useMemo(
        () => (currentUid ? wishlist.filter((x) => idOf(x.user) === String(currentUid)) : []),
        [wishlist, currentUid]
    );

    const cartKeys = useMemo(
        () => new Set(mine.map((x) => keyOf(idOf(x.product), String(x.variant)))),
        [mine]
    );

    // Drop pending entries once the server line exists
    useEffect(() => {
        setPending((p) => (p.some((x) => cartKeys.has(x.key)) ? p.filter((x) => !cartKeys.has(x.key)) : p));
    }, [cartKeys]);

    const findLine = useCallback(
        (dish) => {
            if (!currentUid || !dish) return null;
            const pid = dishIdOf(dish);
            return (
                mine.find(
                    (x) =>
                        (idOf(x.product) === pid || idOf(x.product?._id) === pid) &&
                        (!dish.variantName || String(x.variant) === String(dish.variantName))
                ) || null
            );
        },
        [mine, currentUid]
    );

    const findPending = useCallback(
        (dish) => {
            if (!dish) return null;
            const k = keyOf(dishIdOf(dish), variantOf(dish));
            return pending.find((x) => x.key === k) || null;
        },
        [pending]
    );

    const isInCart = useCallback((dish) => !!findLine(dish) || !!findPending(dish), [findLine, findPending]);

    // Quantity to show on a card: real line qty, or 1 while the add is in flight.
    const getQty = useCallback(
        (dish) => {
            const line = findLine(dish);
            if (line) return Number(line.qty) || 0;
            return findPending(dish)?.qty || 0;
        },
        [findLine, findPending]
    );

    const isInWishlist = useCallback(
        (dish) => {
            if (!currentUid || !dish) return false;
            const pid = dishIdOf(dish);
            return wishlist.some(
                (x) => idOf(x.product) === pid && idOf(x.user) === String(currentUid)
            );
        },
        [wishlist, currentUid]
    );

    const addToCart = useCallback(
        (dish, qty = 1) => {
            const uid = authUserId || getUid();
            if (!uid) { if (openAuthModal) openAuthModal("login"); return; }
            if (!dish) return;

            const variant = variantOf(dish);
            const productId = dishIdOf(dish);

            if (findLine(dish)) return router.push("/cart");
            if (findPending(dish)) return; // ignore double taps while the add is in flight

            if (!looksLikeMongoId(productId)) {
                showToast("This item is not connected to a valid product record yet.");
                return;
            }

            const unitPrice = Number(dish.variantFinalPrice ?? dish.price ?? 0);
            const key = keyOf(productId, variant);

            setPending((p) => [...p, { key, qty, total: unitPrice * qty }]);

            dispatch(
                createCart({
                    user: uid,
                    product: productId,
                    productName: dish.name || dish.title || "",
                    variant, // "Half" | "Full"
                    qty,
                    total: unitPrice * qty, // server recalculates anyway
                })
            );
            setTimeout(() => {
                setAddedPopup({ dish, id: Date.now() });
            }, 250);
        },
        [dispatch, router, findLine, findPending, showToast, authUserId]
    );

    // +1 / -1 on an item that is already in the cart. Going below 1 removes it.
    const updateQty = useCallback(
        (dish, delta) => {
            if (!Number.isFinite(delta)) return;

            const line = findLine(dish);
            if (!line) {
                const pendingLine = findPending(dish);
                if (!pendingLine) return;

                const next = (Number(pendingLine.qty) || 0) + delta;
                if (next === Number(pendingLine.qty) || next < 1) {
                    if (next < 1) setPending((p) => p.filter((x) => x.key !== pendingLine.key));
                    return;
                }

                const unitPrice = Number(dish?.variantFinalPrice ?? dish?.price ?? 0);
                setPending((p) =>
                    p.map((x) => (x.key === pendingLine.key ? { ...x, qty: next, total: unitPrice * next } : x))
                );
                return;
            }

            const currentQty = Number(line.qty) || 0;
            const next = currentQty + delta;
            if (next === currentQty) return;

            if (next < 1) {
                dispatch({ type: DELETE_CART_RED, payload: { _id: line._id } }); // instant UI
                dispatch(deleteCart({ _id: line._id }));
                return;
            }

            const p = line.product && typeof line.product === "object" ? line.product : null;
            const v = p?.variants?.find((q) => q.name === line.variant);
            let unit = v?.finalPrice ?? v?.price;
            if (typeof unit !== "number") {
                unit = line.qty ? Number(line.total) / Number(line.qty) : Number(dish?.variantFinalPrice ?? dish?.price ?? 0);
            }
            const total = unit * next;

            dispatch({ type: UPDATE_CART_RED, payload: { _id: line._id, qty: next, total } }); // instant UI
            dispatch(updateCart({ _id: line._id, qty: next, total })); // saves + replaces with the server copy
        },
        [dispatch, findLine, findPending]
    );

    const addToWishlist = useCallback(
        (dish) => {
            const uid = authUserId || getUid();
            if (!uid) { if (openAuthModal) openAuthModal("login"); return; }
            if (!dish) return;

            const productId = dishIdOf(dish);
            if (!productId) return;

            const existing = wishlist.find(
                (x) => idOf(x.product) === productId && idOf(x.user) === String(uid)
            );

            if (existing) {
                dispatch(deleteWishlist({ _id: existing._id }));
                showToast(`Removed "${dish.title || dish.name || "Item"}" from wishlist`);
            } else {
                dispatch(createWishlist({ user: uid, product: productId }));
                showToast(`Saved "${dish.title || dish.name || "Item"}" to wishlist`);
            }
        },
        [dispatch, router, wishlist, showToast, authUserId]
    );


    const removeFromWishlist = useCallback(
        (dish) => {
            if (!dish) return;
            const productId = dishIdOf(dish);
            const existing = wishlistItems.find((item) => idOf(item.product) === productId);
            if (existing) dispatch(deleteWishlist({ _id: existing._id }));
        },
        [dispatch, wishlistItems]
    );

    const clearWishlist = useCallback(() => {
        wishlistItems.forEach((item) => dispatch(deleteWishlist({ _id: item._id })));
    }, [dispatch, wishlistItems]);

    const closeAddedPopup = useCallback(() => setAddedPopup(null), []);

    const clearCart = useCallback(() => {
        setPending([]);
        mine.forEach((line) => {
            dispatch({ type: DELETE_CART_RED, payload: { _id: line._id } });
            dispatch(deleteCart({ _id: line._id }));
        });
    }, [dispatch, mine]);

    const { cartCount, cartTotal } = useMemo(() => {
        const waiting = pending.filter((x) => !cartKeys.has(x.key));
        return {
            cartCount:
                mine.reduce((s, x) => s + (Number(x.qty) || 0), 0) +
                waiting.reduce((s, x) => s + x.qty, 0),
            cartTotal:
                mine.reduce((s, x) => s + (Number(x.total) || 0), 0) +
                waiting.reduce((s, x) => s + x.total, 0),
        };
    }, [mine, pending, cartKeys]);

    return {
        addToCart,
        updateQty,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        toggleWishlist: addToWishlist,
        wishlistItems,
        wishlistLoaded,
        isInCart,
        isInWishlist,
        getQty,
        addedPopup,
        closeAddedPopup,
        clearCart,
        toast,
        cartCount,
        cartTotal,
    };
}