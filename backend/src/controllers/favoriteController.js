const { query, get, run } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT 
        f.id as favorite_id, f.created_at as favorited_at,
        p.*, 
        pt.name as property_type_name, 
        l.province, l.city, l.district, l.commune, l.address
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      JOIN property_types pt ON p.property_type_id = pt.id
      JOIN locations l ON p.location_id = l.id
      WHERE f.user_id = ?
      ORDER BY f.id DESC
    `;
    const favorites = await query(sql, [userId]);
    return sendSuccess(res, 'Favorite properties retrieved successfully', favorites);
  } catch (error) {
    next(error);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const { property_id } = req.body;
    const userId = req.user.id;

    if (!property_id) {
      return sendError(res, 'property_id is required', 400);
    }

    const prop = await get('SELECT id FROM properties WHERE id = ?', [property_id]);
    if (!prop) {
      return sendError(res, 'Property not found', 404);
    }

    const existing = await get('SELECT id FROM favorites WHERE user_id = ? AND property_id = ?', [userId, property_id]);
    if (existing) {
      return sendError(res, 'Property is already in your favorites', 409);
    }

    const result = await run('INSERT INTO favorites (user_id, property_id) VALUES (?, ?)', [userId, property_id]);
    return sendSuccess(res, 'Property added to favorites', { id: result.id, property_id }, 201);
  } catch (error) {
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    await run('DELETE FROM favorites WHERE user_id = ? AND property_id = ?', [userId, propertyId]);
    return sendSuccess(res, 'Property removed from favorites', { propertyId: parseInt(propertyId) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite
};
