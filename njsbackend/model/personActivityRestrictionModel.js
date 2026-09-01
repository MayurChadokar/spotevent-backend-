const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // adjust path as needed

const PersonActivityRestriction = sequelize.define(
  "PersonActivityRestriction",
  {
    Activity_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    User_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Action_Type: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    Is_Active: {
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
    tableName: "person_activity_restrictions",
    timestamps: true,
  }
);

module.exports = PersonActivityRestriction;
