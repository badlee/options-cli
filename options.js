/** Command-line options parser (original from http://valeriu.palos.ro/1026/).
    Copyright 2011 Badlee Oshimin. All rights reserved.
    Released as Public Domain.
 
        -------------------- SCHEMA ---------------------------------
 
    Expects the "schema" array with options definitions and produces the
    "options" object and the "arguments" array, which will contain all
    non-option arguments encountered (including the script name and such).
 
    Syntax:
		[«short», «long», «attributes», «brief», [«callback»],[«error»]]
 
    Attributes:
        ! - option is mandatory;
        : - option expects a parameter;
        + - option may be specified multiple times (repeatable).
        val1,val2,val3,val4,...valN - list of possible value
 
    Notes:
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
 
        Sample option definitions.
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
       
        -------------------- OPTIONS ---------------------------------
 
        {
                "onArgs" : (default: new Function) [callback]  Valid arguments ,
                "exit" : (default: true) [Boolean] True : print error and exit; False : return error object,
                "args" : (default: '--') [String] label for argument value,
                "script" : (default: "«script»") [String] Name of script,
				"strict" : (default false) [Boolean] Show error on unknow argument
                "help" : (default: "") [String] text of extra help ,
                "desc" : (default: "") [String] text of description of script,
                "values" : (default: "«values»") [String] text of value argument in help
        }
       
        Sample of options
       
        {      
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
*/
 
