//needed resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation');

// Ruta GET para el enlace "My Account"
// En server.js, esta ruta será montada en "/account", así que aquí solo usamos "/"
router.get("/login", 
  utilities.handleErrors(accountController.buildLogin));

// router GET for the registration view
// Registration view route
router.get("/register",
  utilities.handleErrors(accountController.buildRegister));

//route to register
router.post('/register',
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount))


// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.loginAccount)
)

// Main account management view (after login)
router.get(
  "/",
  utilities.checkJWTToken, // Middleware que asegura que el usuario esté autenticado
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)


// Update account routes
router.get("/update/:account_id", 
  utilities.checkJWTToken, 
  utilities.handleErrors(accountController.buildUpdateView));

router.post("/update", 
  utilities.checkJWTToken, 
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount));

router.post("/update-password", 
  utilities.checkJWTToken, 
  regValidate.passwordUpdateRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updatePassword));

  // logout routes
router.get("/logout", 
  utilities.handleErrors(accountController.logout));

// Exporting paths for use in other files
module.exports = router;
