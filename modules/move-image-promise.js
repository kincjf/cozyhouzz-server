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

const value = require('../utils/staticValue');

/**
 *
 */
exports.makeNewSavePath = Promise.method(function (req) {
  let newSavePath;
  if (req.files[value.fieldName.prevImg] || req.files[value.fieldName.vrImg]) {
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
exports.movePreviewImage = Promise.method(function (req, fieldName, newSavePath, resourcePath) {

  if (newSavePath && req.files[fieldName]) {
    let previewImgFile = req.files[fieldName][0];
    let savePath = path.join(previewImgFile.destination, newSavePath, previewImgFile.filename);

    return fsp.move(previewImgFile.path, savePath).then(function () {
      previewImgFile.destination = path.join(previewImgFile.destination, newSavePath);
      previewImgFile.path = path.join(previewImgFile.destination, previewImgFile.filename);

      // path의 "config.resourcePath" 포함 앞부분 문자열은 삭제한다.
      let tmpPath = _.replace(previewImgFile.path, resourcePath + path.sep, "");

      // previewImage = _.replace(tmpPath, "/\\/g", "/");    // 될거 같은데 안됨...
      let previewImage = _.split(tmpPath, "\\").join('/');    // 아 ㅅㅂ path문제... 정규표현식으로 해결이 안됨
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
 * 무조건 새로 업로드 해야한다, 기존에 업로드한 파일을 그대로 처리할 수 있게
 * 따로 만들던지, 아니면 파일(이미지)관리 모듈을 따로 만들어야 할 것 같다.
 * @param fieldName(ex> fieldName.prevImg)
 * @param newSavePath
 * @param resourcePath(ex> config.prevImg)
 */
exports.moveVRImage = Promise.method(function (req, fieldName, newSavePath, resourcePath) {
  if (newSavePath && req.files[fieldName]) {
    let vrImagePaths = [];

    let vrImages = {
      statusCode: 0,    // 아직 변환 전임을 표시함
      // baseDir: _.split(tmpPath, "\\").join('/'),   // request path이기 때문에
      originalImage: []    // 변환된 파일 이름
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
      return {
        vrImages: vrImages,
        vrImagePaths: vrImagePaths
      };
    });
  }

  return null;    // 파일 없음(에러는 아님)
});

exports.saveVRPanoPath = Promise.method(function (newIdx, model) {
  if (newIdx) {
    return model.findById(newIdx).then(boardInfo => {
      let vrImageObj = JSON.parse(boardInfo.VRImages);    // Array[fileName, ...]

      vrImageObj.statusCode = 1;    // 변환 완료
      vrImageObj.vtourDir = "vtour";    // vtour-normal-custom.config에서 설정함
      vrImageObj.xmlName = "tour.xml";    // vtour-normal-custom.config에서 설정함
      vrImageObj.swfName = "tour.swf";    // vtour-normal-custom.config에서 설정함
      vrImageObj.jsName = "tour.js";    // vtour-normal-custom.config에서 설정함

      vrImageObj.tiles = [];

      let prevImageName = 'thumb.jpg';   // vtour-normal-custom.config에서 설정함

      _(vrImageObj.originalImage).forEach(value => {
        let extension = path.extname(value);    // imagefile name의 확장자부분만 추출
        let imageName = path.basename(value, extension);    // imagefile name의 파일 이름만 추출
        // let imagePath = imageName + extension;
        // requestpath이기 때문에
        let tmpDir = path.join(vrImageObj.baseDir, config.krpano.panotour_path, imageName + ".tiles");
        let tileDir = _.split(tmpDir, "\\").join('/');

        vrImageObj.tiles.push({
          dir: tileDir,
          previewImageName: prevImageName,
          previewImagePath: _.join([tileDir, prevImageName], "/")   // 편하게 쓰라고 만들어준거임
        });
      });

      return boardInfo.update({
        VRImages: JSON.stringify(vrImageObj)    // convert 된 후의 정보가 들어감
      }).then(result => {
        return 'saveVRPanoPath : changed VRImages : ' + result.VRImages;
      }).catch(err => {
        return new Error('saveVRPanoPath update error: ' + err);
      });
    }).catch(function (err) {
      return new Error('fileById saveVRPanoPath/' + newIdx + ' error: ' + err);
    });
  }

  return new Error('no newIdx for saveVRPanoPath');
});
