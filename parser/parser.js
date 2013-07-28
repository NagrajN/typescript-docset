
var fs = require('fs');
var Sequelize = require('sequelize');

var filePathDefault = "../TypeScript.docset/Contents/Resources/Documents/index.html";
var sqlite3Default = "../TypeScript.docset/Contents/Resources/docSet.dsidx";
var name, type, path; 

if (!!process.argv[2]) {
	filePathDefault = process.argv[2];
}

if (!!process.argv[3]) {
	sqlite3Default = process.argv[3];
}

var fileData = fs.readFileSync(filePathDefault, {encoding : 'ascii'});
fileData = fileData.replace(/[\r\n\t]*/g,"");

var indexArr = [];

var regex = /<p class=MsoToc1>([\s\S]*?)<\/p>/g;

while(result = regex.exec(fileData)) {
	type = "Guide";
	name = result[0].match(/<span style='mso-no-proof:yes'>[\s\S]*?<\/span>/g)[1].match(/[\s\S]*>([\s\S]*?)<\/[\s\S]*/)[1];
	path = result[0].match(/<a href="(#[\s\S]*?)">/)[1];
	indexArr.push({"name" : name,"type": type,"path": "index.html" + path});
}

var sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: sqlite3Default
})

sequelize.query("DELETE FROM searchIndex").success(function() {

	indexArr.forEach(function(item){

		sequelize.query("INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES ('" + item.name + "', '" + item.type + "', '" + item.path + "');").success(function() {
			console.log("inserted");
		})

	})

})



