const orderModel = require('../models/order') 
const customerModel = require('../models/customer')
const { startOfDay, endOfDay, startOfMonth, endOfMonth } = require('date-fns')

const getIncomeReport = async(req, res) => {
    try {
        const bothOrders = await orderModel.find()
        const offlineOrders = await orderModel.find({type: 'OFFLINE'})
        const onlineOrders = await orderModel.find({type: 'DELIVERY'})
        const findCustomers = await customerModel.find()

        //returning rate
        const totalCustomers = findCustomers.length
        const returningCustomers = findCustomers.filter(customer => customer.orders.length > 0)
        const returningRate = Math.round((returningCustomers.length/totalCustomers)*100)

        //total income
        const bothTotalIncome = bothOrders.reduce((a, b) => a + b.totalPrice, 0)
        const offlineTotalIncome = offlineOrders.reduce((a, b) => a + b.totalPrice, 0)
        const onlineTotalIncome = (bothTotalIncome - offlineTotalIncome)

        //sales
        const bothSales = bothOrders.length
        const offlineSales = offlineOrders.length
        const onlineSales = onlineOrders.length

        const both = {
            bothTotalIncome,
            bothSales
        }
        const offline = {
            offlineTotalIncome,
            offlineSales
        }
        const online = {
            onlineTotalIncome,
            onlineSales
        }
        const customers = {
            totalCustomers,
            returningRate
        }
        res.status(202).json({
            success: true,
            customers,
            both,
            offline,
            online
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

const queryOrders = async(number, type, dateType) => {
    try {
        let result =  []
        if(type === 'BOTH') {
            switch(dateType) {
                case 'DAY':
                    for (let i = 0; i < number; i++) {
                        let total = 0
                        var date = new Date();
                        date.setDate(date.getDate() - i);
                        const query = await orderModel.find({
                            createAt: {
                              $gte: startOfDay(date),
                              $lte: endOfDay(date)
                            }
                        })
                        query.map(e => {
                            total += e.totalPrice
                        })
                        result.push(total)
                    }
                    break;
                case 'MONTH':
                    for (let i = 0; i < number; i++) {
                        let total = 0
                        var date = new Date();
                        date.setMonth(date.getMonth() - i);
                        const query = await orderModel.find({
                            createAt: {
                              $gte: startOfMonth(date),
                              $lte: endOfMonth(date)
                            }
                        })
                        query.map(e => {
                            total += e.totalPrice
                        })
                        result.push(total)
                    }
                    break;
            }
        }
        else {
            switch(dateType) {
                case 'DAY':
                    for (let i = 0; i < number; i++) {
                        let total = 0
                        var date = new Date();
                        date.setDate(date.getDate() - i);
                        const query = await orderModel.find({
                            createAt: {
                              $gte: startOfDay(date),
                              $lte: endOfDay(date)
                            },
                            type: type
                        })
                        query.map(e => {
                            total += e.totalPrice
                        })
                        result.push(total)
                    }
                    break;
                case 'MONTH':
                    for (let i = 0; i < number; i++) {
                        let total = 0
                        var date = new Date();
                        date.setMonth(date.getMonth() - i);
                        const query = await orderModel.find({
                            createAt: {
                              $gte: startOfMonth(date),
                              $lte: endOfMonth(date)
                            },
                            type: type
                        })
                        query.map(e => {
                            total += e.totalPrice
                        })
                        result.push(total)
                    }
                    break;
            }
        }
        return result.reverse()
    } catch (error) {
        console.log(error)
    }
}

const getIncomeReportByFilter = async(req, res) => {
    try {
        const { number, type, dateType } = req.body
        let result = null
        switch(type) {
            case 'both':
                result = await queryOrders(number, 'BOTH', dateType)
                break;
            case 'offline':
                result = await queryOrders(number, 'OFFLINE', dateType)
                break;
            case 'online':
                result = await queryOrders(number, 'DELIVERY', dateType)
                break;
            default:
                result = orderModel.find()
        }
        res.status(202).json({
            success: true,
            result
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

const report = {
    getIncomeReport,
    getIncomeReportByFilter
}

module.exports = report