const { query, get, run } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

const getPropertyTypes = async (req, res, next) => {
  try {
    const types = await query(`
      SELECT pt.*, COUNT(p.id) AS property_count
      FROM property_types pt
      LEFT JOIN properties p ON p.property_type_id = pt.id AND p.status != 'hidden'
      GROUP BY pt.id, pt.name, pt.description, pt.created_at, pt.updated_at
      ORDER BY pt.name ASC
    `);
    return sendSuccess(res, 'Property types retrieved successfully', types);
  } catch (error) {
    next(error);
  }
};

const getPropertyTypeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const type = await get('SELECT * FROM property_types WHERE id = ?', [id]);
    if (!type) {
      return sendError(res, 'Property type not found', 404);
    }
    return sendSuccess(res, 'Property type retrieved successfully', type);
  } catch (error) {
    next(error);
  }
};

const createPropertyType = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return sendError(res, 'Property type name is required', 400);
    }

    const existing = await get('SELECT id FROM property_types WHERE name = ?', [name.trim()]);
    if (existing) {
      return sendError(res, 'Property type with this name already exists', 409);
    }

    const result = await run('INSERT INTO property_types (name, description) VALUES (?, ?)', [name.trim(), description || null]);
    const newType = await get('SELECT * FROM property_types WHERE id = ?', [result.id]);
    return sendSuccess(res, 'Property type created successfully', newType, 201);
  } catch (error) {
    next(error);
  }
};

const updatePropertyType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await get('SELECT * FROM property_types WHERE id = ?', [id]);
    if (!existing) {
      return sendError(res, 'Property type not found', 404);
    }

    if (name) {
      const nameCheck = await get('SELECT id FROM property_types WHERE name = ? AND id != ?', [name.trim(), id]);
      if (nameCheck) {
        return sendError(res, 'Property type with this name already exists', 409);
      }
    }

    await run(
      'UPDATE property_types SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name ? name.trim() : existing.name, description !== undefined ? description : existing.description, id]
    );

    const updated = await get('SELECT * FROM property_types WHERE id = ?', [id]);
    return sendSuccess(res, 'Property type updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

const deletePropertyType = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if property type is referenced by properties
    const propertyCount = await get('SELECT COUNT(*) as count FROM properties WHERE property_type_id = ?', [id]);
    if (propertyCount && propertyCount.count > 0) {
      return sendError(res, `Cannot delete property type. It is referenced by ${propertyCount.count} properties.`, 400);
    }

    await run('DELETE FROM property_types WHERE id = ?', [id]);
    return sendSuccess(res, 'Property type deleted successfully', { id: parseInt(id) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPropertyTypes,
  getPropertyTypeById,
  createPropertyType,
  updatePropertyType,
  deletePropertyType
};
