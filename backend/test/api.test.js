const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

process.env.NODE_ENV = 'test';

process.env.JWT_SECRET =
  'test-secret-that-is-more-than-thirty-two-characters';

const testDir = fs.mkdtempSync(
  path.join(os.tmpdir(), 'real-estate-api-')
);

process.env.DB_PATH = path.join(
  testDir,
  'api.db'
);

process.env.CORS_ORIGINS =
  'http://localhost:5173';


const bcrypt = require('bcryptjs');

const app = require('../src/app');
const database = require('../src/config/database');

const {
  runMigrations
} = require('../src/database/migrate');


let server;
let baseUrl;

let adminToken;
let agentToken;
let customerToken;

let propertyId;
let hiddenPropertyId;

let propertyTypeId;
let locationId;
let agentId;


const getInsertedId = (result) => {
  const id =
    result?.id ??
    result?.lastID;

  assert.ok(
    Number.isInteger(id) && id > 0,
    'Expected database insert to return a valid row ID'
  );

  return id;
};


const futureDate = (daysFromNow = 30) => {
  const date = new Date();

  date.setUTCDate(
    date.getUTCDate() + daysFromNow
  );

  return date
    .toISOString()
    .slice(0, 10);
};


const request = async (
  url,
  {
    token,
    method = 'GET',
    body,
    headers = {}
  } = {}
) => {
  const response = await fetch(
    `${baseUrl}${url}`,
    {
      method,

      headers: {
        ...(body !== undefined
          ? {
              'content-type':
                'application/json'
            }
          : {}),

        ...(token
          ? {
              authorization:
                `Bearer ${token}`
            }
          : {}),

        ...headers
      },

      ...(body !== undefined
        ? {
            body:
              JSON.stringify(body)
          }
        : {})
    }
  );

  const contentType =
    response.headers.get(
      'content-type'
    ) || '';

  let responseBody = null;

  if (
    response.status !== 204
  ) {
    if (
      contentType.includes(
        'application/json'
      )
    ) {
      responseBody =
        await response.json();
    } else {
      const text =
        await response.text();

      responseBody =
        text || null;
    }
  }

  return {
    status: response.status,
    body: responseBody,
    headers: response.headers
  };
};


const assertSuccessfulApiResponse = (
  result,
  expectedStatus,
  message
) => {
  assert.equal(
    result.status,
    expectedStatus,
    `${message}\nResponse: ${JSON.stringify(result.body)}`
  );
};



