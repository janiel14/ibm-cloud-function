"use strict";

import Companies from "./companies";

const myCompanies = new Companies();

exports.create = (params) => {
    try {
        return myCompanies.showform(params);
    } catch (error) {
        return {
            message: "Error",
            data: error
        };
    }
};
