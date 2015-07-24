var cvCont = angular.module('campviews.controllers', []);

cvCont.controller('LoginCtrl', ['$scope', '$timeout', '$ionicPopup', 'CV_Account', function($scope, $timeout, $ionicPopup, CV_Account) {
	CV_Account.check();
  $scope.login = function(user) {
	  if(user && user.name && user.password){
  		cache.user = { name: user.name, password: user.password};
		if(user){
			CV_Account.login();
		}else{
			// notify user to fix the form
		}
	  }
  }
  
}]);

cvCont.controller('CampsCtrl', ['$scope', '$document', '$location', '$timeout','camps', function($scope, $document, $location, $timeout, camps) {
	 
	$scope.camps = camps; 
	console.log(JSON.stringify(camps));
	console.log('Camps');
	
  $('#loading').hide();
	$scope.selectCamp = function(camp_id) {
		localStorage.setItem('selectedCamp', camp_id);
		
		global.selectedCamp = camp_id;
		global.user_info = localStorage.getItem('user_info');
		
		$location.path('/dashboard');
		
	}; 
}]);
 
cvCont.controller('AppCtrl', function($scope, $ionicHistory, $ionicModal, $location, $timeout, $location, campData) {
  // This is the main controller for the whole app. This will pass globals and is part of the menu scope
  if(campData){
	global.camp = campData.camp;
	global.forms = campData.forms;
	global.cabins = campData.cabins;
	
	var $current = localStorage.getItem('user_info');
	global.userName = $current;	
	global.userData = JSON.parse(localStorage.getItem('user_data'));
	$scope.global = global;	
  
	console.log('AppCtrl');
  }
  
  
  
  $scope.setNavColor = function($color){
	var _b = false;	
	$scope.page = page = $location.$$path.replace('/','');
	var params = page.split('/');
	if(params.length<  2 ){
		global.viewColor = $color;
	}
	
	if($color == 'back') {
	  $ionicHistory.goBack();
	}
	
  };
   
  
  $('#loading').hide();
  $scope.logout = function() {
	var $current = localStorage.getItem('user_login');
	if($current){
		localStorage.removeItem('user_login');
		localStorage.removeItem('user_info');
		$location.path('/login');
		delete global.selectedCamp;
		delete global.camp;
		delete global.campers;
		delete global.forms;
		delete global.campName;
		delete global.userName;
	}
  };
		
});

