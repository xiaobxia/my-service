const mongoose = require('mongoose')
const reqlib = require('app-root-path').require
const config = reqlib('/config/index')

mongoose.Promise = Promise
mongoose.connect(config.db, {
  server: {
    poolSize: 20
  }
}, (err) => {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message)
    process.exit(1)
  }
})

// 模型
exports.User = require('./user')
exports.LogAudit = require('./log_audit')
exports.Fund = require('./fund')
exports.UserNetValue = require('./user_net_value')
exports.UserFund = require('./user_fund')
exports.FocusFund = require('./focus_fund')
exports.OptionalFund = require('./optional_fund')
exports.Dictionaries = require('./dictionaries')
exports.StockPrice = require('./stock_price')

// 字段
exports.fields_table = require('./fields_table')
