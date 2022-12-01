import {WebSocketServer} from 'ws'
import * as http from 'http'
import { createaWorker } from './worker.js'
import { createNewTransport } from './transport.js'
import {createServer} from 'http'
import express from 'express'
import { Server } from 'socket.io'


const app = express()
const server = createServer(app)

const io = new Server(server, {
    cors:'*'
  });

  let Users=[];

io.on("connection",(socket)=>{
  console.log("connected!",socket.id)
  Users.push(socket.id)

  socket.on('getRTPCapabilites',({id})=>{
    console.log('rtprecv',socket.id)
    if(consumers>=0&&consumers<=400){
      io.to(socket.id).emit('hereRTP',{capabilities:mediasoupRouter.rtpCapabilities})
    }
    else if(consumers>400&&consumers<=800){
      io.to(socket.id).emit('hereRTP',{capabilities:mediasoupRouter2.rtpCapabilities})
    }
    else if(consumers>800&&consumers<=1200){
      io.to(socket.id).emit('hereRTP',{capabilities:mediasoupRouter3.rtpCapabilities})
    }
    else if(consumers>1200&&consumers<=1600){
      io.to(socket.id).emit('hereRTP',{capabilities:mediasoupRouter4.rtpCapabilities})
    }
    else {
      io.to(socket.id).emit('hereRTP',{capabilities:mediasoupRouter.rtpCapabilities})
    }
  })

  socket.on('createTransport',({id})=>{
    createTransport(socket,id)
  })

  socket.on('connectTransport',({dtlsParameters,id})=>{
    connectTransport(dtlsParameters,socket,id)
  })

  socket.on('produce',(data)=>{
    produce(data,socket)
  })


  socket.on("createConsumeTransport",(data)=>{
    createConsumeTransport(data,socket)
  })

  socket.on('transportConnect',(data)=>{
   connectConsumerTransport(data,socket)
  })

  socket.on('startConsuming',(data)=>{
    startConsuming(data,socket)
  })

  socket.on('getStr',(data)=>{
    io.to(data.sockId).emit('newProd',data)
  })

  socket.on("disconnect",async()=>{
    console.log(socket.id,'sockaId',Users)
    const cartFilter = Users.filter((user)=>user!==socket.id)
    Users = cartFilter;
    Users.forEach((user)=>{
      io.to(user).emit('check',{id:socket.id})
    })
    console.log('ranEmit')
  })

})
  



let mediasoupRouter;
let mediasoupRouter2;
let mediasoupRouter3;
let mediasoupRouter4;
let webRtcTransport;
let consumeTransport=[];
let VideoProducer;
let AudioProducer;
let consumers = 0;
let consumer;

const startMediasoup=async()=>{
    try{
        mediasoupRouter = await createaWorker()
        mediasoupRouter2= await createaWorker()
        mediasoupRouter3 = await createaWorker()
        mediasoupRouter4 = await createaWorker()
    }
    catch(err){
        throw err;
    }
}

startMediasoup();



async function createTransport(socket,id){
    try{
        console.log("creating trans")
        const {transport,params} = await createNewTransport(mediasoupRouter)
 webRtcTransport = transport;
 io.to(id).emit('transportCreated',{data:params})

    }
    catch(err){
        socket.emit('transportCreated',{data:'err'})
    }
}

async function connectTransport(params,socket,id){
    console.log("connecting trans")
    await webRtcTransport.connect({dtlsParameters:params})
    io.to(id).emit('transportConnected')
}

async function produce(data,socket){
    try{
        console.log("runnning")
        const {kind,rtpParameters,id} = data;
        console.log(data,'dat')
        console.log("running aggg")
        if(kind==="video"){
          VideoProducer = await webRtcTransport.produce({kind,rtpParameters})
          await mediasoupRouter.pipeToRouter({ producerId: VideoProducer.id, router: mediasoupRouter2 });
          await mediasoupRouter.pipeToRouter({ producerId: VideoProducer.id, router: mediasoupRouter3 });
          await mediasoupRouter.pipeToRouter({ producerId: VideoProducer.id, router: mediasoupRouter4 });
          io.to(id).emit('producing',{producerId:VideoProducer.id,type:"video"})
        }
        else if(kind==="audio"){
          AudioProducer = await webRtcTransport.produce({kind,rtpParameters})
          await mediasoupRouter.pipeToRouter({ producerId: AudioProducer.id, router: mediasoupRouter2 });
          await mediasoupRouter.pipeToRouter({ producerId: AudioProducer.id, router: mediasoupRouter3 });
          await mediasoupRouter.pipeToRouter({ producerId: AudioProducer.id, router: mediasoupRouter4 });
          io.to(id).emit('producing',{producerId:VideoProducer.id,type:"audio"})
        }
    }
    catch(err){
        console.log(err)
    }

}

