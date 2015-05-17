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
    
    var ref = new Firebase("https://memoraize.firebaseio.com/decks");
    var decks = $firebaseArray(ref);
    var factory = {};
    
    factory.newDeck = function(deck,callback) {
        decks.$add({
            name: $scope.deck.name,
            cards: {}
        }).then(callback);
    };
    
    factory.addCard: function(ref2, card, callback) { //ref2 = /decks/:deckid
        var cards = $firebaseArray(ref2.child("cards"));
        $scope.cards.$add({
            front: card.front,
            back: card.back
        });
    }
    
    factory.getDeck: function(deckID) {
        angular.forEach(decks, function(deck) {
            if(deck.$id==deckID) {
                return deck;
            }
        });
    }
    
    factory.getCards: function(deckID) {
        return $firebaseArray(new Firebase("https://memoraize.firebaseio.com/decks/"+deckID+"/cards"));
    }
    
    factory.saveDeck = function(deck,callback) {
        decks.$save(deck).then(callback);
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
            
            
            $cordovaFileTransfer.upload('http://api.newocr.com/v1/upload?key='+key, uri, {
        params: {
          //framework: 'Ionic' // <<<<< This is sent
        }
      }).then(function(result){
                var id = JSON.parse(result['response']).data.file_id;
                
                $http.get('http://api.newocr.com/v1/ocr?key='+key+'&file_id='+id+'&page=1&lang=eng&psm=3').
                success(function(data, status, headers, config) {
                    alert('SUCCESS!!');
                    alert(JSON.stringify(data));
                    alert(JSON.stringify(data.data.text));
                    return data.data.text;
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
            }, 
              function(err){
                alert('err');
                return 'blah';
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
