const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeEmail,
  parsePositiveInt,
  parsePagination,
  requireEnum,
  validatePassword,
  validatePropertyInput
} = require('../src/utils/validation');

const {
  canManageAppointment,
  canEditServiceRequest
} = require('../src/utils/accessPolicies');

/* =========================================================
   EMAIL VALIDATION
========================================================= */

test('normalizeEmail trims and lowercases valid email addresses', () => {
  assert.equal(
    normalizeEmail('  USER@Example.COM  '),
    'user@example.com'
  );
});

test('normalizeEmail rejects malformed email addresses', () => {
  const invalidEmails = [
    '',
    'wrong-address',
    '@example.com',
    'user@',
    'user example@example.com',
    null,
    undefined
  ];

  for (const email of invalidEmails) {
    assert.throws(
      () => normalizeEmail(email),
      /email/i
    );
  }
});

/* =========================================================
   POSITIVE INTEGER VALIDATION
========================================================= */

test('parsePositiveInt parses valid positive integer values', () => {
  assert.equal(parsePositiveInt('7', 'id'), 7);
  assert.equal(parsePositiveInt(10, 'id'), 10);
  assert.equal(parsePositiveInt('1', 'property_id'), 1);
});

test('parsePositiveInt rejects invalid values', () => {
  const invalidValues = [
    0,
    '0',
    -1,
    '-5',
    'abc',
    '',
    null,
    undefined,
    '1.5'
  ];

  for (const value of invalidValues) {
    assert.throws(
      () => parsePositiveInt(value, 'id'),
      /positive integer/i
    );
  }
});

/* =========================================================
   PAGINATION
========================================================= */

test('parsePagination returns correct pagination values', () => {
  assert.deepEqual(
    parsePagination({
      page: '2',
      limit: '20'
    }),
    {
      page: 2,
      limit: 20,
      offset: 20
    }
  );
});

test('parsePagination falls back safely for invalid page values', () => {
  assert.deepEqual(
    parsePagination({
      page: '-5',
      limit: '20'
    }),
    {
      page: 1,
      limit: 20,
      offset: 0
    }
  );
});

test('parsePagination limits maximum page size', () => {
  assert.deepEqual(
    parsePagination({
      page: '1',
      limit: '500'
    }),
    {
      page: 1,
      limit: 100,
      offset: 0
    }
  );
});

test('parsePagination handles missing query parameters', () => {
  const result = parsePagination({});

  assert.equal(result.page, 1);
  assert.ok(result.limit > 0);
  assert.equal(result.offset, 0);
});

/* =========================================================
   ENUM VALIDATION
========================================================= */

test('requireEnum normalizes valid enum values', () => {
  assert.equal(
    requireEnum(
      'APPROVED',
      ['pending', 'approved'],
      'status'
    ),
    'approved'
  );
});

test('requireEnum rejects unsupported values', () => {
  assert.throws(
    () =>
      requireEnum(
        'owner',
        ['admin', 'customer'],
        'role'
      ),
    /role/i
  );
});

test('requireEnum rejects empty values', () => {
  assert.throws(
    () =>
      requireEnum(
        '',
        ['pending', 'approved'],
        'status'
      ),
    /status/i
  );
});

/* =========================================================
   PASSWORD VALIDATION
========================================================= */

test('validatePassword accepts a strong password', () => {
  assert.doesNotThrow(() =>
    validatePassword('Secure123!')
  );
});

test('validatePassword rejects password without uppercase letter', () => {
  assert.throws(
    () => validatePassword('secure123!'),
    /uppercase/i
  );
});

test('validatePassword rejects password without lowercase letter', () => {
  assert.throws(
    () => validatePassword('SECURE123!'),
    /lowercase/i
  );
});

test('validatePassword rejects password without number', () => {
  assert.throws(
    () => validatePassword('SecurePass!'),
    /number|digit/i
  );
});

test('validatePassword rejects password without special character', () => {
  assert.throws(
    () => validatePassword('Secure123'),
    /special/i
  );
});

test('validatePassword rejects password that is too short', () => {
  assert.throws(
    () => validatePassword('Sec1!'),
    /length|characters/i
  );
});

/* =========================================================
   PROPERTY VALIDATION
========================================================= */

const validProperty = {
  title: 'Modern Villa',
  description: 'Beautiful modern property',
  price: 250000,
  property_type_id: 1,
  listing_type: 'sale',
  area: 150,
  location_id: 2,
  bedrooms: 3,
  bathrooms: 2
};

