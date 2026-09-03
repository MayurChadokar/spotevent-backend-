const {
  SpotRegistration,
  SpotPaymentFee,
  EventMaster,
  Delegate,
  User,
  ActivityMaster,
  Action,
  PersonActivityRestriction,
  DelegateRegistration
  
} = require("../model");

const Sequelize = require("sequelize");
const sequelize = require("../config/db");
const { Op } = require("sequelize");
const axios = require("axios");

const nodemailer = require("nodemailer");
const dayjs = require("dayjs");
const puppeteer = require('puppeteer');
const fs = require("fs");
const path = require("path");
require("dotenv").config();




// InstantSpotRegistration
const InstantSpotRegistration = async (req, res) => {
  try {
    const {
      name,
      mobile,
      dial_code,
      email,
      designation,
      organization_name,
      GSTIN,
      deletegate_category,
      amount,
      tax,
      total_amount,
      event_id,
      payment_status,
    } = req.body;

    const newRegistration = await SpotRegistration.create({
      name,
      mobile,
      dial_code,
      email,
      designation,
      organization_name,
      GSTIN,
      deletegate_category,
      amount,
      tax,
      total_amount,
      event_id,
      payment_status,
    });

    res.status(200).json({
      status: true,
      message: "Registration successful",
      data: newRegistration,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Something went wrong while registering",
      error: error.message,
    });
  }
};

// getSpotPaymentFee
const getSpotPaymentFee = async (req, res) => {
  try {
    const fees = await SpotPaymentFee.findAll({
      where: {
        isActive: 1, // or 1
      },
    });

    res.status(200).json({
      status: true,
      message: "Active payment fee data fetched successfully",
      data: fees,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch active payment fee data",
      error: error.message,
    });
  }
};

// getSingleSpotRegistration
const getSingleSpotRegistration = async (req, res) => {
  try {
    const { id } = req.body; // Extract the 'id' from the request body

    // Check if the 'id' is provided
    if (!id) {
      return res.status(400).json({
        status: false,
        message: "ID is required in the request body",
      });
    }

    const fees = await SpotRegistration.findAll({
      where: {
        status: 1, // or 1
        id, // Filter by the provided 'id'
      },
    });

    // If no fees found for the provided 'id'
    if (fees.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No active payment fee data found for the given ID",
      });
    }

    res.status(200).json({
      status: true,
      message: "Active payment fee data fetched successfully",
      data: fees,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch active payment fee data",
      error: error.message,
    });
  }
};

// getMasterEvent
const getMasterEvent = async (req, res) => {
   try {
    const MasterEvent = await EventMaster.findAll({
      where: {
        status: "1", // Correct field you are checking
      },
      // Event times are entered in MySQL as IST wall-clock values. Format them
      // in MySQL so JavaScript/Sequelize cannot apply a second conversion.
      attributes: {
        include: [
          [
            Sequelize.literal(
              "DATE_FORMAT(`start_date`, '%Y-%m-%dT%H:%i:%s+05:30')"
            ),
            "start_date_ist",
          ],
          [
            Sequelize.literal(
              "DATE_FORMAT(`end_date`, '%Y-%m-%dT%H:%i:%s+05:30')"
            ),
            "end_date_ist",
          ],
        ],
      },
      raw: true,
    });

    // Replace Sequelize's Date values with the exact IST values from MySQL.
    const masterEventData = MasterEvent.map((event) => {
      const data = { ...event };
      data.start_date = data.start_date_ist;
      data.end_date = data.end_date_ist;
      delete data.start_date_ist;
      delete data.end_date_ist;

      return data;
    });

    res.status(200).json({
      status: true,
      message: "Active event data fetched successfully",
      data: masterEventData,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch active event data",
      error: error.message,
    });
  }
};

// getSpotRegistrationData
const getSpotRegistrationData = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "DESC",
      search = "",
    } = req.body;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;
    
     // ✅ Trim and normalize search once
    search = search ? search.trim() : "";

    // ✅ Validate sortBy field
    const allowedSortFields = [
      "name",
      "email",
      "mobile",
      "created_at",
      "payment_status",
    ];
    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "created_at"; // default safe field
    }

    const whereClause = {
      payment_status: "Pending",
    };

    if (search.trim() !== "") {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { organization_name: { [Op.like]: `%${search}%` } },
       
      ];
    }

    const { count, rows } = await SpotRegistration.findAndCountAll({
      where: whereClause,
       
      order: [[sortBy, sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"]],
      offset,
      limit,
    });

    const totalPages = Math.ceil(count / limit);

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No spot registration data found with pending payments",
      });
    }

    res.status(200).json({
      status: true,
      message: "Spot registration data fetched successfully",
      data: rows,
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch spot registration data",
      error: error.message,
    });
  }
};


