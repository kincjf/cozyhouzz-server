
"use strict";

const models = require('../models');
const RoomInfoBoard = models.RoomInfoBoard;
const _ = require('lodash');
const Promise = require("bluebird");
const moment = require("moment");


var env = process.env.NODE_ENV || "development";
var config = require("../config/main")[env];

var log = require('console-log-level')({
  prefix: function () {
    return new Date().toISOString()
  },
  level: config.logLevel
});

const value = require('../utils/staticValue');
const vrpanoPromise = require('../modules/convert-vrpano-promise');
const moveImagePromise = require('../modules/move-image-promise');


exports.viewRoomInfoList = function(req, res) {
  let pageSize, pageStartIndex;

  // 페이지 정보 확인
  if (!req.query.pageSize || !req.query.pageStartIndex) {
    // query가 제대로 오지 않으면 초기값으로 보낸다.
    pageSize = 10;
    pageStartIndex = 0;
  } else {
    pageSize = _.toNumber(req.query.pageSize);
    pageStartIndex = _.toNumber(req.query.pageStartIndex);
  }

  return RoomInfoBoard.findAll({
    limit: pageSize,
    offset: pageStartIndex
  }).then(function(roomInfoList) {
    return res.status(200).json({
      roomInfo: roomInfoList,
      statusCode: 1
    });
  }).catch(function(err) {
    return res.status(400).json({
      errorMsg: '정보 없음',
      statusCode: -1
    });
  });
}

// 동일 중복 파일을 체크할 수 있도록 개발해야함
// Media Management System을 만들거나, 간단한 checksum으로 필터링을 해야함.
/**
 * 시공사례입력(use vrpano-promise)
 * @param req
 * @param res
 * @param next
 */
exports.createRoomInfoAndVRPano = function (req, res, next) {
  if (req.user.memberType != value.memberType.LEASE_MEMBER) {
    return res.status(401).json({
      errorMsg: 'You are not authorized to create roominfo case.',
      statusCode: 2
    });
  }

  if (!req.body.title) {
    return res.status(401).json({
      errorMsg: 'You must enter an required field! please check title',
      statusCode: -1
    });
  }

  if (!req.body.roomType) {
    return res.status(401).json({
      errorMsg: 'You must enter an required field! please check roomType',
      statusCode: -1
    });
  }

  if (!req.body.address) {
    return res.status(401).json({
      errorMsg: 'You must enter an required field! please check address',
      statusCode: -1
    });
  }

  // if (!req.files[value.fieldName.prevImg]) {
  //   return res.status(401).json({
  //     errorMsg: 'You must enter an required field! please check file["previewImage"]',
  //     statusCode: -1
  //   });
  // }

  // req.files["fieldname"[i] - structure example
  // { fieldname: 'myfile',
  //   originalname: '20160224_104138.jpg',
  //   encoding: '7bit',
  //   mimetype: 'image/jpeg',
  //   destination: '/tmp/upload/',
  //   filename: '8563e0bef6efcc4d709f2d1debb35777',
  //   path: '/tmp/upload/8563e0bef6efcc4d709f2d1debb35777',
  //   size: 1268337 }

  /**
   * String, Array[String]
   */
  let createRoomInfoDB = Promise.method(function (initWriteDate, previewImagePath, vrImages, originalVRImages) {
    const roomInfo = {
      memberIdx: req.user.idx,
      title: req.body.title,
      roomType: req.body.roomType == "" ? null : _.toNumber(req.body.roomType),
      address: req.body.address == "" ? null : req.body.address,    // JSON.stringify(address) 형식 그대로 온다.
      mainPreviewImage: _.isNil(previewImagePath) ? null : previewImagePath,
      deposit: req.body.deposit == "" ? null : _.toNumber(req.body.deposit),
      monthlyRentFee: req.body.monthlyRentFee == "" ? null : _.toNumber(req.body.monthlyRentFee),
      floor: req.body.floor == "" ? null : _.toNumber(req.body.floor),
      manageExpense: req.body.manageExpense == "" ? null : _.toNumber(req.body.manageExpense),
      manageService: req.body.manageService == "" ? null : req.body.manageService,
      areaSize: req.body.areaSize == "" ? null : _.toNumber(req.body.areaSize),
      actualSize: req.body.actualSize == "" ? null : _.toNumber(req.body.actualSize),
      parking: req.body.parking == "" ? null : _.toNumber(req.body.parking),
      elevator: req.body.elevator == "" ? null : _.toNumber(req.body.elevator),
      supplyOption: req.body.supplyOption == "" ? null : req.body.supplyOption,
      availableDate: req.body.availableDate == "" ? null : req.body.availableDate,
      HTMLText: req.body.HTMLText == "" ? null : req.body.HTMLText,
      VRImages: _.isNil(vrImages) ? null : JSON.stringify(vrImages),   // 현재는 변환 전임을 표시함.
      locationInfo: req.body.locationInfo == "" ? null : req.body.locationInfo,
      coordinate: req.body.coordinate == "" ? null : req.body.coordinate,    // JSON.stringify() 형식 그대로 오기 때문에
      regionCategory: req.body.regionCategory == "" ? null : req.body.regionCategory,   // JSON.stringify() 형식 그대로
      initWriteDate: _.isNil(initWriteDate) ? null : moment(_.toNumber(initWriteDate)).format("YYYY-MM-DD HH:MM:SS"),      // timestamp로 변환
      fileRef: _.isNil(initWriteDate) ? null : _.toNumber(initWriteDate)    // 현재는 notNull임
      // 나중에 수정시 기존 게시물에 있는 정보를 initWriteDate삭제
    }

    return RoomInfoBoard.create(roomInfo).then(function (newRoomInfo) {
      res.status(201).json({
        roomInfo: newRoomInfo,
        statusCode: value.statusCode.RequestActionCompleted_20x
      });

      return [originalVRImages, newRoomInfo.idx];
    }).spread(function (originalVRImages, roomInfoIdx) {

      if (originalVRImages) {
        return vrpanoPromise(originalVRImages).then(() => {   // VR 이미지가 있으면 변환하게 고쳐야함.
          log.debug('[convert-vrpano-promise] done!');
          return Promise.resolve(roomInfoIdx);
        }).catch(err => {
          log.error('[convert-vrpano-promise] ERROR: ', err);
        });    // 비동기로 작동한다.

      } else {
        return new Error('no originalVRImages in req.files');
      }
    }).catch(function (err) {
      if (err) {
        res.status(400).json({
          errorMsg: 'RoomInfoBoard Error : No RoomInfo could be create for this info.',
          statusCode: 2
        });
        return next(err);
      }
    });
  });

  return moveImagePromise.makeNewSavePath(req)
    .then(function (newSavePath) {
      return Promise.join(
        moveImagePromise.movePreviewImage(req, value.fieldName.prevImg, newSavePath, config.resourcePath),
        moveImagePromise.moveVRImage(req, value.fieldName.vrImg, newSavePath, config.resourcePath), function (previewImage, vrImages) {
        return {initWriteDate: newSavePath, previewImage: previewImage, vrImgObj: vrImages};
      });
    }).then(function (result) {
    return createRoomInfoDB(result.initWriteDate, result.previewImage, result.vrImgObj.vrImages, result.vrImgObj.vrImagePaths);
  }).then(function (newIdx) {
    return moveImagePromise.saveVRPanoPath(newIdx, RoomInfoBoard);
  }).done(function (result) {
    log.debug(result);
  }, function (err) {
    log.error(err);
  });
}

