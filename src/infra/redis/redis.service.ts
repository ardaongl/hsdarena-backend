import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';


@Injectable()
export class RedisService {
public client: Redis;
constructor() {
this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
}
}