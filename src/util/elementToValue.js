import { isStringVr, punctuateTag } from "./util";

export default function elementToValue(dataSet, element, vr) {
  if (dataSet === undefined || element === undefined) {
    throw "dicomParser.elementToValue: missing required parameters";
  }

  if (element.vr === undefined && vr === undefined) {
    throw "dicomParser.elementToValue: cannot convert implicit element to string";
  }

  if (element.vr === undefined) {
    element.vr = vr;
  }

  return explicitElementToValue(dataSet, element);
}

/**
 * Converts an explicit VR element to a string or undefined if it is not possible to convert.
 * Throws an error if an implicit element is supplied
 * @param dataSet
 * @param element
 * @returns {*}
 */
function explicitElementToValue(dataSet, element) {
  if (dataSet === undefined || element === undefined) {
    throw "dicomParser.explicitElementToString: missing required parameters";
  }
  if (element.vr === undefined) {
    throw "dicomParser.explicitElementToString: cannot convert implicit element to string";
  }
  var vr = element.vr;
  var tag = element.tag;

  var textResult;

  function multiElementToArray(numItems, func) {
    const result = [];

    for (var i = 0; i < numItems; i++) {
      result.push(func.call(dataSet, tag, i));
    }

    return result;
  }

  if (element.tag === 'x7fe00010') {
    // Pixel Data special handling: return raw byte array
  } else if (isStringVr(vr) === true) {
    textResult = dataSet.string(tag);
  } else if (vr === "AT") {
    textResult = punctuateTag(dataSet.attributeTag(tag));
  } else if (vr === "US") {
    textResult = multiElementToArray(element.length / 2, dataSet.uint16);
  } else if (vr === "SS") {
    textResult = multiElementToArray(element.length / 2, dataSet.int16);
  } else if (vr === "UL") {
    textResult = multiElementToArray(element.length / 4, dataSet.uint32);
  } else if (vr === "SL") {
    textResult = multiElementToArray(element.length / 4, dataSet.int32);
  } else if (vr === "FD") {
    textResult = multiElementToArray(element.length / 8, dataSet.double);
  } else if (vr === "FL") {
    textResult = multiElementToArray(element.length / 4, dataSet.float);
  } 
  // TODO  
  // else if (
  //   vr === "OB" ||
  //   vr === "OW" ||
  //   vr === "OF" ||
  //   vr === "OD" ||
  //   vr === "OL" ||
  //   vr === "OV"
  // ) {
  //   textResult = "<binary data>";
  // }

  return textResult;
}
