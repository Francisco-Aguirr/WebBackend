const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

const utilities = require("../utilities/")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }


  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
*  Process Login
* *************************************** */
/* ****************************************
 *  Process login request
 * ************************************ */
async function loginAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

// account manager
async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav()
  const message = req.flash("notice")
  const errors = null

  res.render("account/management", {
    title: "Account Management",
    nav,
    message,
    errors
  })
}

/* ****************************************
*  Deliver update account view
* *************************************** */
async function buildUpdateView(req, res) {
  const nav = await utilities.getNav();
  const account_id = parseInt(req.params.account_id);
  const accountData = await accountModel.getAccountById(account_id);

  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    accountData,
  });
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  const nav = await utilities.getNav();

  try {
    await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);
    req.flash("notice", "Account updated successfully.");
    res.redirect("/account/");
  } catch (error) {
    req.flash("notice", "Failed to update account.");
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: req.body,
    });
  }
}

/* ****************************************
*  Process password update
* *************************************** */
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body;
  const nav = await utilities.getNav();
  const hashedPassword = await bcrypt.hash(account_password, 10);

  try {
    await accountModel.updatePassword(account_id, hashedPassword);
    req.flash("notice", "Password updated successfully.");
    res.redirect("/account/");
  } catch (error) {
    req.flash("notice", "Failed to update password.");
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: { account_id },
    });
  }
}

/* ****************************************
*  Process logout
* *************************************** */
function logout(req, res) {
  res.clearCookie("jwt");
  res.redirect("/");
}


module.exports = { buildLogin, buildRegister, registerAccount, loginAccount, buildAccountManagement, updatePassword, updateAccount, buildUpdateView, logout }