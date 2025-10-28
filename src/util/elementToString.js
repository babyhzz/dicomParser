import { isStringVr, punctuateTag } from "../util";


export default function elementToString(dataSet, element, vr) {
  if (dataSet === undefined || element === undefined) {
    throw "dicomParser.elementToString: missing required parameters";
  }

  if (element.vr === undefined && vr === undefined) {
    throw "dicomParser.elementToString: cannot convert implicit element to string";
  }

  if (element.vr === undefined) {
    element.vr = vr.split("|")[0];
  }

  return explicitElementToString(dataSet, element);
}

/**
 * Converts an explicit VR element to a string or undefined if it is not possible to convert.
 * Throws an error if an implicit element is supplied
 * @param dataSet
 * @param element
 * @returns {*}
 */
function explicitElementToString(dataSet, element) {
  if (dataSet === undefined || element === undefined) {
    throw "dicomParser.explicitElementToString: missing required parameters";
  }
  if (element.vr === undefined) {
    throw "dicomParser.explicitElementToString: cannot convert implicit element to string";
  }
  var vr = element.vr;
  var tag = element.tag;

  var textResult;

  function multiElementToString(numItems, func) {
    var result = "";

    for (var i = 0; i < numItems; i++) {
      if (i !== 0) {
        result += "\\";
      }
      result += func.call(dataSet, tag, i).toString();
    }

    return result;
  }

  if (isStringVr(vr) === true) {
    textResult = dataSet.string(tag);
  } else if (vr === "AT") {
    textResult = punctuateTag(dataSet.attributeTag(tag));
  } else if (vr === "US") {
    textResult = multiElementToString(element.length / 2, dataSet.uint16);
  } else if (vr === "SS") {
    textResult = multiElementToString(element.length / 2, dataSet.int16);
  } else if (vr === "UL") {
    textResult = multiElementToString(element.length / 4, dataSet.uint32);
  } else if (vr === "SL") {
    textResult = multiElementToString(element.length / 4, dataSet.int32);
  } else if (vr === "FD") {
    textResult = multiElementToString(element.length / 8, dataSet.double);
  } else if (vr === "FL") {
    textResult = multiElementToString(element.length / 4, dataSet.float);
  } else if (
    vr === "OB" ||
    vr === "OW" ||
    vr === "OF" ||
    vr === "OD" ||
    vr === "OL" ||
    vr === "OV"
  ) {
    textResult = "<binary data>";
  } else if (vr === "UN") {
    textResult = "<unknown data>";
  }

  return textResult;
}
