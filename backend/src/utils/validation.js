class ValidationError extends Error {
  constructor(message, errors = null) {
    super(message);

    this.name = 'ValidationError';
    this.status = 400;
    this.errors = errors;

    Error.captureStackTrace?.(
      this,
      ValidationError
    );
  }
}



const normalizeText = (
  value,
  field = 'Value',
  {
    required = false,
    max = 5000,
    min = 0
  } = {}
) => {
  if (
    value === undefined ||
    value === null
  ) {
    if (required) {
      throw new ValidationError(
        `${field} is required`
      );
    }

    return null;
  }

  const result =
    String(value).trim();

  if (
    required &&
    result.length === 0
  ) {
    throw new ValidationError(
      `${field} is required`
    );
  }

  if (
    result.length > 0 &&
    result.length < min
  ) {
    throw new ValidationError(
      `${field} must be at least ${min} characters`
    );
  }

  if (
    result.length > max
  ) {
    throw new ValidationError(
      `${field} must not exceed ${max} characters`
    );
  }

  return result || null;
};



const normalizeEmail = (value) => {
  const email = normalizeText(
    value,
    'Email',
    {
      required: true,
      max: 254
    }
  ).toLowerCase();

 
  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (
    !emailPattern.test(email)
  ) {
    throw new ValidationError(
      'Please provide a valid email address'
    );
  }

  return email;
};



const parsePositiveInt = (
  value,
  field = 'Value',
  {
    allowZero = false
  } = {}
) => {
  

  if (
    value === undefined ||
    value === null ||
    (
      typeof value === 'string' &&
      value.trim() === ''
    )
  ) {
    throw new ValidationError(
      `${field} must be a ${allowZero ? 'non-negative' : 'positive'} integer`
    );
  }

  const normalized =
    typeof value === 'string'
      ? value.trim()
      : value;

  const number =
    Number(normalized);

  const minimum =
    allowZero ? 0 : 1;

  if (
    !Number.isSafeInteger(number) ||
    number < minimum
  ) {
    throw new ValidationError(
      `${field} must be a ${allowZero ? 'non-negative' : 'positive'} integer`
    );
  }

  return number;
};



const parseNonNegativeNumber = (
  value,
  field = 'Value',
  {
    positive = false,
    max = Number.MAX_SAFE_INTEGER
  } = {}
) => {
  if (
    value === undefined ||
    value === null ||
    (
      typeof value === 'string' &&
      value.trim() === ''
    )
  ) {
    throw new ValidationError(
      `${field} must be ${
        positive
          ? 'greater than zero'
          : 'zero or greater'
      }`
    );
  }

  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0 ||
    (
      positive &&
      number <= 0
    ) ||
    number > max
  ) {
    throw new ValidationError(
      `${field} must be ${
        positive
          ? 'greater than zero'
          : 'zero or greater'
      }`
    );
  }

  return number;
};



const parsePagination = (
  {
    page = 1,
    limit = 10
  } = {}
) => {

  const parsedPage =
    Number(page);

  const parsedLimit =
    Number(limit);

  const normalizedPage =
    Number.isSafeInteger(parsedPage) &&
    parsedPage > 0
      ? parsedPage
      : 1;

  const normalizedLimit =
    Number.isSafeInteger(parsedLimit) &&
    parsedLimit > 0
      ? Math.min(
          parsedLimit,
          100
        )
      : 10;

  return {
    page: normalizedPage,

    limit:
      normalizedLimit,

    offset:
      (
        normalizedPage -
        1
      ) *
      normalizedLimit
  };
};



const requireEnum = (
  value,
  allowed,
  field = 'Value'
) => {
  if (
    !Array.isArray(allowed) ||
    allowed.length === 0
  ) {
    throw new Error(
      'Allowed enum values must be a non-empty array'
    );
  }

  const normalized =
    String(
      value ?? ''
    )
      .trim()
      .toLowerCase();

  const normalizedAllowed =
    allowed.map(
      item =>
        String(item)
          .trim()
          .toLowerCase()
    );

  if (
    !normalizedAllowed.includes(
      normalized
    )
  ) {
    throw new ValidationError(
      `${field} must be one of: ${allowed.join(', ')}`
    );
  }

  return normalized;
};



const parseBoolean = (
  value,
  field = 'Value'
) => {
  if (
    value === true ||
    value === 1 ||
    value === '1' ||
    value === 'true'
  ) {
    return true;
  }

  if (
    value === false ||
    value === 0 ||
    value === '0' ||
    value === 'false'
  ) {
    return false;
  }

  throw new ValidationError(
    `${field} must be true or false`
  );
};



const validatePassword = (
  password
) => {
  if (
    typeof password !== 'string'
  ) {
    throw new ValidationError(
      'Password must be a string'
    );
  }

  if (
    password.length < 8
  ) {
    throw new ValidationError(
      'Password must be at least 8 characters'
    );
  }

  if (
    password.length > 128
  ) {
    throw new ValidationError(
      'Password must not exceed 128 characters'
    );
  }

  if (
    !/[A-Z]/.test(password)
  ) {
    throw new ValidationError(
      'Password must include an uppercase letter'
    );
  }

  if (
    !/[a-z]/.test(password)
  ) {
    throw new ValidationError(
      'Password must include a lowercase letter'
    );
  }

  if (
    !/\d/.test(password)
  ) {
    throw new ValidationError(
      'Password must include a number'
    );
  }

  if (
    !/[^A-Za-z0-9]/.test(
      password
    )
  ) {
    throw new ValidationError(
      'Password must include a special character'
    );
  }

  return password;
};



