import { Crawler } from './lib/crawler';

// const c = new Crawler(675429, true, 'https://www.douyu.com/topic/jnhqngs?rid=675429')
const c = new Crawler(100)
c.printLiveLink().then().catch((e) => {
    console.log(e)
})