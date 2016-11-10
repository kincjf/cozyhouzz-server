/**
 * Created by KIMSEONHO on 2016-09-02.
 */
"use strict";

const multer = require('multer');
const md5 = require('node-md5');
const path = require('path');
const _ = require('lodash');

var env = process.env.NODE_ENV || "development";
var config = require("../config/main")[env];
var value = require("../utils/staticValue");

// 기존의 mkdir은 비동기여서 error가 나는 경우가 있음. 그래서 promise를 하던지 settimeout을 약간 걸어줘야됨
const mkdirp = require('mkdir-promise');
const log = require('console-log-level')({
  prefix: function () {
    return new Date().toISOString()
  },
  level: 'debug'
});

const ROOT_IMAGE_DIR = "./" + config.resourcePath + "/images";

let bizMemberPath = path.join(ROOT_IMAGE_DIR, value.dirName.BIZ_MEMBER);
let buildCaseInfoPath = path.join(ROOT_IMAGE_DIR, value.dirName.BUILD_CASE_INFO);
let roomInfoPath = path.join(ROOT_IMAGE_DIR, value.dirName.ROOM_INFO);
let editorImagePath = path.join(ROOT_IMAGE_DIR, value.dirName.EDITOR_IMAGE);


mkdirp(buildCaseInfoPath).then(() => {
  log.debug('buildCaseInfoPath create newPath : ' + buildCaseInfoPath);
}, err => {
  if (err) {
    log.error('buildCaseInfoPath mkdirp error : ' + err);
  }
});

mkdirp(roomInfoPath).then(() => {
  log.debug('roomInfoPath create newPath : ' + roomInfoPath);
}, err => {
  if (err) {
    log.error('roomInfoPath mkdirp error : ' + err);
  }
});

mkdirp(editorImagePath).then(() => {
  log.debug('editorImagePath create newPath : ' + editorImagePath);
}, err => {
  if (err) {
    log.error('editorImagePath mkdirp error : ' + err);
  }
});

mkdirp(bizMemberPath).then(() => {
  log.debug('bizMemberImagePath create newPath : ' + bizMemberPath);
}, err => {
  if (err) {
    log.error('bizMemberImagePath mkdirp error : ' + err);
  }
});

// Setting file upload to save file
// error 반환(서버 이상시 httpCode = 422, statusCode = 9)
// 수정시 중복체크를 할 수 있도록 fileFilter를 구현하기
// 파일 갯수마다 호출이 된다.

var bizMemberInfoStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    let newPath = path.join(ROOT_IMAGE_DIR, value.dirName.BIZ_MEMBER, req.user.email);

    mkdirp(newPath).then(() => {
      log.debug('bizMemberInfoStorage create newPath : ' + newPath);

      callback(null, newPath);
    }, err => {
      if (err) {
        log.error('bizMemberInfoStorage mkdirp error : ' + err);
      }
    });

  },
  filename: function (req, file, callback) {
    callback(null, _.toString(Date.now()) + '-' +  file.originalname);
  }
});

var buildCaseInfoStorage = multer.diskStorage({
  // fieldname == vrImage, previewImage
  destination: function (req, file, callback) {
    let newPath = path.join(ROOT_IMAGE_DIR, value.dirName.BUILD_CASE_INFO, req.user.email);

    mkdirp(newPath).then(() => {
      log.debug('buildCaseInfoStorage create newPath : ' + newPath);

      callback(null, newPath);   // unix time으로 나옴
    }, err => {
      if (err) {
        log.error('buildCaseInfoStorage mkdirp error : ' + err);
      }
    });
  },
  // 겹치면 Date.now, md5로 감싸자
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});

var roomInfoStorage = multer.diskStorage({
  // fieldname == vrImage, previewImage
  destination: function (req, file, callback) {
    let newPath = path.join(ROOT_IMAGE_DIR, value.dirName.ROOM_INFO, req.user.email);

    mkdirp(newPath).then(() => {
      log.debug('roomInfoStorage create newPath : ' + newPath);

      callback(null, newPath);   // unix time으로 나옴
    }, err => {
      if (err) {
        log.error('roomInfoStorage mkdirp error : ' + err);
      }
    });
  },
  // 겹치면 Date.now, md5로 감싸자
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});

var editorImageStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    let newPath = path.join(ROOT_IMAGE_DIR, value.dirName.EDITOR_IMAGE, req.user.email);

    mkdirp(newPath).then(() => {
      log.debug('editorImageStorage create newPath : ' + newPath);

      callback(null, newPath);
    }, err => {
      if (err) {
        log.error('editorImagePath mkdirp error : ' + err);
      }
    });

  },
  filename: function (req, file, callback) {
    callback(null, _.toString(Date.now()) + '-' +  file.originalname);
  }
});

/**
 * multer setting 관련
 */
module.exports = {
  bizMemberInfoStorage: bizMemberInfoStorage,
  buildCaseInfoStorage: buildCaseInfoStorage,
  roomInfoStorage: roomInfoStorage,
  editorImageStorage: editorImageStorage
}
