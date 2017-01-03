/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('RoomInfoBoard', {
    idx: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    memberIdx: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      references: {
        model: 'Member',
        key: 'idx'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deposit: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    roomType: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    monthlyRentFee: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    floor: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    manageExpense: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    manageService: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    areaSize: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    actualSize: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    parking: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    elevator: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    supplyOption: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    availableDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.NOW
    },
    HTMLText: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    city: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    locationInfo: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    VRImages: {
      type: DataTypes.STRING(2000),
      allowNull: true
    },
    mainPreviewImage: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    coordinate: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    regionCategory: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    initWriteDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.NOW
    },
    fileRef: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
    }
  }, {
    tableName: 'RoomInfoBoard'
  });
};
