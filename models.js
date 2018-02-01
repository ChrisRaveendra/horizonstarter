"use strict";

// Project model
var mongoose = require('mongoose');

var Project = mongoose.model('Project', {
  title: {
    type: String,
  },

  goal: {
    type: Number,
    required: true
  },

  description: {
    type: String,
  },

  start: {
    type: Date,
    required: true
  },

  end: {
    type: Date,
    required: true
  }
});

module.exports = {
  Project: Project
}
