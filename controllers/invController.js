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


module.exports = invCont;