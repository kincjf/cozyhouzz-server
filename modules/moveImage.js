/**
 * Created by KIMSEONHO on 2016-11-06.
 */
"use strict";

const _ = require('lodash');
const path = require('path');
const fsp = require('fs-promise');
const Promise = require("bluebird");

var env = process.env.NODE_ENV || "development";
var config = require("../config/main")[env];

var log = require('console-log-level')({
  prefix: function () {
    return new Date().toISOString()
  },
  level: config.logLevel
});

const staticValue = require('../utils/staticValue');

var previewImage, vrImages, vrImagePaths;

/**
 *
 */
exports.makeNewSavePath = Promise.method(function () {
  let newSavePath;
  if (req.files[staticValue.fieldName.prevImg] || req.files[staticValue.fieldName.vrImg]) {
    newSavePath = _.toString(Date.now());

    return newSavePath;
  }

  return newSavePath;    // 파일 이동 실패, 파일 없음
});

// - multer file object structure
// req.files["fieldname"][i] - structure example
// { fieldname: 'myfile',
//   originalname: '20160224_104138.jpg',
//   encoding: '7bit',
//   mimetype: 'image/jpeg',
//   destination: '/tmp/upload/',
//   filename: '8563e0bef6efcc4d709f2d1debb35777',
//   path: '/tmp/upload/8563e0bef6efcc4d709f2d1debb35777',
//   size: 1268337 }

/**
 * 미리보기 이미지 이동시(multer 기반)
 * @param fieldName(ex> fieldName.prevImg)
 * @param newSavePath
 * @param resourcePath(ex> config.prevImg)
 */
exports.movePreviewImage = Promise.method(function (fieldName, newSavePath, resourcePath) {

  if (newSavePath && req.files[fieldName]) {
    let previewImgFile = req.files[fieldName][0];
    let savePath = path.join(previewImgFile.destination, newSavePath, previewImgFile.filename);

    return fsp.move(previewImgFile.path, savePath).then(function () {
      previewImgFile.destination = path.join(previewImgFile.destination, newSavePath);
      previewImgFile.path = path.join(previewImgFile.destination, previewImgFile.filename);

      // path의 "config.resourcePath" 포함 앞부분 문자열은 삭제한다.
      let tmpPath = _.replace(previewImgFile.path, resourcePath + path.sep, "");

      // previewImage = _.replace(tmpPath, "/\\/g", "/");    // 될거 같은데 안됨...
      previewImage = _.split(tmpPath, "\\").join('/');    // 아 ㅅㅂ path문제... 정규표현식으로 해결이 안됨
      // url path이기 때문에 windows에서 작동할 경우 separator(\\) 변환 필요

      return previewImage;
    }).catch(function (err) {
      return new Error("fail to move previewImage file");    // 파일 이동 실패, transaction 중지
    });
  }

  return null;    // 파일 없음(에러는 아님)
});

/**
 * VR 이미지 이동시(multer 기반)
 * @param fieldName(ex> fieldName.prevImg)
 * @param newSavePath
 * @param resourcePath(ex> config.prevImg)
 */
exports.moveVRImage = Promise.method(function (fieldName, newSavePath, resourcePath) {
  if (newSavePath && req.files[fieldName]) {
    vrImagePaths = [];

    vrImages = {
      statusCode: 0,    // 아직 변환 전임을 표시함
      // baseDir: _.split(tmpPath, "\\").join('/'),   // request path이기 때문에
      originalImage: []    // 변환전 파일 경로
    };

    return Promise.each(req.files[fieldName], function (file, index, length) {
      let baseDir = path.join(file.destination, newSavePath);
      let savePath = path.join(baseDir, file.filename);

      return fsp.move(file.path, savePath).then(function () {
        file.destination = path.join(file.destination, newSavePath);
        file.path = path.join(file.destination, file.filename);

        // let tmpPath = _.replace(file.destination, "uploads" + path.sep, "");
        let tmpPath = _.replace(file.destination, resourcePath + path.sep, "");

        vrImages.baseDir = _.split(tmpPath, "\\").join('/');   // request path이기 때문에

        vrImages.originalImage.push(file.filename);
        vrImagePaths.push(file.path);
      }).catch(function (err) {
        return new Error("fail to move vrImage file");    // 파일 이동 실패, transaction 중지
      });
    }).then(function () {
      return vrImages;
    });
  }

  return null;    // 파일 없음(에러는 아님)
});