// updateSpotRegistration
const updateSpotRegistration = async (req, res) => {
  try {
    const {
      id, // Spot Registration ID to update
      name,
      mobile,
      dial_code,
      email,
      designation,
      organization_name,
      GSTIN,
      deletegate_category,
      amount,
      tax,
      total_amount,
      event_id,
      payment_mode,
      url_for_qr,
    } = req.body;

    // Find the SpotRegistration record
    const spotRecord = await SpotRegistration.findByPk(id);

    if (!spotRecord) {
      return res.status(404).json({
        status: false,
        message: "Spot registration not found",
      });
    }

    // Update initial spot record (excluding URL for now)
    await spotRecord.update({
      name,
      mobile,
      dial_code,
      email,
      designation,
      organization_name,
      GSTIN,
      deletegate_category,
      amount,
      tax,
      total_amount,
      event_id,
      payment_mode,
      status: "1",
      payment_status: "Completed",
    });

    // Get the last delegate_reg_id
    const lastDelegate = await Delegate.findOne({
      order: [["delegate_reg_id", "DESC"]],
    });

    const newDelegateRegId = lastDelegate
      ? lastDelegate.delegate_reg_id + 1
      : 1;
    const typeValue = payment_mode === "free" ? "free" : "paid";

    // Create the new delegate record
    const newDelegate = await Delegate.create({
      event_id,
      name,
      mobile,
      email,
      organization_name,
      designation,
      user_id: 1, // Replace with actual user_id if available
      created_at: new Date(),
      delegate_reg_id: newDelegateRegId,
      per_delegate: amount,
      per_delegate_tax: tax,
      total_delegate: total_amount,
      is_spot_registered: 1,
      dial_code,
      type: typeValue,
    });
    
    const newDelegateRegistration = await DelegateRegistration.create({
      organization_name,
      GSTIN,
      total_delegate: total_amount,
      deletegate_category,
      grand_total: total_amount,
      status: "1",
      user_id: 1, // Replace with actual user_id
      event_id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // ✅ Prepare new url_for_qr by replacing second-last segment
    const originalUrl = url_for_qr || spotRecord.url_for_qr;
    let updatedUrlForQR = originalUrl;

    if (originalUrl && typeof originalUrl === "string") {
      const urlParts = originalUrl.split("/");
      if (urlParts.length >= 2) {
        urlParts[urlParts.length - 2] = newDelegate.id.toString();
        updatedUrlForQR = urlParts.join("/");
      }
    }

    // ✅ Update url_for_qr in both records
    await newDelegate.update({ url_for_qr: updatedUrlForQR });
    await spotRecord.update({ url_for_qr: updatedUrlForQR });

    res.status(200).json({
      status: true,
      message: "Spot registration updated and delegate created successfully",
      data: {
        updatedRegistration: spotRecord,
        delegate: newDelegate,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Failed to update spot registration",
      error: error.message,
    });
  }
};

// getPaidSpotDelegateData
const getPaidSpotDelegateData = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "DESC",
      search = "",
    } = req.body;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;
     // ✅ Trim and normalize search once
    search = search ? search.trim() : "";

    // ✅ Validate sortBy field
    const allowedSortFields = [
      "name",
      "email",
      "mobile",
      "created_at",
      "payment_status",
    ];
    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "created_at"; // default safe field
    }

    const whereClause = {
      is_spot_registered: 1,
      batch_assign: "0",
      status: "1",
    };

    if (search.trim() !== "") {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { organization_name: { [Op.like]: `%${search}%` } },
        { total_delegate: { [Op.like]: `%${search}%` } },
        { '$deletegate_registation.deletegate_category$': { [Op.like]: `%${search}%` } },
        { '$deletegate_registation.organization_name$': { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Delegate.findAndCountAll({
      where: whereClause,
          include: [
        {
          model: DelegateRegistration,
           as: 'deletegate_registation',
          attributes: ['deletegate_category'],
          required: search ? true : false
        },
          ],
      order: [[sortBy, sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"]],
      offset,
      limit,
    });

    const totalPages = Math.ceil(count / limit);

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No spot registration data found with pending payments",
      });
    }

    res.status(200).json({
      status: true,
      message: "Spot registration data fetched successfully",
      data: rows,
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch spot registration data",
      error: error.message,
    });
  }
};

// updateBadgeStatus
const updateBadgeStatus = async (req, res) => {
  try {
    const {
      id, // Spot Registration ID
      batch_assign,
      url_for_qr, // optional, required only when batch_assign === 3
    } = req.body;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        status: false,
        message: "ID is required",
      });
    }

    // Find the SpotRegistration record
    const spotRecord = await Delegate.findByPk(id);

    if (!spotRecord) {
      return res.status(404).json({
        status: false,
        message: "Spot registration not found",
      });
    }

    // Prepare update payload
    const updatePayload = { batch_assign };

    // If batch_assign is 3, require and update url_for_qr
    if (Number(batch_assign) === 3) {
      if (!url_for_qr) {
        return res.status(400).json({
          status: false,
          message: "url_for_qr is required when batch_assign is 3",
        });
      }
      updatePayload.url_for_qr = url_for_qr;
    }

    // Update the record
    await spotRecord.update(updatePayload);

    res.status(200).json({
      status: true,
      message: "Spot registration updated successfully",
      data: {
        updatedRegistration: spotRecord,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Failed to update spot registration",
      error: error.message,
    });
  }
};

// getDelegateDataforReprint
const getDelegateDataforReprint = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "DESC",
      search = "",
    } = req.body;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;
     // ✅ Trim and normalize search once
    search = search ? search.trim() : "";

    // ✅ Validate sortBy field
    const allowedSortFields = [
      "name",
      "email",
      "mobile",
      "created_at",
      "payment_status",
    ];
    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "created_at"; // default safe field
    }

    const whereClause = {
      is_spot_registered: 1,
      batch_assign: "2",
      status: "1",
    };

    if (search.trim() !== "") {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { organization_name: { [Op.like]: `%${search}%` } },
        { total_delegate: { [Op.like]: `%${search}%` } },
        { '$deletegate_registation.deletegate_category$': { [Op.like]: `%${search}%` } },
        { '$deletegate_registation.organization_name$': { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Delegate.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: DelegateRegistration,
           as: 'deletegate_registation',
          attributes: ['deletegate_category', "organization_name"],
          required: search ? true : false
        },
          ],
      order: [[sortBy, sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"]],
      offset,
      limit,
    });

    const totalPages = Math.ceil(count / limit);

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No spot registration data found with pending payments",
      });
    }

    res.status(200).json({
      status: true,
      message: "Spot registration data fetched successfully",
      data: rows,
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch spot registration data",
      error: error.message,
    });
  }
};

// userLogin
const userLogin = async (req, res) => {
     try {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: { email: email, password: password, status: 1 },
  });

  if (!user) {
    return res.send({
      status: 404,
      message: "User not found or inactive",
      data: "",
    });
  }

  return res.send({
    status: 200,
    message: "User login successful",
    data: { user },
  });

     } catch (err) {
       console.error("Login error:", err);
       return res.send({
         status: 500,
         message: "Something went wrong",
         data: ""
       });
     }
};

