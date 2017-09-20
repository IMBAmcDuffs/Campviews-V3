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
	//console.log(camps, 'The Camps');
	
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
	// make sure we remove any campers that come back undefined...

	$scope.global = global;	
  
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
		localStorage.removeItem('single_camp_data');
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
	var savedCampData = JSON.parse(sessionStorage.getItem('single_camp_data'));
	
	if(savedCampData){
		if(!global.camp) {
			global.camp = savedCampData.camp;
			global.forms = savedCampData.forms;
			global.cabins = savedCampData.cabins;
		}
	}
	
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
			$scope.items = $items;
			getDexcomData();
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
		case 'checkout':
			$scope.page_title = 'Camper Check Out - Select Camper to begin';
			var checked_in = {};
			// this should only be a list of campers who have completed a majority of the check in process
			/*
			var _c = Object.keys($items).length;
			if(_c>0){
				var $c = 0;
				for(var i = 0; i<_c; i++){
					var filled = Object.keys($items[i].checkins).length-2;
					
					if($items[i].checked_in > filled){
						checked_in[$c] = $items[i];
						$c++;
					}
					
				}
			}
			*/
			
			$scope.end_count_message = 'ready to be checked out.';
			$scope.secondary_count_message = '';
			var checked_out = 0;
			//console.log(global);
			if(typeof global.checked_out_count !== "undefined"){
				checked_out = global.checked_out_count;	
				var camper_count = Object.keys(global.campers).length+checked_out;
				
				if(checked_out>0){
					$scope.secondary_count_message = 'The system can see that '+checked_out+' out of '+camper_count+' campers have been checked out.';
				}
			}
			
			
						
			
			$scope.items = $items;
		break;
	}
	$scope._c = Object.keys($scope.items).length;
  }

  function assignDexcomData(camperArrayKey, data){
	$scope.items[camperArrayKey].dexcom = data;
	// angular.toJson();
  }

  function getSingleDexcomData(camperData, camperArrayKey, callback){
  	// callback(camperArrayKey, 'test 1.99' + camperData.id);
  	$http.get('http://campviews.com/oauth/getDexcomEgvs.php?camper_id=' + camperData.id)
  		.success(function(data, status, headers, config) {
  			callback(camperArrayKey, 'test 1.99' + camperData.id);
		}).error(function(data, status, headers, config) {
			// show some error
			callback(camperArrayKey, 'error returned');
		});	
  }

  function getDexcomData(){
  	angular.forEach($scope.items, function(value, key) {
  		// get the dexcom data for this camper
  		getSingleDexcomData(value, key, assignDexcomData);
  		// $scope.items[key].dexcom = 'test 1.35';
	});
  }
  
  loadItems();
    
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
 
cvCont.controller('checkinForms', ['$scope', '$document', '$stateParams', '$location', 'CV_Camper', 'CV_Forms', '$cordovaCamera', 'camperData', function($scope, $document, $stateParams, $location, CV_Camper, CV_Forms, $cordovaCamera, camperData) {
 	$scope.camper_id = 0;
	$scope.global = global;
	if($stateParams.camper_id){
		$scope.camper_id = $stateParams.camper_id;
	}
	
	CV_Camper.getCachedCamper($stateParams.camper_id); 
	$scope.picture = '';
	
	
	$scope.takePicture = function() {
		navigator.camera.getPicture(onSuccess, onFail, { 
			quality: 50,
			destinationType: Camera.DestinationType.DATA_URL,
			targetWidth: 500,
		    targetHeight: 500,
		});
		
		function onSuccess(imageData) {
			var image = document.getElementById('noImage');
			if(image){
				image.src = "data:image/jpeg;base64," + imageData;
			}
			var $image = document.getElementById('hasImage');
			if($image){
				$image.src = "data:image/jpeg;base64," + imageData;
			}
	
			var upload = CV_Camper.uploadImage(imageData, $stateParams.camper_id);
		}
		
		function onFail(message) {
			alert('Failed because: ' + message);
		}
    };
	
  	$('#loading').hide();
	
	$scope.camper = global.camper;
 	
}]);

