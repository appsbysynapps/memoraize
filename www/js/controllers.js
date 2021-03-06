angular.module('starter.controllers', ["firebase", "ngCordova"])
.controller('AppCtrl', function($scope, $ionicModal, $timeout, Camera, $firebaseArray, NewOCRAPI, Decks, $cordovaImagePicker, TakePhoto, ChoosePhoto, TextRazorAPI, NLP) {
    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
            $scope.closeLogin();
        }, 1000);
    };

    $ionicModal.fromTemplateUrl('templates/newDeck.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.newDeckModal = modal;
    });


    $scope.newDeck = function() {
        $scope.newDeckModal.show();
    };

    $scope.closeNewDeck = function() {
        $scope.newDeckModal.hide();
    };

    $scope.decks = Decks.decks;
    $scope.deck = {};

    $scope.createDeck = function() {
        alert(JSON.stringify($scope.sentences));
        alert(JSON.stringify($scope.terms));
        alert('submitted!');
        
        /*var cards = [];
        
        for(var i = 0; i<$scope.terms.length; i++){
            var x = $scope.sentences.indexOf($scope.terms[i]);
            cards.push(
                {
                    left: $scope.sentences[i].substring(0, x),
                    term: $scope.terms[i],
                    right: $scope.sentences[i].substring(x+$scope.terms[i].length)
                }
            );
            alert(JSON.stringify(cards[i]));
        }*/
        
        Decks.newDeck($scope.deck, function(ref2) {
            
            var cards = [];
            
            for(var i = 0; i < $scope.terms.length; i++) {
                cards.push(Decks.generateCard($scope.terms[i], $scope.sentences[i]));
            }
        
            Decks.addCards(ref2, cards);
            $scope.deck.name = "";
            $scope.cooltext = '';
            $scope.closeNewDeck();
        });
        
        /*alert(JSON.stringify(cards));
        
        Decks.addDeck($scope.deck, cards, function(ref2){
            $scope.deck.name = "";
            $scope.cooltext = '';
            $scope.closeNewDeck();
        });*/
        
    }

    $scope.cooltext = '';
    
    $scope.terms = [];
    $scope.sentences = [];

    $scope.getPhoto = function(){
        TakePhoto.getPhoto(function(x){$scope.cooltext=x;}, function(photoText){
            $scope.sentences = photoText.split("-\n").join("").split("\n").join("").split(".");
            
            angular.forEach($scope.sentences, function(sentence){
                //TextRazorAPI.bestTerm(sentence, function(x){$scope.terms.push(x)});
                $scope.terms.push(NLP.bestTerm(sentence));
                
            });            

        });
        
        
    }
    $scope.getExistingPhoto = ChoosePhoto;
})

.controller('CardsCtrl', function($scope, $stateParams, Decks, TakePhoto, ChoosePhoto, $ionicModal) {
    $scope.cards = Decks.getCards($stateParams.deckId);
    console.log($scope.cards);

    $ionicModal.fromTemplateUrl('templates/addCards.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.addCardsModal = modal;
    });

    $scope.closeAddCards = function() {
        $scope.addCardsModal.hide();
    };

    $scope.deck = Decks.getDeck($stateParams.deckId);

    $scope.moreCards = function() {
            var cards = [Decks.generateCard($scope.deck.term, $scope.deck.sentence)];
            Decks.addCards(new Firebase("https://memoraize.firebaseio.com/decks/"+$stateParams.deckId), cards);
            $scope.deck.term = "";
            $scope.deck.sentence = "";
    }

    $scope.getPhoto = TakePhoto;
    $scope.getExistingPhoto = ChoosePhoto;

})

.controller('NewDeckCtrl', function($scope, Camera) {

});