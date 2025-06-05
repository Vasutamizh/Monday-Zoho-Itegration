const router = require('express').Router();
const { authenticationMiddleware } = require('../middlewares/authentication');
const mondayController = require('../controllers/monday-controller');

router.post('/monday/execute_action', authenticationMiddleware, mondayController.executeAction);
router.post('/monday/get_remote_list_options', authenticationMiddleware, mondayController.getRemoteListOptions);
router.post('/zoho/webhook/invoice', mondayController.zohoInvoice);
router.post('/zoho/webhook/customer', mondayController.zohoCustomer);
router.post('/zoho/create/customer', mondayController.zohoCreateCustomer);
router.post('/zoho/create/invoice', mondayController.zohoCreateInvoice);
router.get('/zoho/customers', mondayController.getAllZohoCustomer);
router.get('/zoho/items', mondayController.getZohoItems);

module.exports = router;
