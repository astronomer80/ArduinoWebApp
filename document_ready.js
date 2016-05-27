
/*Run on page loaded*/
$(document).ready(function() {		
	
	//Get the address from URL
	arduino_address=getUrlVars()["arduino_address"];
	if((arduino_address+"")!='undefined'){				
		if (arduino_address=="") arduino_address=="linino.local";
		$("#arduino_address").val(arduino_address);
	}
	//Get the name of the board from URL
	arduino_board=getUrlVars()["arduino_board"];
	if((arduino_board+"")!='undefined'){				
		if (arduino_board=="") arduino_board=="unowifi";
		$("#arduino_board").val(arduino_board);
	}

	//Manage how panel show
	if(localStorage.default_panel=="showgpio")
		showgpio();
	else
		configgpio_unowifi();

	//Desktop event
	$('.pwmvalue').mousemove(function(){
            var value = $(this).val();
            var id = $(this).attr('id');
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

	$('#config_name').click(function(){
		value=$(this).val();
		index=$(this).index()
		setUrlVars("config_name", value);		
        });
		
	
	document_loaded();
	
	$('.mobilespacing').hide();
	
	//Check if the page is on a frame
	if(inIframe()){
		$('.hiddenoniframe').hide();
		$('.showoniframe').show();
	}
	else{
		$(".hiddenoniframe").show();
		$('.showoniframe').hide();
	}
	
	get_stored_configs();
	
});


/**
Store the configuration panel on the local storage
*/
function store_config_panel(config_name){
	//if(config_name=="")
	//	config_name=getUrlVars()["config_name"];
	var data=""
	console.log("store_config_panel "+config_name);
	$('.gpio_name').each(function(index){        
		var name= $(this).attr('id');	    
		name=name.replace("_config", "");
		var value= $(this).val();	    
		var type = $('#'+name + '_type option:selected').text();
		data+=name + ';'+value+';'+type+'\n';
		
		//sendCommand(command);
		});	
	localStorage.setItem("gpio_config:"+config_name, data);
	console.log(localStorage.getItem("gpio_config:"+config_name));
	setUrlVars("config_name", config_name);
}

/**
Get the configuration panel from the local storage. The last configuration stored
*/
function get_config_panel(config_name){
	console.log(config_name);
	//config_name="Test4";
	if(config_name=="")
		config_name=getUrlVars()["config_name"];
	
	//console.log(localStorage.gpio_config);	
	if (localStorage.getItem("gpio_config:"+config_name) === null){
		create_first_configuration();
		config_name="default";
	}

	var rows = localStorage.getItem("gpio_config:" + config_name).split("\n");
	
	console.log(rows);
	$.each(rows, function( index, value ) {
		var data = value.split(";");		
		//console.log(data[1]);		
		$('#'+data[0]+"_config").val(data[1]);
		$('#'+data[0]+'_type').val(data[2]);
	});	
}

function create_first_configuration(){
	console.log("create_first_configuration");
	var data="";
	//Digital pins	
	for(i=0;i<=13;i++){
		data+="D"+i+";D"+i+";digitalout\n";
	}
	
	//For each Analog PIN
	for(i=0;i<=5;i++){
		data+="A"+i+";A"+i+";digitalout\n";	
	}
	localStorage.setItem("gpio_config:default", data);
	localStorage.setItem("gpio_config_list","default");
}

function get_stored_configs(){
	
	console.log(localStorage.gpio_config_list);
	var list=localStorage.gpio_config_list.split(";");
	config_name=getUrlVars()["config_name"];
	ret="";
	$.each(list, function( index, value ) {		
		if(value!="default"){
			if(config_name==value)			
				$('#config_name').append('<option selected value='+value+'>'+value+'</option>');                  
			else
				$('#config_name').append('<option value='+value+'>'+value+'</option>');
			ret=value;
		}
	});
	

	return ret;
}


function document_loaded(){
	
}
