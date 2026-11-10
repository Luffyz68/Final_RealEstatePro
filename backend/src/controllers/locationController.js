const { query, get, run } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

const getLocations = async (req, res, next) => {
  try {
    const locations = await query('SELECT * FROM locations ORDER BY province ASC, city ASC');
    return sendSuccess(res, 'Locations retrieved successfully', locations);
  } catch (error) {
    next(error);
  }
};

const getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const location = await get('SELECT * FROM locations WHERE id = ?', [id]);
    if (!location) {
      return sendError(res, 'Location not found', 404);
    }
    return sendSuccess(res, 'Location retrieved successfully', location);
  } catch (error) {
    next(error);
  }
};

const createLocation = async (req, res, next) => {
  try {
    const { province, city, district, commune, address, latitude, longitude } = req.body;

    if (!province || !city) {
      return sendError(res, 'Province and city are required', 400);
    }

    const result = await run(
      'INSERT INTO locations (province, city, district, commune, address, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [province.trim(), city.trim(), district || null, commune || null, address || null, latitude || null, longitude || null]
    );

    const newLoc = await get('SELECT * FROM locations WHERE id = ?', [result.id]);
    return sendSuccess(res, 'Location created successfully', newLoc, 201);
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { province, city, district, commune, address, latitude, longitude } = req.body;

    const existing = await get('SELECT * FROM locations WHERE id = ?', [id]);
    if (!existing) {
      return sendError(res, 'Location not found', 404);
    }

    await run(
      `UPDATE locations 
       SET province = ?, city = ?, district = ?, commune = ?, address = ?, latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        province ? province.trim() : existing.province,
        city ? city.trim() : existing.city,
        district !== undefined ? district : existing.district,
        commune !== undefined ? commune : existing.commune,
        address !== undefined ? address : existing.address,
        latitude !== undefined ? latitude : existing.latitude,
        longitude !== undefined ? longitude : existing.longitude,
        id
      ]
    );

    const updated = await get('SELECT * FROM locations WHERE id = ?', [id]);
    return sendSuccess(res, 'Location updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const propCount = await get('SELECT COUNT(*) as count FROM properties WHERE location_id = ?', [id]);
    if (propCount && propCount.count > 0) {
      return sendError(res, `Cannot delete location. It is associated with ${propCount.count} properties.`, 400);
    }

    await run('DELETE FROM locations WHERE id = ?', [id]);
    return sendSuccess(res, 'Location deleted successfully', { id: parseInt(id) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation
};
