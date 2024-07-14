import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsSubscribeMessage } from './types/ws-subscribe-message';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CoinbaseTickerMessage } from '../coinbase-client/types/ticker-message';
import { CoinbaseWsClient } from '../coinbase-client/coinbase-ws-client';
import * as _ from 'lodash';
import { Logger } from '@nestjs/common';

@WebSocketGateway(8900, {
  cors: {
    origin: '*',
  },
  namespace: 'socket.io',
})
@Processor('wss_queue')
export class S8FdWebsocketGateway
  extends WorkerHost
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private topics: Map<string, Set<Socket>> = new Map();

  private logger = new Logger(S8FdWebsocketGateway.name);

  constructor(private wsClient: CoinbaseWsClient) {
    super();
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.topics.forEach((clients, topic) => {
      if (clients.has(client)) {
        clients.delete(client);
        this.logger.log(`Client unsubscribed from ${topic}: ${client.id}`);
      }
    });
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, data: string) {
    const message = JSON.parse(data) as WsSubscribeMessage;
    const topics = message.productIds.map((pid) => `ticker-${pid}`);

    const newSubscribeTopics = _.filter(
      topics,
      (topic) => !this.topics.has(topic),
    );
    topics.forEach((topic) => {
      if (!this.topics.has(topic)) {
        this.topics.set(topic, new Set());
      }
      this.topics.get(topic).add(client);
      this.logger.log(`Client subscribed to ${topic}: ${client.id}`);
    });

    const newProductIds = newSubscribeTopics.map(
      (topic) => topic.split('-')[1],
    );
    if (!_.isEmpty(newProductIds)) {
      this.wsClient.subscribe(newProductIds);
    }

    return {
      event: 'subscribed',
      data: `You are now subscribed to ${topics.join()}`,
    };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, data: string) {
    const message = JSON.parse(data) as WsSubscribeMessage;
    const topics = message.productIds.map((pid) => `ticker-${pid}`);
    topics.forEach((topic) => {
      if (this.topics.has(topic)) {
        this.topics.get(topic).delete(client);
        this.logger.log(`Client unsubscribed from ${topic}: ${client.id}`);
      }
    });

    return {
      event: 'unsubscribed',
      data: `You are now unsubscribed from ${topics.join()}`,
    };
  }

  broadcastUpdate(topic: string, update: string) {
    this.logger.log(`Processing ws update ${topic}`, this.topics.has(topic));
    if (this.topics.has(topic)) {
      const clients = this.topics.get(topic);
      clients.forEach((client) => {
        client.emit('update', { topic, data: update });
      });
    }
  }

  async process(job: Job) {
    const jobName = job.name;
    if (jobName === 'ticker') {
      const message = job.data as CoinbaseTickerMessage;
      const productId = message.product_id;
      const topic = `ticker-${productId}`;
      this.broadcastUpdate(topic, JSON.stringify(message));
    }
  }
}
