/**
 * Core Model class for all basic model classes
 *
 * @export
 * @class CoreModel
 */
export default class CoreModel {
  /**
   * Export a list of whitelisted fields, allowed for auto-population
   */
  whitelisted() {
    return [];
  }

  /**
   * Export safe object with whitelisted params only
   */
  output() {
    const output = {};

    Object.getOwnPropertyNames(this).forEach((property) => {
      if ((this.whitelisted() || []).includes(property) && typeof this[property] !== 'undefined') {
        output[property] = this[property];
      }
    });

    return output;
  }

  /**
   * Deserialize model from DB record
   *
   * @static
   * @param {any} record Object record
   * @returns Model
   * @memberof CoreModel
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }

    const model = new this();

    Object.getOwnPropertyNames(model).forEach((property) => {
      if (typeof record[property] !== 'undefined') {
        model[property] = record[property];
      }
    });

    Object.defineProperty(model, '_raw', {
      configurable: false,
      enumerable: false,
      value: record,
      writable: false,
    });

    return model;
  }

  /**
   * Return raw DB record
   *
   * @returns
   * @memberof CoreModel
   */
  getRaw() {
    return this._raw;
  }
}
