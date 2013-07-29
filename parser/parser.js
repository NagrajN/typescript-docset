
var fs = require('fs');
var Sequelize = require('sequelize');
var filePathDefault = "../TypeScript.docset/Contents/Resources/Documents/index.html";
var sqlite3Default = "../TypeScript.docset/Contents/Resources/docSet.dsidx";
var name, type, path, indexArr = [];

filePathDefault = (!!process.argv[2]) ? process.argv[2] : filePathDefault;
sqlite3Default = (!!process.argv[3]) ? process.argv[3] : sqlite3Default;

var fileData = fs.readFileSync(filePathDefault, {encoding : 'ascii'});
fileData = fileData.replace(/[\r\n\t]*/g,'');

function extractGuides(guidesRegEx) {
	while(result = guidesRegEx.exec(fileData)) {
		var type = "Guide";
		var name = result[0].match(/<span style='mso-no-proof:yes'>[\s\S]*?<\/span>/g)[1].match(/[\s\S]*>([\s\S]*?)<\/[\s\S]*/)[1];
		var path = result[0].match(/<a href="(#[\s\S]*?)">/)[1];
		indexArr.push({"name" : name,"type": type,"path": "index.html" + path });
	}
}

extractGuides(/<p class=MsoToc1>([\s\S]*?)<\/p>/g);

function extractTOC(regEx) {
	while(result = regEx.exec(fileData)) {
		var type = "Tag";
		var path = result[0].match(/<a href="(#[\s\S]*?)">/)[1];
		var tmp = result[0].match(/<span style='mso-no-proof:yes'>([\s\S]*?)<\/span>/g);
		if (tmp) {
			var name = result[0].match(/<span style='mso-no-proof:yes'>([\s\S]*?)<\/span>/g)[1].match(/[\s\S]*>([\s\S]*?)<\/[\s\S]*/)[1];
			indexArr.push({"name" : name,"type": type,"path": "index.html" + path});
		}
	}
}

extractTOC(/<p class=MsoToc2[\s\S]*?>([\s\S]*?)<\/p>/g);
extractTOC(/<p class=MsoToc3[\s\S]*?>([\s\S]*?)<\/p>/g);

var sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: sqlite3Default
});

sequelize.query("DELETE FROM searchIndex").success(function() {
	indexArr.forEach(function(item){
		sequelize.query("INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES ('" + item.name + "', '" + item.type + "', '" + item.path + "');");
	})
})
