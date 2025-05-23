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

// Route to build inventory by classification view
router.get("/type/:classificationId", 
  utilities.handleErrors(invController.buildByClassificationId));

router.get("/detail/:inv_id", 
  utilities.handleErrors(invController.buildByInvId));

// Nueva ruta para generar error 500 (Task 3)
router.get("/trigger-error", 
  utilities.handleErrors(invController.triggerIntentionalError));

module.exports = router;