// getBadgeType
const getBadgeType = async (req, res) => {
  try {
    const { id } = req.body; // Extract the 'id' from the request body

    // Check if the 'id' is provided
    if (!id) {
      return res.status(400).json({
        status: false,
        message: "ID is required in the request body",
      });
    }

    const fees = await Delegate.findOne({
      attributes: ["id", "batch_assign"],
      where: {
        status: 1, // or 1
        id, // Filter by the provided 'id'
      },
    });

    // If no fees found for the provided 'id'
    if (fees.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No Data found for the given ID",
      });
    }

    res.status(200).json({
      status: true,
      message: "data fetched successfully",
      data: fees,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch active payment fee data",
      error: error.message,
    });
  }
};

// getDelegateDataforBadgeReAssign
const getDelegateDataforBadgeReAssign = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "DESC",
      search = "",
    } = req.body;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;
    
     // ✅ Trim and normalize search once
    search = search ? search.trim() : "";

    // ✅ Validate sortBy field
    const allowedSortFields = [
      "name",
      "email",
      "mobile",
      "created_at",
      "payment_status",
    ];
    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "created_at"; // default safe field
    }

    const whereClause = {
      //   is_spot_registered: 1,
      batch_assign: "2",
      status: "1",
    };

    if (search.trim() !== "") {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { organization_name: { [Op.like]: `%${search}%` } },
        { total_delegate: { [Op.like]: `%${search}%` } },
        { '$deletegate_registation.deletegate_category$': { [Op.like]: `%${search}%` } },
        { '$deletegate_registation.organization_name$': { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Delegate.findAndCountAll({
      where: whereClause,
          include: [
        {
          model: DelegateRegistration,
           as: 'deletegate_registation',
          attributes: ['deletegate_category', "organization_name"],
          required: search ? true : false
        },
          ],
      order: [[sortBy, sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"]],
      offset,
      limit,
    });

    const totalPages = Math.ceil(count / limit);

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No spot registration data found with pending payments",
      });
    }

    res.status(200).json({
      status: true,
      message: "Spot registration data fetched successfully",
      data: rows,
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch spot registration data",
      error: error.message,
    });
  }
};

// getActivityType
const getActivityType = async (req, res) => {
  try {
    // Get delegate info to check is_spot_registered
    const delegate = await Delegate.findOne({
      where: { id: req.body.id },
      attributes: ["is_spot_registered"],
    });

    if (!delegate) {
      return res.status(404).json({
        status: false,
        message: "Delegate not found",
      });
    }

    let activity;

    // Choose activity source based on is_spot_registered
    if (delegate.is_spot_registered === 1 || delegate.is_spot_registered === 0) {
      activity = await ActivityMaster.findAll({
        where: {
          Is_Active: 1,
        },
      });
    } else if (delegate.is_spot_registered === 2) {
      // Step 1: Get all Action_Type values from PersonActivityRestriction
      const restrictions = await PersonActivityRestriction.findAll({
        where: {
          User_ID: req.body.id,
          Is_Active: 1,
        },
        attributes: ["Action_Type"],
      });

      const actionTypes = restrictions.map((r) => r.Action_Type);

      // Step 2: Fetch matching records from ActivityMaster
      activity = await ActivityMaster.findAll({
        where: {
          Is_Active: 1,
          Activity_Type_ID: actionTypes.length ? actionTypes : null, // avoids empty IN clause
        },
      });
    } else {
      return res.status(400).json({
        status: false,
        message: "Invalid is_spot_registered value",
      });
    }

    // Fetch actions for the specific user
    const userActions = await Action.findAll({
      where: {
        userId: req.body.id,
        isActive: 1,
      },
    });

    res.status(200).json({
      status: true,
      message: "Activity and user-specific action data fetched successfully",
      data: {
        activity,
        userActions,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

// getSingleSpotRegistration
const getSingleUserInfo = async (req, res) => {
  try {
    const { id } = req.body; // Extract the 'id' from the request body

    // Check if the 'id' is provided
    if (!id) {
      return res.status(400).json({
        status: false,
        message: "ID is required in the request body",
      });
    }

    const fees = await Delegate.findOne({
      where: {
        status: 1, // or 1
        id, // Filter by the provided 'id'
      },
      include: [
        {
          model: DelegateRegistration,
          attributes: ['GSTIN', 'deletegate_category', "organization_name"],
          
        },
      ],
    });

    // If no fees found for the provided 'id'
    if (fees.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No active payment fee data found for the given ID",
      });
    }
    
     // Get activity restrictions
    const activity = await PersonActivityRestriction.findAll({
      where: { User_ID: id },
    });

    res.status(200).json({
      status: true,
      message: "Active payment fee data fetched successfully",
      data: {
        ...fees.toJSON(),
        activity, // ⬅️ Activity data added here without altering original structure
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch active payment fee data",
      error: error.message,
    });
  }
};

// createRegistrationfromAdmin
const createRegistrationfromAdmin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      name,
      mobile,
      dial_code,
      email,
      designation,
      organization_name,
      GSTIN,
      deletegate_category,
      amount,
      tax,
      total_amount,
      event_id,
      payment_mode,
      url_for_qr,
      added_by_user,
      updated_by_user,
      type,
      restrictions = [],
    } = req.body;

    

    // 2. Get new delegate_reg_id
    const lastDelegate = await Delegate.findOne({
      order: [["delegate_reg_id", "DESC"]],
    });

    const newDelegateRegId = lastDelegate
      ? lastDelegate.delegate_reg_id + 1
      : 1;
    // const typeValue = payment_mode === 'free' ? 'free' : 'paid';

    // 3. Create Delegate record
    const newDelegate = await Delegate.create(
      {
        event_id,
        name,
        mobile,
        email,
        organization_name,
        designation,
        user_id: 1, // replace with actual user_id if needed
        created_at: new Date(),
        delegate_reg_id: newDelegateRegId,
        per_delegate: amount,
        per_delegate_tax: tax,
        total_delegate: total_amount,
        is_spot_registered: 2,
        dial_code,
        type,
        payment_mode,
      },
      { transaction: t }
    );

    // 4. Update url_for_qr using new delegate ID
    const originalUrl = "https://event.sopa.org/delegate/6";
    let updatedUrlForQR = originalUrl;

    if (originalUrl && typeof originalUrl === "string") {
      const urlParts = originalUrl.split("/");
      if (urlParts.length >= 1) {
        urlParts[urlParts.length - 1] = newDelegate.id.toString();
        updatedUrlForQR = urlParts.join("/") + "/0";
      }
    }

    await newDelegate.update(
      { url_for_qr: updatedUrlForQR },
      { transaction: t }
    );
    // await spotRecord.update({ url_for_qr: updatedUrlForQR }, { transaction: t });
    
     // 5. Create DelegateRegistration entry
    const newDelegateRegistration = await DelegateRegistration.create(
      {
        organization_name,
        GSTIN,
        total_delegate: total_amount,
        deletegate_category,
        grand_total: total_amount,
        status: "1",
        user_id: added_by_user || 1,
        event_id,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction: t }
    );

    // 5. Insert PersonActivityRestriction entries (bulk insert)
    if (Array.isArray(restrictions) && restrictions.length > 0) {
      const restrictionInserts = restrictions.map((r) => ({
        User_ID: newDelegate.id,
        Action_Type: r.Action_Type || 0,
        Is_Active: 1,
        Add_By_User: added_by_user || "system",
        Update_By_User: updated_by_user || "system",
      }));
      // console.log("🟡 Data Going into PersonActivityRestriction.bulkCreate:", restrictionInserts);
      await PersonActivityRestriction.bulkCreate(restrictionInserts, {
        transaction: t,
      });
    }

    // ✅ Commit all
    await t.commit();

    res.status(201).json({
      status: true,
      message: "Spot registration and delegate created successfully",
      data: {
        // spotRegistration: spotRecord,
        delegate: newDelegate,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Failed to create spot registration",
      error: error.message,
    });
  }
};

// GetActivityRestrictionData
const GetActivityRestrictionData = async (req, res) => {
  try {
    const { User_ID } = req.body; // Extract the 'id' from the request body

    // Check if the 'id' is provided
    if (!User_ID) {
      return res.status(400).json({
        status: false,
        message: "ID is required in the request body",
      });
    }

    const fees = await PersonActivityRestriction.findAll({
      where: {
        Is_Active: 1, // or 1
        User_ID, // Filter by the provided 'id'
      },
    });

    // If no fees found for the provided 'id'
    if (fees.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No activity found for this deleget",
      });
    }

    res.status(200).json({
      status: true,
      message: "activity data fetched successfully",
      data: fees,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch activity data",
      error: error.message,
    });
  }
};

