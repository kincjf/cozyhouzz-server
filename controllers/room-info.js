
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
  const roomInfoIdx = req.params.roomInfoIdx;
  
  return RoomInfo.findOne({
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

    return RoomInfo.destroy({
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

  return RoomInfo.findOne({
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

  return RoomInfo.findAll({
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