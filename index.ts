'use strict';

process.stdout.write(`Reddit Video Generator v1.0.0
[1/5] Initializing...`);

const Snoowrap = require("snoowrap");
const googleTTS = require('google-tts-api');
const Jimp = require("jimp");
const fs = require("fs-extra");
const util = require("util");
const superagent = require('superagent');
const config = require("./config.ts");
const exec = util.promisify(require("child_process").exec);

const choose = (choices) => choices[Math.floor(Math.random() * choices.length)];
const onFrame = async (frame, frameCount, imageOne, imageTwo) => {
    if(frameCount > 200 && frameCount < 600){
        frame.composite(imageOne, 120, 300);
    }
    if(frameCount > 800 && frameCount < 1200){
        frame.composite(imageTwo, 120, 300);
    }
    return frame;
}

(async () => {
    await fs.mkdir("temp")
    await fs.mkdir("temp/speech")
    await fs.writeFile("./temp/speech/afiles.txt", "", "utf8")
    await fs.mkdir("temp/raw-frames")
    await fs.mkdir("temp/edited-frames")

    process.stdout.write(`\n[2/5] Fetching Reddit posts...`);
    const r = new Snoowrap({
        userAgent: config.reddit.userAgent,
        clientId: config.reddit.clientId,
        clientSecret: config.reddit.clientSecret,
        refreshToken: config.reddit.refreshToken
    });

    const randomHotPost = await choose(await r.getHot());
    const postReplies = await randomHotPost.expandReplies({limit:1, depth:1});
    const firstComment = postReplies.comments[1];
    const secondComment = (await firstComment.expandReplies({limit:1, depth:1})).replies[0];
    const thirdComment = (await secondComment.expandReplies({limit:1, depth:1})).replies[0];

    let thingsToRead:string[] = [];

    thingsToRead.push(randomHotPost.title)
    thingsToRead.push(firstComment.body);
    thingsToRead.push(secondComment.body);

    try{
        thingsToRead.push(thirdComment.body);
    }catch(err){
        return console.error("The Reddit Thread was too short. Please try again.")
    }

    thingsToRead.map((thing) => thing.replace('\n', ' '))

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write("[2/5] Fetching Google TTS...");
    const Speech = googleTTS.getAllAudioUrls(thingsToRead.join(" "), {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
    });

    let i = 0;
    for(let e of Speech){
        const file = fs.createWriteStream("./temp/speech/audio" + i.toString() + '.mp3')
        await (superagent.get(e.url)).pipe(file)
        await fs.writeFile("./temp/speech/afiles.txt", (await fs.readFile("./temp/speech/afiles.txt")) + "file 'audio" + i + ".mp3'\n", "utf8");
        i++
    }

    const sleep = util.promisify(setTimeout);
    await sleep(1000);

    await fs.writeFile("./temp/speech/afiles.txt", (await fs.readFile("./temp/speech/afiles.txt")).slice(0, -1), "utf8");
    await exec(`ffmpeg -f concat -safe 0 -i ./temp/speech/afiles.txt -c copy ./temp/audio.mp3`)
    
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write("[2/5] Fetching images...");
    const imageSearch = require('image-search-google');
 
    const client = new imageSearch(config.google.cseID, config.google.apiKey);
    const options = {page:1};

    const imageOne = (await client.search(thingsToRead[0].split(" ")[2], options))[0].thumbnail;
    const imageTwo = (await client.search(thingsToRead[2].split(" ")[2], options))[0].thumbnail;

    if(config.debug){
        fs.writeFile("temp/log.txt", `Speech: ${Speech.map((s) => {return s.url}).join("\n")}\nimageOne: ${imageOne}\nimageTwo: ${imageTwo}\nText: ${thingsToRead.join(". ")}`, "utf8")
    }

    process.stdout.write("\n[3/5] Encoding input...");

    const imageOneP = await Jimp.read(imageOne)
    const imageTwoP = await Jimp.read(imageTwo)

    try{
        await exec(`ffmpeg -i ${config.input} temp/raw-frames/%d.png`);
        const frames = fs.readdirSync(`temp/raw-frames`);

        process.stdout.write("\n[4/5] Rendering frames...");
        for(let count = 1; count <= frames.length; count++){
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write("[4/5] Rendering frame " + count);
            let frame = await Jimp.read(`temp/raw-frames/${count}.png`);

            frame = await onFrame(frame, count, imageOneP, imageTwoP);

            await frame.writeAsync(`temp/edited-frames/${count}.png`);
        }

        process.stdout.write("\n[5/5] Generating video...");
        await exec(`ffmpeg -start_number 1 -r 30 -i temp/edited-frames/%d.png -i temp/audio.mp3 -vframes 2000 -pix_fmt yuv420p -vcodec ${config.videoEncoder} -acodec copy temp/video.mp4`);
        await exec(`ffmpeg -i temp/video.mp4 -i temp/audio.mp3 -c:v copy -c:a aac ${config.output}`);
        config.debug === false ? await fs.remove("temp") : null;

        console.log('\x1b[36m%s\x1b[0m', '\n✓ Done!');
    }catch(err){
        console.log(err)

        if(!config.debug){
            await fs.remove("temp")
        }
    }
})()