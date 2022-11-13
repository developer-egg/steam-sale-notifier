require('dotenv').config()
const axios = require('axios')

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// hardcoding for now, since certain hosters do not allow args
const gameID = 1238810
let gameName = ""

axios.get(`https://private-anon-7572593235-itad.apiary-proxy.com/v02/game/plain/?key=${process.env.ITAD_API_KEY}&shop=steam&game_id=app%2F${gameID}`)
.then((res) => {
    gameName = res.data.data['plain']

    runAtSpecificTimeOfDay(1, 30, checkGame)
}).catch((err) => {
    console.log(err);
})

// run this once a day

async function checkGame() {
    await axios.get(`https://private-anon-7572593235-itad.apiary-proxy.com/v01/game/prices/?key=${process.env.ITAD_API_KEY}&plains=${gameName}&shops=steam`)
    .then((res) => {
        // console.log(res.data.data[`${gameName}`].list)
        const data = res.data.data[`${gameName}`]
        console.log(data.list.length)

        if(data.list.length >= 1) {
            console.log("there is a sale")
            // there is a sale!!!
            // send the message

            priceCut = data.list[0].price_cut;

            client.messages
            .create({body: `There is a sale on ${gameName}! The game is ${priceCut}% off!`, from: '+12537858930', to: `+1${process.env.PHONE_NUMBER}`})
            .then(message => console.log(message.sid));
        }
    }).catch((err) => {
        console.log(err)
    })
}

function runAtSpecificTimeOfDay(hour, minutes, func)
{
  const twentyFourHours = 86400000;
  const now = new Date();
  let eta_ms = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minutes, 0, 0).getTime() - now;
  if (eta_ms < 0)
  {
    eta_ms += twentyFourHours;
  }
  setTimeout(function() {
    //run once
    func();
    // run every 24 hours from now on
    setInterval(func, twentyFourHours);
  }, eta_ms);
}
    



