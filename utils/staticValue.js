/**
 * Created by KIMSEONHO on 2016-08-27.
 */
var Enum = require('enum');
/**
 * 전송 완료시의 상태코드
 */
const statusCode = new Enum({
  'RequestActionCompleted_20x': 1
});

const memberType = new Enum({
  'Admin': 0,
  'PublicMember': 1,    // 일반 회원
  BusinessMember: 2,    //  시공업체, 나중에 바꾸자(buildingMember)
  LEASE_MEMBER: 3    // 임대업체
});

const uploadPath = {

};

const fieldName = {
  prevImg: "previewImage",
  vrImg: "vrImage",
  EDITOR_IMAGE: "editorImage",
  LOGO_IMAGE: "logoImage",
  INTRO_IMAGE: "introImage"
}

const dirName = {
  EDITOR_IMAGE: "editor",
  BUILD_CASE_INFO: "buildCaseInfo",
  ROOM_INFO: "roomInfo",
  BIZ_MEMBER: "bizMember"
}

module.exports = {
  statusCode,
  memberType,
  uploadPath,
  fieldName,
  dirName
};