// getDelegateDataforReprint
const getDelegateAdminDataforprint = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      sortBy = "id",
      sortOrder = "DESC",
      search = "",
    } = req.body;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;
    
        // ✅ Trim and normalize search once
    search = search ? search.trim() : "";

    // ✅ Validate sortBy field
    const allowedSortFields = [
       "id",  // <--- added id here
      "name",
      "email",
      "mobile",
      "created_at",
      "payment_status",
    ];
    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "id"; // default safe field
    }

    const whereClause = {
        is_spot_registered: {
    [Op.in]: [0, 2],   // 0 या 2 दोनों चलेगा
  },
      batch_assign: "0",
      status: "1",
    };

    if (search.trim() !== "") {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { organization_name: { [Op.like]: `%${search}%` } },
        { total_delegate: { [Op.like]: `%${search}%` } },
        { '$deletegate_registation.deletegate_category$': { [Op.like]: `%${search}%` } },
        { '$deletegate_registation.organization_name$': { [Op.like]: `%${search}%` } },
        
      ];
    }

    const { count, rows } = await Delegate.findAndCountAll({
      where: whereClause,
       include: [
        {
          model: DelegateRegistration,
           as: 'deletegate_registation',
          attributes: ['deletegate_category', "organization_name"],
          required: search ? true : false
        },
        
          ],
       order: [[Sequelize.col("Delegate.id"), "DESC"]],
      offset,
      limit,
    });

    const totalPages = Math.ceil(count / limit);

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No spot registration data found with pending payments",
      });
    }

    res.status(200).json({
      status: true,
      message: "Spot registration data fetched successfully",
      data: rows,
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch spot registration data",
      error: error.message,
    });
  }
};

