//arduino_address defualt address
var arduino_address="linino.local";
$("#arduino_address").val(arduino_address);


/**
Show the list of the gpio in the command panel
*/
function showgpio(){
	//Manage buttons
	$('#controlpanelbutton').hide();
	$('#configpanelbutton').show();
	localStorage.setItem("default_panel", "showgpio");

	
	var out="<table class=showgpio_table>";
	console.log(localStorage.gpio_config);		
	var rows = localStorage.gpio_config.split("\n");
	$.each(rows, function( index, value ) {
		var data = value.split(";");		
		var i=index;
		var pin_name=data[1]; //Name of the pin
		var pin_type=data[2]; //Type of the pin
	
		if(typeof pin_name !== "undefined" && pin_type!="hide"){
			out+="<tr class=gpio>";
			out+="<td class=label><span class=label>"+pin_name+"</span></td>";
			if(pin_type=="pwm"){
				//out+="<table><tr>";
				out+="<td class=slider><input class=\"pwmvalue\" id=D"+i+"_command type=\"range\" min=\"0\" max=\"1023\" value=0></td>";
				out+="<td class=value><output type=text size=4 id='D"+i+"-output'>0</output></td>";
				//out+="</tr></table>";
			}else if(pin_type=="digitalout"){
				//out+="<table style='display:block'><tr>";
				//out+="<td class=commandtd><button onclick='sendCommand(\"digital/"+i+"/1\");' id=D"+i+" class='command'>ON</button></td>";		
				//out+="<td class=commandtd><button onclick='sendCommand(\"digital/"+i+"/0\");' id=D"+i+" class='command'>OFF</button></td>";		
				out+="<td class=commandtd_show>";
				out+="<button onclick='sendCommand(\"digital/"+i+"/1\");' id=D"+i+"_command class='command'>ON</button> ";
				out+="<button onclick='sendCommand(\"digital/"+i+"/0\");' id=D"+i+"_command class='command'>OFF</button>";
				out+="</td>";
			
				//out+="</tr></table>";
			}else if(pin_type=="digitalread"){
				out+="<td class=value><output type=text size=4 id=\"A"+i+"_command\">OFF</output></td>";							
			}else if(pin_type=="analog"){
				out+="<td class=value><output type=text size=4 id=\"A"+i+"_command\">0</output></td>";				
			}
		}
		
		out+="</tr>";		
	});
	
	out+="</table>";
	$('#gpio').html(out);	

	handle_commands();
}

function handle_commands(){
	//Desktop event
	$('.pwmvalue').mousemove(function(){
            var value = $(this).val();
            var id = $(this).attr('id');
			id=id.replace("_command", "");
            $('#'+id+'-output').text(value);
        });

	$('.pwmvalue').mouseup(function(){
            var id= $(this).attr('id');
	    var command=id+'/value:' + this.value;
	    sendCommand(command);
        });

	//Touch event
	$('.pwmvalue').bind('touchmove',function(e){
	    var value = $(this).val();
            var id = $(this).attr('id');
            $('#'+id+'-output').text(value);
	});

	$('.pwmvalue').bind('touchend',function(e){
	    var id= $(this).attr('id');
	    var command=id+'/value:' + this.value;
	    sendCommand(command);
	});

	$('.command').click(function(){
        var command= $(this).attr('id');	    
	    sendCommand(command);
        });
	
}

/**
Print the select option type for single gpio
*/
function gpiotype(id, analog, pwm){
	var out="";
	out+="<select name=" + id + " id="+id+"_type class='gpio_type'>";
	out+="<option name=digitalout value=digitalout >digitalout</option>";
	out+="<option name=digitalread value=digitalread >digitalread</option>";
	if(analog)
		out+="<option name=analog value=analog >analog</option>";
	if(pwm)
		out+="<option name=pwm value=pwm >pwm</option>";
	out+="<option name=hide value=hide title='The pin will not appears on the control panel'>hide</option>";
	out+="</select>";
	return out;
}

