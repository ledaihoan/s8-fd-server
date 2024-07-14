import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as WebSocket from 'ws';
import {
  CB_WS_QUEUE_TOKEN,
  CoinbaseModuleOption,
  MODULE_OPTIONS,
} from './coinbase-module-option';
import { base64ToBinary, createHmac } from '../utils/encryption.util';
import * as moment from 'moment';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

const SIGNATURE_PATH = '/users/self/verify';

@Injectable()
export class CoinbaseWsClient implements OnModuleInit, OnModuleDestroy {
  private ws: WebSocket;
  private directWs: WebSocket;

  constructor(
    @Inject(MODULE_OPTIONS) private options: CoinbaseModuleOption,
    @InjectQueue(CB_WS_QUEUE_TOKEN.toString()) private queue: Queue,
  ) {}

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.disconnect();
  }

  private connect() {
    this.ws = new WebSocket(this.options.wssOptions.marketWsUri);
    // this.directWs = new WebSocket(this.options.wssOptions.directMarketWsUri);
    this.ws.on('open', () => {
      this.subscribe(this.ws);
      console.log('Connected to Coinbase WebSocket');
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      const message = JSON.parse(data.toString());
      // Handle incoming messages
      console.log('Received:', message);
      if (message && message.type === 'ticker') {
        this.queue.add('ticker', message);
      }
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.ws.on('close', () => {
      console.log('Disconnected from Coinbase WebSocket');
    });
  }

  private subscribe(ws: WebSocket) {
    const subscribeMessage = {
      type: 'subscribe',
      product_ids: ['BTC-USD'],
      channels: ['ticker'],
    };
    const subscriptionPayload = this.buildSubscriptionPayload(subscribeMessage);
    console.log(`sending subscription ${JSON.stringify(subscriptionPayload)}`);
    ws.send(Buffer.from(JSON.stringify(subscriptionPayload)));
  }

  private disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  private signRequest(signaturePath: string, timestamp: number) {
    const message = `${timestamp}GET${signaturePath}`;
    return createHmac(message, base64ToBinary(this.options.httpOptions.secret));
  }

  private buildSubscriptionPayload(originPayload: Record<string, any>) {
    const timestamp = moment().unix();
    return {
      ...originPayload,
      signature: this.signRequest(SIGNATURE_PATH, timestamp),
      key: this.options.httpOptions.apiKey,
      passphrase: this.options.httpOptions.passPhrase,
      timestamp: `${timestamp}`,
    };
  }
}
