import type { Attributes, CreationAttributes, FindOptions, Model, ModelStatic } from "sequelize";

class AbstractRepository<M extends Model> {
  protected readonly model: ModelStatic<M>;

  constructor(model: ModelStatic<M>) {
    this.model = model;
  }

  public create(data: CreationAttributes<M>): Promise<M> {
    return this.model.create(data);
  }

  public findOne(options?: FindOptions<Attributes<M>>): Promise<M | null> {
    return this.model.findOne(options);
  }
}

export default AbstractRepository;
