#!/usr/bin/env node

var path = require('path');
var server = require('../js/server');

var directory = path.join(__dirname, '..', 'build');
server(directory);
