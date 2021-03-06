/**
 * Created by xiaobxia on 2018/2/12.
 */
exports.getStrategy = async function (ctx) {
  const tokenRaw = ctx.tokenRaw
  try {
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    const strategy = await ctx.services.strategy.getStrategy(userRaw._id, true)
    ctx.body = ctx.resuccess({
      slump: strategy.slump,
      boom: strategy.boom
    })
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

// 我的基金的情况
exports.getMyStrategy = async function (ctx) {
  const tokenRaw = ctx.tokenRaw
  try {
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    const strategy = await ctx.services.strategy.getMyStrategy(userRaw._id)
    ctx.body = ctx.resuccess({
      strategy
    })
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

// 得到低费率基金的情况
exports.getLowRateStrategy = async function (ctx) {
  const tokenRaw = ctx.tokenRaw
  try {
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    const strategy = await ctx.services.strategy.getLowRateStrategy(userRaw._id)
    ctx.body = ctx.resuccess({
      strategy
    })
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 更新分析的配置
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.updateAnalyzeValue = async function (ctx) {
  const query = ctx.request.body
  const dictionariesService = ctx.services.dictionaries
  try {
    const data = ctx.validateData({
      list: { required: true }
    }, query)
    await dictionariesService.updateAnalyzeValue(JSON.parse(data.list))
    ctx.body = ctx.resuccess({})
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 获取分析的配置信息
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.getAnalyzeValue = async function (ctx) {
  const dictionariesService = ctx.services.dictionaries
  try {
    const mapData = await dictionariesService.getAnalyzeValue()
    let list = []
    for (let key in mapData) {
      list.push({
        key: key,
        value: mapData[key]
      })
    }
    ctx.body = ctx.resuccess({
      list
    })
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

exports.getFundsMaxMinDistribution = async function (ctx) {
  try {
    const result = await ctx.services.strategy.getFundsMaxMinDistribution()
    ctx.body = ctx.resuccess({
      ...result
    })
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 获取均线策略
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.getAverageStrategy = async function (ctx) {
  const tokenRaw = ctx.tokenRaw
  try {
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    const result = await ctx.services.strategy.getAverageStrategy(userRaw._id)
    ctx.body = ctx.resuccess({
      result
    })
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}
