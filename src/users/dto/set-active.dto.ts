import { IsBoolean } from 'class-validator';

export class SetActiveDto {
  @IsBoolean({ message: "Status aktif harus berupa nilai boolean" })
  readonly isActive: boolean;
}
