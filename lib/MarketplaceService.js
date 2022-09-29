const got = require('got');
const logger = require('./logger.js');

class MarketplaceService {
    constructor(protocol, host) {
        this.amapi = {
            protocol: protocol,
            host: host
        };
    };

    static #buildAddonSummaryJson(amapiAddonJson) {
        const context = '[MarketplaceService.#buildAddonSummaryJson]';
        logger.debug(`${context}`);
        if (!amapiAddonJson) {
            throw new Error("null addon payload");
        }
        const addonSummaryJson = {
            "id": amapiAddonJson.id,
            "key": amapiAddonJson.key,
            "title": amapiAddonJson.name
        }
        logger.debug(`${context} addonSummaryJson ${JSON.stringify(addonSummaryJson,null,2)}`);
        return addonSummaryJson;
    }

    static #buildApplicationSummaryJson(amapiApplicationJson) {
        const context = '[MarketplaceService.#buildApplicationSummaryJson]';
        logger.debug(`${context}`);
        if (!amapiApplicationJson) {
            throw new Error("null application payload");
        }
        const applicationSummaryJson = {
            "id": amapiApplicationJson.id,
            "key": amapiApplicationJson.key,
            "title": amapiApplicationJson.name
        }
        logger.debug(`${context} applicationSummaryJson ${JSON.stringify(applicationSummaryJson,null,2)}`);
        return applicationSummaryJson;
    }

    static #buildProductSummaryJson(amapiProductJson) {
        const context = '[MarketplaceService.#buildProductSummaryJson]';
        logger.debug(`${context}`);
        if (!amapiProductJson) {
            throw new Error("null product payload");
        }
        const productSummaryJson = {
            "id": amapiProductJson.id,
            "key": amapiProductJson.key,
            "title": amapiProductJson.name
        }
        logger.debug(`${context} productSummaryJson ${JSON.stringify(productSummaryJson,null,2)}`);
        return productSummaryJson;
    }

    static #buildVendorSummaryJson(amapiVendorJson) {
        const context = '[MarketplaceService.#buildVendorSummaryJson]';
        logger.debug(`${context}`);
        if (!amapiVendorJson) {
            throw new Error("null vendor payload");
        }
        const vendorSummaryJson = {
            "id": amapiVendorJson._links.self.href.slice(amapiVendorJson._links.self.href.lastIndexOf("/")+1),
            "title": amapiVendorJson.name
        }
        logger.debug(`${context} vendorSummaryJson ${JSON.stringify(vendorSummaryJson,null,2)}`);
        return vendorSummaryJson;
    }

    static #buildAddonDetailJson(amapiAddonJson) {
        const context = '[MarketplaceService.#buildAddonDetailJson]';
        logger.debug(`${context}`);
        if (!amapiAddonJson) {
            throw new Error("null addon payload");
        }
        logger.debug(`${context} amapiAddonJson ${JSON.stringify(amapiAddonJson,null,2)}`);
        let categoryList = [];
        amapiAddonJson._embedded.categories.forEach(i => {
            let category = {
                "title": i.name
            };
            categoryList.push(category);
        });
        const addonDetailJson = {
            "key": amapiAddonJson.key,
            "title": amapiAddonJson.name,
            "summary": amapiAddonJson.summary,
            "description": amapiAddonJson.description,
            "vendor": amapiAddonJson._embedded.vendor.name,
            "distribution": {
                "downloads": amapiAddonJson._embedded.distribution.downloads,
                "installs": amapiAddonJson._embedded.distribution.totalInstalls,
                "users": amapiAddonJson._embedded.distribution.totalUsers
            },
            "categories": categoryList
        }
        logger.debug(`${context} addonDetailJson ${JSON.stringify(addonDetailJson,null,2)}`);
        return addonDetailJson;
    }

    static #buildApplicationDetailJson(amapiApplicationJson,amapiCategoriesJson) {
        const context = '[MarketplaceService.#buildApplicationDetailJson]';
        logger.debug(`${context}`);
        if (!amapiApplicationJson) {
            throw new Error("null application payload");
        }
        if (!amapiCategoriesJson) {
            throw new Error("null category payload");
        }
        let categoryList = [];
        amapiCategoriesJson._embedded.categories.forEach(i => {
            let category = {
                "title": i.name
            };
            categoryList.push(category);
        });
        logger.debug(`${context} amapiApplicationJson ${JSON.stringify(amapiApplicationJson,null,2)}`);
        logger.debug(`${context} amapiCategoriesJson ${JSON.stringify(amapiCategoriesJson,null,2)}`);
        const applicationDetailJson = {
            "key": amapiApplicationJson.key,
            "title": amapiApplicationJson.name,
            "description": amapiApplicationJson.summary,
            "categories": categoryList
            
        }
        logger.debug(`${context} applicationDetailJson ${JSON.stringify(applicationDetailJson,null,2)}`);
        return applicationDetailJson;
    }

    static #buildProductDetailJson(amapiProductJson,jiraRemoteLinksJson) {
        const context = '[MarketplaceService.#buildProductDetailJson]';
        logger.debug(`${context}`);
        if (!amapiProductJson) {
            throw new Error("null product payload");
        }
        logger.debug(`${context} amapiProductJson ${JSON.stringify(amapiProductJson,null,2)}`);
        const productDetailJson = {
            "key": amapiProductJson.key,
            "title": amapiProductJson.name,
            "description": amapiProductJson.summary
        }
        logger.debug(`${context} productDetailJson ${JSON.stringify(productDetailJson,null,2)}`);
        return productDetailJson;
    }

    static #buildVendorDetailJson(amapiVendorJson) {
        const context = '[MarketplaceService.#buildVendorDetailJson]';
        logger.debug(`${context}`);
        if (!amapiVendorJson) {
            throw new Error("null vendor payload");
        }
        logger.debug(`${context} amapiVendorJson ${JSON.stringify(amapiVendorJson,null,2)}`);
        const vendorDetailJson = {
            "id": amapiVendorJson.id,
            "title": amapiVendorJson.name,
            "description": amapiVendorJson.description,
            "address": {
                "line1": amapiVendorJson.address.line1,
                "line2": amapiVendorJson.address.line2,
                "city": amapiVendorJson.address.city,
                "state": amapiVendorJson.address.state,
                "postcode": amapiVendorJson.address.postcode,
                "country": amapiVendorJson.address.country,
            },
            "email": amapiVendorJson.email,
            "phone": amapiVendorJson.phone
        }
        logger.debug(`${context} vendorDetailJson ${JSON.stringify(vendorDetailJson,null,2)}`);
        return vendorDetailJson;
    }

    static #buildAddonListJson(amapiAddonsJson) {
        const context = '[MarketplaceService.#buildAddonListJson]';
        logger.debug(`${context}`);
        if (!amapiAddonsJson) {
            throw new Error("null addons payload");
        }
        let addonList = [];
        amapiAddonsJson._embedded.addons.forEach (i => {
            addonList.push(MarketplaceService.#buildAddonSummaryJson(i));
        });
        const addonListJson = {
            "totalCount": amapiAddonsJson.count,
            "pageCount": Object.keys(amapiAddonsJson._embedded.addons).length,
            "pageMax": 10,
            "addons": addonList
        }
        logger.debug(`${context} addonListJson ${JSON.stringify(addonListJson,null,2)}`);
        return addonListJson;
    }

    static #buildApplicationListJson(amapiApplicationsJson) {
        const context = '[MarketplaceService.#buildApplicationListJson]';
        logger.debug(`${context}`);
        if (!amapiApplicationsJson) {
            throw new Error("null applications payload");
        }
        let applicationList = [];
        amapiApplicationsJson._embedded.applications.forEach (i => {
            applicationList.push(MarketplaceService.#buildApplicationSummaryJson(i));
        });
        const applicationListJson = {
            "totalCount": amapiApplicationsJson.count,
            "pageCount": Object.keys(amapiApplicationsJson._embedded.applications).length,
            "pageMax": 10,
            "applications": applicationList
        }
        logger.debug(`${context} applicationListJson ${JSON.stringify(applicationListJson,null,2)}`);
        return applicationListJson;
    }

    static #buildProductListJson(amapiProductsJson) {
        const context = '[MarketplaceService.#buildProductListJson]';
        logger.debug(`${context}`);
        if (!amapiProductsJson) {
            throw new Error("null products payload");
        }
        let productList = [];
        amapiProductsJson._embedded.products.forEach (i => {
            productList.push(MarketplaceService.#buildProductSummaryJson(i));
        });
        const productListJson = {
            "totalCount": amapiProductsJson.count,
            "pageCount": Object.keys(amapiProductsJson._embedded.products).length,
            "pageMax": 10,
            "products": productList
        }
        logger.debug(`${context} productListJson ${JSON.stringify(productListJson,null,2)}`);
        return productListJson;
    }

    static #buildVendorListJson(amapiVendorsJson) {
        const context = '[MarketplaceService.#buildVendorListJson]';
        logger.debug(`${context}`);
        if (!amapiVendorsJson) {
            throw new Error("null vendors payload");
        }
        let vendorList = [];
        amapiVendorsJson._embedded.vendors.forEach (i => {
            vendorList.push(MarketplaceService.#buildVendorSummaryJson(i));
        });
        const vendorListJson = {
            "totalCount": amapiVendorsJson.count,
            "pageCount": Object.keys(amapiVendorsJson._embedded.vendors).length,
            "pageMax": 10,
            "vendors": vendorList
        }
        logger.debug(`${context} vendorListJson ${JSON.stringify(vendorListJson,null,2)}`);
        return vendorListJson;
    }

    async getAddons(terms,index) {
        const context = '[MarketplaceService.getAddons]';
        logger.debug(`${context}`);
        try {
            let response = await got(`${this.amapi.protocol}://${this.amapi.host}/rest/2/addons?text=${terms}&limit=10&offset=${index}`);
            let body = JSON.parse(response.body);
            logger.debug(`${context} response.body ${JSON.stringify(body,null,2)}`);
            return MarketplaceService.#buildAddonListJson(body);
        } catch (error) {
            logger.error(`${context} ${error}`);
            throw new Error(error);
        }
    };

    async getAddon(key) {
        const context = '[MarketplaceService.getAddon]';
        logger.debug(`${context}`);
        try {
            let response = await got(`${this.amapi.protocol}://${this.amapi.host}/rest/2/addons/${key}`);
            let body = JSON.parse(response.body);
            logger.debug(`${context} response.body ${JSON.stringify(body,null,2)}`);
            return MarketplaceService.#buildAddonDetailJson(body);
        } catch (error) {
            logger.error(`${context} ${error}`);
            throw new Error(error);
        }
    };

    async getApplications(index) {
        const context = '[MarketplaceService.getApplications]';
        logger.debug(`${context}`);
        try {
            let response = await got(`${this.amapi.protocol}://${this.amapi.host}/rest/2/applications?limit=10&offset=${index}`);
            let body = JSON.parse(response.body);
            logger.debug(`${context} response.body ${JSON.stringify(body,null,2)}`);
            return MarketplaceService.#buildApplicationListJson(body);
        } catch (error) {
            logger.error(`${context} ${error}`);
            throw new Error(error);
        }
    };

    async getApplication(key) {
        const context = '[MarketplaceService.getApplication]';
        logger.debug(`${context}`);
        try {
            let applicationResponse = await got(`${this.amapi.protocol}://${this.amapi.host}/rest/2/applications/${key}`);
            let applicationBody = JSON.parse(applicationResponse.body);
            logger.debug(`${context} applicationResponse.body ${JSON.stringify(applicationBody,null,2)}`);
            let categoriesResponse = await got(`${this.amapi.protocol}://${this.amapi.host}/rest/2/addonCategories/app/${key}`);
            let categoriesBody = JSON.parse(categoriesResponse.body);
            logger.debug(`${context} categoriesResponse.body ${JSON.stringify(categoriesBody,null,2)}`);
            return MarketplaceService.#buildApplicationDetailJson(applicationBody,categoriesBody);
        } catch (error) {
            logger.error(`${context} ${error}`);
            throw new Error(error);
        }
    };

    async getProducts(index) {
        const context = '[MarketplaceService.getProducts]';
        logger.debug(`${context}`);
        try {
            let response = await got(`${this.amapi.protocol}://${this.amapi.host}/rest/2/products?limit=10&offset=${index}`);
            let body = JSON.parse(response.body);
            logger.debug(`${context} response.body ${JSON.stringify(body,null,2)}`);
            return MarketplaceService.#buildProductListJson(body);
        } catch (error) {
            logger.error(`${context} ${error}`);
            throw new Error(error);
        }
    };

    async getProduct(key) {
        const context = '[MarketplaceService.getProduct]';
        logger.debug(`${context}`);
        try {
            let response = await got(`${this.amapi.protocol}://${this.amapi.host}/rest/2/products/key/${key}`);
            let body = JSON.parse(response.body);
            logger.debug(`${context} response.body ${JSON.stringify(body,null,2)}`);
            return MarketplaceService.#buildProductDetailJson(body);
        } catch (error) {
            logger.error(`${context} ${error}`);
            throw new Error(error);
        }
    };

    async getVendors(terms,index) {
        const context = '[MarketplaceService.getVendors]';
        logger.debug(`${context}`);
        try {
            let response = await got(`${this.amapi.protocol}://${this.amapi.host}/rest/2/vendors?text=${terms}&limit=10&offset=${index}`);
            let body = JSON.parse(response.body);
            logger.debug(`${context} response.body ${JSON.stringify(body,null,2)}`);
            return MarketplaceService.#buildVendorListJson(body);
        } catch (error) {
            logger.error(`${context} ${error}`);
            throw new Error(error);
        }
    };

    async getVendor(id) {
        const context = '[MarketplaceService.getVendor]';
        logger.debug(`${context}`);
        try {
            let response = await got(`${this.amapi.protocol}://${this.amapi.host}/rest/2/vendors/${id}`);
            let body = JSON.parse(response.body);
            logger.debug(`${context} response.body ${JSON.stringify(body,null,2)}`);
            return MarketplaceService.#buildVendorDetailJson(body);
        } catch (error) {
            logger.error(`${context} ${error}`);
            throw new Error(error);
        }
    };

}

module.exports = MarketplaceService;