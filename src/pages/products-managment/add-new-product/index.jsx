import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo, getAllCategoriesInsideThePage, getCategoriesCount } from "../../../../public/global_functions/popular";
import { useRouter } from "next/router";
import { HiOutlineBellAlert } from "react-icons/hi2";
import NotFoundError from "@/components/NotFoundError";
import { IoIosCloseCircleOutline } from "react-icons/io";

export default function AddNewProduct() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [categoriesCount, setCategoriesCount] = useState([]);

    const [productData, setProductData] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        categories: [],
        discount: "",
        quantity: "",
        isAvailableForDelivery: false,
        image: null,
        galleryImages: [],
    });

    const [waitMsg, setWaitMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [searchedCategoryName, setSearchedCategoryName] = useState("");

    const [searchedCategories, setSearchedCategories] = useState([]);

    const [selectedCategories, setSelectedCategories] = useState([]);

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const productImageFileElementRef = useRef();

    const productGalleryImagesFilesElementRef = useRef();

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
                        } else {
                            setAdminInfo(adminDetails);
                            setCategoriesCount((await getCategoriesCount()).data);
                            setIsLoadingPage(false);
                        }
                    }
                })
                .catch(async (err) => {
                    console.log(err)
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

    const addNewProduct = async (e, productData) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "name",
                    value: productData.name,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "price",
                    value: productData.price,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "description",
                    value: productData.description,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "categories",
                    value: selectedCategories,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "discount",
                    value: productData.discount,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        minNumber: {
                            value: 0,
                            msg: "Sorry, Minimum Value Can't Be Less Than Zero !!",
                        }
                    },
                },
                {
                    name: "quantity",
                    value: productData.quantity,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        minNumber: {
                            value: 0,
                            msg: "Sorry, Minimum Value Can't Be Less Than Zero !!",
                        }
                    },
                },
                {
                    name: "image",
                    value: productData.image,
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
                    name: "galleryImages",
                    value: productData.galleryImages,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isImages: {
                            msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Or WEBP Image File !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                let formData = new FormData();
                formData.append("name", productData.name);
                formData.append("price", productData.price);
                formData.append("description", productData.description);
                for (let category of selectedCategories) {
                    formData.append("categories[]", category);
                }
                formData.append("discount", productData.discount);
                formData.append("quantity", productData.quantity);
                formData.append("productImage", productData.image);
                for (let galleryImage of productData.galleryImages) {
                    formData.append("galleryImages", galleryImage);
                }
                setWaitMsg("Please Wait To Add New Product ...");
                const result = (await axios.post(`${process.env.BASE_API_URL}/products/add-new-product?language=${process.env.defaultLanguage}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setProductData({
                            ...productData,
                            name: "",
                            price: "",
                            description: "",
                            discount: "",
                            image: null,
                            galleryImages: [],
                        });
                        productImageFileElementRef.current.value = "";
                        productGalleryImagesFilesElementRef.current.value = "";
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg(result.msg);
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
                if (err.response.data?.msg === "Sorry, Please Send Valid Discount Value !!") {
                    setErrorMsg(err.response.data.msg);
                }
                else setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const handleGetCategoriesByName = async (e) => {
        try {
            setWaitMsg("Please Waiting To Get Categories ...");
            const searchedCategoryName = e.target.value;
            setSearchedCategoryName(searchedCategoryName);
            if (searchedCategoryName) {
                setSearchedCategories((await getAllCategoriesInsideThePage(1, 1000, `name=${searchedCategoryName}`)).data.categories);
            } else {
                setSearchedCategories([]);
            }
            setWaitMsg("");
        }
        catch (err) {
            setWaitMsg("");
            setErrorMsg(err?.message === "Network Error" ? "Network Error On Search !!" : "Sorry, Someting Went Wrong, Please Repeate The Search !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const handleSelectCategory = (selectedCategory) => {
        if ((selectedCategories.filter((category) => category._id !== selectedCategory._id)).length === selectedCategories.length) {
            setSearchedCategories(searchedCategories.filter((category) => category._id !== selectedCategory._id));
            setSelectedCategories([...selectedCategories, selectedCategory]);
        }
    }

    const handleRemoveCategoryFromSelectedCategoriesList = (category) => {
        setSelectedCategories(selectedCategories.filter((selectedCategory) => category._id !== selectedCategory._id));
        if (searchedCategoryName) setSearchedCategories([...searchedCategories, category]);
    }

    return (
        <div className="add-new-product admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Add New Product</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column pt-5 pb-5 p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Add New Product Page
                    </h1>
                    {categoriesCount > 0 ? <form className="add-new-product-form admin-dashbboard-form" onSubmit={(e) => addNewProduct(e, productData)}>
                        <section className="name mb-4">
                            <input
                                type="text"
                                className={`form-control p-2 border-2 product-name-field ${formValidationErrors["name"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter Product Name"
                                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                                value={productData.name}
                            />
                            {formValidationErrors["name"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors["name"]}</span>
                            </p>}
                        </section>
                        <section className="price mb-4">
                            <input
                                type="text"
                                className={`form-control p-2 border-2 product-price-field ${formValidationErrors["price"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter Product Price"
                                onChange={(e) => setProductData({ ...productData, price: e.target.value.trim() })}
                                value={productData.price}
                            />
                            {formValidationErrors["price"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors["price"]}</span>
                            </p>}
                        </section>
                        <section className="description mb-4">
                            <input
                                type="text"
                                className={`form-control p-2 border-2 product-description-field ${formValidationErrors["description"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter Product Description"
                                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                                value={productData.description}
                            />
                            {formValidationErrors["description"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors["description"]}</span>
                            </p>}
                        </section>
                        <section className="category mb-4 overflow-auto">
                            <h6 className="mb-3 fw-bold">Please Select Categories</h6>
                            <div className="select-categories-box select-box">
                                <input
                                    type="text"
                                    className="search-box form-control p-2 border-2 mb-4"
                                    placeholder="Please Enter Category Name Or Part Of This"
                                    onChange={handleGetCategoriesByName}
                                />
                                <ul className={`categories-list options-list bg-white border ${formValidationErrors["categories"] ? "border-danger mb-4" : "border-dark"}`}>
                                    <li className="text-center fw-bold border-bottom border-2 border-dark">Seached Categories List</li>
                                    {searchedCategories.length > 0 && searchedCategories.map((category) => (
                                        <li key={category._id} onClick={() => handleSelectCategory(category)}>{category.name}</li>
                                    ))}
                                </ul>
                                {searchedCategories.length === 0 && searchedCategoryName && <p className="alert alert-danger mt-4">Sorry, Can't Find Any Related Categories Match This Name !!</p>}
                                {formValidationErrors["categories"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                    <span>{formValidationErrors["categories"]}</span>
                                </p>}
                            </div>
                        </section>
                        {selectedCategories.length > 0 ? <div className="selected-categories row mb-4">
                            {selectedCategories.map((category) => <div className="col-md-4 mb-3" key={category._id}>
                                <div className="selected-category-box bg-white p-2 border border-2 border-dark text-center">
                                    <span className="me-2 category-name">{category.name}</span>
                                    <IoIosCloseCircleOutline className="remove-icon" onClick={() => handleRemoveCategoryFromSelectedCategoriesList(category)} />
                                </div>
                            </div>)}
                        </div> : <p className="bg-danger p-2 m-0 text-white mb-4">
                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                            <span>Sorry, Can't Find Any Categories Added To The Selected Categories List !!</span>
                        </p>}
                        <section className="discount mb-4">
                            <input
                                type="text"
                                className={`form-control p-2 border-2 product-price-discount-field ${formValidationErrors["discount"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter Discount"
                                onChange={(e) => setProductData({ ...productData, discount: (e.target.value || e.target.value == 0) ? e.target.value.trim() : "" })}
                                value={productData.discount}
                            />
                            {formValidationErrors["discount"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors["discount"]}</span>
                            </p>}
                        </section>
                        <section className="quantity mb-4">
                            <input
                                type="number"
                                className={`form-control p-2 border-2 product-quantity-field ${formValidationErrors["quantity"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter Quantity"
                                onChange={(e) => setProductData({ ...productData, quantity: (e.target.value || e.target.value === 0) ? e.target.value.trim() : "" })}
                                value={productData.quantity}
                            />
                            {formValidationErrors["quantity"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors["quantity"]}</span>
                            </p>}
                        </section>
                        <div className="is-available-for-delivery mb-4">
                            <h6 className="fw-bold mb-3">Is Available For Delivery ?</h6>
                            <div className="form-check border border-2 border-dark p-3 d-flex align-items-center">
                                <input
                                    className="form-check-input m-0 me-2"
                                    type="checkbox"
                                    id="isAvailableForDelivery"
                                    onChange={(e) => setProductData({ ...productData, isAvailableForDelivery: e.target.checked })}
                                    value={productData.isAvailableForDelivery}
                                />
                                <label className="form-check-label" htmlFor="isAvailableForDelivery" onClick={(e) => setProductData({ ...productData, isAvailableForDelivery: e.target.checked })}>
                                    Is Available For Delivery
                                </label>
                            </div>
                        </div>
                        <h6 className="mb-3 fw-bold">Please Select Product Image</h6>
                        <section className="image mb-4">
                            <input
                                type="file"
                                className={`form-control p-2 border-2 product-image-field ${formValidationErrors["image"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter Product Image"
                                onChange={(e) => setProductData({ ...productData, image: e.target.files[0] })}
                                ref={productImageFileElementRef}
                                value={productImageFileElementRef.current?.value}
                            />
                            {formValidationErrors["image"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors["image"]}</span>
                            </p>}
                        </section>
                        <h6 className="mb-3 fw-bold">Please Select Product Gallery Images</h6>
                        <section className="gallery-images mb-4">
                            <input
                                type="file"
                                className={`form-control p-2 border-2 product-galley-images-field ${formValidationErrors["galleryImages"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter Product Images Gallery"
                                multiple
                                onChange={(e) => setProductData({ ...productData, galleryImages: e.target.files })}
                                value={productGalleryImagesFilesElementRef.current?.value}
                                ref={productGalleryImagesFilesElementRef}
                            />
                            {formValidationErrors["galleryImages"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors["galleryImages"]}</span>
                            </p>}
                        </section>
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
                    </form> : <NotFoundError errorMsg="Sorry, Not Found Any Categories !!, Please Enter At Least One Category ..." />}
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}