/* main controller unit */
cvCont.controller('MainCtrl', ['$scope', '$ionicFilterBar', '$timeout', '$stateParams', '$document', '$location', 'campData', 'otherData', function($scope, $ionicFilterBar, $timeout, $stateParams, $document, $location, campData, otherData) {
 "use strict";
  if(campData){
	global.campers = campData;  
	// make sure we remove any campers that come back undefined...
  }else{
		$location.path('/dashboard');
  } 
  
  $scope.activeFilter = false;
  
  function loadItems() {
	$scope.global = global;
	$scope.items = global.campers;
	var page = '';
	$scope.page = page = $location.$$path.replace('/','');
	
	$scope.URI = page;
	
	var $items = $scope.items;
	
	
	switch(page){
		case 'campers':
			$scope.page_title = 'Campers - Select Camper';
		break;
		case 'logsheets':
			$scope.page_title = 'Log Sheets - Select Camper';
		  if(otherData.status === 'success'){	
		  if(!global.camp) global.camp = {}
			if(!global.camp.logForms) global.camp.logForms = {};
			global.camp.logForms = otherData.forms;
			$scope.logFroms = otherData.forms;
		  }
		break;
		case 'checkin':
			$scope.page_title = 'Check In Forms - Select Camper';
			// lets apply our filters
			$scope.items = $items;
		break;	
	}
	$scope._c = Object.keys($scope.items).length;
  }
  
  loadItems();
  
  console.log(global);
  
  $scope.cabins = global.cabins;
		
    var filterBarInstance;

    $scope.showFilterBar = function () {
		
      filterBarInstance = $ionicFilterBar.show({
        items: $scope.items,
        update: function (filteredItems) {
		  $scope._c = Object.keys(filteredItems).length;
          $scope.items = filteredItems;
        },
      });
	  

    };

    $scope.refreshItems = function () {
      if (filterBarInstance) {
        filterBarInstance();
        filterBarInstance = null;
      }
		$('.search-button.bar').show();

      $timeout(function () {
        loadItems();
        $scope.$broadcast('scroll.refreshComplete');
      }, 1000);
    };
	
	$scope.filterResults = function(type) {
	$('#loading').show();
	$scope.activeFilter = type;
	var page = $location.$$path.replace('/','');
	if(page === 'logsheets' && type!=='everyone'){
		var id = type;
		type = 'logsheets';	
	}
	  if(type){
		$('.search-button.bar').hide();
		var items = {};
		var _items = global.campers;
		var _c = Object.keys(_items).length;
		var _i = 0;
		switch(type){
			case 'logsheets': 
				var cabin = parseInt(id);
				if(id > 0){
					if(_c > 0){
						for(var i = 0; i < _c; i++){
							if(typeof(_items[i]) !== 'undefined'){
								if(_items[i].cabin){
									if(_items[i].cabin.id === cabin) {
										items[_i] = _items[i];
										_i++;
									}
								}
							}
						} 
					}
				}
			break;
			case 'everyone':
				$('.search-button.bar').show();
				items = _items;
			break;	
			case 'not_checked':
				if(_c > 0){
					for(var i = 0; i < _c; i++){
						if(typeof(_items[i]) !== 'undefined'){
							if(_items[i].checked_in < 1) {
								items[_i] = _items[i];
								_i++;
							}
						}
					} 
				}
			break;
			case 'checking_in':
				if(_c > 0){
					for(var i = 0; i < _c; i++){
						if(typeof(_items[i]) !== 'undefined'){
							var checked_in = Object.keys(_items[i].checkins).length;
							if(_items[i].checked_in > 0 && _items[i].checked_in < checked_in) {
								items[_i] = _items[i];
								_i++;
							}
						}
					}
				}
			break;
			case 'checked_in':
				if(_c > 0){
					for(var i = 0; i < _c; i++){
						if(typeof(_items[i]) !== 'undefined'){
							var checked_in = Object.keys(_items[i].checkins).length;
							if(_items[i].checked_in === checked_in) {
								items[_i] = _items[i];
								_i++;
							}
						}
					}
				}
			break;
		}
		
		$scope._c = Object.keys(items).length;

 		$scope.items = items;
		setTimeout(function() { $('#loading').hide(); },1000);
	  }
	};
	
	
  
	$scope.aftertitle = '';
	
}]);
 
cvCont.controller('checkinForms', ['$scope', '$document', '$stateParams', '$location', 'CV_Camper', 'CV_Forms', '$cordovaCamera', function($scope, $document, $stateParams, $location, CV_Camper, CV_Forms, $cordovaCamera) {
 	$scope.camper_id = 0;
	$scope.global = global;
	if($stateParams.camper_id){
		$scope.camper_id = $stateParams.camper_id;
	}
	$scope.picture = '';
	
	
	$scope.takePicture = function() {
		navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
			destinationType: Camera.DestinationType.DATA_URL
		});
		
		function onSuccess(imageData) {
			var image = document.getElementById('noImage');
			image.src = "data:image/jpeg;base64," + imageData;
			console.log(imageData);
			var upload = CV_Camper.uploadImage(imageData, $stateParams.camper_id);
		}
		
		function onFail(message) {
			alert('Failed because: ' + message);
		}
    };
	
	CV_Camper.getCachedCamper($stateParams.camper_id); 
  	$('#loading').hide();
	
	$scope.camper = global.camper;
 	
}]);

cvCont.controller('checkoutForms', ['$scope', '$document', '$stateParams', '$location', 'CV_Camper', 'CV_Forms', function($scope, $document, $stateParams, $location, CV_Camper, CV_Forms) {
 	$scope.camper_id = 0;
	$scope.global = global;
	if($stateParams.camper_id){
		$scope.camper_id = $stateParams.camper_id;
	}
	
	CV_Camper.getCachedCamper($stateParams.camper_id); 
	
	$scope.camper = global.camper;
}]);

