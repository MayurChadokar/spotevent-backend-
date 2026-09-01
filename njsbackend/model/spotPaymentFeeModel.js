const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // adjust path as needed

const SpotPaymentFee = sequelize.define(
  "SpotPaymentFee",
  {
    feeId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    tax: {
      type: DataTypes.FLOAT,
    //   defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.FLOAT,
    //   defaultValue: 0,
    },
    event_id: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    Add_By_User: {
            type: DataTypes.STRING(100),
            // allowNull: false
              defaultValue: 0,
        },
        Update_By_User: {
            type: DataTypes.STRING(100),
        },
  },
  {
    tableName: "spotpaymentfee",
    timestamps: true,
  }
);

module.exports = SpotPaymentFee;
