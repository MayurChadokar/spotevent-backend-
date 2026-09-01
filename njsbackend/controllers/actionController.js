const ActionModel = require("../model/actionModel");
const { Op } = require("sequelize");

const actionTypeMap = {
  1: "Breakfast",
  2: "Lunch",
  3: "Dinner",
  4: "Cocktail",
};

const InsertActionActivity = async (req, res) => {
  try {
    const { userId, action_type, date } = req.body;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await ActionModel.findOne({
      where: {
        userId,
        action_type,
        date: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        status: false,
        message: "Already Scanned!",
      });
    }

    const action = await ActionModel.create({
      userId,
      action_type,
      date,
    });

    res.status(200).json({
      status: true,
      message: "Entry entered successfully",
      data: action,
    });
  } catch (error) {
    console.error("Error inserting action activity:", error);
    res.status(500).json({
      status: false,
      message: "Sorry Inavlid Qr Code",
      error: error.message,
    });
  }
};

module.exports = { InsertActionActivity };