cvCont.controller('checkinForm', ['$scope', '$cordovaCamera', '$state', '$document', '$stateParams', '$location', 'CV_Camper', 'CV_Forms', 'checkinData', function($scope, $cordovaCamera, $state, $document, $stateParams, $location, CV_Camper, CV_Forms, checkinData) {
	CV_Camper.getCachedCamper($stateParams.camper_id); 
	
	var camper = global.camper;
	var form = CV_Forms.getCachedForm($stateParams.form_id); 
	
	$scope.camper = camper; 
	$scope.form = form; 
	$scope.form_id = $stateParams.form_id;
	$scope.camper_id = $stateParams.camper_id;
	$scope.camp_id = global.selectedCamp;
	
	
	$scope.saveForm = function(form) {
		var results = CV_Forms.saveForm(form);
	};
	checkinData = checkinData[0].fields;
	
  	$('#loading').hide();
	
	_checkinData = {};
	if(checkinData.length>0){
		$(checkinData).each(function(i,e){
			var value = this.user_value;
			var name = this.field_id;
			_checkinData[name] = value;
		});
			
	}
	$scope.checkinData = _checkinData;
	
}]);

cvCont.controller('logForm', ['$scope', '$cordovaCamera', '$state', '$document', '$stateParams', '$location', '$ionicModal', 'CV_Camper', 'CV_Forms', 'logForms', function($scope, $cordovaCamera, $state, $document, $stateParams, $location, $ionicModal, CV_Camper, CV_Forms, logForms) {
	CV_Camper.getCachedCamper($stateParams.camper_id); 
	
	var camper = global.camper;
	  if(logForms.status === 'success'){	
	  if(!global.camp) {
		   global.camp = {};
	  }
		if(!global.camp.logForms) {
		 global.camp.logForms = {};
		}
		global.camp.logForms = logForms.forms;
		$scope.logFroms = logForms.forms;
	  }

	var form = logForms.forms[0]; 
	console.log(global, 'globals');

	$scope.camper = camper; 
	$scope.form = form; 
	$scope.camper_id = $stateParams.camper_id;
	$scope.camp_id = global.selectedCamp;
	$scope.form_id = $stateParams.form_id;
	$scope.time_of_day = $stateParams.time_of_day;
	$scope.date = $stateParams.day;
	$scope.user_id = global.userData.ID;
	
	$scope.signatureData = false;
	
	$scope.modal = {};
	
	$scope.saveForm = function(form) {
		var results = CV_Forms.saveForm(form);
	};
	

	$scope.showSignature = function() {
		$('.main-signature-pad').slideDown(200);	
	};

	  
  	$('#loading').hide();
	
	// set data (mask as var _checkinData)
	_checkinData = {};
	
	// lets get the values and what not
	if(form.fields){
		for(var i = 0; i<form.fields.length; i++){
			var field_id = form.fields[i].meta_id;
			var m_value = form.fields[i].meta_value;
			
			if(m_value && typeof m_value !== 'object'){
				m_value = JSON.parse(m_value);
			}
			
			if(m_value.label === "Time of Day"){
				_checkinData['field_'+field_id] = $scope.time_of_day;
			}
			
			if(m_value.label === "Date") {
				_checkinData['field_'+field_id] = $scope.date;
			}
			
			if(global.editData !== false){
				var editData = global.editData;
				for(var $i = 0; $i<editData.length; $i++){
					console.log('field_'+field_id,editData[$i].field_id);
					if(editData[$i].field_id === 'field_'+field_id){
						if(editData[$i].field_id !== 'field_17440'){
							_checkinData['field_'+field_id] = editData[$i].value;
						}
					}
				}
			}
	}
	}
	
	
	// we need to put the correct signature if the doctor has one already
	if(global.userData.data){
		var signature = global.userData.data.signature;
		if(signature !== ''){
			_checkinData.field_17440 = $scope.signatureData = signature;	
		}
	}
	
}]);

