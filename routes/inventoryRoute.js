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

// ==========================
// PUBLIC ROUTES (no restricción)
// ==========================

// View inventory by classification
router.get("/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// View vehicle detail
router.get("/detail/:inv_id",
  utilities.handleErrors(invController.buildByInvId)
)

// Trigger intentional error
router.get("/trigger-error",
  utilities.handleErrors(invController.triggerIntentionalError)
)

// Get inventory list in JSON (used by dropdown)
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)


// ==========================
// PROTECTED ROUTES (Employee/Admin only)
// ==========================

// Inventory Management view
router.get("/",
  utilities.checkLogin,
  utilities.checkAccountType, // restrict access
  invController.buildManagementView
)

// Show add classification form
router.get("/add-classification",
  utilities.checkLogin,
  utilities.checkAccountType,
  invController.buildAddClassification
)

// Process new classification
router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.registerClassification
)

// Show add inventory form
router.get("/add-inventory",
  utilities.checkLogin,
  utilities.checkAccountType,
  invController.buildAddInventory
)

// Process new inventory
router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.registerInventory)
)

// Build edit inventory view
router.get(
  "/edit/:inv_id",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildEditInventoryView)
)

// Process inventory update
router.post(
  "/update",
  utilities.checkLogin,
  utilities.checkAccountType,
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Show delete confirmation view
router.get("/delete/:inv_id",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(async (req, res, next) => {
    try {
      console.log(`Delete confirmation requested for ID: ${req.params.inv_id}`)
      await invController.buildDeleteConfirmation(req, res, next)
    } catch (error) {
      console.error("Route handler error:", error)
      next(error)
    }
  })
)

// Process deletion
router.post(
  "/delete",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteInventoryItem)
)


// Búsqueda avanzada
router.get("/search",
  utilities.handleErrors(invController.buildSearchView)
);

router.post("/search",
  utilities.handleErrors(invController.searchVehicles)
);

module.exports = router