cvCont.controller('CamperCrtl', ['$scope', '$document', '$stateParams', '$location', 'CV_Camper', 'CV_Forms', '$cordovaCamera', 'requestedForms', function($scope, $document, $stateParams, $location, CV_Camper, CV_Forms, $cordovaCamera, requestedForms) {
	"use strict";
	
	var neededForms = [5,6];
	var forms = {};
	
	if(typeof requestedForms !== "undefined"){
		var $forms = requestedForms.forms;
		var _c = Object.keys($forms).length;
		if(_c>0){
			var f = 0;
			for(var i = 0; i<_c; i++){
				var value = parseInt($forms[i].id);
				
				var check = $.inArray(value, neededForms);	
				if(check>=0){
					
					forms[value] = $forms[i];	
					f++;
				}
			}
		}
		
	}
	
 	$scope.camper_id = 0;
	$scope.global = global;
	if($stateParams.camper_id){
		$scope.camper_id = $stateParams.camper_id;
	}
	$scope.picture = '';
	
	
	$scope.takePicture = function() {
		navigator.camera.getPicture(onSuccess, onFail, { 
			quality: 50,
			destinationType: Camera.DestinationType.DATA_URL,
			targetWidth: 500,
		    targetHeight: 500,
		});
		
		function onSuccess(imageData) {
			var image = document.getElementById('noImage');
			if(image){
				image.src = "data:image/jpeg;base64," + imageData;
			}
			var $image = document.getElementById('hasImage');
			if($image){
				$image.src = "data:image/jpeg;base64," + imageData;
			}
	
			var upload = CV_Camper.uploadImage(imageData, $stateParams.camper_id);
		}
		
		function onFail(message) {
			alert('Failed because: ' + message);
		}
    };
	
	CV_Camper.getCachedCamper($stateParams.camper_id); 
	
  	$('#loading').hide();
	
	var camper = {};
	
	$scope.camper = camper = global.camper;
	
	$scope.cabinColor = '';
	
	$scope.checked_in = false;
	//console.log(camper.cabin, typeof camper.cabin);
	if(typeof camper.cabin === "object"){
		var ccolor = camper.cabin.name;
		ccolor = ccolor.toLowerCase().split(' ');
		
		if(typeof ccolor[1] !== 'undefined') {
			$scope.cabinColor = ccolor[0];	
		}
	
	}
	//console.log(camper);
	
	var camper_check_ins = camper.checkins;
	var total_check_ins = camper_check_ins.length;
	if(camper.checked_in === total_check_ins){
		$scope.checked_in = true;	
	}
	
	// lets get this users special form data
	//var parentGuardianForm = forms[5].values[0].value;
	var emergancyContactForm = forms[6].values[0].value;
	
	
	
	//console.log(parentGuardianForm,emergancyContactForm,forms);
	
	
	//$scope.parentGuardianForm = parentGuardianForm;
	$scope.emergancyContactForm = emergancyContactForm;

	var dexcomapi = {
	    authorize: function(options) {
	        // var deferred = $.Deferred();
	        // Build the OAuth consent page URL
	        var authUrl = 'https://api.dexcom.com/v1/oauth2/login?' + $.param({
	            client_id: options.client_id,
	            redirect_uri: options.redirect_uri,
	            response_type: options.response_type,
	            scope: options.scope
	        });

	        //Open the OAuth consent page in the InAppBrowser
	        cordova.InAppBrowser.open(authUrl, '_blank', 'location=no');
	        // var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');

	        // return deferred.promise();
	        return true;
	    },
	    sanboxAuthorize: function(options) {
	        // var deferred = $.Deferred();
	        // Build the OAuth consent page URL

	        // sanbox authentication endpoint
	        var authUrl = 'https://prod-33-dev-portal-410672946.us-east-1.elb.amazonaws.com/sandbox-login?' + $.param({
	            client_id: options.client_id,
	            redirect_uri: options.redirect_uri,
	            response_type: options.response_type,
	            scope: options.scope
	        });

	        //Open the OAuth consent page in the InAppBrowser
	        cordova.InAppBrowser.open(authUrl, '_blank', 'location=no');
	        // var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');

	        // return deferred.promise();
	        return true;
	    }
	};
	
 	$scope.callDexcomLogin = function() {
	    alert('starting');
	    dexcomapi.authorize({
	        client_id: 'YpNZIG56O4uPVe7hDAjdyyyINN3wwP6f',
	        redirect_uri: 'https://campviews.com/oauth',
	        response_type: 'code',
	        scope: 'offline_access'
	    });
	    // .done(function(data) {
	        // accessToken = data.access_token;
	        // alert(accessToken);
	        // $loginStatus.html('Access Token: ' + data.access_token);
	        // console.log(data.access_token);
	        // console.log(JSON.stringify(data));
	        // getDataProfile();
	        // alert('finished');
	    // });

	}

	$scope.callDexcomSandboxLogin = function() {
	    alert('starting');
	    dexcomapi.sanboxAuthorize({
	        client_id: 'YpNZIG56O4uPVe7hDAjdyyyINN3wwP6f',
	        redirect_uri: 'https://campviews.com/oauth',
	        response_type: 'code',
	        scope: 'offline_access'
	    });
	    // .done(function(data) {
	        // accessToken = data.access_token;
	        // alert(accessToken);
	        // $loginStatus.html('Access Token: ' + data.access_token);
	        // console.log(data.access_token);
	        // console.log(JSON.stringify(data));
	        // getDataProfile();
	        // alert('finished');
	    // });

	}
}]);

