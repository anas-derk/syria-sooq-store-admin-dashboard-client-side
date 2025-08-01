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
import {
    getAdminInfo,
    getProductsCount,
    getAllProductsInsideThePage,
    getTimeAndDateByLocalTime,
    getDateInUTCFormat,
    handleSelectUserLanguage,
} from "../../../../public/global_functions/popular";
import Link from "next/link";
import NotFoundError from "@/components/NotFoundError";
import TableLoader from "@/components/TableLoader";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";
import { useTranslation } from "react-i18next";

export default function UpdateAndDeleteProducts() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [isGetProducts, setIsGetProducts] = useState(false);

    const [waitMsg, setWaitMsg] = useState("");

    const [selectedProducImageIndex, setSelectedProducImageIndex] = useState(-1);

    const [selectedProductIndex, setSelectedProductIndex] = useState(-1);

    const [waitChangeProductImageMsg, setWaitChangeProductImageMsg] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [errorChangeProductImageMsg, setErrorChangeProductImageMsg] = useState("");

    const [errorMsgOnGetProductsData, setErrorMsgOnGetProductsData] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [successChangeProductImageMsg, setSuccessChangeProductImageMsg] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        category: "",
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
                            result = (await getAllProductsInsideThePage(1, pageSize)).data;
                            setAllProductsInsideThePage(result.products);
                            setTotalPagesCount(Math.ceil(result.productsCount / pageSize));
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

    const getPreviousPage = async () => {
        try {
            setIsGetProducts(true);
            setErrorMsgOnGetProductsData("");
            const newCurrentPage = currentPage - 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data.products);
            setCurrentPage(newCurrentPage);
            setIsGetProducts(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetProductsData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetProducts(true);
            setErrorMsgOnGetProductsData("");
            const newCurrentPage = currentPage + 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data.products);
            setCurrentPage(newCurrentPage);
            setIsGetProducts(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetProductsData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetProducts(true);
            setErrorMsgOnGetProductsData("");
            setAllProductsInsideThePage((await getAllProductsInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data.products);
            setCurrentPage(pageNumber);
            setIsGetProducts(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetProductsData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.category) filteringString += `category=${filters.category}&`;
        if (filters.name) filteringString += `name=${filters.name}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const filterProducts = async (filters) => {
        try {
            setIsGetProducts(true);
            setCurrentPage(1);
            const result = (await getAllProductsInsideThePage(1, pageSize, getFilteringString(filters))).data;
            setAllProductsInsideThePage(result.products);
            setTotalPagesCount(Math.ceil(result.productsCount / pageSize));
            setIsGetProducts(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsGetProducts(false);
                setCurrentPage(-1);
                setWaitMsg("");
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const changeProductData = (productIndex, fieldName, newValue) => {
        setSelectedProductIndex(-1);
        let tempNewValue = newValue;
        if (fieldName === "startDiscountPeriod" || fieldName === "endDiscountPeriod") {
            tempNewValue = getDateInUTCFormat(newValue);
        }
        let productsDataTemp = allProductsInsideThePage.map(product => product);
        productsDataTemp[productIndex][fieldName] = tempNewValue;
        setAllProductsInsideThePage(productsDataTemp);
    }

    const updateProductImage = async (productIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "image",
                    value: allProductsInsideThePage[productIndex].image,
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
            setSelectedProducImageIndex(productIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitChangeProductImageMsg("Please Waiting Change Image ...");
                let formData = new FormData();
                formData.append("productImage", allProductsInsideThePage[productIndex].image);
                const result = (await axios.put(`${process.env.BASE_API_URL}/products/update-product-image/${allProductsInsideThePage[productIndex]._id}?language=${process.env.defaultLanguage}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                setWaitChangeProductImageMsg("");
                if (!result.error) {
                    setSuccessChangeProductImageMsg("Change Image Successfull !!");
                    let successTimeout = setTimeout(async () => {
                        setSuccessChangeProductImageMsg("");
                        setAllProductsInsideThePage((await getAllProductsInsideThePage(currentPage, pageSize, getFilteringString(filters))).data.products);
                        setSelectedProducImageIndex(-1);
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorChangeProductImageMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorChangeProductImageMsg("");
                        setSelectedProducImageIndex(-1);
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
                setWaitChangeProductImageMsg("");
                setErrorChangeProductImageMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorChangeProductImageMsg("");
                    setSelectedProducImageIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const updateProductData = async (productIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "name",
                    value: allProductsInsideThePage[productIndex].name,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "price",
                    value: allProductsInsideThePage[productIndex].price,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "quantity",
                    value: allProductsInsideThePage[productIndex].quantity,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        minNumber: {
                            value: 0,
                            msg: "Sorry, Min Number Is: 0 !!",
                        },
                    },
                },
                {
                    name: "description",
                    value: allProductsInsideThePage[productIndex].description,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "discount",
                    value: allProductsInsideThePage[productIndex].discount,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        minNumber: {
                            value: 0,
                            msg: "Sorry, Min Number Is: 0 !!",
                        },
                        maxNumber: {
                            value: allProductsInsideThePage[productIndex].price * 0.99,
                            msg: `Sorry, Max Number Is: ${allProductsInsideThePage[productIndex].price * 0.99} !!`,
                        },
                    },
                },
                {
                    name: "discountInOfferPeriod",
                    value: allProductsInsideThePage[productIndex].discountInOfferPeriod,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        minNumber: {
                            value: 0,
                            msg: "Sorry, Min Number Is: 0 !!",
                        },
                        maxNumber: {
                            value: allProductsInsideThePage[productIndex].price * 0.99,
                            msg: `Sorry, Max Number Is: ${allProductsInsideThePage[productIndex].price * 0.99} !!`,
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedProductIndex(productIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/products/${allProductsInsideThePage[productIndex]._id}?language=${process.env.defaultLanguage}`, {
                    name: allProductsInsideThePage[productIndex].name,
                    price: allProductsInsideThePage[productIndex].price,
                    quantity: allProductsInsideThePage[productIndex].quantity,
                    description: allProductsInsideThePage[productIndex].description,
                    discount: Number(allProductsInsideThePage[productIndex].discount),
                    startDiscountPeriod: allProductsInsideThePage[productIndex].startDiscountPeriod,
                    endDiscountPeriod: allProductsInsideThePage[productIndex].endDiscountPeriod,
                    discountInOfferPeriod: Number(allProductsInsideThePage[productIndex].discountInOfferPeriod),
                    offerDescription: allProductsInsideThePage[productIndex].offerDescription,
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
                        setSelectedProductIndex(-1);
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setSelectedProductIndex(-1);
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
                    setSelectedProductIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteProduct = async (productIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedProductIndex(productIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/products/${allProductsInsideThePage[productIndex]._id}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedProductIndex(-1);
                    setIsGetProducts(true);
                    const result = (await getAllProductsInsideThePage(currentPage, pageSize, getFilteringString(filters))).data;
                    setAllProductsInsideThePage(result.products);
                    setTotalPagesCount(Math.ceil(result.productsCount / pageSize));
                    setIsGetProducts(false);
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedProductIndex(-1);
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
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedProductIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="update-and-delete-products admin-dashboard">
            <Head>
                <title>{process.env.storeName} {t("Admin Dashboard")} - {t("Update / Delete Products")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        {t("Hi, Mr")} {adminInfo.fullName} {t("In Your Update / Delete Products Page")}
                    </h1>
                    <section className="filters mb-3 bg-white border-3 border-info p-3 text-start w-100">
                        <h5 className="section-name fw-bold text-center">{t("Filters")}: </h5>
                        <hr />
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <h6 className={`fw-bold text-center ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}>{t("Category")}</h6>
                                <input
                                    type="text"
                                    className={`form-control p-2 border-2 category-name-field ${formValidationErrors["categoryName"] ? "border-danger mb-3" : ""}`}
                                    placeholder={t("Please Enter Category Name")}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                />
                                {formValidationErrors["categoryName"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["categoryName"])} />}
                            </div>
                            <div className="col-md-6">
                                <h6 className={`fw-bold text-center ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}>{t("Name")}</h6>
                                <input
                                    type="text"
                                    className={`form-control p-2 border-2 product-name-field ${formValidationErrors["productName"] ? "border-danger mb-3" : ""}`}
                                    placeholder={t("Please Enter Product Name")}
                                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                                />
                                {formValidationErrors["productName"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["productName"])} />}
                            </div>
                        </div>
                        {!isGetProducts && <button
                            className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                            onClick={async () => await filterProducts(filters)}
                        >
                            {t("Filter")}
                        </button>}
                        {isGetProducts && <button
                            className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                            disabled
                        >
                            {t("Filtering")} ...
                        </button>}
                    </section>
                    {allProductsInsideThePage.length > 0 && !isGetProducts && <div className="products-box admin-dashbboard-data-box w-100 pe-4">
                        <table className="products-table mb-4 managment-table admin-dashbboard-data-table bg-white">
                            <thead>
                                <tr>
                                    <th>{t("Name")}</th>
                                    <th>{t("Price")}</th>
                                    <th>{t("Quantity")}</th>
                                    <th>{t("Description")}</th>
                                    <th>{t("Discount")}</th>
                                    <th>{t("Image")}</th>
                                    <th>{t("Processes")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allProductsInsideThePage.map((product, productIndex) => (
                                    <tr key={product._id}>
                                        <td className="product-name-cell">
                                            <section className="product-name mb-4">
                                                <input
                                                    type="text"
                                                    placeholder={t("Please Enter New Name")}
                                                    defaultValue={product.name}
                                                    className={`form-control d-block mx-auto p-2 border-2 product-name-field ${formValidationErrors["name"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(productIndex, "name", e.target.value.trim())}
                                                />
                                                {formValidationErrors["name"] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["name"])} />}
                                            </section>
                                        </td>
                                        <td className="product-price-cell">
                                            <section className="product-price mb-4">
                                                <input
                                                    type="text"
                                                    placeholder={t("Please Enter New Price")}
                                                    defaultValue={product.price}
                                                    className={`form-control d-block mx-auto p-2 border-2 product-price-field ${formValidationErrors["price"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(productIndex, "price", e.target.value)}
                                                />
                                                {formValidationErrors["price"] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["price"])} />}
                                            </section>
                                        </td>
                                        <td className="product-quantity-cell">
                                            <section className="product-quantity mb-4">
                                                <h6 className="bg-info p-2 fw-bold">{product.quantity}</h6>
                                                <hr />
                                                <input
                                                    type="text"
                                                    placeholder={t("Please Enter New Quantity")}
                                                    defaultValue={product.quantity}
                                                    className={`form-control d-block mx-auto p-2 border-2 product-quantity-field ${formValidationErrors["quantity"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(productIndex, "quantity", e.target.value)}
                                                />
                                                {formValidationErrors["quantity"] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["quantity"])} />}
                                            </section>
                                        </td>
                                        <td className="product-description-cell" width="400">
                                            <section className="product-description mb-4">
                                                <textarea
                                                    placeholder={t("Please Enter New Description")}
                                                    defaultValue={product.description}
                                                    className={`form-control d-block mx-auto p-2 border-2 product-description-field ${formValidationErrors["description"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(productIndex, "description", e.target.value.trim())}
                                                ></textarea>
                                                {formValidationErrors["description"] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["description"])} />}
                                            </section>
                                        </td>
                                        <td className="product-price-discount-cell">
                                            <section className="product-price-discount mb-4">
                                                <input
                                                    type="text"
                                                    placeholder={t("Please Enter New Discount")}
                                                    defaultValue={product.discount}
                                                    className={`form-control d-block mx-auto p-2 border-2 product-price-discount ${formValidationErrors["discount"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(productIndex, "discount", e.target.value)}
                                                />
                                                {formValidationErrors["discount"] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["discount"])} />}
                                            </section>
                                            <div className="limited-period-box border border-2 p-3 border-dark">
                                                <div className="period-box">
                                                    <h6 className="fw-bold">{t("Start Period")}</h6>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-control mb-4 border border-dark"
                                                        onChange={(e) => changeProductData(productIndex, "startDiscountPeriod", e.target.value)}
                                                        defaultValue={product.startDiscountPeriod ? getTimeAndDateByLocalTime(product.startDiscountPeriod) : null}
                                                    />
                                                    <h6 className="fw-bold">{t("End Period")}</h6>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-control mb-4 border border-dark"
                                                        onChange={(e) => changeProductData(productIndex, "endDiscountPeriod", e.target.value)}
                                                        defaultValue={product.endDiscountPeriod ? getTimeAndDateByLocalTime(product.endDiscountPeriod) : null}
                                                    />
                                                    <section className="product-price-discount-in-offer-period mb-4">
                                                        <input
                                                            type="text"
                                                            placeholder={t("Please Enter New Discount In Offer Period")}
                                                            defaultValue={product.discountInOfferPeriod}
                                                            className={`form-control d-block mx-auto p-2 border-2 product-price-discount-in-offer-period-field ${formValidationErrors["discount"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-2"}`}
                                                            onChange={(e) => changeProductData(productIndex, "discountInOfferPeriod", e.target.value)}
                                                        />
                                                        {formValidationErrors["discountInOfferPeriod"] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["discountInOfferPeriod"])} />}
                                                    </section>
                                                    <section className="offer-description">
                                                        <input
                                                            type="text"
                                                            placeholder={t("Please Enter New Offer Description")}
                                                            defaultValue={product.offerDescription}
                                                            className={`form-control d-block mx-auto p-2 border-2 offer-description-field ${formValidationErrors["name"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-2"}`}
                                                            onChange={(e) => changeProductData(productIndex, "offerDescription", e.target.value.trim())}
                                                        />
                                                        {formValidationErrors["offerDescription"] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["offerDescription"])} />}
                                                    </section>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="product-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${product.imagePath}`}
                                                alt="Product Image !!"
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                            <section className="product-image mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-image-field ${formValidationErrors["image"] && productIndex === selectedProducImageIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(productIndex, "image", e.target.files[0])}
                                                    accept=".png, .jpg, .webp"
                                                />
                                                {formValidationErrors["image"] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["image"])} />}
                                            </section>
                                            {(selectedProducImageIndex !== productIndex && selectedProductIndex !== productIndex) &&
                                                <button
                                                    className="btn btn-success d-block mb-3 w-50 mx-auto global-button"
                                                    onClick={() => updateProductImage(productIndex)}
                                                >{t("Change")}</button>
                                            }
                                            {waitChangeProductImageMsg && selectedProducImageIndex === productIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                            >{t(waitChangeProductImageMsg)}</button>}
                                            {successChangeProductImageMsg && selectedProducImageIndex === productIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{t(successChangeProductImageMsg)}</button>}
                                            {errorChangeProductImageMsg && selectedProducImageIndex === productIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{t(errorChangeProductImageMsg)}</button>}
                                        </td>
                                        <td className="update-cell">
                                            {selectedProductIndex !== productIndex && <>
                                                <Link href={`/products-managment/update-and-delete-gallery-images/${product._id}`}
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                >{t("Show Gallery Images")}</Link>
                                                <Link href={`/products-managment/add-new-gallery-images/${product._id}`}
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                >{t("Add New Image To Gallery")}</Link>
                                                <Link href={`/products-managment/update-and-delete-product-categories/${product._id}`}
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                >{t("Show Categories")}</Link>
                                                <hr />
                                                <button
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                    onClick={() => updateProductData(productIndex)}
                                                >{t("Update")}</button>
                                                <hr />
                                                <button
                                                    className="btn btn-danger global-button"
                                                    onClick={() => deleteProduct(productIndex)}
                                                >{t("Delete")}</button>
                                            </>}
                                            {waitMsg && selectedProductIndex === productIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{t(waitMsg)}</button>}
                                            {successMsg && selectedProductIndex === productIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{t(successMsg)}</button>}
                                            {errorMsg && selectedProductIndex === productIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{t(errorMsg)}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}
                    {allProductsInsideThePage.length === 0 && !isGetProducts && <NotFoundError errorMsg={t("Sorry, Can't Find Any Products") + " !!"} />}
                    {isGetProducts && <TableLoader />}
                    {errorMsgOnGetProductsData && <NotFoundError errorMsg={t(errorMsgOnGetProductsData)} />}
                    {totalPagesCount > 1 && !isGetProducts &&
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