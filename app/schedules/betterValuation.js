/**
 * Created by xiaobxia on 2018/2/2.
 */
const schedule = require('node-schedule');
const request = require('request-promise');
const reqlib = require('app-root-path').require;
const logger = require('../common/logger');
const config = reqlib('/config/index');
/**
 * cron风格的
 *    *    *    *    *    *
 ┬    ┬    ┬    ┬    ┬    ┬
 │    │    │    │    │    |
 │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 │    │    │    │    └───── month (1 - 12)
 │    │    │    └────────── day of month (1 - 31)
 │    │    └─────────────── hour (0 - 23)
 │    └──────────────────── minute (0 - 59)
 └───────────────────────── second (0 - 59, OPTIONAL)
 */
let rule = new schedule.RecurrenceRule();
// 第二天统计
rule.dayOfWeek = [new schedule.Range(2, 6)];
rule.hour = 6;
rule.minute = 10;

function betterValuation() {
  request({
    method: 'get',
    url: `http://localhost:${config.server.port || 8080}/myService/analyze/betterValuation`
  }).catch(function (err) {
    logger.error(err);
  });
  logger.info(`于${new Date().toLocaleString()}执行统计哪个基金估值更准`);
}

// 统计哪个基金估值更准
const job = schedule.scheduleJob(rule, betterValuation);

module.exports = job;