test.before(async () => {


  await runMigrations(database);

  // Clean previous customer test runner user so registration test is reproducible
  await database.run("DELETE FROM appointments WHERE user_id IN (SELECT id FROM users WHERE email = 'customer@example.com')");
  await database.run("DELETE FROM inquiries WHERE user_id IN (SELECT id FROM users WHERE email = 'customer@example.com')");
  await database.run("DELETE FROM service_requests WHERE user_id IN (SELECT id FROM users WHERE email = 'customer@example.com')");
  await database.run("DELETE FROM favorites WHERE user_id IN (SELECT id FROM users WHERE email = 'customer@example.com')");
  await database.run("DELETE FROM users WHERE email = 'customer@example.com'");

  const hashedPassword =
    await bcrypt.hash(
      'Admin123!',
      4
    );

  let admin = await database.get('SELECT id FROM users WHERE email = ?', ['admin@example.com']);
  if (!admin) {
    admin = await database.run(
      `
        INSERT INTO users (
          full_name,
          email,
          password,
          role,
          status
        )
        VALUES (?, ?, ?, 'admin', 'active')
      `,
      [
        'Admin User',
        'admin@example.com',
        hashedPassword
      ]
    );
  } else {
    await database.run('UPDATE users SET password = ?, role = ?, status = ? WHERE id = ?', [hashedPassword, 'admin', 'active', admin.id]);
  }

  let agent = await database.get('SELECT id FROM users WHERE email = ?', ['agent@example.com']);
  if (!agent) {
    agent = await database.run(
      `
        INSERT INTO users (
          full_name,
          email,
          password,
          role,
          status
        )
        VALUES (?, ?, ?, 'agent', 'active')
      `,
      [
        'Agent User',
        'agent@example.com',
        hashedPassword
      ]
    );
    agentId = getInsertedId(agent);
  } else {
    await database.run('UPDATE users SET password = ?, role = ?, status = ? WHERE id = ?', [hashedPassword, 'agent', 'active', agent.id]);
    agentId = agent.id;
  }

  let type = await database.get('SELECT id FROM property_types WHERE name = ?', ['Villa']);
  if (!type) {
    type = await database.run(
      `
        INSERT INTO property_types (
          name
        )
        VALUES (?)
      `,
      ['Villa']
    );
    propertyTypeId = getInsertedId(type);
  } else {
    propertyTypeId = type.id;
  }

  let location = await database.get('SELECT id FROM locations WHERE province = ? AND city = ?', ['Phnom Penh', 'Phnom Penh']);
  if (!location) {
    location = await database.run(
      `
        INSERT INTO locations (
          province,
          city
        )
        VALUES (?, ?)
      `,
      [
        'Phnom Penh',
        'Phnom Penh'
      ]
    );
    locationId = getInsertedId(location);
  } else {
    locationId = location.id;
  }



  const visibleProperty =
    await database.run(
      `
        INSERT INTO properties (
          title,
          price,
          property_type_id,
          listing_type,
          status,
          approval_status,
          area,
          location_id,
          agent_id
        )
        VALUES (
          ?,
          ?,
          ?,
          'sale',
          'available',
          'approved',
          ?,
          ?,
          ?
        )
      `,
      [
        'Visible Villa',
        100000,
        propertyTypeId,
        120,
        locationId,
        agentId
      ]
    );

  propertyId =
    getInsertedId(
      visibleProperty
    );



  const hiddenProperty =
    await database.run(
      `
        INSERT INTO properties (
          title,
          price,
          property_type_id,
          listing_type,
          status,
          approval_status,
          area,
          location_id,
          agent_id
        )
        VALUES (
          ?,
          ?,
          ?,
          'sale',
          'hidden',
          'approved',
          ?,
          ?,
          ?
        )
      `,
      [
        'Hidden Villa',
        120000,
        propertyTypeId,
        140,
        locationId,
        agentId
      ]
    );

  hiddenPropertyId =
    getInsertedId(
      hiddenProperty
    );



  server = app.listen(
    0,
    '127.0.0.1'
  );

  await new Promise(
    (resolve, reject) => {
      server.once(
        'listening',
        resolve
      );

      server.once(
        'error',
        reject
      );
    }
  );

  baseUrl =
    `http://127.0.0.1:${server.address().port}/api`;


  const adminLogin =
    await request(
      '/auth/login',
      {
        method: 'POST',

        body: {
          email:
            'admin@example.com',

          password:
            'Admin123!'
        }
      }
    );

  assertSuccessfulApiResponse(
    adminLogin,
    200,
    'Admin login failed during test setup'
  );

  assert.ok(
    adminLogin.body?.data?.token,
    'Admin login should return a token'
  );

  adminToken =
    adminLogin.body.data.token;

 

  const agentLogin =
    await request(
      '/auth/login',
      {
        method: 'POST',

        body: {
          email:
            'agent@example.com',

          password:
            'Admin123!'
        }
      }
    );

  assertSuccessfulApiResponse(
    agentLogin,
    200,
    'Agent login failed during test setup'
  );

  assert.ok(
    agentLogin.body?.data?.token,
    'Agent login should return a token'
  );

  agentToken =
    agentLogin.body.data.token;

 

  const registration =
    await request(
      '/auth/register',
      {
        method: 'POST',

        body: {
          full_name:
            'Customer User',

          email:
            'customer@example.com',

          password:
            'Customer123!',

          phone:
            '+85512345678'
        }
      }
    );

  assertSuccessfulApiResponse(
    registration,
    201,
    'Customer registration failed during test setup'
  );

  assert.ok(
    registration.body?.data?.token,
    'Registration should return a customer token'
  );

  customerToken =
    registration.body.data.token;
});



test.after(async () => {
  if (server) {
    await new Promise(
      (resolve) =>
        server.close(resolve)
    );
  }

  await database.close();

  fs.rmSync(
    testDir,
    {
      recursive: true,
      force: true
    }
  );
});



