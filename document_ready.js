
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
});


/**
Store the configuration panel on the local storage
*/
function store_config_panel(){
	var data=""
	console.log("store_config_panel");
	$('.gpio_name').each(function(index){        
		var name= $(this).attr('id');	    
		name=name.replace("_config", "");
		var value= $(this).val();	    
		var type = $('#'+name + '_type option:selected').text();
		data+=name + ';'+value+';'+type+'\n';
		
		//sendCommand(command);
		});	
	localStorage.setItem("gpio_config", data);
	console.log(localStorage.gpio_config);
	
}

/**
Get the configuration panel from the local storage. The last configuration stored
*/
function get_config_panel(){
	//console.log(localStorage.gpio_config);	
	var rows = localStorage.gpio_config.split("\n");
	$.each(rows, function( index, value ) {
		var data = value.split(";");		
		//console.log(data[1]);		
		$('#'+data[0]).val(data[1]);
		$('#'+data[0]+'_type').val(data[2]);
	});
	
}

function document_loaded(){
	
}