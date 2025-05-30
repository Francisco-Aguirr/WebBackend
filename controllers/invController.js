const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view by inventory ID
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    if (isNaN(inv_id)) {
      throw new Error('ID de vehículo inválido');
    }

    const data = await invModel.getVehicleById(inv_id);
    console.log('Datos del vehículo obtenidos:', data); // Para depuración
    
    if (!data) {
      let nav = await utilities.getNav();
      return res.render("./inventory/detail", {
        title: "Vehículo no encontrado",
        nav,
        detailHTML: '<div class="alert alert-warning">El vehículo solicitado no existe</div>',
      });
    }

    const detailHTML = await utilities.buildVehicleDetail(data);
    let nav = await utilities.getNav();
    
    res.render("./inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      detailHTML,
    });
  } catch (error) {
    console.error('Error en buildByInvId:', error);
    let nav = await utilities.getNav();
    res.render("./inventory/detail", {
      title: "Error",
      nav,
      detailHTML: `<div class="alert alert-danger">Error al cargar los detalles: ${error.message}</div>`,
    });
  }
}

// Controlador para generar error intencional (Task 3)
invCont.triggerIntentionalError = async function(req, res, next) {
  try {
    // Simulamos una condición de error
    const shouldFail = true;
    
    if (shouldFail) {
      // Creamos un error de base de datos simulado
      const dbError = new Error("Error intencional de conexión a la base de datos");
      dbError.status = 500;
      dbError.stack = "Simulated DB Connection Error at triggerIntentionalError";
      
      // Lanzamos el error intencionalmente
      throw dbError;
    }
    
    // Este código nunca se ejecutará
    res.send("Esta respuesta nunca se mostrará");
  } catch (error) {
    // Pasamos el error al middleware de manejo de errores
    next(error);
  }
};


//controller for management view
invCont.buildManagementView = async function (req, res) {
  let nav = await utilities.getNav()
  let message = req.flash("notice")  // soporte para mensajes flash
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message,
  })
}

//controller for add-classification
invCont.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

invCont.registerClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  try {
    const result = await invModel.addClassification(classification_name)

    if (result.rowCount > 0) {
      req.flash("notice", "Classification successfully added.")
      res.redirect("/inv/")
    } else {
      req.flash("notice", "Sorry, adding the classification failed.")
      res.status(500).redirect("/inv/add-classification")
    }
  } catch (error) {
    console.error("Error adding classification:", error)
    req.flash("notice", "An error occurred.")
    res.status(500).redirect("/inv/add-classification")
  }
}

// controller for add new vehicle to inventory
invCont.buildAddInventory = async function (req, res) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null,
     formData: {},
  })
}

// register new vehicle controller
invCont.registerInventory = async function (req, res) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body

  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(classification_id)

  // Validación simple de campos vacíos
  const errors = []

  if (!classification_id) errors.push("Classification is required.")
  if (!inv_make || inv_make.trim() === "") errors.push("Make is required.")
  if (!inv_model || inv_model.trim() === "") errors.push("Model is required.")
  if (!inv_year || isNaN(inv_year)) errors.push("Valid Year is required.")
  if (!inv_description || inv_description.trim() === "") errors.push("Description is required.")
  if (!inv_image || inv_image.trim() === "") errors.push("Image Path is required.")
  if (!inv_thumbnail || inv_thumbnail.trim() === "") errors.push("Thumbnail Path is required.")
  if (!inv_price || isNaN(inv_price)) errors.push("Valid Price is required.")
  if (!inv_miles || isNaN(inv_miles)) errors.push("Valid Miles is required.")
  if (!inv_color || inv_color.trim() === "") errors.push("Color is required.")

  if (errors.length > 0) {
    res.status(400).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors,
      formData: req.body,
    })
    return
  }

  try {
    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })

    if (result.rowCount > 0) {
      req.flash("notice", "Vehicle successfully added.")
      res.redirect("/inv/")
    } else {
      res.status(500).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: ["Failed to add vehicle."],
        formData: req.body,
      })
    }
  } catch (error) {
    console.error("Error adding vehicle:", error)
    res.status(500).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: ["An unexpected error occurred."],
      formData: req.body,
    })
  }
}




module.exports = invCont;