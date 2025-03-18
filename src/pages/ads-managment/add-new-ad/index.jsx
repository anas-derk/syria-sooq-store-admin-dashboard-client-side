import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo } from "../../../../public/global_functions/popular";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";

export default function AddNewAd() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [advertisementType, setAdvertisementType] = useState("");

    const [adContent, setAdContent] = useState("");

    const [adCity, setAdCity] = useState("");

    const [adImage, setAdImage] = useState(null);

    const adImageFileRef = useRef();

    const [waitMsg, setWaitMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

    const cites = [
        "lattakia",
        "tartus",
        "homs",
        "hama",
        "idleb",
        "daraa",
        "suwayda",
        "deer-alzoor",
        "raqqa",
        "hasakah",
        "damascus",
        "rif-damascus",
        "aleppo",
        "quneitra"
    ];

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

    const addNewAd = async (e) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            let validationInputs = [];
            if (advertisementType === "panner") {
                validationInputs = [
                    {
                        name: "adImage",
                        value: adImage,
                        rules: {
                            isRequired: {
                                msg: "Sorry, This Field Can't Be Empty !!",
                            },
                            isImage: {
                                msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Or WEBP Image File !!",
                            },
                        },
                    },
                    {
                        name: "adCity",
                        value: adCity,
                        rules: {
                            isRequired: {
                                msg: "Sorry, This Field Can't Be Empty !!",
                            },
                        },
                    },
                ];
            } else {
                validationInputs = [
                    {
                        name: "adContent",
                        value: adContent,
                        rules: {
                            isRequired: {
                                msg: "Sorry, This Field Can't Be Empty !!",
                            },
                        },
                    },
                    {
                        name: "adImage",
                        value: adImage,
                        rules: {
                            isRequired: {
                                msg: "Sorry, This Field Can't Be Empty !!",
                            },
                            isImage: {
                                msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Or WEBP Image File !!",
                            },
                        },
                    },
                ];
            }
            const errorsObject = inputValuesValidation(validationInputs);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                let advertisementData = new FormData();
                if (advertisementType === "elite") advertisementData.append("content", adContent);
                else advertisementData.append("city", adCity);
                advertisementData.append("adImage", adImage);
                advertisementData.append("type", advertisementType);
                setWaitMsg("Please Waiting To Add New Advertisement ...");
                const result = (await axios.post(`${process.env.BASE_API_URL}/ads/add-new-ad?language=${process.env.defaultLanguage}`, advertisementData, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setAdContent("");
                        setAdImage(null);
                        setAdCity("");
                        adImageFileRef.current.value = "";
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg(result.msg);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setAdContent("");
                        clearTimeout(errorTimeout);
                    }, 1500);
                }
            }
        }
        catch (err) {
            console.log(err)
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
        <div className="add-new-ad admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Add New Advertisement</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.fullName} In Your Add New Advertisement Page
                    </h1>
                    <section className="filters mb-3 bg-white border-3 border-info p-3 text-start w-100">
                        <h5 className="section-name fw-bold text-center">Select Advertisement Type:</h5>
                        <hr />
                        <div className="row mb-4">
                            <div className="col-md-12">
                                <h6 className="me-2 fw-bold text-center">Advertisement Type</h6>
                                <select
                                    className="select-advertisement-type form-select"
                                    onChange={(e) => setAdvertisementType(e.target.value)}
                                    defaultValue="text"
                                >
                                    <option value="" hidden>Pleae Select Advertisement Type</option>
                                    <option value="panner">Panner</option>
                                    <option value="elite">Elite</option>
                                </select>
                            </div>
                        </div>
                    </section>
                    <form className="add-new-ad-form admin-dashbboard-form" onSubmit={addNewAd}>
                        {advertisementType === "elite" &&
                            <section className="ad-content mb-4">
                                <input
                                    type="text"
                                    className={`form-control p-2 border-2 ad-name-field ${formValidationErrors["adContent"] ? "border-danger mb-3" : "mb-4"}`}
                                    placeholder="Please Enter Ad Content"
                                    onChange={(e) => setAdContent(e.target.value)}
                                    value={adContent}
                                />
                                {formValidationErrors["adContent"] && <FormFieldErrorBox errorMsg={formValidationErrors["adContent"]} />}
                            </section>}
                        <section className="ad-image mb-4">
                            <input
                                type="file"
                                className={`form-control p-2 border-2 ad-image-field ${formValidationErrors["adImage"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Select Advertisement Image"
                                onChange={(e) => setAdImage(e.target.files[0])}
                                ref={adImageFileRef}
                                value={adImageFileRef.current?.value}
                            />
                            {formValidationErrors["adImage"] && <FormFieldErrorBox errorMsg={formValidationErrors["adImage"]} />}
                        </section>
                        {advertisementType === "panner" && <section className="ad-image mb-4">
                            <select
                                className={`select-advertisement-city form-select ${formValidationErrors["adCity"] ? "border-danger mb-3" : "mb-4"}`}
                                onChange={(e) => setAdCity(e.target.value)}
                                value={adCity}
                            >
                                <option value="" hidden>Pleae Select Advertisement City</option>
                                {cites.map((city) => <option key={city} value={city}>{city}</option>)}
                            </select>
                            {formValidationErrors["adCity"] && <FormFieldErrorBox errorMsg={formValidationErrors["adCity"]} />}
                        </section>}
                        {!waitMsg && !successMsg && !errorMsg && <button
                            type="submit"
                            className="btn btn-success w-50 d-block mx-auto p-2 global-button"
                        >
                            Add Now
                        </button>}
                        {waitMsg && <button
                            type="button"
                            className="btn btn-danger w-50 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {waitMsg}
                        </button>}
                        {errorMsg && <button
                            type="button"
                            className="btn btn-danger w-50 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {errorMsg}
                        </button>}
                        {successMsg && <button
                            type="button"
                            className="btn btn-success w-75 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {successMsg}
                        </button>}
                    </form>
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}