const logger = require('./logger.js');

class SlackModal {

    static #buildHeaderBlocks(headline) {
        const context = '[SlackModal.#buildHeaderBlocks]';
        logger.debug(`${context}`);
        let blocks = [
            {
              "type": "header",
              "text": {
                  "type": "plain_text",
                  "text": headline
              }
            },
            {
                "type": "divider"
            }
        ];
        logger.debug(`${context} header: ${JSON.stringify(blocks,null,2)}`);
        return blocks;
    }
    
    static #buildAddonListItemBlock(addon) {
        const context = '[SlackModal.#buildAddonListItemBlock]';
        logger.debug(`${context}`);
        let block = 
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `${addon.title}`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "details...",
                        "emoji": true
                    },
                    "value": `${addon.key}`,
                    "action_id": "addonDetail"
                }
            };
        logger.debug(`${context} item: ${JSON.stringify(block,null,2)}`);
        return block;
    }
    
    static #buildApplicationListItemBlock(application) {
        const context = '[SlackModal.#buildApplicationListItemBlock]';
        logger.debug(`${context}`);
        let block = 
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `${application.title}`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "details...",
                        "emoji": true
                    },
                    "value": `${application.key}`,
                    "action_id": "applicationDetail"
                }
            };
        logger.debug(`${context} item: ${JSON.stringify(block,null,2)}`);
        return block;
    }

    static #buildProductListItemBlock(product) {
        const context = '[SlackModal.#buildProductListItemBlock]';
        logger.debug(`${context}`);
        let block = 
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `${product.title}`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "details...",
                        "emoji": true
                    },
                    "value": `${product.key}`,
                    "action_id": "productDetail"
                }
            };
        logger.debug(`${context} item: ${JSON.stringify(block,null,2)}`);
        return block;
    }
    
    static #buildVendorListItemBlock(vendor) {
        const context = '[SlackModal.#buildVendorListItemBlock]';
        logger.debug(`${context}`);
        let block = 
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `${vendor.title}`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "details...",
                        "emoji": true
                    },
                    "value": `${vendor.id}`,
                    "action_id": "vendorDetail"
                }
            };
        logger.debug(`${context} item: ${JSON.stringify(block,null,2)}`);
        return block;
    }
    
    static #buildListPaginationBlocks(index,count,total,max) {
        const context = '[SlackModal.#buildListPaginationBlocks]';
        logger.debug(`${context}`);
        // determine prev pagination starting point
        let prev = parseInt(index) - parseInt(max);
        // determine next pagination starting point
        let next = parseInt(index) + parseInt(count);
        // assemble pagination block
        let pagination = [];
        if (prev >= 0) {
            pagination.push(
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": ":rewind:"
                    },
                    "value": `${prev}`,
                    "action_id": "pagePrev"
                }
            );
        } else {
            pagination.push(
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": ":arrows_counterclockwise:"
                    },
                    "value": `${index}`,
                    "action_id": "pagePrev"
                }
            );
        }
        if (next < total) {
            pagination.push(
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": ":fast_forward:"
                    },
                    "value": `${next}`,
                    "action_id": "pageNext"
                }
            );
        } else {
            pagination.push(
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": ":arrows_counterclockwise:"
                    },
                    "value": `${index}`,
                    "action_id": "pageNext"
                }
            );
        }
        logger.debug(`${context} blocks: ${JSON.stringify(pagination,null,2)}`);
        return pagination;
    }

    static #buildModal(blocks,metadata='') {
        const context = '[SlackModal.#buildModal]';
        logger.debug(`${context}`);
        let modal = 
            {
                "type": "modal",
                "callback_id": "v0",
                "title": {
                    "type": "plain_text",
                    "text": `AskAMi`
                },
                "blocks": blocks,
                "private_metadata": metadata
            };
        logger.debug(`${context} modal: ${JSON.stringify(modal,null,2)}`);
        return modal;
    }

    static #getSticker(term) {
        const context = '[SlackModal.#getSticker]';
        logger.debug(`${context}`);
        logger.debug(`${context} sticker for ${JSON.stringify(term,null,2)}`);
        switch (term.toUpperCase()) {
            case 'GOLD':
                return ':first_place_medal:';
            case 'SILVER':
                return ':second_place_medal:';
            case 'BRONZE':
                return ':third_place_medal:';
            case 'IBM':
                return ':ibm-logo:';
            case 'TAXONOMY':
                return ':open_file_folder:';
            default:
                return ':interrobang:';
        }
    }
    
    static formatAddonList(payload,terms,index) {
        const context = '[SlackModal.formatAddonList]';
        logger.debug(`${context}`);
        let blocks = SlackModal.#buildHeaderBlocks(`AMi found ${payload.totalCount} addon(s) matching "${terms}"`);
        // assemble addon list
        payload.addons.forEach(addon => {
            blocks.push(SlackModal.#buildAddonListItemBlock(addon,true));
        });
        blocks.push(
            {
                "type": "actions",
                "block_id": 'AddonListPagination',
                "elements": SlackModal.#buildListPaginationBlocks(index, payload.pageCount, payload.totalCount, payload.pageMax)
            }
        );
        let metadata =
            {
                "terms": terms
            };
        return SlackModal.#buildModal(blocks, JSON.stringify(metadata));
    }

    static formatApplicationList(payload,index) {
        const context = '[SlackModal.formatApplicationList]';
        logger.debug(`${context}`);
        let blocks = SlackModal.#buildHeaderBlocks(`AMi found ${payload.totalCount} application(s)`);
        // assemble application list
        payload.applications.forEach(application => {
            blocks.push(SlackModal.#buildApplicationListItemBlock(application,true));
        });
        blocks.push(
            {
                "type": "actions",
                "block_id": 'ApplicationListPagination',
                "elements": SlackModal.#buildListPaginationBlocks(index, payload.pageCount, payload.totalCount, payload.pageMax)
            }
        );
        return SlackModal.#buildModal(blocks);
    }

    static formatProductList(payload,index) {
        const context = '[SlackModal.formatProductList]';
        logger.debug(`${context}`);
        let blocks = SlackModal.#buildHeaderBlocks(`AMi found ${payload.totalCount} products(s)"`);
        // assemble product list
        payload.products.forEach(product => {
            blocks.push(SlackModal.#buildProductListItemBlock(product,true));
        });
        blocks.push(
            {
                "type": "actions",
                "block_id": 'ProductListPagination',
                "elements": SlackModal.#buildListPaginationBlocks(index, payload.pageCount, payload.totalCount, payload.pageMax)
            }
        );
        return SlackModal.#buildModal(blocks);
    }

    static formatVendorList(payload,terms,index) {
        const context = '[SlackModal.formatVendorList]';
        logger.debug(`${context}`);
        let blocks = SlackModal.#buildHeaderBlocks(`AMi found ${payload.totalCount} vendors(s) matching "${terms}"`);
        // assemble vendor list
        payload.vendors.forEach(vendor => {
            blocks.push(SlackModal.#buildVendorListItemBlock(vendor,true));
        });
        blocks.push(
            {
                "type": "actions",
                "block_id": 'VendorListPagination',
                "elements": SlackModal.#buildListPaginationBlocks(index, payload.pageCount, payload.totalCount, payload.pageMax)
            }
        );
        let metadata =
            {
                "terms": terms
            };
        return SlackModal.#buildModal(blocks, JSON.stringify(metadata));
    }

    static formatAddonDetail(addon) {
        const context = '[SlackModal.formatAddonDetail]';
        logger.debug(`${context}`);
        let blocks = SlackModal.#buildHeaderBlocks('Addon Detail');
        blocks.push(
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": "*Title:*"
                    },
                    {
                        "type": "plain_text",
                        "text": `${addon.title}`
                    },
                    {
                        "type": "mrkdwn",
                        "text": "*Key:*"
                    },
                    {
                        "type": "plain_text",
                        "text": `${addon.key}`
                    },
                    {
                        "type": "mrkdwn",
                        "text": "*Vendor:*"
                    },
                    {
                        "type": "plain_text",
                        "text": `${addon.vendor}`
                    }
                ]
            }
        );
        if (addon.summary) {
            blocks.push({
                "type": "divider"
            });
            blocks.push(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*Description:*\n\n${addon.summary}`
                    }
                }
            );
        }
        if (addon.description) {
            blocks.push({
                "type": "divider"
            });
            blocks.push(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*Description:*\n\n${addon.description}`
                    }
                }
            );
        }
        if (addon.distribution) {
            blocks.push({
                "type": "divider"
            });
            blocks.push(
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*Downloads:*"
                        },
                        {
                            "type": "plain_text",
                            "text": `${addon.distribution.downloads}`
                        },
                        {
                            "type": "mrkdwn",
                            "text": "*Installs:*"
                        },
                        {
                            "type": "plain_text",
                            "text": `${addon.distribution.installs}`
                        },
                        {
                            "type": "mrkdwn",
                            "text": "*Users:*"
                        },
                        {
                            "type": "plain_text",
                            "text": `${addon.distribution.users}`
                        }
                    ]
                }
            );
        }
        if (Object.keys(addon.categories).length > 0) {
            blocks.push({
                "type": "divider"
            });
            let categoryList = " ";
            addon.categories.forEach(i => {
                categoryList += `\n\n${i.title}`
            });
            blocks.push(
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*Categories:*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": `${categoryList}`
                        },
                    ]
                }
            );
        }
        return SlackModal.#buildModal(blocks);
    }

    static formatApplicationDetail(application) {
        const context = '[SlackModal.formatApplicationDetail]';
        logger.debug(`${context}`);
        let blocks = SlackModal.#buildHeaderBlocks('Application Detail');
        blocks.push(
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": "*Key:*"
                    },
                    {
                        "type": "mrkdwn",
                        "text": "*Title:*"
                    },
                    {
                        "type": "plain_text",
                        "text": `${application.key}`
                    },
                    {
                        "type": "plain_text",
                        "text": `${application.title}`
                    }
                ]
            }
        );
        if (application.description) {
            blocks.push({
                "type": "divider"
            });
            blocks.push(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*Description:*\n\n${application.description}`
                    }
                }
            );
        }
        if (Object.keys(application.categories).length > 0) {
            blocks.push({
                "type": "divider"
            });
            let categoryList = " ";
            application.categories.forEach(i => {
                categoryList += `\n\n${i.title}`
            });
            blocks.push(
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*Categories:*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": `${categoryList}`
                        },
                    ]
                }
            );
        }
        return SlackModal.#buildModal(blocks);
    }

    static formatProductDetail(product) {
        const context = '[SlackModal.formatProductDetail]';
        logger.debug(`${context}`);
        let blocks = SlackModal.#buildHeaderBlocks('Product Detail');
        blocks.push(
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": "*Key:*"
                    },
                    {
                        "type": "mrkdwn",
                        "text": "*Title:*"
                    },
                    {
                        "type": "plain_text",
                        "text": `${product.key}`
                    },
                    {
                        "type": "plain_text",
                        "text": `${product.title}`
                    }
                ]
            }
        );
        if (product.description) {
            blocks.push({
                "type": "divider"
            });
            blocks.push(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*Description:*\n\n${product.description}`
                    }
                }
            );
        }
        return SlackModal.#buildModal(blocks);
    }

    static formatVendorDetail(vendor) {
        const context = '[SlackModal.formatVendorDetail]';
        logger.debug(`${context}`);
        let blocks = SlackModal.#buildHeaderBlocks('Vendor Detail');
        blocks.push(
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": "*ID:*"
                    },
                    {
                        "type": "mrkdwn",
                        "text": "*Title:*"
                    },
                    {
                        "type": "plain_text",
                        "text": `${vendor.id}`
                    },
                    {
                        "type": "plain_text",
                        "text": `${vendor.title}`
                    }
                ]
            }
        );
        if (vendor.description) {
            blocks.push({
                "type": "divider"
            });
            blocks.push(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*Description:*\n\n${vendor.description}`
                    }
                }
            );
        }
        if (vendor.address) {
            blocks.push({
                "type": "divider"
            });
            blocks.push(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*Address:*\n\n${vendor.address.line1}\n${vendor.address.line2}\n${vendor.address.city}, ${vendor.address.state} ${vendor.address.postcode}\n${vendor.address.country}`
                    }
                }
            );
        }
        if (vendor.email && vendor.phone) {
            blocks.push(
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*Email:*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "*Phone:*"
                        },
                        {
                            "type": "plain_text",
                            "text": `${vendor.email}`
                        },
                        {
                            "type": "plain_text",
                            "text": `${vendor.phone}`
                        }
                    ]
                }
            );
        }
        return SlackModal.#buildModal(blocks);
    }

}

module.exports = SlackModal;