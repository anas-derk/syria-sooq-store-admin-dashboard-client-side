import { PiSmileySad } from "react-icons/pi";
import AdminPanelHeader from "../AdminPanelHeader";

export default function ErrorOnLoadingThePage({ errorMsg }) {
    return (
        <div className="error-on-loading-component">
            <AdminPanelHeader />
            <div className="error-msg-on-loading-the-page text-center fw-bold">
                <PiSmileySad className="error-icon mb-5" />
                <p className="error-msg-on-loading-box">{errorMsg}</p>
            </div>
        </div>
    );
}