import { useState } from "react";
import { GrFormClose } from "react-icons/gr";
import axios from "axios";
import { useRouter } from "next/router";
import { inputValuesValidation } from "../../../public/global_functions/validations";
import FormFieldErrorBox from "../FormFieldErrorBox";
import { getOrderDetails } from "../../../public/global_functions/popular";

export default function ReturnOrderProductStatusChangeBox({
    orderProductAction,
    setIsDisplayOrderProductStatusChangeBox,
    selectedProduct,
    setSelectedOrderProductIndex,
    orderId,
    setOrderDetails
}) {

    const [approvedQuantity, setApprovedQuantity] = useState("");

    const [notes, setNotes] = useState("");

    const [waitMsg, setWaitMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

    const handleClosePopupBox = () => {
        setIsDisplayOrderProductStatusChangeBox(false);
        setSelectedOrderProductIndex(-1);
    }

    const approveOnReturn = async () => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "approvedQuantity",
                    value: approvedQuantity,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        minNumber: {
                            value: 1,
                            msg: "Sorry, The Minimum Value Is: 1"
                        },
                        maxNumber: {
                            value: selectedProduct.quantity,
                            msg: `Sorry, The Minimum Value Is: ${selectedProduct.quantity}`
                        }
                    },
                }
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Waiting ...");
                const result = (await axios.post(`${process.env.BASE_API_URL}/orders/approving-on-return-product/${orderId}/${selectedProduct._id}?language=${process.env.defaultLanguage}`, {
                    approvedQuantity,
                    notes
                },
                    {
                        headers: {
                            Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                        }
                    }
                )).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(async () => {
                        setSuccessMsg("");
                        setOrderDetails((await getOrderDetails(orderId, "return")).data);
                        handleClosePopupBox();
                        clearTimeout(successTimeout);
                    }, 3000);
                }
                else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
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
                setWaitMsg("");
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const returnReject = async () => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "notes",
                    value: notes,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                }
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Waiting ...");
                const result = (await axios.delete(`${process.env.BASE_API_URL}/orders/reject-on-return-product/${orderId}?language=${process.env.defaultLanguage}`, {
                    notes
                },
                    {
                        headers: {
                            Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                        }
                    }
                )).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(async () => {
                        setSuccessMsg("");
                        setOrderDetails((await getOrderDetails(orderId, "return")).data);
                        handleClosePopupBox();
                        clearTimeout(successTimeout);
                    }, 3000);
                }
                else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
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
        <div className="change-return-order-status-box popup-box">
            <div className="content-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                {!waitMsg && !errorMsg && !successMsg && <GrFormClose className="close-popup-box-icon" onClick={handleClosePopupBox} />}
                <h4 className="mb-4">Are You Sure From: {orderProductAction} Product: ( {selectedProduct.name} ) ?</h4>
                <form className="change-store-status-form w-50" onSubmit={(e) => e.preventDefault()}>
                    {
                        !waitMsg &&
                        !errorMsg &&
                        !successMsg &&
                        <section className="change-order-product-status mb-4">
                            {orderProductAction === "approving" && <div className="approved-quantity-field-box">
                                <input
                                    type="number"
                                    placeholder="Please Enter Approved Quantity"
                                    className={`form-control p-3 border-2 ${formValidationErrors["approvedQuantity"] ? "border-danger mb-3" : "mb-4"}`}
                                    onChange={(e) => setApprovedQuantity(e.target.value)}
                                />
                            </div>}
                            {formValidationErrors["approvedQuantity"] && <FormFieldErrorBox errorMsg={formValidationErrors["approvedQuantity"]} />}
                            <div className="notes-field-box">
                                <textarea
                                    placeholder={orderProductAction === "approving" ? "Please Enter Notes" : "Please Enter Reason"}
                                    className={`form-control p-3 border-2 ${formValidationErrors["notes"] ? "border-danger mb-3" : "mb-5"}`}
                                    onChange={(e) => setNotes(e.target.value.trim())}
                                ></textarea>
                            </div>
                            {formValidationErrors["notes"] && <FormFieldErrorBox errorMsg={formValidationErrors["notes"]} />}
                        </section>
                    }
                    {
                        !waitMsg &&
                        !errorMsg &&
                        !successMsg &&
                        orderProductAction === "approving" &&
                        <button
                            className="btn btn-success d-block mx-auto mb-4 global-button"
                            onClick={approveOnReturn}
                        >
                            Approve
                        </button>
                    }
                    {
                        !waitMsg &&
                        !errorMsg &&
                        !successMsg &&
                        orderProductAction === "rejecting" &&
                        <button
                            className="btn btn-success d-block mx-auto mb-4 global-button"
                            onClick={returnReject}
                        >
                            Reject
                        </button>
                    }
                    {waitMsg &&
                        <button
                            className="btn btn-info d-block mx-auto mb-3 global-button"
                            disabled
                        >
                            {waitMsg}
                        </button>
                    }
                    {errorMsg &&
                        <button
                            className="btn btn-danger d-block mx-auto mb-3 global-button"
                            disabled
                        >
                            {errorMsg}
                        </button>
                    }
                    {successMsg &&
                        <button
                            className="btn btn-success d-block mx-auto mb-3 global-button"
                            disabled
                        >
                            {successMsg}
                        </button>
                    }
                    <button
                        className="btn btn-danger d-block mx-auto global-button"
                        disabled={waitMsg || errorMsg || successMsg}
                        onClick={handleClosePopupBox}
                    >
                        Close
                    </button>
                </form>
            </div>
        </div>
    );
}