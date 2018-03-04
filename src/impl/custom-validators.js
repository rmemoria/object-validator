const utils = require('../commons/utils');
const errorGen = require('./error-generator');
const propertyResolver = require('./property-resolver');

const validators = {};

/**
 * Custom validators are functions defined by the user inside a schema in property or 
 * object level with the objective of validate it.
 */
module.exports = {
    processCustomValidators: processCustomValidators,
    registerValidator: registerValidator,
    findValidator: findValidator,
    unregisterValidator: unregisterValidator
};

/**
 * Register a new custom validator to be used throughout the implementation
 * @param {string} name 
 * @param {function} handler 
 */
function registerValidator(name, handler) {
    validators[name] = handler;
}

function findValidator(name) {
    return validators[name];
}

function unregisterValidator(name) {
    const validator = validators[name];
    delete validators[name];
    return validator;
}

function processCustomValidators(propValidator) {
    const schema = propValidator.schema;

    // there is a single validator ?
    if (schema.validator) {
        const err = callValidator(propValidator, schema.validator);
        if (err) {
            return err;
        }
    }

    // there is an array of custom validators ?
    if (schema.validators) {
        // iterate by all validators until an invalid is found
        for (const i in schema.validators) {
            const err = callValidator(propValidator, schema.validators[i]);
            if (err) {
                return err;
            }
        }
    }
    return null;
}

function callValidator(propValidator, validator) {
    if (utils.isString(validator)) {
        const v = validators[validator];
        if (!v) {
            throw new Error('Validator \'' + validator + '\' not found');
        }
        validator = v;
    }

    // validator is a simple function ?
    if (utils.isFunction(validator)) {
        return handleFunctionValidator(propValidator, validator);
    }

    return handleValidator(propValidator, validator);
}

function handleFunctionValidator(propValidator, validator) {
    const ret = propertyResolver(validator, propValidator);

    if (utils.isEmpty(ret)) {
        return null;
    }

    if (utils.isString(ret)) {
        return errorGen.createErrorMsg(propValidator.property, ret, null);
    }

    throw new Error('Invalid return type of validator: ' + ret);
}

function handleValidator(propValidator, validator) {
    const func = validator.isValid;
    if (!func || !utils.isFunction(func)) {
        throw new Error('isValid function not found for schema + ' + propValidator.schema);
    }

    // call validator and return true? So it is valid
    const res = propertyResolver(func, propValidator);
    if (res) {
        return null;
    }

    const msg = propertyResolver(validator.message, propValidator);

    console.log('message = ', msg);

    return errorGen.createErrorMsg(propValidator.property, msg, validator.code);
}