const validateIsoDate = (
  value,
  field = 'Date'
) => {
  const date =
    normalizeText(
      value,
      field,
      {
        required: true,
        max: 10
      }
    );

  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      date
    );

  if (!match) {
    throw new ValidationError(
      `${field} must use YYYY-MM-DD format`
    );
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);

  const parsed =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

 
  const valid =
    parsed.getUTCFullYear() ===
      year &&
    parsed.getUTCMonth() ===
      month - 1 &&
    parsed.getUTCDate() ===
      day;

  if (!valid) {
    throw new ValidationError(
      `${field} must be a valid calendar date`
    );
  }

  return date;
};



const validateFutureIsoDate = (
  value,
  field = 'Date',
  {
    allowToday = true
  } = {}
) => {
  const date =
    validateIsoDate(
      value,
      field
    );

  const inputDate =
    new Date(
      `${date}T00:00:00Z`
    );

  const today =
    new Date();

  const todayUtc =
    new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate()
      )
    );

  const invalid =
    allowToday
      ? inputDate < todayUtc
      : inputDate <= todayUtc;

  if (invalid) {
    throw new ValidationError(
      `${field} must ${
        allowToday
          ? 'be today or a future date'
          : 'be a future date'
      }`
    );
  }

  return date;
};



const validatePropertyInput = (
  input,
  {
    partial = false
  } = {}
) => {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input)
  ) {
    throw new ValidationError(
      'Property data must be an object'
    );
  }

  const result = {};

  const required =
    !partial;



  if (
    !partial ||
    input.title !== undefined
  ) {
    result.title =
      normalizeText(
        input.title,
        'Title',
        {
          required,
          max: 160
        }
      );
  }

  

  if (
    !partial ||
    input.price !== undefined
  ) {
    result.price =
      parseNonNegativeNumber(
        input.price,
        'Price',
        {
          positive: true
        }
      );
  }



  if (
    !partial ||
    input.property_type_id !== undefined
  ) {
    result.property_type_id =
      parsePositiveInt(
        input.property_type_id,
        'Property type'
      );
  }

 

  if (
    !partial ||
    input.listing_type !== undefined
  ) {
    result.listing_type =
      requireEnum(
        input.listing_type,
        [
          'sale',
          'rent'
        ],
        'Listing type'
      );
  }



  if (
    !partial ||
    input.area !== undefined
  ) {
    result.area =
      parseNonNegativeNumber(
        input.area,
        'Area',
        {
          positive: true
        }
      );
  }

 

  if (
    !partial ||
    input.location_id !== undefined
  ) {
    result.location_id =
      parsePositiveInt(
        input.location_id,
        'Location'
      );
  }

  

  if (
    input.status !== undefined
  ) {
    result.status =
      requireEnum(
        input.status,
        [
          'available',
          'pending',
          'sold',
          'rented',
          'hidden'
        ],
        'Status'
      );
  }



  if (
    input.bedrooms !== undefined
  ) {
    result.bedrooms =
      parsePositiveInt(
        input.bedrooms,
        'Bedrooms',
        {
          allowZero: true
        }
      );
  }

 

  if (
    input.bathrooms !== undefined
  ) {
    result.bathrooms =
      parseNonNegativeNumber(
        input.bathrooms,
        'Bathrooms'
      );
  }



  if (
    input.description !== undefined
  ) {
    result.description =
      normalizeText(
        input.description,
        'Description',
        {
          max: 10000
        }
      );
  }



  if (
    input.amenities !== undefined
  ) {
    result.amenities =
      normalizeText(
        input.amenities,
        'Amenities',
        {
          max: 3000
        }
      );
  }

  

  if (
    input.area_unit !== undefined
  ) {
    result.area_unit =
      normalizeText(
        input.area_unit,
        'Area unit',
        {
          max: 20
        }
      ) || 'sqm';
  }

  

  if (
    input.main_image !== undefined
  ) {
    result.main_image =
      normalizeText(
        input.main_image,
        'Main image',
        {
          max: 2000
        }
      );
  }



  if (
    input.agent_id !== undefined
  ) {
    if (
      input.agent_id === null ||
      input.agent_id === ''
    ) {
      result.agent_id = null;
    } else {
      result.agent_id =
        parsePositiveInt(
          input.agent_id,
          'Agent'
        );
    }
  }

 

  if (
    input.featured !== undefined
  ) {
    result.featured =
      parseBoolean(
        input.featured,
        'Featured'
      )
        ? 1
        : 0;
  }

  return result;
};


const safeParseInt = (
  value,
  fallback = null
) => {
  if (
    value === undefined ||
    value === null ||
    (
      typeof value === 'string' &&
      value.trim() === ''
    )
  ) {
    return fallback;
  }

  const normalized =
    typeof value === 'string'
      ? value.trim()
      : value;

  const number =
    Number(normalized);

  return Number.isSafeInteger(
    number
  )
    ? number
    : fallback;
};


const safeParseFloat = (
  value,
  fallback = null
) => {
  if (
    value === undefined ||
    value === null ||
    (
      typeof value === 'string' &&
      value.trim() === ''
    )
  ) {
    return fallback;
  }

  const normalized =
    typeof value === 'string'
      ? value.trim()
      : value;

  const number =
    Number(normalized);

  return Number.isFinite(number)
    ? number
    : fallback;
};


module.exports = {
  ValidationError,

  normalizeText,
  normalizeEmail,

  parsePositiveInt,
  parseNonNegativeNumber,
  parsePagination,
  parseBoolean,

  requireEnum,

  validatePassword,
  validateIsoDate,
  validateFutureIsoDate,

  validatePropertyInput,

  safeParseInt,
  safeParseFloat
};