// SendMailUsingNodemailer
const SendMailUsingNodemailer = async (req, res) => {
  try {
    const lastDelegate = await Delegate.findOne({
      where: { id: req.body.id },
    });
    const delegate = lastDelegate?.dataValues;
    const MasterEvent = await EventMaster.findOne({
      where: {
        id: "1", // Correct field you are checking
      },
    });
    const events = MasterEvent?.dataValues;

   

    // Dynamic year edition logic
    const baseYear = 2018;
    const currentYear = new Date().getFullYear();
    const editionNumber = currentYear - baseYear + 1;
    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const eventEdition = getOrdinal(editionNumber);

    const qrUrl =
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
      encodeURIComponent(`${delegate?.url_for_qr}`);
    const ImageUrl = "https://event.sopa.org/public/img/unnamed.png";
 const badgeHtml = 
  `<html>
    <head>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          width: 600px;
          height: 850px;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        // .watermark-left,
    // .watermark-right {
    //   position: absolute;
    //   top: 60%;
    //   transform: translateY(-50%) rotate(90deg);
    //   font-size: 60px;
    //   color: rgba(0, 0, 0, 0.2);
    //   font-weight: bold;
    //   pointer-events: none;
    //   z-index: 10;
    //   white-space: nowrap;
    // }
     .watermark-left,
    .watermark-right {
  position: absolute;
  bottom: 110px; /* 👈 aligned with QR's bottom: 40px + 10px buffer */
  transform: rotate(90deg);
  font-size: 60px;
  color: rgba(0, 0, 0, 0.2);
  font-weight: bold;
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
}

    .watermark-left {
      left: 10px;
    }

    .watermark-right {
      right: 10px;
    }
      </style>
    </head>
    <body>
      <div style="position: relative; width: 600px; height: 850px; margin: 0; padding: 0; background-image: url('https://event.sopa.org/public/img/BadgeCard-2025.png'); background-size: cover; background-repeat: no-repeat; background-position: center; text-align: center; font-family: Arial, sans-serif; color: #000;">
      
        <!-- DUMMY Watermark -->
        <div class="watermark-left">DUMMY</div>
    <div class="watermark-right">DUMMY</div>

        <!-- Name -->
        <div style="position: absolute; top: 470px; width: 100%; text-align: center;">
          <h2 style="font-size: 40px; margin: 0; font-weight: bold;">${delegate?.name}</h2>
        </div>
      
        <!-- Organization -->
        <div style="position: absolute; top: 528px; width: 100%; text-align: center;">
          <h3 style="font-size: 24px; margin: 0;">${delegate?.organization_name}</h3>
          <div style="width: 200px; border-bottom: 2px solid #000; margin: 8px auto 0 auto;"></div>
        </div>
      
        <!-- QR Code -->
        <div style="position: absolute; bottom: 40px; width: 100%; text-align: center;">
          <img src="${qrUrl}" alt="QR Code" style="width: 220px; height: 220px;" />
        </div>
      </div>
    </body>
  </html>`;


        //  const path = require('path');
      const printCardDir = path.join(__dirname, 'printCard');
    // const printCardDir = "/home/geecol1b/public_html/rmspro.geecomindia.in/njsbackend/printCard";
    if (!fs.existsSync(printCardDir)) {
      fs.mkdirSync(printCardDir);
    }
    const imagePath = path.join(
      printCardDir,
      `${delegate?.name}-${req.body.id}.png`
    );

    // const browser = await puppeteer.launch({
    //   defaultViewport: null, // Optional but safe to ensure override
    // });
    // const page = await browser.newPage();
    // await page.setViewport({ width: 600, height: 850 });
    // await page.setContent(badgeHtml, { waitUntil: "networkidle0" });

    // // Only screenshot the exact badge area
    // await page.screenshot({
    //   path: imagePath,
    //   type: "png",
    //   clip: { x: 0, y: 0, width: 600, height: 850 },
    // });
    
//     const browser = await puppeteer.launch({
//   executablePath: '/root/.cache/puppeteer/chrome/linux-137.0.7151.55/chrome-linux64/chrome', // ✅ Use the installed Chrome
//   headless: true,
//   args: ['--no-sandbox', '--disable-setuid-sandbox'],
//   defaultViewport: null
// });

const browser = await puppeteer.launch({
  executablePath: '/root/.cache/puppeteer/chrome/linux-139.0.7258.68/chrome-linux64/chrome',
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-zygote',
    '--single-process'
  ]
});
const page = await browser.newPage();

await page.setViewport({ width: 600, height: 850 });

await page.setContent(badgeHtml, { waitUntil: 'networkidle0' });

await page.screenshot({
  path: imagePath,
  type: 'png',
  clip: { x: 0, y: 0, width: 600, height: 850 }
});

    await browser.close();
    const htmlContent = `
    <div style="background-color: #000; width: 600px; height: 90px; display: grid;">
        <img src=${ImageUrl} alt="Header Image" style="max-width:100%;height:50px; margin-left: auto; margin-right: auto; ">
    </div>
    <div style="font-family: Arial, sans-serif; color: #000; line-height: 1.6; font-size: 16px;">
      <h2>Welcome to the ${eventEdition} International Soy Conclave (ISC) ${currentYear} – Registration Confirmation</h2>
      <p>Dear Mr. ${delegate.name},<br><br>
      Greetings from SOPA!<br><br>
      We are pleased to confirm your registration and welcome your participation at the ${eventEdition} International Soy Conclave (ISC).</p>
     </p> the exclusive and prestigious annual event organized by SOPA, focused on the Soy Value Chain, Oilseeds, and Edible Oils.</p>

      <h4>Delegate Details:</h4>
      <ul>
        <li><strong>Name:</strong> Mr. ${delegate.name}</li>
        <li><strong>Designation:</strong> ${delegate.designation}</li>
        <li><strong>Email:</strong> ${delegate.email}</li>
        <li><strong>Mobile No.:</strong> ${delegate.mobile}</li>
      </ul>

      <h4>Event Details</h4>
      <ul>
        <li><strong>Dates:</strong> ${dayjs(events.start_date).format(
          "dddd, D MMM YYYY"
        )} - ${dayjs(events.end_date).format("dddd, D MMM YYYY")}</li>
        <li><strong>Venue:</strong> ${events.event_address}</li>
        <li><strong>Venue Location:</strong> <a href="https://www.google.com/maps">Click Here</a></li>
      </ul>

      <p>You may collect your delegate badge at the registration counter by presenting the attached QR code or this email.</p>
      <b> Please see the attachment for your personalized badge.</b>
      <h4>Conference Program & Details:</h4>
      <a href="https://event.sopa.org/">https://event.sopa.org/</a>

      <h4>Important Guidelines:</h4>
      <ul>
        <li>Wearing your delegate badge at all times during the event is mandatory.</li>
        <li>Please arrive early to ensure timely registration and seating.</li>
      </ul>

      <p>For any assistance, feel free to contact:<br>
      Harish – 9669696180, Ashita - 6260051911</p>

      <p>Warm regards,<br>Conference Secretariat<br>SOPA – The Soybean Processors Association of India</p>

      

    
    
    </div>
    `;

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: delegate?.email, // You can change this to `delegate.email`
      cc: "accounts@sopa.org",
      subject: `Delegate Registration Confirmation`,
      html: htmlContent,
      attachments: [
        {
          filename: `${delegate?.name}-${req.body.id}.png`,
          path: imagePath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ message: "Mail sent successfully!", messageId: info.messageId });
  } catch (error) {
    console.error("Error sending mail:", error);
    res
      .status(500)
      .json({ error: "Failed to send mail", details: error.message });
  }
};

