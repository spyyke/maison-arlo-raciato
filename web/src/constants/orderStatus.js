export const ORDER_STATUSES = {
    PENDING: 'pending',
    PAID: 'paid',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

export const ORDER_STATUS_LABELS = {
    [ORDER_STATUSES.PENDING]: 'Pending',
    [ORDER_STATUSES.PAID]: 'Paid',
    [ORDER_STATUSES.SHIPPED]: 'Shipped',
    [ORDER_STATUSES.DELIVERED]: 'Delivered',
    [ORDER_STATUSES.CANCELLED]: 'Cancelled'
};

export const STATUS_COLORS = {
    [ORDER_STATUSES.PAID]: '#2ecc71',
    [ORDER_STATUSES.PENDING]: '#f1c40f',
    [ORDER_STATUSES.SHIPPED]: '#3498db',
    [ORDER_STATUSES.DELIVERED]: '#9b59b6',
    [ORDER_STATUSES.CANCELLED]: '#e74c3c'
};
