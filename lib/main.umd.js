(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.jesium = {}));
}(this, (function (exports) { 'use strict';

	/**
	 * jesium版本号
	 */
	var version = require("../package.json").version;

	exports.version = version;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
