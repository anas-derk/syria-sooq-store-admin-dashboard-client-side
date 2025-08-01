import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import PaginationBar from "@/components/PaginationBar";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo, handleSelectUserLanguage } from "../../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";
import TableLoader from "@/components/TableLoader";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";
import { useTranslation } from "react-i18next";

export default function UpdateAndDeleteAdmins() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [allAdminsInsideThePage, setAllAdminsInsideThePage] = useState([]);

    const [isGetAdmins, setIsGetAdmins] = useState(false);

    const [selectedAdminIndex, setSelectedAdminIndex] = useState(-1);

    const [waitMsg, setWaitMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [errorMsgOnGetAdminsData, setErrorMsgOnGetAdminsData] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        adminId: "",
        fullName: "",
        email: "",
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
                        if (!adminDetails.isMerchant) {
                            localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                            await router.replace("/");
                        } else {
                            setAdminInfo(adminDetails);
                            const tempFilters = { ...filters, storeId: adminDetails.storeId };
                            setFilters(tempFilters);
                            result = (await getAllAdminsInsideThePage(1, pageSize, getFilteringString(tempFilters))).data;
                            setAllAdminsInsideThePage(result.admins);
                            setTotalPagesCount(Math.ceil(result.adminsCount / pageSize));
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

    const getAllAdminsInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/admins/all-admins-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&language=${process.env.defaultLanguage}&${filters ? filters : ""}`, {
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
            setIsGetAdmins(true);
            setErrorMsgOnGetAdminsData("");
            const newCurrentPage = currentPage - 1;
            setAllAdminsInsideThePage((await getAllAdminsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data.admins);
            setCurrentPage(newCurrentPage);
            setIsGetAdmins(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetAdminsData(err?.message === "Network Error" ? "Network Error When Get Admins Data" : "Sorry, Someting Went Wrong When Get Admins Data, Please Repeate The Process !!");
            }
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetAdmins(true);
            setErrorMsgOnGetAdminsData("");
            const newCurrentPage = currentPage + 1;
            setAllAdminsInsideThePage((await getAllAdminsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data.admins);
            setCurrentPage(newCurrentPage);
            setIsGetAdmins(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetAdminsData(err?.message === "Network Error" ? "Network Error When Get Admins Data" : "Sorry, Someting Went Wrong When Get Admins Data, Please Repeate The Process !!");
            }
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetAdmins(true);
            setErrorMsgOnGetAdminsData("");
            setAllAdminsInsideThePage((await getAllAdminsInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data.admins);
            setCurrentPage(pageNumber);
            setIsGetAdmins(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetAdminsData(err?.message === "Network Error" ? "Network Error When Get Admins Data" : "Sorry, Someting Went Wrong When Get Admins Data, Please Repeate The Process !!");
            }
        }
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.storeId) filteringString += `storeId=${filters.storeId}&`;
        if (filters.adminId) filteringString += `_id=${filters.adminId}&`;
        if (filters.fullName) filteringString += `fullName=${filters.fullName}&`;
        if (filters.email) filteringString += `email=${filters.email}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const filterAdmins = async (filters) => {
        try {
            setIsGetAdmins(true);
            setCurrentPage(1);
            const result = (await getAllAdminsInsideThePage(1, pageSize, getFilteringString(filters))).data;
            setAllAdminsInsideThePage(result.admins);
            setTotalPagesCount(Math.ceil(result.adminsCount / pageSize));
            setIsGetAdmins(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsGetAdmins(false);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const changeAdminData = (adminIndex, fieldName, newValue) => {
        setSelectedAdminIndex(-1);
        allAdminsInsideThePage[adminIndex][fieldName] = newValue;
    }

    const updateAdminData = async (adminIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "fullName",
                    value: allAdminsInsideThePage[adminIndex].fullName,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isName: {
                            msg: "Sorry, This Name Is Not Valid !!",
                        },
                    },
                },
                {
                    name: "email",
                    value: allAdminsInsideThePage[adminIndex].email,
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
            setSelectedAdminIndex(adminIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/admins/update-admin-info/${allAdminsInsideThePage[adminIndex]._id}?language=${process.env.defaultLanguage}`, {
                    fullName: allAdminsInsideThePage[adminIndex].fullName,
                    email: allAdminsInsideThePage[adminIndex].email,
                }, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                if (!result.error) {
                    setWaitMsg("");
                    setSuccessMsg("Updating Successfull !!");
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setSelectedAdminIndex(-1);
                        clearTimeout(successTimeout);
                    }, 3000);
                } else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setSelectedAdminIndex(-1);
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
                    setSelectedAdminIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteAdmin = async (adminIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedAdminIndex(adminIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/admins/delete-admin/${allAdminsInsideThePage[adminIndex]._id}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedAdminIndex(-1);
                    setIsGetAdmins(true);
                    setAllAdminsInsideThePage(allAdminsInsideThePage.filter((admin, index) => index !== adminIndex));
                    setIsGetAdmins(false);
                    clearTimeout(successTimeout);
                }, 3000);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedAdminIndex(-1);
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
                    setSelectedAdminIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="admins-managment admin-dashboard">
            <Head>
                <title>{process.env.storeName} {t("Admin Dashboard")} - {t("Admins Managment")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-5 pb-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">{t("Hi, Mr")} {adminInfo.fullName} {t("In Your Admins Managment Page")}</h1>
                        <section className="filters mb-3 bg-white border-3 border-info p-3 text-start">
                            <h5 className="section-name fw-bold text-center">{t("Filters")}: </h5>
                            <hr />
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h6 className="me-2 fw-bold text-center">{t("Admin Id")}</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("Please Enter Admin Id")}
                                        onChange={(e) => setFilters({ ...filters, adminId: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <h6 className="me-2 fw-bold text-center">{t("Email")}</h6>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder={t("Please Enter Email")}
                                        onChange={(e) => setFilters({ ...filters, email: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-6 mt-3">
                                    <h6 className="me-2 fw-bold text-center">{t("Full Name")}</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("Please Enter Full Name")}
                                        onChange={(e) => setFilters({ ...filters, fullName: e.target.value.trim() })}
                                    />
                                </div>
                            </div>
                            {!isGetAdmins && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                onClick={() => filterAdmins(filters)}
                            >
                                {t("Filter")}
                            </button>}
                            {isGetAdmins && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                disabled
                            >
                                {t("Filtering")} ...
                            </button>}
                        </section>
                        {allAdminsInsideThePage.length > 0 && !isGetAdmins && !errorMsgOnGetAdminsData && <section className="admins-data-box p-3 data-box admin-dashbboard-data-box">
                            <table className="admins-data-table mb-4 managment-table bg-white admin-dashbboard-data-table">
                                <thead>
                                    <tr>
                                        <th>{t("Admin Id")}</th>
                                        <th>{t("Full Name")}</th>
                                        <th>{t("Email")}</th>
                                        <th>{t("Processes")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allAdminsInsideThePage.map((admin, adminIndex) => (
                                        <tr key={admin._id}>
                                            <td>{admin._id}</td>
                                            <td>
                                                <section className="full-name mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={admin.fullName}
                                                        className={`form-control d-block mx-auto p-2 border-2 full-name-field ${formValidationErrors["fullName"] && adminIndex === selectedAdminIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder={t("Please Enter New Full Name")}
                                                        onChange={(e) => changeAdminData(adminIndex, "fullName", e.target.value)}
                                                    />
                                                    {formValidationErrors["fullName"] && adminIndex === selectedAdminIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["fullName"])} />}
                                                </section>
                                            </td>
                                            <td>
                                                <section className="email mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={admin.email}
                                                        className={`form-control d-block mx-auto p-2 border-2 email-field ${formValidationErrors["email"] && adminIndex === selectedAdminIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder={t("Please Enter New Email")}
                                                        onChange={(e) => changeAdminData(adminIndex, "email", e.target.value)}
                                                    />
                                                    {formValidationErrors["email"] && adminIndex === selectedAdminIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["email"])} />}
                                                </section>
                                            </td>
                                            <td>
                                                {adminIndex !== selectedAdminIndex &&
                                                    <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        onClick={() => updateAdminData(adminIndex)}
                                                    >
                                                        {t("Update")}
                                                    </button>
                                                }
                                                {
                                                    adminIndex !== selectedAdminIndex &&
                                                    !admin.isMerchant &&
                                                    <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        onClick={() => deleteAdmin(adminIndex)}
                                                    >
                                                        {t("Delete")}
                                                    </button>
                                                }
                                                {waitMsg && adminIndex === selectedAdminIndex && <button
                                                    className="btn btn-info d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    {t(waitMsg)}
                                                </button>}
                                                {successMsg && adminIndex === selectedAdminIndex && <button
                                                    className="btn btn-success d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    {t(successMsg)}
                                                </button>}
                                                {errorMsg && adminIndex === selectedAdminIndex && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    {t(errorMsg)}
                                                </button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>}
                        {allAdminsInsideThePage.length === 0 && !isGetAdmins && <NotFoundError errorMsg={t("Sorry, Can't Find Any Admins") + " !!"} />}
                        {isGetAdmins && <TableLoader />}
                        {errorMsgOnGetAdminsData && <NotFoundError errorMsg={t(errorMsgOnGetAdminsData)} />}
                        {totalPagesCount > 1 && !isGetAdmins &&
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