function options(schema,opt){
		//remove node.exe;
		if(require("path").basename(process.argv[0]).split('.')[0] == 'node')
			process.argv.shift();
        // Parse options.
        opt = opt || {};
        opt.exit = typeof opt.exit == 'boolean' ? opt.exit : true;
        opt = {
                "onArgs" : opt.onArgs || new Function,
                "exit" : opt.exit,
                "args" : opt.args || "--",
                "script" : opt.script || "«script»",
                "help" : opt.help|| "",
                "desc" : opt.desc || "",
				"strict" : opt.strict || false,
                "dbg" : "",
                "values" : opt.values || "«values»",
                "log" : function(str){
						
                        this.dbg +=  (this.dbg =="" ? "" : "\n")+str;
                }
        };
        try {
                var tokens = [];
                var options = {};
                var arguments = [];
                for (var i = 0, item = process.argv[0]; i < process.argv.length; i++, item = process.argv[i]) {
                    if (item.charAt(0) == '-') {
                        if (item.charAt(1) == '-') {
                            tokens.push('--', item.slice(2));
                        } else {
                            tokens = tokens.concat(item.split('').join('-').split('').slice(1));
                        }
                    } else {
                        tokens.push(item);
                    }
                }
                var errMsg ="",errMsg0;
                while (type = tokens.shift()) {
                        errMsg = "is mandatory and was not given or is an error data!";
                    if (type == '-' || type == '--') {
                        var name = tokens.shift();
                        if (name == 'help' || name == '?') {
                            throw 'help';
                            continue;
                        }
                        var option = null;
                        for (var i = 0, item = schema[0]; i < schema.length; i++, item = schema[i]) {
                            if (item[type.length - 1] == name && item[type.length - 1]) {
                                option = item;schema
                                break;
                            }
                        }

						
                        if (!option) {
                            if(type == '--' && name =="") break;
							if(opt.strict)
								throw "Unknown option '" + type + name + "' encountered!";
							else
								continue; // ingnore
                        }
						if(typeof(option[4]) == 'string' && typeof option[5]=="undefined"){
							option[5] = option[4];
							option[4] = null;
						}
						var value = true;
                        if (option[2].indexOf(',') != -1){
                                option["#"] = option[2].replace(":","").replace("!","").replace("+","").split(",");
                        }
                        if ((option[2].indexOf(':') != -1 || option["#"] instanceof Array) && !(value = tokens.shift())) {
                            throw "Option '" + type + name + "' " +(option[5] ?  option[5] :"expects a parameter!");
                        }
                        var index = option[1] || option[0];
                        if (option[2].indexOf('+') != -1 ) {
                                if(option["#"] instanceof Array){
                                        if(option['#'].indexOf(value) != -1){
                                                options[index] = options[index] ? options[index] : [];
                                                if(options[index].indexOf(value) == -1)
                                                        options[index].push(value);
                                        }else{
                                                errMsg = "The value must be ine of this items < "+ option['#'].join(", ") +" >";
                                                break;
                                        };
                            }else {
                                options[index] = options[index] ? options[index]+1 : 1;
                            }
                        } else if(option["#"] instanceof Array){
                                if(option['#'].indexOf(value) != -1){
                                options[index] =  value;
                            }else{
                                errMsg = "The value must be ine of this items < "+ option['#'].join(", ") +" >";
                                break;
                            };
                        }else {
                            options[index] = value;
                        }
                        if (typeof(option[4]) == 'function') {
                            if(errMsg = option[4].call(options,value)){
                                throw "Option '" + (option[1] ? '--' + option[1] : '-' + option[0] ) + "' " +(
                                             option[5] ?  option[5] : errMsg);
                                break ;
                            };
                        }
                        option[2] = option[2].replace('!', '');
                    } else {
                        arguments.push(type);
                        continue;
                    }
                }
                for (var i = 0, item = schema[0]; i < schema.length; i++, item = schema[i]) {
                    if (item[2].indexOf('!') != -1) {
                        throw "Option '" + (item[1] ? '--' + item[1] : '-' + item[0] ) + "' " +(
                             item[5] ?  item[5] : errMsg);
                    }
                }
                options[opt.args] = tokens;
                for(var i=2;i<arguments.length;i++)
                        options[opt.args].push(arguments[i]);
                if(errMsg = opt.onArgs.apply(opt,options[opt.args])){
                        throw option[5] ?  option[5] :(errMsg || "Error Bad Arguments");
                }
        } catch(e) {
                if (e == 'help') {
                    opt.log("Usage:\n\t"+opt.script+" «options» "+opt.values+"\n");
                    if(opt.desc){
                        opt.log("\nDescription:\n"+opt.desc+"\n");
                    }
                    opt.log("Options:");
                    for (var i = 0, item = schema[0]; i < schema.length; i++, item = schema[i]) {
                        var names = (item[0] ? '-' + item[0] + (item[1] ? '|' : ''): '   ') +
                                    (item[1] ? '--' + item[1] : '');
                        var values =  item[2].replace(":","").replace("!","").replace("+","").split(",");
                        var syntax = names + (item[2].indexOf(':') != -1 ? ' «value»' : (
                                values[0] != "" ? ' «'+values.join("|")+'»': ''
                        ));
                        syntax += syntax.length < 20 ? new Array(20 - syntax.length).join(' ') : '';
                        opt.log((item[2].indexOf('!') != -1 ? 'o' : '-')
                     + (item[2].indexOf('+') != -1 ? 'm' : '-')
                     + (values[0] != "" ? 'l' : '-')
                     +"\t"
                     + syntax + "\n\t\t" + item[3]);
                    }
                    opt.log("\n[REMARKS]\n    o : mandatory option\n    m : repeatable option\n    l : value must be in the list of option\n");
                    if(opt.help){
                        opt.log("\nHelp:\n"+opt.help+"\n");
                    }
                    if(!opt.exit){
                        return {
                                error : opt.dbg,
                                code : 0
                        }
                    }else{
                        console.log(opt.dbg);
                        process.exit(0);
                    }
                }
                opt.log(e);
                opt.log("Use  the -? or --help option for usage details.");
                if(!opt.exit){
                return {
                        error : opt.dbg,
                        code : 1
                }
            }else{
                console.log(opt.dbg);
                    process.exit(1);
                }
        }
        return options;
}
module.exports = options;
