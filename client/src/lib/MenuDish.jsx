// Shared by Menu.jsx (home) and app/menu/page.jsx so both build the same dish shape.
// The dish carries everything useCartWishlist needs:
//   id, title, variantName ("Half"/"Full"), variantId, variantFinalPrice

export const rupee = (n) => `₹${Math.round(Number(n) || 0)}`;

const stripHtml = (s) => (s ? String(s).replace(/<[^>]*>?/gm, "").trim() : "");

export function mapProductToDish(p) {
    const variants = Array.isArray(p.variants) ? p.variants : [];
    const availableVariants = variants.filter((x) => x.available !== false);
    // Prefer "Full", otherwise the first available variant.
    const v = availableVariants.find((x) => x.name === "Full") || availableVariants[0] || variants[0] || null;

    const listPrice = Number(v?.price) || 0;
    const finalPrice = Number(v?.finalPrice ?? v?.price) || 0;
    const oldPrice = v && finalPrice < listPrice ? listPrice : null;

    const pic = Array.isArray(p.pic) ? p.pic[0] : p.pic;
    const desc = stripHtml(p.description) || "Freshly prepared authentic dish.";

    const mainName = p.maincategory?.name || "";
    const subName = p.subcategory?.name || "";
    const mainId = p.maincategory?._id || p.maincategory || "";
    const subId = p.subcategory?._id || p.subcategory || "";

    return {
        id: String(p._id),
        _id: String(p._id),
        title: p.name || "Untitled Dish",
        name: p.name || "Untitled Dish",
        image: pic || "/img/category/paneer-tikka.jpg",

        // cart / wishlist fields
        variantName: v?.name || null,
        variantId: v?._id ? String(v._id) : null,
        variantFinalPrice: finalPrice,
        variants: variants.map((variant) => ({
            id: variant._id ? String(variant._id) : null,
            name: variant.name,
            price: Number(variant.price) || 0,
            finalPrice: Number(variant.finalPrice ?? variant.price) || 0,
            available: variant.available !== false,
        })),
        price: finalPrice,
        oldPrice,

        mainCategory: mainName,
        mainCategoryId: String(mainId),
        subCategory: subName,
        subCategoryId: String(subId),

        rating: p.rating > 0 ? p.rating : 0,
        reviews: Array.isArray(p.reviews) ? p.reviews.length : 0,
        // Not in the Product schema: leave empty so the UI hides them instead of showing fake values.
        prepTime: p.prepTime || null,
        calories: p.calories || null,
        spiceLevel: p.spiceLevel || 0,
        isJain: Boolean(p.isJain),
        isGlutenFree: Boolean(p.isGlutenFree),
        isBestseller: Boolean(p.isBestseller),
        isChefSpecial: Boolean(p.discount > 0),

        shortDesc: desc.slice(0, 85) + (desc.length > 85 ? "..." : ""),
        fullDesc: desc,
        ingredients: p.ingredient
            ? String(p.ingredient).split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        tags: [mainName, subName].filter(Boolean),
    };
}