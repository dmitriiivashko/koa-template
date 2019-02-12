/**
 * Core IoC library
 *
 * @export
 * @class CoreIoC
 */
export default class CoreIoC {
  /**
   * Creates an instance of IoC.
   *
   * @memberof CoreIoC
   */
  constructor(settings) {
    this._instances = {};
    this.settings = settings || {};
  }

  /**
   * Main init scenario
   */
  async init() {
    throw new Error('IoC init not implemented');
  }

  /**
   * Register a new service in IoC container
   *
   * @param {object} `name` - service name, `instance` - instance or `factory` - factory method, `eager` - load immediately (for factory objects only)
   * @memberof CoreIoC
   */
  register({
    name, instance, factory, eager,
  }) {
    // Immediately set instance to null
    this._instances[`_${name}`] = null;

    if (typeof factory !== 'undefined' && eager) {
      // Eager factory
      // - Calculate instance and set it immediately
      // - Getter returns calculated instance
      this._instances[`_${name}`] = factory(this);
      Object.defineProperty(this, name, {
        enumerable: true,
        configurable: true,
        get: () => this._instances[`_${name}`],
      });
    } else if (typeof instance !== 'undefined') {
      // Instance
      // - Set service instance
      // - Getter returns instance
      this._instances[`_${name}`] = instance;
      Object.defineProperty(this, name, {
        enumerable: true,
        configurable: true,
        get: () => this._instances[`_${name}`],
      });
    } else if (typeof factory !== 'undefined' && !eager) {
      // Lazy factory
      // - Getter:
      // --- calculates instance
      // --- registers calculated service under the same name
      // --- returns the instance after registering
      Object.defineProperty(this, name, {
        enumerable: true,
        configurable: true,
        get: () => {
          const obj = factory(this);
          this.register({ name, instance: obj });
          return obj;
        },
      });
    }
  }
}
