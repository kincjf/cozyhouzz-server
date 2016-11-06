
"use strict";

const models = require('../models');
const RoomInfo = models.RoomInfoBoard;

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

  return RoomInfo.findAll({
    limit: pageSize,
    offset: pageStartIndex
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

exports.modifyRoomInfo = function(req, res) {

}

exports.deleteRoomInfo = function(req, res) {

}


exports.viewRoomInfoDetail = function(req, res) {

}

exports.searchRoomInfoList = function(req, res) {

}