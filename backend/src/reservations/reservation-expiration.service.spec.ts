import { Test, TestingModule } from '@nestjs/testing';
import { ReservationExpirationService } from './reservation-expiration.service';

describe('ReservationExpirationService', () => {
  let service: ReservationExpirationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReservationExpirationService],
    }).compile();

    service = module.get<ReservationExpirationService>(ReservationExpirationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
