
/**
 * CONFIGURATION
 */
 
var host = "localhost";       // Database host to connect to :
var database = "yourdbname";  // Database name :
var username = "dbuser";      // MySQL username & password
var password = "dbpasswd";
var utf8 = false;              // Should be true if your database is in UTF8

/**
 * END OF CONFIGURATION
 */





// The mysql Driver class
var driver = "com.mysql.jdbc.Driver";

// Output file name
var destFileName = database+".json";

// Required to generate the json output
load("lib/json.js");
// For human-readable json
load("lib/beautify.js");


// Connect to the database
var connectionStr = "jdbc:mysql://"+host+"/"+database;
importPackage(java.sql);
java.lang.Class.forName(driver).newInstance();
var c = DriverManager.getConnection(connectionStr, username, password);



function generateSourceFromTable(tableName) {
   
   var fieldList = [];
   var s = c.createStatement();
   s.executeQuery("SHOW FIELDS FROM "+tableName);
   var rs = s.getResultSet();
   while (rs.next()) {
      var fieldName = rs.getString("Field");
      if(fieldName != "id") {
         fieldList.push(fieldName);
      }
   }
   rs.close();
   
   return {
	      "name": tableName,
	      "sourceClass":"org.persvr.datasource.DatabaseTableDataSource",
		   "driver": driver,
		   "connection": connectionStr+"?user="+username+"&password="+password+(utf8 ? "&useUnicode=true&characterEncoding=utf-8&mysqlEncoding=utf8" : ""),
		   "table": tableName,
		   "idColumn":"id",
		   "camelCaseColumnNames":false,
		   "dataColumns": fieldList,
		   "schema":{
			   "prototype":{},
			   "data":{"$ref":"../"+tableName+"/"}
			}
	};
   
};

var configObject = {
   "id": destFileName,
   "sources": []
};

// Generate tableList array
var tableList = [];
var tableKey = "Tables_in_"+database;
var s = c.createStatement();
s.executeQuery("SHOW TABLES");
var rs = s.getResultSet();
while (rs.next()) {
   var tableName = rs.getString(tableKey);
   tableList.push(tableName);
}
rs.close();
   

for(var i = 0 ; i < tableList.length ; i++) {
   configObject.sources.push( generateSourceFromTable(tableList[i]) ); 
}
   


// Close the database connection
c.close();


// Save the config file
var destFile = new java.io.File(destFileName);
destFile.createNewFile(); 
var fos = new java.io.FileOutputStream(destFile);
fos.write(  (new java.lang.String("("+js_beautify(configObject.toJSONString())+")")).getBytes() );




