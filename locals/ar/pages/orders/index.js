import billingTranslations from "./billing";
import orderDetailsTranslations from "./order_details";
import updateAndDeleteOrdersTranslations from "./update_and_delete_orders";

export default {
    ...billingTranslations,
    ...orderDetailsTranslations,
    ...updateAndDeleteOrdersTranslations
}