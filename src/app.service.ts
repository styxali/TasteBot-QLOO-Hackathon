import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'TasteBot API is running! 🤖🎨';
  }
}