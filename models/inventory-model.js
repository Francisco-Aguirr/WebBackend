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

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql = `
      UPDATE inventory 
      SET 
        inv_make = $1, 
        inv_model = $2, 
        inv_description = $3, 
        inv_image = $4, 
        inv_thumbnail = $5, 
        inv_price = $6, 
        inv_year = $7, 
        inv_miles = $8, 
        inv_color = $9, 
        classification_id = $10
      WHERE inv_id = $11
      RETURNING *`;

    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ]);
    
    return data.rows[0];
  } catch (error) {
    console.error("Update inventory error:", error);
    throw error;
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1 RETURNING *';
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    console.error("Delete inventory error:", error);
    throw error;
  }
}

/* ***************************
 *  Search vehicles by multiple criteria
 * ************************** */
async function searchVehicles(filters) {
  try {
    let query = `
      SELECT i.*, c.classification_name 
      FROM inventory i
      LEFT JOIN classification c ON i.classification_id = c.classification_id
      WHERE 1=1
    `;
    const params = [];

    // Filtros dinámicos
    if (filters.classification_id) {
      query += ` AND i.classification_id = $${params.length + 1}`;
      params.push(filters.classification_id);
    }
    if (filters.inv_make) {
      query += ` AND i.inv_make ILIKE $${params.length + 1}`;
      params.push(`%${filters.inv_make}%`);
    }
    if (filters.min_price) {
      query += ` AND i.inv_price >= $${params.length + 1}`;
      params.push(filters.min_price);
    }
    if (filters.max_price) {
      query += ` AND i.inv_price <= $${params.length + 1}`;
      params.push(filters.max_price);
    }
    if (filters.min_year) {
      query += ` AND i.inv_year >= $${params.length + 1}`;
      params.push(filters.min_year);
    }

    query += " ORDER BY i.inv_price DESC";
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error en searchVehicles:", error);
    return [];
  }
}


module.exports = {getClassifications, searchVehicles, deleteInventoryItem, updateInventory, getInventoryByClassificationId, getVehicleById, addClassification, addInventory};