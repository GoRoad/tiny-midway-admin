import { Rule, RuleType } from '@midwayjs/validate';
import { ApiProperty } from '@midwayjs/swagger';

// @midwayjs/validate的validatedQuery会将字符串值，转换为数字
// query查询需要在crud_decorator设置ApiProperty
export class ListQuery {
  @Rule(RuleType.number().default(100))
  // @ApiProperty({ example: '', description: ''})
  take: number;

  @Rule(RuleType.number())
  cursorId: number;
}


export class BaseQuery {
  public select: unknown;

  @ApiProperty()
  public include: unknown;

  @ApiProperty()
  public sort: unknown;

  @ApiProperty()
  public page: number;

  @ApiProperty()
  public limit: number;
}