cvCont.controller('checkoutForms', ['$scope', '$document', '$stateParams', '$location', 'CV_Camper', 'CV_Forms', 'exitForms', function($scope, $document, $stateParams, $location, CV_Camper, CV_Forms, exitForms) {
	"use strict";
	if(exitForms){
		CV_Camper.getCachedCamper($stateParams.camper_id); 
		
		//console.log(exitForms, 'after form pull');
		$scope.camper_id = 0;
		$scope.global = global;
		
		var $step = 0; // get ready for multiple forms this will be a step
		
		var camper = global.camper;
		$scope.camper = camper; 
		$scope.form = exitForms.forms[$step]; 
		$scope.form_id = $scope.form.id;
		$scope.camper_id = $stateParams.camper_id;
		$scope.camp_id = global.selectedCamp;
		
		
		//console.log($scope.form);
		if($stateParams.camper_id){
			$scope.camper_id = $stateParams.camper_id;
		}
		
		
		$scope.exitForms = exitForms = global.exit_forms;
		
		$scope.saveForm = function(form) {
			var type = 'checkout';
			var results = CV_Forms.saveForm(form, type);
		};
		
	}
}]);

cvCont.controller('checkinForm', ['$scope', '$cordovaCamera', '$state', '$document', '$stateParams', '$location', 'CV_Camper', 'CV_Forms', 'checkinData', 'checkinForm', function($scope, $cordovaCamera, $state, $document, $stateParams, $location, CV_Camper, CV_Forms, checkinData, checkinForm) {
	
	CV_Camper.getCachedCamper($stateParams.camper_id); 
	
	var form = checkinForm[0]; 
	
	var camper = global.camper;
	$scope.camper = camper; 
	$scope.form = form; 
	$scope.form_id = $stateParams.form_id;
	$scope.camper_id = $stateParams.camper_id;
	$scope.camp_id = global.selectedCamp;
	
	console.log(checkinData);
	
	$scope.saveForm = function(form) {
		var type = 'checkin';
		var results = CV_Forms.saveForm(form, type);
		//console.log(results);
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

	console.log(_checkinData);

	$scope.checkinData = _checkinData;
	
}]);

cvCont.controller('logForm', ['$scope', '$cordovaCamera', '$state', '$document', '$stateParams', '$location', '$ionicModal', '$ionicPopover', 'CV_Camper', 'CV_Forms', 'logForms', 'checkinForms', function($scope, $cordovaCamera, $state, $document, $stateParams, $location, $ionicModal, $ionicPopover, CV_Camper, CV_Forms, logForms, checkinForms) {
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
	var medicalForm = false;
	if(typeof checkinForms !== 'undefined') {
		if(typeof checkinForms[0] !== 'undefined'){
			medicalForm = checkinForms[0];
		}
	}
	$scope.medical_form = {};
	if(medicalForm){
		$scope.medical_form = medicalForm;
	}
	var form = logForms.forms[0]; 

	$scope.camper = camper; 
	$scope.form = form; 
	$scope.camper_id = $stateParams.camper_id;
	$scope.camp_id = global.selectedCamp;
	$scope.form_id = 331;
	$scope.time_of_day = TOD = $stateParams.time_of_day;
	$scope.date = DATE = $stateParams.day;
	$scope.user_id = global.userData.ID;	
	
	$scope.todNotes = [];

	if(form.values.length>0){
		var _values = $(form.values);
		$scope.todNotes = {};
		var $i = 0;
		_values.each(function() {
			// since we are buliding out Time of day notes we need to match it up properly
			var $value = $(this._v);
			var _tod = this.time_of_day;
			var _date = this.date;
			
			if($value.length > 0 && TOD === _tod) {
				// run through each of teh values to find out what one is the notes section
				$value.each(function(v) {
					var _label = this.label;
					
					if(_label === 'Notes'){
						$scope.todNotes[$i] = this;	
						$scope.todNotes[$i].tod = _tod;	
						$scope.todNotes[$i].date = _date;	
						$scope.todNotes[$i].ID = $i+'_'+_date;
						$i++;
					}
				});
			}
		});
	}
	
	$scope.todNoteCount = 0;
	
	$scope.limit = 2;
	
	if($scope.todNotes){
		$scope.todNoteCount = $($scope.todNotes).length;
	}
	$scope.medicalData = {};
	
	$scope.signatureData = false;
	
	$scope.modal = {};
	
	$scope.saveForm = function(form) {
		var type = 'log';
		var results = CV_Forms.saveForm(form, type);
		global.editData = false;
	};
	
	$scope.openLogNotes = function() {
		$('.previous-log-notes.large').removeClass('hidden').slideDown(500).stop();	
	};
	
	$scope.closeLogNotes = function() {
		$('.previous-log-notes.large').addClass('hidden').slideUp(500).stop();	
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
	
	$scope.$on('$destroy', function () { 
		global.editData = false;
	});
	
}]);

cvCont.controller('previousLogNotes', function($scope) {
	console.log($scope);
});

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
	var value_data = {};
	
	if(typeof _checkinData !== 'undefined') {
		value_data = _checkinData;
	}
	
	if(value_data!==null) {
		values = value_data;
	}
	
	field_value = '';
	// search the values for 
	var $values = $(values);
	if($values.length > 0) {
		var keys = Object.keys(values);
		if(keys.length > 0){
			for(i=0; i<keys.length; i++){
				var is_key = keys[i].search(field_id);
				
				if(typeof is_key === 'number' && is_key && is_key >= 0){
					field_id = keys[i];
				}
			}
		}
	}
	
	
	if(values['field_'+field_id]){
		field_value = values['field_'+field_id];
	}
	
	if(values[field_id]){
		field_value = values[field_id];	
	}
	
	console.log(field_value);
	
	$scope.checkinData = value_data;

	var field = formBuilder.makeField($scope.field,field_value);
	console.log(field);
	$scope.fieldHTML = $sce.trustAsHtml(field);
  $('#loading').hide();
	
}]);

