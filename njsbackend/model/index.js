const Sequelize = require("sequelize");
const sequelize = require("../config/db");

// Load models
const SpotRegistration = require("./spotModel");
const SpotPaymentFee = require("./spotPaymentFeeModel");
const EventMaster = require("./eventMasterModel");
const Delegate = require("./delegateModel");
const User = require("./userModel");
const ActivityMaster = require("./activityTypeModel");
const Action = require("./actionModel");
const PersonActivityRestriction = require("./personActivityRestrictionModel");
const DelegateRegistration = require("./delegateRegistrationModel");
// Define Associations

// Example association: Delegate has many Actions
Delegate.hasMany(Action, {
  foreignKey: "userId", // ðŸ‘ˆ this is the key in Action table
  sourceKey: "id",      // ðŸ‘ˆ this is the key in Delegate table
  as: "actions",
});

Action.belongsTo(Delegate, {
  foreignKey: "userId", // ðŸ‘ˆ this matches Action table
  targetKey: "id",      // ðŸ‘ˆ this matches Delegate table
  as: "delegates",
});

Delegate.belongsTo(DelegateRegistration, {
  foreignKey: 'delegate_reg_id',
  targetKey: 'id',
});

// You can add more associations here as needed
// e.g., SpotRegistration.belongsTo(Delegate, { foreignKey: "delegate_id" });

module.exports = {
  sequelize,
  Sequelize,
  SpotRegistration,
  SpotPaymentFee,
  EventMaster,
  Delegate,
  User,
  ActivityMaster,
  Action,
  PersonActivityRestriction,
  DelegateRegistration,
};