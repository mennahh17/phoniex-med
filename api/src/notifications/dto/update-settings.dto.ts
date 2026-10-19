import { IsOptional , IsBoolean , IsInt , Min} from "class-validator";

export class UpdateSettingsDto {
    @IsBoolean()
    @IsOptional()
    enabled? : boolean;

    @IsBoolean()
    @IsOptional()
    inApp? : boolean;

    @IsBoolean()
    @IsOptional()
    email? : boolean;

    @IsBoolean()
    @IsOptional()
    newOrders? : boolean;

    @IsBoolean()
    @IsOptional()
    sellRequests? : boolean;

    @IsBoolean()
    @IsOptional()
    lowStock? : boolean;

    @IsBoolean()
    @IsOptional()
    customerInquiries? : boolean;

    @IsBoolean()
    @IsOptional()
    payments? : boolean;

    @IsBoolean()
    @IsOptional()
    newCustomers? : boolean;

    @IsInt()
    @Min(0)
    @IsOptional()
    defaultLowStock? : number;
}

