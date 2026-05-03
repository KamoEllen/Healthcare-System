import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Healthcare Management API',
    version: '1.0.0',
    description: 'REST API for patients, doctors, appointments, and health records.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'doctor', 'patient'] },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          is_active: { type: 'boolean' },
          email_verified: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Patient: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          date_of_birth: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          blood_type: { type: 'string' },
          allergies: { type: 'string' },
          emergency_contact: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string' },
        },
      },
      Doctor: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          specialisation: { type: 'string' },
          licence_number: { type: 'string' },
          phone: { type: 'string' },
          bio: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string' },
        },
      },
      Appointment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          patient_id: { type: 'string', format: 'uuid' },
          doctor_id: { type: 'string', format: 'uuid' },
          patient_first_name: { type: 'string' },
          patient_last_name: { type: 'string' },
          doctor_first_name: { type: 'string' },
          doctor_last_name: { type: 'string' },
          doctor_specialisation: { type: 'string' },
          scheduled_at: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
          notes: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      HealthRecord: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          patient_id: { type: 'string', format: 'uuid' },
          doctor_id: { type: 'string', format: 'uuid' },
          diagnosis: { type: 'string' },
          treatment: { type: 'string' },
          prescription: { type: 'string' },
          notes: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new patient account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'first_name', 'last_name'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  first_name: { type: 'string' },
                  last_name: { type: 'string' },
                  date_of_birth: { type: 'string', format: 'date' },
                  gender: { type: 'string', enum: ['male', 'female', 'other'] },
                  blood_type: { type: 'string' },
                  allergies: { type: 'string' },
                  emergency_contact: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registered successfully' },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Email already in use' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive access + refresh tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful — access token in body, refresh token in HTTP-only cookie',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Rotate refresh token and issue new access token (reads from cookie)',
        responses: {
          200: { description: 'New access token issued' },
          401: { description: 'Refresh token missing or invalid' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Revoke refresh token and clear cookie',
        security: [{ bearerAuth: [] }],
        responses: {
          204: { description: 'Logged out' },
        },
      },
    },
    '/auth/verify-email': {
      post: {
        tags: ['Auth'],
        summary: 'Verify email address with token from email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: { token: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Email verified' },
          400: { description: 'Token invalid or expired' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Send password reset email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Reset email sent (response is always 200 to prevent enumeration)' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password using token from email — revokes all refresh tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password reset, all sessions revoked' },
          400: { description: 'Token invalid or expired' },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: 'Paginated user list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    meta: { type: 'object', properties: { total: { type: 'integer' }, page: { type: 'integer' }, limit: { type: 'integer' } } },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'User found', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          404: { description: 'Not found' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update own profile (owner only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  first_name: { type: 'string' },
                  last_name: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated' },
          403: { description: 'Forbidden — not owner' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Soft-delete user (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          204: { description: 'Deleted' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/patients': {
      get: {
        tags: ['Patients'],
        summary: 'List patients (admin, doctor)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'Patient list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Patient' } } } } },
        },
      },
    },
    '/patients/me': {
      get: {
        tags: ['Patients'],
        summary: 'Get own patient profile (patient only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Own patient record', content: { 'application/json': { schema: { $ref: '#/components/schemas/Patient' } } } },
        },
      },
    },
    '/patients/{id}': {
      get: {
        tags: ['Patients'],
        summary: 'Get patient by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Patient found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Patient' } } } },
          404: { description: 'Not found' },
        },
      },
      patch: {
        tags: ['Patients'],
        summary: 'Update patient record (admin, patient)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  date_of_birth: { type: 'string', format: 'date' },
                  gender: { type: 'string', enum: ['male', 'female', 'other'] },
                  blood_type: { type: 'string' },
                  allergies: { type: 'string' },
                  emergency_contact: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated' } },
      },
    },
    '/doctors': {
      get: {
        tags: ['Doctors'],
        summary: 'List doctors (all authenticated roles)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Doctor list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Doctor' } } } } },
        },
      },
      post: {
        tags: ['Doctors'],
        summary: 'Create doctor profile for an existing user (admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['user_id', 'specialisation', 'licence_number'],
                properties: {
                  user_id: { type: 'string', format: 'uuid' },
                  specialisation: { type: 'string' },
                  licence_number: { type: 'string' },
                  phone: { type: 'string' },
                  bio: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Doctor created' },
          409: { description: 'Doctor profile already exists for this user' },
        },
      },
    },
    '/doctors/me': {
      get: {
        tags: ['Doctors'],
        summary: 'Get own doctor profile (doctor only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Own doctor record', content: { 'application/json': { schema: { $ref: '#/components/schemas/Doctor' } } } },
        },
      },
    },
    '/doctors/{id}': {
      get: {
        tags: ['Doctors'],
        summary: 'Get doctor by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Doctor found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Doctor' } } } },
          404: { description: 'Not found' },
        },
      },
      patch: {
        tags: ['Doctors'],
        summary: 'Update doctor profile (admin, doctor)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  specialisation: { type: 'string' },
                  phone: { type: 'string' },
                  bio: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated' } },
      },
    },
    '/appointments': {
      get: {
        tags: ['Appointments'],
        summary: 'List appointments (filtered by role automatically)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'Appointment list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Appointment' } } } } },
        },
      },
      post: {
        tags: ['Appointments'],
        summary: 'Book an appointment (patient, admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['doctor_id', 'scheduled_at'],
                properties: {
                  doctor_id: { type: 'string', format: 'uuid' },
                  scheduled_at: { type: 'string', format: 'date-time' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Appointment booked' },
          409: { description: 'Slot already taken (double-booking prevented)' },
        },
      },
    },
    '/appointments/{id}': {
      get: {
        tags: ['Appointments'],
        summary: 'Get appointment by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Appointment found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Appointment' } } } },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Appointments'],
        summary: 'Cancel appointment (patient, admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 204: { description: 'Cancelled' } },
      },
    },
    '/appointments/{id}/status': {
      patch: {
        tags: ['Appointments'],
        summary: 'Update appointment status (doctor, admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['confirmed', 'cancelled', 'completed'] },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Status updated, audit log written atomically' } },
      },
    },
    '/health-records': {
      get: {
        tags: ['Health Records'],
        summary: 'List health records (filtered by role)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'patient_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'Health record list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/HealthRecord' } } } } },
        },
      },
      post: {
        tags: ['Health Records'],
        summary: 'Create health record (doctor only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['patient_id', 'diagnosis'],
                properties: {
                  patient_id: { type: 'string', format: 'uuid' },
                  diagnosis: { type: 'string' },
                  treatment: { type: 'string' },
                  prescription: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Record created' } },
      },
    },
    '/health-records/{id}': {
      get: {
        tags: ['Health Records'],
        summary: 'Get health record by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Record found', content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthRecord' } } } },
          404: { description: 'Not found' },
        },
      },
      patch: {
        tags: ['Health Records'],
        summary: 'Update health record (doctor only, within 24 hours of creation)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  diagnosis: { type: 'string' },
                  treatment: { type: 'string' },
                  prescription: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated' },
          403: { description: '24-hour edit window has passed' },
        },
      },
    },
  },
};

export function registerSwagger(app: Express): void {
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: 'Healthcare API Docs' }));
}