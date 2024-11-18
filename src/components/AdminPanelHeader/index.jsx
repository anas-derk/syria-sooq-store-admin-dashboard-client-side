import Link from "next/link";
import { MdOutlineLogout } from "react-icons/md";
import { useRouter } from "next/router.js";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useTranslation } from "react-i18next";

export default function AdminPanelHeader({ isWebsiteOwner = false, isMerchant = false }) {

    const router = useRouter();

    const { i18n, t } = useTranslation();

    const adminLogout = async () => {
        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
        await router.replace("/login");
    }

    const handleChangeLanguage = (language) => {
        i18n.changeLanguage(language);
        document.body.lang = language;
        localStorage.setItem(process.env.adminDashboardlanguageFieldNameInLocalStorage, language);
    }

    return (
        <header className="admin-panel-header" dir="ltr">
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container fluid>
                    <Navbar.Brand href="/" as={Link}>{process.env.storeName} Dashboard</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav>
                            {router.pathname === "/orders-managment/billing/[orderId]" && <>
                                <NavDropdown title={t("Languages")} id="languages-nav-dropdown">
                                    <NavDropdown.Item onClick={() => handleChangeLanguage("ar")}>Arabic</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={() => handleChangeLanguage("en")}>English</NavDropdown.Item>
                                </NavDropdown>
                            </>}
                            {isWebsiteOwner && <>
                                <Nav.Link href="/users-managment" as={Link}>Users</Nav.Link> 
                                <NavDropdown title="Stores" id="stores-nav-dropdown">
                                    <NavDropdown.Item href="/stores-managment" as={Link}>All Stores</NavDropdown.Item>
                                </NavDropdown>
                            </>}
                            {isMerchant && <NavDropdown title="Admins" id="admins-nav-dropdown">
                                <NavDropdown.Item href="/admins-managment/add-new-admin" as={Link}>Add New</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/admins-managment/update-and-delete-admins" as={Link}>
                                    Update / Delete
                                </NavDropdown.Item>
                            </NavDropdown>}
                            <NavDropdown title="Products" id="products-nav-dropdown">
                                <NavDropdown.Item href="/products-managment/add-new-product" as={Link}>Add New</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/products-managment/update-and-delete-products" as={Link}>
                                    Update / Delete
                                </NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Categories" id="categories-nav-dropdown">
                                <NavDropdown.Item href="/categories-managment/add-new-category" as={Link}>Add New</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/categories-managment/update-and-delete-categories" as={Link}>
                                    Update / Delete
                                </NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Orders" id="orders-nav-dropdown">
                                <NavDropdown.Item href="/orders-managment" as={Link}>All Orders</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Ads" id="ads-nav-dropdown">
                                <NavDropdown.Item href="/ads-managment/add-new-ad" as={Link}>Add New</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/ads-managment/update-and-delete-ads" as={Link}>
                                    Update / Delete
                                </NavDropdown.Item>
                            </NavDropdown>
                            <button className="btn btn-danger logout-btn" onClick={adminLogout}>
                                <MdOutlineLogout className="me-2" />
                                <span>Logout</span>
                            </button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}