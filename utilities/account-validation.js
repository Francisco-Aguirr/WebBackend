// utilities/account-validation.js
const accountModel = require("../models/account-model")
const utilities = require(".")
const { body, validationResult } = require("express-validator")

const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
        }
      }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}


/* **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
  ]
}

/* ******************************
 * Check login data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email
    })
    return
  }
  next()
}


/* **********************************
*  Update Data Validation Rules
* ********************************* */
validate.updateRules = () => {
  return [
    body("account_firstname").trim().notEmpty(),
    body("account_lastname").trim().notEmpty(),
    body("account_email").trim().isEmail(),
  ];
};

/* **********************************
*  Password Validation Rules
* ********************************* */
validate.passwordRules = () => {
  return [
    body("account_password")
      .isStrongPassword({
        minLength: 12,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
  ];
};

/* **********************************
*  Update Account Validation Rules
* ********************************* */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required.")
      .isLength({ min: 1 })
      .withMessage("First name must be at least 1 character."),

    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required.")
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters."),

    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Must be a valid email.")
      .custom(async (account_email, { req }) => {
        const account = await accountModel.getAccountByEmail(account_email);
        if (account && account.account_id !== parseInt(req.body.account_id)) {
          throw new Error("Email already exists.");
        }
      }),
  ];
};

/* **********************************
*  Password Update Validation Rules
* ********************************* */
validate.passwordUpdateRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isStrongPassword({
        minLength: 12,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters with 1 uppercase, 1 number, and 1 special character."),
  ];
};

/* **********************************
*  Middleware to Check Update Data
* ********************************* */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(req.body.account_id);
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData: {
        ...accountData,
        ...req.body, // Sobrescribe con los datos enviados (para sticky fields)
      },
    });
  }
  next();
};

module.exports = validate
