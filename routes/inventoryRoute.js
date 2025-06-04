// Needed Resources 
// const express = require("express")
// const router = new express.Router() 
// const invController = require("../controllers/invController")

// // Route to build inventory by classification view
// router.get("/type/:classificationId", invController.buildByClassificationId);
// router.get("/detail/:inv_id", invController.buildByInvId);



// module.exports = router;

const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", 
  utilities.handleErrors(invController.buildByClassificationId));

router.get("/detail/:inv_id", 
  utilities.handleErrors(invController.buildByInvId));

// Nueva ruta para generar error 500 (Task 3)
router.get("/trigger-error", 
  utilities.handleErrors(invController.triggerIntentionalError));

//route management view
router.get("/", invController.buildManagementView)

// ------------ route to get classification
router.get("/add-classification", invController.buildAddClassification)

// Ruta POST con validación
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.registerClassification
)

// -------------

router.get("/add-inventory", invController.buildAddInventory);

// Ruta POST para registrar nuevo vehículo
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.registerInventory)
);


// Path returning inventory by classification_id in JSON format
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)


/* ***************************
 * Route to build edit inventory view
 * URL: /inv/edit/:inv_id
 * ************************** */
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.buildEditInventoryView)
);

module.exports = router;