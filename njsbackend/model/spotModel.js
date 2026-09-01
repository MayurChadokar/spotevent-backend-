const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // adjust path as needed

const SpotRegistration = sequelize.define(
  "SpotRegistration",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dial_code: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    organization_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    GSTIN: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pin_code: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    deletegate_category: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
    type: DataTypes.STRING(100),
    defaultValue: '1',
  },
    event_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    tax: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    payment_received: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    payment_mode: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    UTR_number: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    receipt_number: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    payment_status: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    url_for_qr_code: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
  },
  {
    tableName: "spot_registrations",
    timestamps: false,
  }
);

module.exports = SpotRegistration;
