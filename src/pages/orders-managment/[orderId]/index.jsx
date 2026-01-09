import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { getAdminInfo, getOrderDetails, handleSelectUserLanguage } from "../../../../public/global_functions/popular";
import ReturnOrderProductStatusChangeBox from "@/components/ReturnOrderStatusChangeBox";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function OrderDetails({ orderIdAsProperty, ordersType }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [orderDetails, setOrderDetails] = useState({});

    const [selectedOrderProductIndex, setSelectedOrderProductIndex] = useState(-1);

    const [selectedFileIndex, setSelectedFileIndex] = useState(-1);

    const [waitMsg, setWaitMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [isDisplayOrderProductStatusChangeBox, setIsDisplayOrderProductStatusChangeBox] = useState(false);

    const [orderProductAction, setOrderProductAction] = useState("");

    const router = useRouter();

    const { t, i18n } = useTranslation();

    const ordersTypeByMakeFirstLetterCapital = ordersType.replace(ordersType[0], ordersType[0].toUpperCase());

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.adminDashboardlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : process.env.defaultLanguage, i18n.changeLanguage);
    }, []);

    useEffect(() => {
        setIsLoadingPage(true);
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
                            result = await getOrderDetails(orderIdAsProperty, ordersType);
                            if (!result.error) {
                                setOrderDetails(result.data);
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
    }, [ordersType]);

    const downloadFile = async (URL, productName, selectedProductIndex, selectedFileIndex) => {
        try {
            setSelectedOrderProductIndex(selectedProductIndex);
            setSelectedFileIndex(selectedFileIndex);
            setWaitMsg("Please Wait");
            const res = await axios.get(URL, { responseType: "blob" });
            const imageAsBlob = res.data;
            const localURL = window.URL.createObjectURL(imageAsBlob);
            const tempAnchorLink = document.createElement("a");
            tempAnchorLink.href = localURL;
            tempAnchorLink.download = `file${selectedFileIndex}ForProduct${productName}_${Date.now()}.webp`;
            tempAnchorLink.click();
            setSelectedOrderProductIndex(-1);
            setSelectedFileIndex(-1);
            setWaitMsg("");
        } catch (err) {
            setWaitMsg("");
            setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Repeat The Process !!");
            let errorTimeout = setTimeout(() => {
                setSelectedOrderProductIndex(-1);
                setSelectedFileIndex(-1);
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 4000);
        }
    }

    const handleChangeReturnOrderProductStatus = (productIndex, action) => {
        setSelectedOrderProductIndex(productIndex);
        setOrderProductAction(action);
        setIsDisplayOrderProductStatusChangeBox(true);
    }

    return (
        <div className="order-details admin-dashboard">
            <Head>
                <title>{process.env.storeName} {t("Admin Dashboard")} - {t(`${ordersTypeByMakeFirstLetterCapital} Order Details`)}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Change Order Product Status Box */}
                {isDisplayOrderProductStatusChangeBox && <ReturnOrderProductStatusChangeBox
                    orderProductAction={orderProductAction}
                    setIsDisplayOrderProductStatusChangeBox={setIsDisplayOrderProductStatusChangeBox}
                    selectedProduct={orderDetails.products[selectedOrderProductIndex]}
                    setSelectedOrderProductIndex={setSelectedOrderProductIndex}
                    orderId={orderIdAsProperty}
                    setOrderDetails={setOrderDetails}
                />}
                {/* End Change Order Product Status Box */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-4 pb-4 p-4">
                    <div className="container-fluid">
                        <h1 className="welcome-msg fw-bold mx-auto mt-3 mb-3">{t("Hi, Mr")} {adminInfo.fullName} {t(`In Your ${ordersTypeByMakeFirstLetterCapital} Order Details Page`)}</h1>
                        {Object.keys(orderDetails).length > 0 ? <div className="order-details-box p-3 data-box admin-dashbboard-data-box">
                            <table className="order-data-table managment-table admin-dashbboard-data-table">
                                <thead>
                                    <tr>
                                        <th>{t("Product Id")}</th>
                                        <th>{t("Quantity")}</th>
                                        <th>{t("Name")}</th>
                                        <th>{t("Unit Price")}</th>
                                        <th>{t("Unit Discount")}</th>
                                        <th>{t("Total Amount Before Discount")}</th>
                                        <th>{t("Total")}</th>
                                        <th>{t("Image")}</th>
                                        {ordersType === "normal" && <th width="400">{t("Extra Data")}</th>}
                                        {ordersType === "return" && <>
                                            <th>{t("Return Reason")}</th>
                                            <th>{t("Approved Quantity")}</th>
                                            <th>{t("Approved Total Amount Before Discount")}</th>
                                            <th>{t("Approved Total Amount")}</th>
                                            <th>{t("Notes")}</th>
                                            <th>{t("Status")}</th>
                                        </>}
                                        <th>{t("Processes")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderDetails.products.map((orderProduct, orderProductIndex) => (
                                        <tr key={orderProduct._id}>
                                            <td>{orderProduct._id}</td>
                                            <td>
                                                {orderProduct.quantity}
                                            </td>
                                            <td>
                                                {orderProduct.name}
                                            </td>
                                            <td>
                                                {orderProduct.unitPrice}
                                            </td>
                                            <td>
                                                {orderProduct.unitDiscount}
                                            </td>
                                            <td>
                                                {orderProduct.unitPrice * orderProduct.quantity}
                                            </td>
                                            <td>
                                                {(orderProduct.unitPrice - orderProduct.unitDiscount) * orderProduct.quantity}
                                            </td>
                                            <td>
                                                <img
                                                    src={`${process.env.BASE_API_URL}/${orderProduct.imagePath}`}
                                                    alt={t("Product Image")}
                                                    width="100"
                                                    height="100"
                                                />
                                            </td>
                                            {ordersType === "normal" && <td>
                                                <h6 className="mb-4 fw-bold">{t("Message")}:</h6>
                                                <h6 className="mb-4 fw-bold">{orderProduct?.message ? orderProduct.message : "-------"}</h6>
                                                <hr />
                                                <h6 className="mb-4 fw-bold">{t("Custom Text")}:</h6>
                                                <h6 className="mb-4 fw-bold">{orderProduct?.extraData?.customText ? orderProduct.extraData.customText : "-------"}</h6>
                                                <hr />
                                                <h6 className="mb-4 fw-bold">{t("Additional Notes")}:</h6>
                                                <h6 className="mb-4 fw-bold">{orderProduct?.extraData?.additionalNotes ? orderProduct.extraData.customText : "-------"}</h6>
                                                <hr />
                                                <h6 className="mb-4 fw-bold">{t("Additional Files")}:</h6>
                                                {/* {orderProduct?.extraData?.additionalFiles?.length > 0 ? <div className="mb-4 fw-bold additional-files">
                                                    {orderProduct.extraData.additionalFiles.map((file, fileIndex) => (
                                                        <div className="file-download-box mb-3" key={fileIndex}>
                                                            {!waitMsg && !errorMsg && selectedOrderProductIndex !== orderProductIndex && selectedFileIndex !== fileIndex && <button
                                                                className="btn btn-success"
                                                                onClick={() => downloadFile(`${process.env.BASE_API_URL}/${file}`, orderProduct.name, orderProductIndex, fileIndex)}
                                                            >
                                                                {t("Download File") + ` ${fileIndex + 1}`}
                                                            </button>}
                                                            {waitMsg && selectedOrderProductIndex === orderProductIndex && selectedFileIndex === fileIndex && <button
                                                                className="btn btn-info"
                                                                disabled
                                                            >
                                                                {t(waitMsg)}
                                                            </button>}
                                                            {errorMsg && selectedOrderProductIndex === orderProductIndex && selectedFileIndex === fileIndex && <button
                                                                className="btn btn-danger"
                                                                disabled
                                                            >
                                                                {t(errorMsg)}
                                                            </button>}
                                                        </div>
                                                    ))}
                                                </div> : <h6 className="mb-4 fw-bold">-------</h6>} */}
                                            </td>}
                                            {ordersType === "return" && <>
                                                <td>{<span className="text-danger fw-bold">{orderProduct.returnReason}</span>}</td>
                                                <td>{orderProduct.approvedQuantity}</td>
                                                <td>{orderProduct.unitPrice * orderProduct.approvedQuantity}</td>
                                                <td>{(orderProduct.unitPrice - orderProduct.unitDiscount) * orderProduct.approvedQuantity}</td>
                                                <td>{orderProduct.notes ? orderProduct.notes : <span className="text-danger fw-bold">{t("No Notes")}</span>}</td>
                                                <td>{orderProduct.status}</td>
                                            </>}
                                            <td>
                                                {ordersType === "return" && orderProduct.status === "checking" ? <>
                                                    {selectedOrderProductIndex !== orderProductIndex && <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        onClick={() => handleChangeReturnOrderProductStatus(orderProductIndex, "approving")}
                                                    >
                                                        {t("Approve")}
                                                    </button>}
                                                    {waitMsg === "Please Wait To Updating ..." && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        {t("Approving")} ...
                                                    </button>}
                                                    {selectedOrderProductIndex !== orderProductIndex && <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        onClick={() => handleChangeReturnOrderProductStatus(orderProductIndex, "rejecting")}
                                                    >
                                                        {t("Reject")}
                                                    </button>}
                                                    {waitMsg === "Please Wait To Deleting ..." && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        {t("Rejecting")} ...
                                                    </button>}
                                                    {successMsg && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-success d-block mx-auto global-button"
                                                        disabled
                                                    >{t(successMsg)}</button>}
                                                    {errorMsg && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-danger d-block mx-auto global-button"
                                                        disabled
                                                    >{t(errorMsg)}</button>}
                                                </> : <span className="fw-bold text-danger">{t("Reject Actions")}</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div> : <p className="alert alert-danger order-not-found-error">{t("Sorry, This Order Is Not Found")}</p>}
                        {Object.keys(orderDetails).length > 0 && <div className="rest-info mt-5">
                            <section className="customer-info mb-5">
                                <h4 className="fw-bold mb-4 border border-2 border-dark bg-white p-3">{t("Customer Info")}</h4>
                                <div className="row">
                                    <div className="col-md-12 bg-white border border-2 border-dark">
                                        <div className={`customer-info-box ${i18n.language !== "ar" ? "text-start" : "text-end"} p-3`}>
                                            <p className="city fw-bold">{t("City")}: {ordersType === "normal" ? orderDetails.city : orderDetails.originalOrder.city}</p>
                                            <p className="address fw-bold">{t("Address")}: {ordersType === "normal" ? orderDetails.address : orderDetails.originalOrder.address}</p>
                                            <p className="address-details fw-bold">{t("Address Details")}: {ordersType === "normal" ? orderDetails.addressDetails : orderDetails.originalOrder.addressDetails}</p>
                                            <p className="closest-point fw-bold">{t("Closest Point")}: {ordersType === "normal" ? (orderDetails.closestPoint ? orderDetails.closestPoint : "-------") : (orderDetails.originalOrder.closestPoint ? orderDetails.originalOrder.closestPoint : "-------")}</p>
                                            <p className="additional-address-details fw-bold">{t("Additional Address Details")}: {ordersType === "normal" ? (orderDetails.additionalAddressDetails ? orderDetails.additionalAddressDetails : "-------") : (orderDetails.originalOrder.additionalAddressDetails ? orderDetails.originalOrder.additionalAddressDetails : "-------")}</p>
                                            <p className="floor-number fw-bold">{t("Floor Number")}: {ordersType === "normal" ? orderDetails.floorNumber : orderDetails.originalOrder.floorNumber}</p>
                                            <p className="additional-notes fw-bold">{t("Additional Notes")}: {ordersType === "normal" ? (orderDetails.additionalNotes ? orderDetails.additionalNotes : "-------") : (orderDetails.originalOrder.additionalNotes ? orderDetails.originalOrder.additionalNotes : "-------")}</p>
                                            <p className="mobile-phone fw-bold">{t("Mobile Phone")}: {ordersType === "normal" ? orderDetails.mobilePhone : orderDetails.originalOrder.mobilePhone}</p>
                                            <p className="backup-mobile-phone fw-bold">{t("Backup Mobile Phone")}: {ordersType === "normal" ? (orderDetails.backupMobilePhone ? orderDetails.backupMobilePhone : "-------") : (orderDetails.originalOrder.backupMobilePhone ? orderDetails.originalOrder.backupMobilePhone : "-------")}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section className="shipping-info mb-5">
                                <h4 className="fw-bold mb-4 border border-2 border-dark bg-white p-3">{t("Shipping Info")}</h4>
                                <div className="row">
                                    <div className="col-md-12 bg-white border border-2 border-dark">
                                        <div className={`shipping-cost-box ${i18n.language !== "ar" ? "text-start" : "text-end"} p-3`}>
                                            <h6 className="fw-bold">{t("Shipping Cost")}</h6>
                                            <hr />
                                            <p className="shipping-cost fw-bold">{t("Shipping Cost")}: {ordersType === "normal" ? orderDetails.shippingCost : orderDetails.originalOrder.shippingCost}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section className="other-info mb-5">
                                <h4 className="fw-bold mb-4 border border-2 border-dark bg-white p-3">{t("Other Info")}</h4>
                                <div className="row">
                                    <div className="col-md-6 bg-white border border-2 border-dark">
                                        <div className={`creator-box ${i18n.language !== "ar" ? "text-start" : "text-end"} p-3`}>
                                            <h6 className="fw-bold m-0">{t("User Id")}: {ordersType === "normal" ? orderDetails.userId : orderDetails.originalOrder.userId}</h6>
                                        </div>
                                    </div>
                                    <div className="col-md-6 bg-white border border-2 border-dark">
                                        <div className={`payment-gateway-box ${i18n.language !== "ar" ? "text-start" : "text-end"} p-3`}>
                                            <h6 className="fw-bold m-0">{t("Payment Gateway")}: {ordersType === "normal" ? t(orderDetails.paymentGateway) : t(orderDetails.originalOrder.paymentGateway)}</h6>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>}
                    </div>
                </section>
                {/* End Content Section */}
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div >
    );
}

export async function getServerSideProps({ params, query }) {
    const { orderId } = params;
    const { ordersType } = query;
    if (ordersType !== "normal" && ordersType !== "return") {
        return {
            redirect: {
                permanent: false,
                destination: "/",
            },
        }
    }
    if (!orderId) {
        return {
            redirect: {
                permanent: false,
                destination: "/orders-managment",
            },
        }
    } else {
        return {
            props: {
                orderIdAsProperty: orderId,
                ordersType,
            },
        }
    }
}
