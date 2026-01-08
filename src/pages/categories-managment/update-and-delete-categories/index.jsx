import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import PaginationBar from "@/components/PaginationBar";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo, getAllCategoriesInsideThePage, handleSelectUserLanguage } from "../../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";
import TableLoader from "@/components/TableLoader";
import Link from "next/link";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";
import { useTranslation } from "react-i18next";

export default function UpdateAndDeleteCategories() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [isGetCategories, setIsGetCategories] = useState(false);

    const [allCategoriesInsideThePage, setAllCategoriesInsideThePage] = useState([]);

    const [waitMsg, setWaitMsg] = useState("");

    const [selectedCateogryImageIndex, setSelectedCategoryImageIndex] = useState(-1);

    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);

    const [waitChangeCategoryImageMsg, setWaitChangeCategoryImageMsg] = useState("");

    const [errorChangeCategoryImageMsg, setErrorChangeCategoryImageMsg] = useState("");

    const [successChangeCategoryImageMsg, setSuccessChangeCategoryImageMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsgOnGetCategoriesData, setErrorMsgOnGetCategoriesData] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        storeId: "",
        name: ""
    });

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

    const { t, i18n } = useTranslation();

    const pageSize = 10;

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.adminDashboardlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : process.env.defaultLanguage, i18n.changeLanguage);
    }, []);

    useEffect(() => {
        const adminToken = localStorage.getItem(process.env.adminTokenNameInLocalStorage);
        if (adminToken) {
            getAdminInfo()
                .then(async (result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.replace("/login");
                    } else {
                        const adminDetails = result.data;
                        if (adminDetails.isBlocked) {
                            localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                            await router.replace("/login");
                        }
                        else {
                            setAdminInfo(adminDetails);
                            const tempFilters = { storeId: adminDetails.storeId };
                            setFilters(tempFilters);
                            result = (await getAllCategoriesInsideThePage(1, pageSize, getFiltersAsQuery(tempFilters))).data;
                            setAllCategoriesInsideThePage(result.categories);
                            setTotalPagesCount(Math.ceil(result.categoriesCount / pageSize));
                            setIsLoadingPage(false);
                        }
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.replace("/login");
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        } else router.replace("/login");
    }, []);

    const getFiltersAsQuery = (filters) => {
        let filteringString = "";
        if (filters.storeId) filteringString += `storeId=${filters.storeId}&`;
        if (filters.name) filteringString += `name=${filters.name}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const getPreviousPage = async () => {
        try {
            setIsGetCategories(true);
            setErrorMsgOnGetCategoriesData("");
            const newCurrentPage = currentPage - 1;
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSize, getFiltersAsQuery(filters))).data.categories);
            setCurrentPage(newCurrentPage);
            setIsGetCategories(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetCategoriesData(err?.message === "Network Error" ? "Network Error When Get Categories Data" : "Sorry, Something Went Wrong When Get Categories Data, Please Repeat The Process !!");
            }
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetCategories(true);
            setErrorMsgOnGetCategoriesData("");
            const newCurrentPage = currentPage + 1;
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSize, getFiltersAsQuery(filters))).data.categories);
            setCurrentPage(newCurrentPage);
            setIsGetCategories(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetCategoriesData(err?.message === "Network Error" ? "Network Error When Get Categories Data" : "Sorry, Something Went Wrong When Get Categories Data, Please Repeat The Process !!");
            }
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetCategories(true);
            setErrorMsgOnGetCategoriesData("");
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(pageNumber, pageSize, getFiltersAsQuery(filters))).data.categories);
            setCurrentPage(pageNumber);
            setIsGetCategories(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetCategoriesData(err?.message === "Network Error" ? "Network Error When Get Categories Data" : "Sorry, Something Went Wrong When Get Categories Data, Please Repeat The Process !!");
            }
        }
    }

    const changeCategoryInfo = (categoryIndex, fieldName, newValue) => {
        setSelectedCategoryImageIndex(-1);
        setSelectedCategoryIndex(-1);
        let categoriesTemp = allCategoriesInsideThePage;
        categoriesTemp[categoryIndex][fieldName] = newValue;
        setAllCategoriesInsideThePage(categoriesTemp);
    }

    const changeCateogryImage = async (categoryIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "image",
                    value: allCategoriesInsideThePage[categoryIndex].image,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isImage: {
                            msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Or WEBP Image File !!",
                        },
                    },
                },
            ]);
            setSelectedCategoryImageIndex(categoryIndex);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitChangeCategoryImageMsg("Please Wait To Change Image ...");
                let formData = new FormData();
                formData.append("categoryImage", allCategoriesInsideThePage[categoryIndex].image);
                const result = (await axios.put(`${process.env.BASE_API_URL}/categories/change-category-image/${allCategoriesInsideThePage[categoryIndex]._id}?language=${process.env.defaultLanguage}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                if (!result.error) {
                    setWaitChangeCategoryImageMsg("");
                    setSuccessChangeCategoryImageMsg("Change Image Successfull !!");
                    let successTimeout = setTimeout(async () => {
                        setSuccessChangeCategoryImageMsg("");
                        setSelectedCategoryImageIndex(-1);
                        setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(currentPage, pageSize)).data.categories);
                        clearTimeout(successTimeout);
                    }, 1500);
                }
                else {
                    setWaitChangeCategoryImageMsg("");
                    setErrorChangeCategoryImageMsg("Sorry, Something Went Wrong, Please Repeat The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorChangeCategoryImageMsg("");
                        setSelectedCategoryImageIndex(-1);
                        clearTimeout(errorTimeout);
                    }, 1500);
                }
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setWaitChangeCategoryImageMsg("");
                setErrorChangeCategoryImageMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Repeat The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorChangeCategoryImageMsg("");
                    setSelectedCategoryImageIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const filterCategories = async (filters) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([]);
            if (Object.keys(errorsObject).length == 0) {
                setIsGetCategories(true);
                setCurrentPage(1);
                const result = (await getAllCategoriesInsideThePage(1, pageSize, getFiltersAsQuery(filters))).data;
                setAllCategoriesInsideThePage(result.categories);
                setTotalPagesCount(Math.ceil(result.categoriesCount / pageSize));
                setIsGetCategories(false);
            }
        }
        catch (err) {
            console.log(err);
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsGetCategories(false);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Repeat The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const updateCategory = async (categoryIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "categoryName",
                    value: allCategoriesInsideThePage[categoryIndex].name,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "categoryColor",
                    value: allCategoriesInsideThePage[categoryIndex].color,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedCategoryIndex(categoryIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/categories/${allCategoriesInsideThePage[categoryIndex]._id}?language=${process.env.defaultLanguage}`, {
                    name: allCategoriesInsideThePage[categoryIndex].name,
                    color: allCategoriesInsideThePage[categoryIndex].color,
                    parent: allCategoriesInsideThePage[categoryIndex].parent?._id ? allCategoriesInsideThePage[categoryIndex].parent?._id : null,
                }, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg("Updating Successfull !!");
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setSelectedCategoryIndex(-1);
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg("Sorry, Something Went Wrong, Please Repeat The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setSelectedCategoryIndex(-1);
                        clearTimeout(errorTimeout);
                    }, 1500);
                }
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setWaitMsg("");
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Repeat The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedCategoryIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteCategory = async (categoryIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedCategoryIndex(categoryIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/categories/${allCategoriesInsideThePage[categoryIndex]._id}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedCategoryIndex(-1);
                    setAllCategoriesInsideThePage(allCategoriesInsideThePage.filter((category, index) => index !== categoryIndex));
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg("Sorry, Something Went Wrong, Please Repeat The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedCategoryIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setWaitMsg("");
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Repeat The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedCategoryIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="update-and-delete-categories admin-dashboard">
            <Head>
                <title>{process.env.storeName} {t("Admin Dashboard")} - {t("Update / Delete Categories")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        {t("Hi, Mr")} {adminInfo.fullName} {t("In Your Update / Delete Categories Page")}
                    </h1>
                    <section className="filters mb-3 bg-white border-3 border-info p-3 text-start w-100">
                        <h5 className="section-name fw-bold text-center">{t("Filters")}: </h5>
                        <hr />
                        <div className="row mb-4">
                            <div className="col-md-12">
                                <h6 className={`fw-bold text-center ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}>{t("Name")}</h6>
                                <input
                                    type="text"
                                    className={`form-control p-2 border-2 category-name-field ${formValidationErrors["categoryName"] ? "border-danger mb-3" : ""}`}
                                    placeholder={t("Please Enter Category Name")}
                                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                                />
                                {formValidationErrors["categoryName"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["categoryName"])} />}
                            </div>
                        </div>
                        {!isGetCategories && <button
                            className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                            onClick={async () => await filterCategories(filters)}
                        >
                            {t("Filter")}
                        </button>}
                        {isGetCategories && <button
                            className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                            disabled
                        >
                            {t("Filtering")} ...
                        </button>}
                    </section>
                    {allCategoriesInsideThePage.length > 0 && !isGetCategories && <section className="categories-box w-100">
                        <table className="users-table mb-4 managment-table bg-white w-100">
                            <thead>
                                <tr>
                                    <th>{t("Name")}</th>
                                    <th>{t("Color")}</th>
                                    <th>{t("Parent")}</th>
                                    <th>{t("Image")}</th>
                                    <th>{t("Processes")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allCategoriesInsideThePage.map((category, categoryIndex) => (
                                    <tr key={category._id}>
                                        <td className="category-name-cell">
                                            <section className="category-name mb-4">
                                                <input
                                                    type="text"
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-title-field ${formValidationErrors["categoryName"] && categoryIndex === selectedCategoryIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    placeholder={t("Please Enter New Name")}
                                                    defaultValue={category.name}
                                                    onChange={(e) => changeCategoryInfo(categoryIndex, "name", e.target.value.trim())}
                                                />
                                                {formValidationErrors["categoryName"] && categoryIndex === selectedCategoryIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["categoryName"])} />}
                                            </section>
                                        </td>
                                        <td className="category-color-cell">
                                            <section className="category-color mb-4">
                                                <input
                                                    type="color"
                                                    className={`form-control d-block mx-auto p-2 border-2 -category-color-field ${formValidationErrors["categoryColor"] && categoryIndex === selectedCategoryIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    defaultValue={category.color}
                                                    onChange={(e) => changeCategoryInfo(categoryIndex, "color", e.target.value.trim())}
                                                />
                                                {formValidationErrors["categoryColor"] && categoryIndex === selectedCategoryIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["categoryColor"])} />}
                                            </section>
                                        </td>
                                        <td className="category-parent-cell">
                                            {category.parent?._id ? <h6 className="bg-info p-2 fw-bold mb-4">{category.parent.name}</h6> : <h6 className="bg-danger p-2 mb-4 text-white">{t("No Parent")}</h6>}
                                        </td>
                                        <td className="category-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${category.imagePath}`}
                                                alt={`${category.name} Category Image !!`}
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                            <section className="category-image mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control d-block mx-auto p-2 border-2 category-image-field ${formValidationErrors["image"] && categoryIndex === selectedCateogryImageIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeCategoryInfo(categoryIndex, "image", e.target.files[0])}
                                                    accept=".png, .jpg, .webp"
                                                />
                                                {formValidationErrors["image"] && categoryIndex === selectedCategoryIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["image"])} />}
                                            </section>
                                            {(selectedCateogryImageIndex !== categoryIndex && selectedCategoryIndex !== categoryIndex) &&
                                                <button
                                                    className="btn btn-success d-block mb-3 w-50 mx-auto global-button"
                                                    onClick={() => changeCateogryImage(categoryIndex)}
                                                >{t("Change")}</button>
                                            }
                                            {waitChangeCategoryImageMsg && selectedCateogryImageIndex === categoryIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{t(waitChangeCategoryImageMsg)}</button>}
                                            {successChangeCategoryImageMsg && selectedCateogryImageIndex === categoryIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{t(successChangeCategoryImageMsg)}</button>}
                                            {errorChangeCategoryImageMsg && selectedCateogryImageIndex === categoryIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{t(errorChangeCategoryImageMsg)}</button>}
                                        </td>
                                        <td className="update-cell">
                                            {selectedCategoryIndex !== categoryIndex && <>
                                                <button
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                    onClick={() => updateCategory(categoryIndex)}
                                                >{t("Update")}</button>
                                                <hr />
                                                <Link
                                                    href={`/categories-managment/update-category-parent/${category._id}`}
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                >{t("Change Parent")}</Link>
                                                <hr />
                                                <button
                                                    className="btn btn-danger global-button"
                                                    onClick={() => deleteCategory(categoryIndex)}
                                                >{t("Delete")}</button>
                                            </>}
                                            {waitMsg && selectedCategoryIndex === categoryIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{t(waitMsg)}</button>}
                                            {successMsg && selectedCategoryIndex === categoryIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{t(successMsg)}</button>}
                                            {errorMsg && selectedCategoryIndex === categoryIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{t(errorMsg)}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>}
                    {allCategoriesInsideThePage.length === 0 && !isGetCategories && <NotFoundError errorMsg={t("Sorry, Can't Find Any Categories")} />}
                    {isGetCategories && <TableLoader />}
                    {errorMsgOnGetCategoriesData && <NotFoundError errorMsg={t(errorMsgOnGetCategoriesData)} />}
                    {totalPagesCount > 1 && !isGetCategories &&
                        <PaginationBar
                            totalPagesCount={totalPagesCount}
                            currentPage={currentPage}
                            getPreviousPage={getPreviousPage}
                            getNextPage={getNextPage}
                            getSpecificPage={getSpecificPage}
                        />
                    }
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}