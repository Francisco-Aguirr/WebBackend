const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
    return []
  }
}

/* ***************************
 *  Get single vehicle by ID
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name 
       FROM inventory AS i
       LEFT JOIN classification AS c ON i.classification_id = c.classification_id
       WHERE i.inv_id = $1`,
      [inv_id]
    );
    
    console.log('Resultado de la consulta:', data.rows); // Para depuración
    return data.rows[0] || null;
  } catch (error) {
    console.error("Error en getVehicleById:", error);
    throw error;
  }
}

//add classification
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1)"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    throw error
  }
}


async function addInventory(vehicle) {
  const sql = `
    INSERT INTO inventory
    (classification_id, inv_make, inv_model, inv_year, inv_description,
     inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
  `
  return await pool.query(sql, [
    vehicle.classification_id,
    vehicle.inv_make,
    vehicle.inv_model,
    vehicle.inv_year,
    vehicle.inv_description,
    vehicle.inv_image,
    vehicle.inv_thumbnail,
    vehicle.inv_price,
    vehicle.inv_miles,
    vehicle.inv_color
  ])
}


module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventory};