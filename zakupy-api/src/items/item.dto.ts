export type ItemDto = {
  id: string;
  name: string;
  bought: boolean;
};

export type CreateItemDto = {
  name: string;
};

export type UpdateItemDto = {
  name?: string;
  bought?: boolean;
};
