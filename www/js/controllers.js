angular.module('starter.controllers', ["firebase", "ngCordova"])
.controller('AppCtrl', function($scope, $ionicModal, $timeout, Camera, $firebaseArray, NewOCRAPI, Decks, $cordovaImagePicker, TakePhoto, ChoosePhoto) {
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
        Decks.newDeck($scope.deck, function(ref2) {
            var cards = [Decks.generateCard($scope.deck.term, $scope.deck.sentence)];
            Decks.addCards(ref2, cards);
            $scope.deck.name = "";
            $scope.deck.term = "";
            $scope.deck.sentence = "";
        });
    }

    $scope.cooltext = '';

    $scope.getPhoto = TakePhoto;
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