/* global require */
var remote = require('remote'),
    dialog = remote.require('dialog'),
    exec = require('child_process').exec,
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
    Imagemin = require('imagemin'),
    zipper = require('zip-local'),
    path = require('path'),
    minify = require('html-minifier').minify,

    // Build class
    Build = function () {
        'use strict';

        this.path = '';
        this.repoUrl = '';
        this.branch = '';
        this.includePaths = [];
        this.cloned = false;
        this.checkedOut = false;
    };

// create date string
function getDate() {
    'use strict';
    var now = new Date();
    var todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()));

    return todayUTC.toISOString().slice(0, 10).replace(/-/g, '-') + 'T' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
}

function readFiles(currentPath, target) {
    'use strict';

    if (!currentPath || !target) {
        return;
    }
    var files = fs.readdirSync(currentPath),
        currentFile,
        stats;

    for (var i in files) {
        currentFile = currentPath + '/' + files[i];
        stats = fs.statSync(currentFile);
        if (stats.isFile()) {
            target.push(currentFile);
        }
        else if (stats.isDirectory()) {
            readFiles(currentFile, target);
        }
    }
}

function buildAndroid(basePath) {
    'use strict';

    return new Promise(function (resolve, reject) {
        exec('cd ' + path.normalize(basePath) + '&& ionic state reset && ionic build android', function (cdErr, cdOut, cdsErr) {
            if (cdErr || cdsErr) {
                return reject(cdsErr || cdOut);
            }

            resolve();
        });
    });
}

function buildiOS(basePath) {
    'use strict';

    return new Promise(function (resolve) {
        resolve();
    });
}

function transformTemplate(basePath, templatePath, additionalPath) {
    'use strict';
    var templateContent,
        relativePath = templatePath.replace(basePath + additionalPath + '/', '');

    return new Promise(function (resolve, reject) {
        fs.readFile(templatePath, function (err, content) {
            if (err) {
                return reject(err);
            }

            templateContent = '<script type="text/ng-template" id="' + relativePath + '">\n' + content + '\n</script>';

            resolve(templateContent);
        });
    });
}

// concat all templates to on
function concatTemplates(basePath, additionalPath) {
    'use strict';
    var templates = [],
        tasks = [],
        i = 0,
        concatedContent = '';

    return new Promise(function (resolve, reject) {
        if (!basePath) {
            return reject('missing_basepath');
        }
        fs.stat(basePath + additionalPath, function (statErr) {
            if (statErr) {
                return reject();
            }
            readFiles(basePath + additionalPath + '/app/templates', templates);

            for (i; i < templates.length; i = i + 1) {
                tasks.push(transformTemplate(basePath, templates[i], additionalPath));
            }

            Promise.all(tasks).then(function (contents) {
                concatedContent = contents.join('\n');
                resolve(concatedContent);
            }, reject);
        });
    });
}

