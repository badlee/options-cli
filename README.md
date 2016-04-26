
Options-cli
===========

Annother Nodejs Command-line option parser.

# USAGE

```JS
    var options = require("options-cli")(schema,option);
```

## SCHEMA
---------

Expects the "schema" array with options definitions and produces the
"options" object and the "arguments" array, which will contain all
non-option arguments encountered (including the script name and such).

**Syntax:**

    [«short», «long», «attributes», «brief», [«callback»],[«error»]]

**Attributes:**

    ! - option is mandatory;
    : - option expects a parameter;
    + - option may be specified multiple times (repeatable).
    val1,val2,val3,val4,...valN - list of possible value

**Notes:**

    - Parser is case-sensitive.
    - The '-?|--help' option is provided implicitly.
    - Parsed options are placed as fields in the "options" object.
    - Non-option arguments are placed in the "arguments" array.
    - Options and their parameters must be separated by space.
    - Either one of «short» or «long» must always be provided.
    - The «callback» function is optional.
    - Cumulated short options are supported (i.e. '-tv').
    - If an error occurs, the process is halted and the help is shown.
    - Repeatable options will be cumulated into arrays.
    - The parser does *not* test for duplicate option definitions.


 ```JS
    var schema = [
            ['f', 'file',    '!:', "Some file we really need.","Error message" ],
            ['t', 'test',    '!',  'I am needed also.'],
            ['',  'log',   "+!info,debug,warning,error",  'log info level'],
            ['l',  'level',   ':',  'Debug level (values 0-4).',function(d){
                d = parseInt(d+0);
                    return isNaN(d) || Math.abs(d) <0 || Math.abs(d) >4 ;
            },"Must be a number bettewen 0-4"],
            ['p',  'port',   ':',  'Port.',function(d){
                d = parseInt(d+0);
                if(isNaN(d))
                    return "Error bad type must a number";
                else if(d<1024)
                    return "Never run in root mode";
            }],
            ['d', '',        '+',   'Enable debug mode.'],
            ['v', 'verbose', '+',  'Verbosity levels (can be used repeatedly).'],
    ];
```
## OPTIONS
----------
**Option is a object with this properties :**
    
    - onArgs : (default: new Function) [callback]  Valid arguments ,
    - exit : (default: true) [Boolean] True : print error and exit; False : return error object,
    - args : (default: '--') [String] label for argument value,
    - script : (default: "«script»") [String] Name of script,
    - strict : (default false) [Boolean] Show error on unknow argument
    - help : (default: "") [String] text of extra help ,
    - desc : (default: "") [String] text of description of script,
    - values : (default: "«values»") [String] text of value argument in help

        
```JS    
var options = {      
            onArgs : function(cfg){
                    if(!cfg) return "Config file is not defined;";
                    if(!path.existsSync(cfg.app(__dirname))){
                            return "Config file not exist;";
                    }
            },
            script : "myapps",
            values : '/path/to/conf/file',
            desc : "MyApps is"
    }    
```

# REAL EXEMPLE

**filename** `script.js`
```JS
var options = require("options-cli")([
		['p', 'port', ':', "Port d'ecoute du serveur." ],
		['h', 'host', ':', "Port d'ecoute du serveur." ],
		['c', 'conf',    ':', 'Fichier de configuration.'],
		['l', 'log' , ':', "Fichier de log"],
		['L', 'error' , ':', "Fichier de log des erreurs"],
		['d','',"+",'Active le debug'],
		['v', 'version', '',  "Obtention des version",function(){
			console.log(process.versions);
			process.exit(0); // 0 for no error
		}]
	],{
		script : require("path").basename(process.argv[0]),
		desc :
"     _   _   _   _____   _____        _____   _____   _____         _____   _   _   __   _\n"+ 
"    | | | | | | /  ___/ |_   _|      |  ___| /  _  \\ |  _  \\       |  ___| | | | | |  \\ | |\n"+ 
"    | | | | | | | |___    | |        | |__   | | | | | |_| |       | |__   | | | | |   \\| |\n"+ 
" _  | | | | | | \\___  \\   | |        |  __|  | | | | |  _  /       |  __|  | | | | | |\\   |\n"+ 
"| |_| | | |_| |  ___| |   | |        | |     | |_| | | | \\ \\       | |     | |_| | | | \\  |\n"+ 
"\\_____/ \\_____/ /_____/   |_|        |_|     \\_____/ |_|  \\_\\      |_|     \\_____/ |_|  \\_|\n"
// JUST FOR FUN
	});

const http = require('http');
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(options.port || 1337, options.host || '127.0.0.1', () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
}); 
```

**execution** `$ script.js -p 80 -h 192.168.1.1`

Copyright 2011 Badlee Oshimin. All rights reserved.
Released as Public Domain.
