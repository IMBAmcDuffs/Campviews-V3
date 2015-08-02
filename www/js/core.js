// Core.js is the listing for the main services and thigns we need to make stuff happen
var $ = jQuery;

var testData = {
	user: {
		name: 'admin',
		password: 'test',
		key: 'yes'	
	}
}
 
var core = {
	debug: function(data,name){
		//console.log(name, JSON.stringify(data));
	},
	getCurrentCamp: function(){
		var camp_id = 0;
		if(global.selectedCamp!==0){
			camp_id = global.selectedCamp;
		}else
		if(localStorage.getItem('selectedCamp')){
			camp_id = localStorage.getItem('selectedCamp');
		}
		
		return camp_id;
	},
	ajaxPost: function($http,req) {
		$http(req).
		success(function(data, status, headers, config) {
			cache.request = data;
			//console.log(data.status);
			//console.log('ajaxpost - status');
			//console.log(data.key);
			//console.log('ajaxpost - key');
		}).
		error(function(data, status, headers, config) {
			
		});
	},
}