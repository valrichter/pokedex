import { Injectable } from '@nestjs/common';

@Injectable()
export class SeedService {
  exeutedSeed() {
    return `This action returns all seed`;
  }
}
