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
import ChangeStoreStatusBox from "@/components/ChangeStoreStatusBox";
import { getAdminInfo, getAllStoresInsideThePage, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";
import TableLoader from "@/components/TableLoader";
import { useTranslation } from "react-i18next";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";

export default function StoresManagment() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [allStoresInsideThePage, setAllStoresInsideThePage] = useState([]);

    const [isGetStores, setIsGetStores] = useState(false);

    const [selectedStoreIndex, setSelectedStoreIndex] = useState(-1);

    const [waitMsg, setWaitMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [errorMsgOnGetStoresData, setErrorMsgOnGetStoresData] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        storeId: "",
        name: "",
        status: "",
        ownerFullName: "",
        email: "",
    });

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isDisplayChangeStoreStatusBox, setIsDisplayChangeStoreStatusBox] = useState(false);

    const [storeAction, setStoreAction] = useState("");

    const [selectedStore, setSelectedStore] = useState("");

    const router = useRouter();

    const { t, i18n } = useTranslation();

    const pageSize = 3;

    const storeStatusList = ["pending", "approving", "blocking"];

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
                        if (adminDetails.isWebsiteOwner) {
                            setAdminInfo(adminDetails);
                            result = (await getAllStoresInsideThePage(1, pageSize)).data;
                            setAllStoresInsideThePage(result.stores);
                            setTotalPagesCount(Math.ceil(result.storesCount / pageSize));
                            setIsLoadingPage(false);
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

    const getPreviousPage = async () => {
        try {
            setIsGetStores(true);
            setErrorMsgOnGetStoresData("");
            const newCurrentPage = currentPage - 1;
            setAllStoresInsideThePage((await getAllStoresInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data.stores);
            setCurrentPage(newCurrentPage);
            setIsGetStores(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetStoresData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Something Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetStores(true);
            setErrorMsgOnGetStoresData("");
            const newCurrentPage = currentPage + 1;
            setAllStoresInsideThePage((await getAllStoresInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data.stores);
            setCurrentPage(newCurrentPage);
            setIsGetStores(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetStoresData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Something Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetStores(true);
            setErrorMsgOnGetStoresData("");
            setAllStoresInsideThePage((await getAllStoresInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data.stores);
            setCurrentPage(pageNumber);
            setIsGetStores(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetStoresData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Something Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.storeId) filteringString += `_id=${filters.storeId}&`;
        if (filters.name) filteringString += `name=${filters.name}&`;
        if (filters.status) filteringString += `status=${filters.status}&`;
        if (filters.ownerFirstName) filteringString += `ownerFirstName=${filters.ownerFirstName}&`;
        if (filters.ownerLastName) filteringString += `ownerLastName=${filters.ownerLastName}&`;
        if (filters.ownerEmail) filteringString += `ownerEmail=${filters.ownerEmail}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const filterStores = async (filters) => {
        try {
            setIsGetStores(true);
            setCurrentPage(1);
            const filteringString = getFilteringString(filters);
            const result = (await getAllStoresInsideThePage(1, pageSize, filteringString)).data;
            setAllStoresInsideThePage(result.stores);
            setTotalPagesCount(Math.ceil(result.storesCount / pageSize));
            setIsGetStores(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsGetStores(false);
                setCurrentPage(-1);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const handleDisplayChangeStoreStatusBox = (storeDetails, storeAction) => {
        setStoreAction(storeAction);
        setSelectedStore(storeDetails);
        setIsDisplayChangeStoreStatusBox(true);
    }

    const changeStoreData = (storeIndex, fieldName, newValue) => {
        allStoresInsideThePage[storeIndex][fieldName] = newValue;
    }

    const updateStoreData = async (storeIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "name",
                    value: allStoresInsideThePage[storeIndex].name,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "email",
                    value: allStoresInsideThePage[storeIndex].email,
                    rules: {
                        isEmail: {
                            msg: "Sorry, Invalid Email !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedStoreIndex(storeIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait");
                const result = (await axios.put(`${process.env.BASE_API_URL}/stores/update-store-info/${allStoresInsideThePage[storeIndex]._id}?language=${process.env.defaultLanguage}`, {
                    name: allStoresInsideThePage[storeIndex].name,
                    email: allStoresInsideThePage[storeIndex].email,
                }, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg("Updating Successfull");
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg(false);
                        setSelectedStoreIndex(-1);
                        clearTimeout(successTimeout);
                    }, 3000);
                } else {
                    setErrorMsg("Sorry, Something Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setSelectedStoreIndex(-1);
                        clearTimeout(errorTimeout);
                    }, 3000);
                }
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setWaitMsg("");
            setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                setSelectedStoreIndex(-1);
                clearTimeout(errorTimeout);
            }, 3000);
        }
    }

    const deleteStore = async (storeIndex) => {
        try {
            setWaitMsg("Please Wait");
            setSelectedStoreIndex(storeIndex);
            let result = (await axios.delete(`${process.env.BASE_API_URL}/stores/delete-store/${allStoresInsideThePage[storeIndex]._id}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedStoreIndex(-1);
                    setIsGetStores(true);
                    setAllStoresInsideThePage(allStoresInsideThePage.filter((store, index) => index !== storeIndex));
                    setIsGetStores(false);
                    clearTimeout(successTimeout);
                }, 3000);
            } else {
                setErrorMsg("Sorry, Something Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedStoreIndex(-1);
                    clearTimeout(errorTimeout);
                }, 3000);
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setWaitMsg("");
            setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                setSelectedStoreIndex(-1);
                clearTimeout(errorTimeout);
            }, 3000);
        }
    }

    const handleChangeStoreStatus = async (newStatus) => {
        try {
            switch (newStatus) {
                case "approving": {
                    setIsGetStores(true);
                    const filteringString = getFilteringString(filters);
                    setAllStoresInsideThePage((await getAllStoresInsideThePage(1, pageSize, filteringString)).data.stores);
                    setCurrentPage(currentPage);
                    setIsGetStores(false);
                    return;
                }
                case "rejecting": {
                    setIsGetStores(true);
                    const result = (await getAllStoresInsideThePage(currentPage, pageSize, getFilteringString(filters))).data;
                    setAllStoresInsideThePage(result.stores);
                    setIsGetStores(false);
                    return;
                }
                case "blocking": {
                    setIsGetStores(true);
                    const result = (await getAllStoresInsideThePage(currentPage, pageSize, getFilteringString(filters))).data;
                    setAllStoresInsideThePage(result.stores);
                    setIsGetStores(false);
                    return;
                }
            }
        }
        catch (err) {
            setIsGetStores(false);
            setErrorMsg(true);
            let errorTimeout = setTimeout(() => {
                setErrorMsg(false);
                clearTimeout(errorTimeout);
            }, 3000);
        }
    }

    return (
        <div className="stores-managment admin-dashboard">
            <Head>
                <title>{process.env.storeName} {t("Admin Dashboard")} - {t("Stores Managment")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Change Store Status Box */}
                {isDisplayChangeStoreStatusBox && <ChangeStoreStatusBox
                    setIsDisplayChangeStoreStatusBox={setIsDisplayChangeStoreStatusBox}
                    setStoreAction={setStoreAction}
                    selectedStore={selectedStore}
                    storeAction={storeAction}
                    handleChangeStoreStatus={handleChangeStoreStatus}
                />}
                {/* End Change Store Status Box */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-5 pb-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">{t("Hi, Mr")} {adminInfo.fullName} {t("In Your Stores Managment Page")}</h1>
                        <section className="filters mb-3 bg-white border-3 border-info p-3 text-start">
                            <h5 className="section-name fw-bold text-center">{t("Filters")}: </h5>
                            <hr />
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <h6 className="me-2 fw-bold text-center">{t("Store Id")}</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("Please Enter Store Id")}
                                        onChange={(e) => setFilters({ ...filters, storeId: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <h6 className="me-2 fw-bold text-center">{t("Store Name")}</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("Please Enter Store Name")}
                                        onChange={(e) => setFilters({ ...filters, name: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <h6 className="me-2 fw-bold text-center">{t("Status")}</h6>
                                    <select
                                        className="select-store-status form-select"
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="" hidden>{t("Please Enter Status")}</option>
                                        <option value="">{t("All")}</option>
                                        {storeStatusList.map((status, index) => (
                                            <option value={status} key={index}>{t(status)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4 mt-5">
                                    <h6 className="me-2 fw-bold text-center">{t("Owner Full Name")}</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("Please Enter Owner Full Name")}
                                        onChange={(e) => setFilters({ ...filters, ownerFullName: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4 mt-5">
                                    <h6 className="me-2 fw-bold text-center">{t("Owner Email")}</h6>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder={t("Please Enter Owner Email")}
                                        onChange={(e) => setFilters({ ...filters, ownerEmail: e.target.value.trim() })}
                                    />
                                </div>
                            </div>
                            {!isGetStores && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                onClick={() => filterStores(filters)}
                            >
                                {t("Filter")}
                            </button>}
                            {isGetStores && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                disabled
                            >
                                {t("Filtering")} ...
                            </button>}
                        </section>
                        {allStoresInsideThePage.length > 0 && !isGetStores && <section className="stores-data-box p-3 data-box admin-dashbboard-data-box">
                            <table className="stores-data-table mb-4 managment-table bg-white admin-dashbboard-data-table">
                                <thead>
                                    <tr>
                                        <th width="50">{t("Store Id")}</th>
                                        <th width="250">{t("Store Name")}</th>
                                        <th>{t("Owner Full Name")}</th>
                                        <th width="300">{t("Email")}</th>
                                        <th width="250">{t("Status")}</th>
                                        <th>{t("Processes")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allStoresInsideThePage.map((store, storeIndex) => (
                                        <tr key={store._id}>
                                            <td>{store._id}</td>
                                            <td>
                                                <section className="store-name mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={store.name}
                                                        className={`form-control d-block mx-auto p-2 border-2 store-name-field ${formValidationErrors["name"] && storeIndex === selectedStoreIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder={t("Please Enter New Store Name")}
                                                        onChange={(e) => changeStoreData(storeIndex, "name", e.target.value)}
                                                    />
                                                    {formValidationErrors["name"] && storeIndex === selectedStoreIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["name"])} />}
                                                </section>
                                            </td>
                                            <td>{store.ownerFullName}</td>
                                            <td>
                                                <section className="store-email mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={store.email}
                                                        className={`form-control d-block mx-auto p-2 border-2 store-email-field ${formValidationErrors["email"] && storeIndex === selectedStoreIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder={t("Please Enter New Owner Email")}
                                                        onChange={(e) => changeStoreData(storeIndex, "email", e.target.value)}
                                                    />
                                                    {formValidationErrors["email"] && storeIndex === selectedStoreIndex && <FormFieldErrorBox errorMsg={t(formValidationErrors["email"])} />}
                                                </section>
                                            </td>
                                            <td>
                                                {t(store.status)}
                                            </td>
                                            <td>
                                                {storeIndex !== selectedStoreIndex && <button
                                                    className="btn btn-info d-block mx-auto mb-3 global-button"
                                                    onClick={() => updateStoreData(storeIndex)}
                                                >
                                                    {t("Update")}
                                                </button>}
                                                {!store.isMainStore && <>
                                                    {
                                                        storeIndex !== selectedStoreIndex && store.status !== "pending" &&
                                                        <button
                                                            className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                            onClick={() => deleteStore(storeIndex)}
                                                        >
                                                            {t("Delete")}
                                                        </button>
                                                    }
                                                    {waitMsg && storeIndex === selectedStoreIndex && <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        {waitMsg}
                                                    </button>}
                                                    {successMsg && storeIndex === selectedStoreIndex && <button
                                                        className="btn btn-success d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        {successMsg}
                                                    </button>}
                                                    {
                                                        !waitMsg &&
                                                        !successMsg &&
                                                        !errorMsg &&
                                                        store.status === "pending" &&
                                                        <button
                                                            className="btn btn-success d-block mx-auto mb-3 global-button"
                                                            onClick={() => handleDisplayChangeStoreStatusBox(store, "approving")}
                                                        >
                                                            {t("Approve")}
                                                        </button>
                                                    }
                                                    {
                                                        !waitMsg &&
                                                        !successMsg &&
                                                        !errorMsg &&
                                                        store.status === "pending" &&
                                                        <button
                                                            className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                            onClick={() => handleDisplayChangeStoreStatusBox(store, "rejecting")}
                                                        >
                                                            {t("Reject")}
                                                        </button>
                                                    }
                                                    {
                                                        !waitMsg &&
                                                        !successMsg &&
                                                        !errorMsg &&
                                                        (store.status === "pending" || store.status === "approving") &&
                                                        <button
                                                            className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                            onClick={() => handleDisplayChangeStoreStatusBox(store, "blocking")}
                                                        >
                                                            {t("Blocking")}
                                                        </button>
                                                    }
                                                    {
                                                        !waitMsg &&
                                                        !successMsg &&
                                                        !errorMsg &&
                                                        store.status === "blocking" &&
                                                        <button
                                                            className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                            onClick={() => handleDisplayChangeStoreStatusBox(store, "cancel-blocking")}
                                                        >
                                                            {t("Cancel Blocking")}
                                                        </button>
                                                    }
                                                    {errorMsg && storeIndex === selectedStoreIndex && <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        {errorMsg}
                                                    </button>}
                                                </>}
                                                {!waitMsg && !errorMsg && !successMsg && <>
                                                    <Link
                                                        href={`/stores-managment/${store._id}`}
                                                        className="btn btn-success d-block mx-auto mb-4 global-button"
                                                    >{t("Show Full Details")}</Link>
                                                </>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>}
                        {allStoresInsideThePage.length === 0 && !isGetStores && <NotFoundError errorMsg={t("Sorry, Can't Find Any Stores") + " !!"} />}
                        {isGetStores && <TableLoader />}
                        {errorMsgOnGetStoresData && <NotFoundError errorMsg={errorMsgOnGetStoresData} />}
                        {totalPagesCount > 1 && !isGetStores &&
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