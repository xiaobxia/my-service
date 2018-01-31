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

//登录
router.post('/auth/login', controllers.authController.login);
router.get('/auth/checkLogin', controllers.authController.checkLogin);
router.get('/auth/logout', controllers.authController.logout);

//基金
router.post('/fund/addUserFund', controllers.fundController.addUserFund);
router.get('/fund/getUserFunds', controllers.fundController.getUserFunds);
router.get('/fund/deleteUserFund', controllers.fundController.deleteUserFund);
router.get('/fund/updateFundsInfo', controllers.fundController.updateFundsInfo);

//文件上传
router.post('/upload/importMyFund', upload.single('fundFile'), controllers.fundController.importMyFund);

//文件下载
router.post('/download/exportMyFund', controllers.fundController.exportMyFund);

module.exports = router;
