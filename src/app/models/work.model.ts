/**
 * Interface representing a Work item.
 */
export interface Work {
  id: string;
  workName: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
