const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'F-PRO CONSULTING API',
            version: '1.0.0',
            description: 'API Documentation for Sprints 3 & 4 - Sales, Maintenance & Rental',
            contact: {
                name: 'F-PRO Team'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./src/routes/*.js'] // Path to the API docs
};

const specs = swaggerJsDoc(options);

module.exports = {
    swaggerUi,
    specs
};
