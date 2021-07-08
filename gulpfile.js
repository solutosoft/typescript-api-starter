const { series, src, dest } = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.dist.json");
const destDir = "lib";

function build() {
  return tsProject
    .src()
    .pipe(tsProject())
    .js
    .pipe(dest(destDir));
}

function copyFiles() {
  return src("./src/emails/**/*.*")
    .pipe(dest(destDir + "/emails/"))
    .pipe(src("./package*.json"))
    .pipe(dest(destDir))
    .pipe(src("./.env.*"))
    .pipe(dest(destDir));
}

exports.default = series(build, copyFiles);