// delegetListforCheckIn
const delegetListforCheckIn = async (req, res) => {
  let {
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "DESC",
    search = "",
  } = req.body;

  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;
  
   // ✅ Trim and normalize search once
    search = search ? search.trim() : "";

  const allowedSortFields = ["name", "email", "mobile", "created_at", "payment_status"];
  if (!allowedSortFields.includes(sortBy)) {
    sortBy = "created_at";
  }

  const whereClause = {
    status: "1",
    // is_spot_registered: 2, // if required
    // batch_assign: "0",     // if required
  };

  if (search.trim() !== "") {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { mobile: { [Op.like]: `%${search}%` } },
      { organization_name: { [Op.like]: `%${search}%` } },
      { total_delegate: { [Op.like]: `%${search}%` } },
      { '$deletegate_registation.deletegate_category$': { [Op.like]: `%${search}%` } },
      { '$deletegate_registation.organization_name$': { [Op.like]: `%${search}%` } },
    ];
  }

  try {
    const { count, rows } = await Delegate.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Action,
          as: "actions",
          required: false, // ✅ only include delegates who have action_type = 31
          where: {
            isActive: 1,
            action_type: 31,
          },
        },
           
        {
          model: DelegateRegistration,
           as: 'deletegate_registation',
          attributes: ['deletegate_category', "organization_name"],
          required: search ? true : false
        },
         
      ],
      order: [[sortBy, sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"]],
      offset,
      limit,
    });

    const totalPages = Math.ceil(count / limit);

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No delegates found with action type 31",
      });
    }

    res.status(200).json({
      status: true,
      message: "Delegates with action type 31 fetched successfully",
      data: rows,
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch delegate data",
      error: error.message,
    });
  }
};


// updateRegistrationfromAdmin
const updateRegistrationfromAdmin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      id, // delegate ID to update
      name,
      mobile,
     delegate_reg_id,
      email,
      designation,
      organization_name,
      GSTIN,
      deletegate_category,
      amount,
      tax,
      total_amount,
      payment_mode,
      type,
      restrictions = [],
      updated_by_user,
    } = req.body;

     if (!id || !delegate_reg_id) {
      return res.status(400).json({ status: false, message: "Missing delegate ID or delegate_reg_id" });
    }

    // 1. Find delegate
    const existingDelegate = await Delegate.findByPk(id);
    if (!existingDelegate) {
      return res.status(404).json({ status: false, message: "Delegate not found" });
    }

    // 2. Update delegate details
    await existingDelegate.update(
      {
        name,
        mobile,
        per_delegate: amount,
        per_delegate_tax: tax,
        total_delegate: total_amount,
        email,
        designation,
        organization_name,
        GSTIN,
        deletegate_category,
        
        payment_mode,
        type,
        updated_at: new Date(),
      },
      { transaction: t }
    );
    
     // 2. Find and update DelegateRegistration
    const existingDelegateRegistration = await DelegateRegistration.findOne({
      where: { id:delegate_reg_id },
      transaction: t,
    });

    if (existingDelegateRegistration) {
      await existingDelegateRegistration.update(
        {
          organization_name,
          GSTIN,
          deletegate_category,
          updated_at: new Date(),
          update_by_user: updated_by_user || "Admin",
        },
        { transaction: t }
      );
    }

    // 3. Update restrictions
    if (Array.isArray(restrictions)) {
      // Delete old restrictions
      await PersonActivityRestriction.destroy({
        where: { User_ID: existingDelegate.id },
        transaction: t,
      });

      // Insert new restrictions
      const restrictionInserts = restrictions.map((r) => ({
        User_ID: existingDelegate.id,
        Action_Type: r.Action_Type || 0,
        total_delegate: total_amount,
        grand_total: total_amount,
        Is_Active: 1,
        Add_By_User: updated_by_user || "Admin",
        Update_By_User: updated_by_user || "Admin",
      }));

      if (restrictionInserts.length > 0) {
        await PersonActivityRestriction.bulkCreate(restrictionInserts, {
          transaction: t,
        });
      }
    }

    // 4. Commit
    await t.commit();

    res.status(200).json({
      status: true,
      message: "Delegate registration updated successfully",
      data: existingDelegate,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Failed to update delegate registration",
      error: error.message,
    });
  }
};

