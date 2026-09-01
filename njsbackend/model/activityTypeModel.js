const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // adjust path as 


    const ActivityMaster = sequelize.define("activity_master", {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        
        Activity_Type_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            
        },
        Activity_Name: {
            type: DataTypes.STRING(100),
            defaultValue: 'NA',
        },
         From_Time: {
            type: DataTypes.FLOAT,
        },
        To_Time: {
            type: DataTypes.FLOAT,
        },
       Is_Active: {
            type: DataTypes.TINYINT(1),	
            defaultValue: 1,
        },
        Add_By_User: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        Update_By_User: {
            type: DataTypes.STRING(100),
        },
        },
        {
          timestamps: true,
        }
      );      
module.exports = ActivityMaster;
