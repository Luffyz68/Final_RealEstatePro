const { query, get, run } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');
const path = require('path');
const fs = require('fs');
const { validatePropertyInput, parsePagination, parsePositiveInt, safeParseInt, safeParseFloat } = require('../utils/validation');

const getProperties = async (req, res, next) => {
  try {
    const {
      search,
      property_type_id,
      property_type,
      listing_type,
      status,
      location_id,
      city,
      province,
      min_price,
      max_price,
      min_bedrooms,
      max_bedrooms,
      min_bathrooms,
      max_bathrooms,
      min_area,
      max_area,
      agent_id,
      page = 1,
      limit = 10,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const pagination = parsePagination({ page, limit });
    const offset = pagination.offset;
    let where = [];
    let params = [];

    const isAdmin = req.user && req.user.role === 'admin';
    const isAgent = req.user && req.user.role === 'agent';

    if (!isAdmin && !isAgent) {
      where.push("p.status != 'hidden'");
      where.push("p.approval_status = 'approved'");
    } else if (isAgent) {
      where.push(`(p.agent_id = ? OR (p.status != 'hidden' AND p.approval_status = 'approved'))`);
      params.push(req.user.id);
    }

    if (search) {
      where.push('(p.title ILIKE ? OR p.description ILIKE ? OR l.address ILIKE ? OR l.city ILIKE ? OR l.province ILIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    const parsedTypeId = safeParseInt(property_type_id);
    if (parsedTypeId !== null) {
      where.push('p.property_type_id = ?');
      params.push(parsedTypeId);
    } else if (property_type) {
      where.push('pt.name ILIKE ?');
      params.push(`%${property_type}%`);
    }

    if (listing_type) {
      where.push('LOWER(p.listing_type) = LOWER(?)');
      params.push(listing_type);
    }

    if (status) {
      where.push('LOWER(p.status) = LOWER(?)');
      params.push(status);
    }

    const parsedLocId = safeParseInt(location_id);
    if (parsedLocId !== null) {
      where.push('p.location_id = ?');
      params.push(parsedLocId);
    }
    if (city) {
      where.push('l.city ILIKE ?');
      params.push(`%${city}%`);
    }
    if (province) {
      where.push('l.province ILIKE ?');
      params.push(`%${province}%`);
    }

    const parsedMinPrice = safeParseFloat(min_price);
    if (parsedMinPrice !== null) {
      where.push('p.price >= ?');
      params.push(parsedMinPrice);
    }
    const parsedMaxPrice = safeParseFloat(max_price);
    if (parsedMaxPrice !== null) {
      where.push('p.price <= ?');
      params.push(parsedMaxPrice);
    }

    const parsedMinBeds = safeParseInt(min_bedrooms);
    if (parsedMinBeds !== null) {
      where.push('p.bedrooms >= ?');
      params.push(parsedMinBeds);
    }
    const parsedMaxBeds = safeParseInt(max_bedrooms);
    if (parsedMaxBeds !== null) {
      where.push('p.bedrooms <= ?');
      params.push(parsedMaxBeds);
    }

    const parsedMinBaths = safeParseInt(min_bathrooms);
    if (parsedMinBaths !== null) {
      where.push('p.bathrooms >= ?');
      params.push(parsedMinBaths);
    }
    const parsedMaxBaths = safeParseInt(max_bathrooms);
    if (parsedMaxBaths !== null) {
      where.push('p.bathrooms <= ?');
      params.push(parsedMaxBaths);
    }

    const parsedMinArea = safeParseFloat(min_area);
    if (parsedMinArea !== null) {
      where.push('p.area >= ?');
      params.push(parsedMinArea);
    }
    const parsedMaxArea = safeParseFloat(max_area);
    if (parsedMaxArea !== null) {
      where.push('p.area <= ?');
      params.push(parsedMaxArea);
    }

    const parsedAgentId = safeParseInt(agent_id);
    if (parsedAgentId !== null) {
      where.push('p.agent_id = ?');
      params.push(parsedAgentId);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as total 
      FROM properties p
      JOIN property_types pt ON p.property_type_id = pt.id
      JOIN locations l ON p.location_id = l.id
      JOIN users u ON p.agent_id = u.id
      ${whereClause}
    `;
    const countRes = await get(countSql, params);
    const total = countRes ? countRes.total : 0;

    const validSortFields = ['price', 'created_at', 'bedrooms', 'bathrooms', 'area', 'title'];
    const sortField = validSortFields.includes(sort) ? `p.${sort}` : 'p.created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const sql = `
      SELECT 
        p.*, 
        pt.name as property_type_name, 
        l.province, l.city, l.district, l.commune, l.address, l.latitude, l.longitude,
        u.full_name as agent_name, u.email as agent_email, u.phone as agent_phone, u.profile_image as agent_image
      FROM properties p
      JOIN property_types pt ON p.property_type_id = pt.id
      JOIN locations l ON p.location_id = l.id
      JOIN users u ON p.agent_id = u.id
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const properties = await query(sql, [...params, pagination.limit, offset]);

    return sendSuccess(res, 'Properties retrieved successfully', properties, 200, {
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        p.*, 
        pt.name as property_type_name, pt.description as property_type_description,
        l.province, l.city, l.district, l.commune, l.address, l.latitude, l.longitude,
        u.full_name as agent_name, u.email as agent_email, u.phone as agent_phone, u.profile_image as agent_image
      FROM properties p
      JOIN property_types pt ON p.property_type_id = pt.id
      JOIN locations l ON p.location_id = l.id
      JOIN users u ON p.agent_id = u.id
      WHERE p.id = ?
    `;

    const property = await get(sql, [id]);
    if (!property) {
      return sendError(res, 'Property not found', 404);
    }
    if (property.status === 'hidden' && (!req.user || (req.user.role !== 'admin' && Number(property.agent_id) !== Number(req.user.id)))) {
      return sendError(res, 'Property not found', 404);
    }

    const images = await query('SELECT * FROM property_images WHERE property_id = ? ORDER BY id ASC', [id]);
    property.images = images;

    return sendSuccess(res, 'Property details retrieved successfully', property);
  } catch (error) {
    next(error);
  }
};

const createProperty = async (req, res, next) => {
  try {
    const input = validatePropertyInput({ status: 'available', bedrooms: 0, bathrooms: 0, area_unit: 'sqm', featured: 0, ...req.body });

    const type = await get('SELECT id FROM property_types WHERE id = ?', [input.property_type_id]);
    const location = await get('SELECT id FROM locations WHERE id = ?', [input.location_id]);
    if (!type || !location) return sendError(res, 'Selected property type or location does not exist', 400);

    // Determine agent ID
    let finalAgentId = req.user.id;
    if (req.user.role === 'admin' && input.agent_id) {
      finalAgentId = input.agent_id;
    }
    const agent = await get("SELECT id FROM users WHERE id = ? AND role IN ('agent','admin') AND status = 'active'", [finalAgentId]);
    if (!agent) return sendError(res, 'Selected agent is not active or does not exist', 400);

    const result = await run(
      `INSERT INTO properties 
       (title, description, price, property_type_id, listing_type, status, bedrooms, bathrooms, area, area_unit, location_id, agent_id, main_image, amenities, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.title, input.description, input.price, input.property_type_id,
        input.listing_type, input.status, input.bedrooms, input.bathrooms,
        input.area, input.area_unit, input.location_id, finalAgentId, input.main_image, input.amenities, input.featured
      ]
    );

    const newProp = await get('SELECT * FROM properties WHERE id = ?', [result.id]);
    return sendSuccess(res, 'Property created successfully', newProp, 201);
  } catch (error) {
    next(error);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await get('SELECT * FROM properties WHERE id = ?', [id]);

    if (!property) {
      return sendError(res, 'Property not found', 404);
    }

    // Authorization check: Agents can only update their own property
    if (req.user.role === 'agent' && property.agent_id !== req.user.id) {
      return sendError(res, 'Access forbidden. You can only update your own properties.', 403);
    }

    const input = validatePropertyInput(req.body, { partial: true });

    let updateFields = [];
    let params = [];

    const fields = ['title', 'description', 'price', 'property_type_id', 'listing_type', 'status', 'bedrooms', 'bathrooms', 'area', 'area_unit', 'location_id', 'main_image', 'amenities', 'featured'];
    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(input, field)) { updateFields.push(`${field} = ?`); params.push(input[field]); }
    }
    if (input.agent_id && req.user.role === 'admin') { updateFields.push('agent_id = ?'); params.push(input.agent_id); }

    if (updateFields.length === 0) {
      return sendError(res, 'No fields provided for update', 400);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await run(`UPDATE properties SET ${updateFields.join(', ')} WHERE id = ?`, params);

    const updated = await get('SELECT * FROM properties WHERE id = ?', [id]);
    return sendSuccess(res, 'Property updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id, 'Property ID');
    const property = await get('SELECT * FROM properties WHERE id = ?', [id]);

    if (!property) {
      return sendError(res, 'Property not found', 404);
    }

    if (req.user.role === 'agent' && property.agent_id !== req.user.id) {
      return sendError(res, 'Access forbidden. You can only delete your own properties.', 403);
    }

    const images = await query('SELECT image_url FROM property_images WHERE property_id = ?', [id]);
    await run('DELETE FROM properties WHERE id = ?', [id]);
    for (const image of images) removeLocalUpload(image.image_url);
    return sendSuccess(res, 'Property deleted successfully', { id: parseInt(id) });
  } catch (error) {
    next(error);
  }
};

// Image Upload Handling
const uploadPropertyImages = async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id, 'Property ID');
    const property = await get('SELECT * FROM properties WHERE id = ?', [id]);

    if (!property) {
      cleanupRequestFiles(req.files);
      return sendError(res, 'Property not found', 404);
    }

    if (req.user.role === 'agent' && property.agent_id !== req.user.id) {
      cleanupRequestFiles(req.files);
      return sendError(res, 'Access forbidden. You can only upload images for your own properties.', 403);
    }

    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No images uploaded', 400);
    }

    const host = `${req.protocol}://${req.get('host')}`;
    const uploadedImages = [];

    for (const file of req.files) {
      const imageUrl = `${host}/uploads/properties/${file.filename}`;
      const res = await run('INSERT INTO property_images (property_id, image_url) VALUES (?, ?)', [id, imageUrl]);
      uploadedImages.push({ id: res.id, property_id: parseInt(id), image_url: imageUrl });
    }

    // Set main image if not currently set
    if (!property.main_image && uploadedImages.length > 0) {
      await run('UPDATE properties SET main_image = ? WHERE id = ?', [uploadedImages[0].image_url, id]);
    }

    return sendSuccess(res, 'Property images uploaded successfully', uploadedImages, 201);
  } catch (error) {
    next(error);
  }
};

const getPropertyImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await get('SELECT id, status, agent_id FROM properties WHERE id = ?', [id]);
    if (!property || (property.status === 'hidden' && (!req.user || (req.user.role !== 'admin' && Number(req.user.id) !== Number(property.agent_id))))) return sendError(res, 'Property not found', 404);
    const images = await query('SELECT * FROM property_images WHERE property_id = ? ORDER BY id ASC', [id]);
    return sendSuccess(res, 'Property images retrieved successfully', images);
  } catch (error) {
    next(error);
  }
};