test('validatePropertyInput accepts valid property data', () => {
  assert.doesNotThrow(() =>
    validatePropertyInput(validProperty, {
      partial: false
    })
  );
});

test('validatePropertyInput rejects negative price', () => {
  assert.throws(
    () =>
      validatePropertyInput(
        {
          ...validProperty,
          price: -1
        },
        {
          partial: false
        }
      ),
    /price/i
  );
});

test('validatePropertyInput rejects invalid property area', () => {
  assert.throws(
    () =>
      validatePropertyInput(
        {
          ...validProperty,
          area: -100
        },
        {
          partial: false
        }
      ),
    /area/i
  );
});

test('validatePropertyInput rejects unsupported listing type', () => {
  assert.throws(
    () =>
      validatePropertyInput(
        {
          ...validProperty,
          listing_type: 'borrow'
        },
        {
          partial: false
        }
      ),
    /listing/i
  );
});

test('validatePropertyInput rejects missing required fields on create', () => {
  assert.throws(
    () =>
      validatePropertyInput(
        {
          title: 'House'
        },
        {
          partial: false
        }
      )
  );
});

test('validatePropertyInput allows valid partial updates', () => {
  assert.doesNotThrow(() =>
    validatePropertyInput(
      {
        price: 300000
      },
      {
        partial: true
      }
    )
  );
});

test('validatePropertyInput still validates provided partial fields', () => {
  assert.throws(
    () =>
      validatePropertyInput(
        {
          price: -100
        },
        {
          partial: true
        }
      ),
    /price/i
  );
});

/* =========================================================
   APPOINTMENT ACCESS POLICY
========================================================= */

test('customer can cancel their own pending appointment', () => {
  const appointment = {
    user_id: 8,
    agent_id: 2,
    status: 'pending'
  };

  assert.equal(
    canManageAppointment(
      {
        id: 8,
        role: 'customer'
      },
      appointment,
      'cancelled'
    ),
    true
  );
});

test('customer cannot approve their own appointment', () => {
  const appointment = {
    user_id: 8,
    agent_id: 2,
    status: 'pending'
  };

  assert.equal(
    canManageAppointment(
      {
        id: 8,
        role: 'customer'
      },
      appointment,
      'approved'
    ),
    false
  );
});

test('customer cannot manage another customer appointment', () => {
  const appointment = {
    user_id: 8,
    agent_id: 2,
    status: 'pending'
  };

  assert.equal(
    canManageAppointment(
      {
        id: 9,
        role: 'customer'
      },
      appointment,
      'cancelled'
    ),
    false
  );
});

test('assigned agent can approve appointment', () => {
  const appointment = {
    user_id: 8,
    agent_id: 2,
    status: 'pending'
  };

  assert.equal(
    canManageAppointment(
      {
        id: 2,
        role: 'agent'
      },
      appointment,
      'approved'
    ),
    true
  );
});

test('unassigned agent cannot manage appointment', () => {
  const appointment = {
    user_id: 8,
    agent_id: 2,
    status: 'pending'
  };

  assert.equal(
    canManageAppointment(
      {
        id: 3,
        role: 'agent'
      },
      appointment,
      'approved'
    ),
    false
  );
});

test('admin can manage appointments', () => {
  const appointment = {
    user_id: 8,
    agent_id: 2,
    status: 'pending'
  };

  assert.equal(
    canManageAppointment(
      {
        id: 1,
        role: 'admin'
      },
      appointment,
      'completed'
    ),
    true
  );
});

/* =========================================================
   SERVICE REQUEST ACCESS POLICY
========================================================= */

test('customer can edit their own pending service request', () => {
  assert.equal(
    canEditServiceRequest(
      {
        id: 5,
        role: 'customer'
      },
      {
        user_id: 5,
        status: 'pending'
      }
    ),
    true
  );
});

test('customer cannot edit completed service request', () => {
  assert.equal(
    canEditServiceRequest(
      {
        id: 5,
        role: 'customer'
      },
      {
        user_id: 5,
        status: 'completed'
      }
    ),
    false
  );
});

test('customer cannot edit another users service request', () => {
  assert.equal(
    canEditServiceRequest(
      {
        id: 6,
        role: 'customer'
      },
      {
        user_id: 5,
        status: 'pending'
      }
    ),
    false
  );
});

test('admin can edit service requests', () => {
  assert.equal(
    canEditServiceRequest(
      {
        id: 1,
        role: 'admin'
      },
      {
        user_id: 5,
        status: 'pending'
      }
    ),
    true
  );
});