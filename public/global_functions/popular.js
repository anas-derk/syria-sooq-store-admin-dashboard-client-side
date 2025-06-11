import axios from "axios";

const getProductsCount = async (filters) => {
    try {
        return (await axios.get(`${process.env.BASE_API_URL}/products/products-count?language=${process.env.defaultLanguage}&${filters ? filters : ""}`)).data;
    }
    catch (err) {
        throw err;
    }
}

const getAllProductsInsideThePage = async (pageNumber, pageSize, filters, sortDetails) => {
    try {
        return (await axios.get(`${process.env.BASE_API_URL}/products/all-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&userType=admin&language=${process.env.defaultLanguage}&${filters ? filters : ""}&${sortDetails ? sortDetails : ""}`, {
            headers: {
                Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
            },
        })).data;
    }
    catch (err) {
        throw err;
    }
}

const getDateFormated = (date) => {
    let orderedDateInDateFormat = new Date(date);
    const year = orderedDateInDateFormat.getFullYear();
    const month = orderedDateInDateFormat.getMonth() + 1;
    const day = orderedDateInDateFormat.getDate();
    return `${year} / ${month} / ${day}`;
}

const getStoreDetails = async (storeId) => {
    try {
        if (!storeId) {
            return (await axios.get(`${process.env.BASE_API_URL}/stores/main-store-details?userType=admin&language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                },
            })).data;
        } else {
            return (await axios.get(`${process.env.BASE_API_URL}/stores/store-details/${storeId}?userType=admin&language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                },
            })).data;
        }
    }
    catch (err) {
        throw err;
    }
}

const getCategoriesCount = async (filters) => {
    try {
        return (await axios.get(`${process.env.BASE_API_URL}/categories/categories-count?language=${process.env.defaultLanguage}&${filters ? filters : ""}`, {
            headers: {
                Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
            },
        })).data;
    }
    catch (err) {
        throw err;
    }
}

const getAllCategoriesInsideThePage = async (pageNumber, pageSize, filters) => {
    try {
        return (await axios.get(`${process.env.BASE_API_URL}/categories/all-categories-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&userType=admin&language=${process.env.defaultLanguage}&${filters ? filters : ""}`, {
            headers: {
                Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
            },
        })).data;
    }
    catch (err) {
        throw err;
    }
}

const getAllCategories = async (filters) => {
    try {
        return (await axios.get(`${process.env.BASE_API_URL}/categories/all-categories?userType=admin&language=${process.env.defaultLanguage}&${filters ? filters : ""}`, {
            headers: {
                Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
            },
        })).data;
    }
    catch (err) {
        throw err;
    }
}

const getAllCategoriesWithHierarechy = async (filters) => {
    try {
        return (await axios.get(`${process.env.BASE_API_URL}/categories/all-categories-with-hierarechy?language=${process.env.defaultLanguage}&${filters ? filters : ""}`)).data;
    }
    catch (err) {
        throw err;
    }
}

const getStoresCount = async (filters) => {
    try {
        return (await axios.get(`${process.env.BASE_API_URL}/stores/stores-count?language=${process.env.defaultLanguage}&${filters ? filters : ""}`, {
            headers: {
                Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
            },
        })).data;
    }
    catch (err) {
        throw err;
    }
}

const getAllStoresInsideThePage = async (pageNumber, pageSize, filters) => {
    try {
        return (await axios.get(`${process.env.BASE_API_URL}/stores/all-stores-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&language=${process.env.defaultLanguage}&${filters ? filters : ""}`, {
            headers: {
                Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
            },
        })).data;
    }
    catch (err) {
        throw err;
    }
}

const calcTotalOrderPriceBeforeDiscount = (allProductsData) => {
    let tempTotalPriceBeforeDiscount = 0;
    allProductsData.forEach((product) => {
        tempTotalPriceBeforeDiscount += product.price * getProductQuantity(product._id);
    });
    return tempTotalPriceBeforeDiscount;
}

