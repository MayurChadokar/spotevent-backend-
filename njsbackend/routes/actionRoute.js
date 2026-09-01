const { InsertActionActivity } = require("../controllers/actionController");
const {
  InstantSpotRegistration,
  getSpotPaymentFee,
  getSingleSpotRegistration,
  getMasterEvent,
  getSpotRegistrationData,
  updateSpotRegistration,
  getPaidSpotDelegateData,
  updateBadgeStatus,
  getDelegateDataforReprint,
  userLogin,
  getDelegateDataforBadgeReAssign,
  getBadgeType,
  getActivityType,
  getSingleUserInfo,
  createRegistrationfromAdmin,
  GetActivityRestrictionData,
  getDelegateAdminDataforprint,
  SendMailUsingNodemailer,
  delegetListforCheckIn, 
  insertCheckInActivity,
  updateRegistrationfromAdmin,
  sendBulkMailUsingNodemailer,
  sendBulkMailtoPreRegisterdDeleget,
  getActionTypeCount,
  getDelegateAndActionSummary,
  delegetListwithActivity,
  getDelegatesWithCompletedActivity
} = require("../controllers/spotController");

const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
  res.json({ message: "API is working" });
});


router.post("/insertActionActivity", InsertActionActivity);

//InstantSpotRegistration
router.post("/InstantSpotRegistration", InstantSpotRegistration);

//InstantSpotRegistration
router.post("/getSpotPaymentFee", getSpotPaymentFee);

//InstantSpotRegistration
router.post("/getSingleSpotRegistration", getSingleSpotRegistration);

//InstantSpotRegistration
router.post("/getMasterEvent", getMasterEvent);

// getSpotRegistrationData
router.post("/getSpotRegistrationData", getSpotRegistrationData);

// updateSpotRegistration
router.post("/updateSpotRegistration", updateSpotRegistration);

// getPaidSpotDelegateData
router.post("/getPaidSpotDelegateData", getPaidSpotDelegateData);

// updateBadgeStatus
router.post("/updateBadgeStatus", updateBadgeStatus);

// getDelegateDataforReprint
router.post("/getDelegateDataforReprint", getDelegateDataforReprint);

// userLogin
router.post("/userLogin", userLogin);

// getDelegateDataforBadgeReAssign
router.post(
  "/getDelegateDataforBadgeReAssign",
  getDelegateDataforBadgeReAssign
);

// getBadgeType
router.post("/getBadgeType", getBadgeType);

// // getActivityType
router.post("/getActivityType", getActivityType);

// // getSingleUserInfo
router.post("/getSingleUserInfo", getSingleUserInfo);

// createRegistrationfromAdmin
router.post("/createRegistrationfromAdmin", createRegistrationfromAdmin);

// GetActivityRestrictionData
router.post("/GetActivityRestrictionData", GetActivityRestrictionData);

// getDelegateAdminDataforprint
router.post("/getDelegateAdminDataforprint", getDelegateAdminDataforprint);

// SendMailUsingNodemailer
router.post("/sendMail", SendMailUsingNodemailer);

// delegetListforCheckIn
router.post("/delegetListforCheckIn", delegetListforCheckIn);

// updateRegistrationfromAdmin
 router.post("/updateRegistrationfromAdmin", updateRegistrationfromAdmin);
 
// sendBulkMailUsingNodemailer
 router.post("/sendBulkMailUsingNodemailer", sendBulkMailUsingNodemailer);
 
// sendBulkMailtoPreRegisterdDeleget
router.post("/sendBulkMailtoPreRegisterdDeleget", sendBulkMailtoPreRegisterdDeleget); 
 
// getActionTypeCount
 router.post("/getActionTypeCount", getActionTypeCount); 

// getDelegateAndActionSummary 
router.post("/getDelegateAndActionSummary", getDelegateAndActionSummary); 
 
// delegetListwithActivity
 router.post("/delegetListwithActivity", delegetListwithActivity); 

// getDelegatesWithCompletedActivity
router.post("/getDelegatesWithCompletedActivity", getDelegatesWithCompletedActivity); 


 
module.exports = router;