cvCont.controller('logNote', ['$scope', '$timeout', 'CV_Camps', 'CV_Camper', 'CV_Forms', '$stateParams', '$location', function($scope, $timeout, CV_Camps, CV_Camper, CV_Forms, $stateParams, $location) {
	CV_Camper.getCachedCamper($stateParams.camper_id); 
	/*var values = {};
	values.camper_name = global.camper.first_name+' '+global.camper.last_name;
	values.camper_id = global.camper.id;
	values.camp_id = global.selectedCamp;*/
	var form = $scope.logForm;
	$scope.camper = global.camper;
	/*
	values.access_key = global.accessToken;
	values.form_type = 'note';
	values.user_id = global.userData.data.ID;
	*/
	$scope.noteData = $scope.values;
	$scope.noteData.form_values = {};
	$scope.noteData.form_values.note = '';
	//console.log($scope,'globals');

	$scope.addNote = function() {
		var noteData = $scope.noteData;
		if(typeof noteData !== 'undefined'){
			if(typeof noteData.form_values.note !== 'undefined') {
				if(noteData.form_values.note !== ''){
					// now we must save the note and refresh the note data
					save = CV_Forms.saveForm(noteData, 'note');
					save.then(function () {
						$scope.noteData.form_values.note = '';
						promise = CV_Camps.getLogNotes({camper_id:$scope.values.camper_id});
						promise.then(function($notes) {
							 $scope.updateNotes($notes.notes);
							 
							 $timeout(function() {
								 $scope.closePopover();
							 
							 });	
						});
					});
				}
			}
		}
		
		//console.log(noteData, $scope, 'addNote');
	};
	
	
}]);