const calcTotalOrderDiscount = (currentDate, allProductsData) => {
    let tempTotalDiscount = 0;
    allProductsData.forEach((product) => {
        tempTotalDiscount += (isExistOfferOnProduct(currentDate, product.startDiscountPeriod, product.endDiscountPeriod) ? product.discountInOfferPeriod : product.discount) * getProductQuantity(product._id);
    });
    return tempTotalDiscount;
}

const calcTotalOrderPriceAfterDiscount = (totalPriceBeforeDiscount, totalDiscount) => {
    return totalPriceBeforeDiscount - totalDiscount;
}

const calcTotalPrices = (currentDate, allProductsData) => {
    const totalPriceBeforeDiscount = calcTotalOrderPriceBeforeDiscount(allProductsData);
    const totalDiscount = calcTotalOrderDiscount(currentDate, allProductsData);
    return {
        totalPriceBeforeDiscount,
        totalDiscount,
        totalPriceAfterDiscount: calcTotalOrderPriceAfterDiscount(totalPriceBeforeDiscount, totalDiscount)
    };
}

const getTimeAndDateByLocalTime = (dateAndTimeAsString) => {
    const UTCDateAndTime = new Date(dateAndTimeAsString);
    const DateAndTimeByLocalTime = new Date(UTCDateAndTime.getTime() - UTCDateAndTime.getTimezoneOffset() * 60 * 1000);
    return DateAndTimeByLocalTime.toISOString().substring(0, 19);
}

const getDateInUTCFormat = (localTimeAndDateAsString) => {
    const date = new Date(localTimeAndDateAsString);
    const diffBetweenLocalTimeAndUTC = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() + diffBetweenLocalTimeAndUTC);
    return (new Date(date.getTime() - (diffBetweenLocalTimeAndUTC * 60000))).toISOString();
}

async function getAdminInfo() {
    try {
        return (await axios.get(`${process.env.BASE_API_URL}/admins/user-info?language=${process.env.defaultLanguage}`, {
            headers: {
                Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
            },
        })).data;
    }
    catch (err) {
        throw err;
    }
}

const getOrderDetails = async (orderId, ordersType) => {
    try {
        return (await axios.get(`${process.env.BASE_API_URL}/orders/order-details/${orderId}?destination=admin&ordersType=${ordersType}&language=${process.env.defaultLanguage}`, {
            headers: {
                Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
            },
        })).data;
    }
    catch (err) {
        throw err;
    }
}

const handleSelectUserLanguage = (userLanguage, changeLanguageFunc) => {
    changeLanguageFunc(userLanguage);
    document.body.lang = userLanguage;
}

const getProductInfo = async (productId) => {
    try {
        return (await axios.get(`${process.env.BASE_API_URL}/products/product-info/${productId}?userType=admin&language=${process.env.defaultLanguage}`, {
            headers: {
                Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
            },
        })).data;
    }
    catch (err) {
        throw Error(err);
    }
}

const getAllBrandsInsideThePage = async (pageNumber, pageSize, filters) => {
    try {
        return (await axios.get(`${process.env.BASE_API_URL}/brands/all-brands-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&language=${process.env.defaultLanguage}&${filters ? filters : ""}`, {
            headers: {
                Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
            },
        })).data;
    }
    catch (err) {
        throw err;
    }
}

export {
    getProductsCount,
    getAllProductsInsideThePage,
    getDateFormated,
    getStoreDetails,
    getCategoriesCount,
    getAllCategoriesInsideThePage,
    getAllCategories,
    getAllCategoriesWithHierarechy,
    getStoresCount,
    getAllStoresInsideThePage,
    calcTotalPrices,
    getTimeAndDateByLocalTime,
    getDateInUTCFormat,
    calcTotalOrderPriceAfterDiscount,
    getAdminInfo,
    getOrderDetails,
    handleSelectUserLanguage,
    getProductInfo,
    getAllBrandsInsideThePage
}