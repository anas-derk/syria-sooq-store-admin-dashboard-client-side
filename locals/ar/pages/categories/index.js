import addNewCategoryTranslations from "./add_new_category";
import updateAndDeleteCategoriesTranslations from "./update_and_delete_categories";
import updateCategoryParentTranslations from "./update_category_parent";

export default {
    ...addNewCategoryTranslations,
    ...updateAndDeleteCategoriesTranslations,
    ...updateCategoryParentTranslations
}