cvCont.controller('logBuilder', ['$scope', '$sce', '$timeout', 'CV_Camper', '$stateParams', '$location', '$ionicPopup', '$ionicPopover', 'logForms', function($scope, $sce, $timeout, CV_Camper, $stateParams, $location, $ionicPopup, $ionicPopover, logForms) {
	
	CV_Camper.getCachedCamper($stateParams.camper_id); 
	
	var camper = global.camper;
	
	if(typeof camper.id === 'undefined'){
		$location.path('/logsheets');
	}
		
	  if(logForms.status === 'success'){	
	  if(!global.camp) global.camp = {}
		if(!global.camp.logForms) global.camp.logForms = {};
		global.camp.logForms = logForms.forms;
		$scope.logFroms = logForms.forms;
		
	  }
 
	
	$scope.camper = global.camper;
	$scope.camper_name = global.camper;
	$scope.camper_id = $stateParams.camper_id;
	$scope.logForm = form = logForms.forms[0];
	if(typeof logForms.forms[0].notes !== 'undefined'){
		$scope.camper_notes = logForms.forms[0].notes;
	}
	
	console.log('notes', $scope.camper_notes, logForms);

	$scope.logFields = form.fields;
	
	var logValues = form.values;
	
	$scope.noteData = {};
	
	var values = {};
	values.camper_name = global.camper.first_name+' '+global.camper.last_name;
	values.camper_id = global.camper.id;
	values.camp_id = global.selectedCamp;
	values.access_key = global.accessToken;
	values.form_type = 'note';
	values.user_id = global.userData.data.ID;
	
	$scope.values = values;
	
		$ionicPopover.fromTemplateUrl('templates/log-note.html', {
                scope: $scope,
		}).then(function(popover) {
                $scope.popover = popover;
		});

	$scope.openPopover = function($event) {
        $scope.popover.show($event);
	};
	
	$scope.updateNotes = function($notes) {
		$scope.camper_notes = $notes;
	};
	
	$scope.closePopover = function() {
		$scope.popover.hide();
		
	};
	//Cleanup the popover when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.popover.remove();
	});
	// Execute action on hide popover
	$scope.$on('popover.hidden', function() {
	// Execute action
	});
	// Execute action on remove popover
	$scope.$on('popover.removed', function() {
	// Execute action
	});
	
	$scope.processNote = function($note){
		return $sce.trustAsHtml($note);
	};
	
	$scope.timeOfDay = getTimeofDay($scope.logFields);
	var timeOfDay = {};
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
						var optTime = $opt[$i].value.split(':');
						var optN = optTime[1].split(' ');
						optN = optN[1].toLowerCase();
						
						optTime = optTime[0];
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
	//console.log(global.camp);
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
	$scope.maxDAYS = global.camp._length-1;
	$scope.dayOutput = output;
	$scope.timeOfDay = timeOfDay;
	
	$timeout(function(){$('#loading').hide();});
	  
	$scope.setIntervalScope = function($index){
		$scope.cur_i = $index;	
		
	};
	
	$scope.showValues = function($data){
		
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