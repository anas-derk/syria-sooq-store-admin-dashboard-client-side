import addNewProductTranslations from "./add_new_product";
import categoriesTranslations from "./categories";
import galleryImagesTranslations from "./gallery_images";
import updateAndDeleteCustomizationsTranslations from "./update_and_delete_customizations";
import updateAndDeleteProductsTranslations from "./update_and_delete_products";

export default {
    ...addNewProductTranslations,
    ...categoriesTranslations,
    ...galleryImagesTranslations,
    ...updateAndDeleteCustomizationsTranslations,
    ...updateAndDeleteProductsTranslations
}