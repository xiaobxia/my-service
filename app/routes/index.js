const Router = require('koa-router');
const multer = require('koa-multer');
const controllers = require('../controllers');
const reqlib = require('app-root-path').require;
const config = reqlib('/config/index');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({storage: storage});

const projectName = config.project.projectName;
if (!projectName) {
  console.error('projectName is required');
  process.exit();
}
const router = new Router({
  prefix: `/${projectName}`
});

/**
 * 登陆模块
 */
//登陆
router.post('/auth/login', controllers.authController.login);
//检查登陆
router.get('/auth/checkLogin', controllers.authController.checkLogin);
//退出登录
router.get('/auth/logout', controllers.authController.logout);

/**
 * 基金模块
 */
router.post('/fund/addFund', controllers.fundController.addFund);
router.get('/fund/deleteFund', controllers.fundController.deleteFund);
router.get('/fund/getFundBase', controllers.fundController.getFundBase);
router.get('/fund/getFunds', controllers.fundController.getFunds);
router.get('/fund/getFundAnalyzeRecent', controllers.fundController.getFundAnalyzeRecent);

/**
 * 用户基金模块
 */
router.post('/fund/addUserFund', controllers.myFundController.addUserFund);
router.get('/fund/deleteUserFund', controllers.myFundController.deleteUserFund);
router.post('/fund/updateUserFund', controllers.myFundController.updateUserFund);
router.get('/fund/getUserFunds', controllers.myFundController.getUserFunds);
router.get('/fund/getMyAsset', controllers.myFundController.getMyAsset);

/**
 * 用户净值记录
 */
router.post('/fund/addUserNetValue', controllers.userNetValueController.addUserNetValue);
router.get('/fund/deleteUserNetValue', controllers.userNetValueController.deleteUserNetValue);
router.post('/fund/updateUserNetValue', controllers.userNetValueController.updateUserNetValue);
router.get('/fund/getUserNetValues', controllers.userNetValueController.getUserNetValues);
router.get('/fund/getUserNetValuesAll', controllers.userNetValueController.getUserNetValuesAll);
/**
 * 关注基金模块
 */
router.post('/fund/addUserNetValue', controllers.focusFundController.addFocusFund);
router.get('/fund/getFocusFunds', controllers.focusFundController.getFocusFunds);
router.get('/fund/deleteFocusFund', controllers.focusFundController.getFocusFunds);

/**
 * 策略
 */
router.get('/strategy/getStrategy', controllers.strategyController.getStrategy);
router.get('/strategy/getMyStrategy', controllers.strategyController.getMyStrategy);
router.get('/strategy/getLowRateStrategy', controllers.strategyController.getLowRateStrategy);

/**
 * 文件上传模块
 */
router.post('/upload/importFund', upload.single('fundFile'), controllers.uploadController.importFunds);

/**
 * 文件下载模块
 */
router.post('/download/exportMyFund', controllers.exportController.exportMyFunds);

/**
 * 定时任务模块
 */
router.post('/schedule/addSchedule', controllers.scheduleController.addSchedule);
router.get('/schedule/deleteSchedule', controllers.scheduleController.deleteSchedule);
router.post('/schedule/updateSchedule', controllers.scheduleController.updateSchedule);
router.post('/schedule/changeScheduleStatus', controllers.scheduleController.changeScheduleStatus);
router.get('/schedule/getSchedules', controllers.scheduleController.getSchedules);

router.get('/schedule/verifyOpening', controllers.fundScheduleController.verifyOpening);
router.get('/schedule/updateBaseInfo', controllers.fundScheduleController.updateBaseInfo);
router.get('/schedule/updateValuation', controllers.fundScheduleController.updateValuation);
router.get('/schedule/updateRecentNetValue', controllers.fundScheduleController.updateRecentNetValue);
router.get('/schedule/betterValuation', controllers.fundScheduleController.betterValuation);
router.get('/schedule/addRecentNetValue', controllers.fundScheduleController.addRecentNetValue);
router.get('/schedule/deleteUnSellFund', controllers.fundScheduleController.deleteUnSellFund);
router.post('/schedule/updateLowRateFund', controllers.fundScheduleController.updateLowRateFund);
router.post('/schedule/deleteHighRateFund', controllers.fundScheduleController.deleteHighRateFund);

/**
 * 网络数据
 */
router.get('/webData/getWebStockdaybar', controllers.webDataController.getWebStockdaybar);

module.exports = router;
