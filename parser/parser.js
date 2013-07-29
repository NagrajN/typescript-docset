
var fs = require('fs');
var Sequelize = require('sequelize');
var resource = '../TypeScript.docset/Contents/Resources/Documents/index.html';
var db = '../TypeScript.docset/Contents/Resources/docSet.dsidx';
var indexes = [];

resource = (!!process.argv[2]) ? process.argv[2] : resource;
db = (!!process.argv[3]) ? process.argv[3] : db;

var fileData = fs.readFileSync(resource, {encoding : 'utf8'});
fileData = fileData.replace(/[\r\n\t]*/g,'');

function extract(regEx, docType) {
	var name, type, path, tmp;
	while(rslt = regEx.exec(fileData)) {
		path = rslt[0].match(/<a href="(#[\s\S]*?)">/)[1];
		tmp = rslt[0].match(/<span style='mso-no-proof:yes'>([\s\S]*?)<\/span>/g);
		if (tmp) {
			name = rslt[0].match(/<span style='mso-no-proof:yes'>([\s\S]*?)<\/span>/g)[1].match(/[\s\S]*>([\s\S]*?)<\/[\s\S]*/)[1];
			indexes.push({"name":name,"type":docType,"path":"index.html" + path});
		}
	}
}
extract(/<p class=MsoToc1>([\s\S]*?)<\/p>/g, 'Guide');
extract(/<p class=MsoToc2[\s\S]*?>([\s\S]*?)<\/p>/g, 'Tag');
extract(/<p class=MsoToc3[\s\S]*?>([\s\S]*?)<\/p>/g, 'Tag');

var sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: db
});

sequelize.query('DELETE FROM searchIndex').success(function() {
	indexes.forEach(function(item){
		sequelize.query("INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES ('" + item.name + "', '" + item.type + "', '" + item.path + "');");
	})
})
