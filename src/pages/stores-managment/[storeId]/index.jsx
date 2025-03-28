import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo } from "../../../../public/global_functions/popular";
import { getDateFormated, getStoreDetails } from "../../../../public/global_functions/popular";
import { HiOutlineBellAlert } from "react-icons/hi2";
import NotFoundError from "@/components/NotFoundError";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";

export default function StoreDetails({ storeId }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [adminInfo, setAdminInfo] = useState({});

    const [storeDetails, setStoreDetails] = useState({});

    const [waitMsg, setWaitMsg] = useState("");

    const [waitChangeStoreImageMsg, setWaitChangeStoreImageMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [errorChangeStoreImageMsg, setErrorChangeStoreImageMsg] = useState(false);

    const [successMsg, setSuccessMsg] = useState("");

    const [successChangeStoreImageMsg, setSuccessChangeStoreImageMsg] = useState(false);

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const storeImageFileElementRef = useRef();

    const router = useRouter();

    const storeCategories = [
        "الإلكترونيات والتقنية",
        "الأزياء والملابس",
        "المنزل والمطبخ",
        "الجمال والعناية الشخصية",
        "الصحة والعافية",
        "الرياضة واللياقة البدنية",
        "الألعاب والهوايات",
        "الكتب والمجلات",
        "السيارات والمركبات",
        "البقالة والمواد الغذائية",
        "مستلزمات الأطفال والرضع",
        "مستلزمات الحيوانات الأليفة",
        "الأجهزة المنزلية",
        "الأدوات وتحسين المنزل",
        "الحديقة والهواء الطلق",
        "الصناعية والتجارية",
        "المستلزمات المكتبية والمدرسية",
        "الخدمات المهنية والإصلاحات",
        "الساعات والمجوهرات والإكسسوارات",
        "الموسيقى والفنون",
        "التعليم والدورات التدريبية",
        "الأجهزة الأمنية والمراقبة",
        "العقارات والتأجير",
        "الطاقة والأنظمة الشمسية",
        "الوظائف وفرص العمل",
        "المنتجات الفاخرة والماركات العالمية",
        "المنتجات المصنوعة يدويًا",
        "السفر والرحلات والمستلزمات السياحية",
    ];

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
                        if (adminDetails.isWebsiteOwner) {
                            setAdminInfo(adminDetails);
                            result = await getStoreDetails(storeId);
                            if (!result.error) {
                                setStoreDetails(result.data);
                                setIsLoadingPage(false);
                            }
                            setWindowInnerWidth(window.innerWidth);
                            window.addEventListener("resize", () => {
                                setWindowInnerWidth(window.innerWidth);
                            });
                        } else {
                            await router.replace("/");
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

    const downloadFile = async (URL) => {
        try {
            setWaitMsg("Downloading File Now ...");
            const res = await axios.get(URL, { responseType: "blob" });
            const imageAsBlob = res.data;
            const localURL = window.URL.createObjectURL(imageAsBlob);
            const tempAnchorLink = document.createElement("a");
            tempAnchorLink.href = localURL;
            tempAnchorLink.download = "file.png";
            tempAnchorLink.click();
            setWaitMsg("");
        } catch (err) {
            setWaitMsg("");
        }
    }

    const updateStoreData = async (storeId) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "name",
                    value: storeDetails.name,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "city",
                    value: storeDetails.city,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "ownerFullName",
                    value: storeDetails.ownerFullName,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "phoneNumber",
                    value: storeDetails.phoneNumber,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "email",
                    value: storeDetails.email,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isEmail: {
                            msg: "Sorry, Invalid Email !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating Store Data ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/stores/update-store-info/${storeId}?language=${process.env.defaultLanguage}`, {
                    name: storeDetails.name,
                    city: storeDetails.city,
                    ownerFullName: storeDetails.ownerFullName,
                    phoneNumber: storeDetails.phoneNumber,
                    email: storeDetails.email,
                }, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                if (!result.error) {
                    setWaitMsg("");
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        clearTimeout(successTimeout);
                    }, 3000);
                } else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 3000);
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

    const changeStoreImage = async (storeId, type) => {
        try {
            setFormValidationErrors({});
            const imageName = `${type}Image`;
            const imageFile = storeDetails[imageName];
            const errorsObject = inputValuesValidation([
                {
                    name: imageName,
                    value: imageFile,
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
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitChangeStoreImageMsg("");
                let formData = new FormData();
                formData.append(imageName, imageFile);
                const result = (await axios.put(`${process.env.BASE_API_URL}/stores/change-store-image/${storeId}?language=${process.env.defaultLanguage}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                if (!result.error) {
                    setWaitChangeStoreImageMsg("");
                    setSuccessChangeStoreImageMsg(result.msg);
                    let successTimeout = setTimeout(async () => {
                        setSuccessChangeStoreImageMsg("");
                        storeImageFileElementRef.current.value = "";
                        setStoreDetails({ ...storeDetails, imagePath: result.data.newStoreImagePath });
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorChangeStoreImageMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorChangeStoreImageMsg("");
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
                setWaitChangeStoreImageMsg("");
                setErrorChangeStoreImageMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorChangeStoreImageMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="store-details admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Store Details</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Content Section */}
                <section className="page-content text-center pt-4 pb-4">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-2 fw-bold mx-auto">Hi, Mr {adminInfo.fullName} In Store Details Page</h1>
                        {storeDetails ? <div className="store-details-box p-3 data-box">
                            {windowInnerWidth > 567 ? <table className="store-details-table table-for-mobiles-and-tablets bg-white w-100">
                                <tbody>
                                    <tr>
                                        <th>Id</th>
                                        <td className="store-id-cell">
                                            {storeDetails._id}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Name</th>
                                        <td className="update-store-name-cell">
                                            <section className="store-name">
                                                <input
                                                    type="text"
                                                    defaultValue={storeDetails.name}
                                                    className={`form-control d-block mx-auto p-2 border-2 store-name-field ${formValidationErrors["name"] ? "border-danger mb-3" : "mb-4"}`}
                                                    placeholder="Pleae Enter New Store Name"
                                                    onChange={(e) => setStoreDetails({ ...storeDetails, name: e.target.value })}
                                                />
                                                {formValidationErrors["name"] && <FormFieldErrorBox errorMsg={formValidationErrors["name"]} />}
                                            </section>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>City</th>
                                        <td className="update-store-city-cell">
                                            <section className="store-city">
                                                <h6 className="fw-bold mb-3">{storeDetails.city}</h6>
                                                <select
                                                    className={`select-store-city form-select ${formValidationErrors["city"] ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => setStoreDetails({ ...storeDetails, city: e.target.value })}
                                                >
                                                    <option value="" hidden>Pleae Select New Store City</option>
                                                    {cites.map((city) => <option key={city} value={city}>{city}</option>)}
                                                </select>
                                                {formValidationErrors["city"] && <FormFieldErrorBox errorMsg={formValidationErrors["city"]} />}
                                            </section>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Category</th>
                                        <td>
                                            <section className="update-store-category-cell">
                                                <select
                                                    onChange={(e) => setStoreDetails({ ...storeDetails, category: e.target.value })}
                                                    className={`form-control mx-auto p-2 border-2 store-category-field ${formValidationErrors["category"] ? "border-danger mb-3" : "mb-4"}`}
                                                >
                                                    {storeCategories.map((category) => (
                                                        <option key={category} value={category}>{category}</option>
                                                    ))}
                                                </select>
                                                {formValidationErrors["category"] && <FormFieldErrorBox errorMsg={formValidationErrors["category"]} />}
                                            </section>
                                        </td>
                                    </tr>
                                    <tr className="store-cover-image-cell">
                                        <th className="store-cover-image-cell">
                                            Cover Image
                                        </th>
                                        <td className="update-store-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${storeDetails.coverImagePath}`}
                                                alt={`${storeDetails.name} Store Cover Image !!`}
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                        </td>
                                    </tr>
                                    <tr className="store-profile-image-cell">
                                        <th className="store-profile-image-cell">
                                            Profile Image
                                        </th>
                                        <td className="update-store-profile-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${storeDetails.profileImagePath}`}
                                                alt={`${storeDetails.name} Store Profile Image !!`}
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                        </td>
                                    </tr>
                                    <tr className="store-commercial-register-cell">
                                        <th className="store-commercial-register-cell">
                                            Commercial Register File
                                        </th>
                                        <td className="update-store-commercial-register-cell">
                                            <button
                                                className="btn btn-success"
                                                onClick={() => downloadFile(`${process.env.BASE_API_URL}/${storeDetails.commercialRegisterFilePath}`, "commercial-register-file")}
                                            >
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="store-tax-card-cell">
                                        <th className="store-tax-card-cell">
                                            Tax Card File
                                        </th>
                                        <td className="update-store-tax-card-cell">
                                            <button
                                                className="btn btn-success"
                                                onClick={() => downloadFile(`${process.env.BASE_API_URL}/${storeDetails.taxCardFilePath}`, "tax-card-file")}
                                            >
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="store-address-proof-cell">
                                        <th className="store-address-proof-cell">
                                            Address Proof File
                                        </th>
                                        <td className="update-store-address-proof-cell">
                                            <button
                                                className="btn btn-success"
                                                onClick={() => downloadFile(`${process.env.BASE_API_URL}/${storeDetails.addressProofFilePath}`, "address-proof-file")}
                                            >
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Owner Full Name</th>
                                        <td className="update-owner-full-name-cell">
                                            <section className="store-owner-full-name">
                                                <input
                                                    type="text"
                                                    defaultValue={storeDetails.ownerFullName}
                                                    className={`form-control d-block mx-auto p-2 border-2 store-owner-full-name-field ${formValidationErrors["ownerFullName"] ? "border-danger mb-3" : "mb-4"}`}
                                                    placeholder="Pleae Enter New Owner Full Name"
                                                    onChange={(e) => setStoreDetails({ ...storeDetails, ownerFullName: e.target.value })}
                                                />
                                                {formValidationErrors["ownerFullName"] && <FormFieldErrorBox errorMsg={formValidationErrors["ownerFullName"]} />}
                                            </section>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Phone Number</th>
                                        <td className="update-phone-number-cell">
                                            <section className="store-phone-number">
                                                <input
                                                    type="text"
                                                    defaultValue={storeDetails.phoneNumber}
                                                    className={`form-control d-block mx-auto p-2 border-2 store-phone-number-field ${formValidationErrors["phoneNumber"] ? "border-danger mb-3" : "mb-4"}`}
                                                    placeholder="Pleae Enter New Phone Number"
                                                    onChange={(e) => setStoreDetails({ ...storeDetails, phoneNumber: e.target.value })}
                                                />
                                                {formValidationErrors["phoneNumber"] && <FormFieldErrorBox errorMsg={formValidationErrors["phoneNumber"]} />}
                                            </section>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Email</th>
                                        <td className="update-email-cell">
                                            <section className="store-email">
                                                <input
                                                    type="text"
                                                    defaultValue={storeDetails.email}
                                                    className={`form-control d-block mx-auto p-2 border-2 store-email-field ${formValidationErrors["email"] ? "border-danger mb-3" : "mb-4"}`}
                                                    placeholder="Pleae Enter New Store Email"
                                                    onChange={(e) => setStoreDetails({ ...storeDetails, email: e.target.value })}
                                                />
                                                {formValidationErrors["email"] && <FormFieldErrorBox errorMsg={formValidationErrors["email"]} />}
                                            </section>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td className="status-cell">
                                            {storeDetails.status}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Creating Order Date</th>
                                        <td className="creating-order-date-cell">
                                            {getDateFormated(storeDetails.creatingOrderDate)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Approve Order Date</th>
                                        <td className="approve-order-date-cell">
                                            {storeDetails.approveDate ? getDateFormated(storeDetails.approveDate) : "-----"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Blocking Date</th>
                                        <td className="blocking-store-date-cell">
                                            {storeDetails.blockingDate ? getDateFormated(storeDetails.blockingDate) : "-----"}
                                        </td>
                                    </tr>
                                    {storeDetails.blockingReason && <tr>
                                        <th>Blocking Reason</th>
                                        <td className="blocking-reason-cell">
                                            {storeDetails.blockingReason}
                                        </td>
                                    </tr>}
                                    <tr>
                                        <th>Cancel Blocking Date</th>
                                        <td className="cancel-blocking-store-date-cell">
                                            {storeDetails.dateOfCancelBlocking ? getDateFormated(storeDetails.dateOfCancelBlocking) : "-----"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Actions</th>
                                        <td>
                                            {!waitMsg && !errorMsg && !successMsg && <button
                                                className="btn btn-success d-block mb-3 mx-auto global-button"
                                                onClick={() => updateStoreData(storeId)}
                                            >Update</button>}
                                            {waitMsg && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                            >Please Waiting</button>}
                                            {successMsg && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table> : <table className="store-details-table table-for-mobiles-and-tablets bg-white w-100">
                                <tbody>
                                    <tr>
                                        <th>Id</th>
                                    </tr>
                                    <tr>
                                        <td>
                                            <section className="store-category">
                                                <select
                                                    onChange={(e) => setStoreDetails({ ...storeDetails, category: e.target.value })}
                                                    className={`form-control mx-auto p-2 border-2 store-category-field ${formValidationErrors["category"] ? "border-danger mb-3" : "mb-4"}`}
                                                >
                                                    {storeCategories.map((category) => (
                                                        <option key={category} value={category}>{category}</option>
                                                    ))}
                                                </select>
                                                {formValidationErrors["category"] && <FormFieldErrorBox errorMsg={formValidationErrors["category"]} />}
                                            </section>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>{storeDetails._id}</td>
                                    </tr>
                                    <tr>
                                        <th>Name</th>
                                    </tr>
                                    <tr>
                                        <td className="update-store-name-cell">
                                            <section className="store-name">
                                                <input
                                                    type="text"
                                                    defaultValue={storeDetails.name}
                                                    className={`form-control d-block mx-auto p-2 border-2 store-name-field ${formValidationErrors["name"] ? "border-danger mb-3" : "mb-4"}`}
                                                    placeholder="Pleae Enter New Store Name"
                                                    onChange={(e) => setStoreDetails({ ...storeDetails, name: e.target.value })}
                                                />
                                                {formValidationErrors["name"] && <FormFieldErrorBox errorMsg={formValidationErrors["name"]} />}
                                            </section>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className="store-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${storeDetails.imagePath}`}
                                                alt={`${storeDetails.title} Store Image !!`}
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                        </th>
                                    </tr>
                                    <tr>
                                        <td className="update-store-image-cell">
                                            <section className="update-store-image mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-image-field ${formValidationErrors["image"] ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => setStoreDetails({ ...storeDetails, image: e.target.files[0] })}
                                                    accept=".png, .jpg, .webp"
                                                    ref={storeImageFileElementRef}
                                                    value={storeImageFileElementRef.current?.value}
                                                />
                                                {formValidationErrors["image"] && <FormFieldErrorBox errorMsg={formValidationErrors["image"]} />}
                                            </section>
                                            {!waitChangeStoreImageMsg && !errorChangeStoreImageMsg && !successChangeStoreImageMsg &&
                                                <button
                                                    className="btn btn-success d-block mb-3 w-50 mx-auto global-button"
                                                    onClick={() => changeStoreImage(storeId)}
                                                >Change</button>
                                            }
                                            {waitChangeStoreImageMsg && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                            >Please Waiting</button>}
                                            {successChangeStoreImageMsg && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successChangeStoreImageMsg}</button>}
                                            {errorChangeStoreImageMsg && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorChangeStoreImageMsg}</button>}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Owner First Name</th>
                                    </tr>
                                    <tr>
                                        <td className="update-owner-first-name-cell">
                                            <section className="store-owner-first-name">
                                                <input
                                                    type="text"
                                                    defaultValue={storeDetails.ownerFirstName}
                                                    className={`form-control d-block mx-auto p-2 border-2 store-owner-first-name-field ${formValidationErrors["ownerFirstName"] ? "border-danger mb-3" : "mb-4"}`}
                                                    placeholder="Pleae Enter New Owner First Name"
                                                    onChange={(e) => setStoreDetails({ ...storeDetails, ownerFirstName: e.target.value })}
                                                />
                                                {formValidationErrors["ownerFirstName"] && <FormFieldErrorBox errorMsg={formValidationErrors["ownerFirstName"]} />}
                                            </section>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Owner Last Name</th>
                                    </tr>
                                    <tr>
                                        <td className="update-owner-last-name-cell">
                                            <section className="store-owner-last-name">
                                                <input
                                                    type="text"
                                                    defaultValue={storeDetails.ownerLastName}
                                                    className={`form-control d-block mx-auto p-2 border-2 store-owner-last-name-field ${formValidationErrors["ownerLastName"] ? "border-danger mb-3" : "mb-4"}`}
                                                    placeholder="Pleae Enter New Owner Last Name"
                                                    onChange={(e) => setStoreDetails({ ...storeDetails, ownerLastName: e.target.value })}
                                                />
                                                {formValidationErrors["ownerLastName"] && <FormFieldErrorBox errorMsg={formValidationErrors["ownerLastName"]} />}
                                            </section>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Owner Email</th>
                                    </tr>
                                    <tr>
                                        <td className="update-owner-email-cell">
                                            <section className="store-owner-email">
                                                <input
                                                    type="text"
                                                    defaultValue={storeDetails.ownerEmail}
                                                    className={`form-control d-block mx-auto p-2 border-2 store-owner-email-field ${formValidationErrors["ownerEmail"] ? "border-danger mb-3" : "mb-4"}`}
                                                    placeholder="Pleae Enter New Store Owner Email"
                                                    onChange={(e) => setStoreDetails({ ...storeDetails, ownerEmail: e.target.value })}
                                                />
                                                {formValidationErrors["ownerEmail"] && <FormFieldErrorBox errorMsg={formValidationErrors["ownerEmail"]} />}
                                            </section>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Products Type</th>
                                    </tr>
                                    <tr>
                                        <td className="update-products-type-cell">
                                            <section className="store-products-type">
                                                <input
                                                    type="text"
                                                    defaultValue={storeDetails.productsType}
                                                    className={`form-control d-block mx-auto p-2 border-2 store-products-type-field ${formValidationErrors["productsType"] ? "border-danger mb-3" : "mb-4"}`}
                                                    placeholder="Pleae Enter New Store Products Type"
                                                    onChange={(e) => setStoreDetails({ ...storeDetails, productsType: e.target.value })}
                                                />
                                                {formValidationErrors["productsType"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["productsType"]}</span>
                                                </p>}
                                            </section>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Products Description</th>
                                    </tr>
                                    <tr>
                                        <td className="update-products-description-cell">
                                            <section className="store-products-description">
                                                <input
                                                    type="text"
                                                    defaultValue={storeDetails.productsDescription}
                                                    className={`form-control d-block mx-auto p-2 border-2 store-products-description-field ${formValidationErrors["productsDescription"] ? "border-danger mb-3" : "mb-4"}`}
                                                    placeholder="Pleae Enter New Store Products Description"
                                                    onChange={(e) => setStoreDetails({ ...storeDetails, productsDescription: e.target.value })}
                                                />
                                                {formValidationErrors["productsDescription"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["productsDescription"]}</span>
                                                </p>}
                                            </section>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                    </tr>
                                    <tr>
                                        <td className="status-cell">
                                            {storeDetails.status}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Creating Order Date</th>
                                    </tr>
                                    <td className="creating-order-date-cell">
                                        {getDateFormated(storeDetails.creatingOrderDate)}
                                    </td>
                                    <tr>
                                        <th>Approve Order Date</th>
                                    </tr>
                                    <tr>
                                        <td className="approve-order-date-cell">
                                            {storeDetails.approveDate ? getDateFormated(storeDetails.approveDate) : "-----"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Blocking Date</th>
                                    </tr>
                                    <tr>
                                        <td className="blocking-store-date-cell">
                                            {storeDetails.blockingDate ? getDateFormated(storeDetails.blockingDate) : "-----"}
                                        </td>
                                    </tr>
                                    {storeDetails.blockingReason && <>
                                        <tr>
                                            <th>Blocking Reason</th>
                                        </tr>
                                        <tr>
                                            <td className="blocking-reason-cell">
                                                {storeDetails.blockingReason}
                                            </td>
                                        </tr>
                                    </>}
                                    <tr>
                                        <th>Cancel Blocking Date</th>
                                    </tr>
                                    <tr>
                                        <td className="cancel-blocking-store-date-cell">
                                            {storeDetails.dateOfCancelBlocking ? getDateFormated(storeDetails.dateOfCancelBlocking) : "-----"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Actions</th>
                                    </tr>
                                    <tr>
                                        <td>
                                            {!waitMsg && !errorMsg && !successMsg && <button
                                                className="btn btn-success d-block mb-3 mx-auto global-button"
                                                onClick={() => updateStoreData(storeId)}
                                            >Update</button>}
                                            {waitMsg && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                            >{waitMsg}</button>}
                                            {successMsg && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>}
                        </div> : <NotFoundError errorMsg="Sorry, This Store Is Not Found !!" />}
                    </div>
                </section>
                {/* End Content Section */}
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}

export async function getServerSideProps(context) {
    const storeId = context.query.storeId;
    if (!storeId) {
        return {
            redirect: {
                permanent: false,
                destination: "/admin-dashboard/stores-managment",
            },
        }
    } else {
        return {
            props: {
                storeId,
            },
        }
    }
}