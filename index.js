'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Snoowrap = require("snoowrap");
var snoowrap = require('snoowrap');
var googleTTS = require('google-tts-api');
var Jimp = require("jimp");
var fs = require("fs-extra");
var util = require("util");
var superagent = require('superagent');
var config = require("./config.js");
var exec = util.promisify(require("child_process").exec);
var debug = config.debug;
console.log("Reddit Video Generator v1.0.0\n[1/3] Fetching data...");
var choose = function (choices) { return choices[Math.floor(Math.random() * choices.length)]; };
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var r, randomHotPost, _a, postReplies, firstComment, secondComment, thirdComment, thingsToRead, Speech, i, _i, Speech_1, e, file, request, _b, _c, _d, sleep, _e, _f, _g, imageSearch, client, options, imageOne, imageTwo, videoEncoder, input, output, imageOneP, imageTwoP, frames_1, count, frame, err_1;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                r = new snoowrap({
                    userAgent: config.reddit.userAgent,
                    clientId: config.reddit.clientId,
                    clientSecret: config.reddit.clientSecret,
                    refreshToken: config.reddit.refreshToken
                });
                _a = choose;
                return [4 /*yield*/, r.getHot()];
            case 1: return [4 /*yield*/, _a.apply(void 0, [_h.sent()])];
            case 2:
                randomHotPost = _h.sent();
                return [4 /*yield*/, randomHotPost.expandReplies({ limit: 1, depth: 1 })];
            case 3:
                postReplies = _h.sent();
                firstComment = postReplies.comments[1];
                return [4 /*yield*/, firstComment.expandReplies({ limit: 1, depth: 1 })];
            case 4:
                secondComment = (_h.sent()).replies[0];
                return [4 /*yield*/, secondComment.expandReplies({ limit: 1, depth: 1 })];
            case 5:
                thirdComment = (_h.sent()).replies[0];
                thingsToRead = [];
                thingsToRead.push(randomHotPost.title);
                thingsToRead.push(firstComment.body);
                thingsToRead.push(secondComment.body);
                try {
                    thingsToRead.push(thirdComment.body);
                }
                catch (err) {
                    return [2 /*return*/, console.error("The Reddit Thread was too short. Please try again.")];
                }
                thingsToRead.map(function (thing) { return thing.replace('\n', ' '); });
                Speech = googleTTS.getAllAudioUrls(thingsToRead.join(" "), {
                    lang: 'en',
                    slow: false,
                    host: 'https://translate.google.com'
                });
                return [4 /*yield*/, fs.mkdir("temp")];
            case 6:
                _h.sent();
                return [4 /*yield*/, fs.mkdir("temp/speech")];
            case 7:
                _h.sent();
                return [4 /*yield*/, fs.writeFile("./temp/speech/afiles.txt", "", "utf8")];
            case 8:
                _h.sent();
                i = 0;
                _i = 0, Speech_1 = Speech;
                _h.label = 9;
            case 9:
                if (!(_i < Speech_1.length)) return [3 /*break*/, 14];
                e = Speech_1[_i];
                file = fs.createWriteStream("./temp/speech/audio" + i.toString() + '.mp3');
                return [4 /*yield*/, (superagent.get(e.url)).pipe(file)];
            case 10:
                request = _h.sent();
                _c = (_b = fs).writeFile;
                _d = ["./temp/speech/afiles.txt"];
                return [4 /*yield*/, fs.readFile("./temp/speech/afiles.txt")];
            case 11: return [4 /*yield*/, _c.apply(_b, _d.concat([(_h.sent()) + "file 'audio" + i + ".mp3'\n", "utf8"]))];
            case 12:
                _h.sent();
                i++;
                _h.label = 13;
            case 13:
                _i++;
                return [3 /*break*/, 9];
            case 14:
                sleep = util.promisify(setTimeout);
                return [4 /*yield*/, sleep(1000)];
            case 15:
                _h.sent();
                _f = (_e = fs).writeFile;
                _g = ["./temp/speech/afiles.txt"];
                return [4 /*yield*/, fs.readFile("./temp/speech/afiles.txt")];
            case 16: return [4 /*yield*/, _f.apply(_e, _g.concat([(_h.sent()).slice(0, -1), "utf8"]))];
            case 17:
                _h.sent();
                return [4 /*yield*/, exec("ffmpeg -f concat -safe 0 -i ./temp/speech/afiles.txt -c copy ./temp/audio.mp3")];
            case 18:
                _h.sent();
                imageSearch = require('image-search-google');
                client = new imageSearch(config.google.cseID, config.google.apiKey);
                options = { page: 1 };
                return [4 /*yield*/, client.search(thingsToRead[0].split(" ")[2], options)];
            case 19:
                imageOne = (_h.sent())[0].thumbnail;
                return [4 /*yield*/, client.search(thingsToRead[2].split(" ")[2], options)];
            case 20:
                imageTwo = (_h.sent())[0].thumbnail;
                if (debug) {
                    fs.writeFile("temp/log.txt", "Speech: ".concat(Speech.map(function (s) { return s.url; }).join("\n"), "\nimageOne: ").concat(imageOne, "\nimageTwo: ").concat(imageTwo), "utf8");
                }
                console.log("\n[2/3] Encoding video...");
                videoEncoder = config.videoEncoder;
                input = config.input;
                output = config.output;
                return [4 /*yield*/, Jimp.read(imageOne)];
            case 21:
                imageOneP = _h.sent();
                return [4 /*yield*/, Jimp.read(imageTwo)];
            case 22:
                imageTwoP = _h.sent();
                _h.label = 23;
            case 23:
                _h.trys.push([23, 36, , 39]);
                return [4 /*yield*/, fs.mkdir("temp/raw-frames")];
            case 24:
                _h.sent();
                return [4 /*yield*/, fs.mkdir("temp/edited-frames")];
            case 25:
                _h.sent();
                return [4 /*yield*/, exec("ffmpeg -i ".concat(input, " temp/raw-frames/%d.png"))];
            case 26:
                _h.sent();
                console.log("[3/3] Rendering frames...");
                frames_1 = fs.readdirSync("temp/raw-frames");
                count = 1;
                _h.label = 27;
            case 27:
                if (!(count <= frames_1.length)) return [3 /*break*/, 32];
                return [4 /*yield*/, Jimp.read("temp/raw-frames/".concat(count, ".png"))];
            case 28:
                frame = _h.sent();
                return [4 /*yield*/, onFrame(frame, count, imageOneP, imageTwoP)];
            case 29:
                frame = _h.sent();
                return [4 /*yield*/, frame.writeAsync("temp/edited-frames/".concat(count, ".png"))];
            case 30:
                _h.sent();
                _h.label = 31;
            case 31:
                count++;
                return [3 /*break*/, 27];
            case 32: return [4 /*yield*/, exec("ffmpeg -start_number 1 -r 30 -i temp/edited-frames/%d.png -i temp/audio.mp3 -vframes 2000 -pix_fmt yuv420p -vcodec ".concat(videoEncoder, " -acodec copy temp/video.mp4"))];
            case 33:
                _h.sent();
                return [4 /*yield*/, exec("ffmpeg -i temp/video.mp4 -i temp/audio.mp3 -c:v copy -c:a aac ".concat(output))];
            case 34:
                _h.sent();
                return [4 /*yield*/, fs.remove("temp")];
            case 35:
                _h.sent();
                return [3 /*break*/, 39];
            case 36:
                err_1 = _h.sent();
                console.log(err_1);
                if (!!debug) return [3 /*break*/, 38];
                return [4 /*yield*/, fs.remove("temp")];
            case 37:
                _h.sent();
                _h.label = 38;
            case 38: return [3 /*break*/, 39];
            case 39: return [2 /*return*/];
        }
    });
}); };
function onFrame(frame, frameCount, imageOne, imageTwo) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (frameCount > 200 && frameCount < 600) {
                frame.composite(imageOne, 120, 300);
            }
            if (frameCount > 800 && frameCount < 1200) {
                frame.composite(imageTwo, 120, 300);
            }
            return [2 /*return*/, frame];
        });
    });
}
main();
