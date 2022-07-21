# Reddit Video Generator
<p>
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
	">
</p>

> This generates 16:9 Videos of random reddit threads

```yml
WARNING: This is for educational purposes only. It is not meant to spam any social media with it! The generated Video often contains copyright media.
Additionally, this code is a prototype at the moment. I'm going to update it soon.
```
### Prerequisites
- Ffmpeg
- Nodejs
### Usage
Create the file `config.ts` and edit
- reddit.clientId
- reddit.clientSecret
- reddit.refreshToken
- google.cseID
- google.apiKey
```ts
module.exports = {
    /** See files that help debugging */
    debug: false,
    videoEncoder: "h264",
    /** E.g. Minecraft Gameplay */
    input: "gameplay.mp4",
    output: "output.mp4",
    /** Reddit API config */
    reddit: {
        userAgent: "Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/60.0.3112.107 Mobile Safari/537.36",
        clientId: '',
        clientSecret: '',
        refreshToken: ''
    },
    /** Google Custom Search Engine Config */
    google: {
        cseID: "",
        apiKey: "",
    }
}
```
Start it with `yarn dev` or `npm run dev`
### What it does
The generator picks a random post from reddit and fetches three comments. Then, it uses googleTts to get audio files of it. It finds related images on a custom google search engine. Then, it renders everything using ffmpeg.
### Support the project
Give the project a ⭐️ if it helped you!