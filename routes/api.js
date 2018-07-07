var express = require('express');
var router = express.Router();
var dao = require('../dao/dao');
var util = require('../util/util')

router.get('/getDictionary', function(req, res, next) {
    dao.execute(new dao.selectList('select concat(table_name, \'-\', column_name) as category_name, column_name, value, name from t_dictionary where del_flag = false', [], function (error, results, fields) {
        if (error) {
            return next(error)
        }
        var data = util.transferFromList(results, fields)
        var retData = {}
        data.map(function (item) {
            if (!retData[item.categoryName]) {
                retData[item.categoryName] = []
            }
            if (item.columnName !== 'type_id') {
                item.value = Number(item.value)
            }
            retData[item.categoryName].push(item)
        })
        Object.keys(retData).map(function (key) {
            if (key === 'type_id') {
                return
            }
            retData[key] = retData[key].sort(function (item1, item2) {
                return item1.value - item2.value
            })
        })
        res.json(util.getSuccessData(retData))
    }))
});

router.get('/getColumnInfo', function(req, res, next) {
    dao.execute(new dao.selectList('select * from t_column_info where del_flag = false', [], function (error, results, fields) {
        if (error) {
            return next(error)
        }
        var transferResults = util.transferFromList(results, fields).map(function (item) {
            item.columnName = util.underLineToHump(item.columnName)
            return item
        })
        res.json(util.getSuccessData(transferResults))
    }))
});

router.get('/getDataByType/:dataType', function(req, res, next) {
    var dataType = req.params.dataType
    var tableName = util.getTableName(dataType)
    dao.execute(new dao.selectList('select * from ' + tableName + ' where del_flag = false', [], function (error, results, fields) {
        if (error) {
            return next(error)
        }
        res.json(util.getSuccessData(util.transferFromList(results, fields)))
    }))
});

router.get('/getData', function(req, res, next) {
    dao.execute(new dao.selectList('select \'t_medical\' as table_name, m.* from t_medical m where del_flag = false ' +
        'union all select \'t_healthy\' as table_name, h.* from t_healthy h where del_flag = false', [], function (error, results, fields) {
        if (error) {
            return next(error)
        }
        res.json(util.getSuccessData(util.transferFromList(results, fields)))
    }))
});

module.exports = router;
