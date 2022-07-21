/**
 * @author ptashima [ptashima@toolboxtve.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { fromBase64, ALPHABET_OPTIONS } from "../lib/Base64.mjs";
import { CurlGenerator } from "curl-generator";

/**
 * fullRequestTemplate to curl operation
 */
class RestToCurl extends Operation {

  /**
   * FullRequestTemplateToCurl constructor
   */
  constructor() {
    super();

    this.name = "rest to curl";
    this.module = "Default";
    this.description = "Copy the simpleRest or loginRest JSON from the database and paste here";
    this.infoURL = "";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input) {
    const parsed = JSON.parse(input)
    iterateOverObjectAndTransformFromB64(parsed)
    const parsedTemplate = parseRestToCurlGenerator(parsed)
    return CurlGenerator(parsedTemplate);
  }
}

function parseRestToCurlGenerator(rest) {
  const config = { ...rest, url: rest.baseUrl }
  if (rest.request.query) config.url = `${config.url}?${rest.request.query}`
  return config
}

function iterateOverObjectAndTransformFromB64(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = transformB64StringOrReturnOriginal(obj[key])
    } else if (
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key]) &&
      obj[key] !== null
    ) {
      iterateOverObjectAndTransformFromB64(obj[key])
    }
  }
}

function transformB64StringOrReturnOriginal(str) {
  const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  let finalString = str
  if (!base64regex.test(str)) return str
  try {
    finalString = fromBase64(str, "A-Za-z0-9+/=", "string", true, false);
  } catch (e) {
    return str
  }
  return finalString
}

export default RestToCurl;
