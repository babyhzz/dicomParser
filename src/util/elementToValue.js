import { isStringVr, punctuateTag } from "./util";
import createJPEGBasicOffsetTable from "./createJPEGBasicOffsetTable";
import readEncapsulatedImageFrame from "../readEncapsulatedImageFrame";
import sharedCopy from "../sharedCopy";

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
  const vr = element.vr;
  const tag = element.tag;

  function multiElementToArray(numItems, func) {
    if (numItems === 1) {
      return func.call(dataSet, tag, 0);
    }

    const value = [];
    for (var i = 0; i < numItems; i++) {
      value.push(func.call(dataSet, tag, i));
    }

    return value;
  }

  if (element.tag === "x7fe00010") {
    if (element.encapsulatedPixelData) {
      const numFrames = dataSet.intString("x00280008") || 1;
      const basicOffsetTable = createJPEGBasicOffsetTable(dataSet, element);
      const value = [];
      for (let frame = 0; frame < numFrames; frame++) {
        value.push(
          readEncapsulatedImageFrame(dataSet, element, frame, basicOffsetTable)
        );
      }
      return value;
    } else {
      return sharedCopy(dataSet.byteArray, element.dataOffset, element.length);
    }
  } else if (vr === "AT") {
    return punctuateTag(dataSet.attributeTag(tag));
  } else if (vr === "US") {
    return multiElementToArray(element.length / 2, dataSet.uint16);
  } else if (vr === "SS") {
    return multiElementToArray(element.length / 2, dataSet.int16);
  } else if (vr === "UL") {
    return multiElementToArray(element.length / 4, dataSet.uint32);
  } else if (vr === "SL") {
    return multiElementToArray(element.length / 4, dataSet.int32);
  } else if (vr === "FD") {
    return multiElementToArray(element.length / 8, dataSet.double);
  } else if (vr === "FL") {
    return multiElementToArray(element.length / 4, dataSet.float);
  } else if (vr === "DS") {
    return multiElementToArray(
      dataSet.numStringValues(element.tag),
      dataSet.floatString
    );
  } else if (vr === "IS") {
    return multiElementToArray(
      dataSet.numStringValues(element.tag),
      dataSet.intString
    );
  } else if (isStringVr(vr) === true) {
    return dataSet.string(tag);
  } else if (
    vr === "OB" ||
    vr === "OW" ||
    vr === "OF" ||
    vr === "OD" ||
    vr === "OL" ||
    vr === "OV"
  ) {
    return sharedCopy(dataSet.byteArray, element.dataOffset, element.length);
  }

  return undefined;
}
