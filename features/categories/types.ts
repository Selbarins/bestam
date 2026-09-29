export type CategoryBucket = "essentials" | "lifestyle" | "growth" | "other";

export type Category = {
  id: string;
  name: string;
  bucket: CategoryBucket;
  icon: string;
  color: string;
  sort_order: number;
};
