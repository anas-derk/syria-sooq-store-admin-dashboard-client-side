import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo } from "../../../../public/global_functions/popular";
import { HiOutlineBellAlert } from "react-icons/hi2";

export default function UpdateAndDeleteAds() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [allAds, setAllAds] = useState([]);

    const [selectedAdImageIndex, setSelectedAdImageIndex] = useState(-1);

    const [selectedAdIndex, setSelectedAdIndex] = useState(-1);

    const [waitChangeAdImageMsg, setWaitChangeAdImageMsg] = useState(false);

    const [errorChangeAdImageMsg, setErrorChangeAdImageMsg] = useState("");

    const [successChangeAdImageMsg, setSuccessChangeAdImageMsg] = useState("");

    const [waitMsg, setWaitMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [filters, setFilters] = useState({
        storeId: "",
    });

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

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
                            const filtersAsQuery = getFiltersAsQuery(tempFilters);
                            setAllAds((await getAllAds(filtersAsQuery)).data);
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
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const getAllAds = async (filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/ads/all-ads?language=${process.env.defaultLanguage}&${filters ? filters : ""}`)).data;
        }
        catch (err) {
            throw err;
        }
    }

    const changeAdData = (adIndex, fieldName, newValue) => {
        setSelectedAdImageIndex(-1);
        setSelectedAdIndex(-1);
        let adsTemp = allAds;
        adsTemp[adIndex][fieldName] = newValue;
        setAllAds(adsTemp);
    }

    const changeAdImage = async (imageIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "image",
                    value: allAds[imageIndex].image,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isImage: {
                            msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Image File !!",
                        },
                    },
                },
            ]);
            setSelectedAdImageIndex(imageIndex);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitChangeAdImageMsg("Please Wait To Change Image ...");
                let formData = new FormData();
                formData.append("adImage", allAds[imageIndex].image);
                const result = (await axios.put(`${process.env.BASE_API_URL}/ads/change-ad-image/${allAds[imageIndex]._id}?language=${process.env.defaultLanguage}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                if (!result.error) {
                    setWaitChangeAdImageMsg("");
                    setSuccessChangeAdImageMsg("Change Image Successfull !!");
                    let successTimeout = setTimeout(async () => {
                        setSuccessChangeAdImageMsg("");
                        setSelectedAdImageIndex(-1);
                        allAds[imageIndex].imagePath = result.data.newAdImagePath;
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setWaitChangeAdImageMsg("");
                    setErrorChangeAdImageMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorChangeAdImageMsg("");
                        setSelectedAdImageIndex(-1);
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
                setWaitChangeAdImageMsg("");
                setErrorChangeAdImageMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setWaitChangeAdImageMsg("");
                    setSelectedAdImageIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const updateAdInfo = async (adIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "adContent",
                    value: allAds[adIndex].content,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedAdIndex(adIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/ads/update-ad-content/${allAds[adIndex]._id}?language=${process.env.defaultLanguage}`, {
                    content: allAds[adIndex].content,
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
                        setSelectedAdIndex(-1);
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setSelectedAdIndex(-1);
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
                    setSelectedAdIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteAd = async (adIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedAdIndex(adIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/ads/${allAds[adIndex]._id}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedAdIndex(-1);
                    setAllAds(allAds.filter((ad, index) => index !== adIndex));
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedAdIndex(-1);
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
                    setSelectedAdIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="update-and-delete-ads admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Update / Delete Ads</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Update / Delete Ads Page
                    </h1>
                    {allAds.length > 0 && <section className="ads-box w-100">
                        <table className="ads-table mb-4 managment-table bg-white w-100">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Content</th>
                                    <th>Image</th>
                                    <th>Process</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allAds.map((ad, adIndex) => (
                                    <tr key={ad._id}>
                                        <td className="ad-type">{ad.type}</td>
                                        <td className="ad-content-cell">
                                            {ad.type === "elite" ? <section className="ad-content mb-4">
                                                <input
                                                    type="text"
                                                    className={`form-control d-block mx-auto p-2 border-2 ad-content-field ${formValidationErrors["adContent"] && adIndex === selectedAdIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    defaultValue={ad.content}
                                                    onChange={(e) => changeAdData(adIndex, "content", e.target.value.trim())}
                                                ></input>
                                                {formValidationErrors["adContent"] && adIndex === selectedAdIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["adContent"]}</span>
                                                </p>}
                                            </section> : <p>No Content</p>}
                                        </td>
                                        <td className="ad-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${ad.imagePath}`}
                                                alt={`${ad.content} Ad Image !!`}
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                            <section className="ad-image mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control d-block mx-auto p-2 border-2 ad-image-field ${formValidationErrors["image"] && adIndex === selectedAdImageIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeAdData(adIndex, "image", e.target.files[0])}
                                                    accept=".png, .jpg, .webp"
                                                />
                                                {formValidationErrors["image"] && adIndex === selectedAdImageIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["image"]}</span>
                                                </p>}
                                            </section>
                                            {(selectedAdImageIndex !== adIndex && selectedAdIndex !== adIndex) &&
                                                <button
                                                    className="btn btn-success d-block mb-3 w-50 mx-auto global-button"
                                                    onClick={() => changeAdImage(adIndex)}
                                                >Change</button>
                                            }
                                            {waitChangeAdImageMsg && selectedAdImageIndex === adIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{waitChangeAdImageMsg}</button>}
                                            {successChangeAdImageMsg && selectedAdImageIndex === adIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successChangeAdImageMsg}</button>}
                                            {errorChangeAdImageMsg && selectedAdImageIndex === adIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorChangeAdImageMsg}</button>}
                                        </td>
                                        <td className="update-cell">
                                            {selectedAdIndex !== adIndex && <>
                                                {ad.type === "elite" && <>
                                                    <button
                                                        className="btn btn-success d-block mb-3 mx-auto global-button"
                                                        onClick={() => updateAdInfo(adIndex)}
                                                    >Update</button>
                                                    <hr />
                                                </>}
                                                <button
                                                    className="btn btn-danger global-button"
                                                    onClick={() => deleteAd(adIndex)}
                                                >Delete</button>
                                            </>}
                                            {waitMsg && selectedAdIndex === adIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{waitMsg}</button>}
                                            {successMsg && selectedAdIndex === adIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg && selectedAdIndex === adIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>}
                    {allAds.length === 0 && <p className="alert alert-danger w-100">Sorry, Can't Find Any Ads !!</p>}
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}