// preview image 수정 후 잘 뜨는지 확인해야함.
exports.updateRoomInfo = function(req, res, next) {
  if (!req.params.roomInfoIdx) {
    return res.status(401).json({
      errorMsg: 'You must enter an required param! please check :roomInfoIdx',
      statusCode: -1
    });
  }
  const roomInfoIdx = _.toNumber(req.params.roomInfoIdx);

  if (req.user.memberType != value.memberType.LEASE_MEMBER) {
    return res.status(401).json({
      errorMsg: 'You are not authorized to create roominfo case.',
      statusCode: 2
    });
  }

  if (!req.body.title) {
    return res.status(401).json({
      errorMsg: 'You must enter an required field! please check title',
      statusCode: -1
    });
  }

  if (!req.body.roomType) {
    return res.status(401).json({
      errorMsg: 'You must enter an required field! please check roomType',
      statusCode: -1
    });
  }

  if (!req.body.address) {
    return res.status(401).json({
      errorMsg: 'You must enter an required field! please check address',
      statusCode: -1
    });
  }

  if (!req.files[value.fieldName.prevImg]) {
    return res.status(401).json({
      errorMsg: 'You must enter an required field! please check file["previewImage"]',
      statusCode: -1
    });
  }

  let updateRoomInfo = Promise.method(function (initWriteDate, previewImagePath) {
    // 나중에 VR Tour 변경될 때 promise 형식으로 한번에 바꾸자
    const roomInfo = {
      memberIdx: req.user.idx,
      title: req.body.title,
      roomType: req.body.roomType == "" ? null : _.toNumber(req.body.roomType),
      address: req.body.address == "" ? null : req.body.address,    // JSON.stringify(address) 형식 그대로 온다.
      mainPreviewImage: _.isNil(previewImagePath) ? null : previewImagePath,
      deposit: req.body.deposit == "" ? null : _.toNumber(req.body.deposit),
      monthlyRentFee: req.body.monthlyRentFee == "" ? null : _.toNumber(req.body.monthlyRentFee),
      floor: req.body.floor == "" ? null : _.toNumber(req.body.floor),
      manageExpense: req.body.manageExpense == "" ? null : _.toNumber(req.body.manageExpense),
      manageService: req.body.manageService == "" ? null : req.body.manageService,
      areaSize: req.body.areaSize == "" ? null : _.toNumber(req.body.areaSize),
      actualSize: req.body.actualSize == "" ? null : _.toNumber(req.body.actualSize),
      parking: req.body.parking == "" ? null : _.toNumber(req.body.parking),
      elevator: req.body.elevator == "" ? null : _.toNumber(req.body.elevator),
      supplyOption: req.body.supplyOption == "" ? null : _.toNumber(req.body.supplyOption),
      availableDate: req.body.availableDate == "" ? null : req.body.availableDate,
      HTMLText: req.body.HTMLText == "" ? null : req.body.HTMLText,
      // VRImages: _.isNil(vrImages) ? null : JSON.stringify(vrImages),   // 현재는 변환 전임을 표시함.
      locationInfo: req.body.locationInfo == "" ? null : req.body.locationInfo,
      coordinate: req.body.coordinate == "" ? null : req.body.coordinate,    // JSON.stringify() 형식 그대로 오기 때문에
      regionCategory: req.body.regionCategory == "" ? null : req.body.regionCategory,   // JSON.stringify() 형식 그대로
      initWriteDate: _.isNil(initWriteDate) ? null : moment(_.toNumber(initWriteDate)).format("YYYY-MM-DD HH:MM:SS"),   // timestamp로 변환
      fileRef: _.isNil(initWriteDate) ? null : _.toNumber(initWriteDate)
    }

    // return Array[0] = affectedRows
    return RoomInfoBoard.update(roomInfo, {where: {idx: roomInfoIdx}}).then(function (array) {
      return res.status(200).json({
        msg: 'changed ' + array[0] + ' rows',
        statusCode: 1
      });
    }).catch(function (err) {
      if (err) {
        res.status(400).json({
          errorMsg: 'RoomInfoBoard Error : No user could be found for this ID.',
          statusCode: 2
        });
        return next(err);
      }
    });
  });

  return moveImagePromise.makeNewSavePath(req)
    .then(function (newSavePath) {
      return Promise.join(
        moveImagePromise.movePreviewImage(req, value.fieldName.prevImg, newSavePath, config.resourcePath), function (previewImage) {
          return {initWriteDate: newSavePath, previewImage: previewImage};
        });
    }).then(function (result) {
    return updateRoomInfo(result.initWriteDate, result.previewImage);
  }).done(function (result) {
    log.debug(result);
    next();
  }, function (err) {
    log.error(err);
    next(err);
  });

}

