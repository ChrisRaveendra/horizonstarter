"use strict";

// Project model
var mongoose = require('mongoose');
var Contribution = mongoose.model('Contribution', {
	name: {
		type: String
	},
	amount: {
		type: Number
	}
})
var Project = mongoose.model('Project', {
	title: {
		type: String,
		required: true
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
	},

	contributions: {
		type: Array,
		children: Contribution
	},

	category: {
		type: String,
		enum: [
			'Famous Muppet Frogs',
			'Current Black Presidents',
			'The Pen is Mightier',
			'Famous Mothers',
			'Drummers Named Ringo',
			'1-Letter Words',
			'Months That Start With "Feb"',
			'How Many Fingers Am I Holding Up',
			'Potent Potables'
		]
	}
});

module.exports = {
	Project: Project
}
