var express = require('express');
var router = express.Router();
var dao = require('../dao/dao');
var util = require('../util/util')

// TODO
router.use(util.loginChecker)

router.get('/getShareData', function(req, res, next) {
  dao.execute(new dao.selectList('(select \'t_medical\' as table_name, m.* from t_medical m where del_flag = false order by display_order) ' +
    'union all (select \'t_healthy\' as table_name, h.* from t_healthy h where del_flag = false order by display_order)', [], function (error, results, fields) {
    if (error) {
      return next(error)
    }
    res.json(util.getSuccessData({
      // TODO
      userSettings: req.session.userInfo.settings,
      // userSettings: null,
      productData: util.transferFromList(results, fields)
    }))
  }))
});

router.post('/saveSettings', function(req, res, next) {
  let {userId} = req.session.userInfo
  let settings = req.body.settings
  dao.execute(new dao.update('update t_user set settings = ?, update_time = sysdate(), row_version = row_version + 1 where user_id = ?', [settings, userId], function (error, results, fields) {
    if (error) {
      return next(error)
    }
    res.json(util.getSuccessData({}))
  }))
});

router.post('/clearSettings', function(req, res, next) {
  let {userId} = req.session.userInfo
  dao.execute(new dao.update('update t_user set settings = null, update_time = sysdate(), row_version = row_version + 1 where user_id = ?', [userId], function (error, results, fields) {
    if (error) {
      return next(error)
    }
    res.json(util.getSuccessData({}))
  }))
});

module.exports = router;
