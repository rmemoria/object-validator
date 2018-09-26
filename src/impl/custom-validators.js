const utils = require('../commons/utils');
const errorGen = require('./error-generator');
const propertyResolver = require('./property-resolver');
const util = require('util');
//const ValidatorBuilder = require('./validator-builder');

//const validators = {};

/**
 * Custom validators are functions defined by the user inside a schema in property or 
 * object level with the objective of validate it.
 */
module.exports = {
    processCustomValidators: processCustomValidators,
    // registerValidator: registerValidator,
    // findValidator: findValidator,
    // unregisterValidator: unregisterValidator
};

/**
 * Register a new custom validator to be used throughout the implementation
 * @param {string} name 
 * @param {function} handler a function that returns true if the validation was successfull
 */
// function registerValidator(name, handler) {
//     const builder = new ValidatorBuilder();
//     const validator = builder.bind(handler);
//     validators[name] = validator;
//     return builder;
// }

// function findValidator(name) {
//     return validators[name];
// }

// function unregisterValidator(name) {
//     const validator = validators[name];
//     delete validators[name];
//     return validator;
// }

function processCustomValidators(propContext) {
    const schema = propContext.schema;

    // there is an array of custom validators ?
    if (schema.validators) {
        // iterate by all validators until an invalid is found
        for (const i in schema.validators) {
            const err = callValidator(propContext, schema.validators[i]);
            if (err) {
                return err;
            }
        }
    }
    return null;
}

function callValidator(propContext, validator) {
    if (utils.isString(validator)) {
        const v = propContext.session.getValidator(validator);
        if (!v) {
            throw new Error('Validator \'' + validator + '\' not found');
        }
        validator = v;
    }

    // validator is a simple function ?
    if (utils.isFunction(validator)) {
        return handleFunctionValidator(propContext, validator);
    }

    return handleValidator(propContext, validator);
}

function handleFunctionValidator(propContext, validator) {
    const ret = propertyResolver(validator, propContext);

    if (utils.isEmpty(ret)) {
        return null;
    }

    if (utils.isString(ret)) {
        return errorGen.createErrorMsg(propContext.property, ret, null);
    }

    throw new Error('Invalid return type of validator: ' + ret);
}

function handleValidator(propContext, validator) {
    const func = validator.validIf;
    if (!func || !utils.isFunction(func)) {
        throw new Error('validIf function not found for schema + ' + util.inspect(propContext.schema));
    }

    // call validator and return true? So it is valid
    const res = propertyResolver(func, propContext);
    if (res) {
        return null;
    }

    const msg = propertyResolver(validator.message, propContext) || 'Not valid';

    return errorGen.createErrorMsg(propContext.property, msg, validator.code || 'INVALID');
}