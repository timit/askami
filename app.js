const SlackApp = require('@slack/bolt').App;
const MarketplaceService = require('./lib/MarketplaceService.js');
const SlackCommand = require('./lib/SlackCommand.js');
const SlackModal = require('./lib/SlackModal.js');
const logger = require('./lib/logger.js');

//initialize SlackApp using environment variables
const slackApp = new SlackApp({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

//initialize MarketplaceService using environment variables
const mktSvc = new MarketplaceService(
    process.env.MARKETPLACE_SERVICE_PROTOCOL,
    process.env.MARKETPLACE_SERVICE_HOST
);

//process askami command
slackApp.command('/askami', async ({ command, ack, respond, body, client, say }) => {
    const context = '[slackApp.command:askami]';
    logger.debug(`${context}`);
    //acknowledge request
    await ack();
    logger.debug(`${context} ${JSON.stringify(command,null,2)}`);
    //capture usage for development insights
    logger.info(`${context} @${command.user_name} (${command.user_id}) - "${command.text}"`);
    try {
        const result = await client.chat.postMessage({
            channel: process.env.OBSERVABILITY_CHANNEL,
            text: `@${command.user_name} (${command.user_id}) - "${command.text}"`
        });
    }
    catch (error) {
        logger.error(`${context} ${error}`);
    }
    try {
        //parse and validate command
        const cmd = new SlackCommand(command.text);
        //branch on command type
        switch (cmd.getCommandType()) {
            case 'list':
                //branch on command option
                switch (cmd.getListOption()) {
                    case '-applications':
                        let applicationList = await mktSvc.getApplications(0);
                        await client.views.open({
                            trigger_id: body.trigger_id,
                            view: SlackModal.formatApplicationList(applicationList,0)
                        });
                        break;
                    case '-products':
                        let productList = await mktSvc.getProducts(0);
                        await client.views.open({
                            trigger_id: body.trigger_id,
                            view: SlackModal.formatProductList(productList,0)
                        });
                        break;
                    default:
                        throw new Error('parsing error');
                }
                break;
            case 'search':
                //branch on command option
                switch (cmd.getListOption()) {
                    case '-addons':
                        let addonList = await mktSvc.getAddons(cmd.getCommandTerms(),0);
                        await client.views.open({
                            trigger_id: body.trigger_id,
                            view: SlackModal.formatAddonList(addonList,cmd.getCommandTerms(),0)
                        });
                        break;
                    case '-vendors':
                        let vendorList = await mktSvc.getVendors(cmd.getCommandTerms(),0);
                        await client.views.open({
                            trigger_id: body.trigger_id,
                            view: SlackModal.formatVendorList(vendorList,cmd.getCommandTerms(),0)
                        });
                        break;
                    default:
                        throw new Error('parsing error');
                }
                break;
            case 'feedback':
                await respond(`gotcha @${command.user_name}!  i'll let my people know what you think...`);
                break;
            case 'help':
                await respond(SlackCommand.help());
                break;
            default:
                throw new Error('parsing error');
        }
    }
    catch (error) {
        logger.error(`${context} ${error}`);
        await respond(SlackCommand.help(error));
    }
});

//process addon detail request
slackApp.action('addonDetail', async ({ action, ack, body, client }) => {
    const context = '[slackApp.action:addonDetail]';
    logger.debug(`${context}`);
    //acknowledge request
    await ack();
    //parse metadata
    const key = action.value;
    let i = await mktSvc.getAddon(key);
    try {
        await client.views.push({
            trigger_id: body.trigger_id,
            view: SlackModal.formatAddonDetail(i)
        });
    }
    catch (error) {
        logger.error(`${context} ${error}`);
    }
});

//process application detail request
slackApp.action('applicationDetail', async ({ action, ack, body, client }) => {
    const context = '[slackApp.action:applicationDetail]';
    logger.debug(`${context}`);
    //acknowledge request
    await ack();
    //parse metadata
    const key = action.value;
    let i = await mktSvc.getApplication(key);
    try {
        await client.views.push({
            trigger_id: body.trigger_id,
            view: SlackModal.formatApplicationDetail(i)
        });
    }
    catch (error) {
        logger.error(`${context} ${error}`);
    }
});

//process product detail request
slackApp.action('productDetail', async ({ action, ack, body, client }) => {
    const context = '[slackApp.action:productDetail]';
    logger.debug(`${context}`);
    //acknowledge request
    await ack();
    //parse metadata
    const key = action.value;
    let i = await mktSvc.getProduct(key);
    try {
        await client.views.push({
            trigger_id: body.trigger_id,
            view: SlackModal.formatProductDetail(i)
        });
    }
    catch (error) {
        logger.error(`${context} ${error}`);
    }
});

//process vendor detail request
slackApp.action('vendorDetail', async ({ action, ack, body, client }) => {
    const context = '[slackApp.action:vendorDetail]';
    logger.debug(`${context}`);
    //acknowledge request
    await ack();
    //parse metadata
    const key = action.value;
    let i = await mktSvc.getVendor(key);
    try {
        await client.views.push({
            trigger_id: body.trigger_id,
            view: SlackModal.formatVendorDetail(i)
        });
    }
    catch (error) {
        logger.error(`${context} ${error}`);
    }
});

//process addon list paging request
slackApp.action({block_id: 'AddonListPagination'}, async ({ action, ack, body, client }) => {
    const context = '[slackApp.action:AddonListPagination]';
    logger.debug(`${context}`);
    //acknowledge request
    await ack();
    //parse metadata
    const metadata = JSON.parse(body.view.private_metadata);
    const index = action.value;
    let addonList = await mktSvc.getAddons(metadata.terms,index);
    try {
        await client.views.update({
            view_id: body.view.id,
            view: SlackModal.formatAddonList(addonList,metadata.terms,index)
        });
    }
    catch (error) {
        logger.error(`${context} ${error}`);
    }
});

//process application list paging request
slackApp.action({block_id: 'ApplicationListPagination'}, async ({ action, ack, body, client }) => {
    const context = '[slackApp.action:ApplicationListPagination]';
    logger.debug(`${context}`);
    //acknowledge request
    await ack();
    //parse metadata
    const metadata = JSON.parse(body.view.private_metadata);
    const index = action.value;
    let applicationList = await mktSvc.getApplications(index);
    try {
        await client.views.update({
            view_id: body.view.id,
            view: SlackModal.formatApplicationList(applicationList,index)
        });
    }
    catch (error) {
        logger.error(`${context} ${error}`);
    }
});

//process product list paging request
slackApp.action({block_id: 'ProductListPagination'}, async ({ action, ack, body, client }) => {
    const context = '[slackApp.action:ProductListPagination]';
    logger.debug(`${context}`);
    //acknowledge request
    await ack();
    //parse metadata
    const metadata = JSON.parse(body.view.private_metadata);
    const index = action.value;
    let productList = await mktSvc.getProducts(index);
    try {
        await client.views.update({
            view_id: body.view.id,
            view: SlackModal.formatProductList(productList,index)
        });
    }
    catch (error) {
        logger.error(`${context} ${error}`);
    }
});

//process vendor list paging request
slackApp.action({block_id: 'VendorListPagination'}, async ({ action, ack, body, client }) => {
    const context = '[slackApp.action:VendorListPagination]';
    logger.debug(`${context}`);
    //acknowledge request
    await ack();
    //parse metadata
    const metadata = JSON.parse(body.view.private_metadata);
    const index = action.value;
    let vendorList = await mktSvc.getVendors(metadata.terms,index);
    try {
        await client.views.update({
            view_id: body.view.id,
            view: SlackModal.formatVendorList(vendorList,metadata.terms,index)
        });
    }
    catch (error) {
        logger.error(`${context} ${error}`);
    }
});

//global error handler
slackApp.error((error) => {
    const context = '[slackApp.error]';
    logger.error(`${context} ${error}`);
});

// initialize and start
(async () => {
    const context = '[slackApp]';
    await slackApp.start(process.env.PORT || 3000);
    logger.info(`${context} askami is alive!`);
})();
