import { useState } from "react";
import { GrFormClose } from "react-icons/gr";
import axios from "axios";
import { useRouter } from "next/router";
import { inputValuesValidation } from "../../../public/global_functions/validations";
import FormFieldErrorBox from "../FormFieldErrorBox";

export default function ReturnOrderProductStatusChangeBox({
    orderProductAction,
    setIsDisplayOrderProductStatusChangeBox,
    setOrderProductAction,
    selectedProduct,
    handleChangeOrderProductStatus,
}) {

    const [notes, setNotes] = useState("");

    const [waitMsg, setWaitMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

    const handleClosePopupBox = () => {
        setIsDisplayOrderProductStatusChangeBox(false);
        setOrderProductAction("");
    }

    const approveOnReturn = async (storeId) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "adminPassword",
                    value: adminPassword,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isValidPassword: {
                            msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter."
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Waiting ...");
                const result = (await axios.post(`${process.env.BASE_API_URL}/stores/approve-store/${storeId}?password=${adminPassword}&language=${process.env.defaultLanguage}`, undefined,
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
                        handleClosePopupBox();
                        handleChangeOrderProductStatus("approving");
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

    const returnReject = async (storeId) => {
        try {
            setWaitMsg("Please Waiting ...");
            const result = (await axios.delete(`${process.env.BASE_API_URL}/stores/reject-store/${storeId}?language=${process.env.defaultLanguage}`,
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
                    handleClosePopupBox();
                    handleChangeOrderProductStatus("rejecting");
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
                <h4 className="mb-4">Are You Sure From: {orderProductAction} Order Product: ( {selectedProduct.name} ) ?</h4>
                <form className="change-store-status-form w-50" onSubmit={(e) => e.preventDefault()}>
                    {
                        !waitMsg &&
                        !errorMsg &&
                        !successMsg &&
                        <section className="change-order-product-status mb-4">
                            <div className="password-field-box">
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
                            onClick={() => approveOnReturn(selectedProduct._id)}
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
                            onClick={() => returnReject(selectedProduct._id)}
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