// sendBulkMailUsingNodemailer
const sendBulkMailUsingNodemailer = async (req, res) => {
  try {
    const delegates = await Delegate.findAll({
      where: { event_id: 1, status: 1, is_spot_registered : 2,  },
    });

    const MasterEvent = await EventMaster.findOne({ where: { id: 1 } });
    const events = MasterEvent?.dataValues;

    const baseYear = 2018;
    const currentYear = new Date().getFullYear();
    const editionNumber = currentYear - baseYear + 1;
    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const eventEdition = getOrdinal(editionNumber);

    const ImageUrl = "https://event.sopa.org/public/img/unnamed.png";

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    let successCount = 0;
    let failed = [];

    const folderPath = path.join(__dirname, "printCard");
    
    for (const delegate of delegates) {
        // Find image by delegate ID (e.g., name-id.png)
      const fileName = fs
        .readdirSync(folderPath)
        .find((file) => file.endsWith(`-${delegate.id}.png`));

      if (!fileName) {
        failed.push({ id: delegate.id, reason: "Image not found" });
        continue;
      }

      const imagePath = path.join(folderPath, fileName);

      const htmlContent = `
      <div style="background-color: #000; width: 600px; height: 90px; display: grid;">
        <img src=${ImageUrl} alt="Header Image" style="max-width:100%;height:50px; margin-left: auto; margin-right: auto; ">
      </div>
      <div style="font-family: Arial, sans-serif; color: #000; line-height: 1.6; font-size: 16px;">
        <h2>Welcome to the ${eventEdition} International Soy Conclave (ISC) ${currentYear} – Registration Confirmation</h2>
        <p>Dear Mr. ${delegate.name},<br><br>
        Greetings from SOPA!<br><br>
        We are pleased to confirm your registration and welcome your participation at the ${eventEdition} International Soy Conclave (ISC).</p>
        </p> the exclusive and prestigious annual event organized by SOPA, focused on the Soy Value Chain, Oilseeds, and Edible Oils.</p>

        <h4>Delegate Details:</h4>
        <ul>
          <li><strong>Name:</strong> Mr. ${delegate.name}</li>
          <li><strong>Designation:</strong> ${delegate.designation}</li>
          <li><strong>Email:</strong> ${delegate.email}</li>
          <li><strong>Mobile No.:</strong> ${delegate.mobile}</li>
        </ul>

        <h4>Event Details</h4>
        <ul>
          <li><strong>Dates:</strong> ${dayjs(events.start_date).format(
            "dddd, D MMM YYYY"
          )} - ${dayjs(events.end_date).format("dddd, D MMM YYYY")}</li>
          <li><strong>Venue:</strong> ${events.event_address}</li>
          <li><strong>Venue Location:</strong> <a href="https://www.google.com/maps">Click Here</a></li>
        </ul>

        <p>You may collect your delegate badge at the registration counter by presenting the attached QR code or this email.</p>
        <b> Please see the attachment for your personalized badge.</b>
        <h4>Conference Program & Details:</h4>
        <a href="https://event.sopa.org/">https://event.sopa.org/</a>

        <h4>Important Guidelines:</h4>
        <ul>
          <li>Wearing your delegate badge at all times during the event is mandatory.</li>
          <li>Please arrive early to ensure timely registration and seating.</li>
        </ul>

        <p>For any assistance, feel free to contact:<br>
        Harish – 9669696180, Ashita - 6260051911</p>

        <p>Warm regards,<br>Conference Secretariat<br>SOPA – The Soybean Processors Association of India</p>
      </div>`;

      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: delegate.email,
        cc: "accounts@sopa.org",
        subject: "Delegate Registration Confirmation",
        html: htmlContent,
        attachments: [
          {
            filename: `${delegate.name}-${delegate.id}.png`,
            path: imagePath,
          },
        ],
      };

      try {
        await transporter.sendMail(mailOptions);
        successCount++;
      } catch (e) {
        failed.push({ id: delegate.id, reason: e.message });
      }
    }

    res.json({
      message: `Bulk mail process completed. Sent: ${successCount}, Failed: ${failed.length}`,
      failed,
    });
  } catch (error) {
    console.error("Bulk mail error:", error);
    res.status(500).json({ error: "Bulk mail failed", details: error.message });
  }
};



// sendBulkMailtoPreRegisterdDeleget
const sendBulkMailtoPreRegisterdDeleget = async (req, res) => {
   try {
    const delegates = await Delegate.findAll({
      where: { event_id: 1, status: 1, is_spot_registered : 0,  },
    });

    const MasterEvent = await EventMaster.findOne({ where: { id: 1 } });
    const events = MasterEvent?.dataValues;

    const baseYear = 2018;
    const currentYear = new Date().getFullYear();
    const editionNumber = currentYear - baseYear + 1;
    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const eventEdition = getOrdinal(editionNumber);

    const ImageUrl = "https://event.sopa.org/public/img/unnamed.png";

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    let successCount = 0;
    let failed = [];

    function sanitizeName(name) {
  return name.replace(/[^A-Za-z0-9\-]/g, '_');
}

const folderUrl = "https://event.sopa.org/public/img/badges/";
    
    for (const delegate of delegates) {
        // Find image by delegate ID (e.g., name-id.png)
        
        const sanitizedName = sanitizeName(delegate.name);
  const fileName = `badge_${delegate.id}_${sanitizedName}.png`;
  const imageUrl = `${folderUrl}${fileName}`;
  
   console.log("Checking for delegate:", delegate.name);
  console.log("Sanitized name:", sanitizedName);
  console.log("Final badge image URL:", imageUrl);
  

  try {
    // Check if image exists (returns 200 if found)
    await axios.head(imageUrl);
  } catch (err) {
    failed.push({ id: delegate.id, reason: "Image not found (404)" });
    continue;
  }


      const htmlContent = `
      <div style="background-color: #000; width: 600px; height: 90px; display: grid;">
        <img src=${ImageUrl} alt="Header Image" style="max-width:100%;height:50px; margin-left: auto; margin-right: auto; ">
      </div>
      <div style="font-family: Arial, sans-serif; color: #000; line-height: 1.6; font-size: 16px;">
        <h2>Welcome to the ${eventEdition} International Soy Conclave (ISC) ${currentYear} – Registration Confirmation</h2>
        <p>Dear Mr. ${delegate.name},<br><br>
        Greetings from SOPA!<br><br>
        We are pleased to confirm your registration and welcome your participation at the ${eventEdition} International Soy Conclave (ISC).</p>
        </p> the exclusive and prestigious annual event organized by SOPA, focused on the Soy Value Chain, Oilseeds, and Edible Oils.</p>

        <h4>Delegate Details:</h4>
        <ul>
          <li><strong>Name:</strong> Mr. ${delegate.name}</li>
          <li><strong>Designation:</strong> ${delegate.designation}</li>
          <li><strong>Email:</strong> ${delegate.email}</li>
          <li><strong>Mobile No.:</strong> ${delegate.mobile}</li>
        </ul>

        <h4>Event Details</h4>
        <ul>
          <li><strong>Dates:</strong> ${dayjs(events.start_date).format(
            "dddd, D MMM YYYY"
          )} - ${dayjs(events.end_date).format("dddd, D MMM YYYY")}</li>
          <li><strong>Venue:</strong> ${events.event_address}</li>
          <li><strong>Venue Location:</strong> <a href="https://www.google.com/maps">Click Here</a></li>
        </ul>

        <p>You may collect your delegate badge at the registration counter by presenting the attached QR code or this email.</p>
        <b> Please see the attachment for your personalized badge.</b>
        <h4>Conference Program & Details:</h4>
        <a href="https://event.sopa.org/">https://event.sopa.org/</a>

        <h4>Important Guidelines:</h4>
        <ul>
          <li>Wearing your delegate badge at all times during the event is mandatory.</li>
          <li>Please arrive early to ensure timely registration and seating.</li>
        </ul>

        <p>For any assistance, feel free to contact:<br>
        Harish – 9669696180, Ashita - 6260051911</p>

        <p>Warm regards,<br>Conference Secretariat<br>SOPA – The Soybean Processors Association of India</p>
      </div>`;

      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: delegate.email,
        cc: "accounts@sopa.org",
        subject: "Delegate Registration Confirmation",
        html: htmlContent,
        attachments: [
          {
            filename: fileName ,
            path: imageUrl,
          },
        ],
      };

      try {
        await transporter.sendMail(mailOptions);
        successCount++;
      } catch (e) {
        failed.push({ id: delegate.id, reason: e.message });
      }
    }

    res.json({
      message: `Bulk mail process completed. Sent: ${successCount}, Failed: ${failed.length}`,
      failed,
    });
  } catch (error) {
    console.error("Bulk mail error:", error);
    res.status(500).json({ error: "Bulk mail failed", details: error.message });
  }
};

