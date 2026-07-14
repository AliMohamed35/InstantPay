import type {
  Attributes,
  CreationAttributes,
  DestroyOptions,
  FindOptions,
  Identifier,
  IncrementDecrementOptionsWithBy,
  Model,
  ModelStatic,
  UpdateOptions,
} from "sequelize";

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

  // this returns Promise<[affectedCount: number]> not a model instance
  public update(
    values: Partial<Attributes<M>>,
    options: UpdateOptions<Attributes<M>>,
  ): Promise<[affectedCount: number]> {
    return this.model.update(values, options);
  }

  // delete
  public delete(options: DestroyOptions): Promise<number> {
    return this.model.destroy(options);
  }

  // findUserById
  public findById(id: Identifier): Promise<M | null> {
    return this.model.findByPk(id);
  }

  // increment attempts
  public increment(
    fieldName: keyof Attributes<M>,
    options: IncrementDecrementOptionsWithBy<Attributes<M>>,
  ): Promise<[affectedRows: M[], affectedCount?: number]> {
    return this.model.increment(fieldName, options);
  }
}

export default AbstractRepository;