cvCont.controller('SignatureCtrl', function($scope) {
    var canvas = document.getElementById('signatureCanvas');
    var signaturePad = new SignaturePad(canvas);
 
    $scope.clearCanvas = function() {
        signaturePad.clear();
    };
 
    $scope.saveCanvas = function() {
        var sigImg = signaturePad.toDataURL();
        $scope.signatureData = sigImg;
		// we should now put this data into the text box for signatures
		$('#field_17440').val(sigImg);
		if($('#field_17440').parent().find('img').length>0){
			$('#field_17440').parent().find('img').attr('src',sigImg);
		}else{
			$('#field_17440').before('<div class="item"><img width="400" src="'+sigImg+'" /></div>')	;
		}
		
		global.userData.data.signature = sigImg;
		
		$('#field_17440').parent().show();
		$('#field_17440').hide(); // make sure to hide the signature
		$('.main-signature-pad').slideUp(300);
		$('.append-to-signature').html('Change Signature');
    };
});

cvCont.controller('formBuilder', ['$sce','$scope', function($sce, $scope) {
	var field_id = $scope.field.meta_id;
	var values = {};	
	if(_checkinData!==null) {
		values = _checkinData;
	}

	field_value = '';
	if(values['field_'+field_id]){
		field_value = values['field_'+field_id];
	}
	
	
	$scope.checkinData = _checkinData;
	var field = formBuilder.makeField($scope.field,field_value);
	
	$scope.fieldHTML = $sce.trustAsHtml(field);
  $('#loading').hide();
	
}]);

