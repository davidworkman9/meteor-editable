Package.describe({
    summary: "Meteor-Editable - in-place edit package influenced by x-editable"
});

Package.on_use(function (api) {
    var fs = Npm.require('fs');
    api.use(['templating'], 'client');

    api.add_files([
        'inputs/text/text.html',
        'inputs/text/text.js',

        'inputs/select/select.html',
        'inputs/select/select.js',

        'inputs/textarea/textarea.html',
        'inputs/textarea/textarea.js',


    ], 'client');
    api.add_files([
        'img/clear.png',
        'img/loading.gif',
        'bootstrap-editable.css',
        'editable.html',
        'editable.js'
    ], 'client');
});