test(
  'public property listing excludes hidden inventory',
  async () => {
    const result =
      await request(
        '/properties?limit=100'
      );

    assert.equal(
      result.status,
      200
    );

    assert.ok(
      Array.isArray(
        result.body?.data
      )
    );

    const titles =
      result.body.data.map(
        property =>
          property.title
      );

    assert.ok(
      titles.includes(
        'Visible Villa'
      ),
      'Available property should appear publicly'
    );

    assert.ok(
      !titles.includes(
        'Hidden Villa'
      ),
      'Hidden property must not appear publicly'
    );
  }
);



test(
  'protected endpoint rejects unauthenticated requests',
  async () => {
    const result =
      await request(
        '/users'
      );

    assert.equal(
      result.status,
      401
    );
  }
);

test(
  'protected endpoint rejects invalid JWT',
  async () => {
    const result =
      await request(
        '/users',
        {
          token:
            'invalid.jwt.token'
        }
      );

    assert.equal(
      result.status,
      401
    );
  }
);

test(
  'invalid login returns a clear unauthorized response',
  async () => {
    const result =
      await request(
        '/auth/login',
        {
          method: 'POST',

          body: {
            email:
              'customer@example.com',

            password:
              'WrongPassword9!'
          }
        }
      );

    assert.equal(
      result.status,
      401
    );

    assert.equal(
      result.body?.success,
      false
    );
  }
);



test(
  'customer cannot access admin user management',
  async () => {
    const result =
      await request(
        '/users',
        {
          token:
            customerToken
        }
      );

    assert.equal(
      result.status,
      403
    );
  }
);

test(
  'agent cannot access admin user management',
  async () => {
    const result =
      await request(
        '/users',
        {
          token:
            agentToken
        }
      );

    assert.equal(
      result.status,
      403
    );
  }
);



test(
  'admin user creation validates roles',
  async () => {
    const result =
      await request(
        '/users',
        {
          token:
            adminToken,

          method:
            'POST',

          body: {
            full_name:
              'Bad Role',

            email:
              'role@example.com',

            password:
              'Secure123!',

            role:
              'owner'
          }
        }
      );

    assert.equal(
      result.status,
      400
    );

    assert.equal(
      result.body?.success,
      false
    );
  }
);



test(
  'customer can request viewing but cannot approve it',
  async () => {
    const created =
      await request(
        '/appointments',
        {
          token:
            customerToken,

          method:
            'POST',

          body: {
            property_id:
              propertyId,

            appointment_date:
              futureDate(30),

            appointment_time:
              '10:00',

            message:
              'Tour please'
          }
        }
      );

    assert.equal(
      created.status,
      201
    );

    const appointmentId =
      created.body?.data?.id;

    assert.ok(
      appointmentId,
      'Created appointment should return an ID'
    );

   
    const forbidden =
      await request(
        `/appointments/${appointmentId}`,
        {
          token:
            customerToken,

          method:
            'PUT',

          body: {
            status:
              'approved'
          }
        }
      );

    assert.equal(
      forbidden.status,
      403
    );


    const approved =
      await request(
        `/appointments/${appointmentId}`,
        {
          token:
            adminToken,

          method:
            'PUT',

          body: {
            status:
              'approved'
          }
        }
      );

    assert.equal(
      approved.status,
      200
    );

    assert.equal(
      approved.body?.data?.status,
      'approved'
    );
  }
);


