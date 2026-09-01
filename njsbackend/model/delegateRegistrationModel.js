const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 

const DelegateRegistration = sequelize.define(
  "deletegate_registations",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
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
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tel_phone: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mobile_phone: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    country: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    delegate_ids: {
      type: DataTypes.TEXT("long"), // Matches longtext
      allowNull: true,
    },
    deletegate_category: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    grand_total: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    room_total: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    room_days: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    total_delegate: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hotal_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hotal_room_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    room_price: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    room_price_tax: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    room_price_unit: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    checkin: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    checkout: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    room_qty: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    event_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "deletegate_registations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = DelegateRegistration;