const deletePropertyImage = async (req, res, next) => {
  try {
    const imageId = parsePositiveInt(req.params.imageId, 'Image ID');
    const img = await get('SELECT * FROM property_images WHERE id = ?', [imageId]);

    if (!img) {
      return sendError(res, 'Image not found', 404);
    }

    const property = await get('SELECT * FROM properties WHERE id = ?', [img.property_id]);
    if (req.user.role === 'agent' && property.agent_id !== req.user.id) {
      return sendError(res, 'Access forbidden. You can only delete images for your own properties.', 403);
    }

    await run('DELETE FROM property_images WHERE id = ?', [imageId]);
    removeLocalUpload(img.image_url);
    if (property.main_image === img.image_url) {
      const replacement = await get('SELECT image_url FROM property_images WHERE property_id = ? ORDER BY id LIMIT 1', [property.id]);
      await run('UPDATE properties SET main_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [replacement ? replacement.image_url : null, property.id]);
    }
    return sendSuccess(res, 'Image deleted successfully', { id: parseInt(imageId) });
  } catch (error) {
    next(error);
  }
};

const removeLocalUpload = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('/uploads/properties/')) return;
  const filename = path.basename(new URL(imageUrl, 'http://localhost').pathname);
  const target = path.join(__dirname, '../../uploads/properties', filename);
  fs.unlink(target, () => {});
};

const cleanupRequestFiles = (files = []) => files.forEach((file) => fs.unlink(file.path, () => {}));

const approveProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approval_status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(approval_status)) {
      return sendError(res, 'Invalid approval status', 400);
    }

    const property = await get('SELECT id FROM properties WHERE id = ?', [id]);
    if (!property) {
      return sendError(res, 'Property not found', 404);
    }

    await run('UPDATE properties SET approval_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [approval_status, id]);
    const updated = await get('SELECT * FROM properties WHERE id = ?', [id]);
    
    return sendSuccess(res, `Property approval status updated to ${approval_status}`, updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  getPropertyImages,
  deletePropertyImage,
  approveProperty
};
