import { create } from "domain";
import { Kafka, Partitioners, Producer } from "kafkajs";
import fs from 'fs';
import path from "path";
import 'dotenv/config';
import prismaClient from "./prisma";

const kafka = new Kafka({
    brokers:[process.env.KAFKA_BROKER!],
    ssl:{
        ca:[fs.readFileSync(path.resolve("./ca.pem"),"utf-8")]
    },
    sasl:{
        username:process.env.KAFKA_USERNAME!,
        password:process.env.KAFKA_PASSWORD!,
        mechanism:"plain"
    }
});

let producer: null | Producer = null;

export async function createProducer() {
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}


export async function produceMessage (message: string){
    const producer = await createProducer();
    try{
        await producer?.send({
            messages:[{key:`message-${Date.now()}` , value:message}],
            topic:"MESSAGES",
        });
    }catch(e){
        console.log(e);
    }
    return true;
}
export async function startMessageConsumer(){
    console.log('consumer running...');
    
    const consumer = await kafka.consumer({groupId:"default"});
    await consumer.connect();
    await consumer.subscribe({topic:"MESSAGES",fromBeginning:true});

    await consumer.run({
        autoCommit:true,
        eachMessage:async ({message,pause})=>{
            if(!message.value)return;

            console.log('New msg received in consumer');

            try{
                await prismaClient.message.create({
                    data:{
                        text:message.value?.toString(),
                    },
                });
            }catch(err){
                console.log('Error while consuming...');
                pause();
                setTimeout(()=>{
                    consumer.resume([{topic:'MESSAGES'}]);
                },60*1000);
            }
        },
    })
}
export default kafka;