const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { getConfig } = require('./config/env');
const { sendSuccess } = require('./utils/response');

const {
  notFoundHandler,
  errorHandler
} = require('./middleware/errorMiddleware');

const {
  securityHeaders
} = require('./middleware/securityMiddleware');



const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyTypeRoutes = require('./routes/propertyTypeRoutes');
const locationRoutes = require('./routes/locationRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const agentRequestRoutes = require('./routes/agentRequestRoutes');



const app = express();
const config = getConfig();

const ROOT_DIR = path.resolve(__dirname, '..');

const uploadsRoot = path.join(
  ROOT_DIR,
  'uploads'
);

const propertyUploadsDir = path.join(
  uploadsRoot,
  'properties'
);



fs.mkdirSync(
  propertyUploadsDir,
  {
    recursive: true
  }
);


app.disable('x-powered-by');


if (config.trustProxy) {
  app.set('trust proxy', config.trustProxy);
}


app.use(securityHeaders);



const allowedOrigins = new Set(
  config.corsOrigins || []
);

const isLocalhostOrigin = (origin) => {
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (
      allowedOrigins.has(origin) ||
      (process.env.NODE_ENV !== 'production' && isLocalhostOrigin(origin))
    ) {
      return callback(null, true);
    }

    const error = new Error('Origin is not allowed by CORS policy');
    error.status = 403;
    error.code = 'CORS_ORIGIN_DENIED';

    return callback(error);
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ],

  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.use(
  express.json({
    limit: '10mb',
    strict: true
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
    parameterLimit: 100
  })
);


app.use(
  '/uploads',
  express.static(
    uploadsRoot,
    {
      dotfiles: 'deny',

      fallthrough: false,

      index: false,

      maxAge:
        process.env.NODE_ENV === 'production'
          ? '1d'
          : 0,

      setHeaders(res) {
        res.setHeader(
          'X-Content-Type-Options',
          'nosniff'
        );
      }
    }
  )
);



app.get(
  '/api',
  (req, res) => {
    return sendSuccess(
      res,
      'Real Estate Service Management API',
      {
        service:
          'RealEstatePro API',

        status:
          'UP',

        environment:
          process.env.NODE_ENV ||
          'development'
      }
    );
  }
);



app.get(
  '/api/health',
  (req, res) => {
    return sendSuccess(
      res,
      'Real Estate Service Management API is running',
      {
        status: 'UP',

        timestamp:
          new Date().toISOString(),

        uptime:
          Math.floor(
            process.uptime()
          )
      }
    );
  }
);



app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/users',
  userRoutes
);

app.use(
  '/api/property-types',
  propertyTypeRoutes
);

app.use(
  '/api/locations',
  locationRoutes
);

app.use(
  '/api/properties',
  propertyRoutes
);

app.use(
  '/api/favorites',
  favoriteRoutes
);

app.use(
  '/api/inquiries',
  inquiryRoutes
);

app.use(
  '/api/appointments',
  appointmentRoutes
);

app.use(
  '/api/service-requests',
  serviceRequestRoutes
);

app.use(
  '/api/dashboard',
  dashboardRoutes
);

app.use(
  '/api/agent-requests',
  agentRequestRoutes
);



const frontendDist = path.resolve(
  __dirname,
  '../../frontend/dist'
);

const shouldServeFrontend =
  process.env.SERVE_FRONTEND ===
  'true';

if (
  shouldServeFrontend &&
  fs.existsSync(frontendDist)
) {
 

  app.use(
    express.static(
      frontendDist,
      {
        index: false,
        maxAge:
          process.env.NODE_ENV ===
          'production'
            ? '1d'
            : 0
      }
    )
  );

  
  app.use(
    (req, res, next) => {
      if (
        req.method !== 'GET'
      ) {
        return next();
      }

      if (
        req.path === '/api' ||
        req.path.startsWith(
          '/api/'
        ) ||
        req.path.startsWith(
          '/uploads/'
        )
      ) {
        return next();
      }

      return res.sendFile(
        path.join(
          frontendDist,
          'index.html'
        )
      );
    }
  );
}


app.use(
  notFoundHandler
);



app.use(
  errorHandler
);


module.exports = app;