cvCont.controller('logBuilder', ['$scope', '$timeout', 'CV_Camper', '$stateParams', '$location', '$ionicPopup', 'logForms', function($scope, $timeout, CV_Camper, $stateParams, $location, $ionicPopup, logForms) {
	
	CV_Camper.getCachedCamper($stateParams.camper_id); 
	
	var camper = global.camper;
		
	  if(logForms.status === 'success'){	
	  if(!global.camp) global.camp = {}
		if(!global.camp.logForms) global.camp.logForms = {};
		global.camp.logForms = logForms.forms;
		$scope.logFroms = logForms.forms;
	  }
 
	
	$scope.camper_name = global.camper;
	$scope.camper_id = $stateParams.camper_id;
	$scope.logForm = form = logForms.forms[0];
	
	$scope.logFields = form.fields;
	
	var logValues = form.values;
	
	
	$scope.timeOfDay = getTimeofDay($scope.logFields);
	var timeOfDay = {}
	if($scope.timeOfDay) {
		if($scope.timeOfDay.meta_value && typeof $scope.timeOfDay.meta_value !== 'object'){
			timeOfDay = JSON.parse($scope.timeOfDay.meta_value);
		}else{
			timeOfDay = $scope.timeOfDay.meta_value;
		}
	}
	
	$scope.editLogButton = function(editUrl,user_values) {
		if(editUrl){
		var confirmPopup = $ionicPopup.confirm({
			 title: 'Edit',
			 template: 'Are you sure you want to edit this entry? <br /><small>(This will still keep old data)</small>'
		   });
		   confirmPopup.then(function(res) {
			 if(res) {
				 global.editData = user_values;
				 $location.path(editUrl);
			 }
		   });	
		}
	};
	
	function getTimeofDay(fields){
		if(fields.length>0){
			for(i=0;i<fields.length;i++){
				if(fields[i].meta_key === 'formfield_001'){
					return fields[i];	
				}
			}
		}
	}
	
	$scope.maxTOD = i;
	function buildValueBlock(fields) {
		if(fields.length>0){
			var _fields = {};
			for(i=0;i<fields.length;i++){
				if(fields[i].meta_key !== 'formfield_001'){
					_fields[i] = fields[i];	
					//_fields[i] = JSON.parse(_fields[i].meta_value);
				}
			}
			
			return _fields;
		}
	}
	
	$scope.filterCurrent = function() {
		
		var _timeOfDay = {};
		if(timeOfDay){
			$opt = timeOfDay.options;
			$options = Object.keys($opt).length+1;
			var time = getTheTime();
			var req_n = time[time.length-1].split(' ');
			req_n = req_n[1].toLowerCase();
			var req_min_time = time[0]-1;
			var req_max_time = time[0]+1;
			
			if($options>0){
				for(var $i=1; $i<=$options; $i++){
					if($opt[$i]){
						console.log($opt[$i]);
						var optTime = $opt[$i].value.split(':');
						var optN = optTime[1].split(' ');
						optN = optN[1].toLowerCase();
						
						optTime = optTime[0];
						console.log(optTime);
						console.log(optN);
					}
				}
			}
		}
		var $tod = Object.keys(_timeOfDay).length;
		if($tod > 0){
			timeOfDay = _timeOfDay;
		}
	};
	
	function getTheTime() {
		var time = new Date();
		
		return time.toLocaleTimeString().replace(' PDT','').split(':');
	}
	
	function getTheDate(i){
		var _start = global.camp.start_date;
		var _end = global.camp.end_date;
		var _length = global.camp._length;
		
		var currentDate = new Date(_start);
		
		currentDate.setDate(currentDate.getDate()+i);
		
		_o = currentDate.getFullYear()+'-'+currentDate.getMonth()+'-'+currentDate.getDate();
		
		return _o;
	}
	
	var _length = global.camp._length;
	
	$('#loading').show();
	var output = {};
	dayOutput_length = 0;
	if(timeOfDay.options){
		$t = 1;
		$opt = timeOfDay.options;
		$options = Object.keys($opt).length+1;
		for($t=1; $t<$options; $t++){
			if(!timeOfDay.options[$t].days) { timeOfDay.options[$t].days = {}; }
			var tod = timeOfDay.options[$t].value;
			
			if(_length>0){
				var valueBlock = buildValueBlock($scope.logFields);		
				// we need to insert the proper data into the proper date so that everything matches up.
				var day_values = {};
				for(i=1; i<=_length+1; i++){
					if(!output[i]) { output[i] = {}; }
					var _date = getTheDate((i));
					timeOfDay.options[$t].days[i] = {};
					timeOfDay.options[$t].days[i].day = 'day'+i;
					timeOfDay.options[$t].days[i].date = _date;
					timeOfDay.options[$t].days[i].value = valueBlock;
					
					if(form.values){
						var $v = 0;
						var values = form.values;
						var $values = Object.keys(values).length;
						var user_values = {};
						for(v = 0; v<$values; v++){
							if(values[v].date){
								if(values[v].date === _date && values[v].time_of_day === tod) {
									user_values = values[v]._v;
								}
							}
						}
						
						var $user_values = Object.keys(user_values).length;
						if($user_values>0){
							timeOfDay.options[$t].days[i].user_values = user_values;
						}
					}
					
					dayOutput_length++;
				}
			}
		}
	}
	
	
	
	$scope.cur_i = 0;
	console.log(timeOfDay);
	$scope.maxDAYS = global.camp._length-1;
	$scope.dayOutput = output;
	$scope.timeOfDay = timeOfDay;
	
	  $timeout(function(){$('#loading').hide();});
	  
	$scope.setIntervalScope = function($index){
		$scope.cur_i = $index;	
		
	};
	
	$scope.showValues = function($data){
		console.log($data);
		
		return $data;	
	};
	
	$scope.getIndex = function($data,$index){
		$scope.cur_i = $index;
		
		return $data;	
	};
	
}]);


cvCont.controller('logRepeat', ['$scope','$location', function($scope, $location) {
	
	//build out the days of the event and output an array to the template
	
}]);
cvCont.controller('UserCtrl', ['$scope','$location', function($scope, $location) {
	// set some globals
	$scope.username = localStorage.getItem('user_info');
  $('#loading').hide();
	
	$scope.logoutUser = function() {
		var $current = localStorage.getItem('user_login');
		if($current){
			localStorage.removeItem('user_login');
			localStorage.removeItem('user_info');
			$location.path('/login');
		}
	}
	
	
	
}]);