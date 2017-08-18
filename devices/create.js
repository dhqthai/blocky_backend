'use strict';

const uuid = require('uuid');
const shortid = require('shortid');
const validator = require('validator');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const config = require('../lib/config');
const constants = require('../lib/constants');
const dynamodb = require('../lib/dynamodb');
const utils = require('../lib/utils');

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();
  var input = JSON.parse(event.body);
  const userId = event.requestContext.authorizer.principalId;
  
  if (!input.name || !input.chipId ) {
    callback(null, utils.createResponse(400, 'Please enter valid name of device'));
    return;
  }
  var params = {
    TableName: process.env.DEVICES_TABLE_NAME,
    Item: {
      id: uuid.v1(),
      chipId : input.chipId,
      name: input.name,
      status : input.status,
      ownerId: userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  // write the script to the database
  dynamodb.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, utils.createResponse(500, 'An internal server error occurred'));
      return;
    }

    // create a response
    callback(null, utils.createResponse(200,null, {
      script : params.Item
    }));
  });
};