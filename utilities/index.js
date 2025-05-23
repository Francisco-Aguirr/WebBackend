const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid = ''
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="/inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="/inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
// Actualiza el middleware handleErrors
Util.handleErrors = fn => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error(`Error in route ${req.originalUrl}:`, error);
    next(error); // Pasa el error al middleware de manejo de errores
  }
};

/* ****************************************
 * Build HTML for vehicle detail view
 * ************************************** */
Util.buildVehicleDetail = function(vehicle) {
  // Verificar que los datos lleguen correctamente
  console.log('Vehicle data in buildVehicleDetail:', vehicle);
  
  if (!vehicle) {
    return '<p class="error">Vehicle data not available</p>';
  }

  return `
    <div class="vehicle-detail-container">
      <div class="vehicle-image">
        <img src="${vehicle.inv_image || '/images/no-image.jpg'}" 
             alt="${vehicle.inv_make || ''} ${vehicle.inv_model || ''}" 
             class="img-fluid">
      </div>
      <div class="vehicle-info">
        <h2>${vehicle.inv_year || 'N/A'} ${vehicle.inv_make || ''} ${vehicle.inv_model || ''}</h2>
        <div class="price">Price: ${Util.formatAsUSD(vehicle.inv_price) || 'N/A'}</div>
        <div class="mileage">Mileage: ${vehicle.inv_miles ? vehicle.inv_miles.toLocaleString() : 'N/A'} miles</div>
        <div class="description">${vehicle.inv_description || 'No description available'}</div>
        <div class="details">
          <p><strong>Color:</strong> ${vehicle.inv_color || 'N/A'}</p>
          <p><strong>Stock #:</strong> ${vehicle.inv_stock || 'N/A'}</p>
          ${vehicle.classification_name ? `<p><strong>Category:</strong> ${vehicle.classification_name}</p>` : ''}
        </div>
      </div>
    </div>
  `;
}

/* ****************************************
 * Helper function to format as USD
 * ************************************** */
Util.formatAsUSD = function(number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(number);
}

module.exports = Util;