/**
 * Created by mattias on 3/17/14.
 */
// karma.conf.js
module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],

        files: [
            'bower_components/angular/angular.min.js',
            'bower_components/angular-mocks/angular-mocks.js',
            '*.js'
        ]
    });
};