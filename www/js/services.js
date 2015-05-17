angular.module('starter.services', ['firebase', 'ngCordova'], function($httpProvider){
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

.factory('Decks', function($firebase) {
    // Might use a resource here that returns a JSON array
    var ref = new Firebase("https://devour.firebaseio.com/decks");
    var sync = $firebase(ref);
    // download the data into a local object
    var syncObject = sync.$asObject();
    //syncObject.$bindTo($scope, "quizzes");

    return {
        all: function() {
            return sync.$asArray();
        },
        getName: function(deckID) {
            var ref2 = new Firebase("https://memoraize.firebaseio.com/decks/"+deckId+"/name");
            var name = ""
            ref2.once("value", function(data) {
                name = data.val();
            });
            return name
        },
        getCards: function(deckId) {
            var ref2 = new Firebase("https://memoraize.firebaseio.com/decks/"+deckId+"/cards");
            return $firebase(ref2).$asArray();
        },
        addCard: function(card, deckId) {
            var ref2 = new Firebase("https://memoraize.firebaseio.com/decks/"+deckId+"/cards");
            $firebase(ref2).$set(object, true);
        },

    }
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

.factory('Camera', ['$q', function($q) {

    return {
        getPicture: function(options) {
            var q = $q.defer();

            navigator.camera.getPicture(function(result) {
                // Do any magic you need
                q.resolve(result);
            }, function(err) {
                q.reject(err);
            }, options);

            return q.promise;
        }
    }
}])

.factory("NewOCRAPI", function($http, $cordovaFileTransfer) {
    return {
        "getTextFromPhoto": function(uri) {
            var key = 'd3f3928e856ac306b405408d10d08685';
            var id = '';
            
            
            $cordovaFileTransfer.upload('http://api.newocr.com/v1/upload?key='+key, uri, {
        params: {
          //framework: 'Ionic' // <<<<< This is sent
        }
      }).then(function(result){
                alert(JSON.stringify(result));
                alert(JSON.stringify(result.response.data.file_id));
                $http.get('http://api.newocr.com/v1/ocr?key='+key+'&file_id'+id+'&page=1&lang=eng&psm=3').
                success(function(data, status, headers, config) {
                    alert(data.text);
                    return data.text;
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    alert("Oops! Something went wrong.");
                    return 'Error';
                });
            }, 
              function(err){
                alert('err');
                return err;
            },
              function(progress){
            });
            
        }
    }
})

.factory("TextRazorAPI", function($http) {
    return {
        "processText": function(textForProcessing) {
            $http.post('https://api.textrazor.com', {
                apiKey: 'e283e70a509f0818b7ecbe9957b9def2f71e039105538f6fa807c684',
                text: textForProcessing,
                extractors: 'topics,phrases,words,dependency-trees'
            }).
            success(function(data, status, headers, config) {
                return data;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                return "Oops! Something went wrong.";
            });
        }
    }
});
