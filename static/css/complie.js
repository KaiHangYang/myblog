var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    sourcePath, targetPath;

process.argv.forEach(function(val, index, array) {
    if (index == 2) {
        sourcePath = val;
    }
    else if (index == 3) {
        targetPath = val;
    }
});

var lessc = function(rootPath, targetPath) {
    rootPath = path.resolve(rootPath);
    targetPath = path.resolve(targetPath);

    fs.exists(rootPath, function(exist){
        if (exist) {
            var childArray = fs.readdirSync(rootPath);
            if (childArray.length) {
                for (var i = 0; i < childArray.length; i++) {
                    var currentFilePath = path.resolve(rootPath, childArray[i]);
                    var currentTargetPath = path.resolve(targetPath, childArray[i]);

                    var stats = fs.statSync(currentFilePath);
                    if (stats.isDirectory()) {
                        lessc(currentFilePath, currentTargetPath);
                    }
                    else {
                        if (path.extname(currentFilePath) === ".less") {
                            var newFilePath = path.resolve(targetPath, path.basename(currentFilePath, '.less') + ".css");
                            if (!fs.existsSync(targetPath)) {
                                fs.mkdirSync(targetPath);
                            }

                            console.log(newFilePath);
                            exec("lessc -x " + currentFilePath + " > " + newFilePath);
                        }
                    }
                }
            }
        }
        else {
            console.log("directory is not exists");
        }
    });
}
if (typeof sourcePath == 'undefined' || typeof targetPath == 'undefined') {
    sourcePath = './';
    targetPath = './';
}
lessc(sourcePath, targetPath);
