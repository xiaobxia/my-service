/**
 * Created by xiaobxia on 2018/1/25.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  name: String,
  code: String,
  // 净值
  net_value: Number,
  // 估值
  valuation: Number,
  // 估值源
  valuationSource: {
    type: String,
    default: 'tiantian'
  },
  // 更新时间
  valuationDate: Date,
  updateDate: Date,
  create_at: {
    type: Date,
    default: Date.now
  }
});

schema.index({code: 1}, {unique: true});
schema.index({create_at: -1});

module.exports = mongoose.model('Fund', schema);
