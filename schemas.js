const BaseJoi = require('joi');  //it helps in validating each entry done in the form

const sanitizeHtml = require('sanitize-html');  //it makes the string HTML escaped(removes HTML markups to avoid cross-site scripting )

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],               //we are not allowing any thing to pass if we encounter any scripts/html
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })   //compare with org val, if changed print the message
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)   //we are extending Joi with extension func as Joi doesnt have HTML sanitize option
//THIS VALIDATION IS DONE TO TAKLE ISSUES WEHRE INVALID DATE CAN BE SENT THRU POSTMAN OR AJAX LIKE EMPTY INPUT
//vaildation schema defined for validation purpose in app.js
//at other places we can access this hotelSchema using module.exports.hotelSchema
module.exports.hotelSchema = Joi.object({
    hotel: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),   //required - (mandatory field), min() - min limit
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()   
});




module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()  //this required thing is important as we want this whole review object to be there
})