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

function sortDir(req, res, param) {
	let sort = req.query.sort;
	console.log(sort);
	let sortObject = {};
	if (req.query.sortdirection === 'asc') sortObject[sort] = 1;
	else sortObject[sort] = -1;
	Project.find().sort(sortObject).exec(function (err, result) {
		if (err) {
			console.log('error in get / ', err);
			res.send('no projects found');
		} else {
			// console.log(result);
			res.render('index', { items: result });
		}
	});
}

function contSum(a) {
	if(a.contributions) {
		let sum = 0;
		for(let c of a.contributions) {
			sum += Number(c.amount);
		}
		// console.log(sum);
		return sum;
	}
	else return 0;
}

// Part 1: View all projects
// Implement the GET / endpoint.
router.get('/', function(req, res) {
	console.log(req.query);
	let arr = [];

	if(req.query.sort) {
		let sort = req.query.sort;

		if(req.query.sort === 'contributions' ) {

			Project.find(function (err, result) {
				if (err) {
					console.log('error in get / ', err);
					res.send('no projects found');
				} 
				
				else {
					for(let proj of result) arr.push(proj);

					// console.log(arr);

					if(req.query.sortdirection === 'asc') {
						console.log('\n asc');
						arr.sort(function (a, b) {
							return contSum(b) - contSum(a);
						});

						console.log(arr);

						res.render('index', { items: arr });
						return;

					}
					else{
						console.log('hello');
						arr.sort(function(a,b) {
							return contSum(a) - contSum(b);
						});

						console.log(arr);

						res.render('index', {items: arr});
						return;
					}
				}
			});
		}
		else sortDir(req, res, sort);

	}

	else if (req.query.funded === 'true') {
		Project.find(function (err, result) {
			if (err) {
				console.log('error in get / ', err);
				res.send('no projects found');
			}

			else {
				for (let proj of result) arr.push(proj);

				console.log('fuck you')

				let newarr = arr.filter(function (contribution){
					return ((contSum(contribution) - Number(contribution.goal)) >= 0);
				});

				console.log(newarr)

				res.render('index', { items: newarr });
				return;
			}
		});
	}

	else if (req.query.funded === 'false') {
		Project.find(function (err, result) {
			if (err) {
				console.log('error in get / ', err);
				res.send('no projects found');
			}

			else {
				for (let proj of result) arr.push(proj);

				console.log('fuck you')

				let newarr = arr.filter(function (contribution) {
					return (Number(contribution.goal) - (contSum(contribution)) > 0);
				});

				console.log(newarr)

				res.render('index', { items: newarr });
				return;
			}
		});
	}

 
	else {
		Project.find(function(err,result) {
			if (err) {
				console.log('error in get / ', err);
				res.send('no projects found');
			} else {
				// console.log(result);
				res.render('index', { items: result });
			}
		});
	}
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
			end: req.body.end,
			category: req.body.category
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
					let sum = 0;
					for (let cont of project.contributions) {
						sum += Number(cont.amount);
					}
					res.render('project', { proj: project, raised: sum, ratio: sum / parseFloat(project.goal) * 100 });
				}
			});
		
		}

	});
});

// Part 6: Edit project
// Create the GET /project/:projectid/edit endpoint
router.get('/project/:projectid/edit', function (req, res) {
	let id = req.params.projectid;

	Project.findById(id, function (err, project) {
		if (err) {
			res.redirect('/');
		}
		else {
			res.render('editProject', {
				project: project
			});
		}
	});
});


// Create the POST /project/:projectid/edit endpoint
router.post('/project/:projectid/edit', function (req, res) {
	let id = req.params.projectid;
	Project.findByIdAndUpdate(id, {
		title: req.body.title,
		goal: req.body.goal,
		description: req.body.description,
		start: req.body.start,
		end: req.body.end
	},
		function (err, project) {
		if (err) {
			res.render('editProject',
				{
					project: req.body, 
				});
			return;		
		}
		else {
			res.redirect('/');
		}
	});

});

module.exports = router;
