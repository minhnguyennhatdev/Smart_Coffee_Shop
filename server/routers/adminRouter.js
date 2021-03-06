const express = require("express")
const report = require('../controllers/adminController')
const { uploadUpdated } = require('../middlewares/multer')

const router = express.Router();

router.get('/income', report.getIncomeReport)

router.post('/incomebyfilter', report.getIncomeReportByFilter);

router.get('/products', report.getProductsReport);

router.post('/updateProduct', report.updateProduct);

router.get('/orders', report.getOrdersReport);

router.get('/customers', report.getCustomersReport);

router.get('/users', report.getUsersReport);

module.exports = router
