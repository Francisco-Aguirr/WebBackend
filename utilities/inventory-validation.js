const { body, validationResult } = require("express-validator")
const utilities = require(".")

const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9\s]{3,30}$/)
      .withMessage("Classification name must be 3–30 characters and alphanumeric."),
  ]
}

const checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
    })
    return
  }
  next()
}




// Reglas de validación para inventario
const inventoryRules = () => {
  return [
    body("classification_id")
      .isInt({ min: 1 })
      .withMessage("Please choose a valid classification."),
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Make is required."),
    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required."),
    body("inv_year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Enter a valid year."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Enter a valid price."),
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Enter a valid mileage."),
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required."),
  ]
}

// Validación y redirección si hay errores
const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  const nav = await require("../utilities/").getNav()
  const classificationList = await require("../utilities/").buildClassificationList(req.body.classification_id)

  if (!errors.isEmpty()) {
    return res.render("inventory/add-inventory", {
  title: "Add New Vehicle",
  nav,
  classificationList,
  errors: errors.array(),
  formData: req.body, 
  })
  }
  next()
}




module.exports = {
  classificationRules,
  checkClassificationData,
  inventoryRules,
  checkInventoryData
}
