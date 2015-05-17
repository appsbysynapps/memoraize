angular.module('starter.services', ['firebase'], function($httpProvider){
   /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */ 
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
      
    for(name in obj) {
      value = obj[name];
        
      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }
      
    return query.length ? query.substr(0, query.length - 1) : query;
  };
    
  $httpProvider.defaults.headers.common = {};
  $httpProvider.defaults.headers.post = {};
  $httpProvider.defaults.headers.put = {};
  $httpProvider.defaults.headers.patch = {};
  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
})

.factory('Foods', function($firebase, $filter) {
  // Might use a resource here that returns a JSON array
  var ref = new Firebase("https://devour.firebaseio.com/foods");
  var sync = $firebase(ref);
  // download the data into a local object
  var syncObject = sync.$asObject();
  //syncObject.$bindTo($scope, "quizzes");

  return {
    all: function() {
      return sync.$asArray();
    },
    getRating: function(foodId) {
      var ref2 = ref.child(foodId+"/total_rating");
      var str = 0;
      ref2.once("value", function(data) {
          str = data.val();
      });
        
      return str;
    },
    getReviews: function(foodId) {
      var ref2 = ref.child(foodId+"/reviews");
      var x = $firebase(ref2).$asArray();
      return x;
    },
    getNumReviews: function(foodId) {
      var ref2 = ref.child(foodId+"/num_reviews");
      var str = 0;
      ref2.once("value", function(data) {
          str = data.val();
      });
        
      return str;
    },
    getName: function(foodId) {
      var ref2 = ref.child(foodId+"/name");
      var str = ""
      ref2.once("value", function(data) {
          str = data.val();
      });
        
      return str;
    },
    search: function(query) {
        return $filter('filter')(sync.$asArray(),function(food) {
          return !query || !food.name || (food.name.toLowerCase()).indexOf(query.toLowerCase())>-1;
      });
    },
    
    add: function(object) {
      return sync.$push(object);
    },
    
    updateTotal: function(id,total_rating,value) {
      ref.child(id).update({total_rating:value});
    },
    updateStars: function(id,stars,value) {
        console.log("stars"+value);
      ref.child(id).update({stars:value});
    },
    pushReview: function(id,value) {
      ref.child(id).child("reviews").push(value);
    },
    
  }
})

.factory('Restaurants', function($firebase) {
  // Might use a resource here that returns a JSON array
  var ref = new Firebase("https://devour.firebaseio.com/restaurants");
  var sync = $firebase(ref);
  // download the data into a local object
  var syncObject = sync.$asObject();
  //syncObject.$bindTo($scope, "quizzes");

  return {
    all: function() {
      return sync.$asArray();
    },
    getDishes: function(restaurantId) {
      var ref2 = new Firebase("https://devour.firebaseio.com/restaurants/"+restaurantId+"/dishes");
      return $firebase(ref2).$asArray();
    },
    addDish: function(object, restaurantId) {
      var ref2 = new Firebase("https://devour.firebaseio.com/restaurants/"+restaurantId+"/dishes");
      $firebase(ref2).$set(object, true);
    },
  }
})

.factory('Reviews', function($firebase) {
  // Might use a resource here that returns a JSON array
  var ref = new Firebase("https://devour.firebaseio.com/reviews");
  var sync = $firebase(ref);
  // download the data into a local object
  var syncObject = sync.$asObject();
  //syncObject.$bindTo($scope, "quizzes");

  return {
    all: function() {
      return sync.$asArray();
    },
    getContent: function(reviewId) {
      var ref2 = ref.child(reviewId+"/content");
      var str = 0;
      ref2.once("value", function(data) {
          str = data.val();
      });
        
      return str;
    },
    getRating: function(reviewId) {
      var ref2 = ref.child(reviewId+"/rating");
      var rat = 0
      ref2.once("value", function(data) {
          rat = data.val();
      });
        
      return rat;
    },
    getText: function(reviewId) {
      var ref2 = ref.child(reviewId+"/content");
      var str = ""
      ref2.once("value", function(data) {
          str = data.val();
      });
      return str;
    },
    get: function(reviewId) {
      var ref2 = new Firebase("https://devour.firebaseio.com/reviews/"+reviewId);
      return $firebase(ref2).$asObject();
    },
    add: function(object) {
      return sync.$push(object);
    },
  }
})

.factory("MyYelpAPI", function($http) {
  function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  }
  return {
      "retrieveYelp": function(name, callback, callbackint) {
          var method = 'GET';
          var url = 'http://api.yelp.com/v2/search';
          var params = {
                  callback: 'angular.callbacks._'+callbackint,
                  location: '20009',
                  oauth_consumer_key: 'YXGa4ru-gTal2YshH1sA8A', //Consumer Key
                  oauth_token: 'gmiTY407KpN0U4qdU2ea9BgJTXvianPF', //Token
                  oauth_signature_method: "HMAC-SHA1",
                  oauth_timestamp: new Date().getTime(),
                  oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
                  term: 'food'
              };
          var consumerSecret = 'bBHFOWAQyzK8JDTmBGnacSioY6c'; //Consumer Secret
          var tokenSecret = 'bR6DViXqQNm7Pu9JdUWxDWUWD2s'; //Token Secret
          var signature = oauthSignature.generate(method, url, params, consumerSecret, tokenSecret, { encodeSignature: false});
          params['oauth_signature'] = signature;
          $http.jsonp(url, {params: params}).success(callback);
      }
  }
})
.factory("MyYelpBusiness", function($http) {
  function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  }
  return {
      "retrieveYelp": function(name, callback, callbackint) {
          var method = 'GET';
          var request_url = 'http://api.yelp.com/v2/business/'+name;
          var parameters = {
                  oauth_consumer_key: 'YXGa4ru-gTal2YshH1sA8A', //Consumer Key
                  oauth_token: 'gmiTY407KpN0U4qdU2ea9BgJTXvianPF', //Token
                  oauth_signature_method: "HMAC-SHA1",
                  oauth_timestamp: new Date().getTime(),                  
                  oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
              };
          var consumerSecret = 'bBHFOWAQyzK8JDTmBGnacSioY6c'; //Consumer Secret
          var tokenSecret = 'bR6DViXqQNm7Pu9JdUWxDWUWD2s'; //Token Secret
          var signature = oauthSignature.generate(method, request_url, parameters, consumerSecret, tokenSecret, { encodeSignature: false});
          parameters['oauth_signature'] = signature;
          var urlstring = 'http://api.yelp.com/v2/business/'+name+'?';
          for(var x in parameters){
            if (parameters.hasOwnProperty(x)) {
              urlstring+= x + '=' + parameters[x] + '&';
            }
          }
          urlstring = urlstring.substring(0, urlstring.length-1);
          $.jsonp({
            url: urlstring, // any JSON endpoint
            corsSupport: false, // if URL above supports CORS (optional)
            jsonpSupport: true, // if URL above supports JSONP (optional)
            data: parameters, 
            success: callback,
            error: function(data, boo, bah){
              console.log(data +' ' + boo+' '+bah);
              console.log(data);
            }
            // error, etc.
          });
          //$http({url: request_url, method: 'GET', params: parameters}).success(function(data, status, headers, config){return data}).error(function(data, boo){console.log(data, boo)});
      }
  }
})
.factory("IncrementTheShit", function($http) {
  var x = -1;
  return {
    addone: function() {
      x = (x+1)%10;
    },
    get: function() {
      console.log(x);
      return x;
    },
  }
})