import os from 'os'

export const config ={
    listenIp:'0.0.0.0',
    listenPort: 3016,

    mediasoup:{
        numWorkers:Object.keys(os.cpus()).length,
        worker:{
            rtcMinPort:10000,
            rtcMaxPort:10100,
            logLevel:'debug',
            logTags:[
                'info',
                'ice',
                'dtls',
                'srtp',
            ] 
        },
        router:{
            mediaCodecs:[
                {
                    kind:'audio',
                    mimeType:'audio/opus',
                    clockRate: 48000,
                    channels: 2
                },
                {
                    kind:'video',
                    mimeType:'video/VP8',
                    clockRate: 90000,
                    parameters:{
                        'x-google-start-bitrate':1000,
                    }
                }
            ]
        },
        webRtcTransport:{
            listenIps:[
                {
                    ip:'0.0.0.0',
                    announcedIp:'161.35.1.205'
                }
            ],
            maxIncomeBitrate: 1500000,
            initialAvailableOutgoingBitrate: 1000000
        }
    }
}