import { config } from "./config.js";

const createNewTransport=async(mediasoupRouter)=>{
   const {
    initialAvailableOutgoingBitrate,
    maxIncomeBitrate
   } = config.mediasoup.webRtcTransport

   const transport = await mediasoupRouter.createWebRtcTransport({
    listenIps:config.mediasoup.webRtcTransport.listenIps,
    enableUdp:true,
    enableTcp:true,
    preferUdp:true,
    initialAvailableOutgoingBitrate
   })

   if(maxIncomeBitrate){
    try{
    transport.setMaxIncomingBitrate(maxIncomeBitrate)
    }
    catch(err){
        console.error(err)
    }
   }

   return {
    transport,
    params:{
        id:transport.id,
        iceParameters:transport.iceParameters,
        iceCandidates:transport.iceCandidates,
        dtlsParameters:transport.dtlsParameters
    }
   }

}

export {createNewTransport}