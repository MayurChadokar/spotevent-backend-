const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // adjust path as needed

const EventMaster = sequelize.define(
  "EventMaster",
  {
    id : {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    slug: {
      type: DataTypes.TEXT,
    //   defaultValue: 0,
    },
    start_date: {
      type: DataTypes.DATE,
    //   defaultValue: 0,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    	sub_title: {
      type: DataTypes.TEXT ,
      defaultValue: 1,
    },
    	logo: {
            type: DataTypes.TEXT,
            // allowNull: false
             
        },
        banner: {
            type: DataTypes.TEXT,
        },
        status: {
            type: DataTypes.STRING(255),
        },
         event_address: {
            type: DataTypes.STRING(255),
        },
        user_id: {
             type: DataTypes.BIGINT,
        allowNull: false,
        },
        created_at: {
            type: DataTypes.STRING(100),
        },
        updated_at	: {
            type: DataTypes.STRING(100),
        },
       
  },
  {
    tableName: "events",
    timestamps: true,
    createdAt: "created_at",  // No createdAt column
    updatedAt: 'updated_at',
  }
);

module.exports = EventMaster;
