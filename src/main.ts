import { Crawler } from './lib/crawler';

if (process.argv.length < 3) {
    console.log('需要传入房间号')
} else {
    const roomID = process.argv.slice(2)[0]
    const c = new Crawler(parseInt(roomID))
    c.printLiveLink().then().catch((e) => {
        console.log(e)
    })
}