// optimize images
function optiImage(basePath, src, dest, additionalPath) {
    'use strict';
    var ImageMin = new Imagemin();

    return new Promise(function (resolve, reject) {
        ImageMin
            .use(Imagemin.gifsicle({interlaced: true}))
            .use(Imagemin.jpegtran({progressive: true}))
            .use(Imagemin.optipng({optimizationLevel: 3}))
            .src(basePath + additionalPath + path.normalize(src + '/**/*.{gif,jpg,png,svg}'))
            .dest(basePath + additionalPath + path.normalize(dest))
            .run(function (err) {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
    });
}
// clean up index.html
function clearIndex(basePath, appVersion, additionalPath) {
    'use strict';
    return new Promise(function (resolve, reject) {
        fs.readFile(basePath + additionalPath + '/index.html', {
            encoding: 'utf8'
        }, function (readErr, indexContent) {
            if (readErr) {
                return reject(readErr);
            }
            // remove requirejs-config, requirejs
            indexContent = indexContent.replace('<script src="app/main.js"></script>', '');
            appVersion = appVersion ? '\n<script>window.appVersion = "' + appVersion + '";</script>' : '';
            indexContent = indexContent.replace('<script src="lib/requirejs/requirejs.min.js"></script>', appVersion);
            // replace boot.js with bundle
            indexContent = indexContent.replace('<script src="app/boot.js"></script>', '<script src="app/app.min.js" type="text/javascript"></script>');
            concatTemplates(basePath, additionalPath).then(function (concatedTemplates) {
                indexContent = indexContent.replace('</body>', concatedTemplates + '\n</body>');
                var minifiedIndex = minify(indexContent, {
                    removeComments: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    removeAttributeQuotes: true,
                    preserveLineBreaks: true
                });
                // write index.html to build
                fs.writeFile(basePath + additionalPath + '/build/index.html', minifiedIndex, function (writeErr) {
                    if (writeErr) {
                        return reject(writeErr);
                    }
                    resolve();
                });
            });
        });
    });
}
// create and change config.xml
function createConfig(basePath, name, version, additionalPath) {
    'use strict';
    return new Promise(function (resolve, reject) {
        fs.readFile(basePath + '/config.xml', {
            encoding: 'utf8'
        }, function (readErr, configContent) {
            if (readErr) {
                return reject(readErr);
            }
            // set app Name
            configContent = configContent.replace(/\<name\>[^\<]*\<\/name\>/, '<name>' + name + '</name>');
            // set app version
            if (configContent.match(/\<widget[^\>]*versionCode\s*=\s*"[^\>"]*"[^\>]*\>/) && !configContent.match(/\<widget[^\>]*versionName\s*=\s*"[^\>"]*"[^\>]*\>/)) {
                configContent = configContent.replace(/\<widget([^\>]*)versionCode\s*=\s*"[^\>"]*"([^\>]*)\>/, '<widget$1versionName="' + version + '"$2>');
            } else if (!configContent.match(/\<widget[^\>]*versionCode\s*=\s*"[^\>"]*"[^\>]*\>/) && configContent.match(/\<widget[^\>]*versionName\s*=\s*"[^\>"]*"[^\>]*\>/)) {
                configContent = configContent.replace(/\<widget([^\>]*)versionName\s*=\s*"[^\>"]*"([^\>]*)\>/, '<widget$1versionName="' + version + '"$2>');
            } else if (configContent.match(/\<widget[^\>]*versionCode\s*=\s*"[^\>"]*"[^\>]*\>/) && configContent.match(/\<widget[^\>]*versionName\s*=\s*"[^\>"]*"[^\>]*\>/)) {
                configContent = configContent.replace(/\<widget([^\>]*)versionName\s*=\s*"[^\>"]*"([^\>]*)\>/, '<widget$1versionName="' + version + '"$2>');
                configContent = configContent.replace(/\<widget([^\>]*)versionCode\s*=\s*"[^\>"]*"([^\>]*)\>/, '');
            }
            configContent = configContent.replace(/\<widget([^\>]*)version\s*=\s*"[^\>"]*"([^\>]*)\>/, '<widget$1version="' + version + '"$2>');
            // write new config.xml to build folder
            fs.writeFile(basePath + (additionalPath ? '' : '/build') + '/config.xml', configContent, function (writeErr) {
                if (writeErr) {
                    return reject(writeErr);
                }
                resolve();
            });
        });
    });
}

// run r-command for optimization
function uglifyMinify(basePath, additionalPath) {
    'use strict';

    var rName = process.platform === 'win32' ? 'r.js.cmd' : 'r.js';

    return new Promise(function (resolve, reject) {
        exec(path.normalize('node_modules/.bin/' + rName) + ' -o ' + path.normalize(basePath + additionalPath + '/app.build.js'), function (rErr, stdOut) {
            if (rErr) {
                return reject(stdOut);
            }
            resolve();
        });
    });
}

// create app.build.js --> config for r.js optimizing
function createAppBuildConfig(basePath, includePaths, additionalPath) {
    'use strict';
    var appBuildConfig = basePath + additionalPath + '/app.build.js',
        pathString;
    // include the predefined dicts folder
    readFiles(basePath + additionalPath + '/app/dicts', includePaths);

    // build string with additional files
    includePaths.forEach(function (includePath) {
        includePath = includePath.replace(basePath + additionalPath + '/app/', '');
        includePath = includePath.replace(/\.js$/, '');

        if (includePath) {
            if (pathString) {
                pathString += ', ';
            } else {
                pathString = '';
            }
            pathString += '"' + includePath + '"';
        }
    });

    return new Promise(function (resolve, reject) {
        // no additional stuff --> write app.build.js
        if (!pathString) {
            return fs.copy('./app.build.js', appBuildConfig, function (writeErr) {
                if (writeErr) {
                    return reject(writeErr);
                }
                resolve();
            });
        }
        // read default app.build.js
        fs.readFile('./app.build.js', {
            encoding: 'utf8'
        }, function (readErr, configContent) {
            if (readErr) {
                return reject(readErr);
            }
            // extend include with additional sources
            configContent = configContent.replace(/include\s*:\s*\[([^\]]*)\]/, 'include: [$1, ' + pathString + ']');
            // write new file
            fs.writeFile(appBuildConfig, configContent, function (writeErr) {
                if (writeErr) {
                    return reject(writeErr);
                }
                resolve();
            });
        });
    });
}

function copy(src, dest) {
    'use strict';
    return new Promise(function (resolve, reject) {
        fs.stat(src, function (statErr) {
            if (statErr) {
                return resolve();
            }
            fs.copy(src, dest, function (err) {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

// copy necessary files to build folder and add almond to project
function copyFiles(basePath, additionalPath) {
    'use strict';
    var sources = ['resources', 'docker-compose.yml'],
        i = 0,
        almond = './node_modules/almond/almond.js',
        tasks = [];

    for (i; i < sources.length; i = i + 1) {
        tasks.push(copy(basePath + additionalPath + '/' + sources[i], basePath + additionalPath + '/build/' + sources[i]));
    }
    tasks.push(copy(almond, basePath + additionalPath + '/almond.js'));

    return new Promise(function (resolve, reject) {
        Promise.all(tasks).then(resolve, reject);
    });
}

// show choose folder path window
Build.prototype.chooseFolder = function (cb) {
    'use strict';

    var self = this;
    // show dialog window
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }, function (paths) {
        if (paths && paths[0]) {
            self.path = paths[0];
        }
        cb(paths);
    });
};

// show choose files to explicit include
Build.prototype.chooseIncludeFiles = function (cb) {
    'use strict';

    var self = this;
    // show dialog window
    dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections']
    }, function (paths) {
        if (paths && paths.length) {
            self.includePaths = paths;
        }
        cb(paths);
    });
};

// clone project to chosen folder
Build.prototype.cloneProject = function (folderPath, repoUrl, name, cb) {
    'use strict';

    this.path = folderPath || this.path;
    this.repoUrl = repoUrl || this.repoUrl;
    this.name = name || this.name;

    if (!this.path || !this.repoUrl || !this.name) {
        if (cb) {
            return cb('missing params');
        }
        return cb();
    }

    var self = this;

    exec('git --version', function (err, stdout) {
        if (stdout.match(/git version/g)) {
            exec('cd ' + self.path + ' && git clone --depth 1 ' + self.repoUrl, function (cloneErr) {
                if (!cloneErr) {
                    self.cloned = true;
                    self.path += '/' + self.name;
                } else {
                    self.cloned = false;
                }
                cb(cloneErr);
            });
        } else {
            cb('no git');
        }
    });
};

// checkout branch of previously cloned repo
Build.prototype.checkoutBranch = function (branch, buildType, cb) {
    'use strict';

    this.branch = branch || this.branch;

    if (!this.path || !this.branch) {
        if (cb) {
            return cb('missing params');
        }
        return cb();
    }

    if (buildType === 'cli') {
        this.additionalPath = '/www';
    }

    var self = this;

    exec('git --version', function (err, stdout) {
        if (stdout.match(/git version/g)) {
            exec('cd ' + self.path + ' && git checkout -b ' + self.branch + '_build' + ' origin/' + self.branch, function (checkoutErr) {
                if (!checkoutErr) {
                    self.checkedOut = true;
                    // read settings.js
                    Promise.settle([fs.readFileAsync(self.path + self.additionalPath + '/app/settings.js', 'utf8'), fs.readFileAsync(self.path + '/build.json', 'utf8')]).then(function (results) {
                        self.checkedOut = true;

                        cb(null, {
                            settings: results[0].isRejected() ? '' : results[0].value(),
                            build: results[1].isRejected() ? {} : JSON.parse(results[1].value())
                        });
                    });
                } else {
                    self.checkedOut = false;
                    cb(checkoutErr);
                }
            });
        } else {
            cb('no git');
        }
    });
};

// checkout branch of previously cloned repo
Build.prototype.removeProject = function (cb) {
    'use strict';

    if (!this.path || !this.cloned) {
        return cb();
    }

    fs.remove(this.path, function () {
        cb();
    });
};

// create build directory
Build.prototype.build = function (type, name, version, settingsContent, host, forAndroid, foriOS, cb) {
    'use strict';

    var self = this,
        additionalPath = '',
        isCLI = false,
        tasks = [];

    if (!type || (type === 'app' && !(name && version))) {
        return cb();
    }
    self.appName = name;
    self.appVersion = version;
    self.host = host;

    if (!this.path || !this.cloned || !this.checkedOut) {
        return cb();
    }
    if (this.additionalPath) {
        isCLI = true;
        additionalPath = this.additionalPath;
    }
    fs.mkdirs(this.path + additionalPath + '/build/app', function (dirErr) {
        if (dirErr) {
            return cb(dirErr);
        }
        fs.writeFile(self.path + additionalPath + '/app/settings.js', settingsContent, function () {
            tasks = [
                copyFiles(self.path, additionalPath).then(function () {
                    return Promise.all([
                        optiImage(self.path, '/build/resources', '/build/resources', additionalPath),
                        createAppBuildConfig(self.path, self.includePaths, additionalPath)
                    ]);
                }).then(function () {
                    return uglifyMinify(self.path, additionalPath);
                }),
                clearIndex(self.path, version, additionalPath)
            ];

            if (type === 'app') {
                tasks.push(createConfig(self.path, self.appName, self.appVersion, additionalPath));
            }

            Promise.all(tasks).then(function () {
                if (isCLI) {
                    fs.move(self.path + additionalPath + '/build', self.path + '/build', function (moveErr) {
                        if (moveErr) {
                            return cb(moveErr);
                        }
                        fs.remove(self.path + additionalPath, function (removeErr) {
                            if (removeErr) {
                                return cb(removeErr);
                            }
                            fs.move(self.path + '/build', self.path + additionalPath, function (renameErr) {
                                if (renameErr) {
                                    return cb(renameErr);
                                }
                                if (forAndroid || foriOS) {
                                    tasks.length = 0;

                                    if (forAndroid) {
                                        tasks.push(buildAndroid(self.path));
                                    }
                                    if (foriOS) {
                                        tasks.push(buildiOS(self.path));
                                    }
                                    Promise.all(tasks).then(function () {
                                        cb();
                                    }, function (err) {
                                        cb(err);
                                    });
                                } else {
                                    cb();
                                }
                            });
                        });
                    });
                } else {
                    zipper.zip(path.normalize(self.path + '/build'), function (zipped) {
                        zipped.compress();
                        var finalpath = self.path + '_' + getDate() + '.zip';
                        zipped.save(path.normalize(finalpath));
                        fs.remove(self.path, function () {
                            self.package = path.normalize(finalpath);
                            cb(null, path.normalize(finalpath));
                        });
                    });
                }
            }, cb);
        });
    });
};
