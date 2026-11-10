const { get, query } = require('../config/database');
const { sendSuccess } = require('../utils/response');

const getDashboardStats = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let stats = {};
    let recentProperties = [];
    let recentInquiries = [];
    let recentAppointments = [];
    let recentServiceRequests = [];
    let charts = { propertyByType: [], listingBreakdown: [], monthlyInquiries: [], monthlyAppointments: [] };

    if (userRole === 'admin') {
      const uCount = await get('SELECT COUNT(*) as count FROM users');
      const cCount = await get("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
      const aCount = await get("SELECT COUNT(*) as count FROM users WHERE role = 'agent'");
      const pCount = await get('SELECT COUNT(*) as count FROM properties');
      const availCount = await get("SELECT COUNT(*) as count FROM properties WHERE LOWER(status) = 'available'");
      const soldCount = await get("SELECT COUNT(*) as count FROM properties WHERE LOWER(status) = 'sold'");
      const rentedCount = await get("SELECT COUNT(*) as count FROM properties WHERE LOWER(status) = 'rented'");
      const inqCount = await get("SELECT COUNT(*) as count FROM inquiries WHERE LOWER(status) = 'pending'");
      const apptCount = await get("SELECT COUNT(*) as count FROM appointments WHERE LOWER(status) = 'pending'");
      const srCount = await get("SELECT COUNT(*) as count FROM service_requests WHERE LOWER(status) = 'pending'");
      const agentReqCount = await get("SELECT COUNT(*) as count FROM agent_requests WHERE status = 'pending'");
      const pendingPropsCount = await get("SELECT COUNT(*) as count FROM properties WHERE approval_status = 'pending'");

      stats = {
        totalUsers: uCount ? uCount.count : 0,
        totalCustomers: cCount ? cCount.count : 0,
        totalAgents: aCount ? aCount.count : 0,
        totalProperties: pCount ? pCount.count : 0,
        availableProperties: availCount ? availCount.count : 0,
        soldProperties: soldCount ? soldCount.count : 0,
        rentedProperties: rentedCount ? rentedCount.count : 0,
        pendingInquiries: inqCount ? inqCount.count : 0,
        pendingAppointments: apptCount ? apptCount.count : 0,
        pendingServiceRequests: srCount ? srCount.count : 0,
        pendingAgentRequests: agentReqCount ? agentReqCount.count : 0,
        pendingProperties: pendingPropsCount ? pendingPropsCount.count : 0
      };

      recentProperties = await query("SELECT id, title, price, listing_type, status, main_image, created_at FROM properties WHERE approval_status = 'pending' ORDER BY id DESC LIMIT 5");
      recentInquiries = await query(`
        SELECT i.id, i.name, i.email, i.status, i.created_at, p.title as property_title 
        FROM inquiries i 
        JOIN properties p ON i.property_id = p.id 
        ORDER BY i.id DESC LIMIT 5
      `);
      recentAppointments = await query(`
        SELECT a.id, a.appointment_date, a.appointment_time, a.status, p.title as property_title, u.full_name as customer_name
        FROM appointments a
        JOIN properties p ON a.property_id = p.id
        JOIN users u ON a.user_id = u.id
        ORDER BY a.id DESC LIMIT 5
      `);
      recentServiceRequests = await query(`
        SELECT sr.id, sr.service_type, sr.status, sr.created_at, u.full_name AS customer_name, p.title AS property_title
        FROM service_requests sr JOIN users u ON sr.user_id = u.id
        LEFT JOIN properties p ON sr.property_id = p.id ORDER BY sr.id DESC LIMIT 5
      `);
      const recentAgentRequests = await query(`
        SELECT ar.*, u.full_name, u.email 
        FROM agent_requests ar 
        JOIN users u ON ar.user_id = u.id 
        WHERE ar.status = 'pending'
        ORDER BY ar.id DESC LIMIT 5
      `);
      stats.recentAgentRequests = recentAgentRequests || [];

      charts.propertyByType = await query(`
        SELECT pt.name AS label, COUNT(p.id) AS value FROM property_types pt
        LEFT JOIN properties p ON p.property_type_id = pt.id GROUP BY pt.name ORDER BY value DESC
      `);
      charts.listingBreakdown = await query(`SELECT listing_type AS label, COUNT(*) AS value FROM properties GROUP BY listing_type`);
      charts.monthlyInquiries = await query(`
        SELECT to_char(created_at, 'YYYY-MM') AS label, COUNT(*) AS value FROM inquiries
        WHERE created_at >= (CURRENT_TIMESTAMP - INTERVAL '5 months') GROUP BY label ORDER BY label
      `);
      charts.monthlyAppointments = await query(`
        SELECT to_char(created_at, 'YYYY-MM') AS label, COUNT(*) AS value FROM appointments
        WHERE created_at >= (CURRENT_TIMESTAMP - INTERVAL '5 months') GROUP BY label ORDER BY label
      `);
    } else if (userRole === 'agent') {
      const pCount = await get('SELECT COUNT(*) as count FROM properties WHERE agent_id = ?', [userId]);
      const availCount = await get("SELECT COUNT(*) as count FROM properties WHERE agent_id = ? AND LOWER(status) = 'available'", [userId]);
      const soldCount = await get("SELECT COUNT(*) as count FROM properties WHERE agent_id = ? AND LOWER(status) = 'sold'", [userId]);
      const rentedCount = await get("SELECT COUNT(*) as count FROM properties WHERE agent_id = ? AND LOWER(status) = 'rented'", [userId]);
      const inqCount = await get(`
        SELECT COUNT(*) as count 
        FROM inquiries i 
        JOIN properties p ON i.property_id = p.id 
        WHERE p.agent_id = ? AND LOWER(i.status) = 'pending'
      `, [userId]);
      const apptCount = await get("SELECT COUNT(*) as count FROM appointments WHERE agent_id = ? AND LOWER(status) = 'pending'", [userId]);

      stats = {
        totalProperties: pCount ? pCount.count : 0,
        availableProperties: availCount ? availCount.count : 0,
        soldProperties: soldCount ? soldCount.count : 0,
        rentedProperties: rentedCount ? rentedCount.count : 0,
        pendingInquiries: inqCount ? inqCount.count : 0,
        pendingAppointments: apptCount ? apptCount.count : 0
      };

      recentProperties = await query('SELECT id, title, price, listing_type, status, main_image, created_at FROM properties WHERE agent_id = ? ORDER BY id DESC LIMIT 5', [userId]);
      recentInquiries = await query(`
        SELECT i.id, i.name, i.email, i.status, i.created_at, p.title as property_title 
        FROM inquiries i 
        JOIN properties p ON i.property_id = p.id 
        WHERE p.agent_id = ?
        ORDER BY i.id DESC LIMIT 5
      `, [userId]);
      recentAppointments = await query(`
        SELECT a.id, a.appointment_date, a.appointment_time, a.status, p.title as property_title, u.full_name as customer_name
        FROM appointments a
        JOIN properties p ON a.property_id = p.id
        JOIN users u ON a.user_id = u.id
        WHERE a.agent_id = ?
        ORDER BY a.id DESC LIMIT 5
      `, [userId]);
    } else {
      // Customer Stats
      const favCount = await get('SELECT COUNT(*) as count FROM favorites WHERE user_id = ?', [userId]);
      const inqCount = await get('SELECT COUNT(*) as count FROM inquiries WHERE user_id = ?', [userId]);
      const apptCount = await get('SELECT COUNT(*) as count FROM appointments WHERE user_id = ?', [userId]);
      const srCount = await get('SELECT COUNT(*) as count FROM service_requests WHERE user_id = ?', [userId]);

      stats = {
        totalFavorites: favCount ? favCount.count : 0,
        totalInquiries: inqCount ? inqCount.count : 0,
        totalAppointments: apptCount ? apptCount.count : 0,
        totalServiceRequests: srCount ? srCount.count : 0
      };
    }

    return sendSuccess(res, 'Dashboard statistics retrieved successfully', {
      stats,
      recentProperties,
      recentInquiries,
      recentAppointments,
      recentServiceRequests,
      charts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
