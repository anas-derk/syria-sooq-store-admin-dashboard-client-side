import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo, getAllCategoriesInsideThePage, handleSelectUserLanguage } from "../../../../public/global_functions/popular";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";
import { useTranslation } from "react-i18next";

export default function AddNewCategory() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [searchedCategories, setSearchedCategories] = useState([]);

    const [categoryName, setCategoryName] = useState("");

    const [categoryColor, setCategoryColor] = useState("");

    const [categoryImage, setCategoryImage] = useState("");

    const [selectedCategoryParent, setSelectedCategoryParent] = useState("");

    const [waitMsg, setWaitMsg] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [filters, setFilters] = useState({
        name: "",
    });

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const fileElementRef = useRef();

    const router = useRouter();

    const { t, i18n } = useTranslation();

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
                        } else {
                            setAdminInfo(adminDetails);
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

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.name) filteringString += `name=${filters.name}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const handleSearchOfCategoryParent = async (e) => {
        try {
            setWaitMsg("Please Waiting To Get Categories ...");
            const searchedCategoryName = e.target.value;
            let tempFilters = { storeId: filters.storeId, name: searchedCategoryName };
            setFilters(tempFilters);
            if (searchedCategoryName) {
                setSearchedCategories((await getAllCategoriesInsideThePage(1, 1000, getFilteringString(tempFilters))).data.categories);
            } else {
                setSearchedCategories([]);
            }
            setWaitMsg("");
        }
        catch (err) {
            setWaitMsg("");
            setErrorMsg(err?.message === "Network Error" ? "Network Error On Search !!" : "Sorry, Someting Went Wrong, Please Repeate The Search !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const handleSelectCategoryParent = (categoryParent) => {
        setSelectedCategoryParent(categoryParent ? categoryParent : { name: "No Parent", _id: "" });
    }

    const addNewCategory = async (e) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "categoryName",
                    value: categoryName,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "categoryParent",
                    value: selectedCategoryParent,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "categoryColor",
                    value: categoryColor,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "categoryImage",
                    value: categoryImage,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isImage: {
                            msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Or Webp Image File !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Waiting To Add New Category ...");
                let formData = new FormData();
                formData.append("categoryImg", categoryImage);
                formData.append("name", categoryName);
                formData.append("parent", selectedCategoryParent._id);
                formData.append("color", categoryColor);
                const result = (await axios.post(`${process.env.BASE_API_URL}/categories/add-new-category?language=${process.env.defaultLanguage}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setCategoryName("");
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg(result.msg);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setCategoryName("");
                        setCategoryColor("");
                        fileElementRef.current.value = "";
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
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="add-new-cateogry admin-dashboard">
            <Head>
                <title>{process.env.storeName} {t("Admin Dashboard")} - {t("Add New Category")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        {t("Hi, Mr")} {adminInfo.fullName} {t("In Your Add New Category Page")}
                    </h1>
                    <form className="add-new-category-form admin-dashbboard-form" onSubmit={addNewCategory}>
                        <section className="category-name mb-4">
                            <input
                                type="text"
                                className={`form-control p-2 border-2 category-name-field ${formValidationErrors["categoryName"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder={t("Please Enter Category Name")}
                                onChange={(e) => setCategoryName(e.target.value)}
                                value={categoryName}
                            />
                            {formValidationErrors["categoryName"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["categoryName"])} />}
                        </section>
                        <section className="category-color mb-4">
                            <h6 className="fw-bold mb-3">{t("Please Select Category Color")}</h6>
                            <input
                                type="color"
                                className={`form-control p-2 border-2 category-color-field ${formValidationErrors["categoryColor"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder={t("Please Select Category Color")}
                                onChange={(e) => setCategoryColor(e.target.value)}
                                value={categoryColor}
                            />
                            {formValidationErrors["categoryColor"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["categoryColor"])} />}
                        </section>
                        <section className="category-parent mb-4">
                            <h6 className="fw-bold mb-3">{t("Please Select Category Parent")}</h6>
                            {selectedCategoryParent.name && <h6 className="bg-secondary p-3 mb-4 text-white border border-2 border-dark">Category Parent: {selectedCategoryParent.name}</h6>}
                            <div className="select-category-box select-box mb-4">
                                <input
                                    type="text"
                                    className="search-box form-control p-2 border-2 mb-4"
                                    placeholder={t("Please Enter Category Parent Name Or Part Of This")}
                                    onChange={handleSearchOfCategoryParent}
                                />
                                <ul className={`categories-list options-list bg-white border ${formValidationErrors["categoryParent"] ? "border-danger mb-4" : "border-dark"}`}>
                                    <li onClick={() => handleSelectCategoryParent("")}>{t("No Parent")}</li>
                                    {searchedCategories.length > 0 && searchedCategories.map((category) => (
                                        <li key={category._id} onClick={() => handleSelectCategoryParent(category)}>{category.name}</li>
                                    ))
                                    }
                                </ul>
                                {searchedCategories.length === 0 && filters.name && <p className="alert alert-danger mt-4">{t("Sorry, Can't Find Any Category Parent Match This Name")}</p>}
                                {formValidationErrors["categoryParent"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["categoryParent"])} />}
                            </div>
                        </section>
                        <section className="category-image mb-4">
                            <input
                                type="file"
                                className={`form-control p-2 border-2 category-image-field ${formValidationErrors["categoryImage"] ? "border-danger mb-3" : "mb-4"}`}
                                onChange={(e) => setCategoryImage(e.target.files[0])}
                                ref={fileElementRef}
                                value={fileElementRef.current?.value}
                                accept=".png, .jpg, .webp"
                            />
                            {formValidationErrors["categoryImage"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["categoryImage"])} />}
                        </section>
                        {!waitMsg && !successMsg && !errorMsg && <button
                            type="submit"
                            className="btn btn-success w-50 d-block mx-auto p-2 global-button"
                        >
                            {t("Add Now")}
                        </button>}
                        {waitMsg && <button
                            type="button"
                            className="btn btn-danger w-50 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {t(waitMsg)}
                        </button>}
                        {errorMsg && <button
                            type="button"
                            className="btn btn-danger w-50 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {t(errorMsg)}
                        </button>}
                        {successMsg && <button
                            type="button"
                            className="btn btn-success w-75 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {t(successMsg)}
                        </button>}
                    </form>
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}