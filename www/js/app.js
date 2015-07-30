
var global = {
	userData: {},
	apiPath: 'http://nda.campviews.com/api/',
	accessToken: 'diabetes8',
	loading: false,
	selectedCamp: 0,
	navColor : 'bar-stable',
	camper: {},
	editData: false,
};

var cache = {
	apiReturn: {},
	postData: {}
};

var appdb = {
    initialize: function() {
        global.db = window.openDatabase("ndadb", "1.0", "CampAppData", 5000000);
        global.db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS campers (camper_id,name,dob,sex,school,shirt_size,pic)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS checks (camper_id, station_id, camp_id, label, value, PRIMARY KEY (camper_id, station_id, camp_id, label))');
            tx.executeSql('CREATE TABLE IF NOT EXISTS cmlogs (id unique, camper_id, camp_id, date, tod, glucose, insulin1, insulin2, insulin3, carbs, pumpchange, medications, note, initials)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS camper_data (camper_id unique, label, value, form_id, form_name)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS api_cache (api,data,multi)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS handshake (id unique,user_id,key)');
        },function() { appdb.errorCB('db init errors') }, function() { appdb.successCB('db init complete') });
    },
    successCB: function(msg) {
        console.log(msg);
    },
    errorCB: function(error) {
        console.log(error);
    }
};
	
	function getCurrentCamp(){
		var camp_id = 0;
		if(global.selectedCamp!==0){
			camp_id = global.selectedCamp;
		}else
		if(localStorage.getItem('selectedCamp')){
			camp_id = localStorage.getItem('selectedCamp');
		}
		
		return camp_id;
	}

	
var cv = angular.module('campviews', ['ionic', 'ngCordova', 'jett.ionic.filter.bar', 'campviews.controllers', 'campviews.services', 'campviews.factory', 'campviews.filters', 'campviews.directive', 'ngCordova', 'ngFileUpload']);


