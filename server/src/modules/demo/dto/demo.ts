import { ApiProperty } from '@midwayjs/swagger';

export class DemoDto {
  @ApiProperty({ readOnly: true })
  public id: number;

  @ApiProperty()
  public text: string;

  @ApiProperty({ readOnly: true })
  public createdTime: Date;

  @ApiProperty({ readOnly: true })
  public updateTime: Date;
}
