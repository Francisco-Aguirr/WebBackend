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

/* ***************************
 * Reglas de validación para inventario
 * ************************** */
const newInventoryRules = () => {
  return [
    // Validación para campos requeridos
    body('classification_id')
      .notEmpty()
      .withMessage('Selecciona una clasificación'),
    body('inv_make')
      .trim()
      .notEmpty()
      .withMessage('Marca es requerida')
      .isLength({ max: 50 })
      .withMessage('Marca no puede exceder 50 caracteres'),
    body('inv_model')
      .trim()
      .notEmpty()
      .withMessage('Modelo es requerido')
      .isLength({ max: 50 })
      .withMessage('Modelo no puede exceder 50 caracteres'),
    body('inv_year')
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('Año inválido'),
    body('inv_description')
      .trim()
      .notEmpty()
      .withMessage('Descripción es requerida'),
    body('inv_price')
      .isDecimal({ decimal_digits: '2' })
      .withMessage('Precio debe ser un número válido (ej: 25000.00)'),
    body('inv_miles')
      .isInt()
      .withMessage('Millaje debe ser un número entero'),
    body('inv_color')
      .trim()
      .notEmpty()
      .withMessage('Color es requerido')
  ];
};

/* ***************************
 * Middleware para manejar errores de actualización
 * ************************** */
const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  const nav = await require("../utilities/").getNav();
  const classificationSelect = await require("../utilities/").buildClassificationList(req.body.classification_id);
  const itemName = `${req.body.inv_make} ${req.body.inv_model}`;

  if (!errors.isEmpty()) {
    return res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: errors.array(),
      inv_id: req.body.inv_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id
    });
  }
  next();
};

const searchRules = () => {
  return [
    body("min_price").optional().isFloat({ min: 0 }),
    body("max_price").optional().isFloat({ min: 0 }),
    body("min_year").optional().isInt({ min: 1900, max: new Date().getFullYear() })
  ];
};


module.exports = {
  classificationRules,
  checkClassificationData,
  inventoryRules,
  checkInventoryData,
  checkUpdateData,
  newInventoryRules,
  searchRules
}
