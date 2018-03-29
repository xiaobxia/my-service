/**
 * Created by xiaobxia on 2018/3/29.
 */
const fs = require('fs-extra');
const del = require('del');
const moment = require('moment');
const util = require('../util');

const numberUtil = util.numberUtil;
const analyzeUtil = util.analyzeUtil;

exports.addUserFund = async function (ctx) {
  const query = ctx.request.body;
  const fundService = ctx.services.fund;
  try {
    const tokenRaw = ctx.tokenRaw;
    const data = ctx.validateData({
      code: {type: 'string', required: true},
      count: {type: 'number', required: true}
    }, query);
    // 添加基金
    let fund = await fundService.checkFundByQuery({code: data.code});
    if (!fund) {
      fund = await fundService.addFund(data.code);
    }
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 添加基金用户关系
    const userFund = await fundService.checkUserFundByQuery({
      user: userRaw._id,
      fund: fund._id
    });
    if (userFund) {
      await fundService.updateUserFund(userRaw._id, fund._id, data.count);
    } else {
      await fundService.addUserFund(userRaw._id, fund._id, data.count);
    }
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.deleteUserFund = async function (ctx) {
  const query = ctx.query;
  const fundService = ctx.services.fund;
  try {
    const tokenRaw = ctx.tokenRaw;
    const data = ctx.validateData({
      code: {type: 'string', required: true}
    }, query);
    // 得到基金信息
    const fund = await fundService.checkFundByQuery({
      code: data.code
    });
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 删除基金用户关系
    await fundService.deleteUserFund(userRaw._id, fund._id);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.updateUserFund = async function (ctx) {
  const query = ctx.request.body;
  const fundService = ctx.services.fund;
  try {
    const tokenRaw = ctx.tokenRaw;
    const data = ctx.validateData({
      code: {type: 'string', required: true},
      count: {type: 'number', required: true}
    }, query);
    // 验证基金
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    const fund = await fundService.checkFundByQuery({
      code: data.code
    });
    if (fund) {
      // 更新基金用户关系
      await fundService.updateUserFund(userRaw._id, fund._id, data.count);
      ctx.body = ctx.resuccess();
    } else {
      ctx.body = ctx.refail({
        message: '非法基金'
      });
    }
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getUserFunds = async function (ctx) {
  const fundService = ctx.services.fund;
  try {
    const tokenRaw = ctx.tokenRaw;
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 找到用户下的基金
    const userFunds = await fundService.getUserFundsByUserIdWithFund(userRaw._id);
    let list = [];
    let totalSum = 0;
    let valuationTotalSum = 0;
    for (let i = 0; i < userFunds.length; i++) {
      const userFund = userFunds[i];
      const fund = userFund.fund;
      // 持仓金额
      const sum = numberUtil.keepTwoDecimals(fund.net_value * userFund.count);
      totalSum += sum;
      const valuationInfo = analyzeUtil.getBetterValuation(fund);
      let result = {
        name: fund.name,
        code: fund.code,
        count: userFund.count,
        // 净值
        netValue: fund.net_value,
        // 持仓净值
        sum,
        valuation: valuationInfo.valuation,
        valuationSource: valuationInfo.sourceName
      };
      result.valuationSum = numberUtil.keepTwoDecimals(result.valuation * userFund.count);
      valuationTotalSum += result.valuationSum;
      list.push(result);
    }
    list.sort(function (a, b) {
      return b.sum - a.sum;
    });
    ctx.body = ctx.resuccess({
      list,
      info: {
        totalSum: Math.round(totalSum),
        valuationTotalSum: Math.round(valuationTotalSum),
        valuationDate: userFunds[0] ? userFunds[0].fund['valuation_date'] : ''
      }
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 导入基金，如果基金不存在，就添加
exports.importMyFunds = async function (ctx) {
  const tokenRaw = ctx.tokenRaw;
  const fundService = ctx.services.fund;
  console.log(ctx.req.file);
  // 获取上传数据
  const filePath = `${ctx.localConfig.uploadDir}/${ctx.req.file.filename}`;
  const data = await fs.readJson(filePath);
  try {
    const funds = data.myFund;
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 添加
    if (funds.length > 0 && funds[0].code) {
      let optionList = [];
      for (let k = 0; k < funds.length; k++) {
        // 检查是否在基金库中
        let fund = await fundService.checkFundByQuery({
          code: funds[k].code
        });
        if (fund) {
          // 检查是否已经添加
          const record = await fundService.checkUserFundByQuery({
            user: userRaw._id,
            fund: fund._id
          });
          if (record) {
            optionList.push(fundService.updateUserFund(userRaw._id, fund._id, funds[k].count));
          } else {
            optionList.push(fundService.addUserFund(userRaw._id, fund._id, funds[k].count));
          }
        } else {
          fund = await fundService.addFund(funds[k].code);
          optionList.push(fundService.addUserFund(userRaw._id, fund._id, funds[k].count));
        }
      }
      await Promise.all(optionList);
      ctx.body = ctx.resuccess();
    } else {
      ctx.body = ctx.refail({
        message: 'json数据不正确'
      });
    }
  } catch (err) {
    ctx.body = ctx.refail();
  } finally {
    del(filePath);
  }
};

// 导出我的基金
exports.exportMyFunds = async function (ctx) {
  try {
    const tokenRaw = ctx.tokenRaw;
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    const userFunds = await ctx.services.fund.getUserFundsByUserIdWithFund(userRaw._id);
    let list = [];
    for (let i = 0; i < userFunds.length; i++) {
      const fund = userFunds[i].fund;
      list.push({
        name: fund.name,
        code: fund.code,
        count: userFunds[i].count
      });
    }
    ctx.body = {
      list
    }
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