// getActionTypeCount
const getActionTypeCount = async (req, res) => {
  try {
    const count = await Action.count({
      where: {
        action_type: 31,
      },
    });

    return res.status(200).json({
      status: 200,
      message: 'Action type 31 count fetched successfully',
      data: { count },
    });
  } catch (error) {
    console.error('Error fetching action count:', error);
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
    });
  }
};

// getDelegateAndActionSummary
const getDelegateAndActionSummary = async (req, res) => {
//   try {
    // ✅ Count delegates where status = 1
    const totalDelegates = await Delegate.count({
      where: { status: 1 },
    });

    // ✅ Count actions grouped by Activity_Type_ID
    const actions = await Action.findAll({
      attributes: [
        "action_type",
        [Action.sequelize.fn("COUNT", Action.sequelize.col("actionId")), "total"],
      ],
      group: ["action_type"],
    });

    res.json({
      success: true,
      totalDelegates,
      actions,
    });
//   } catch (error) {
//     console.error("Error fetching summary:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
};

// delegetListwithActivity
const delegetListwithActivity = async (req, res) => {
  let {
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "DESC",
    search = "",
    action_type = null, // ✅ payload से ले रहे हैं
  } = req.body;

  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;
  
   // ✅ Trim and normalize search once
    search = search ? search.trim() : "";

  const allowedSortFields = ["name", "email", "mobile", "created_at", "payment_status"];
  if (!allowedSortFields.includes(sortBy)) {
    sortBy = "created_at";
  }

  const whereClause = { status: "1" };

  if (search.trim() !== "") {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { mobile: { [Op.like]: `%${search}%` } },
      { organization_name: { [Op.like]: `%${search}%` } },
      { total_delegate: { [Op.like]: `%${search}%` } },
      { '$deletegate_registation.deletegate_category$': { [Op.like]: `%${search}%` } },
      { '$deletegate_registation.organization_name$': { [Op.like]: `%${search}%` } },
    ];
  }

   try {
    // ✅ Action include को dynamic बनाओ
    let actionInclude = {
      model: Action,
      as: "actions",
      where: { isActive: 1 },
      required: false, // default (LEFT JOIN)
    };

    // अगर payload में action_type है
    if (action_type && action_type !== "") {
      actionInclude.where.action_type = action_type;
      actionInclude.required = true; // ✅ अब सिर्फ matching वाले delegates आएंगे
    }

    const { count, rows } = await Delegate.findAndCountAll({
      where: whereClause,
      include: [
        actionInclude,
        {
          model: DelegateRegistration,
          as: "deletegate_registation",
          attributes: ["deletegate_category", "organization_name"],
          required: search ? true : false,
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"]],
      offset,
      limit,
       distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: action_type
          ? `No delegates found with action type ${action_type}`
          : "No delegates found",
      });
    }

    res.status(200).json({
      status: true,
      message: action_type
        ? `Delegates with action type ${action_type} fetched successfully`
        : "Delegates fetched successfully",
      data: rows,
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch delegate data",
      error: error.message,
    });
  }
};

// getDelegatesWithCompletedActivity
const getDelegatesWithCompletedActivity = async (req, res) => {
  try {
    let { actionType, page = 1, limit = 10, search = "" } = req.body;

    if (!actionType) {
      return res.status(400).json({
        success: false,
        message: "actionType is required",
      });
    }

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    // ✅ Delegate search condition
    const delegateWhere = search.trim()
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { mobile: { [Op.like]: `%${search}%` } },
            { organization_name: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    // ✅ Fetch delegates with actions
    const { count, rows } = await Delegate.findAndCountAll({
      where: delegateWhere,
      include: [
        {
          model: Action,
          as: "actions", // ✅ must match hasMany alias
          where: { action_type: actionType },
          required: true, // only delegates with matching actions
        },
        {
          model: DelegateRegistration,
          as: "registration", // optional, remove if not needed
        },
      ],
      offset,
      limit,
      distinct: true, // ✅ ensures count is correct with join
      order: [["created_at", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No delegates found with completed activity for this actionType",
      });
    }

    res.status(200).json({
      success: true,
      message: "Delegates with completed activity fetched successfully",
      data: rows,
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error in getDelegatesWithCompletedActivity:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
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
  updateRegistrationfromAdmin,
  sendBulkMailUsingNodemailer,
  sendBulkMailtoPreRegisterdDeleget,
  getActionTypeCount,
  getDelegateAndActionSummary,
  delegetListwithActivity,
  getDelegatesWithCompletedActivity
};
