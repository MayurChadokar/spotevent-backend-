const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // adjust path as needed

const Action = sequelize.define(
  "Action",
  {
    actionId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action_type: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
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
    tableName: "actions",
    timestamps: true,
  }
);

module.exports = Action;
