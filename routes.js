"use strict";

// Routes, with inline controllers for each route.
var express = require('express');
var router = express.Router();
var Project = require('./models').Project;
var strftime = require('strftime');

// Example endpoint
router.get('/create-test-project', function(req, res) {
	var project = new Project({
		title: 'I am a test project'
	});
	project.save(function(err) {
		if (err) {
			res.status(500).json(err);
		} else {
			res.send('Success: created a Project object in MongoDb');
		}
	});
});

// Part 1: View all projects
// Implement the GET / endpoint.
router.get('/', function(req, res) {
	// res.send('hello');
	Project.find(function(err,result) {
		if (err) {
			console.log('error in get / ', err);
			res.send('no projects found');
		} else {
			console.log(result);
			res.render('index', { items: result });
		}
	});
});

// Part 2: Create project
// Implement the GET /new endpoint
router.get('/new', function(req, res) {

	res.render('new');
});

// Part 2: Create project
// Implement the POST /new endpoint
router.post('/new', function(req, res) {
	if (!req.body.title || !req.body.goal || !req.body.start || !req.body.end) {
		res.render('new',
		{
			data: req.body
		});
		return;
 
	}
	else {
		var project = new Project({
			title: req.body.title,
			goal: req.body.goal,
			description: req.body.description,
			start: req.body.start,
			end: req.body.end
		 });

		project.save(function (err) {
			if (err) {
				res.status(500).json(err);
				/*res.render('new',
					{
						mongo: true
					});
				return;*/
			} 
			
			else {
				res.redirect('/');
			}
		});
		
	}
});

// Part 3: View single project
// Implement the GET /project/:projectid endpoint
router.get('/project/:projectid', function(req, res) {
	let id = req.params.projectid;

	// res.send(req.params.projectid);

	Project.findById(id, function (err, project) {
		if (err) {
			console.log(`Can't find project with id: ${id}`);
			res.redirect('/');
		}
		else {
			console.log('Roster id found!', project);

			let sum = 0;
			for(let cont of project.contributions) {
				sum += Number(cont.amount);
			}
			res.render('project', { proj: project, raised: sum, ratio: sum/parseFloat(project.goal)*100});
		}

	});

});

// Part 4: Contribute to a project
// Implement the GET /project/:projectid endpoint
router.post('/project/:projectid', function(req, res) {
	let id = req.params.projectid;
	console.log('name & amount: ', req.body);

	Project.findById(id, function (err, project) {
		if (err) {
			res.redirect('/');
		}
		else {
			// alert.log('Roster id found!', project);
			// res.render('project', { proj: project });
		
			console.log('contributions: ', project.contributions);
			(project.contributions).push({
				name: req.body.name, amount: req.body.amount
			})

			project.save(function (err) {
				if (err) {
					res.status(500).json(err);
					/*res.render('new',
						{
							mongo: true
						});
					return;*/
				}

				else {
					res.redirect('/');
				}
			});
		
		
		}

	});
});

// Part 6: Edit project
// Create the GET /project/:projectid/edit endpoint
// Create the POST /project/:projectid/edit endpoint

module.exports = router;
