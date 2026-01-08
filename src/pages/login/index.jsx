import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import StoreLogo from "../../../public/images/StoreLogo.png";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BiSolidUser } from "react-icons/bi";
import { FiLogIn } from "react-icons/fi";
import { inputValuesValidation } from "../../../public/global_functions/validations";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { getAdminInfo, getDateFormated, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";
import { useTranslation } from "react-i18next";

export default function AdminLogin() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [blockingDateAndReason, setBlockingDateAndReason] = useState({});

    const [waitMsg, setWaitMsg] = useState("");

    const [errMsg, setErrorMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isVisiblePassword, setIsVisiblePassword] = useState(false);

    const router = useRouter();

    const { t, i18n } = useTranslation();

    const loginSpan = <span className="me-2">{t("Login")}</span>;

    const loginIcon = <FiLogIn />;

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
                        setIsLoadingPage(false);
                    } else await router.replace("/");
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
        } else setIsLoadingPage(false);
    }, []);

    const adminLogin = async (e) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "email",
                    value: email,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isEmail: {
                            msg: "Sorry, This Email Is Not Valid !!",
                        }
                    },
                },
                {
                    name: "password",
                    value: password,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isValidPassword: {
                            msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter !!"
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait");
                const result = (await axios.get(`${process.env.BASE_API_URL}/admins/login?email=${email}&password=${password}&language=${process.env.defaultLanguage}`)).data;
                if (result.error) {
                    setWaitMsg("");
                    setErrorMsg(result.msg);
                    if (Object.keys(result.data).length > 0) {
                        setBlockingDateAndReason(result.data);
                    }
                    setTimeout(() => {
                        setErrorMsg("");
                    }, 4000);
                } else {
                    localStorage.setItem(process.env.adminTokenNameInLocalStorage, result.data.token);
                    await router.replace("/");
                }
            }
        } catch (err) {
            setWaitMsg("");
            setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Repeat The Process !!");
            setTimeout(() => {
                setErrorMsg("");
            }, 3000);
        }
    }

    return (
        <div className="admin-login d-flex flex-column justify-content-center">
            <Head>
                <title>{process.env.storeName} {t("Admin Dashboard")} - {t("Login")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <div className="page-content text-center p-4">
                <div className="container p-4">
                    <img src={StoreLogo.src} alt="logo" width="200" height="150" className="mb-5" />
                    <form className="admin-login-form mb-3" onSubmit={adminLogin}>
                        <div className="email-field-box">
                            <input
                                type="text"
                                placeholder={t("Please Enter Email")}
                                className={`form-control p-3 border-2 ${formValidationErrors["email"] ? "border-danger mb-2" : "mb-4"}`}
                                onChange={(e) => setEmail(e.target.value.trim())}
                            />
                            <div className={`icon-box ${i18n.language !== "ar" ? "other-languages-mode" : "ar-language-mode"}`}>
                                <BiSolidUser className="icon" />
                            </div>
                        </div>
                        {formValidationErrors["email"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["email"])} />}
                        <div className="password-field-box">
                            <input
                                type={isVisiblePassword ? "text" : "password"}
                                placeholder={t("Please Enter Password")}
                                className={`form-control p-3 border-2 ${formValidationErrors["password"] ? "border-danger mb-2" : "mb-4"}`}
                                onChange={(e) => setPassword(e.target.value.trim())}
                            />
                            <div className={`icon-box ${i18n.language !== "ar" ? "other-languages-mode" : "ar-language-mode"}`}>
                                {!isVisiblePassword && <AiOutlineEye className="eye-icon icon" onClick={() => setIsVisiblePassword(value => value = !value)} />}
                                {isVisiblePassword && <AiOutlineEyeInvisible className="invisible-eye-icon icon" onClick={() => setIsVisiblePassword(value => value = !value)} />}
                            </div>
                        </div>
                        {formValidationErrors["password"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["password"])} />}
                        {!waitMsg && !errMsg && <button type="submit" className="btn btn-success mx-auto d-block mb-4 p-3">
                            {i18n.language !== "ar" ? <>
                                {loginSpan}
                                {loginIcon}
                            </> : <>
                                {loginIcon}
                                {loginSpan}
                            </>}
                        </button>}
                        {waitMsg && <button disabled className="btn btn-primary mx-auto d-block mb-4">
                            <span className="me-2">{t(waitMsg)}</span>
                        </button>}
                        {errMsg && <button disabled className="btn btn-danger mx-auto d-block mb-4">
                            <span className="me-2">{t(errMsg)}</span>
                            <FiLogIn />
                        </button>}
                        <a href={`${process.env.WEBSITE_URL}/forget-password?userType=admin`} className="btn btn-danger mx-auto mb-4">
                            <span className="me-2">{t("Forget Password")}</span>
                        </a>
                        {errMsg && Object.keys(blockingDateAndReason).length > 0 && <div className="blocking-date-and-reason-box bg-white border border-danger p-3">
                            <h6 className="blocking-date fw-bold">{t("Blocking Date")}: {getDateFormated(blockingDateAndReason.blockingDate)}</h6>
                            <h6 className="blocking-reason m-0 fw-bold">{t("Blocking Reason")}: {blockingDateAndReason.blockingReason}</h6>
                        </div>}
                    </form>
                </div>
            </div>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}