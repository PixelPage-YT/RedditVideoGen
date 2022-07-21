'use strict';

const Snoowrap = require("snoowrap");
const snoowrap = require('snoowrap');
const googleTTS = require('google-tts-api');
const Jimp = require("jimp");
const fs = require("fs-extra");
const util = require("util");
const superagent = require('superagent');
const config = require("./config.js");

const exec = util.promisify(require("child_process").exec);
const debug = config.debug;

console.log(`Reddit Video Generator v1.0.0
[1/3] Fetching data...`)

const choose = (choices) => choices[Math.floor(Math.random() * choices.length)];

const main = async () => {
    const r = new snoowrap({
        userAgent: config.reddit.userAgent,
        clientId: config.reddit.clientId,
        clientSecret: config.reddit.clientSecret,
        refreshToken: config.reddit.refreshToken
    });

    const randomHotPost = await choose(await r.getHot());
    // @ts-ignore
    const postReplies = await randomHotPost.expandReplies({limit:1, depth:1});
    const firstComment = postReplies.comments[1];
    // @ts-ignore
    const secondComment:Snoowrap.Comment = (await firstComment.expandReplies({limit:1, depth:1})).replies[0];
    // @ts-ignore
    const thirdComment:Snoowrap.Comment = (await secondComment.expandReplies({limit:1, depth:1})).replies[0];

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

    const Speech = googleTTS.getAllAudioUrls(thingsToRead.join(" "), {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
    });

    await fs.mkdir("temp")
    await fs.mkdir("temp/speech")

    await fs.writeFile("./temp/speech/afiles.txt", "", "utf8")

    let i = 0;
    for(let e of Speech){
        const file = fs.createWriteStream("./temp/speech/audio" + i.toString() + '.mp3')
        const request = await (superagent.get(e.url)).pipe(file)
        await fs.writeFile("./temp/speech/afiles.txt", (await fs.readFile("./temp/speech/afiles.txt")) + "file 'audio" + i + ".mp3'\n", "utf8");
        i++
    }

    const sleep = util.promisify(setTimeout);
    await sleep(1000);

    await fs.writeFile("./temp/speech/afiles.txt", (await fs.readFile("./temp/speech/afiles.txt")).slice(0, -1), "utf8");
    await exec(`ffmpeg -f concat -safe 0 -i ./temp/speech/afiles.txt -c copy ./temp/audio.mp3`)
    
    const imageSearch = require('image-search-google');
 
    const client = new imageSearch(config.google.cseID, config.google.apiKey);
    const options = {page:1};

    const imageOne = (await client.search(thingsToRead[0].split(" ")[2], options))[0].thumbnail;
    const imageTwo = (await client.search(thingsToRead[2].split(" ")[2], options))[0].thumbnail;

    if(debug){
        fs.writeFile("temp/log.txt", `Speech: ${Speech.map((s) => {return s.url}).join("\n")}\nimageOne: ${imageOne}\nimageTwo: ${imageTwo}`, "utf8")
    }

    console.log("\n[2/3] Encoding video...");

    const videoEncoder = config.videoEncoder
    const input = config.input;
    const output = config.output;

    const imageOneP = await Jimp.read(imageOne)
    const imageTwoP = await Jimp.read(imageTwo)

    try{
        await fs.mkdir("temp/raw-frames")
        await fs.mkdir("temp/edited-frames")

        await exec(`ffmpeg -i ${input} temp/raw-frames/%d.png`);
        console.log("[3/3] Rendering frames...");
        const frames = fs.readdirSync(`temp/raw-frames`);

        for(let count = 1; count <= frames.length; count++){
            let frame = await Jimp.read(`temp/raw-frames/${count}.png`);

            frame = await onFrame(frame, count, imageOneP, imageTwoP);

            await frame.writeAsync(`temp/edited-frames/${count}.png`);
        }

        await exec(`ffmpeg -start_number 1 -r 30 -i temp/edited-frames/%d.png -i temp/audio.mp3 -vframes 2000 -pix_fmt yuv420p -vcodec ${videoEncoder} -acodec copy temp/video.mp4`);
        await exec(`ffmpeg -i temp/video.mp4 -i temp/audio.mp3 -c:v copy -c:a aac ${output}`);


        await fs.remove("temp");
    }catch(err){
        console.log(err)

        if(!debug){
            await fs.remove("temp")
        }
    }
}

async function onFrame(frame, frameCount, imageOne, imageTwo) {

    if(frameCount > 200 && frameCount < 600){
        frame.composite(imageOne, 120, 300);
    }
    if(frameCount > 800 && frameCount < 1200){
        frame.composite(imageTwo, 120, 300);
    }

    return frame;
}

main();