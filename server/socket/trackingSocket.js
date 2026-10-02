function getOrderState() {
    return null;
}

function broadcastNewOrder(io, order) {
    if (!io || !order?.orderId) return;
    io.emit("newOrderRequest", order);
}

module.exports = { getOrderState, broadcastNewOrder };