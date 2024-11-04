import { ObjectId } from "mongodb";

enum IProductStatus {
  DRAFT = "draft",
  TRASH = "trash",
  PUBLISHED = "published",
}

type IProduct = {
  _id?: ObjectId;
  code: string;
  status: IProductStatus;
  imported_t: Date;
  url: string;
  creator: string;
  created_t: number;
  last_modified_t: number;
  product_name: string;
  quantity: string;
  brands: string;
  categories: string;
  labels: string;
  cities: string;
  purchase_places: string;
  stores: string;
  ingredients_text: string;
  traces: string;
  serving_size: string;
  serving_quantity: number;
  nutriscore_score: number;
  nutriscore_grade: string;
  main_category: string;
  image_url: string;
};

export { IProduct, IProductStatus };
