const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 

const Delegate = sequelize.define(
    'Delegate', 
    {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
 
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
   
  },
  designation: {
    type: DataTypes.TEXT,
  },
  mobile: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
 
  per_delegate: {
    type: DataTypes.TEXT,
  },
  per_delegate_tax: {
    type: DataTypes.TEXT,
  },
  	total_delegate: {
    type: DataTypes.TEXT,
  },
  	type: {
    type: DataTypes.TEXT,
  },
  	payment_mode: {
    type: DataTypes.STRING(250),
  },
  delegate_reg_id: {
    type: DataTypes.BIGINT(20),
    allowNull: true,
  },
  batch_assign: {
    type: DataTypes.STRING(100),
    defaultValue: "0",
  },
   status: {
    type: DataTypes.STRING(100),
    defaultValue: '1',
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
   event_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dial_code: {
    type: DataTypes.TEXT,
  },
  organization_name	: {
    type: DataTypes.TEXT,
  },
  is_spot_registered: {
  type: DataTypes.TINYINT,
  allowNull: false,
  defaultValue: 0
} ,
url_for_qr: {
  type: DataTypes.TEXT,
 
}
}, {
  tableName: 'delegates',
  timestamps: true, 
  createdAt: "created_at",  // No createdAt column
    updatedAt: 'updated_at',
});

module.exports = Delegate;