/**
Create the configuration panel
*/
function configgpio_unowifi(){
	$('#controlpanelbutton').show();
	$('#configpanelbutton').hide();
	localStorage.setItem("default_panel", "configgpio_unowifi");
	
	var out="<table>";
	
	//For each Digital PIN
	for(i=0;i<=13;i++){
		out+="<tr class=gpio>";
		out+="<td ><span class=label>Pin name for D"+i+"</span></td>";
		out+="<td ><input class=gpio_name type=text id=D"+i+"_config value=D"+i+" ></td>";
		out+="<td ><span class=\'label\'>Pin function</span></td>";
		if(i==3 || i==5 || i==6 || i==9 || i==10 || i==11)
			out+="<td class=commandtd>" + gpiotype("D"+i, false, true) + "</td>";		
		else
			out+="<td class=commandtd>" + gpiotype("D"+i, false, false) + "</td>";		
		out+="</tr>";		
	}
	
	//For each Analog PIN
	for(i=0;i<=5;i++){
		out+="<tr class=gpio>";
		out+="<td ><span class=label>Pin name for A"+i+"</span></td>";
		out+="<td ><input class=gpio_name type=text id=A"+i+"_config value=A"+i+" /></td>";
		out+="<td ><span class=label>Pin function</span></td>";
		out+="<td class=commandtd>" + gpiotype("A"+i, true, false) + "</td>";				
		out+="</tr>";		
		out+="";		
	}
	out+="</table>";
	$('#gpio').html(out);		
	
	//Get data from localStorage
	get_config_panel();
	
	$('.gpio_name').change(function(){
		store_config_panel();
	});
	$('.gpio_type').change(function(){
		store_config_panel();	
	});
}
/**
Check if the page is on an iFrame 
*/
function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

/*
Show or hide the passed id
*/
function showhide(id){
	if ($('#'+id).is(":hidden")) 
	   $('#'+id).show();
	else
	   $('#'+id).hide();
}


/**
A setup function for ajax commands
*/
function setup(){
	$.ajaxSetup({
		crossDomain : true,
		dataType: "jsonp", 
		xhrFields: { withCredentials: true},
		type: 'GET'
	});
	
	//bind the address to the URL
	arduino_address = $("#arduino_address").val();
	arduino_board = $("#arduino_board").val();
	
	var host="http://" + arduino_address + "/arduino/";		

	//on the boards with the ESP8266 needs to add custom coammand
	/*
	if(arduino_board=="unowifi"){
	   host="http://" + arduino_address + "/arduino/custom/";
	}*/
	
	//If you want store this page on your YUN you have to uncomment this part	
	//host="/arduino/";
	
	return host;
}

/**
Handle the address to store the data in the URL
*/
function linkhandler(a){
	a.href="?" + a.href.split("?")[1];
	var val = '&arduino_address=' + $("#arduino_address").val();	
	
	a.href=a.href + val;
	a.href = a.href.replace(val+val,val);
}

/*
Javascript function to send REST commands to your Arduino Board.
*/
function sendCommand(command) {			
	var host=setup();
	$.get(host + command, function(data){});

	/*
	Alternative way but remove ajax setup
	$.ajax({
		crossDomain : true,
		dataType: "jsonp", 
		xhrFields: { withCredentials: true}	,
		type: 'GET',			
		url: "http://"+host+"/arduino/" + data
	
	});
	*/
	
	if(command=="THROWSPONGE"){
	  alert("NOW USER, PICK UP THE SPONGE!");
	}
}

/*
Handle slider command
*/
function sendpwmvalue(me){
	var id= $(me).attr('id')
	var command=id+'/value:' + me.value;
	sendCommand(command);
}

function outputSliderValue(me){
	var id= $(me).attr('id')
	$('#'+id+'-output').text(value);
}

/**
Store cookies
*/
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

/**
Retrive cookies
*/
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

/*
Get variables from URL
*/
function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value;
	});
	return vars;
}

/*
Store a variable on the URL
*/
function setUrlVars(variable, value) {	
	//window.open(window.location.href + '?Commands', '_self');
	locationval=window.location.href;
		
	//Add ? if there isn't
	if(locationval.indexOf("?")==-1)
		locationval+="?";
	
	//Check if the variable is present in the url
	if((getUrlVars()[variable]+"")!="undefined"){		
		var rep = variable + "=" + getUrlVars()[variable];
		var locationtmp = (locationval+"").replace(rep, "");		
	}else
		locationtmp = locationval;
	var tmp = locationtmp + '&' + variable +"="+value;	
	var newlocation = tmp.replace("&&", "&");	
	window.open(newlocation, '_self');
}

function reset_data(){
	if(confirm("Are you sure?")){
		create_first_configuration();
		window.open(window.location.href, '_self');	
	}
}

