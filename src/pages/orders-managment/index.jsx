import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import PaginationBar from "@/components/PaginationBar";
import { inputValuesValidation } from "../../../public/global_functions/validations";
import { getAdminInfo, getDateFormated, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";
import TableLoader from "@/components/TableLoader";
import { useTranslation } from "react-i18next";

export default function OrdersManagment({ ordersType }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [allOrdersInsideThePage, setAllOrdersInsideThePage] = useState([]);

    const [isSendEmailToTheCustomerList, setIsSendEmailToTheCustomerList] = useState([]);

    const [isGetOrders, setIsGetOrders] = useState(false);

    const [selectedOrderIndex, setSelectedOrderIndex] = useState(-1);

    const [waitMsg, setWaitMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [errorMsgOnGetOrdersData, setErrorMsgOnGetOrdersData] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        storeId: "",
        orderNumber: -1,
        orderId: "",
        status: "",
        customerName: "",
        email: "",
        isDeleted: false,
    });

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

    const { t, i18n } = useTranslation();

    const ordersTypeByMakeFirstLetterCapital = ordersType.replace(ordersType[0], ordersType[0].toUpperCase());

    const pageSize = 10;

    const orderStatus = ["pending", "shipping", "completed", "cancelled"];

    const returnedOrderStatus = [
        "awaiting products",
        "received products",
        "checking products",
        "partially return products",
        "fully return products",
        "return refused"
    ];

    const displayBillingButtonStatusForReturnOrder = ["partially return products", "fully return products"];

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
                            result = await getAllOrdersInsideThePage(1, pageSize, getFilteringString(filters));
                            setAllOrdersInsideThePage(result.data.orders);
                            setTotalPagesCount(Math.ceil(result.ordersCount / pageSize));
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

    const getFilteringString = (filters) => {
        let filteringString = "destination=admin&";
        if (filters.orderNumber !== -1 && filters.orderNumber) filteringString += `orderNumber=${filters.orderNumber}&`;
        if (filters.orderId) filteringString += `_id=${filters.orderId}&`;
        if (filters.status) filteringString += `status=${filters.status}&`;
        if (filters.customerName) filteringString += `customerName=${filters.customerName}&`;
        if (filters.email) filteringString += `email=${filters.email}&`;
        if (filters.isDeleted) filteringString += `isDeleted=yes&`;
        else filteringString += `isDeleted=no&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const getAllOrdersInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/orders/all-orders-inside-the-page?ordersType=${ordersType}&pageNumber=${pageNumber}&pageSize=${pageSize}&language=${process.env.defaultLanguage}&${filters ? filters : ""}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage)
                }
            })).data;
        }
        catch (err) {
            throw err;
        }
    }

    const getPreviousPage = async () => {
        try {
            setIsGetOrders(true);
            setErrorMsgOnGetOrdersData("");
            const newCurrentPage = currentPage - 1;
            setAllOrdersInsideThePage((await getAllOrdersInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
            setCurrentPage(newCurrentPage);
            setIsGetOrders(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetOrdersData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetOrders(true);
            setErrorMsgOnGetOrdersData("");
            const newCurrentPage = currentPage + 1;
            setAllOrdersInsideThePage((await getAllOrdersInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
            setCurrentPage(newCurrentPage);
            setIsGetOrders(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetOrdersData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetOrders(true);
            setErrorMsgOnGetOrdersData("");
            setAllOrdersInsideThePage((await getAllOrdersInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data);
            setCurrentPage(pageNumber);
            setIsGetOrders(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetOrdersData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const filterOrders = async (filters) => {
        try {
            setFormValidationErrors({});
            // const errorsObject = inputValuesValidation([
            //     {
            //         name: "orderNumber",
            //         value: filters.orderNumber,
            //         rules: {
            //             minNumber: {
            //                 value: 1,
            //                 msg: "Sorry, Min Number Is: 1 !!",
            //             },
            //         },
            //     },
            // ]);
            const errorsObject = {};
            if (Object.keys(errorsObject).length == 0) {
                setIsGetOrders(true);
                setCurrentPage(1);
                const result = (await getAllOrdersInsideThePage(1, pageSize, getFilteringString(filters))).data;
                setAllOrdersInsideThePage(result.orders);
                setTotalPagesCount(Math.ceil(result.ordersCount / pageSize));
                setIsGetOrders(false);
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsGetOrders(false);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const changeOrderData = (orderIndex, fieldName, newValue) => {
        if (fieldName === "isSendEmailToTheCustomer") {
            isSendEmailToTheCustomerList[orderIndex] = newValue;
        } else {
            allOrdersInsideThePage[orderIndex][fieldName] = newValue;
        }
    }

    const updateOrderData = async (orderIndex) => {
        try {
            setFormValidationErrors({});
            setSelectedOrderIndex(orderIndex);
            setWaitMsg("Please Wait To Updating ...");
            const result = (await axios.post(`${process.env.BASE_API_URL}/orders/update-order/${allOrdersInsideThePage[orderIndex]._id}?ordersType=${ordersType}&language=${process.env.defaultLanguage}${isSendEmailToTheCustomerList[orderIndex] && allOrdersInsideThePage[orderIndex].status !== "pending" ? "&isSendEmailToTheCustomer=true" : ""}`, {
                status: allOrdersInsideThePage[orderIndex].status,
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
                    setSelectedOrderIndex(-1);
                    clearTimeout(successTimeout);
                }, 3000);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedOrderIndex(-1);
                    clearTimeout(errorTimeout);
                }, 3000);
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
                    setSelectedOrderIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteOrder = async (orderIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedOrderIndex(orderIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/orders/delete-order/${allOrdersInsideThePage[orderIndex]._id}?ordersType=${ordersType}&language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedOrderIndex(-1);
                    setAllOrdersInsideThePage(allOrdersInsideThePage.filter((order, index) => index !== orderIndex));
                    clearTimeout(successTimeout);
                }, 3000);
            } else {
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedOrderIndex(-1);
                    clearTimeout(errorTimeout);
                }, 3000);
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
                    setSelectedOrderIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="orders-managment admin-dashboard">
            <Head>
                <title>{process.env.storeName} {t("Admin Dashboard")} - {t(ordersTypeByMakeFirstLetterCapital)} {t("Orders Managment")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-5 pb-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">{t("Hi, Mr")} {adminInfo.fullName} {t(`In Your ${ordersTypeByMakeFirstLetterCapital} Orders Managment Page`)}</h1>
                        <section className="filters mb-3 bg-white border-3 border-info p-3 text-start">
                            <h5 className="section-name fw-bold text-center">{t("Filters")}: </h5>
                            <hr />
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <h6 className={`fw-bold text-center ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}>{t("Order Number")}</h6>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder={t("Please Enter Order Number")}
                                        min="1"
                                        max={allOrdersInsideThePage.length}
                                        onChange={(e) => setFilters({ ...filters, orderNumber: e.target.valueAsNumber ? e.target.valueAsNumber : -1 })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <h6 className={`fw-bold text-center ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}>{t("Order Id")}</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("Please Enter Order Id")}
                                        onChange={(e) => setFilters({ ...filters, orderId: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <h6 className={`fw-bold text-center ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}>{t("Status")}</h6>
                                    <select
                                        className="select-order-status form-select"
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="" hidden>{t("Please Enter Status")}</option>
                                        <option value="">{t("All")}</option>
                                        {ordersType === "normal" ? orderStatus.map((status) => <option value={status}>{t(status)}</option>) : returnedOrderStatus.map((status) => <option value={status}>{status}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-6 mt-4">
                                    <h6 className={`fw-bold text-center ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}>{t("Customer Name")}</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("Please Enter Customer Name")}
                                        onChange={(e) => setFilters({ ...filters, customerName: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-6 mt-4">
                                    <h6 className={`fw-bold text-center ${i18n.language !== "ar" ? "me-2" : "ms-2"}`}>{t("Customer Email")}</h6>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder={t("Please Enter Customer Email")}
                                        onChange={(e) => setFilters({ ...filters, email: e.target.value.trim() })}
                                    />
                                </div>
                            </div>
                            {!isGetOrders && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                onClick={() => filterOrders(filters)}
                            >
                                {t("Filter")}
                            </button>}
                            {isGetOrders && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                disabled
                            >
                                {t("Filtering")} ...
                            </button>}
                        </section>
                        {allOrdersInsideThePage.length > 0 && !isGetOrders && <section className="orders-data-box p-3 data-box admin-dashbboard-data-box">
                            <table className="orders-data-table mb-4 managment-table bg-white admin-dashbboard-data-table">
                                <thead>
                                    <tr>
                                        <th>{t("Order Number")}</th>
                                        <th>{t("Order Id")}</th>
                                        {ordersType === "normal" && <th>{t("Checkout Status")}</th>}
                                        <th>{t("Status")}</th>
                                        <th>{t("Total Amount")}</th>
                                        {ordersType === "return" && <th>{t("Approved Total Amount")}</th>}
                                        <th>{t("Added Date")}</th>
                                        <th>{t("Processes")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allOrdersInsideThePage.map((order, orderIndex) => (
                                        <tr key={order._id}>
                                            <td>{order.orderNumber}</td>
                                            <td>{order._id}</td>
                                            {ordersType === "normal" && <td>
                                                <div className={`p-2 text-white ${order.checkoutStatus === "Checkout Successfull" ? "bg-success" : "bg-danger"}`}>
                                                    {t(order.checkoutStatus)}
                                                </div>
                                            </td>}
                                            <td>
                                                <h6 className="fw-bold">{t(order.status)}</h6>
                                                {((ordersType === "normal" && order.checkoutStatus === "Checkout Successfull" && order.status !== "cancelled") || (ordersType === "return")) && <>
                                                    <hr />
                                                    <select
                                                        className="select-order-status form-select mb-5"
                                                        onChange={(e) => changeOrderData(orderIndex, "status", e.target.value)}
                                                    >
                                                        <option value="" hidden>{t("Please Enter Status")}</option>
                                                        {ordersType === "normal" ? orderStatus.map((status) => <option value={status}>{t(status)}</option>) : returnedOrderStatus.map((status) => <option value={status}>{status}</option>)}
                                                    </select>
                                                    {/* <div className="form-check border border-2 border-dark p-3">
                                                        <input
                                                            className="form-check-input m-0"
                                                            type="checkbox"
                                                            id="sendEmailCheckout"
                                                            onChange={(e) => changeOrderData(orderIndex, "isSendEmailToTheCustomer", e.target.checked)}
                                                        />
                                                        <label className="form-check-label" htmlFor="sendEmailCheckout" onClick={(e) => changeOrderData(orderIndex, "isSendEmailToTheCustomer", e.target.checked)}>
                                                            Send Email To Customer
                                                            <span className="d-block mt-3 fw-bold">( In Status: {ordersType === "normal" ? orderStatus.map((status, index) => {
                                                                if (status !== "pending" && status !== "cancelled") return status + (index !== orderStatus.length - 2 ? " or " : "");
                                                            }) : returnedOrderStatus.map((status, index) => {
                                                                if (status !== "awaiting products") return status + (index !== returnedOrderStatus.length - 1 ? " or " : "");
                                                            })} )</span>
                                                        </label>
                                                    </div> */}
                                                    {ordersType === "normal" && <div className="form-check border border-2 border-dark p-3">
                                                        <input
                                                            className="form-check-input m-0"
                                                            type="checkbox"
                                                            id="sendEmailCheckout"
                                                            onChange={(e) => changeOrderData(orderIndex, "isSendEmailToTheCustomer", e.target.checked)}
                                                        />
                                                        <label className="form-check-label" htmlFor="sendEmailCheckout" onClick={(e) => changeOrderData(orderIndex, "isSendEmailToTheCustomer", e.target.checked)}>
                                                            {t("Send Email To Customer")}
                                                            <span className="d-block mt-3 fw-bold">( {t("In Status")}: {ordersType === "normal" && orderStatus.map((status, index) => {
                                                                if (status !== "pending" && status !== "cancelled") return t(status) + (index !== orderStatus.length - 2 ? ` ${t("or")} ` : "");
                                                            })}</span>
                                                        </label>
                                                    </div>}
                                                </>}
                                            </td>
                                            <td>
                                                {order.orderAmount}
                                            </td>
                                            {ordersType === "return" && <td>{order.approvedOrderAmount}</td>}
                                            <td>{getDateFormated(order.addedDate)}</td>
                                            <td>
                                                {!order.isDeleted && orderIndex !== selectedOrderIndex && <>
                                                    {((ordersType === "normal" && order.checkoutStatus === "Checkout Successfull") || (ordersType === "return")) && <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        onClick={() => updateOrderData(orderIndex)}
                                                    >
                                                        {t("Update")}
                                                    </button>}
                                                    <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        onClick={() => deleteOrder(orderIndex)}
                                                    >
                                                        {t("Delete")}
                                                    </button>
                                                </>}
                                                {waitMsg && orderIndex === selectedOrderIndex && <button
                                                    className="btn btn-info d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    {t(waitMsg)}
                                                </button>}
                                                {successMsg && orderIndex === selectedOrderIndex && <button
                                                    className="btn btn-success d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    {t(successMsg)}
                                                </button>}
                                                {errorMsg && orderIndex === selectedOrderIndex && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    {t(erroMsg)}
                                                </button>}
                                                {order.isDeleted && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    {t("Deleted")}
                                                </button>}
                                                {selectedOrderIndex !== orderIndex && <>
                                                    <Link
                                                        href={`/orders-managment/${order._id}?ordersType=${ordersType}`}
                                                        className="btn btn-success d-block mx-auto mb-4 global-button"
                                                    >{t("Show Full Details")}</Link>
                                                    {(order.checkoutStatus === "Checkout Successfull" || (ordersType === "return" && displayBillingButtonStatusForReturnOrder.includes(order.status)) && order.products.filter((product) => product.status !== "checking").length === order.products.length) && <Link
                                                        href={`/orders-managment/billing/${order._id}?ordersType=${ordersType}`}
                                                        className="btn btn-success d-block mx-auto mb-4 global-button"
                                                    >{t("Show Billing")}</Link>}
                                                </>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>}
                        {allOrdersInsideThePage.length === 0 && !isGetOrders && <NotFoundError errorMsg={t("Sorry, Can't Find Any Orders")} />}
                        {isGetOrders && <TableLoader />}
                        {errorMsgOnGetOrdersData && <NotFoundError errorMsg={errorMsgOnGetOrdersData} />}
                        {totalPagesCount > 1 && !isGetOrders &&
                            <PaginationBar
                                totalPagesCount={totalPagesCount}
                                currentPage={currentPage}
                                getPreviousPage={getPreviousPage}
                                getNextPage={getNextPage}
                                getSpecificPage={getSpecificPage}
                            />
                        }
                    </div>
                </section>
                {/* End Content Section */}
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}

export function getServerSideProps({ query }) {
    const { ordersType } = query;
    if (ordersType !== "normal" && ordersType !== "return") {
        return {
            redirect: {
                permanent: false,
                destination: "/",
            },
        }
    }
    return {
        props: {
            ordersType,
        }
    }
}