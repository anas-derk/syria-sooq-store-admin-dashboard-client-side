import addNewProductTranslations from "./add_new_product";
import categoriesTranslations from "./categories";
import galleryImagesTranslations from "./gallery_images";
import updateAndDeleteProductsTranslations from "./update_and_delete_products";

export default {
    ...addNewProductTranslations,
    ...categoriesTranslations,
    ...galleryImagesTranslations,
    ...updateAndDeleteProductsTranslations
}