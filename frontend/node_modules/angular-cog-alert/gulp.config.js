module.exports = function () {
    var dist = './dist/';
    var report = './report/';
    var wiredep = require('wiredep');
    var bowerFiles = wiredep({devDependencies: true})['js'];

    var config = {
        //FILE PATHS
        alljs: [
            './src/**/*.js'
        ],
        build: './dist/',
        report: report,

        plato: { js: './src/**/*.js' },

        //Test stuff
        specHelpers: [],
        specs: ['./test/**/*.test.js'],
    };

    config.karma = getKarmaOptions();

    return config;

    function getKarmaOptions() {
        var options = {
            files: [].concat(
                bowerFiles,
                config.specHelpers,
                './src/**/*.js',
                './test/**/*.js'
            ),
            exclude: [],
            coverage: {
                dir: report + 'coverage',
                reporters: [
                    {type: 'html', subdir: 'report-html'},
                    {type: 'lcov', subdir: 'report-lcov'},
                    {type: 'text-summary'} //, subdir: '.', file: 'text-summary.txt'}
                ]
            },
            preprocessors: {}
        };
        options.preprocessors['./src/**/!(*.test)+(.js)'] = ['coverage'];
        return options;
    }
};
