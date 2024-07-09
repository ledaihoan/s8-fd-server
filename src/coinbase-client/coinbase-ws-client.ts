import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as WebSocket from 'ws';
import { CoinbaseModuleOption, MODULE_OPTIONS } from './coinbase-module-option';
import {
  base64ToBinary,
  createHmac,
  decodeBase64,
} from '../utils/encryption.util';
import * as moment from 'moment';

const SIGNATURE_PATH = '/users/self/verify';

@Injectable()
export class CoinbaseWsClient implements OnModuleInit, OnModuleDestroy {
  private ws: WebSocket;
  private directWs: WebSocket;

  constructor(@Inject(MODULE_OPTIONS) private options: CoinbaseModuleOption) {}

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