cv.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
    var $http,
        interceptor = ['$q', '$injector', function ($q, $injector) {
            var error;

            function success(response) {
                // get $http via $injector because of circular dependency problem
                $http = $http || $injector.get('$http');
                if($http.pendingRequests.length < 1) {
                    $('#loading').hide();
                }
                return response;
            }

            function error(response) {
                // get $http via $injector because of circular dependency problem
                $http = $http || $injector.get('$http');
                if($http.pendingRequests.length < 1) {
                    $('#loading').hide();
                }
                return $q.reject(response);
            }

            return function (promise) {
                $('#loading').show();
                return promise.then(success, error);
            }
        }];

    $httpProvider.interceptors.push(interceptor);
 

	var def = '/login';
	var $current = localStorage.getItem('user_login');
	if(global.selectedCamp>0 || localStorage.getItem('selectedCamp')){
		
		if(global.selectedCamp==0) global.selectedCamp = localStorage.getItem('selectedCamp');
		if( $current ){
			def = '/dashboard';	
		}
	}
	
	// Factory Ajax Calls
	var getCamps = function(CV_Camps) {
		return CV_Camps.getCamps();
    };
	
	var getCheckinForms = function(CV_Forms) {
		var forms = CV_Forms.getCheckinForms();
        return forms;
    };
	
	var getExitForms = function(CV_Forms) {
		var forms = CV_Forms.getCheckoutForms();
        return forms;
    };
	
	var getCamp = function(CV_Camps) {
		
        return CV_Camps.getCamp();
    };
		
	var getCampers = function(CV_Camps) {
        return CV_Camps.getCampersFromCamp();
    };
	
	var getAllCamperData = function() { 
		return {};
	}
	
	var getCheckinData = function(CV_Forms,$stateParams) {
		
        return CV_Forms.getCheckinValues($stateParams.form_id,$stateParams.camper_id);
    };
		
	var getLogForms = function(CV_Camps,$stateParams) {
        return CV_Camps.getLogForms($stateParams);
    };
	
	var getCamper = function(CV_Camper,$stateParams) {
		var camper_id = $stateParams.camper_id;
		
		if(!camper_id) return false;
		
        return global.camper = CV_Camper.getCamper(camper_id);
    };
		
  $urlRouterProvider.otherwise(def);

  $stateProvider
  
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl',	
	require: ['ionicPopup'],
  })
  .state('camps', {
    url: '/camps',
    templateUrl: 'templates/camps.html',
    controller: 'CampsCtrl',
	require: ['ionList', '^?$ionicScroll'],
  	resolve: { 
		camps: getCamps
	}
  }).state('app', {
	abstract: true,  
    templateUrl: "templates/menu.html",
	cache: false,
    controller: 'AppCtrl',
  	resolve: { 
		campData: getCamp,
	}
  }).state('app.dashboard', {
    url: '/dashboard',
	views: {
		'menuContent' : {
		    templateUrl: 'templates/dashboard.html',	
			controller: 'MainCtrl',
			resolve: {
				campData: function() { return {}; },
				otherData: function() { return {}; },	
			}
		},
	},
	require: ['ionList', '^?$ionicScroll'],
 }).state('app.campers', {
    url: '/campers',
	cache: false,
	views: {
		'menuContent' : {
			cache: false,
		    templateUrl: 'templates/campers.html',	
			controller: 'MainCtrl',
			resolve: { 
				campData: getCampers,
				otherData: function() { return {}; },	
			}
		},
	},
	require: ['ionList', '^?$ionicScroll'],
  }).state('app.camper', {
    url: '/camper/:camper_id',
	cache: false,
	views: {
		'menuContent' : {
			cache: false,
		    templateUrl: 'templates/camper.html',	
			controller: 'CamperCrtl',
		},
	},
	require: ['ionList', '^?$ionicScroll'],
  }).state('app.camperSelected', {
    url: '/checkin/:camper_id',
	cache: false,
	views: {
		'menuContent' : {
		    templateUrl: 'templates/checkinForms.html',	
			controller: 'checkinForms',
 		},
	},
	require: ['ionList', '^?$ionicScroll'],
 }).state('app.checkin', {
    url: '/checkin',
	cache: false,
	views: {
		'menuContent' : {
			cache: false,
		    templateUrl: 'templates/campers.html',	
			controller: 'MainCtrl',
			resolve: { 
				campData: getCampers,
				otherData : getCheckinForms,	
			}
		},
	},
	require: ['ionList', '^?$ionicScroll'],
  }).state('app.checkinSelected', {
    url: '/checkin/:camper_id/:form_id',
	cache: false,
	views: {
		'menuContent' : {
			cache: false,
		    templateUrl: 'templates/checkinForm.html',	
			controller: 'checkinForm',
			resolve: { 
				checkinData: getCheckinData,
			}
		},
	},
	require: ['ionList', '^?$ionicScroll'],
 }).state('app.logSheets', {
    url: '/logsheets',
	cache: false,
	views: {
		'menuContent' : {
		    templateUrl: 'templates/campers.html',	
			controller: 'MainCtrl',
			resolve: { 
				campData: getCampers,
				otherData : function() { return {}; }	
			}
		},
	},
	require: ['ionList', '^?$ionicScroll'],
  }).state('app.logSheet', {
    url: '/logsheets/:camper_id',
	cache: false,
	views: {
		'menuContent' : {
		    templateUrl: 'templates/logSheet.html',	
			controller: 'logBuilder',
			resolve: { 
				logForms : getLogForms,	
			}
	},
	},
	require: ['ionList', '^?$ionicScroll'],
  }).state('app.logForm', {
    url: '/logsheets/logform/:camper_id/:form_id/:time_of_day/:day',
	cache: false,
	views: {
		'menuContent' : {
		    templateUrl: 'templates/logForm.html',	
			controller: 'logForm',
			resolve: {
				logForms : getLogForms	
			}
		},
	},
	require: ['ionList', '^?$ionicScroll'],
  }).state('app.checkout', {
    url: '/checkout',
	cache: false,
	views: {
		'menuContent' : {
		    templateUrl: 'templates/campers.html',	
			controller: 'MainCtrl',
			resolve: { 
				campData: getCampers,
				otherData : function() { return {}; }	
			}
		},
	},
	require: ['ionList', '^?$ionicScroll'],
  }).state('app.checkoutForm', {
    url: '/checkout/:camper_id',
	cache: false,
	views: {
		'menuContent' : {
		    templateUrl: 'templates/check_out_forms.html',	
			controller: 'checkoutForms',
			resolve: { 
				exitForms : getExitForms,
			}
		},
	},
	require: ['ionList', '^?$ionicScroll'],
  });
  	// LEFT OFF HERE -- Need to create multiple views for dashboard
	/*
	 - dashboard
	   - check-in
		   - campers (maybe this can be integrated into checkin)
	     - live-checkin
		 - checkin-camper
		 - take-photo
	   - logs
	     - view-logs (camper_id specific)
		 - add-edit-log-form
		 - add-edit-comment-form
	   - checkout
	   
	*/

});

cv.run(function($rootScope, $ionicPlatform) {
  appdb.initialize();
  
  $rootScope.global = global;
  
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
});




