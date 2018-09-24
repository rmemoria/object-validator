const customValidator = require('../impl/custom-validators');
const ObjectSchema = require('./object-schema');

/**
 * Schema session defining basic configurations for schemas
 */
module.exports = class SchemaSession {

    constructor() {
        this.validators = {
            register: customValidator.registerValidator,
            unregister: customValidator.unregisterValidator,
            get: customValidator.findValidator
        };

        // List of registered global converters
        this.converters = {};

        // this.types = typeHandlers.propertyBuilders;
        this.types = [];
        this.typeHandlers = {};

        registerDefaultHandlers(this);
    }

    /**
     * 
     * @param {object} schema the schema to be created
     */
    create(schema) {
        return new ObjectSchema(this, schema);
    }

    registerHandler(handler) {
        const typeName = handler.typeName;
    
        if (Array.isArray(typeName)) {
            typeName.forEach(tname => registerTypeNameAndHandler(this, tname, handler));
        } else {
            registerTypeNameAndHandler(this, typeName, handler);
        }
    }

    getHandler(type) {
        return this.typeHandlers[type];
    }

    registerConverter(name, handler) {
        this.converters[name] = handler;
    }

    getConverter(name) {
        return this.converters[name];
    }
};


function registerTypeNameAndHandler(session, typeName, handler) {
    // register type
    session.typeHandlers[typeName] = handler;

    // register builder, if available
    if (handler.PropertyBuilder) {
        session.types[typeName] = (...args) => new handler.PropertyBuilder(typeName, ...args);
    }
}

function registerDefaultHandlers(session) {
    session.registerHandler(require('../types/string-handler'));
    session.registerHandler(require('../types/number-handler'));
    session.registerHandler(require('../types/bool-handler'));
    session.registerHandler(require('../types/array-handler'));
    session.registerHandler(require('../types/object-handler'));
}