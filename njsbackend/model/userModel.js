const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // adjust path as needed

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
    type: DataTypes.STRING(255),
      allowNull: false,
    },
    email : {
      type: DataTypes.STRING(255),
      
    },
    email_verified_at : {
      type: DataTypes.DATE,
      allowNull: false,
    },
    password: {
    type: DataTypes.STRING(255),
      
    },
    status: {
      type: DataTypes.STRING(255),
    },
    role_name: {
     type: DataTypes.ENUM('Admin', 'User', 'SuperAdmin', 'Operator'),
     allowNull: false
    },
    remember_token: {
            type: DataTypes.STRING(100),
            
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
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",  // No createdAt column
    updatedAt: 'updated_at',
  }
);

module.exports = User;
