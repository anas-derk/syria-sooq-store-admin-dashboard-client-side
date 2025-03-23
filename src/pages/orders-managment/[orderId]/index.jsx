import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { getAdminInfo, getOrderDetails } from "../../../../public/global_functions/popular";

export default function OrderDetails({ orderIdAsProperty, ordersType }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [orderDetails, setOrderDetails] = useState({});

    const [selectedOrderProductIndex, setSelectedOrderProductIndex] = useState(-1);

    const [waitMsg, setWaitMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const router = useRouter();

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

    const changeOrderProductData = (productIndex, fieldName, newValue) => {
        let productsTemp = orderDetails.products;
        productsTemp[productIndex][fieldName] = newValue;
        setOrderDetails({ ...orderDetails, products: productsTemp });
    }

    const updateOrderProductData = async (orderProductIndex) => {
        try {
            setWaitMsg("Please Wait To Updating ...");
            setSelectedOrderProductIndex(orderProductIndex);
            const result = (await axios.put(`${process.env.BASE_API_URL}/orders/products/update-product/${orderDetails._id}/${orderDetails.products[orderProductIndex].productId}?language=${process.env.defaultLanguage}`, {
                quantity: orderDetails.products[orderProductIndex].quantity,
                name: orderDetails.products[orderProductIndex].name,
                unitPrice: orderDetails.products[orderProductIndex].unitPrice,
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
                    setSelectedOrderProductIndex(-1);
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg(result.msg);
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedOrderProductIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
        catch (err) {
            console.log(err);
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setWaitMsg("");
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedOrderProductIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteProductFromOrder = async (orderProductIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedOrderProductIndex(orderProductIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/orders/products/delete-product/${orderDetails._id}/${orderDetails.products[orderProductIndex].productId}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    setSelectedOrderProductIndex(-1);
                    orderDetails.products = result.data.newOrderProducts;
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedOrderProductIndex(-1);
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
                    setSelectedOrderProductIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="order-details admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Order Details</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-4 pb-4 p-4">
                    <div className="container-fluid">
                        <h1 className="welcome-msg fw-bold mx-auto mt-3 mb-3">Hello {adminInfo.fullName} In Orders Details Page</h1>
                        {Object.keys(orderDetails).length > 0 ? <div className="order-details-box p-3 data-box admin-dashbboard-data-box">
                            <table className="order-data-table mb-5 managment-table admin-dashbboard-data-table">
                                <thead>
                                    <tr>
                                        <th>Reference / Product Id</th>
                                        <th>Quantity</th>
                                        <th>Name</th>
                                        <th>Unit Price</th>
                                        <th>Unit Discount</th>
                                        <th>Total Amount Before Discount</th>
                                        <th>Total</th>
                                        <th>Image</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderDetails.products.map((orderProduct, orderProductIndex) => (
                                        <tr key={orderProduct._id}>
                                            <td>{orderProduct._id}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control quantity"
                                                    defaultValue={orderProduct.quantity}
                                                    onChange={(e) => changeOrderProductData(orderProductIndex, "quantity", e.target.value.trim())}
                                                    disabled={true}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control name"
                                                    defaultValue={orderProduct.name}
                                                    onChange={(e) => changeOrderProductData(orderProductIndex, "name", e.target.value.trim())}
                                                    disabled={true}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control unit-price"
                                                    defaultValue={orderProduct.unitPrice}
                                                    onChange={(e) => changeOrderProductData(orderProductIndex, "unitPrice", e.target.value.trim())}
                                                    disabled={true}
                                                />
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
                                                    alt="product Image !!"
                                                    width="100"
                                                    height="100"
                                                />
                                            </td>
                                            <td>
                                                {!orderDetails.isDeleted && orderDetails.checkoutStatus === "Checkout Successfull" && orderDetails.status !== "cancelled" ? <>
                                                    {selectedOrderProductIndex !== orderProductIndex && <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        onClick={() => updateOrderProductData(orderProductIndex)}
                                                    >
                                                        Update
                                                    </button>}
                                                    {waitMsg === "Please Wait To Updating ..." && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        Updating ...
                                                    </button>}
                                                    {selectedOrderProductIndex !== orderProductIndex && orderDetails.products.length > 1 && <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        onClick={() => deleteProductFromOrder(orderProductIndex)}
                                                    >
                                                        Delete
                                                    </button>}
                                                    {waitMsg === "Please Wait To Deleting ..." && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        Deleting ...
                                                    </button>}
                                                    {successMsg && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-success d-block mx-auto global-button"
                                                        disabled
                                                    >{successMsg}</button>}
                                                    {errorMsg && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-danger d-block mx-auto global-button"
                                                        disabled
                                                    >{errorMsg}</button>}
                                                </> : <span className="fw-bold text-danger">Reject Actions</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div> : <p className="alert alert-danger order-not-found-error">Sorry, This Order Is Not Found !!</p>}
                        {Object.keys(orderDetails).length > 0 && <div className="rest-info">
                            <section className="customer-info mb-5">
                                <h4 className="fw-bold mb-4 border border-2 border-dark bg-white p-3">Customer Info</h4>
                                <div className="row">
                                    <div className="col-md-12 bg-white border border-2 border-dark">
                                        <div className="customer-info-box text-start p-3">
                                            <p className="city fw-bold">City: {orderDetails.originalOrder.city}</p>
                                            <p className="address fw-bold">Address: {orderDetails.originalOrder.address}</p>
                                            <p className="address-details fw-bold">Address Details: {orderDetails.originalOrder.addressDetails}</p>
                                            <p className="closest-point fw-bold">Closest Point: {orderDetails.originalOrder.closestPoint ? orderDetails.originalOrder.closestPoint : "-------"}</p>
                                            <p className="additional-address-details fw-bold">Additional Address Details: {orderDetails.originalOrder.additionalAddressDetails ? orderDetails.originalOrder.additionalAddressDetails : "-------"}</p>
                                            <p className="floor-number fw-bold">Floor Number: {orderDetails.originalOrder.floorNumber}</p>
                                            <p className="additional-notes fw-bold">Additional Notes: {orderDetails.originalOrder.additionalNotes ? orderDetails.originalOrder.additionalNotes : "-------"}</p>
                                            <p className="mobile-phone fw-bold">Mobile Phone: {orderDetails.originalOrder.mobilePhone}</p>
                                            <p className="backup-mobile-phone fw-bold">Backup Mobile Phone: {orderDetails.originalOrder.backupMobilePhone ? orderDetails.originalOrder.backupMobilePhone : "-------"}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section className="shipping-info mb-5">
                                <h4 className="fw-bold mb-4 border border-2 border-dark bg-white p-3">Shipping Info</h4>
                                <div className="row">
                                    <div className="col-md-12 bg-white border border-2 border-dark">
                                        <div className="shipping-cost-box text-start p-3">
                                            <h6 className="fw-bold">Shipping Cost</h6>
                                            <hr />
                                            <p className="shipping-cost fw-bold">Shipping Cost: {orderDetails.originalOrder.shippingCost}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section className="other-info mb-4">
                                <h4 className="fw-bold mb-4 border border-2 border-dark bg-white p-3">Other Info</h4>
                                <div className="row">
                                    <div className="col-md-6 bg-white border border-2 border-dark">
                                        <div className="creator-box text-start p-3">
                                            <h6 className="fw-bold m-0">User Id: {orderDetails.originalOrder.userId}</h6>
                                        </div>
                                    </div>
                                    <div className="col-md-6 bg-white border border-2 border-dark">
                                        <div className="payment-gateway-box text-start p-3">
                                            <h6 className="fw-bold m-0">Payment Gateway: {orderDetails.originalOrder.paymentGateway}</h6>
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
        </div>
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
