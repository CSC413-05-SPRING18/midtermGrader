'use strict';
const async = require('async');
const _ = require('lodash');
const program = require('commander');
const chalk = require('chalk');
const axios = require('axios');
const tests = [];
let port = 1299;
let user;
let completedTests = 0;
const testTypes = [];
let endpoint;
let tmpLength;
let host = 'http://localhost';
let url;

const randomchar = () => {
	var n = Math.floor(Math.random() * 62);
    if (n < 10) return n; //1-10
    if (n < 36) return String.fromCharCode(n + 55); //A-Z
    return String.fromCharCode(n + 61); //a-z
}

const randomstring = (length) => {
	let s = '';
	while (s.length < length) s += randomchar();
	return s;
}

program
.option('-u, --user [value]', 'user')
.option('-p, --port [value]', 'port')
.option('-h, --host [value]', 'host')
.parse(process.argv);

if(program.port){
	port = program.port;
}

if(program.host){
	host = 'http://' + program.host;
}

if(program.user){
	user = program.user;
}else{
	console.log('No name entered');
	process.exit(1);
}

url = host + ':' + port;


console.log(`Using port number ${port}, and user: ${user}`);
// test 0 constant
// test 1 math
// test 3 string ops
// test 4 error handling 1
// test 4 error handling 2
tmpLength = user.length % 3 + 1;
endpoint = url;
let tmp;
for(let i = 0; i < tmpLength; i++){
	tmp = randomstring(i + 2);
	endpoint += `/${tmp}`;
}

tests.push({
	endpoint,
	expected: user
});

const mathOps = {
	'add' : (a, b) =>{
		return a + b;
	},
	'sub' : (a, b) =>{
		return a - b;
	},
	'mod' : (a, b) =>{
		return a % b;
	},
	'mult' : (a, b) =>{
		return a * b;
	},
	'inc' : (a) =>{
		return a + 1;
	},
	'dec' : (a) =>{
		return a - 1;
	},
};

const mathOpsLength = Object.keys(mathOps).length;
const mathOpKey = Object.keys(mathOps)[user.length % mathOpsLength];
const mathOp = mathOps[mathOpKey];
const a = user.charCodeAt(0);
const b = user.charCodeAt(1);
endpoint = url + '/' + mathOpKey + '?A=' + a;
if(mathOp.length === 2){
	endpoint += '&B=' + b;
}

tests.push({
	endpoint,
	expected: mathOp(a,b).toString(),
});

const stringOps = {
	'append' : (a, b) =>{
		return a + b;
	},
	'appendReverse' : (a, b) =>{
		return b + a;
	},
};

const stringOpsLength = Object.keys(stringOps).length;
const stringOpsKey = Object.keys(stringOps)[user.length % stringOpsLength];
const stringOp = stringOps[stringOpsKey];
const stringA = randomstring(user.length);
const stringB = randomstring(user.length);
endpoint = url + '/' + stringOpsKey + '?A=' + stringA + '&B=' + stringB;

tests.push({
	endpoint,
	expected: stringOp(stringA,stringB),
});

endpoint = url + '/' + mathOpKey;
tests.push({
	endpoint,
	expected: 'error',
});

const rand = Math.floor(Math.random() * Math.floor(Object.keys(mathOps).length));
const randOpKey = Object.keys(mathOps)[rand];
endpoint = url + '/' + randOpKey + '?A=' + user
tests.push({
	endpoint,
	expected: 'error',
});

const testRequests = tests.map((test)=>{
	return (callback) =>{
		console.log(chalk.blue('Testing : ' + test.endpoint));
		console.log('Expecting : ' + test.expected);
		axios.get(test.endpoint)
		.then((response) => {
			console.log('Got response :' + response.data.toString().trim())
			if(response.data.toString().trim() === test.expected){
				completedTests++;
				console.log(chalk.green('Passed!'));
			}else{
				console.log(chalk.red('Failed'));
			}
			callback(null);
		})
		.catch((error) => {
			console.log(chalk.red('Failed, Got server error'));
			//console.log(error)
			callback(null);
		});
	};
});

async.waterfall(testRequests,
	(err, result) => {
		const total = (completedTests + 5) * 10;
		console.log(chalk.bold.magenta(`Completed tests: ${completedTests}, overall grade : ${total}%`));
	});
	