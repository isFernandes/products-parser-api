import { ObjectId } from "mongodb";

export type IImportHistory = {
  _id?: ObjectId;
  quantity: number;
  date: Date;
  source: string;
};
