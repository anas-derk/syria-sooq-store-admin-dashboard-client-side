import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { inputValuesValidation } from "../../../../../public/global_functions/validations";
import { getAdminInfo, getProductInfo, handleSelectUserLanguage } from "../../../../../public/global_functions/popular";
import { useRouter } from "next/router";
import NotFoundError from "@/components/NotFoundError";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";
import { FaRegMinusSquare, FaRegPlusSquare } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function UpdateAndDeleteProductCustomizations({ productIdAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [productData, setProductData] = useState({});

    const [customizes, setCustomizes] = useState({
        hasColors: false,
        colors: [],
        hasSizes: false,
        sizes: {
            s: false,
            m: false,
            l: false,
            xl: false,
            xxl: false,
            xxxl: false,
            "4xl": false
        },
        allowCustomText: false,
        allowAdditionalNotes: false,
        allowUploadImages: false,
        hasAdditionalCost: false,
        additionalCost: 0,
        hasAdditionalTime: false,
        additionalTime: 0,
        hasWeight: false,
        weightDetails: {
            unit: "",
            weight: null
        },
        hasDimentions: false,
        dimentionsDetails: {
            unit: "",
            length: null,
            width: null,
            height: null
        },
        hasProductionDate: false,
        productionDate: null,
        hasExpiryDate: false,
        expiryDate: null,
        possibilityOfSwitching: false,
        possibilityOfReturn: false,
        hasAdditionalDetails: false,
        additionalDetails: [],
    });

    const [colorImages, setColorImages] = useState([]);

    const [waitMsg, setWaitMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

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
                            const product = (await getProductInfo(productIdAsProperty)).data?.productDetails;
                            if (product) {
                                setProductData(product);
                                setCustomizes(product.customizes);
                            }
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

    const handleSelectIsHasColors = (e) => {
        setCustomizes({ ...customizes, colors: e.target.checked ? ["#000"] : [], hasColors: e.target.checked });
    }

    const handleSelectColor = (color, type, selectedColorIndex) => {
        let selectedColors = [];
        if (type === "hex") {
            selectedColors = customizes.colors;
            selectedColors[selectedColorIndex] = color;
            setCustomizes({ ...customizes, colors: selectedColors });
        } else {
            selectedColors = colorImages;
            selectedColors[selectedColorIndex] = color;
            setColorImages(selectedColors);
        }
    }

    const addNewSelectColor = () => {
        setCustomizes({ ...customizes, colors: [...customizes.colors, "#000"] });
    }

    const deleteSelectedColor = (selectedColorIndex) => {
        setCustomizes({ ...customizes, colors: customizes.colors.filter((color, index) => index !== selectedColorIndex) });
    }

    const handleSelectIsHasSizes = (e) => {
        setCustomizes({ ...customizes, hasSizes: e.target.checked, sizes: { s: false, m: false, l: false, xl: false, xxl: false, xxxl: false, "4xl": false } });
    }

    const handleSelectIsHasAdditionalCost = (e) => {
        setCustomizes({ ...customizes, hasAdditionalCost: e.target.checked, additionalCost: 0 });
    }

    const handleSelectAdditionalCost = (cost) => {
        setCustomizes({ ...customizes, additionalCost: cost });
    }

    const handleSelectIsHasAdditionalTime = (e) => {
        setCustomizes({ ...customizes, hasAdditionalTime: e.target.checked, additionalTime: 0 });
    }

    const handleSelectAdditionalTime = (time) => {
        setCustomizes({ ...customizes, additionalTime: time });
    }

    const handleSelectIsHasWeight = (e) => {
        setCustomizes({ ...customizes, hasWeight: e.target.checked, weightDetails: { unit: null, weight: null } });
    }

    const handleSelectWeightDetails = (value, key) => {
        setCustomizes({ ...customizes, weightDetails: { ...customizes.weightDetails, [key]: value } });
    }

    const handleSelectIsHasDimentions = (e) => {
        setCustomizes({ ...customizes, hasDimentions: e.target.checked, dimentionsDetails: { type: "", length: null, width: null, height: null } });
    }

    const handleSelectDimentions = (value, key) => {
        setCustomizes({ ...customizes, dimentionsDetails: { ...customizes.dimentionsDetails, [key]: value } });
    }

    const handleSelectIsHasExpiryDate = (e) => {
        setCustomizes({ ...customizes, hasExpiryDate: e.target.checked, expiryDate: null });
    }

    const handleSelectExpiryDate = (date) => {
        setCustomizes({ ...customizes, expiryDate: date });
    }

    const handleSelectIsHasProductionDate = (e) => {
        setCustomizes({ ...customizes, hasProductionDate: e.target.checked, productionDate: null });
    }

    const handleSelectProductionDate = (date) => {
        setCustomizes({ ...customizes, productionDate: date });
    }

    const handleSelectPossibilityOfSwitching = (e) => {
        setCustomizes({ ...customizes, possibilityOfSwitching: e.target.checked });
    }

    const handleSelectPossibilityOfReturn = (e) => {
        setCustomizes({ ...customizes, possibilityOfReturn: e.target.checked });
    }

    const handleSelectIsHasAdditionalDetails = (e) => {
        setCustomizes({ ...customizes, additionalDetails: e.target.checked ? [""] : [], hasAdditionalDetails: e.target.checked });
    }

    const handleEnterCaption = (caption, selectedCaptionIndex) => {
        let tempAdditionalDetails = customizes.additionalDetails.map(existCaption => existCaption);
        tempAdditionalDetails[selectedCaptionIndex] = caption;
        setCustomizes({ ...customizes, additionalDetails: tempAdditionalDetails });
    }

    const addNewCaption = () => {
        setCustomizes({ ...customizes, additionalDetails: [...customizes.additionalDetails, ""] });
    }

    const deleteEnteredCaption = (selectedCaptionIndex) => {
        setCustomizes({ ...customizes, additionalDetails: customizes.additionalDetails.filter((caption, index) => index !== selectedCaptionIndex) });
    }

    const updateCustomizations = async (e, productData) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                (customizes.colors.length > 0 &&
                {
                    name: "colorImages",
                    value: colorImages,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isImages: {
                            msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Or WEBP Image File !!",
                        },
                        eqLength: {
                            msg: "Sorry, This Length Not Match Colors Count !!",
                            value: customizes.colors.length,
                        }
                    },
                }),
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                let formData = new FormData();
                formData.append("hasCustomizes", productData.hasCustomizes);
                formData.append("customizes", JSON.stringify(customizes));
                if (customizes.colors.length > 0 && colorImages.length > 0) {
                    for (let colorImage of colorImages) {
                        formData.append("colorImages", colorImage);
                    }
                }
                setWaitMsg("Please Wait");
                const result = (await axios.put(`${process.env.BASE_API_URL}/products/update-product-customizes/${productIdAsProperty}?language=${process.env.defaultLanguage}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg(result.msg);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
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
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Repeat The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="update-and-delete-product-customizations admin-dashboard">
            <Head>
                <title>{process.env.storeName} {t("Admin Dashboard")} - {t("Update And Delete Product Customizations")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column pt-5 pb-5 p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        {t("Hi, Mr")} {adminInfo.fullName} {t("In Your Update And Delete Product Customizations Page")}
                    </h1>
                    {Object.keys(productData).length > 0 ? <form className="update-and-delete-product-customizations-form admin-dashbboard-form" onSubmit={(e) => updateCustomizations(e, productData)}>
                        <div className="is-it-customizable mb-4">
                            <h6 className="fw-bold mb-3">{t("Is It Customizable ?")}</h6>
                            <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                <input
                                    className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                    type="checkbox"
                                    id="hasCustomizes"
                                    onChange={(e) => setProductData({ ...productData, hasCustomizes: e.target.checked })}
                                    checked={productData.hasCustomizes}
                                />
                                <label className="form-check-label" htmlFor="hasCustomizes" onClick={(e) => setProductData({ ...productData, hasCustomizes: e.target.checked })}>
                                    {t("Is It Customizable ?")}
                                </label>
                            </div>
                        </div>
                        {productData.hasCustomizes && <section className="customizes border border-2 border-dark p-3 mb-5">
                            <div className="has-colors mb-4">
                                <h6 className="fw-bold mb-3">{t("Has Colors ?")}</h6>
                                <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                    <input
                                        className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                        type="checkbox"
                                        id="hasColors"
                                        onChange={handleSelectIsHasColors}
                                        checked={customizes.hasColors}
                                    />
                                    <label className="form-check-label" htmlFor="hasColors" onClick={handleSelectIsHasColors}>
                                        {t("Has Colors ?")}
                                    </label>
                                </div>
                            </div>
                            {customizes.hasColors && <div className="colors">
                                <h6 className="fw-bold">{t("Selected Colors")}:</h6>
                                <ul className="colors-list mb-3">
                                    {customizes.colors.map((color, colorIndex) => (
                                        <li className="color-item me-3 d-inline-block" key={colorIndex}>{color}</li>
                                    ))}
                                </ul>
                                <hr />
                                <h6 className="fw-bold mb-3">{t("Please Select Colors")}</h6>
                                {customizes.colors.map((_, colorIndex) => (
                                    <div className="row" key={colorIndex}>
                                        <div className="col-md-5">
                                            <div className="product-color mb-4">
                                                <input
                                                    type="color"
                                                    className={`form-control p-2 border-2 product-color-field ${formValidationErrors["colorHex"] ? "border-danger mb-3" : "mb-4"}`}
                                                    placeholder="Please Enter Color"
                                                    onChange={(e) => handleSelectColor(e.target.value, "hex", colorIndex)}
                                                />
                                                {formValidationErrors["colorHex"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["colorHex"])} />}
                                            </div>
                                        </div>
                                        <div className="col-md-5">
                                            <div className="product-image-with-color mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control p-2 border-2 product-image-with-color-field ${formValidationErrors["colorImage"] ? "border-danger mb-3" : "mb-4"}`}
                                                    placeholder={t("Please Enter Color Image")}
                                                    onChange={(e) => handleSelectColor(e.target.files[0], "file", colorIndex)}
                                                />
                                                {formValidationErrors["colorImage"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["colorImage"])} />}
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <FaRegPlusSquare className="plus-icon icon me-4" onClick={addNewSelectColor} />
                                            {customizes.colors.length > 1 && <FaRegMinusSquare className="minus-icon icon" onClick={() => deleteSelectedColor(colorIndex)} />}
                                        </div>
                                    </div>
                                ))}
                            </div>}
                            <div className="has-sizes mb-4">
                                <h6 className="fw-bold mb-3">{t("Has Sizes ?")}</h6>
                                <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                    <input
                                        className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                        type="checkbox"
                                        id="hasSizes"
                                        onChange={handleSelectIsHasSizes}
                                        checked={customizes.hasSizes}
                                    />
                                    <label className="form-check-label" htmlFor="hasSizes" onClick={handleSelectIsHasSizes}>
                                        {t("Has Sizes ?")}
                                    </label>
                                </div>
                            </div>
                            {customizes.hasSizes && <div className="sizes">
                                <h6 className="fw-bold mb-3">{t("Please Select Sizes")}</h6>
                                <div className="row">
                                    {Object.entries(customizes.sizes).map(([key, value]) =>
                                        <div className="col-md-2 mb-3" key={key}>
                                            <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                                <input
                                                    className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                                    type="checkbox"
                                                    id={key}
                                                    onChange={(e) => setCustomizes({ ...customizes, sizes: { ...customizes.sizes, [key]: e.target.checked } })}
                                                    checked={value}
                                                />
                                                <label className="form-check-label" htmlFor={key} onClick={(e) => setCustomizes({ ...customizes, sizes: { ...customizes.sizes, [key]: e.target.checked } })}>
                                                    {key}
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>}
                            <div className="allow-custom-text  mb-4">
                                <h6 className="fw-bold mb-3">{t("Allow Custom Text ?")}</h6>
                                <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                    <input
                                        className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                        type="checkbox"
                                        id="allowCustomText"
                                        onChange={(e) => setCustomizes({ ...customizes, allowCustomText: e.target.checked })}
                                        checked={customizes.allowCustomText}
                                    />
                                    <label className="form-check-label" htmlFor="allowCustomText" onClick={(e) => setCustomizes({ ...customizes, allowCustomText: e.target.checked })}>
                                        {t("Allow Custom Text ?")}
                                    </label>
                                </div>
                            </div>
                            <div className="allow-additional-notes  mb-4">
                                <h6 className="fw-bold mb-3">{t("Allow Additional Notes ?")}</h6>
                                <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                    <input
                                        className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                        type="checkbox"
                                        id="allowAdditionalNotes"
                                        onChange={(e) => setCustomizes({ ...customizes, allowAdditionalNotes: e.target.checked })}
                                        checked={customizes.allowAdditionalNotes}
                                    />
                                    <label className="form-check-label" htmlFor="allowAdditionalNotes" onClick={(e) => setCustomizes({ ...customizes, allowAdditionalNotes: e.target.checked })}>
                                        {t("Allow Additional Notes ?")}
                                    </label>
                                </div>
                            </div>
                            <div className="allow-upload-images mb-4">
                                <h6 className="fw-bold mb-3">{t("Allow Upload Images ?")}</h6>
                                <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                    <input
                                        className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                        type="checkbox"
                                        id="allowUploadImages"
                                        onChange={(e) => setCustomizes({ ...customizes, allowUploadImages: e.target.checked })}
                                        checked={customizes.allowUploadImages}
                                    />
                                    <label className="form-check-label" htmlFor="allowUploadImages" onClick={(e) => setCustomizes({ ...customizes, allowUploadImages: e.target.checked })}>
                                        {t("Allow Upload Images ?")}
                                    </label>
                                </div>
                            </div>
                            <div className="has-additional-cost  mb-4">
                                <h6 className="fw-bold mb-3">{t("Has Additional Cost ?")}</h6>
                                <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                    <input
                                        className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                        type="checkbox"
                                        id="hasAdditionalCost"
                                        onChange={handleSelectIsHasAdditionalCost}
                                        checked={customizes.hasAdditionalCost}
                                    />
                                    <label className="form-check-label" htmlFor="hasAdditionalCost" onClick={handleSelectIsHasAdditionalCost}>
                                        {t("Has Additional Cost ?")}
                                    </label>
                                </div>
                            </div>
                            {customizes.hasAdditionalCost && <div className="additional-cost">
                                <h6 className="fw-bold mb-3">{t("Please Enter Cost")}</h6>
                                <div className="cost mb-4">
                                    <input
                                        type="number"
                                        className={`form-control p-2 border-2 product-additional-cost-field ${formValidationErrors["additionalCost"] ? "border-danger mb-3" : "mb-4"}`}
                                        placeholder={t("Please Enter Additional Cost")}
                                        onChange={(e) => handleSelectAdditionalCost(e.target.value)}
                                        value={customizes.additionalCost}
                                    />
                                    {formValidationErrors["additionalCost"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["additionalCost"])} />}
                                </div>
                            </div>}
                            <div className="has-additional-time  mb-4">
                                <h6 className="fw-bold mb-3">{t("Has Additional Time ?")}</h6>
                                <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                    <input
                                        className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                        type="checkbox"
                                        id="hasAdditionalTime"
                                        onChange={handleSelectIsHasAdditionalTime}
                                        checked={customizes.hasAdditionalTime}
                                    />
                                    <label className="form-check-label" htmlFor="hasAdditionalTime" onClick={handleSelectIsHasAdditionalTime}>
                                        {t("Has Additional Time ?")}
                                    </label>
                                </div>
                            </div>
                            {customizes.hasAdditionalTime && <div className="additional-time">
                                <h6 className="fw-bold mb-3">{t("Please Enter Time")}</h6>
                                <div className="time mb-4">
                                    <input
                                        type="number"
                                        className={`form-control p-2 border-2 product-additional-time-field ${formValidationErrors["additionalTime"] ? "border-danger mb-3" : "mb-4"}`}
                                        placeholder={t("Please Enter Additional Time")}
                                        onChange={(e) => handleSelectAdditionalTime(e.target.value)}
                                        value={customizes.additionalTime}
                                    />
                                    {formValidationErrors["additionalTime"] && <FormFieldErrorBox errorMsg={formValidationErrors["additionalTime"]} />}
                                </div>
                            </div>}
                            <div className="has-weight mb-4">
                                <h6 className="fw-bold mb-3">{t("Has Weight ?")}</h6>
                                <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                    <input
                                        className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                        type="checkbox"
                                        id="hasWeight"
                                        onChange={handleSelectIsHasWeight}
                                        checked={customizes.hasWeight}
                                    />
                                    <label className="form-check-label" htmlFor="hasWeight" onClick={handleSelectIsHasWeight}>
                                        {t("Has Weight ?")}
                                    </label>
                                </div>
                            </div>
                            {customizes.hasWeight && <div className="weight-details">
                                <h6 className="fw-bold mb-3">{t("Please Select Weight Details")}</h6>
                                <div className="details mb-4">
                                    <select
                                        type="text"
                                        className={`form-control p-2 border-2 product-weight-details-field ${formValidationErrors["unit"] ? "border-danger mb-3" : "mb-4"}`}
                                        placeholder="Please Enter Weight Unit"
                                        onChange={(e) => handleSelectWeightDetails(e.target.value, "unit")}
                                    >
                                        <option value="" hidden>{t("Please Select Unit")}</option>
                                        <option value="gr">{t("Gram")}</option>
                                        <option value="kg">{t("Kg")}</option>
                                    </select>
                                    {formValidationErrors["unit"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["unit"])} />}
                                </div>
                                <div className="details mb-4">
                                    <input
                                        type="number"
                                        className={`form-control p-2 border-2 product-weight-details-field ${formValidationErrors["weight"] ? "border-danger mb-3" : "mb-4"}`}
                                        placeholder={t("Please Enter Weight")}
                                        onChange={(e) => handleSelectWeightDetails(e.target.value, "weight")}
                                        value={customizes.weightDetails.weight}
                                    />
                                    {formValidationErrors["weight"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["weight"])} />}
                                </div>
                            </div>}
                            <div className="has-dimentions mb-4">
                                <h6 className="fw-bold mb-3">{t("Has Dimentions ?")}</h6>
                                <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                    <input
                                        className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                        type="checkbox"
                                        id="hasDimentions"
                                        onChange={handleSelectIsHasDimentions}
                                        checked={customizes.hasDimentions}
                                    />
                                    <label className="form-check-label" htmlFor="hasDimentions" onClick={handleSelectIsHasDimentions}>
                                        {t("Has Dimentions ?")}
                                    </label>
                                </div>
                            </div>
                            {customizes.hasDimentions && <div className="dimentions-details">
                                <h6 className="fw-bold mb-3">{t("Please Select Dimentions Details")}</h6>
                                <div className="dimentions-box mb-4">
                                    <select
                                        type="text"
                                        className={`form-control p-2 border-2 product-dimentions-unit-field ${formValidationErrors["dimentionsUnit"] ? "border-danger mb-3" : "mb-4"}`}
                                        placeholder={t("Please Enter Dimentions Unit")}
                                        onChange={(e) => handleSelectDimentions(e.target.value, "unit")}
                                    >
                                        <option value="" hidden>{t("Please Select Unit")}</option>
                                        <option value="cm">{t("Cm")}</option>
                                        <option value="m">{t("M")}</option>
                                        <option value="cm2">{t("Cm2")}</option>
                                        <option value="m2">{t("M2")}</option>
                                    </select>
                                    {formValidationErrors["dimentionsUnit"] && <FormFieldErrorBox errorMsg={formValidationErrors["dimentionsUnit"]} />}
                                </div>
                                <div className="dimentions-box row mb-4">
                                    <div className="col-md-4">
                                        <input
                                            type="number"
                                            className={`form-control p-2 border-2 product-dimention-field ${formValidationErrors["length"] ? "border-danger mb-3" : "mb-4"}`}
                                            placeholder={t("Please Enter Length")}
                                            onChange={(e) => handleSelectDimentions(e.target.value, "length")}
                                            value={customizes.dimentionsDetails.length}
                                        />
                                        {formValidationErrors["length"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["length"])} />}
                                    </div>
                                    <div className="col-md-4">
                                        <input
                                            type="number"
                                            className={`form-control p-2 border-2 product-dimention-field ${formValidationErrors["width"] ? "border-danger mb-3" : "mb-4"}`}
                                            placeholder={t("Please Enter Width")}
                                            onChange={(e) => handleSelectDimentions(e.target.value, "width")}
                                            value={customizes.dimentionsDetails.width}
                                        />
                                        {formValidationErrors["width"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["width"])} />}
                                    </div>
                                    <div className="col-md-4">
                                        <input
                                            type="number"
                                            className={`form-control p-2 border-2 product-dimention-field ${formValidationErrors["height"] ? "border-danger mb-3" : "mb-4"}`}
                                            placeholder={t("Please Enter Height")}
                                            onChange={(e) => handleSelectDimentions(e.target.value, "height")}
                                            value={customizes.dimentionsDetails.height}
                                        />
                                        {formValidationErrors["height"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["height"])} />}
                                    </div>
                                </div>
                            </div>}
                            <div className="has-production-date mb-4">
                                <h6 className="fw-bold mb-3">{t("Has Production Date ?")}</h6>
                                <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                    <input
                                        className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                        type="checkbox"
                                        id="hasProductionDate"
                                        onChange={handleSelectIsHasProductionDate}
                                        checked={customizes.hasProductionDate}
                                    />
                                    <label className="form-check-label" htmlFor="hasProductionDate" onClick={handleSelectIsHasProductionDate}>
                                        {t("Has Production Date ?")}
                                    </label>
                                </div>
                            </div>
                            {customizes.hasProductionDate && <div className="production-date-box">
                                <h6 className="fw-bold mb-3">{t("Please Enter Production Date")}</h6>
                                <div className="production-date mb-4">
                                    <input
                                        type="date"
                                        className={`form-control p-2 border-2 product-production-date-field ${formValidationErrors["productionDate"] ? "border-danger mb-3" : "mb-4"}`}
                                        placeholder={t("Please Enter Production Date")}
                                        onChange={(e) => handleSelectProductionDate(e.target.value)}
                                        value={customizes.productionDate}
                                    />
                                    {formValidationErrors["productionDate"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["productionDate"])} />}
                                </div>
                            </div>}
                            <div className="has-expiry-date mb-4">
                                <h6 className="fw-bold mb-3">{t("Has Expiry Date ?")}</h6>
                                <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                    <input
                                        className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                        type="checkbox"
                                        id="hasExpiryDate"
                                        onChange={handleSelectIsHasExpiryDate}
                                        checked={customizes.hasExpiryDate}
                                    />
                                    <label className="form-check-label" htmlFor="hasExpiryDate" onClick={handleSelectIsHasExpiryDate}>
                                        {t("Has Expiry Date ?")}
                                    </label>
                                </div>
                            </div>
                            {customizes.hasExpiryDate && <div className="expiry-date-box">
                                <h6 className="fw-bold mb-3">{t("Please Enter Expiry Date")}</h6>
                                <div className="expiry-date mb-4">
                                    <input
                                        type="date"
                                        className={`form-control p-2 border-2 product-expiry-date-field ${formValidationErrors["expiryDate"] ? "border-danger mb-3" : "mb-4"}`}
                                        placeholder={t("Please Enter Expiry Date")}
                                        onChange={(e) => handleSelectExpiryDate(e.target.value)}
                                        value={customizes.expiryDate}
                                    />
                                    {formValidationErrors["expiryDate"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["expiryDate"])} />}
                                </div>
                            </div>}
                            <div className="possibility-of-switching mb-4">
                                <h6 className="fw-bold mb-3">{t("Possibility Of Switching")}</h6>
                                <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                    <input
                                        className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                        type="checkbox"
                                        id="possibilityOfSwitching"
                                        onChange={handleSelectPossibilityOfSwitching}
                                        checked={customizes.possibilityOfSwitching}
                                    />
                                    <label className="form-check-label" htmlFor="possibilityOfSwitching" onClick={handleSelectPossibilityOfSwitching}>
                                        {t("Possibility Of Switching")}
                                    </label>
                                </div>
                            </div>
                            <div className="possibility-of-return mb-4">
                                <h6 className="fw-bold mb-3">{t("Possibility Of Return")}</h6>
                                <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                    <input
                                        className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                        type="checkbox"
                                        id="possibilityOfReturn"
                                        onChange={handleSelectPossibilityOfReturn}
                                        checked={customizes.possibilityOfReturn}
                                    />
                                    <label className="form-check-label" htmlFor="possibilityOfReturn" onClick={handleSelectPossibilityOfReturn}>
                                        {t("Possibility Of Return")}
                                    </label>
                                </div>
                            </div>
                            <div className="has-additional-details mb-4">
                                <h6 className="fw-bold mb-3">{t("Has Additional Details ?")}</h6>
                                <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                    <input
                                        className={`form-check-input m-0 ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}
                                        type="checkbox"
                                        id="hasAdditionalDetails"
                                        onChange={handleSelectIsHasAdditionalDetails}
                                        checked={customizes.hasAdditionalDetails}
                                    />
                                    <label className="form-check-label" htmlFor="hasAdditionalDetails" onClick={handleSelectIsHasAdditionalDetails}>
                                        {t("Has Additional Details ?")}
                                    </label>
                                </div>
                            </div>
                            {customizes.hasAdditionalDetails && <div className="additionalDetails">
                                <ul className="additional-details-list mb-3">
                                    {customizes.additionalDetails.map((caption, captionIndex) => (
                                        <li className="caption-item me-3 d-inline-block" key={captionIndex}>{caption}</li>
                                    ))}
                                </ul>
                                <hr />
                                <h6 className="fw-bold mb-3">{t("Please Enter Details")}</h6>
                                {customizes.additionalDetails.map((_, captionIndex) => (
                                    <div className="row" key={captionIndex}>
                                        <div className="col-md-10">
                                            <div className="product-caption mb-4">
                                                <input
                                                    type="text"
                                                    className={`form-control p-2 border-2 product-caption-field ${formValidationErrors["caption"] ? "border-danger mb-3" : "mb-4"}`}
                                                    placeholder={t("Please Enter Caption")}
                                                    onChange={(e) => handleEnterCaption(e.target.value, captionIndex)}
                                                />
                                                {formValidationErrors["caption"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["caption"])} />}
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <FaRegPlusSquare className="plus-icon icon me-4" onClick={addNewCaption} />
                                            {customizes.additionalDetails.length > 1 && <FaRegMinusSquare className="minus-icon icon" onClick={() => deleteEnteredCaption(captionIndex)} />}
                                        </div>
                                    </div>
                                ))}
                            </div>}
                        </section>}
                        {!waitMsg && !successMsg && !errorMsg && <button
                            type="submit"
                            className="btn btn-success w-50 d-block mx-auto p-2 global-button"
                        >
                            {t("Update")}
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
                    </form> : <NotFoundError errorMsg={t("Sorry, This Product is Not Found") + " !!"} />}
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div >
    );
}

export async function getServerSideProps({ params }) {
    const { productId } = params;
    if (!productId) {
        return {
            redirect: {
                permanent: false,
                destination: "/products-managment/update-and-delete-products",
            },
        }
    } else {
        return {
            props: {
                productIdAsProperty: productId,
            },
        }
    }
}