test(
  'admin can create, edit, search, and delete a property',
  async () => {
  

    const created =
      await request(
        '/properties',
        {
          token:
            adminToken,

          method:
            'POST',

          body: {
            title:
              'CRUD Test Condo',

            price:
              900,

            property_type_id:
              propertyTypeId,

            listing_type:
              'rent',

            area:
              80,

            location_id:
              locationId,

            agent_id:
              agentId,

            bedrooms:
              2,

            bathrooms:
              2,

            amenities:
              'Pool, Parking'
          }
        }
      );

    assert.equal(
      created.status,
      201
    );

    const createdPropertyId =
      created.body?.data?.id;

    assert.ok(
      createdPropertyId,
      'Created property should return an ID'
    );



    const updated =
      await request(
        `/properties/${createdPropertyId}`,
        {
          token:
            adminToken,

          method:
            'PUT',

          body: {
            title:
              'Updated CRUD Condo',

            status:
              'pending'
          }
        }
      );

    assert.equal(
      updated.status,
      200
    );

    assert.equal(
      updated.body?.data?.title,
      'Updated CRUD Condo'
    );

    assert.equal(
      updated.body?.data?.status,
      'pending'
    );

 

    const searchTerm =
      encodeURIComponent(
        'Updated CRUD'
      );

    const searched =
      await request(
        `/properties?search=${searchTerm}&limit=10`,
        {
          token:
            adminToken
        }
      );

    assert.equal(
      searched.status,
      200
    );

    assert.ok(
      Array.isArray(
        searched.body?.data
      )
    );

    assert.equal(
      searched.body.data.length,
      1
    );

    assert.equal(
      searched.body.data[0].id,
      createdPropertyId
    );

 

    const removed =
      await request(
        `/properties/${createdPropertyId}`,
        {
          token:
            adminToken,

          method:
            'DELETE'
        }
      );

    assert.equal(
      removed.status,
      200
    );

   
    const deletedRow =
      await database.get(
        `
          SELECT id
          FROM properties
          WHERE id = ?
        `,
        [
          createdPropertyId
        ]
      );

    assert.equal(
      deletedRow,
      undefined
    );
  }
);



test(
  'customer inquiry can be resolved by admin',
  async () => {
    const created =
      await request(
        '/inquiries',
        {
          token:
            customerToken,

          method:
            'POST',

          body: {
            property_id:
              propertyId,

            name:
              'Customer User',

            email:
              'customer@example.com',

            phone:
              '+85512345678',

            message:
              'Please send details.'
          }
        }
      );

    assert.equal(
      created.status,
      201
    );

    const inquiryId =
      created.body?.data?.id;

    assert.ok(
      inquiryId,
      'Created inquiry should return an ID'
    );

    const resolved =
      await request(
        `/inquiries/${inquiryId}/status`,
        {
          token:
            adminToken,

          method:
            'PUT',

          body: {
            status:
              'resolved'
          }
        }
      );

    assert.equal(
      resolved.status,
      200
    );

    assert.equal(
      resolved.body?.data?.status,
      'resolved'
    );
  }
);



test(
  'customer cannot complete a service request but admin can',
  async () => {
    const created =
      await request(
        '/service-requests',
        {
          token:
            customerToken,

          method:
            'POST',

          body: {
            service_type:
              'valuation',

            description:
              'Please value this property.',

            preferred_date:
              futureDate(35)
          }
        }
      );

    assert.equal(
      created.status,
      201
    );

    const requestId =
      created.body?.data?.id;

    assert.ok(
      requestId,
      'Created service request should return an ID'
    );

  
    const forbidden =
      await request(
        `/service-requests/${requestId}`,
        {
          token:
            customerToken,

          method:
            'PUT',

          body: {
            status:
              'completed'
          }
        }
      );

    assert.equal(
      forbidden.status,
      403
    );

 

    const completed =
      await request(
        `/service-requests/${requestId}`,
        {
          token:
            adminToken,

          method:
            'PUT',

          body: {
            status:
              'completed'
          }
        }
      );

    assert.equal(
      completed.status,
      200
    );

    assert.equal(
      completed.body?.data?.status,
      'completed'
    );
  }
);



test(
  'admin dashboard returns live statistics and chart datasets',
  async () => {
    const result =
      await request(
        '/dashboard/stats',
        {
          token:
            adminToken
        }
      );

    assert.equal(
      result.status,
      200
    );

    assert.ok(
      result.body?.data?.stats,
      'Dashboard response should contain stats'
    );

    assert.ok(
      result.body?.data?.charts,
      'Dashboard response should contain charts'
    );

    assert.ok(
      Array.isArray(
        result.body.data.charts.propertyByType
      )
    );

    assert.ok(
      Array.isArray(
        result.body.data.charts.listingBreakdown
      )
    );

    assert.ok(
      result.body.data.stats.totalProperties >= 2
    );
  }
);

test(
  'hidden properties remain excluded from anonymous listings',
  async () => {
    const result =
      await request(
        '/properties?limit=100'
      );

    assert.equal(
      result.status,
      200
    );

    const hidden =
      result.body.data.find(
        property =>
          property.id === hiddenPropertyId
      );

    assert.equal(
      hidden,
      undefined
    );
  }
);