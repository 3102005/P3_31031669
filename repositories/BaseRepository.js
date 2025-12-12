class BaseRepository {
  constructor(model, models = null) {
    this.model = model;
    // models contiene todas las entidades (para includes). Si no se pasa, se requiere el index.
    this.models = models || require('../models');
  }

  async findAll(options = {}) {
    return await this.model.findAll(options);
  }

  async findById(id, options = {}) {
    return await this.model.findByPk(id, options);
  }

  async create(data, options = {}) {
    return await this.model.create(data, options);
  }

  async update(instance, data, options = {}) {
    return await instance.update(data, options);
  }

  async delete(instance, options = {}) {
    return await instance.destroy(options);
  }
}

module.exports = BaseRepository;
