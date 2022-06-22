import { TestBed } from '@angular/core/testing';

import { GameSelectGuard } from './game-select.guard';

describe('GameSelectGuard', () => {
  let guard: GameSelectGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GameSelectGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
