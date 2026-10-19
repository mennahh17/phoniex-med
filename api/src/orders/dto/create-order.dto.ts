export class OrderItemDto {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export class CreateOrderDto {
  items: OrderItemDto[];
  deliveryAddress :string;
  phone:string;
  email:string;
  country:string;
  firstName:string;
  lastName:string;
  city:string;
  governorate:string;
}