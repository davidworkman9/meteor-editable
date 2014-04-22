if (Meteor.isClient) {
    Template.main.onsubmission = function () {
        return function () {
            alert('hello');
        }
    };
}

