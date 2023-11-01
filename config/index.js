let  _ = require('underscore'),
     L = null;

function config(opts){
    L = opts.L || require('pino');
    let self = this,
        configObj = {},
        config = {};
    self.env = process.env.NODE_ENV || 'development';
    configObj.s3 = require('./s3');
    self.commmonProperty = 'commons';
    
    Object.keys(configObj).forEach((key) => {
        const obj = configObj[key];
        let envProp = obj[self.env];
        Object.keys(envProp).forEach(k=>{
            config[k] = _.get(envProp, k);
        })
        let commonProp = obj[self.commmonProperty];
        Object.keys(commonProp).forEach(k=>{
            config[k] = _.get(commonProp, k); 
        })
    });

    return config;
}

module.exports = config;
