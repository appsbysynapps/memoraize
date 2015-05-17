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

.factory('TakePhoto', function(NewOCRAPI, Camera) {
    return function() {
        console.log('Getting camera');
        Camera.getPicture({
            quality: 75,
            //targetWidth: 320,
            //targetHeight: 320,
            //encodingType: Camera.EncodingType.JPEG,
            saveToPhotoAlbum: false
        }).then(function(imageURI) {
            
            NewOCRAPI.getTextFromPhoto(imageURI, function(x) {
                $scope.cooltext = x;
            });
        }, function(err) {
            alert(JSON.stringify(err));
        });
    }
})



.factory('ChoosePhoto', function(Camera) {
    return function() {
        //alert('Existing photo?');
        console.log('existing photo?');
        var options = {
            maximumImagesCount: 10,
            width: 800,
            height: 800,
            quality: 80
        };

        $cordovaImagePicker.getPictures(options)
        .then(function(results) {
            for (var i = 0; i < results.length; i++) {
                console.log('Image URI: ' + results[i]);
            }
        }, function(error) {
            // error getting photos
        });
        //            Camera.getPicture({
        //                quality: 75,
        //                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        //                destinationType: Camera.DestinationType.FILE_URI,
        //                //targetWidth: 320,
        //                //targetHeight: 320,
        //                //encodingType: Camera.EncodingType.JPEG,
        //                saveToPhotoAlbum: false
        //                
        //            }).then(function(imageURI) {
        //                alert('yay?');
        //                console.log('yay?');
        //                $scope.cooltext = 'Processing...';
        //                NewOCRAPI.getTextFromPhoto(imageURI, function(x){
        //                    $scope.cooltext=x;
        //                });
        //            }, function(err) {
        //                console.log('oh no...');
        //                alert('oh no...');
        //                alert(JSON.stringify(err));
        //            });
    };
})


.factory('Decks', function($firebase, $firebaseArray) {

    var ref = new Firebase("https://memoraize.firebaseio.com/decks");
    var decks = $firebaseArray(ref);
    var factory = {};

    factory.newDeck = function(deck,callback) {
        decks.$add({
            name: deck.name,
            cards: {}
        }).then(callback);
    };

    factory.addCards = function(ref2, newCards, callback) { //ref2 = /decks/:deckid
        var cards = $firebaseArray(ref2.child("cards"));
        angular.forEach(newCards, function(card) {
            cards.$add({
                left: card.left,
                term: card.term,
                right: card.right
            }).then(callback);
        })
    }

    factory.generateCard = function(term, sentence) {
        var i = sentence.indexOf(term)
        card = {}
        card.left = sentence.substring(0,i);
        card.term = term;
        card.right = sentence.substring(i+term.length);
        return card;
    }


    factory.getDeck = function(deckID) {
        angular.forEach(decks, function(deck) {
            if(deck.$id==deckID) {
                return deck;
            }
        });
    }

    factory.getCards = function(deckID) {
        return $firebaseArray(new Firebase("https://memoraize.firebaseio.com/decks/"+deckID+"/cards"));
    }

    factory.saveDeck = function(deck,callback) {
        decks.$save(deck).then(callback);
    }
    factory.decks = decks;
    return factory;
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
        "getTextFromPhoto": function(uri, func) {
            var key = '675172a6bccc01464ff15a5f93ab8a27';


            $cordovaFileTransfer.upload('http://api.newocr.com/v1/upload?key='+key, uri, {
                params: {
                    //framework: 'Ionic' // <<<<< This is sent
                }
            }).then(function(result){
                var id = JSON.parse(result['response']).data.file_id;
                func('Processing...Photo successfully uploaded...');
                $http.get('http://api.newocr.com/v1/ocr?key=675172a6bccc01464ff15a5f93ab8a27&file_id='+id+'&page=1&lang=eng&psm=3').
                success(function(data, status, headers, config) {
                    func('Processing...Photo successfully uploaded...now processing');
                    func(data.data.text);
                }).
                error(function(data, status, headers, config) {
                    func(JSON.stringify(data));
                });
            }, 
                    function(err){
                func(JSON.stringify(err));
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
