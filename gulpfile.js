//任务
var gulp = require("gulp"),
    plugins = require("gulp-load-plugins")(),
    yargs = require("yargs"), //命令行工具，解析参数
    path = require("path"),
    babel = require("gulp-babel"),
    clean = require("gulp-clean"),
    px2rpx = require("gulp-px2rpx"),
    fs = require('fs'),
    env = process.env.NODE_ENV,
    config = require("./config/buildConfig")

/*
 * 常用方法
 *
 * gulp.task -- 定义任务
 *
 * gulp.src -- 需要找到执行任务文件夹
 *
 * gulp.dest -- 执行任务的文件去处
 *
 * gulp.watch -- 观察文件是否发生变化
 *
 * */

//定义拷贝文件
gulp.task("html", function() {
    return (
        gulp
        .src("src/**/*.html")
        // .pipe(plugins.htmlmin())
        .pipe(plugins.rename({ extname: ".wxml" }))
        .pipe(gulp.dest("dist/"))
    );
});

//图片压缩
gulp.task("img", function() {
    return (
        gulp
        .src("src/images/**/*")
        .pipe(plugins.imagemin())
        .pipe(gulp.dest("dist/images"))
    )
});

//js解析压缩
gulp.task("js", function() {
    return (
        gulp
        .src("src/**/*.js")
        .pipe(
            babel({
                presets: ["es2015"]
            })
        )
        // .pipe(plugins.uglify())
        .pipe(gulp.dest("dist"))
    )
});
//less解析css
gulp.task("less", () => {
    return (
        gulp
        .src(["src/**/*.less"])
        .pipe(plugins.less())

        .pipe(
            px2rpx({
                screenWidth: 750, // 设计稿屏幕, 默认750
                wxappScreenWidth: 750, // 微信小程序屏幕, 默认750
                remPrecision: 6 // 小数精度, 默认6
            })
        )
        .pipe(plugins.rename({ extname: ".wxss" }))
        .pipe(gulp.dest("dist"))
    )
});

//json解析压缩
gulp.task("json", () => {
    return (
        gulp
        .src(["src/**/*.json"])
        // .pipe(plugins.jsonminify())
        .pipe(gulp.dest("dist"))
    );
});

gulp.task("config", () => {
    return (
        gulp
        .src(["config/" + env + ".js"])
        // .pipe(plugins.jsonminify())
        .pipe(plugins.rename({ basename: "config" }))
        .pipe(gulp.dest("dist/config"))
    );
});


gulp.task("clean", () => {
    return gulp.src("dist/").pipe(clean());
});

// 监听文件是否发生变化

gulp.task("watch", () => {
    gulp.watch("src/**/*.html", ["html"]);
    gulp.watch("src/images/**/*", ["img"]);
    gulp.watch("src/**/*.js", ["js"]);
    gulp.watch("src/**/*.less", ["less"]);
    gulp.watch("src/**/*.json", ["json"]);
});

//路径
let root = "src";

let resolveToComponents = function(glob = "") {
    return path.join(root, "pages", glob); // app/components/{glob}
};

//模版创建
gulp.task("component", () => {
    let componentInfo = yargs.argv.component.split(":");
    let name = componentInfo[0]; //获取要创建的文件名称
    let parentPath = (componentInfo.length > 1 && componentInfo[1]) || ""; //获取父文件夹名称
    let fileName = name.replace(/([A-Z])/g, "-$1").toLowerCase(); //文件夹名称转换成小写
    let destPath = path.join(resolveToComponents(), parentPath, fileName); //文件夹创建

    return gulp
        .src("generator/component/*.**")
        .pipe(
            plugins.template({
                name: name,
                fileName: fileName,
                parentPath: parentPath
            })
        )
        .pipe(
            plugins.rename(function(path) {
                path.basename = path.basename.replace("temp", name);
            })
        )
        .pipe(gulp.dest(destPath));
});

// 遍历路由文件夹
function walk(dir, str) {
    // 分包
    if (str) {
        var results = []
        var list = fs.readdirSync(dir)
        list.forEach(function(file) {
            file = dir + '/' + file
            var stat = fs.statSync(file)
            if (stat && stat.isDirectory()) {
                results = results.concat(walk(file, str))
            } else if (file.indexOf('.json') != -1) {
                var na = file.split('.json')[0].split(str)[1]
                na = na.substr(1)
                results.push(na)
            }
        })
        return results
    } else {
        // pages
        var results = []
        var list = fs.readdirSync(dir)
        list.forEach(function(file) {
            file = dir + '/' + file
            var stat = fs.statSync(file)
            if (stat && stat.isDirectory()) results = results.concat(walk(file))
            else file.indexOf('.json') != -1 ? results.push(file.split('.json')[0].split('src/')[1]) : ""
        })
        return results
    }

}

// 生成路由
gulp.task("router", () => {
    var app = require("./src/app.json");
    app.pages = walk(config.pages)
    var sub = []
    config.subpackages.forEach(item => {
        var obj = {}
        obj.root = item.split('src/')[1]
        obj.pages = walk(item, obj.root)
        sub.push(obj)
    })
    app.subpackages = sub
    fs.writeFileSync('src/app.json', JSON.stringify(app), function(err) {
        if (err) {
            console.error(err);
            return
        }
    })
})

//定义默认任务
gulp.task("default", ["html", "img", "js", "less", "json", "config"]);