async function createConsumeTransport(data,socket){
    try{
      if(consumers>=0&&consumers<=400){
        console.log("creating transport consume");
        const {transport,params} = await createNewTransport(mediasoupRouter)
        consumeTransport[data.randId] = transport;
    io.to(data.id).emit('ConsumeTransportCreated',{data:params,randId:data.randId})
      consumers +=2;
      }
      else if(consumers>400&&consumers<=800){
        console.log("creating transport consume");
        const {transport,params} = await createNewTransport(mediasoupRouter2)
        consumeTransport[data.randId] = transport;
    io.to(data.id).emit('ConsumeTransportCreated',{data:params,randId:data.randId})
       consumers +=2;
       console.log(consumers,'consumers')
      }
      else if(consumers>800&&consumers<=1200){
        console.log("creating transport consume");
        const {transport,params} = await createNewTransport(mediasoupRouter3)
        consumeTransport[data.randId] = transport;
    io.to(data.id).emit('ConsumeTransportCreated',{data:params,randId:data.randId})
       consumers +=2;
       console.log(consumers,'consumers')
      }
      else if(consumers>1200&&consumers<=1600){
        console.log("creating transport consume");
        const {transport,params} = await createNewTransport(mediasoupRouter4)
        consumeTransport[data.randId] = transport;
    io.to(data.id).emit('ConsumeTransportCreated',{data:params,randId:data.randId})
       consumers +=2;
       console.log(consumers,'consumers')
      }
      else {
        io.to(data.sockId).emit("ConsumeTransportCreated",{data:'err',id:data.id})
        console.log(consumers,'consumers')
      }
    }
    catch(err){
        console.log(err)
        io.to(data.sockId).emit("ConsumeTransportCreated",{data:'err',id:data.id})
        console.log(consumers,'consumers')
    }
}

async function connectConsumerTransport(data,socket){
    console.log("transport comming!")
    const consumeTrans = consumeTransport[data.randId]
    await consumeTrans.connect({dtlsParameters:data.dtlsParameters})
    io.to(data.id).emit('consumerTransportConnected')
}

async function startConsuming(data,socket){
    console.log("startconsuming running!")
    try{
        console.log("Passed Test")
         let Videoconsumer = await consumeTransport[data.randId].consume({
            producerId:VideoProducer.id,
            rtpCapabilities:data.rtpCapabilities,
            paused: false
        })
        console.log("consumerCreated!",Videoconsumer,consumers,'sonsumers')
        io.to(data.id).emit('datarecv',{
          producerId:VideoProducer.id,
          kind:Videoconsumer.kind,
          id:Videoconsumer.id,
          type:Videoconsumer.type,
          rtpParameters:Videoconsumer.rtpParameters,
          producerPaused:Videoconsumer.producerPaused,
          randId:data.randId,
        })
        let Audioconsumer = await consumeTransport[data.randId].consume({
          producerId:AudioProducer.id,
          rtpCapabilities:data.rtpCapabilities,
          paused: false
      })
      console.log("consumerCreated!",Audioconsumer)
      io.to(data.id).emit('datarecv',{
        producerId:VideoProducer.id,
        kind:Audioconsumer.kind,
        id:Audioconsumer.id,
        type:Audioconsumer.type,
        rtpParameters:Audioconsumer.rtpParameters,
        producerPaused:Audioconsumer.producerPaused,
        randId:data.randId,
      })
        console.log("Last Message Sent!",consumers)
    }
    catch(err){
        console.log(err)
    }
}

// async function resume(ws){
//     await consumer.resume()
//     const message = {
//         type:'resumed',
//         data:'Connection Resumed!'
//     }
//     const jsmsg = JSON.stringify(message)
//     ws.send(jsmsg)
// }


server.listen(5000,()=>{
    console.log("App Listening Successfully!")
})



