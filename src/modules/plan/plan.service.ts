import { Injectable } from '@nestjs/common';
import { QlooService } from '../qloo/qloo.service';
import { LlmService } from '../llm/llm.service';
import { LocationService } from '../location/location.service';
import { UserService } from '../user/user.service';

@Injectable()
export class PlanService {
  constructor(
    private readonly qlooService: QlooService,
    private readonly llmService: LlmService,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
  ) {}

  // Plan service methods will be implemented in later tasks
}