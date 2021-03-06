var utils = require('../commons/utils');
const PropertyBuilder = require('../core/property-builder');

module.exports.typeName = 'bool';

module.exports.validate = (propContext) => {
    var val = propContext.value;

    if (utils.isEmpty(val)) {
        return null;
    }

    // check if number is in the correct type
    if (!utils.isBoolean(val)) {
        const newVal = convertValue(val);
        if (newVal === null) {
            return Promise.reject(propContext.error.invalidValue);
        }

        val = newVal;
    }

    return val;
};

module.exports.PropertyBuilder = class BoolBuilder extends PropertyBuilder {
};


function convertValue(val) {
    const trueValues = ['true', '1', 1];
    const falseValues = ['false', '0', 0];

    if (utils.isString(val)) {
        val = val.toLowerCase();
    }

    if (trueValues.includes(val)) {
        return true;
    }

    if (falseValues.includes(val)) {
        return false;
    }

    return null;
}