exports.deleteRoomInfo = function(req, res) {
  const roomInfoIdx = req.params.roomInfoIdx;

  return RoomInfoBoard.findOne({
    where: {
      idx: roomInfoIdx
    }
  }).then(function(roomInfo) { // 다른 회원의 내용일 경우 열람 불가능
    if (req.user.idx != roomInfo.memberIdx) {
      return res.status(400).json({
          errorMsg: '다른 회원',
          statusCode: -1
        });
    }

    return RoomInfoBoard.destroy({
      where: {
        idx: roomInfoIdx
      }
    }).then(function() {
      return res.status(200).json({ statusCode: 1 });
    }).catch(function(err) {
      if (err) {
        return res.status(400).json({
          errorMsg: '삭제 실패',
          statusCode: -1
        });
      }
    });
  }).catch(function(err) {
    console.log(err);
    if (err) {
      return res.status(400).json({
        errorMsg: '정보 없음',
        statusCode: -1
      });
    }
  });
}

exports.viewRoomInfoDetail = function(req, res) {
  const roomInfoIdx = req.params.roomInfoIdx;

  return RoomInfoBoard.findOne({
    where: {
      idx: roomInfoIdx
    }
  }).then(function(roomInfo) {
    return res.status(200).json({
      roomInfo,
      statusCode: 1
    });
  }).catch(function(err) {
    return res.status(400).json({
      errorMsg: '정보 없음',
      statusCode: -1
    });
  });
}

exports.searchRoomInfoList = function(req, res) {
  let pageSize, pageStartIndex, query = req.query.query;

  // 페이지 정보 확인
  if (!req.query.pageSize || !req.query.pageStartIndex) {
    // query가 제대로 오지 않으면 초기값으로 보낸다.
    pageSize = 10;
    pageStartIndex = 0;
  } else {
    pageSize = _.toNumber(req.query.pageSize);
    pageStartIndex = _.toNumber(req.query.pageStartIndex);
  }

  return RoomInfoBoard.findAll({
    limit: pageSize,
    offset: pageStartIndex,
    //where: {}
  }).then(function(roomInfoList) {
    return res.status(200).json({
      RoomInfo: roomInfoList,
      statusCode: 1
    });
  }).catch(function(err) {
    return res.status(400).json({
      errorMsg: '정보 없음',
      statusCode: -1
    });
  });
}
