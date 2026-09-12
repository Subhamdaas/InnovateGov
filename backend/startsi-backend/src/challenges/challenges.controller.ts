import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { ChallengesService } from './challenges.service';
class CreateChallengeDto { @IsString() departmentId!: string; @IsString() title!: string; @IsString() problemStatement!: string; @IsString() expectedOutcome!: string; @IsOptional() @IsIn(['DRAFT','ACTIVE','CLOSED']) status?: 'DRAFT'|'ACTIVE'|'CLOSED'; @IsString() createdById!: string; }
@Controller('challenges') export class ChallengesController {
 constructor(private service: ChallengesService) {}
 @Get() list(){return this.service.list();}
 @Get(':id/recommendations') recs(@Param('id') id:string){return this.service.recommendations(id);}
 @Get(':id') get(@Param('id') id:string){return this.service.get(id);}
 @Post() create(@Body() dto:CreateChallengeDto){return this.service.create(dto);}
}
