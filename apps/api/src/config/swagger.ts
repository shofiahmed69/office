import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ScholarPass API',
      version: '1.0.0',
      description: 'AI-Powered Personalized Learning Platform API Documentation',
      contact: {
        name: 'ScholarPass Team',
        email: 'support@scholarpass.com',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api-staging.scholarpass.com',
        description: 'Staging server',
      },
      {
        url: 'https://api.scholarpass.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'johndoe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            profilePictureUrl: { type: 'string', nullable: true },
            emailConfirmed: { type: 'boolean', example: false },
            primaryRoleId: { type: 'integer', example: 3 },
            roleName: { type: 'string', example: 'Student' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGc...' },
            refreshToken: { type: 'string', example: 'eyJhbGc...' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message' },
            stack: { type: 'string', nullable: true },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Validation failed' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  value: { type: 'string' },
                  msg: { type: 'string' },
                  path: { type: 'string' },
                  location: { type: 'string' },
                },
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Unauthorized - Invalid or missing token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        Forbidden: {
          description: 'Forbidden - Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Assessments',
        description: 'Skill assessment endpoints',
      },
      {
        name: 'Roadmaps',
        description: 'Learning roadmap endpoints',
      },
      {
        name: 'Content',
        description: 'Educational content endpoints',
      },
      {
        name: 'Study Buddies',
        description: 'Study buddy matching and management endpoints',
      },
      {
        name: 'Sessions',
        description: 'Study session endpoints',
      },
      {
        name: 'AI Assistant',
        description: 'AI-powered Q&A and transcription endpoints',
      },
      {
        name: 'Analytics',
        description: 'Analytics and progress tracking endpoints',
      },
      {
        name: 'Admin',
        description: 'Admin-only management endpoints',
      },
      {
        name: 'Health',
        description: 'Health check and monitoring endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
